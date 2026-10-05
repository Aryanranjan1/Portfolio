import { auth } from "@/auth";
import Link from "next/link";
import { getAdminDashboardData } from "@/db/queries/admin";
import styles from "@/components/admin/AdminShell.module.css";

export default async function AdminDashboardPage() {
  const [session, dashboard] = await Promise.all([auth(), getAdminDashboardData()]);
  const { stats } = dashboard;
  const totalPublishingEvents = dashboard.publishing.reduce((sum, month) => sum + month.projects + month.articles, 0);
  const maxPublishing = Math.max(1, ...dashboard.publishing.map((month) => month.projects + month.articles));

  return (
    <main>
      <header className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>Portfolio / Control room</p>
          <h1 className={styles.pageTitle}>Dashboard</h1>
          <p className={styles.intro}>Welcome, {session?.user?.email}. An overview of current content and recent submissions.</p>
        </div>
      </header>

      <section className={styles.dashboardMetrics} aria-label="Content overview">
        <Metric label="Total projects" value={stats.projects.total} />
        <Metric label="Published projects" value={stats.projects.published} />
        <Metric label="Draft projects" value={stats.projects.draft} />
        <Metric label="Archived projects" value={stats.projects.archived} />
        <Metric label="Total articles" value={stats.articles.total} />
        <Metric label="Published articles" value={stats.articles.published} />
        <Metric label="Draft articles" value={stats.articles.draft} />
        <Metric label="Pending comments" value={stats.pendingComments} href="/admin/comments" />
        <Metric label="Unread messages" value={stats.unreadMessages} href="/admin/messages" />
        <Metric label="Media records" value={stats.mediaRecords} href="/admin/media" />
      </section>

      <div className={styles.dashboardColumns}>
        <section className={`${styles.dashboardPanel} ${styles.dashboardWide}`}>
          <PanelHeading title="Publishing overview" detail="Published records by publication date · last six months" />
          {totalPublishingEvents < 2 ? (
            <p className={styles.dashboardEmpty}>{totalPublishingEvents === 0 ? "No published content in this period." : "There is not enough publishing history for a useful chart."}</p>
          ) : (
            <div className={styles.publishChart} role="img" aria-label="Published projects and articles by month for the last six months">
              {dashboard.publishing.map((month) => {
                const total = month.projects + month.articles;
                return <div className={styles.publishMonth} key={month.key}>
                  <div className={styles.publishBarTrack}>
                    {total > 0 && <span className={styles.publishBarPair}>
                      <i className={styles.projectBar} style={{ height: `${month.projects ? Math.max(8, month.projects / maxPublishing * 100) : 0}%` }} title={`${month.projects} projects`} />
                      <i className={styles.articleBar} style={{ height: `${month.articles ? Math.max(8, month.articles / maxPublishing * 100) : 0}%` }} title={`${month.articles} articles`} />
                    </span>}
                  </div>
                  <span className={styles.publishMonthLabel}>{month.label}</span>
                  <span className={styles.publishMonthValue}>{total}</span>
                </div>;
              })}
              <div className={styles.chartLegend}><span><i className={styles.projectLegend} /> Projects</span><span><i className={styles.articleLegend} /> Articles</span></div>
            </div>
          )}
        </section>

        <section className={styles.dashboardPanel}>
          <PanelHeading title="Content distribution" detail="Current database records" />
          <Distribution label="Projects" rows={[
            ["Published", stats.projects.published], ["Draft", stats.projects.draft], ["Archived", stats.projects.archived],
          ]} />
          <Distribution label="Articles" rows={[
            ["Published", stats.articles.published], ["Draft", stats.articles.draft], ["Archived", stats.articles.archived],
          ]} />
          <div className={styles.distributionGroup}>
            <h3>Article categories</h3>
            {dashboard.categories.length ? dashboard.categories.map((category) => <DistributionRow key={category.name} label={category.name} value={category.total} />) : <p className={styles.dashboardEmpty}>No article categories in use.</p>}
          </div>
        </section>

        <section className={styles.dashboardPanel}>
          <PanelHeading title="Recent projects" detail="Most recently updated" />
          <RecentRows empty="No projects found." rows={dashboard.recentProjects.map((item) => ({ id: item.id, title: item.title, meta: `${item.status}${item.featured ? " · featured" : ""} · ${date(item.updatedAt)}`, href: `/admin/projects/${item.id}` }))} />
        </section>
        <section className={styles.dashboardPanel}>
          <PanelHeading title="Recent articles" detail="Most recently updated" />
          <RecentRows empty="No articles found." rows={dashboard.recentArticles.map((item) => ({ id: item.id, title: item.title, meta: `${item.category} · ${item.status}${item.featured ? " · featured" : ""} · ${date(item.updatedAt)}`, href: `/admin/blogs/${item.id}` }))} />
        </section>
        <section className={styles.dashboardPanel}>
          <PanelHeading title="Recent comments" detail="Newest submissions" />
          <RecentRows empty="No comments found." rows={dashboard.recentComments.map((item) => ({ id: item.id, title: item.name, meta: `${item.articleTitle} · ${item.status} · ${date(item.createdAt)}`, href: "/admin/comments" }))} />
        </section>
        <section className={styles.dashboardPanel}>
          <PanelHeading title="Recent messages" detail="Newest contact submissions" />
          <RecentRows empty="No messages found." rows={dashboard.recentMessages.map((item) => ({ id: item.id, title: item.subject, meta: `${item.name} · ${item.status} · ${date(item.submittedAt)}`, href: "/admin/messages" }))} />
        </section>
        <section className={styles.dashboardPanel}>
          <PanelHeading title="Recent activity" detail="Derived from content and submission timestamps; not an audit log" />
          <RecentRows empty="No recent activity." rows={dashboard.activity.map((item) => ({ id: `${item.kind}-${item.id}`, title: item.label, meta: `${item.kind} · ${item.status} · ${date(item.at)}`, href: item.href }))} />
        </section>
        <section className={styles.dashboardPanel}>
          <PanelHeading title="Configuration health" detail="Checks based on current server configuration" />
          <HealthRow label="Authentication configuration" ok={dashboard.health.authentication} />
          <HealthRow label="Database connection" ok={dashboard.health.database} positive="AVAILABLE" negative="UNAVAILABLE" />
          <HealthRow label="Supabase credentials" ok={dashboard.health.storage} />
          <HealthRow label={`Storage bucket · ${dashboard.health.bucket}`} ok={false} unknown />
          <HealthRow label="Canonical site origin" ok={dashboard.health.siteOrigin} />
          <HealthRow label="Required site settings" ok={dashboard.health.settingsComplete} />
          <p className={styles.dashboardNote}>Bucket existence and provider storage usage are not checked. Recorded file sizes total {formatBytes(dashboard.mediaBytes)} across {stats.mediaRecords} media records.</p>
        </section>
      </div>

      <nav className={styles.quickLinks} aria-label="Quick actions">
        <Link className={styles.quickLink} href="/admin/projects/new">+ New project</Link>
        <Link className={styles.quickLink} href="/admin/blogs/new">+ New article</Link>
        <Link className={styles.quickLink} href="/admin/messages">Open inbox</Link>
      </nav>
    </main>
  );
}

