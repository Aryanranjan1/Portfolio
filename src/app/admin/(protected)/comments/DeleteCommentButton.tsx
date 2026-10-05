"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteCommentAction } from "./actions";
import styles from "@/components/admin/AdminShell.module.css";

export default function DeleteCommentButton({ id, author }: { id: string; author: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  function remove() {
    if (!window.confirm(`Permanently delete ${author}’s comment? This cannot be undone.`)) return;
    setError("");
    startTransition(async () => {
      const result = await deleteCommentAction(id);
      if (!result.success) { setError(`Delete failed: ${result.error}.`); return; }
      router.refresh();
    });
  }
  return <span className={styles.deleteControl}><button className={styles.actionButton} disabled={pending} onClick={remove} type="button">{pending ? "Deleting…" : "Delete"}</button>{error && <span className={styles.inlineError} role="alert">{error}</span>}</span>;
}
