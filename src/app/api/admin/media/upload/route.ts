import "server-only";
import { logServerError } from "@/lib/observability/log";

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createMedia } from "@/db/mutations/media";
import { extractMediaDimensions } from "@/lib/media/extract-dimensions";

export const runtime = "nodejs";

const MIME_EXTENSIONS: Record<string, string[]> = {
  "image/jpeg": ["jpg", "jpeg"],
  "image/png": ["png"],
  "image/webp": ["webp"],
  "image/avif": ["avif"],
  "image/gif": ["gif"],
  "video/mp4": ["mp4"],
  "video/webm": ["webm"],
  "video/quicktime": ["mov"],
  "application/pdf": ["pdf"],
};

const CATEGORY_LIMITS: Record<string, number> = {
  images: 10 * 1024 * 1024,
  videos: 50 * 1024 * 1024,
  documents: 20 * 1024 * 1024,
  resume: 10 * 1024 * 1024,
  other: 10 * 1024 * 1024,
};

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  const session = await auth();
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!adminEmail || session?.user?.email?.trim().toLowerCase() !== adminEmail) {
    return jsonError("UNAUTHORIZED", 401);
  }

  const baseUrl = process.env.SUPABASE_URL?.trim().replace(/\/+$/, "");
  const secret = process.env.SUPABASE_SECRET_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET?.trim() || "portfolio-media";
  if (!baseUrl || !secret) return jsonError("STORAGE_NOT_CONFIGURED", 503);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return jsonError("INVALID_FORM_DATA", 400);
  }

  const file = form.get("file");
  const category = form.get("category");
  const altText = form.get("altText");
  if (!(file instanceof File) || file.size === 0) return jsonError("FILE_REQUIRED", 400);
  if (typeof category !== "string" || !Object.hasOwn(CATEGORY_LIMITS, category)) return jsonError("INVALID_CATEGORY", 400);
  if (file.size > CATEGORY_LIMITS[category]) return jsonError("FILE_TOO_LARGE", 413);

  const originalName = file.name.split(/[\\/]/).pop()?.trim() ?? "";
  const extension = originalName.includes(".") ? originalName.split(".").pop()!.toLowerCase() : "";
  const mimeType = file.type.toLowerCase();
    if (!originalName || originalName.length > 255 || !MIME_EXTENSIONS[mimeType]?.includes(extension) || mimeType === "image/svg+xml") {
    return jsonError("UNSUPPORTED_FILE_TYPE", 415);
  }
  if (!categoryMatches(category, mimeType)) return jsonError("CATEGORY_MISMATCH", 400);
  if (typeof altText !== "string" || altText.trim().length > 1000) return jsonError("INVALID_ALT_TEXT", 400);

  let bytes: Uint8Array;
  try { bytes = new Uint8Array(await file.arrayBuffer()); }
  catch { return jsonError("FILE_READ_FAILED", 400); }
  if (!matchesFileSignature(mimeType, bytes)) return jsonError("FILE_CONTENT_MISMATCH", 415);
  const dimensions = await extractMediaDimensions(bytes, mimeType);

  const storageKey = `${category}/${crypto.randomUUID()}.${extension}`;
  const encodedKey = storageKey.split("/").map(encodeURIComponent).join("/");
  const storageUrl = `${baseUrl}/storage/v1/object/${encodeURIComponent(bucket)}/${encodedKey}`;
  const headers = { apikey: secret, Authorization: `Bearer ${secret}` };
  let uploaded: Response;
  try {
    uploaded = await fetch(storageUrl, {
      method: "POST",
      headers: { ...headers, "Content-Type": mimeType, "x-upsert": "false" },
      body: Buffer.from(bytes),
    });
  } catch (error) {
    logServerError("media_storage_upload_transport_failed", error);
    return jsonError("STORAGE_UPLOAD_FAILED", 502);
  }
  if (!uploaded.ok) {
    logServerError("media_storage_upload_failed", new Error("STORAGE_UPLOAD_FAILED"), { httpStatus: uploaded.status, storageObjectKey: storageKey });
    return jsonError("STORAGE_UPLOAD_FAILED", 502);
  }

  const url = `${baseUrl}/storage/v1/object/public/${encodeURIComponent(bucket)}/${encodedKey}`;
  try {
    const media = await createMedia({
      storageKey,
      url,
      filename: originalName,
      mimeType,
      fileSizeBytes: file.size,
      width: dimensions.width,
      height: dimensions.height,
      altText: altText.trim() || null,
    });
    return NextResponse.json({ success: true, media: { id: media.id, url: media.url, filename: media.filename, mimeType: media.mimeType, fileSizeBytes: media.fileSizeBytes, width: media.width, height: media.height } });
  } catch (error) {
    let cleanupFailure: { status?: number; error?: string } | null = null;
    try {
      const cleanup = await fetch(storageUrl, { method: "DELETE", headers });
      if (!cleanup.ok) cleanupFailure = { status: cleanup.status };
    } catch (cleanupError) {
      cleanupFailure = { error: cleanupError instanceof Error ? cleanupError.name : "unknown" };
    }
    logServerError("media_metadata_create_failed", error, {
      cleanupStatus: cleanupFailure?.status,
      cleanupFailed: Boolean(cleanupFailure),
      ...(cleanupFailure ? { storageObjectKey: storageKey } : {}),
    });
    return jsonError("MEDIA_RECORD_FAILED", 500);
  }
}

function categoryMatches(category: string, mimeType: string) {
  if (category === "images") return mimeType.startsWith("image/");
  if (category === "videos") return mimeType.startsWith("video/");
  if (category === "documents" || category === "resume") return mimeType === "application/pdf";
  return mimeType in MIME_EXTENSIONS;
}

function matchesFileSignature(mimeType: string, bytes: Uint8Array) {
  const ascii = (start: number, length: number) => String.fromCharCode(...bytes.slice(start, start + length));
  if (mimeType === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (mimeType === "image/png") return ascii(0, 8) === "\x89PNG\r\n\x1a\n";
  if (mimeType === "image/gif") return ascii(0, 6) === "GIF87a" || ascii(0, 6) === "GIF89a";
  if (mimeType === "image/webp") return ascii(0, 4) === "RIFF" && ascii(8, 4) === "WEBP";
  if (mimeType === "image/avif") return ascii(4, 4) === "ftyp" && /avif|avis/.test(ascii(8, 24));
  if (mimeType === "application/pdf") return ascii(0, 5) === "%PDF-";
  if (mimeType === "video/webm") return bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3;
  if (mimeType === "video/mp4" || mimeType === "video/quicktime") return ascii(4, 4) === "ftyp";
  return false;
}
