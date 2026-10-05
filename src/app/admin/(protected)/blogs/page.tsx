import Link from "next/link";

import { getAdminArticles, getAdminArticleFilters } from "@/db/queries/admin";
import styles from "@/components/admin/AdminShell.module.css";
import DeleteArticleButton from "./DeleteArticleButton";

type PageProps = { searchParams: Promise<{ status?: string; featured?: string; q?: string; category?: string; tag?: string; sort?: string }> };

export default async function BlogsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const [filters, articles] = await Promise.all([getAdminArticleFilters(), getAdminArticles({
    status: params.status, featured: params.featured === "true", search: params.q,
    category: params.category, tagId: params.tag, sort: params.sort,
  })]);
  const status = ["published", "draft", "archived"].includes(params.status ?? "") ? params.status : undefined;

  return <main>
    <header className={styles.pageHeader}>
      <div><p className={styles.eyebrow}>Content / Writing</p><h1 className={styles.pageTitle}>Blog</h1><p className={styles.intro}>Manage articles, structured content, and publication status.</p></div>
      <div className={styles.rowActions}><Link className={styles.quickLink} href="/admin/blogs/taxonomy">Manage categories &amp; tags</Link><Link className={styles.quickLink} href="/admin/blogs/new">+ New article</Link></div>
    </header>
    <nav className={styles.quickLinks} aria-label="Filter articles">
      {[["All", ""], ["Published", "published"], ["Draft", "draft"], ["Archived", "archived"]].map(([label, value]) => <Link className={styles.quickLink} href={blogHref({ ...params, status: value || undefined })} key={label}>{label}</Link>)}
      <Link className={styles.quickLink} href={blogHref({ ...params, status: undefined, featured: params.featured === "true" ? undefined : "true" })}>{params.featured === "true" ? "✓ Featured" : "Featured"}</Link>
    </nav>
    <form action="/admin/blogs" className={styles.listToolbar}>
      {status && <input name="status" type="hidden" value={status} />}
      {params.featured === "true" && <input name="featured" type="hidden" value="true" />}
      <label className={styles.searchField}><span>Search</span><input defaultValue={params.q ?? ""} maxLength={120} name="q" placeholder="Title, slug, or excerpt" /></label>
      <label className={styles.searchField}><span>Category</span><select defaultValue={params.category ?? ""} name="category"><option value="">All categories</option>{filters.categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      <label className={styles.searchField}><span>Tag</span><select defaultValue={params.tag ?? ""} name="tag"><option value="">All tags</option>{filters.tags.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      <label className={styles.searchField}><span>Sort</span><select defaultValue={params.sort ?? "updated"} name="sort"><option value="updated">Recently updated</option><option value="published">Publish date</option><option value="title">Title</option></select></label>
      <button className={styles.quickLink} type="submit">Apply</button>
    </form>
    {articles.length === 0 ? <section className={styles.statCard} role="status">No articles found.</section> : <section className={styles.contentList} aria-label="Articles">
      {articles.map((item) => <article className={styles.contentRow} key={item.id}>
        <div><h2>{item.title}</h2><p>{item.category} · /{item.slug} · {item.publishedAt ? `Published ${item.publishedAt.toLocaleDateString()}` : `Updated ${item.updatedAt.toLocaleDateString()}`}</p></div>
        <span className={styles.messageStatus}>{item.status}{item.featured ? " · featured" : ""}</span>
        <div className={styles.rowActions}><Link className={styles.quickLink} href={`/admin/blogs/${item.id}`}>Edit</Link><DeleteArticleButton id={item.id} title={item.title} /></div>
      </article>)}
    </section>}
    <p className={styles.listCount}>Showing {articles.length} article{articles.length === 1 ? "" : "s"}{articles.length === 200 ? " · maximum 200 results" : ""}.</p>
  </main>;
}

function blogHref(values: { status?: string; featured?: string; q?: string; category?: string; tag?: string; sort?: string }) {
  const query = new URLSearchParams();
  for (const key of ["status", "featured", "q", "category", "tag", "sort"] as const) if (values[key]) query.set(key, values[key]!);
  const suffix = query.toString();
  return suffix ? `/admin/blogs?${suffix}` : "/admin/blogs";
}
