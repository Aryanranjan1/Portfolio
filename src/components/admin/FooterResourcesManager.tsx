"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { createFooterResourceAction, deleteFooterResourceAction, reorderFooterResourcesAction, updateFooterResourceAction } from "@/app/admin/(protected)/settings/actions";
import styles from "./AdminShell.module.css";

type Resource = { id: string; label: string; url: string; active: boolean; position: number };

export default function FooterResourcesManager({ initial }: { initial: Resource[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  async function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      const result = await createFooterResourceAction({ label, url, active: true, position: rows.length });
      setMessage(result.success ? "Resource added." : `Could not add resource (${result.error}).`);
      if (result.success) { setLabel(""); setUrl(""); router.refresh(); }
    });
  }
  function patchRow(id: string, value: Partial<Resource>) { setRows((current) => current.map((row) => row.id === id ? { ...row, ...value } : row)); }
  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= rows.length) return;
    setRows((current) => { const next = [...current]; [next[index], next[target]] = [next[target], next[index]]; return next.map((row, position) => ({ ...row, position })); });
  }
  function saveOrder() {
    startTransition(async () => {
      const result = await reorderFooterResourcesAction(rows.map((row, position) => ({ id: row.id, position })));
      setMessage(result.success ? "Resource order saved." : `Could not save order (${result.error}).`);
      if (result.success) router.refresh();
    });
  }

  return <div className={styles.managerStack}>
    <p className={styles.editorHelp}>Active resources appear in Footer → 03. RESOURCES, ordered by position. Internal paths and HTTP(S) URLs are supported.</p>
    <form className={styles.resourceCreate} onSubmit={add}>
      <label className={styles.field}><span>Label</span><input onChange={(event) => setLabel(event.target.value)} required value={label} /></label>
      <label className={styles.field}><span>URL</span><input onChange={(event) => setUrl(event.target.value)} placeholder="/resume or https://…" required value={url} /></label>
      <button className={styles.saveButton} disabled={pending} type="submit">Add resource</button>
    </form>
    {rows.length === 0 ? <p className={styles.dashboardEmpty}>No footer resources configured.</p> : <div className={styles.managerStack}>
      {rows.map((row, index) => <article className={styles.resourceRow} key={row.id}>
        <label className={styles.field}><span>Label</span><input onChange={(event) => patchRow(row.id, { label: event.target.value })} value={row.label} /></label>
        <label className={styles.field}><span>URL</span><input onChange={(event) => patchRow(row.id, { url: event.target.value })} value={row.url} /></label>
        <label className={styles.positionField}><span>Position</span><input min="0" onChange={(event) => patchRow(row.id, { position: Number(event.target.value) })} type="number" value={row.position} /></label>
        <label className={styles.checkField}><input checked={row.active} onChange={(event) => patchRow(row.id, { active: event.target.checked })} type="checkbox" /> Active</label>
        <div className={styles.rowActions}>
          <button aria-label={`Move ${row.label} up`} className={styles.actionButton} disabled={pending || index === 0} onClick={() => move(index, -1)} type="button">↑</button>
          <button aria-label={`Move ${row.label} down`} className={styles.actionButton} disabled={pending || index === rows.length - 1} onClick={() => move(index, 1)} type="button">↓</button>
          <button className={styles.actionButton} disabled={pending} onClick={() => startTransition(async () => { const result = await updateFooterResourceAction(row); setMessage(result.success ? "Resource saved." : `Could not save resource (${result.error}).`); if (result.success) router.refresh(); })} type="button">Save</button>
          <button className={styles.actionButton} disabled={pending} onClick={() => { if (!window.confirm(`Delete footer resource “${row.label}”?`)) return; startTransition(async () => { const result = await deleteFooterResourceAction(row.id); setMessage(result.success ? "Resource deleted." : `Could not delete resource (${result.error}).`); if (result.success) router.refresh(); }); }} type="button">Delete</button>
        </div>
      </article>)}
      <button className={styles.quickLink} disabled={pending} onClick={saveOrder} type="button">Save order</button>
    </div>}
    {message && <p aria-live="polite" className={styles.formMessage} role="status">{message}</p>}
  </div>;
}
