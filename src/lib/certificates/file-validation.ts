export const MAX_CERTIFICATE_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_CERTIFICATE_PDF_BYTES = 10 * 1024 * 1024;

export function isCertificateFileSizeAllowed(kind: "image" | "pdf", size: number) {
  return Number.isSafeInteger(size) && size > 0 && size <= (kind === "image" ? MAX_CERTIFICATE_IMAGE_BYTES : MAX_CERTIFICATE_PDF_BYTES);
}

export function hasCertificateFileSignature(kind: "image" | "pdf", bytes: Uint8Array) {
  if (kind === "pdf") return bytes.length >= 8 && new TextDecoder().decode(bytes.slice(0, 5)) === "%PDF-";
  const png = bytes.length >= 8 && [137, 80, 78, 71, 13, 10, 26, 10].every((byte, index) => bytes[index] === byte);
  const jpeg = bytes.length >= 3 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  const webp = bytes.length >= 12 && new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF" && new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP";
  return png || jpeg || webp;
}
