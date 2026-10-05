/* eslint-disable react/jsx-no-comment-textnodes */
import type { getPublishedProjectPage } from "@/db/queries/projects";

import styles from "../ProjectPage.module.css";
import ProjectBlockRenderer from "./ProjectBlockRenderer";

type Project = NonNullable<
  Awaited<ReturnType<typeof getPublishedProjectPage>>
>;

type Section = Project["sections"][number];

type ProjectSectionProps = {
  section: Section;
  index: number;
  media: Project["media"];
  technologies: Project["technologies"];
};

export default function ProjectSection({
  section,
  index,
  media,
  technologies,
}: ProjectSectionProps) {
  const anchor =
    section.anchor?.trim() ||
    `${section.type}-${section.id}`;

  const isLight =
    section.type === "solution" ||
    section.type === "gallery" ||
    section.type === "whats_next";

  return (
    <section
      id={anchor}
      className={`${styles.contentSection} ${
        isLight ? styles.lightSection : ""
      }`}
    >
      <div className={styles.shell}>
        <div className={styles.sectionHead} data-scroll-reveal>
          <span className={styles.sectionNumber}>
            // {String(index + 4).padStart(3, "0")} / SECTION
          </span>

          <span className={styles.sectionKind}>
            {formatSectionTitle(section.type)}
          </span>
        </div>

        <div className={styles.sectionBody}>
          {section.title && (
            <div className={styles.sectionTitleBlock} data-scroll-reveal>
              <h2 className={styles.sectionTitle}>
                {section.title}
              </h2>
            </div>
          )}

          <div className={styles.blocks}>
            {section.blocks.map((block) => (
              <div key={block.id} data-scroll-reveal>
              <ProjectBlockRenderer
                block={block}
                media={media}
                technologies={technologies}
              />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function formatSectionTitle(
  type: string,
): string {
  return type
    .replaceAll("_", " ")
    .toUpperCase();
}
