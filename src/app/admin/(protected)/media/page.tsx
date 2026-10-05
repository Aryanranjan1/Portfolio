import { getMediaLibrary, getMediaUsage } from "@/db/queries/media";
import MediaUploader from "@/components/admin/MediaUploader";
import MediaLibrary from "./MediaLibrary";
import styles from "@/components/admin/AdminShell.module.css";

type PageProps = { searchParams: Promise<{ id?: string }> };

export default async function MediaPage({ searchParams }: PageProps) {
  const [{ id }, items] = await Promise.all([searchParams, getMediaLibrary()]);
  const details = id ? await getMediaUsage(id) : null;
  return <main>
    <header className={styles.pageHeader}>
      <div><p className={styles.eyebrow}>Content / Assets</p><h1 className={styles.pageTitle}>Media library</h1><p className={styles.intro}>Files are stored in the configured public Supabase bucket. Uploads and changes require an administrator session.</p></div>
    </header>
    <MediaUploader />
    <MediaLibrary items={items} details={details} selectedId={details?.item.id ?? null} />
  </main>;
}
