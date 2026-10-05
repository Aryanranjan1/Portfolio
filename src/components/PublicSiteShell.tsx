import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { getSiteSettings } from "@/db/queries/site";
import { getPublicResumeUrl } from "@/lib/resume/get-resume";

export default async function PublicSiteShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, resumeUrl] = await Promise.all([getSiteSettings(), getPublicResumeUrl()]);

  return (
    <>
      <Navbar personName={settings?.personName ?? ""} resumeUrl={resumeUrl} />
      {children}
      <Footer />
    </>
  );
}
