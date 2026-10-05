"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setResumeMediaAction } from "@/app/admin/(protected)/settings/actions";
import styles from "./AdminShell.module.css";

type Resume = { id: string; filename: string; url: string; fileSizeBytes: number | null } | null;
const maxBytes = 10 * 1024 * 1024;

export default function ResumeSettingsManager({ initial }: { initial: Resume }) {
  const router = useRouter();
  const [resume, setResume] = useState(initial);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function upload() {
    if (!file) { setMessage("Choose a PDF to upload."); return; }
    if (file.type !== "application/pdf" || !file.name.toLowerCase().endsWith(".pdf")) { setMessage("Choose a PDF file."); return; }
    if (!file.size || file.size > maxBytes) { setMessage("The PDF must be 10 MB or smaller."); return; }
    setBusy(true); setMessage("Uploading resume…");
    try {
      const form = new FormData();
      form.set("category", "resume"); form.set("file", file); form.set("altText", "");
      const response = await fetch("/api/admin/media/upload", { method: "POST", body: form });
      const result = await response.json() as { error?: string; media?: Resume };
      if (!response.ok || !result.media) { setMessage(uploadError(result.error)); return; }
      const saved = await setResumeMediaAction(result.media.id);
      if (!saved.success) { setMessage(`Uploaded to Media Library, but could not make it the current resume (${saved.error}).`); return; }
      setResume(result.media); setFile(null);
      setMessage(saved.data.cleanupPending ? "Resume updated. Previous file cleanup is pending in Media Library." : "Resume updated.");
      router.refresh();
    } catch { setMessage("Upload failed. Check your connection and try again."); }
    finally { setBusy(false); }
  }

  async function remove() {
    setBusy(true); setMessage("");
    try {
      const result = await setResumeMediaAction(null);
      if (!result.success) { setMessage(`Could not remove resume (${result.error}).`); return; }
      setResume(null);
      setMessage(result.data.cleanupPending ? "Custom resume removed. Previous file cleanup is pending in Media Library." : "Custom resume removed. Resume is unavailable on the public site.");
      router.refresh();
    } catch {
      setMessage("Could not remove the resume. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return <section className={styles.settingsSection}>
    <header className={styles.managerHeading}><div><h2>Resume</h2><p>Manage the PDF used by the public Resume link and homepage section.</p></div></header>
    <div className={styles.defaultSocialImage}>
      <div className={styles.selectedSocialImage}>
        <div><strong>{resume ? "Custom resume configured" : "Resume unavailable"}</strong><small>{resume ? `${resume.filename} · ${formatSize(resume.fileSizeBytes)}` : "Upload a PDF to make the public Resume action available."}</small></div>
        {resume && <a href={resume.url} target="_blank" rel="noopener noreferrer">Preview current PDF</a>}
      </div>
      <div className={styles.uploadPanel}>
        <h2>{resume ? "Upload a replacement" : "Upload a resume"}</h2>
        <p>PDF only, up to 10 MB. The file is stored in Supabase Storage.</p>
        <label className={styles.field}>Resume PDF<input accept="application/pdf,.pdf" disabled={busy} onChange={(event) => setFile(event.target.files?.[0] ?? null)} type="file" /></label>
        {file && <p className={styles.uploadFileDetails}><strong>{file.name}</strong><span>{formatSize(file.size)}</span></p>}
        <div className={styles.rowActions}><button className={styles.saveButton} disabled={busy || !file} onClick={upload} type="button">{busy ? "Saving…" : resume ? "Upload and replace" : "Upload resume"}</button>{resume && <button className={styles.actionButton} disabled={busy} onClick={remove} type="button">Remove custom resume</button>}</div>
        <p aria-live="polite" className={styles.uploadMessage} role="status">{message}</p>
      </div>
    </div>
  </section>;
}

function formatSize(bytes: number | null) { return bytes === null ? "Size unavailable" : `${(bytes / (1024 * 1024)).toFixed(2)} MB`; }
function uploadError(code?: string) {
  if (code === "UNAUTHORIZED") return "You are not authorized to upload files.";
  if (code === "STORAGE_NOT_CONFIGURED") return "Supabase Storage is not configured on the server.";
  if (code === "FILE_TOO_LARGE") return "The PDF exceeds the 10 MB limit.";
  if (code === "UNSUPPORTED_FILE_TYPE" || code === "CATEGORY_MISMATCH" || code === "FILE_CONTENT_MISMATCH") return "The selected file is not a valid PDF.";
  return "Upload failed. Check Supabase Storage and try again.";
}
