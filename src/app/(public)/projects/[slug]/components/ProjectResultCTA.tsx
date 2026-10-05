import Link from "next/link";

import styles from "../ProjectPage.module.css";

export default function ProjectResultCTA() {
  return (
    <section
      className={`${styles.resultCta} ${styles.projectResult}`}
      aria-labelledby="project-cta-title"
    >
      <div
        className={styles.resultCtaGrid}
        aria-hidden="true"
      >
        <span
          className={`${styles.resultCtaLine} ${styles.resultCtaLine1}`}
        />
        <span
          className={`${styles.resultCtaLine} ${styles.resultCtaLine2}`}
        />
        <span
          className={`${styles.resultCtaLine} ${styles.resultCtaLine3}`}
        />
        <span
          className={`${styles.resultCtaSquare} ${styles.resultCtaSquare1}`}
        />
        <span
          className={`${styles.resultCtaSquare} ${styles.resultCtaSquare2}`}
        />
        <span className={styles.resultCtaNumber}>011</span>
      </div>

      <div
        className={`${styles.resultCtaInner} ${styles.projectResultInner}`}
      >
        <div className={styles.resultCtaHeading}>
          <p className={styles.resultCtaKicker}>{"// 011 / RESULT"}</p>

          <h2
            id="project-cta-title"
            className={styles.resultCtaTitle}
          >
            HAVE A
            <br />
            PROJECT
            <br />
            IN MIND?
          </h2>
        </div>

        <div className={styles.resultCtaAction}>
          <p className={styles.resultCtaCopy}>
            Explore more work, or move from the case study into a
            direct conversation about the next build.
          </p>

          <Link
            href="#more-projects"
            className={styles.resultCtaLink}
          >
            <span>VIEW MORE PROJECTS</span>
            <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
