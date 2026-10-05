import { getAdminProjectEditorData } from "@/db/queries/admin";
import styles from "@/components/admin/AdminShell.module.css";
import ProjectEditorForm from "../ProjectEditorForm";

export default async function NewProjectPage() {
  const data = await getAdminProjectEditorData();
  return <main>
    <header className={styles.pageHeader}><div><p className={styles.eyebrow}>Content / Projects</p><h1 className={styles.pageTitle}>New project</h1><p className={styles.intro}>Create a structured project using the existing portfolio fields and block types.</p></div></header>
    <ProjectEditorForm data={data} />
  </main>;
}
