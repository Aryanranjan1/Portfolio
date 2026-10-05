"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ContactSubmissionStatus } from "@/db/mutations/contact";
import { updateContactStatusAction } from "./actions";
import styles from "@/components/admin/AdminShell.module.css";

export default function MessageStatusButton({ id, status }: { id: string; status: ContactSubmissionStatus }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  return <span>
    <button className={styles.actionButton} disabled={pending} onClick={() => {
      setError("");
      startTransition(async () => {
        const result = await updateContactStatusAction(id, status);
        if (!result.success) { setError("Could not update status. Try again."); return; }
        router.refresh();
      });
    }} type="button">{pending ? "Saving…" : `Mark ${status}`}</button>
    {error && <span className={styles.inlineError} role="alert">{error}</span>}
  </span>;
}
