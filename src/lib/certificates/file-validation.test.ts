import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { hasCertificateFileSignature, isCertificateFileSizeAllowed, MAX_CERTIFICATE_IMAGE_BYTES, MAX_CERTIFICATE_PDF_BYTES } from "./file-validation";

describe("certificate upload validation", () => {
  it("accepts signatures for supported raster images and PDF", () => {
    assert.equal(hasCertificateFileSignature("image", Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10])), true);
    assert.equal(hasCertificateFileSignature("image", Uint8Array.from([255, 216, 255])), true);
    assert.equal(hasCertificateFileSignature("image", new TextEncoder().encode("RIFF1234WEBP")), true);
    assert.equal(hasCertificateFileSignature("pdf", new TextEncoder().encode("%PDF-1.4")), true);
  });

  it("rejects mismatched, incomplete, and SVG content", () => {
    assert.equal(hasCertificateFileSignature("image", new TextEncoder().encode("<svg></svg>")), false);
    assert.equal(hasCertificateFileSignature("pdf", new TextEncoder().encode("not a PDF")), false);
    assert.equal(hasCertificateFileSignature("image", new Uint8Array()), false);
  });

  it("enforces the server-side image and PDF byte limits", () => {
    assert.equal(isCertificateFileSizeAllowed("image", MAX_CERTIFICATE_IMAGE_BYTES), true);
    assert.equal(isCertificateFileSizeAllowed("image", MAX_CERTIFICATE_IMAGE_BYTES + 1), false);
    assert.equal(isCertificateFileSizeAllowed("pdf", MAX_CERTIFICATE_PDF_BYTES), true);
    assert.equal(isCertificateFileSizeAllowed("pdf", MAX_CERTIFICATE_PDF_BYTES + 1), false);
    assert.equal(isCertificateFileSizeAllowed("pdf", 0), false);
  });
});
