import { getAdminArticleTaxonomies } from "@/db/queries/admin";
import styles from "@/components/admin/AdminShell.module.css";
import ArticleTaxonomyManager from "./ArticleTaxonomyManager";

export default async function ArticleTaxonomyPage() {
  const data = await getAdminArticleTaxonomies();
  return <main><header className={styles.pageHeader}><div><p className={styles.eyebrow}>Content / Writing</p><h1 className={styles.pageTitle}>Blog taxonomies</h1><p className={styles.intro}>Manage the categories and tags used by article editors.</p></div></header><ArticleTaxonomyManager data={data} /></main>;
}
