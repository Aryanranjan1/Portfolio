import Hero from "@/sections/hero";
import IntroSection from "@/sections/intro";
import  ProjectsSection  from "@/sections/ProjectSection";
import About from "@/sections/about";
import BlogSection from "@/sections/BlogSection";
import type { Metadata } from "next";
import { getAboutContent } from "@/lib/about/get-about-content";
import { getSiteSettings } from "@/db/queries/site";
import { getAbsoluteSiteUrl } from "@/lib/site-origin";
import PublicSiteShell from "@/components/PublicSiteShell";
import { getDefaultSocialImageMetadata } from "@/lib/seo/default-social-image";
import { getAboutTechnologies } from "@/db/queries/site";
import ResumeSection from "@/sections/ResumeSection";

export async function generateMetadata(): Promise<Metadata> {
  const [settings, canonical, images] = await Promise.all([getSiteSettings(), getAbsoluteSiteUrl("/"), getDefaultSocialImageMetadata()]);
  return {
    title: "Home",
    description: settings?.siteDescription ?? "Personal portfolio and selected work.",
    ...(canonical ? { alternates: { canonical } } : {}),
    openGraph: { ...(canonical ? { url: canonical } : {}), ...(images ? { images } : {}) },
  };
}

export default async function Home() {
  const [content, technologies] = await Promise.all([getAboutContent(), getAboutTechnologies()]);
  return (
    <PublicSiteShell>
      <main>
      <Hero location={content.profile.location} year={content.year} />
      <IntroSection profile={content.profile} year={content.year} />
      <ProjectsSection />
      <About content={content} technologies={technologies} />
      <ResumeSection heading="The work is the record." copy="Projects, experiments, decisions, and everything learned along the way leave a clearer trail than any list of titles ever could." />
      <BlogSection />
      </main>
    </PublicSiteShell>
  );
}
