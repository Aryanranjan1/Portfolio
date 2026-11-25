import { getAdminCertificates } from "@/lib/convex/queries/admin";
import CertificatesManager from "@/components/admin/CertificatesManager";

export const dynamic = "force-dynamic";

export default async function CertificatesPage() {
  const certificates = await getAdminCertificates();
  return <main><CertificatesManager certificates={certificates} /></main>;
}
