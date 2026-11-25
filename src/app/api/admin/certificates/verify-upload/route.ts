import "server-only";
import { NextResponse } from "next/server";
import sharp from "sharp";
import { auth } from "@/auth";
import { mutateApplication } from "@/lib/convex-server";
import { hasCertificateFileSignature, isCertificateFileSizeAllowed, MAX_CERTIFICATE_IMAGE_BYTES, MAX_CERTIFICATE_PDF_BYTES } from "@/lib/certificates/file-validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await auth();
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!adminEmail || session?.user?.email?.trim().toLowerCase() !== adminEmail) return error("UNAUTHORIZED", 401);
  let input: unknown;
  try { input = await request.json(); } catch { return error("INVALID_REQUEST", 400); }
  const value = input as { storageId?: unknown; kind?: unknown };
  if (typeof value?.storageId !== "string" || !value.storageId || !["image", "pdf"].includes(String(value.kind))) return error("INVALID_REQUEST", 400);
  const kind = value.kind as "image" | "pdf";
  const temporaryId = value.storageId;
  try {
    const sourceUrl = await mutateApplication<string>("certificateStorageUrl", { storageId: temporaryId });
    const response = await fetch(sourceUrl, { cache: "no-store" });
    if (!response.ok) throw new Error("STORAGE_READ_FAILED");
    const limit = kind === "image" ? MAX_CERTIFICATE_IMAGE_BYTES : MAX_CERTIFICATE_PDF_BYTES;
    const declaredSize = Number(response.headers.get("content-length"));
    if (Number.isFinite(declaredSize) && declaredSize > limit) {
      await remove(temporaryId);
      return error("FILE_TOO_LARGE", 413);
    }
    const bytes = await readLimited(response, limit);
    if (!isCertificateFileSizeAllowed(kind, bytes.byteLength) || !hasCertificateFileSignature(kind, bytes)) {
      await remove(temporaryId);
      return error("INVALID_FILE_SIGNATURE", 415);
    }
    if (kind === "pdf") {
      const url = await mutateApplication<string>("certificateStorageUrl", { storageId: temporaryId });
      await mutateApplication("trackCertificateUpload", { storageId: temporaryId });
      return NextResponse.json({ storageId: temporaryId, url, size: bytes.byteLength, mimeType: "application/pdf" }, { headers: { "Cache-Control": "no-store" } });
    }
    const optimized = await sharp(Buffer.from(bytes), { limitInputPixels: 40_000_000 })
      .rotate().resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 }).toBuffer({ resolveWithObject: true });
    const uploadUrl = await mutateApplication<string>("generateUploadUrl");
    const uploaded = await fetch(uploadUrl, { method: "POST", headers: { "Content-Type": "image/webp" }, body: optimized.data });
    if (!uploaded.ok) throw new Error("STORAGE_UPLOAD_FAILED");
    const result = await uploaded.json() as { storageId?: unknown };
    if (typeof result.storageId !== "string") throw new Error("STORAGE_UPLOAD_FAILED");
    const finalId = result.storageId;
    const finalUrl = await mutateApplication<string>("certificateStorageUrl", { storageId: finalId });
    await mutateApplication("trackCertificateUpload", { storageId: finalId });
    await remove(temporaryId);
    return NextResponse.json({ storageId: finalId, url: finalUrl, size: optimized.data.byteLength, width: optimized.info.width, height: optimized.info.height, mimeType: "image/webp" }, { headers: { "Cache-Control": "no-store" } });
  } catch (cause) {
    await remove(temporaryId);
    return error(cause instanceof Error && cause.message === "FILE_TOO_LARGE" ? "FILE_TOO_LARGE" : "UPLOAD_VALIDATION_FAILED", 422);
  }
}

async function remove(storageId: string) {
  try { await mutateApplication("deleteStorageFile", { storageId }); } catch { /* The cleanup cron retries tracked certificate uploads. */ }
}

async function readLimited(response: Response, max: number) {
  if (!response.body) throw new Error("STORAGE_READ_FAILED");
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > max) { await reader.cancel(); throw new Error("FILE_TOO_LARGE"); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return bytes;
}

function error(message: string, status: number) {
  return NextResponse.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}
