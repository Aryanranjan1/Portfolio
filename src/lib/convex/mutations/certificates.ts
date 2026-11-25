import { randomUUID } from "node:crypto";
import { mutateApplication } from "@/lib/convex-server";

export type CertificateStatus = "draft" | "published";
export type CertificateInput = {
  slug: string; title: string; issuer: string; category: string; description: string | null;
  startDate: string | null; endDate: string | null; credentialId: string | null; credentialUrl: string | null;
  skills: string[]; imageUrl: string | null; imageStorageId: string | null; imageWidth: number | null;
  imageHeight: number | null; imageAlt: string | null; pdfUrl: string | null; pdfStorageId: string | null; pdfName: string | null;
  pdfSize: number | null; sortOrder: number; status: CertificateStatus; isSample: boolean;
};
type FileIds = { imageStorageId?: string | null; pdfStorageId?: string | null };

export function createCertificate(data: CertificateInput) {
  return mutateApplication<FileIds & { id: string }>("createCertificate", { legacyId: randomUUID(), data });
}
export function updateCertificate(id: string, data: CertificateInput) {
  return mutateApplication<FileIds & { id: string }>("updateCertificate", { id, data });
}
export function deleteCertificate(id: string) {
  return mutateApplication<FileIds>("deleteCertificate", { id });
}
export function reorderCertificates(ids: string[]) {
  return mutateApplication<boolean>("reorderCertificates", { ids });
}
