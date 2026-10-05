/* eslint-disable react/jsx-no-comment-textnodes */
import { getProjectContent, getPublishedProjectCategories } from "@/lib/projects/get-project-content";

import ProjectsPageClient from "@/components/ProjectsPageClient";
import styles from "./ProjectsPage.module.css";
import type { Metadata } from "next";
import { getAbsoluteSiteUrl } from "@/lib/site-origin";
import PublicSiteShell from "@/components/PublicSiteShell";
import { getDefaultSocialImageMetadata } from "@/lib/seo/default-social-image";

export async function generateMetadata(): Promise<Metadata> {
  const [canonical, images] = await Promise.all([getAbsoluteSiteUrl("/projects"), getDefaultSocialImageMetadata()]);
  return { title: "Projects", description: "Selected software projects, product work, and technical case studies.", ...(canonical ? { alternates: { canonical } } : {}), openGraph: { ...(canonical ? { url: canonical } : {}), ...(images ? { images } : {}) } };
}

export default async function ProjectsPage() {
  const [projects, categories] = await Promise.all([
    getProjectContent({ all: true }),
    getPublishedProjectCategories(),
  ]);

  return (
    <PublicSiteShell>
      <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroLabel}>// PROJECTS</div>

          <div className={styles.heroLayout}>
            <div className={styles.heroCopy}>
              <h1 className={`${styles.heroTitle} public-hero-content-enter`}>
                IDEAS
                <br />
                INTO
                <br />
                REALITY.
              </h1>

              <div className={styles.heroRule} />

              <p className={styles.heroDescription}>
                A collection of projects that turn ideas into real products,
                systems, and experiences.
              </p>
            </div>
          </div>

          {/* Top right */}
          <p className={styles.heroMiddleNote}>
            Selected work, experiments, and things built along the way.
          </p>

          {/* Bottom right: decorative text directly above the index */}
          <div className={styles.heroRight}>
            <div className={styles.heroSide}>
              <span>A BIGGER</span>
              <span>TOMORROW</span>

              <span className={styles.decorativeDivider} />

              <span>BUILD</span>
              <span>DESIGN</span>
              <span>DEPLOY</span>
              <span>ITERATE</span>

              <span className={styles.decorativeDivider} />

              <span>SAME</span>
              <span>CURIOSITY.</span>
              <span>BIGGER</span>
              <span>THINGS.</span>

              <span className={styles.decorativeDivider} />
            </div>

            <div className={styles.heroIndex}>// 001</div>
          </div>
        </div>
      </section>

      <ProjectsPageClient projects={projects} categories={categories} />
      </main>
    </PublicSiteShell>
  );
}
