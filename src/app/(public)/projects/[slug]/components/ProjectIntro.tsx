/* eslint-disable react/jsx-no-comment-textnodes */
import type { getPublishedProjectPage } from "@/db/queries/projects";

import styles from "../ProjectPage.module.css";

type Project = NonNullable<
  Awaited<ReturnType<typeof getPublishedProjectPage>>
>;

type ProjectIntroProps = {
  project: Project;
};

export default function ProjectIntro({
  project,
}: ProjectIntroProps) {
  return (
    <section className={styles.introSection}>
      <div className={styles.shell}>
        <div className={styles.editorialGrid}>
          <aside className={styles.rail} data-scroll-reveal>
            <div className={styles.railTitle}>
              // PROJECT OVERVIEW
            </div>
          </aside>

          <div className={styles.mainColumn} data-scroll-reveal>
            <div className={styles.technicalLabel}>
              // 003 / OVERVIEW
            </div>

            <h2 className={styles.sectionHeading}>
              {project.title}
              <br />
              IN CONTEXT.
            </h2>

            <p className={styles.introLead}>
              {project.description}
            </p>

            {project.categories.length > 0 && (
              <div className={styles.introMetaGroup}>
                <div className={styles.technicalLabel}>
                  // CATEGORIES
                </div>

                <div className={styles.tagList}>
                  {project.categories.map((category) => (
                    <span
                      key={category.id}
                      className={styles.tag}
                    >
                      {category.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {project.technologies.length > 0 && (
              <div className={styles.introMetaGroup}>
                <div className={styles.technicalLabel}>
                  // TECHNOLOGIES
                </div>

                <div className={styles.technologyList}>
                  {project.technologies.map((technology) => (
                    <span
                      key={technology.id}
                      className={styles.technologyItem}
                    >
                      {technology.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {project.sections.length > 0 && (
              <nav
                className={styles.tableOfContents}
                aria-label="Project sections"
              >
                <div className={styles.technicalLabel}>
                  // CONTENT INDEX
                </div>

                <div className={styles.tocList}>
                  {project.sections.map((section, index) => {
                    const anchor =
                      section.anchor?.trim() ||
                      `${section.type}-${section.id}`;

                    return (
                      <a
                        key={section.id}
                        href={`#${anchor}`}
                        className={styles.tocItem}
                      >
                        <span>
                          {String(index + 1).padStart(2, "0")}
                        </span>

                        <span>
                          {section.title ||
                            formatSectionTitle(
                              section.type,
                            )}
                        </span>
                      </a>
                    );
                  })}
                </div>
              </nav>
            )}
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
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
}
