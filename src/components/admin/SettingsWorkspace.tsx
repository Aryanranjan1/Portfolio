"use client";

import { useState } from "react";
import type { getAdminSettingsData } from "@/db/queries/admin";
import SiteSettingsForm from "./SiteSettingsForm";
import ContactMethodsManager from "./ContactMethodsManager";
import FooterResourcesManager from "./FooterResourcesManager";
import FooterExploreManager from "./FooterExploreManager";
import AboutContentManager from "./AboutContentManager";
import ResumeSettingsManager from "./ResumeSettingsManager";
import styles from "./AdminShell.module.css";

type Data = Awaited<ReturnType<typeof getAdminSettingsData>>;
type Tab = "identity" | "about" | "contact" | "footer" | "resume" | "seo" | "discoverability";
const tabs: { id: Tab; label: string }[] = [
  { id: "identity", label: "Identity" }, { id: "about", label: "About" }, { id: "contact", label: "Contact" },
  { id: "footer", label: "Footer" }, { id: "resume", label: "Resume" }, { id: "seo", label: "SEO" }, { id: "discoverability", label: "Discoverability" },
];

export default function SettingsWorkspace({ data }: { data: Data }) {
  const [tab, setTab] = useState<Tab>("identity");
  const seoImages = data.images;
  return <div className={styles.settingsWorkspace}>
    <nav aria-label="Settings groups" className={styles.settingsTabs}>
      {tabs.map((item) => <button aria-current={tab === item.id ? "page" : undefined} className={tab === item.id ? styles.settingsTabActive : styles.settingsTab} key={item.id} onClick={() => setTab(item.id)} type="button">{item.label}</button>)}
    </nav>
    <div className={styles.settingsContent}>
      {tab === "identity" && data.settings && <SiteSettingsForm group="identity" media={seoImages} settings={data.settings} />}
      {tab === "about" && <div className={styles.managerStack}>
        <AboutContentManager data={data} images={seoImages} />
      </div>}
      {tab === "contact" && <section className={styles.settingsSection}><header className={styles.managerHeading}><div><h2>Contact methods</h2><p>Configured methods can appear on Contact and in the Footer social links.</p></div></header><ContactMethodsManager initial={data.contactMethods} /></section>}
      {tab === "footer" && <section className={styles.settingsSection}><header className={styles.managerHeading}><div><h2>Footer Explore</h2><p>Manage site and content discovery links under 02. EXPLORE.</p></div></header><FooterExploreManager initial={data.exploreItems} key={data.exploreItems.map((item) => `${item.id}:${item.label}:${item.url}:${item.active}:${item.position}`).join("|")} /><header className={styles.managerHeading}><div><h2>Footer Resources</h2><p>Only active resource links appear under 03. RESOURCES. Explore and Resources remain separate lists.</p></div></header><FooterResourcesManager initial={data.resources} key={data.resources.map((item) => `${item.id}:${item.label}:${item.url}:${item.active}:${item.position}`).join("|")} /><div className={styles.footerSourceNote}><strong>Identity and description</strong><span>Uses the existing person name and short description from site settings.</span><strong>Social links</strong><span>Uses configured contact methods. Navigation and artwork are structural.</span><strong>Location</strong><span>Uses site settings location; worldwide copy and map remain fixed.</span></div></section>}
      {tab === "resume" && <ResumeSettingsManager initial={data.resume} key={data.resume?.id ?? "fallback"} />}
      {tab === "seo" && data.settings && <div className={styles.managerStack}><p className={styles.editorHelp}>These are global values. Project and article SEO fields remain in their editors.</p><SiteSettingsForm group="seo" media={seoImages} settings={data.settings} /></div>}
      {tab === "discoverability" && <Discoverability data={data} />}
      {!data.settings && (tab === "identity" || tab === "about" || tab === "seo") && <section className={styles.statCard}>Site settings have not been initialized in the database.</section>}
    </div>
  </div>;
}

function Discoverability({ data }: { data: Data }) {
  const projects = data.projectCounts;
  const articles = data.articleCounts;
  return <section className={styles.settingsSection}>
    <h2>Discoverability infrastructure</h2>
    <p className={styles.intro}>Read-only status from the current routes and database. These figures are content counts, not search performance metrics.</p>
    <div className={styles.discoverabilityGrid}>
      <InfoCard title="Sitemap" value="Generated at /sitemap.xml" detail="Includes public routes and published indexable projects and articles." />
      <InfoCard title="Robots" value="Generated at /robots.txt" detail="Allows public paths and disallows /admin/ and /api/." />
      <InfoCard title="llms.txt" value="Generated at /llms.txt" detail="Uses site identity and up to 30 discoverable projects and articles." />
      <InfoCard title="Effective canonical origin" value={data.originConfiguration.effectiveOrigin ?? "Invalid or not configured"} detail={`${data.originConfiguration.source === "environment" ? "NEXT_PUBLIC_SITE_URL environment override" : "site_settings.canonical_origin"} takes precedence. The effective runtime origin must be HTTPS and cannot be a placeholder.`} />
      <InfoCard title="Indexable published content" value={`${projects} projects · ${articles} articles`} detail="Counts published records with robotsIndex enabled." />
      <InfoCard title="Structured data" value={data.settings ? "WebSite and Person" : "Not configured"} detail="Project and article detail routes also emit structured data." />
      <InfoCard title="sameAs / social identity" value={data.contactMethods.filter((item) => item.active && ["github", "linkedin", "x"].includes(item.type)).length ? "Social contact methods configured" : "No active social contact methods"} detail="These methods feed the Contact page and Footer. A global sameAs array is not stored separately." />
    </div>
    <p className={styles.dashboardNote}>Search impressions, clicks, CTR, ranking, and Core Web Vitals are not available from the current application data.</p>
  </section>;
}

function InfoCard({ title, value, detail }: { title: string; value: string; detail: string }) {
  return <article className={styles.statCard}><h3>{title}</h3><strong className={styles.infoValue}>{value}</strong><p className={styles.dashboardNote}>{detail}</p></article>;
}
