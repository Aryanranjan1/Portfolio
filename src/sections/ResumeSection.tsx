import styles from "./ResumeSection.module.css";

type Props = { eyebrow?: string; heading: string; copy: string; id?: string };

export default function ResumeSection({ eyebrow = "04 — Resume", heading, copy, id = "resume-heading", sectionId = "resume" }: Props & { sectionId?: string }) {
  return <section aria-labelledby={id} className={styles.section} id={sectionId}>
    <div className={styles.frame}>
      <div className={styles.content}>
        <p className={styles.label}><span aria-hidden="true">{String.fromCharCode(47, 47)} </span>{eyebrow}</p>
        <h2 className={styles.heading} id={id}>{heading}</h2>
        <p className={styles.copy}>{copy}</p>
        <div className={styles.metadata}>
          <span>{String.fromCharCode(47, 47)} WORK / PROCESS / LEARNING</span>
          <span>EDITORIAL SERIES · 04</span>
        </div>
      </div>
      <aside className={styles.rail} aria-hidden="true">
        <span className={styles.railIndex}>04</span>
        <span className={styles.railRule} />
        <span className={styles.railPlus}>+</span>
        <span className={styles.railGrid} />
      </aside>
    </div>
  </section>;
}
