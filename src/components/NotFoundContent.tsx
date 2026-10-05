import Link from "next/link";
import styles from "@/app/not-found.module.css";

export default function NotFoundContent() {
  return (
    <main className={styles.page}>
      <section className={styles.composition} aria-labelledby="not-found-title">
        <div className={styles.grid} aria-hidden="true" />
        <div className={styles.coordinate} aria-hidden="true">N 404° / ROUTE NOT RESOLVED</div>
        <div className={styles.crosshair} aria-hidden="true"><span /><span /></div>
        <div className={styles.content}>
          <p className={styles.kicker}>PORTFOLIO / SYSTEM RESPONSE</p>
          <p className={styles.code} aria-hidden="true">404</p>
          <div className={styles.rule} aria-hidden="true" />
          <div className={styles.copy}>
            <h1 id="not-found-title">PAGE NOT FOUND</h1>
            <p>The page may have moved, or the address may be incomplete. Start again from one of these destinations.</p>
            <nav className={styles.links} aria-label="Suggested pages">
              <Link href="/">Home <span aria-hidden="true">↗</span></Link>
              <Link href="/projects">Projects <span aria-hidden="true">↗</span></Link>
              <Link href="/blog">Blog <span aria-hidden="true">↗</span></Link>
            </nav>
          </div>
        </div>
        <div className={styles.index} aria-hidden="true">INDEX 00—04 <span>•</span> END OF PATH</div>
      </section>
    </main>
  );
}