function Metric({ label, value, href }: { label: string; value: number; href?: string }) {
  const body = <><span className={styles.metricLabel}>{label}</span><strong className={styles.metricValue}>{value}</strong></>;
  return href ? <Link className={styles.metricCard} href={href}>{body}</Link> : <article className={styles.metricCard}>{body}</article>;
}

function PanelHeading({ title, detail }: { title: string; detail: string }) {
  return <header className={styles.dashboardPanelHeading}><h2>{title}</h2><p>{detail}</p></header>;
}

function Distribution({ label, rows }: { label: string; rows: [string, number][] }) {
  return <div className={styles.distributionGroup}><h3>{label}</h3>{rows.map(([name, value]) => <DistributionRow key={name} label={name} value={value} />)}</div>;
}

function DistributionRow({ label, value }: { label: string; value: number }) {
  return <div className={styles.distributionRow}><span>{label}</span><strong>{value}</strong></div>;
}

function RecentRows({ empty, rows }: { empty: string; rows: { id: string; title: string; meta: string; href: string }[] }) {
  return rows.length ? <ul className={styles.recentRows}>{rows.map((row) => <li key={row.id}><Link href={row.href}><strong>{row.title}</strong><span>{row.meta}</span></Link></li>)}</ul> : <p className={styles.dashboardEmpty}>{empty}</p>;
}

function HealthRow({ label, ok, unknown = false, positive = "CONFIGURED", negative = "MISSING" }: { label: string; ok: boolean; unknown?: boolean; positive?: string; negative?: string }) {
  const text = unknown ? "UNVERIFIED" : ok ? positive : negative;
  return <div className={styles.healthRow}><span>{label}</span><strong data-state={unknown ? "unknown" : ok ? "ok" : "missing"}>{text}</strong></div>;
}

function date(value: Date) { return value.toLocaleDateString("en", { year: "numeric", month: "short", day: "numeric" }); }
function formatBytes(value: number) {
  if (value < 1024) return `${value} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let size = value / 1024;
  let unit = units[0];
  for (let index = 1; size >= 1024 && index < units.length; index += 1) { size /= 1024; unit = units[index]; }
  return `${size.toFixed(1)} ${unit}`;
}
