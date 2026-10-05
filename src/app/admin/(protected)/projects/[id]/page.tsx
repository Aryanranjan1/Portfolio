import { notFound } from "next/navigation";

import { getAdminProjectEditorData } from "@/db/queries/admin";
import styles from "@/components/admin/AdminShell.module.css";
import ProjectEditorForm from "../ProjectEditorForm";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditProjectPage({ params }: PageProps) {
  const { id } = await params;
  const data = await getAdminProjectEditorData(id);
  if (!data.project) notFound();

  return <main>
    <header className={styles.pageHeader}><div><p className={styles.eyebrow}>Content / Projects</p><h1 className={styles.pageTitle}>Edit project</h1><p className={styles.intro}>{data.project.title}</p></div></header>
    <ProjectEditorForm data={data} />
  </main>;
}
