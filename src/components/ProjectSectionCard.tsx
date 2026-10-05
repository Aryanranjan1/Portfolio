import Image from "next/image";
import Link from "next/link";

import type { ProjectContent } from "@/lib/projects/get-project-content";

import styles from "./ProjectSectionCard.module.css";

type ProjectSectionCardProps = {
  project: ProjectContent;
  number: string;
};

export function ProjectSectionCard({
  project,
  number,
}: ProjectSectionCardProps) {
  return (
    <Link
      href={project.href}
      className={styles.card}
      aria-label={`View ${project.title}`}
    >
      <div className={styles.thumb}>
        {project.image ? (
          <Image
            src={project.image.src}
            alt={project.image.alt}
            fill
            sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 25vw"
            className={styles.image}
          />
        ) : (
          <div className={styles.imageFallback} aria-hidden="true" />
        )}
      </div>

      <div className={styles.body}>
        <div className={styles.titleRow}>
          <h3 className={styles.title}>
            {project.title}
          </h3>

          <span className={styles.number}>
            {number}
          </span>
        </div>

        <p className={styles.type}>
          {project.projectType}
        </p>
      </div>
    </Link>
  );
}
