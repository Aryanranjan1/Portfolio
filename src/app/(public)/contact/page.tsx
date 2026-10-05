import ContactPage from "@/sections/ContactPage";
import { getContactContent } from "@/lib/contact/get-contact-content";
import type { Metadata } from "next";
import { getAbsoluteSiteUrl } from "@/lib/site-origin";
import PublicSiteShell from "@/components/PublicSiteShell";
import { getDefaultSocialImageMetadata } from "@/lib/seo/default-social-image";

export async function generateMetadata(): Promise<Metadata> {
  const [canonical, images] = await Promise.all([getAbsoluteSiteUrl("/contact"), getDefaultSocialImageMetadata()]);
  return { title: "Contact", description: "Get in touch about projects, opportunities, or technical conversations.", ...(canonical ? { alternates: { canonical } } : {}), openGraph: { ...(canonical ? { url: canonical } : {}), ...(images ? { images } : {}) } };
}

export default async function Contact() {
  const content = await getContactContent();
  return (
    <PublicSiteShell>
      <ContactPage {...content} />
    </PublicSiteShell>
  );
}
