import type { Metadata } from "next";
import { getAbsoluteSiteUrl } from "@/lib/site-origin";
import PublicSiteShell from "@/components/PublicSiteShell";
import styles from "../LegalPage.module.css";
import { getDefaultSocialImageMetadata } from "@/lib/seo/default-social-image";

export async function generateMetadata(): Promise<Metadata> {
  const [canonical, images] = await Promise.all([getAbsoluteSiteUrl("/privacy"), getDefaultSocialImageMetadata()]);
  return { title: "Privacy Policy", description: "How this portfolio handles contact messages and comments.", robots: { index: true, follow: true }, ...(canonical ? { alternates: { canonical } } : {}), openGraph: { ...(canonical ? { url: canonical } : {}), ...(images ? { images } : {}) } };
}

export default async function PrivacyPage() {
  return (
    <PublicSiteShell>
      <main className={styles.page}>
        <header className={styles.head}><div><p className={styles.eyebrow}>LEGAL / 01</p><h1>Privacy<br/>Policy</h1></div><p className={styles.updated}>Last updated<br/>3 October 2026</p></header>
        <p className={styles.intro}>This policy describes the information this portfolio collects through its contact and article comment forms.</p>
        <div className={styles.body}><nav aria-label="On this page" className={styles.index}><a href="#information">01 Information</a><a href="#use">02 Use and access</a><a href="#retention">03 Retention</a><a href="#contact">04 Contact</a></nav><div className={styles.sections}>
          <section className={styles.section} id="information"><h2>1. Information you submit</h2><p>The contact form stores your name, email address, subject, and message in the site database so the site operator can review and respond. Article comments store the name and comment text. Comments remain pending until reviewed and are not shown publicly unless approved.</p><p>To limit repeated contact and comment submissions, the application may store a SHA-256-derived rate-limit key based on the client address supplied by the trusted hosting proxy. The application rate limiter does not store the raw address or use this key for visitor analytics.</p></section>
          <section className={styles.section} id="use"><h2>2. Use and access</h2><p>Submitted information is used to respond to messages and moderate comments. Administrative access is restricted to the site administrator. The application source does not implement email delivery for contact submissions.</p></section>
          <section className={styles.section} id="retention"><h2>3. Retention and hosting</h2><p>Messages and comments are retained in the site database until an administrator removes them. Stale rate-limit keys become eligible for best-effort cleanup after 24 hours; cleanup runs periodically during later limited form submissions, so keys can remain longer. The database hosting provider and its location depend on the deployment configuration and are not identified by this site.</p></section>
          <section className={styles.section} id="contact"><h2>4. Questions</h2><p>For a privacy question, use the current contact methods on the <a href="/contact">Contact page</a>.</p></section>
        </div></div>
      </main>
    </PublicSiteShell>
  );
}
