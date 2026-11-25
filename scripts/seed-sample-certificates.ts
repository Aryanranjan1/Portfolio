import { config } from "dotenv";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { ConvexHttpClient } from "convex/browser";
import { makeFunctionReference } from "convex/server";

config({ path: ".env" });
config({ path: ".env.local", override: false });

type Certificate = { id: string; imageStorageId?: string | null; pdfStorageId?: string | null };
type Args = { secret: string; operation: string; input: Record<string, unknown> };
const runMutation = makeFunctionReference<"mutation", Args, unknown>("applicationMutations:run");
const runQuery = makeFunctionReference<"query", Args, unknown>("admin:read");

const samples = [
  { slug: "sample-certificate-a", title: "Sample Certificate A", issuer: "Example Issuer", category: "Backend", startDate: "2026-03", endDate: "2026-06", size: [1200, 900] },
  { slug: "sample-certificate-b", title: "Sample Certificate B", issuer: "Fictional Cloud Academy", category: "Cloud", startDate: null, endDate: "2026-02", size: [720, 1024] },
  { slug: "sample-certificate-c", title: "Sample Certificate C", issuer: "Demo Automation Institute", category: "Automation", startDate: null, endDate: null, size: [1000, 1000] },
] as const;

async function main() {
  const deployment = process.env.CONVEX_DEPLOYMENT ?? "";
  const nonProductionTarget = /^(dev|preview|local):/.test(deployment);
  if (!nonProductionTarget || process.env.VERCEL_ENV === "production" || process.env.CERTIFICATE_SAMPLES_ENABLED !== "true") {
    throw new Error("Sample seeding requires a dev, preview, or local Convex deployment with CERTIFICATE_SAMPLES_ENABLED=true; production targets are refused.");
  }
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  const secret = process.env.CONVEX_SERVER_SECRET;
  if (!url || !secret) throw new Error("NEXT_PUBLIC_CONVEX_URL and CONVEX_SERVER_SECRET are required.");
  const client = new ConvexHttpClient(url);
  const call = (operation: string, input: Record<string, unknown> = {}) => client.mutation(runMutation, { secret, operation, input });
  const lookup = async (slug: string) => await client.query(runQuery, { secret, operation: "certificateBySlug", input: { slug } }) as Certificate | null;

  for (const [index, sample] of samples.entries()) {
    const image = await imageFor(sample.title, sample.issuer, sample.size[0], sample.size[1], index);
    const pdf = pdfFor(sample.title, sample.issuer, sample.category);
    const [imageAsset, pdfAsset] = await Promise.all([
      upload(call, image, "image/png"), upload(call, pdf, "application/pdf"),
    ]);
    const existing = await lookup(sample.slug);
    const data = {
      slug: sample.slug, title: sample.title, issuer: sample.issuer, category: sample.category,
      description: "Fictional sample credential created to preview the certificate layout.",
      startDate: sample.startDate, endDate: sample.endDate, credentialId: `SAMPLE-${String.fromCharCode(65 + index)}-0001`,
      credentialUrl: null, skills: ["Sample skill", "Preview data"], imageUrl: imageAsset.url, imageStorageId: imageAsset.storageId,
      imageWidth: imageAsset.width, imageHeight: imageAsset.height, imageAlt: `SAMPLE certificate artwork for ${sample.title}`,
      pdfUrl: pdfAsset.url, pdfStorageId: pdfAsset.storageId, pdfName: `${sample.slug}.pdf`, pdfSize: pdf.byteLength,
      sortOrder: index, status: "published", isSample: true,
    };
    try {
      const previous = existing
        ? await call("updateCertificate", { id: existing.id, data }) as Certificate
        : await call("createCertificate", { legacyId: randomUUID(), data }) as Certificate;
      for (const oldId of [previous.imageStorageId, previous.pdfStorageId]) if (oldId && oldId !== imageAsset.storageId && oldId !== pdfAsset.storageId) await call("deleteStorageFile", { storageId: oldId });
      console.log(`Seeded ${sample.slug}.`);
    } catch (error) {
      await Promise.all([imageAsset.storageId, pdfAsset.storageId].map((storageId) => call("deleteStorageFile", { storageId }).catch(() => null)));
      throw error;
    }
  }
}

