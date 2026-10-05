import Link from "next/link";
import { getModerationComments } from "@/db/queries/comments";
import DeleteCommentButton from "./DeleteCommentButton";
import ModerateCommentForm from "./ModerateCommentForm";
import styles from "@/components/admin/AdminShell.module.css";

type PageProps = { searchParams: Promise<{ status?: string }> };
const statuses = ["all", "pending", "approved", "rejected"] as const;

export default async function CommentsAdminPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const selected = statuses.find((status) => status === params.status) ?? "pending";
  const comments = await getModerationComments(selected);
  return <main>
    <header className={styles.pageHeader}><div><p className={styles.eyebrow}>Community</p><h1 className={styles.pageTitle}>Comments</h1><p className={styles.intro}>Review submitted comments. Public article pages display approved comments only.</p></div></header>
    <nav className={styles.quickLinks} aria-label="Filter comments">{statuses.map((status) => <Link aria-current={selected === status ? "page" : undefined} className={styles.quickLink} href={status === "all" ? "/admin/comments?status=all" : `/admin/comments?status=${status}`} key={status}>{status === "all" ? "All" : status[0].toUpperCase() + status.slice(1)}</Link>)}</nav>
    {comments.length === 0 ? <section className={styles.statCard} role="status">No {selected === "all" ? "comments" : `${selected} comments`} found.</section> : <section className={styles.commentList} aria-label="Comments">
      {comments.map((item) => <article className={styles.commentCard} key={item.id}>
        <header className={styles.messageHeader}><div><h2>{item.name}</h2><p className={styles.messageByline}><Link href={`/blog/${item.slug}`} rel="noreferrer" target="_blank">{item.title} ↗</Link> · {item.createdAt.toLocaleString()}</p></div><span className={styles.messageStatus}>{item.status}</span></header>
        <p className={styles.commentContent}>{item.content}</p>
        <div className={styles.messageActions}>
          {item.status !== "approved" && <ModerateCommentForm id={item.id} status="approved" />}
          {item.status !== "rejected" && <ModerateCommentForm id={item.id} status="rejected" />}
          <DeleteCommentButton id={item.id} author={item.name} />
        </div>
      </article>)}
    </section>}
    <p className={styles.listCount}>Showing up to {comments.length} comment{comments.length === 1 ? "" : "s"}.</p>
  </main>;
}
