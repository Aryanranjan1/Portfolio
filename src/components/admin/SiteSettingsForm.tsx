"use client";

import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { getSiteSettings } from "@/db/queries/site";
import { setDefaultSocialImageAction, updateSiteSettingsAction } from "@/app/admin/(protected)/settings/actions";
import styles from "./AdminShell.module.css";

type Settings = NonNullable<Awaited<ReturnType<typeof getSiteSettings>>>;
type SettingsGroup = "identity" | "about" | "seo";
type MediaChoice = { id: string; filename: string; url: string; mimeType: string; width: number | null; height: number | null; fileSizeBytes: number | null };

const textFields = [
  ["siteName", "Site name"], ["personName", "Person name"], ["professionalTitle", "Professional title"],
  ["shortDescription", "Short description"], ["bio", "Biography"], ["location", "Location"],
  ["education", "Education"], ["interests", "Interests"], ["availabilityStatus", "Availability status"],
  ["availabilityText", "Availability text"], ["primaryEmail", "Primary email"],
  ["siteDescription", "Site description"], ["canonicalOrigin", "Canonical origin URL"],
] as const;
const numberFields = [["yearsBuilding", "Years building"], ["projectsCompleted", "Projects completed"], ["leetcodeSolved", "LeetCode solved"], ["learningHours", "Learning hours"]] as const;
const visibleFields: Record<SettingsGroup, number[]> = { identity: [0, 1, 2, 10], about: [3, 4, 5, 6, 7, 8, 9], seo: [11, 12] };
const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"]);
const imageLimit = 10 * 1024 * 1024;

