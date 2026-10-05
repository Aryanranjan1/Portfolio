import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import { getProjectRedirectSlug, getPublishedProjectPage } from "@/db/queries/projects";

import ProjectActionBar from "./components/ProjectActionBar";
import ProjectHero from "./components/ProjectHero";
import ProjectIntro from "./components/ProjectIntro";
import ProjectMoreProjects from "./components/ProjectMoreProjects";
import ProjectResultCTA from "./components/ProjectResultCTA";
import ProjectSection from "./components/ProjectSection";

import styles from "./ProjectPage.module.css";
import { getCanonicalSiteUrl } from "@/lib/site-origin";
import { getSiteSettings } from "@/db/queries/site";
import { serializeJsonLd } from "@/lib/json-ld";
import ScrollReveal from "@/components/ScrollReveal";
import PublicSiteShell from "@/components/PublicSiteShell";
import { getMediaById } from "@/db/queries/media";
import { getDefaultSocialImageMetadata } from "@/lib/seo/default-social-image";

type ProjectPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

/* -------------------------------------------------------------------------- */
/* METADATA                                                                   */
/* -------------------------------------------------------------------------- */

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;

  const project = await getPublishedProjectPage(slug);

  if (!project) {
    const redirectSlug = await getProjectRedirectSlug(slug);
    if (redirectSlug) permanentRedirect(`/projects/${redirectSlug}`);
    return {};
  }

  const title =
    project.seoTitle?.trim() ||
    `${project.title} — Project`;

  const description =
    project.seoDescription?.trim() ||
    project.shortDescription ||
    project.description;

  const [canonicalValue, selectedSocialImage, fallbackImages] = await Promise.all([
    getCanonicalSiteUrl(`/projects/${project.slug}`, project.canonicalOverride),
    project.socialImageId ? getMediaById(project.socialImageId) : Promise.resolve(null),
    getDefaultSocialImageMetadata(),
  ]);
  const canonical = canonicalValue || undefined;

  const socialTitle =
    project.socialTitle?.trim() || title;

  const socialDescription =
    project.socialDescription?.trim() || description;

  const socialImage = selectedSocialImage ?? (fallbackImages?.[0] ? { ...fallbackImages[0], altText: fallbackImages[0].alt } : undefined);

  return {
    title,
    description,

    alternates: canonical
      ? {
          canonical,
        }
      : undefined,

    robots: {
      index: project.robotsIndex,
      follow: project.robotsFollow,
    },

    openGraph: {
      title: socialTitle,
      description: socialDescription,
      type: "article",
      url: canonical,
      publishedTime: project.publishedAt?.toISOString(),
      modifiedTime: project.updatedAt.toISOString(),

      ...(socialImage?.url
        ? {
            images: [
              {
                url: socialImage.url,
                width: socialImage.width ?? undefined,
                height: socialImage.height ?? undefined,
                alt: (("altTextOverride" in socialImage && typeof socialImage.altTextOverride === "string") ? socialImage.altTextOverride : null) || (typeof socialImage.altText === "string" ? socialImage.altText : "") || project.title,
              },
            ],
          }
        : {}),
    },
  };
}

/* -------------------------------------------------------------------------- */
/* PAGE                                                                       */
/* -------------------------------------------------------------------------- */

export default async function ProjectPage({
  params,
}: ProjectPageProps) {
  const { slug } = await params;

  const project = await getPublishedProjectPage(slug);

  if (!project) {
    const redirectSlug = await getProjectRedirectSlug(slug);
    if (redirectSlug) permanentRedirect(`/projects/${redirectSlug}`);
    notFound();
  }

  const [canonical, settings] = await Promise.all([
    getCanonicalSiteUrl(`/projects/${project.slug}`, project.canonicalOverride),
    getSiteSettings(),
  ]);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.shortDescription,
    ...(canonical ? { url: canonical, mainEntityOfPage: canonical } : {}),
    datePublished: project.publishedAt?.toISOString(),
    dateModified: project.updatedAt.toISOString(),
    keywords: [...project.categories.map((category) => category.name), ...project.technologies.map((technology) => technology.name)],
    ...(settings?.personName ? { author: { "@type": "Person", name: settings.personName } } : {}),
  };

  return (
    <PublicSiteShell>
      <main className={styles.page}>
      <ScrollReveal />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }} />
      {/* ------------------------------------------------------------------ */}
      {/* HERO                                                               */}
      {/* ------------------------------------------------------------------ */}

      <ProjectHero project={project} />

      {/* ------------------------------------------------------------------ */}
      {/* PROJECT LINKS / ACTIONS                                            */}
      {/* ------------------------------------------------------------------ */}

      <div data-scroll-reveal>
        <ProjectActionBar links={project.links} />
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* INTRO + PROJECT OVERVIEW                                           */}
      {/* ------------------------------------------------------------------ */}

      <div data-scroll-reveal>
        <ProjectIntro project={project} />
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* PROJECT CONTENT                                                    */}
      {/* ------------------------------------------------------------------ */}

      <div className={styles.sections}>
        {project.sections.map((section, index) => (
          <ProjectSection
            key={section.id}
            section={section}
            index={index}
            media={project.media}
            technologies={project.technologies}
          />
        ))}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* MORE PROJECTS                                                      */}
      {/* ------------------------------------------------------------------ */}

      <div data-scroll-reveal>
        <ProjectMoreProjects currentSlug={project.slug} />
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* FINAL CTA                                                          */}
      {/* ------------------------------------------------------------------ */}

      <div data-scroll-reveal>
        <ProjectResultCTA />
      </div>
      </main>
    </PublicSiteShell>
  );
}
