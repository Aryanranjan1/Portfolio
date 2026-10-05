import Image from "next/image";
import Link from "next/link";

import {
  getProjectMedia,
  getPublishedProjects,
} from "@/db/queries/projects";

import styles from "../ProjectPage.module.css";

type ProjectMoreProjectsProps = {
  currentSlug: string;
};

export default async function ProjectMoreProjects({
  currentSlug,
}: ProjectMoreProjectsProps) {
  const projects =
    await getPublishedProjects();

  const otherProjects = projects
    .filter(
      (project) =>
        project.slug !== currentSlug,
    )
    .slice(0, 3);

  if (!otherProjects.length) {
    return null;
  }

  const projectsWithMedia =
    await Promise.all(
      otherProjects.map(async (project) => {
        const media =
          await getProjectMedia(project.id);

        const projectImage =
          media.find(
            (item) =>
              item.role === "hero",
          ) ??
          media.find(
            (item) =>
              item.role === "preview",
          );

        return {
          ...project,
          image: projectImage ?? null,
        };
      }),
    );

  return (
    <section
      className={styles.nextProjects}
      id="more-projects"
    >
      <div className={styles.shell}>
        <div className={styles.nextProjectHead}>
          <h2
            className={
              styles.nextProjectTitle
            }
          >
            MORE
            <br />
            PROJECTS.
          </h2>

          <div
            className={styles.technicalLabel}
          >
            {"// CONTINUE EXPLORING"}
            <br />
            {String(
              projectsWithMedia.length,
            ).padStart(2, "0")}{" "}
            SELECTED PROJECTS
          </div>
        </div>

        <div className={styles.projectList}>
          {projectsWithMedia.map(
            (project, index) => {
              const image =
                project.image;

              return (
                <Link
                  key={project.id}
                  href={`/projects/${project.slug}`}
                  className={styles.projectCard}
                >
                  {image?.url ? (
                    <Image
                      src={image.url}
                      alt={
                        image.altTextOverride ||
                        image.altText ||
                        project.title
                      }
                      fill
                      sizes="(max-width: 700px) 100vw, (max-width: 1000px) 50vw, 33vw"
                      className={
                        styles.projectCardImage
                      }
                    />
                  ) : (
                    <div
                      className={
                        styles.projectCardFallback
                      }
                      aria-hidden="true"
                    />
                  )}

                  <div
                    className={
                      styles.projectCardContent
                    }
                  >
                    <div
                      className={
                        styles.projectCardNumber
                      }
                    >
                      {"// "}
                      {String(
                        index + 1,
                      ).padStart(3, "0")}
                    </div>

                    <h3
                      className={
                        styles.projectCardTitle
                      }
                    >
                      {project.title}
                    </h3>
                  </div>
                </Link>
              );
            },
          )}
        </div>
      </div>
    </section>
  );
}