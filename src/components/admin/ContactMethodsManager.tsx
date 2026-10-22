"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createContactMethodAction, deleteContactMethodAction, updateContactMethodAction } from "@/app/admin/(protected)/settings/actions";
import styles from "./AdminShell.module.css";
import { isConfiguredContact } from "@/lib/contact/is-configured-contact";

type Method = { id: string; type: string; label: string; value: string | null; url: string | null; position: number; active: boolean; iconMode?: "built_in" | "uploaded"; iconName?: string | null; iconMediaId?: string | null };
type ImageAsset = { id: string; filename: string; mimeType: string; url: string };
const types = ["email", "github", "linkedin", "x", "threads", "instagram", "youtube", "other"];
const iconNames = ["email", "github", "linkedin", "x", "threads", "instagram", "youtube", "other"];

export default function ContactMethodsManager({ initial, images }: { initial: Method[]; images: ImageAsset[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [urlErrors, setUrlErrors] = useState<Record<string, string>>({});
  const [newFormVersion, setNewFormVersion] = useState(0);

  function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await createContactMethodAction({ type: form.get("type"), label: form.get("label"), value: form.get("value") || null, url: form.get("url") || null, position: Number(form.get("position")), active: form.get("active") === "on", iconMode: form.get("iconMode"), iconName: form.get("iconName"), iconMediaId: form.get("iconMediaId") });
      setMessage(result.success ? "Contact method added." : contactMethodError(result.error));
      if (result.success) { setUrlErrors({}); formElement.reset(); setNewFormVersion((version) => version + 1); router.refresh(); }
      else if (result.error === "INVALID_CONTACT_URL") setUrlErrors({ new: contactMethodError(result.error) });
    });
  }

  return <div className={styles.managerStack}>
      <p className={styles.editorHelp}>Public Contact and Footer links show only configured methods. For email, enter an address in Value; a mailto link is created when URL is blank. Example URLs and generic provider homepages remain filtered out.</p>
    <form className={styles.managerCard} key={newFormVersion} onSubmit={create}>
      <h3>Add contact method</h3>
      <div className={styles.settingsGrid}>
        <label className={styles.field}><span>Type</span><select name="type">{types.map((type) => <option key={type} value={type}>{type}</option>)}</select></label>
        <Field label="Label" name="label" required />
        <Field label="Value" name="value" />
        <Field label="URL" name="url" error={urlErrors.new} onChange={() => { setMessage(""); setUrlErrors((current) => { const next={...current}; delete next.new; return next; }); }} placeholder="mailto:name@example.com or https://…" />
        <Field label="Position" name="position" type="number" defaultValue={String(Math.max(-1, ...initial.map((item) => item.position)) + 1)} />
      </div>
      <IconConfigFields images={images} />
      <label className={styles.checkField}><input defaultChecked name="active" type="checkbox" /> Active</label>
      <button className={styles.saveButton} disabled={pending} type="submit">Add method</button>
    </form>
    {initial.map((row) => row.type === "location" ? <article className={styles.managerCard} key={row.id}><h3>{row.label} · legacy location</h3><p className={styles.editorHelp}>Unsupported contact method. Public location comes from Site Settings and this record is not consumed.</p><button className={styles.actionButton} disabled={pending} onClick={() => { if (!window.confirm(`Delete unused legacy location record “${row.label}”?`)) return; startTransition(async () => { const result = await deleteContactMethodAction(row.id); setMessage(result.success ? "Legacy location record deleted." : `Could not delete method (${result.error}).`); if (result.success) router.refresh(); }); }} type="button">Delete legacy record</button></article> : <form className={styles.managerCard} key={`${row.id}:${row.iconMode ?? "built_in"}:${row.iconName ?? ""}:${row.iconMediaId ?? ""}`} onSubmit={(event) => {
      event.preventDefault(); const form = new FormData(event.currentTarget);
      const payload = { id: row.id, type: form.get("type"), label: form.get("label"), value: form.get("value") || null, url: form.get("url") || null, position: Number(form.get("position")), active: form.get("active") === "on", iconMode: form.get("iconMode"), iconName: form.get("iconName"), iconMediaId: form.get("iconMediaId") };
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
      <IconConfigFields images={images} mode={row.iconMode ?? "built_in"} iconName={row.iconName ?? row.type} mediaId={row.iconMediaId ?? ""} />
      <div className={styles.managerActions}><label className={styles.checkField}><input defaultChecked={row.active} name="active" type="checkbox" /> Active</label><button className={styles.actionButton} disabled={pending} type="submit">Save</button><button className={styles.actionButton} disabled={pending} onClick={(event) => { event.preventDefault(); if (!window.confirm(`Delete contact method “${row.label}”?`)) return; startTransition(async () => { const result = await deleteContactMethodAction(row.id); setMessage(result.success ? "Contact method deleted." : `Could not delete method (${result.error}).`); if (result.success) router.refresh(); }); }} type="button">Delete</button></div>
    </form>)}
    {message && <p className={styles.formMessage} aria-live="polite" role="status">{message}</p>}
  </div>;
}

function IconConfigFields({ images, mode: initialMode = "built_in", iconName: initialIconName = "email", mediaId: initialMediaId = "", }: { images: ImageAsset[]; mode?: "built_in" | "uploaded"; iconName?: string; mediaId?: string }) {
  const [mode, setMode] = useState(initialMode);
  const [iconName, setIconName] = useState(iconNames.includes(initialIconName) ? initialIconName : "other");
  const [mediaId, setMediaId] = useState(initialMediaId);
  const [assets, setAssets] = useState(images.filter((image) => image.mimeType.startsWith("image/")));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function upload(file?: File) {
    if (!file) return;
    setBusy(true);
    setMessage("Uploading and optimizing image…");
    try {
      const form = new FormData();
      form.set("file", file);
      form.set("category", "images");
      form.set("altText", "");
      const response = await fetch("/api/admin/media/upload", { method: "POST", body: form });
      const result = await response.json() as { error?: string; media?: ImageAsset };
      if (!response.ok || !result.media) { setMessage(uploadError(result.error)); return; }
      setAssets((current) => [result.media!, ...current.filter((asset) => asset.id !== result.media!.id)]);
      setMediaId(result.media.id);
      setMode("uploaded");
      setMessage(`Uploaded ${result.media.filename}. Save this contact method to apply it.`);
    } catch {
      setMessage("Upload failed. Check the file and try again.");
    } finally {
      setBusy(false);
    }
  }

  return <fieldset className={styles.settingsSection} style={{ margin: 0, padding: 16 }}><legend>Contact page icon</legend>
    <input name="iconMode" type="hidden" value={mode} />
    <label className={styles.field}><span>Icon source</span><select value={mode} onChange={(event) => setMode(event.target.value as "built_in" | "uploaded")}><option value="built_in">Built-in icon</option><option value="uploaded">Uploaded image</option></select></label>
    {mode === "built_in" ? <label className={styles.field}><span>Built-in icon</span><select name="iconName" value={iconName} onChange={(event) => setIconName(event.target.value)}>{iconNames.map((name) => <option key={name} value={name}>{name}</option>)}</select></label> : <>
      <input name="iconName" type="hidden" value="" />
      <label className={styles.field}><span>Uploaded image from Media Library</span><select name="iconMediaId" required value={mediaId} onChange={(event) => setMediaId(event.target.value)}><option value="">Choose an image</option>{assets.map((asset) => <option key={asset.id} value={asset.id}>{asset.filename}</option>)}</select></label>
      <label className={styles.field}><span>Upload a new icon image</span><input accept="image/jpeg,image/png,image/webp,image/avif,image/gif" disabled={busy} onChange={(event) => { void upload(event.currentTarget.files?.[0]); event.currentTarget.value = ""; }} type="file" /></label>
      {mediaId && assets.find((asset) => asset.id === mediaId) && <p className={styles.editorHelp}>Selected: {assets.find((asset) => asset.id === mediaId)?.filename}</p>}
    </>}
    <p aria-live="polite" className={styles.editorHelp} role="status">{message}</p>
  </fieldset>;
}

function uploadError(error?: string) {
  if (error === "UNAUTHORIZED") return "Your admin session is no longer authorized to upload.";
  if (error === "FILE_TOO_LARGE") return "Choose an image smaller than 10 MB.";
  if (["UNSUPPORTED_FILE_TYPE", "FILE_CONTENT_MISMATCH", "CATEGORY_MISMATCH"].includes(error ?? "")) return "Choose a valid PNG, JPEG, WebP, AVIF, or GIF image.";
  return "The image upload failed. Check the file and try again.";
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
