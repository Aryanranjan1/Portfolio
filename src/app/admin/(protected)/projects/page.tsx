import Link from "next/link";

import { getAdminProjects } from "@/db/queries/admin";
import styles from "@/components/admin/AdminShell.module.css";
import DeleteProjectButton from "./DeleteProjectButton";

type PageProps = { searchParams: Promise<{ status?: string; featured?: string; q?: string; sort?: string }> };

export default async function ProjectsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const status = ["published", "draft", "archived"].includes(params.status ?? "") ? params.status : undefined;
  const featured = params.featured === "true";
  const projects = await getAdminProjects({ status, featured, search: params.q, sort: params.sort });

  return <main>
    <header className={styles.pageHeader}>
      <div><p className={styles.eyebrow}>Content / Work</p><h1 className={styles.pageTitle}>Projects</h1><p className={styles.intro}>Manage case studies and their publication status.</p></div>
      <div className={styles.rowActions}><Link className={styles.quickLink} href="/admin/projects/taxonomy">Manage categories &amp; technologies</Link><Link className={styles.quickLink} href="/admin/projects/new">+ New project</Link></div>
    </header>
    <nav className={styles.quickLinks} aria-label="Filter projects">
      {[["All", ""], ["Published", "published"], ["Draft", "draft"], ["Archived", "archived"]].map(([label, value]) => <Link className={styles.quickLink} href={projectHref({ ...params, status: value || undefined })} key={label}>{label}</Link>)}
      <Link className={styles.quickLink} href={projectHref({ ...params, status: undefined, featured: featured ? undefined : "true" })}>{featured ? "✓ Featured" : "Featured"}</Link>
    </nav>
    <form action="/admin/projects" className={styles.listToolbar}>
      {status && <input name="status" type="hidden" value={status} />}
      {featured && <input name="featured" type="hidden" value="true" />}
      <label className={styles.searchField}><span>Search projects</span><input defaultValue={params.q ?? ""} maxLength={120} name="q" placeholder="Title, slug, or type" /></label>
      <label className={styles.searchField}><span>Sort</span><select defaultValue={params.sort ?? "updated"} name="sort"><option value="updated">Recently updated</option><option value="created">Recently created</option><option value="title">Title</option></select></label>
      <button className={styles.quickLink} type="submit">Apply</button>
    </form>
    {projects.length === 0 ? <section className={styles.statCard} role="status">No projects found.</section> : <section className={styles.contentList} aria-label="Projects">
      {projects.map((item) => <article className={styles.contentRow} key={item.id}>
        <div><h2>{item.title}</h2><p>/{item.slug} · {item.projectType} · {item.publishedAt ? `Published ${item.publishedAt.toLocaleDateString()}` : `Updated ${item.updatedAt.toLocaleDateString()}`}</p></div>
        <span className={styles.messageStatus}>{item.status}{item.featured ? " · featured" : ""}</span>
        <div className={styles.rowActions}><Link className={styles.quickLink} href={`/admin/projects/${item.id}`}>Edit</Link><DeleteProjectButton id={item.id} title={item.title} /></div>
      </article>)}
    </section>}
    <p className={styles.listCount}>Showing {projects.length} project{projects.length === 1 ? "" : "s"}{projects.length === 200 ? " · maximum 200 results" : ""}.</p>
  </main>;
}

function projectHref(values: { status?: string; featured?: string; q?: string; sort?: string }) {
  const query = new URLSearchParams();
  if (values.status) query.set("status", values.status);
  if (values.featured) query.set("featured", values.featured);
  if (values.q) query.set("q", values.q);
  if (values.sort) query.set("sort", values.sort);
  const suffix = query.toString();
  return suffix ? `/admin/projects?${suffix}` : "/admin/projects";
}
