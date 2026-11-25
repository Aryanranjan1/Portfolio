import CertificateEditor from "@/components/admin/CertificateEditor";
import { getAdminCertificates } from "@/lib/convex/queries/admin";

export const dynamic = "force-dynamic";

export default async function NewCertificatePage() {
  const certificates = await getAdminCertificates();
  return <main><CertificateEditor certificate={null} nextSortOrder={certificates.length} /></main>;
}
