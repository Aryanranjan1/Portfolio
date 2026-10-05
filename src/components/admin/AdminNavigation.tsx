"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import styles from "./AdminShell.module.css";
import { logoutAction } from "@/app/admin/(protected)/logout-action";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/blogs", label: "Blog" },
  { href: "/admin/comments", label: "Comments" },
  { href: "/admin/media", label: "Media" },
  { href: "/admin/settings", label: "Settings" },
  { href: "/admin/messages", label: "Messages" },
];

export default function AdminNavigation() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar} aria-label="Admin navigation">
      <Link className={styles.brand} href="/admin">
        <span className={styles.brandMark} aria-hidden="true">A</span>
        <span>ADMIN</span>
      </Link>
      <nav className={styles.navigation}>
        {links.map((link) => {
          const active = link.href === "/admin"
            ? pathname === link.href
            : pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link
              aria-current={active ? "page" : undefined}
              className={`${styles.navLink} ${active ? styles.navLinkActive : ""}`}
              href={link.href}
              key={link.href}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
      <form action={logoutAction}>
        <button className={styles.logoutButton} type="submit">LOG OUT</button>
      </form>
    </aside>
  );
}
