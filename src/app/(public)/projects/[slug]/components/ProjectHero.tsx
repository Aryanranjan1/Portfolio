/* eslint-disable react/jsx-no-comment-textnodes */

import Image from "next/image";

import type { getPublishedProjectPage } from "@/db/queries/projects";

import styles from "../ProjectPage.module.css";

type Project = NonNullable<
  Awaited<ReturnType<typeof getPublishedProjectPage>>
>;

type ProjectHeroProps = {
  project: Project;
};

export default function ProjectHero({
  project,
}: ProjectHeroProps) {
  const heroMedia = project.media.find(
    (media) => media.role === "hero",
  );

  return (
    <section className={styles.hero}>
      {heroMedia?.url ? (
        <Image
          className={`${styles.heroMedia} public-hero-media-enter`}
          src={heroMedia.url}
          alt={
            heroMedia.altTextOverride ||
            heroMedia.altText ||
            project.title
          }
          width={heroMedia.width ?? 2200}
          height={heroMedia.height ?? 1200}
          loading="eager"
          fetchPriority="high"
          sizes="100vw"
        />
      ) : null}

      <div
        className={styles.heroOverlay}
        aria-hidden="true"
      />

      <div
        className={styles.heroNoise}
        aria-hidden="true"
      />

      <div className={`${styles.shell} ${styles.heroInner}`}>
        {/* TOP TECHNICAL ROW */}

        <div className={styles.heroTop}>
          <div
            className={`${styles.technicalLabel} ${styles.heroIndex}`}
          >
            {"// PROJECT / 001"}
          </div>

          <div
            className={`${styles.technicalLabel} ${styles.heroClassification}`}
          >
            CASE STUDY
            <br />
            {project.projectType ||
              "PRODUCT ENGINEERING"}
            <br />
            {project.year ?? "—"}
          </div>
        </div>

        {/* MAIN HERO */}

        <div className={styles.heroMain}>
          <div className={styles.heroCopy}>
            <p
              className={`${styles.technicalLabel} ${styles.heroKicker}`}
            >
              //{" "}
              {project.projectType ||
                "PROJECT"}
            </p>

            <h1 className={`${styles.heroTitle} public-hero-content-enter`}>
              {project.title}
            </h1>

            <div className={styles.heroRule} />

            <p className={styles.heroDescription}>
              {project.shortDescription}
            </p>
          </div>

          <aside className={styles.heroSideNote}>
            BUILD
            <br />
            DESIGN
            <br />
            DEPLOY
            <br />
            ITERATE
            <br />
            <br />
            SAME CURIOSITY.
            <br />
            BIGGER SYSTEMS.
          </aside>
        </div>

        {/* BOTTOM METADATA */}

        <div className={styles.heroBottom}>
          <div className={styles.heroMeta}>
            <span
              className={styles.heroMetaLabel}
            >
              {"// YEAR"}
            </span>

            <span
              className={styles.heroMetaValue}
            >
              {project.year ?? "—"}
            </span>
          </div>

          <div className={styles.heroMeta}>
            <span
              className={styles.heroMetaLabel}
            >
              {"// LOCATION"}
            </span>

            <span
              className={styles.heroMetaValue}
            >
              {project.location || "—"}
            </span>
          </div>

          <div className={styles.heroMeta}>
            <span
              className={styles.heroMetaLabel}
            >
              {"// STATUS"}
            </span>

            <span
              className={styles.heroMetaValue}
            >
              {project.status}
            </span>
          </div>

          <div className={styles.heroMeta}>
            <span
              className={styles.heroMetaLabel}
            >
              {"// TYPE"}
            </span>

            <span
              className={styles.heroMetaValue}
            >
              {project.projectType || "—"}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
