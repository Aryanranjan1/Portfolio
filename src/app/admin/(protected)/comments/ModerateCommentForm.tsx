"use client";

import { useFormStatus } from "react-dom";
import { moderateCommentAction } from "./actions";
import styles from "@/components/admin/AdminShell.module.css";

function SubmitButton({ status }: { status: "approved" | "rejected" }) {
  const { pending } = useFormStatus();
  const label = status === "approved" ? "Approve" : "Reject";
  return <button className={styles.actionButton} disabled={pending} type="submit">{pending ? `${label}ing…` : label}</button>;
}

export default function ModerateCommentForm({ id, status }: { id: string; status: "approved" | "rejected" }) {
  return <form action={moderateCommentAction}><input name="id" type="hidden" value={id} /><input name="status" type="hidden" value={status} /><SubmitButton status={status} /></form>;
}
