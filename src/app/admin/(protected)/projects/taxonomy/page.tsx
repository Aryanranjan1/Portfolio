import { getAdminProjectTaxonomies } from "@/db/queries/admin";
import styles from "@/components/admin/AdminShell.module.css";
import ProjectTaxonomyManager from "./ProjectTaxonomyManager";

export default async function ProjectTaxonomyPage() {
  const data = await getAdminProjectTaxonomies();
  return <main><header className={styles.pageHeader}><div><p className={styles.eyebrow}>Content / Work</p><h1 className={styles.pageTitle}>Project taxonomies</h1><p className={styles.intro}>Manage the categories and technologies used by project editors.</p></div></header><ProjectTaxonomyManager data={data} /></main>;
}
