"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createContactMethodAction, deleteContactMethodAction, updateContactMethodAction } from "@/app/admin/(protected)/settings/actions";
import styles from "./AdminShell.module.css";
import { isConfiguredContact } from "@/lib/contact/is-configured-contact";

type Method = { id: string; type: string; label: string; value: string | null; url: string | null; position: number; active: boolean };
const types = ["email", "github", "linkedin", "x", "other"];

export default function ContactMethodsManager({ initial }: { initial: Method[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [urlErrors, setUrlErrors] = useState<Record<string, string>>({});

  function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await createContactMethodAction({ type: form.get("type"), label: form.get("label"), value: form.get("value") || null, url: form.get("url") || null, position: Number(form.get("position")), active: form.get("active") === "on" });
      setMessage(result.success ? "Contact method added." : contactMethodError(result.error));
      if (result.success) { setUrlErrors({}); formElement.reset(); router.refresh(); }
      else if (result.error === "INVALID_CONTACT_URL") setUrlErrors({ new: contactMethodError(result.error) });
    });
  }

  return <div className={styles.managerStack}>
      <p className={styles.editorHelp}>Public Contact and Footer links show only configured methods. For email, enter an address in Value; a mailto link is created when URL is blank. Example URLs and generic provider homepages remain filtered out.</p>
    <form className={styles.managerCard} onSubmit={create}>
      <h3>Add contact method</h3>
      <div className={styles.settingsGrid}>
        <label className={styles.field}><span>Type</span><select name="type">{types.map((type) => <option key={type} value={type}>{type}</option>)}</select></label>
        <Field label="Label" name="label" required />
        <Field label="Value" name="value" />
        <Field label="URL" name="url" error={urlErrors.new} onChange={() => { setMessage(""); setUrlErrors((current) => { const next={...current}; delete next.new; return next; }); }} placeholder="mailto:name@example.com or https://…" />
        <Field label="Position" name="position" type="number" defaultValue={String(Math.max(-1, ...initial.map((item) => item.position)) + 1)} />
      </div>
      <label className={styles.checkField}><input defaultChecked name="active" type="checkbox" /> Active</label>
      <button className={styles.saveButton} disabled={pending} type="submit">Add method</button>
    </form>
    {initial.map((row) => row.type === "location" ? <article className={styles.managerCard} key={row.id}><h3>{row.label} · legacy location</h3><p className={styles.editorHelp}>Unsupported contact method. Public location comes from Site Settings and this record is not consumed.</p><button className={styles.actionButton} disabled={pending} onClick={() => { if (!window.confirm(`Delete unused legacy location record “${row.label}”?`)) return; startTransition(async () => { const result = await deleteContactMethodAction(row.id); setMessage(result.success ? "Legacy location record deleted." : `Could not delete method (${result.error}).`); if (result.success) router.refresh(); }); }} type="button">Delete legacy record</button></article> : <form className={styles.managerCard} key={row.id} onSubmit={(event) => {
      event.preventDefault(); const form = new FormData(event.currentTarget);
      const payload = { id: row.id, type: form.get("type"), label: form.get("label"), value: form.get("value") || null, url: form.get("url") || null, position: Number(form.get("position")), active: form.get("active") === "on" };
      startTransition(async () => { const result = await updateContactMethodAction(payload); setMessage(result.success ? "Contact method saved." : contactMethodError(result.error)); if (result.success) { setUrlErrors((current) => { const next={...current}; delete next[row.id]; return next; }); router.refresh(); } else if (result.error === "INVALID_CONTACT_URL") setUrlErrors((current) => ({...current,[row.id]:contactMethodError(result.error)})); });
    }}>
      {row.active && !isConfiguredContact(row) && <p className={styles.inlineError} role="status">This active record is saved but excluded from public contact links. Enter a valid configured URL for its type.</p>}
      <div className={styles.settingsGrid}>
        <label className={styles.field}><span>Type</span><select defaultValue={row.type} name="type">{types.map((type) => <option key={type} value={type}>{type}</option>)}</select></label>
        <Field label="Label" name="label" required defaultValue={row.label} />
        <Field label="Value" name="value" defaultValue={row.value ?? ""} />
        <Field label="URL" name="url" defaultValue={row.url ?? ""} error={urlErrors[row.id]} onChange={() => { setMessage(""); setUrlErrors((current) => { const next={...current}; delete next[row.id]; return next; }); }} />
        <Field label="Position" name="position" type="number" defaultValue={String(row.position)} />
      </div>
      <div className={styles.managerActions}><label className={styles.checkField}><input defaultChecked={row.active} name="active" type="checkbox" /> Active</label><button className={styles.actionButton} disabled={pending} type="submit">Save</button><button className={styles.actionButton} disabled={pending} onClick={(event) => { event.preventDefault(); if (!window.confirm(`Delete contact method “${row.label}”?`)) return; startTransition(async () => { const result = await deleteContactMethodAction(row.id); setMessage(result.success ? "Contact method deleted." : `Could not delete method (${result.error}).`); if (result.success) router.refresh(); }); }} type="button">Delete</button></div>
    </form>)}
    {message && <p className={styles.formMessage} aria-live="polite" role="status">{message}</p>}
  </div>;
}

function Field({ label, name, defaultValue = "", required = false, type = "text", placeholder, error, onChange }: { label: string; name: string; defaultValue?: string; required?: boolean; type?: string; placeholder?: string; error?: string; onChange?: () => void }) {
  return <label className={styles.field} data-invalid={error ? "true" : undefined}><span>{label}</span><input aria-invalid={error ? true : undefined} defaultValue={defaultValue} name={name} onChange={onChange} placeholder={placeholder} required={required} type={type} />{error && <span className={styles.fieldError} role="alert">{error}</span>}</label>;
}

function contactMethodError(code: string) {
  if (code === "INVALID_CONTACT_URL") return "Could not save: use a valid mailto email or an HTTPS profile URL for the selected provider. Generic homepages and unrelated domains are not public profile links.";
  if (code === "CONFLICT") return "Could not save: this position is already used by another contact method.";
  if (code === "VALIDATION_ERROR") return "Could not save: check the contact type, label, email/URL, position, and active setting.";
  if (code === "UNAUTHORIZED" || code === "FORBIDDEN") return "Could not save: your admin session is no longer authorized.";
  return `Could not save contact method (${code}). Your entered values have been kept.`;
}