async function upload(call: (operation: string, input?: Record<string, unknown>) => Promise<unknown>, bytes: Buffer, mimeType: string) {
  const uploadUrl = await call("generateUploadUrl") as string;
  const response = await fetch(uploadUrl, { method: "POST", headers: { "Content-Type": mimeType }, body: new Blob([Uint8Array.from(bytes)], { type: mimeType }) });
  if (!response.ok) throw new Error("Sample asset upload failed.");
  const body = await response.json() as { storageId?: string };
  if (!body.storageId) throw new Error("Storage did not return an asset id.");
  await call("trackCertificateUpload", { storageId: body.storageId });
  const url = await call("certificateStorageUrl", { storageId: body.storageId }) as string;
  const dimensions = mimeType === "image/png" ? await sharp(bytes).metadata() : undefined;
  return { storageId: body.storageId, url, width: dimensions?.width, height: dimensions?.height };
}

async function imageFor(title: string, issuer: string, width: number, height: number, index: number) {
  const safe = (value: string) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="#f4f1e8"/><rect x="${width * .035}" y="${height * .04}" width="${width * .93}" height="${height * .92}" fill="none" stroke="#111" stroke-width="${Math.max(4, width * .008)}"/><rect x="${width * .06}" y="${height * .065}" width="${width * .88}" height="${height * .87}" fill="none" stroke="#777" stroke-width="2"/><text x="50%" y="${height * .24}" text-anchor="middle" font-family="serif" font-size="${Math.min(width, height) * .065}" letter-spacing="5" fill="#111">SAMPLE</text><text x="50%" y="${height * .43}" text-anchor="middle" font-family="serif" font-size="${Math.min(width, height) * .045}" fill="#555">CERTIFICATE ${String(index + 1).padStart(2, "0")}</text><text x="50%" y="${height * .58}" text-anchor="middle" font-family="serif" font-size="${Math.min(width, height) * .04}" fill="#111">${safe(title)}</text><text x="50%" y="${height * .68}" text-anchor="middle" font-family="serif" font-size="${Math.min(width, height) * .027}" fill="#555">${safe(issuer)}</text><circle cx="50%" cy="${height * .82}" r="${Math.min(width, height) * .055}" fill="none" stroke="#111" stroke-width="3"/><text x="50%" y="${height * .9}" text-anchor="middle" font-family="sans-serif" font-size="${Math.min(width, height) * .018}" letter-spacing="4" fill="#333">FICTIONAL PREVIEW ART</text></svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

function pdfFor(title: string, issuer: string, category: string) {
  const escape = (value: string) => value.replaceAll("\\", "\\\\").replaceAll("(", "\\(").replaceAll(")", "\\)").replace(/[^\x20-\x7e]/g, " ");
  const lines = ["SAMPLE - FICTIONAL PREVIEW", title, `Issued by ${issuer}`, `Category: ${category}`, "Not a real credential"];
  const commands = ["BT", "/F1 28 Tf", "72 700 Td", `(${escape(lines[0])}) Tj`, "/F1 19 Tf", "0 -70 Td", `(${escape(lines[1])}) Tj`, "/F1 13 Tf", "0 -42 Td", `(${escape(lines[2])}) Tj`, "0 -25 Td", `(${escape(lines[3])}) Tj`, "0 -40 Td", `(${escape(lines[4])}) Tj`, "ET"].join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${Buffer.byteLength(commands)} >>\nstream\n${commands}\nendstream`,
  ];
  let document = "%PDF-1.4\n%SAMPLE\n";
  const offsets = [0];
  for (const [index, object] of objects.entries()) { offsets.push(Buffer.byteLength(document)); document += `${index + 1} 0 obj\n${object}\nendobj\n`; }
  const xref = Buffer.byteLength(document);
  document += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.slice(1).map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`).join("")}trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(document, "ascii");
}

main().catch((error) => { console.error(error instanceof Error ? error.message : "Sample seeding failed."); process.exitCode = 1; });
