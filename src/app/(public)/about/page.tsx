import { getAboutContent } from "@/lib/about/get-about-content";
import About from "@/sections/aboutpage";
import BlogSection from "@/sections/BlogSection";
import type { Metadata } from "next";
import { getSiteSettings } from "@/db/queries/site";
import ProjectsSection from "@/sections/ProjectSection";
import { getAbsoluteSiteUrl } from "@/lib/site-origin";
import PublicSiteShell from "@/components/PublicSiteShell";
import { getDefaultSocialImageMetadata } from "@/lib/seo/default-social-image";
import ResumeSection from "@/sections/ResumeSection";
import { getAboutTechnologies } from "@/db/queries/site";

export async function generateMetadata(): Promise<Metadata> {
  const [settings, canonical, images] = await Promise.all([getSiteSettings(), getAbsoluteSiteUrl("/about"), getDefaultSocialImageMetadata()]);
  return {
    title: `About${settings?.personName ? ` ${settings.personName}` : ""}`,
    description: settings?.shortDescription ?? "Learn more about the person behind this portfolio.",
    ...(canonical ? { alternates: { canonical } } : {}),
    openGraph: { ...(canonical ? { url: canonical } : {}), ...(images ? { images } : {}) },
  };
}

export default async function AboutPage() {
  const [content, technologies] = await Promise.all([getAboutContent(), getAboutTechnologies()]);

  return (
    <PublicSiteShell>
      <main>
    <About content={content} technologies={technologies}>
<ProjectsSection theme="dark" />
      <ResumeSection eyebrow="04 — The Path" heading="There is no straight line behind the work." copy="Curiosity turns into experiments, experiments become projects, and projects become another reason to keep learning." sectionId="about-path" />
      <BlogSection />
    </About>
      </main>
    </PublicSiteShell>
  );
}
