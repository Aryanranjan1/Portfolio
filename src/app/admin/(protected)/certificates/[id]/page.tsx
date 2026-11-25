import { notFound } from "next/navigation";
import CertificateEditor from "@/components/admin/CertificateEditor";
import { getAdminCertificate } from "@/lib/convex/queries/admin";

export const dynamic = "force-dynamic";

export default async function EditCertificatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const certificate = await getAdminCertificate(id);
  if (!certificate) notFound();
  return <main><CertificateEditor certificate={certificate} nextSortOrder={certificate.sortOrder} /></main>;
}