export default function SiteSettingsForm({ settings, media, group }: { settings: Settings; media: MediaChoice[]; group: SettingsGroup }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [mediaChoices, setMediaChoices] = useState(media);
  const [selectedImageId, setSelectedImageId] = useState(settings.defaultSocialImageId ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const visible = new Set(visibleFields[group]);
  const selectedImage = mediaChoices.find((item) => item.id === selectedImageId) ?? null;

  useEffect(() => () => { if (filePreview) URL.revokeObjectURL(filePreview); }, [filePreview]);

  function clearFieldError(name: string) {
    setFieldErrors((current) => { if (!(name in current)) return current; const next = { ...current }; delete next[name]; return next; });
    setMessage("");
  }

  function presentServerFieldErrors(errors: Record<string, string>) {
    setFieldErrors(errors);
    const firstName = Object.keys(errors)[0];
    if (!firstName) return;
    requestAnimationFrame(() => {
      const field = document.querySelector<HTMLElement>(`[name="${CSS.escape(firstName)}"]`);
      if (!field) return;
      field.setAttribute("aria-invalid", "true");
      const id = `settings-error-${firstName}`;
      field.setAttribute("aria-describedby", id);
      field.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
      field.focus({ preventScroll: true });
    });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setFieldErrors({});
    const form = new FormData(event.currentTarget);
    const value: Record<string, unknown> = {};
    for (const [key] of textFields) value[key] = form.get(key) || null;
    value.defaultSocialImageId = selectedImageId || null;
    for (const [key] of numberFields) value[key] = Number(form.get(key));
    try {
      const result = await updateSiteSettingsAction(value);
      if (result.success) {
        setMessage("Settings saved.");
        router.refresh();
      } else if (result.fieldErrors) {
        presentServerFieldErrors(result.fieldErrors);
        setMessage("Correct the fields marked below.");
      } else {
        setMessage(settingsError(result.error));
      }
    } catch {
      setMessage("Settings could not be saved. Try again.");
    } finally {
      setSaving(false);
    }
  }

  async function removeDefaultImage() {
    setUploading(true);
    setMessage("");
    try {
      const result = await setDefaultSocialImageAction(null);
      if (!result.success) { setMessage(settingsError(result.error)); return; }
      setSelectedImageId("");
      setMessage("Default social image removed.");
      router.refresh();
    } catch {
      setMessage("The default social image could not be removed. Try again.");
    } finally {
      setUploading(false);
    }
  }

  async function uploadDefaultImage() {
    if (!file) { setMessage("Please select an image."); return; }
    if (!allowedImageTypes.has(file.type)) { setMessage("Unsupported file type. Use JPEG, PNG, WebP, AVIF, or GIF."); return; }
    if (file.size > imageLimit) { setMessage("Image is too large. Maximum size is 10 MB."); return; }
    setUploading(true);
    setMessage("Uploading image…");
    try {
      const form = new FormData();
      form.set("category", "images");
      form.set("file", file);
      form.set("altText", "");
      const response = await fetch("/api/admin/media/upload", { method: "POST", body: form });
      const result = await response.json() as { error?: string; media?: MediaChoice };
      if (!response.ok || !result.media) { setMessage(uploadError(result.error)); return; }
      const uploadedMedia = result.media;
      setMediaChoices((current) => [uploadedMedia, ...current.filter((item) => item.id !== uploadedMedia.id)]);
      const saved = await setDefaultSocialImageAction(uploadedMedia.id);
      if (!saved.success) {
        setMessage(`The image uploaded to Media Library, but ${settingsError(saved.error).toLowerCase()}`);
        return;
      }
      setSelectedImageId(uploadedMedia.id);
      setFile(null);
      setFilePreview(null);
      setMessage(`Uploaded and selected ${uploadedMedia.filename}.`);
      router.refresh();
    } catch {
      setMessage("Upload failed. Check your connection and try again.");
    } finally {
      setUploading(false);
    }
  }

  return <form className={styles.settingsForm} noValidate onChange={(event) => { const target = event.target; if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) clearFieldError(target.name); }} onSubmit={submit}>
    {textFields.map(([key], index) => !visible.has(index) && <input key={key} name={key} type="hidden" value={settings[key] ?? ""} />)}
    {numberFields.map(([key]) => group !== "about" && <input key={key} name={key} type="hidden" value={settings[key]} />)}
    {group !== "seo" && <input name="defaultSocialImageId" type="hidden" value={selectedImageId} />}
    <section className={styles.settingsSection}>
      <h2>{group === "identity" ? "Identity" : group === "about" ? "Profile" : "Global SEO"}</h2>
      <div className={styles.settingsGrid}>
        {textFields.map(([key, label], index) => visible.has(index) && <label className={styles.field} key={key}>
          <span>{label}</span>
          {key === "bio" || key === "shortDescription" || key === "interests" || key === "availabilityText"
            ? <textarea aria-describedby={fieldErrors[key] ? `settings-error-${key}` : undefined} aria-invalid={fieldErrors[key] ? true : undefined} defaultValue={settings[key] ?? ""} maxLength={key === "bio" ? 5000 : undefined} name={key} rows={key === "bio" ? 5 : 3} />
            : <input aria-describedby={fieldErrors[key] ? `settings-error-${key}` : undefined} aria-invalid={fieldErrors[key] ? true : undefined} defaultValue={settings[key] ?? ""} name={key} type={key === "primaryEmail" ? "email" : key === "canonicalOrigin" ? "url" : "text"} />}
          {fieldErrors[key] && <small className={styles.settingsFieldError} id={`settings-error-${key}`} role="alert">{fieldErrors[key]}</small>}
        </label>)}
        {group === "seo" && <div className={styles.defaultSocialImage}>
          <div><h3>Default social image</h3><p>Used in Open Graph metadata when a page, article, or project has no image of its own.</p></div>
          {selectedImage ? <div className={styles.selectedSocialImage}>
            <Image alt="" className={styles.socialImagePreview} height={selectedImage.height || 240} src={selectedImage.url} unoptimized width={selectedImage.width || 480} />
            <div><strong>Current: {selectedImage.filename}</strong><small>{selectedImage.mimeType}{selectedImage.fileSizeBytes ? ` · ${formatSize(selectedImage.fileSizeBytes)}` : ""}</small><small>Selected as the global default</small></div>
          </div> : <p className={styles.dashboardEmpty}>No default social image is selected.</p>}
          <label className={styles.field}><span>Select existing Media</span><select aria-describedby={fieldErrors.defaultSocialImageId ? "settings-error-defaultSocialImageId" : undefined} aria-invalid={fieldErrors.defaultSocialImageId ? true : undefined} name="defaultSocialImageId" onChange={(event) => { setSelectedImageId(event.target.value); clearFieldError("defaultSocialImageId"); }} value={selectedImageId}><option value="">No default image</option>{mediaChoices.map((item) => <option key={item.id} value={item.id}>{item.filename}</option>)}</select>{fieldErrors.defaultSocialImageId && <small className={styles.settingsFieldError} id="settings-error-defaultSocialImageId" role="alert">{fieldErrors.defaultSocialImageId}</small>}</label>
          <div className={styles.rowActions}><button className={styles.actionButton} disabled={!selectedImageId || uploading} onClick={removeDefaultImage} type="button">Remove default image</button><button className={styles.saveButton} disabled={saving || uploading} type="submit">{saving ? "Saving…" : "Save image selection"}</button></div>
          <div className={styles.uploadPanel}>
            <h3>Upload new image</h3>
            <p>JPEG, PNG, WebP, AVIF, or GIF · maximum 10 MB. Uploads use the existing Media Library and Supabase Storage.</p>
            <label className={styles.field}><span>Image file</span><input accept="image/jpeg,image/png,image/webp,image/avif,image/gif" name="defaultSocialImageUpload" onChange={(event) => { const next = event.target.files?.[0] ?? null; setFile(next); setFilePreview(next && allowedImageTypes.has(next.type) ? URL.createObjectURL(next) : null); setMessage(""); }} type="file" /></label>
            {file && <div className={styles.uploadFileDetails}><strong>{file.name}</strong><span>{file.type || "Unknown file type"} · {formatSize(file.size)}</span>{filePreview && <Image alt="Selected upload preview" className={styles.socialImagePreview} height={240} src={filePreview} unoptimized width={480} />}</div>}
            <button className={styles.saveButton} disabled={uploading || saving} onClick={uploadDefaultImage} type="button">{uploading ? "Uploading and saving…" : "Upload and select image"}</button>
          </div>
        </div>}
        {group === "about" && numberFields.map(([key, label]) => <label className={styles.field} key={key}><span>{label}</span><input defaultValue={settings[key]} min="0" name={key} type="number" /></label>)}
      </div>
    </section>
    <div className={styles.formFooter}><button className={styles.saveButton} disabled={saving || uploading} type="submit">{saving ? "Saving…" : "Save settings"}</button><span aria-live="polite" role="status">{message}</span></div>
  </form>;
}

