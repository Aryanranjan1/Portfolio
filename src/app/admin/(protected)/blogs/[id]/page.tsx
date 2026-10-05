import { notFound } from "next/navigation";
import { getAdminArticleEditorData } from "@/db/queries/admin";
import styles from "@/components/admin/AdminShell.module.css";
import ArticleEditorForm from "../ArticleEditorForm";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditArticlePage({ params }: PageProps) {
  const { id } = await params;
  const data = await getAdminArticleEditorData(id);
  if (!data.article) notFound();
  return <main>
    <header className={styles.pageHeader}><div><p className={styles.eyebrow}>Content / Blog</p><h1 className={styles.pageTitle}>Edit article</h1><p className={styles.intro}>{data.article.title}</p></div></header>
    <ArticleEditorForm data={data} />
  </main>;
}
