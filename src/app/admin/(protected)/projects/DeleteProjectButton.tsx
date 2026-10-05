"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { deleteProjectAction } from "./actions";
import styles from "@/components/admin/AdminShell.module.css";

export default function DeleteProjectButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  function remove() {
    if (!window.confirm(`Permanently delete “${title}”? Its project content and relationships will also be deleted.`)) return;
    setMessage("");
    startTransition(async () => {
      const result = await deleteProjectAction(id);
      if (!result.success) {
        setMessage(`Delete failed: ${result.error}.`);
        return;
      }
      router.refresh();
    });
  }

  return <span className={styles.deleteControl}>
    <button className={styles.actionButton} disabled={pending} onClick={remove} type="button">{pending ? "Deleting…" : "Delete"}</button>
    {message && <span className={styles.inlineError} role="alert">{message}</span>}
  </span>;
}
