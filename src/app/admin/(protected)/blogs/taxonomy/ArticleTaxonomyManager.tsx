"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { createArticleCategoryAction, createTagAction, deleteArticleCategoryAction, deleteTagAction, updateArticleCategoryAction, updateTagAction } from "../actions";
import type { getAdminArticleTaxonomies } from "@/db/queries/admin";
import styles from "@/components/admin/AdminShell.module.css";

type Data = Awaited<ReturnType<typeof getAdminArticleTaxonomies>>;
export default function ArticleTaxonomyManager({ data }: { data: Data }) {
  const router = useRouter(); const [pending, startTransition] = useTransition(); const [message, setMessage] = useState("");
  function submit(event: FormEvent<HTMLFormElement>, action: (value: unknown) => Promise<{ success: boolean; error?: string }>, id?: string) { event.preventDefault(); const payload = Object.fromEntries(new FormData(event.currentTarget).entries()); startTransition(async () => { const result = await action({ ...payload, ...(id ? { id } : {}) }); setMessage(result.success ? "Taxonomy saved." : `Could not save taxonomy (${result.error}).`); if (result.success) router.refresh(); }); }
  function remove(action: (id: string) => Promise<{ success: boolean; error?: string }>, id: string, name: string) { if (!window.confirm(`Delete “${name}”?`)) return; startTransition(async () => { const result = await action(id); setMessage(result.success ? "Taxonomy deleted." : `Could not delete taxonomy (${result.error}).`); if (result.success) router.refresh(); }); }
  return <div className={styles.managerStack}>
    <section className={styles.settingsSection}><header className={styles.managerHeading}><h2>Article categories</h2><p>Categories used by articles cannot be deleted.</p></header>
      <form className={styles.managerCard} onSubmit={(e) => submit(e, createArticleCategoryAction)}><h3>Add category</h3><Fields /><button className={styles.saveButton} disabled={pending}>Create category</button></form>
      {data.categories.map((row) => <form className={styles.managerCard} key={row.id} onSubmit={(e) => submit(e, updateArticleCategoryAction, row.id)}><h3>{row.name} <small>· used by {row.usage} articles</small></h3><Fields row={row} description /><div className={styles.managerActions}><button className={styles.actionButton} disabled={pending}>Save</button><button className={styles.actionButton} disabled={pending || row.usage > 0} onClick={(e) => { e.preventDefault(); remove(deleteArticleCategoryAction, row.id, row.name); }} type="button">{row.usage ? `In use (${row.usage})` : "Delete"}</button></div></form>)}
    </section>
    <section className={styles.settingsSection}><header className={styles.managerHeading}><h2>Tags</h2><p>Tags assigned to articles cannot be deleted.</p></header>
      <form className={styles.managerCard} onSubmit={(e) => submit(e, createTagAction)}><h3>Add tag</h3><Fields /><button className={styles.saveButton} disabled={pending}>Create tag</button></form>
      {data.tags.map((row) => <form className={styles.managerCard} key={row.id} onSubmit={(e) => submit(e, updateTagAction, row.id)}><h3>{row.name} <small>· used by {row.usage} articles</small></h3><Fields row={row} /><div className={styles.managerActions}><button className={styles.actionButton} disabled={pending}>Save</button><button className={styles.actionButton} disabled={pending || row.usage > 0} onClick={(e) => { e.preventDefault(); remove(deleteTagAction, row.id, row.name); }} type="button">{row.usage ? `In use (${row.usage})` : "Delete"}</button></div></form>)}
    </section>{message && <p aria-live="polite" role="status">{message}</p>}
  </div>;
}
function Fields({ row, description = false }: { row?: { name: string; slug: string; description?: string | null }; description?: boolean }) { return <div className={styles.settingsGrid}><Field label="Name" name="name" value={row?.name} required /><Field label="Slug" name="slug" value={row?.slug} required />{description && <Field label="Description" name="description" value={row?.description ?? ""} />}</div>; }
function Field({ label, name, value = "", required = false }: { label: string; name: string; value?: string; required?: boolean }) { return <label className={styles.field}><span>{label}</span><input defaultValue={value} maxLength={name === "description" ? 1000 : 100} name={name} required={required} /></label>; }
