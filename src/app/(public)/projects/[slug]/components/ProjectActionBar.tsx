/* eslint-disable react/jsx-no-comment-textnodes */
import styles from "../ProjectPage.module.css";

type ProjectLink = {
  id: string;
  type: string;
  label: string;
  url: string;
  position: number;
};

type ProjectActionBarProps = {
  links: ProjectLink[];
};

export default function ProjectActionBar({
  links,
}: ProjectActionBarProps) {
  if (links.length === 0) {
    return null;
  }

  return (
    <section className={styles.actionBar}>
      <div className={styles.shell}>
        <div className={styles.actionBarInner}>
          <div className={styles.actionIntro}>
            // PROJECT RESOURCES / 002
          </div>

          <nav
            className={styles.projectActions}
            aria-label="Project resources"
          >
            {links.map((link) => (
              <a
                key={link.id}
                className={styles.projectAction}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>{link.label}</span>
                <span aria-hidden="true">↗</span>
              </a>
            ))}
          </nav>
        </div>
      </div>
    </section>
  );
}