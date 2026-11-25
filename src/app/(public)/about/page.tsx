import { getAboutContent } from "@/lib/about/get-about-content";
import About from "@/sections/aboutpage";
import BlogSection from "@/sections/BlogSection";
import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/convex/queries/site";
import ProjectsSection from "@/sections/ProjectSection";
import { getAbsoluteSiteUrl } from "@/lib/site-origin";
import PublicSiteShell from "@/components/PublicSiteShell";
import { getDefaultSocialImageMetadata } from "@/lib/seo/default-social-image";
import ResumeSection from "@/sections/ResumeSection";
import { getAboutTechnologies } from "@/lib/convex/queries/site";
import { serializeJsonLd } from "@/lib/json-ld";

export async function generateMetadata(): Promise<Metadata> {
  const [settings, canonical, images] = await Promise.all([getSiteSettings(), getAbsoluteSiteUrl("/about"), getDefaultSocialImageMetadata()]);
  const title = `About${settings?.personName ? ` ${settings.personName}` : ""}`;
  const description = settings?.shortDescription ?? "Learn more about the person behind this portfolio.";
  return {
    title,
    description,
    ...(canonical ? { alternates: { canonical } } : {}),
    openGraph: { type: "profile", title, description, ...(settings?.siteName ? { siteName: settings.siteName } : {}), ...(canonical ? { url: canonical } : {}), ...(images ? { images } : {}) },
    twitter: { card: images ? "summary_large_image" : "summary", title, description, ...(images ? { images: images.map((image) => image.url) } : {}) },
  };
}

export default async function AboutPage() {
  const [content, technologies, settings, canonical] = await Promise.all([getAboutContent(), getAboutTechnologies(), getSiteSettings(), getAbsoluteSiteUrl("/about")]);
  const certificates = content.certificates;
  const certificateCredentials = certificates.map((item) => ({
    "@type": "EducationalOccupationalCredential", name: item.title,
    ...(item.description ? { description: item.description } : {}),
    ...(item.credentialUrl ? { url: item.credentialUrl } : {}),
    credentialCategory: item.category,
    recognizedBy: { "@type": "Organization", name: item.issuer },
  }));
  const aboutUrl = canonical?.toString();
  const structuredData = certificates.length ? {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Person", name: settings?.personName ?? content.profile.personName, ...(aboutUrl ? { url: aboutUrl } : {}), hasCredential: certificateCredentials },
      { "@type": "ItemList", name: "Certifications", itemListElement: certificates.map((item, index) => ({ "@type": "ListItem", position: index + 1, item: { "@type": "EducationalOccupationalCredential", name: item.title, ...(aboutUrl ? { url: `${aboutUrl}#certifications` } : {}), credentialCategory: item.category, recognizedBy: { "@type": "Organization", name: item.issuer } } })) },
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: canonical ? new URL("/", canonical).toString() : undefined },
        { "@type": "ListItem", position: 2, name: "About", item: aboutUrl },
        { "@type": "ListItem", position: 3, name: "Certifications", item: aboutUrl ? `${aboutUrl}#certifications` : undefined },
      ].map((crumb) => Object.fromEntries(Object.entries(crumb).filter(([, value]) => value !== undefined))) },
    ],
  } : null;

  return (
    <PublicSiteShell>
      <main>
    {structuredData && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }} />}
    <About content={content} technologies={technologies}>
<ProjectsSection theme="dark" />
      <ResumeSection eyebrow="04 — The Path" heading="There is no straight line behind the work." copy="Curiosity turns into experiments, experiments become projects, and projects become another reason to keep learning." sectionId="about-path" />
      <BlogSection />
    </About>
      </main>
    </PublicSiteShell>
  );
}
