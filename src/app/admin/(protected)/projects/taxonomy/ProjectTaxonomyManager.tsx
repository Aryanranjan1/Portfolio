"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { createProjectCategoryAction, createTechnologyAction, deleteProjectCategoryAction, deleteTechnologyAction, updateProjectCategoryAction, updateTechnologyAction } from "../actions";
import type { getAdminProjectTaxonomies } from "@/db/queries/admin";
import styles from "@/components/admin/AdminShell.module.css";

type Data = Awaited<ReturnType<typeof getAdminProjectTaxonomies>>;
export default function ProjectTaxonomyManager({ data }: { data: Data }) {
  const router = useRouter(); const [pending, startTransition] = useTransition(); const [message, setMessage] = useState("");
  function submit(event: FormEvent<HTMLFormElement>, action: (value: unknown) => Promise<{ success: boolean; error?: string }>, id?: string) {
    event.preventDefault(); const form = new FormData(event.currentTarget); const payload = Object.fromEntries(form.entries());
    startTransition(async () => { const result = await action({ ...payload, ...(id ? { id } : {}) }); setMessage(result.success ? "Taxonomy saved." : `Could not save taxonomy (${result.error}).`); if (result.success) router.refresh(); });
  }
  function remove(action: (id: string) => Promise<{ success: boolean; error?: string }>, id: string, name: string) { if (!window.confirm(`Delete “${name}”?`)) return; startTransition(async () => { const result = await action(id); setMessage(result.success ? "Taxonomy deleted." : `Could not delete taxonomy (${result.error}).`); if (result.success) router.refresh(); }); }
  return <div className={styles.managerStack}>
    <section className={styles.settingsSection}><header className={styles.managerHeading}><h2>Project categories</h2><p>Records assigned to projects cannot be deleted. Usage counts are shown below.</p></header>
      <form className={styles.managerCard} onSubmit={(e) => submit(e, createProjectCategoryAction)}><h3>Add category</h3><TaxonomyFields /><button className={styles.saveButton} disabled={pending}>Create category</button></form>
      {data.categories.map((row) => <form className={styles.managerCard} key={row.id} onSubmit={(e) => submit(e, updateProjectCategoryAction, row.id)}><h3>{row.name} <small>· used by {row.usage} projects</small></h3><TaxonomyFields row={row} /><div className={styles.managerActions}><button className={styles.actionButton} disabled={pending}>Save</button><button className={styles.actionButton} disabled={pending || row.usage > 0} onClick={(e) => { e.preventDefault(); remove(deleteProjectCategoryAction, row.id, row.name); }} type="button">{row.usage ? `In use (${row.usage})` : "Delete"}</button></div></form>)}
    </section>
    <section className={styles.settingsSection}><header className={styles.managerHeading}><h2>Technologies</h2><p>Technologies assigned to projects cannot be deleted.</p></header>
      <form className={styles.managerCard} onSubmit={(e) => submit(e, createTechnologyAction)}><h3>Add technology</h3><TaxonomyFields technology /><button className={styles.saveButton} disabled={pending}>Create technology</button></form>
      {data.technologies.map((row) => <form className={styles.managerCard} key={row.id} onSubmit={(e) => submit(e, updateTechnologyAction, row.id)}><h3>{row.name} <small>· used by {row.usage} projects</small></h3><TaxonomyFields row={row} technology /><div className={styles.managerActions}><button className={styles.actionButton} disabled={pending}>Save</button><button className={styles.actionButton} disabled={pending || row.usage > 0} onClick={(e) => { e.preventDefault(); remove(deleteTechnologyAction, row.id, row.name); }} type="button">{row.usage ? `In use (${row.usage})` : "Delete"}</button></div></form>)}
    </section>{message && <p aria-live="polite" role="status">{message}</p>}
  </div>;
}
function TaxonomyFields({ row, technology = false }: { row?: { name: string; slug: string; description?: string | null; websiteUrl?: string | null; iconMediaId?: string | null }; technology?: boolean }) {
  return <div className={styles.settingsGrid}><Field label="Name" name="name" value={row?.name} required /><Field label="Slug" name="slug" value={row?.slug} required /><Field label="Description" name="description" value={row?.description ?? ""} />{technology && <><Field label="Website URL" name="websiteUrl" value={row?.websiteUrl ?? ""} type="url" /><Field label="Icon media ID" name="iconMediaId" value={row?.iconMediaId ?? ""} /></>}</div>;
}
function Field({ label, name, value = "", required = false, type = "text" }: { label: string; name: string; value?: string; required?: boolean; type?: string }) { return <label className={styles.field}><span>{label}</span><input defaultValue={value} maxLength={name === "description" ? 1000 : 100} name={name} required={required} type={type} /></label>; }
