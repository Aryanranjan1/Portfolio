"use client";

import { useState, useTransition } from "react";
import type { ActionResult } from "@/lib/actions/action-result";
import styles from "./AdminShell.module.css";

type Kind = "category" | "tag" | "technology";

export default function QuickCreateDialog({
  kind,
  create,
  onCreated,
}: {
  kind: Kind;
  create: (value: unknown) => Promise<ActionResult<{ id?: string }>>;
  onCreated: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  function changeName(value: string) {
    setName(value);
    if (!slugEdited) setSlug(toSlug(value));
  }

  function submit() {
    setMessage("");
    startTransition(async () => {
      const result = await create({ name, slug, description: kind === "tag" ? null : description.trim() || null });
      if (!result.success) {
        setMessage(result.error === "CONFLICT" ? "That name or slug already exists." : `Could not create ${kind} (${result.error}).`);
        return;
      }
      if (!result.data.id) {
        setMessage(`Created, but the new ${kind} could not be selected. Refresh the page to use it.`);
        return;
      }
      onCreated(result.data.id);
      setOpen(false);
      setName(""); setSlug(""); setSlugEdited(false);
      setDescription("");
    });
  }

  return <>
    <button className={styles.actionButton} type="button" onClick={() => { setMessage(""); setOpen(true); }}>+ Add {kind}</button>
    {open && <div className={styles.quickCreateBackdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !pending) setOpen(false); }}>
      <section aria-labelledby={`quick-create-${kind}`} aria-modal="true" className={styles.quickCreateDialog} role="dialog">
        <header className={styles.managerHeading}><h2 id={`quick-create-${kind}`}>Add {kind}</h2><button className={styles.actionButton} disabled={pending} type="button" onClick={() => setOpen(false)}>Close</button></header>
        <label className={styles.field}><span>Name</span><input autoFocus maxLength={100} value={name} onChange={(event) => changeName(event.target.value)} /></label>
        <label className={styles.field}><span>Slug</span><input maxLength={100} value={slug} onChange={(event) => { setSlugEdited(true); setSlug(toSlug(event.target.value)); }} /></label>
        {kind === "category" && <label className={styles.field}><span>Description</span><textarea maxLength={1000} required rows={3} value={description} onChange={(event) => setDescription(event.target.value)} /></label>}
        {message && <p className={styles.formMessage} role="status">{message}</p>}
        <div className={styles.managerActions}><button className={styles.saveButton} disabled={pending || !name.trim() || !slug.trim() || (kind === "category" && !description.trim())} type="button" onClick={submit}>{pending ? "Adding…" : `Add ${kind}`}</button><button className={styles.quickLink} disabled={pending} type="button" onClick={() => setOpen(false)}>Cancel</button></div>
      </section>
    </div>}
  </>;
}

function toSlug(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
