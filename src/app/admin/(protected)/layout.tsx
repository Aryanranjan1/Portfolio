import { requireAdmin } from "@/lib/auth/require-admin";
import AdminNavigation from "@/components/admin/AdminNavigation";
import styles from "@/components/admin/AdminShell.module.css";

export const dynamic = "force-dynamic";

export default async function AdminProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireAdmin();

  return (
    <div className={styles.adminShell}>
      <AdminNavigation />
      <div className={styles.main}>{children}</div>
    </div>
  );
}
