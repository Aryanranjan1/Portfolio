import { getAdminArticleEditorData } from "@/db/queries/admin";
import styles from "@/components/admin/AdminShell.module.css";
import ArticleEditorForm from "../ArticleEditorForm";

export default async function NewArticlePage() {
  const data = await getAdminArticleEditorData();
  return <main>
    <header className={styles.pageHeader}><div><p className={styles.eyebrow}>Content / Blog</p><h1 className={styles.pageTitle}>New article</h1><p className={styles.intro}>Create an article with structured metadata and editorial content blocks.</p></div></header>
    {data.categories.length ? <ArticleEditorForm data={data} /> : <section className={styles.statCard}>Add an article category before creating an article.</section>}
  </main>;
}