function formatSize(bytes: number) {
  return bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function settingsError(code: string) {
  if (code === "UNAUTHORIZED" || code === "FORBIDDEN") return "You are not authorized to perform this action.";
  if (code === "MEDIA_NOT_FOUND" || code === "NOT_FOUND") return "Selected media record no longer exists.";
  if (code === "DATABASE_ERROR") return "Could not update the default social image because the database operation failed.";
  if (code === "VALIDATION_ERROR") return "The settings contain invalid values. Correct the marked fields.";
  return "Could not update the default social image. Try again.";
}

function uploadError(code?: string) {
  switch (code) {
    case "UNAUTHORIZED": return "You are not authorized to upload media.";
    case "STORAGE_NOT_CONFIGURED": return "Supabase Storage is not configured on the server.";
    case "FILE_REQUIRED": return "Please select an image.";
    case "FILE_TOO_LARGE": return "Image is too large. Maximum size is 10 MB.";
    case "UNSUPPORTED_FILE_TYPE": return "Unsupported file type. Use JPEG, PNG, WebP, AVIF, or GIF.";
    case "FILE_CONTENT_MISMATCH": return "The file contents do not match the selected image file type.";
    case "STORAGE_UPLOAD_FAILED": return "Upload failed. Supabase Storage rejected the file.";
    case "MEDIA_RECORD_FAILED": return "Could not create the Media record.";
    case "DATABASE_ERROR": return "Could not create the Media record because the database operation failed.";
    case "INVALID_FORM_DATA": return "The upload form could not be read. Select the image again.";
    default: return "Upload failed unexpectedly. Please try again.";
  }
}
