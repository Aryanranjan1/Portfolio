import type { Metadata } from "next";
import { getAbsoluteSiteUrl } from "@/lib/site-origin";
import PublicSiteShell from "@/components/PublicSiteShell";
import styles from "../LegalPage.module.css";
import { getDefaultSocialImageMetadata } from "@/lib/seo/default-social-image";

export async function generateMetadata(): Promise<Metadata> {
  const [canonical, images] = await Promise.all([getAbsoluteSiteUrl("/terms"), getDefaultSocialImageMetadata()]);
  return { title: "Terms of Service", description: "Terms for using this portfolio and its public content.", robots: { index: true, follow: true }, ...(canonical ? { alternates: { canonical } } : {}), openGraph: { ...(canonical ? { url: canonical } : {}), ...(images ? { images } : {}) } };
}

export default function TermsPage() {
  return (
    <PublicSiteShell>
      <main className={styles.page}>
        <header className={styles.head}><div><p className={styles.eyebrow}>LEGAL / 02</p><h1>Terms<br/>of Use</h1></div><p className={styles.updated}>Last updated<br/>3 October 2026</p></header>
        <p className={styles.intro}>This site presents portfolio projects and technical writing. You may read and link to public pages for personal and informational use.</p>
        <div className={styles.body}><nav aria-label="On this page" className={styles.index}><a href="#use">01 Website use</a><a href="#submissions">02 Submissions</a><a href="#content">03 Content</a><a href="#availability">04 Availability</a><a href="#contact">05 Contact</a></nav><div className={styles.sections}>
          <section className={styles.section} id="use"><h2>1. Website use</h2><p>You may read and link to public pages for personal and informational use.</p></section>
          <section className={styles.section} id="submissions"><h2>2. Comments and submissions</h2><p>Do not submit unlawful, abusive, or other people’s private information through the contact or comment forms. Comments are reviewed before publication and may be declined or removed.</p></section>
          <section className={styles.section} id="content"><h2>3. Content</h2><p>This site contains portfolio projects and technical articles. Project details and technical articles may become outdated.</p></section>
          <section className={styles.section} id="availability"><h2>4. Availability and changes</h2><p>The site may change or remove content over time.</p></section>
          <section className={styles.section} id="contact"><h2>5. Contact</h2><p>Questions about these terms can be sent through the <a href="/contact">Contact page</a>.</p></section>
        </div></div>
      </main>
    </PublicSiteShell>
  );
}
