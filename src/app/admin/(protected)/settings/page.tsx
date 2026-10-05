import { getAdminSettingsData } from "@/db/queries/admin";
import styles from "@/components/admin/AdminShell.module.css";
import SettingsWorkspace from "@/components/admin/SettingsWorkspace";

export default async function SettingsPage() {
  const data = await getAdminSettingsData();
  return <main>
    <header className={styles.pageHeader}><div><p className={styles.eyebrow}>Site configuration</p><h1 className={styles.pageTitle}>Settings</h1><p className={styles.intro}>Manage site identity, public content, resume, and discovery settings.</p></div></header>
    <SettingsWorkspace data={data} />
  </main>;
}
