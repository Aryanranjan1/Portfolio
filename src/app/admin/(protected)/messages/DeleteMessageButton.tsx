"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteContactSubmissionAction } from "./actions";
import { useMessageDeletionConfirmed } from "./MessageDeletionBoundary";
import { getMessageDeletionFeedback } from "@/lib/contact/message-deletion-feedback";
import styles from "@/components/admin/AdminShell.module.css";

export default function DeleteMessageButton({ id, subject }: { id: string; subject: string }) {
  const router = useRouter();
  const onDeleted = useMessageDeletionConfirmed();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function remove() {
    if (!window.confirm(`Permanently delete “${subject}”? This cannot be undone.`)) return;
    setError("");
    startTransition(async () => {
      const result = await deleteContactSubmissionAction(id);
      const feedback = getMessageDeletionFeedback(result);
      if (feedback.kind === "failed") {
        setError(feedback.message);
        if (feedback.refresh) router.refresh();
        return;
      }
      onDeleted(feedback.cacheInvalidated);
      router.refresh();
    });
  }

  return <span><button className={styles.actionButton} disabled={pending} onClick={remove} type="button">{pending ? "Deleting…" : "Delete message"}</button>{error && <span className={styles.inlineError} role="alert">{error}</span>}</span>;
}
