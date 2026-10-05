"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import styles from "./AdminShell.module.css";

export default function MediaUploader() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setBusy(true);
    setMessage("Uploading…");
    try {
      const response = await fetch("/api/admin/media/upload", { method: "POST", body: new FormData(form) });
      const result = await response.json() as { success?: boolean; error?: string };
      if (!response.ok) {
        setMessage(uploadError(result.error));
        return;
      }
      form.reset();
      setMessage("Media uploaded.");
      router.refresh();
    } catch {
      setMessage("Upload failed. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return <form className={styles.uploadPanel} onSubmit={submit}>
    <h2>Upload media</h2>
    <p>Images: 10 MB · Videos: 50 MB · Documents: 20 MB · Resume and other: 10 MB.</p>
    <div className={styles.uploadFields}>
      <label className={styles.field}><span>Category</span><select name="category" required>
        <option value="images">Images</option><option value="videos">Videos</option><option value="documents">Documents</option><option value="resume">Resume</option><option value="other">Other</option>
      </select></label>
      <label className={styles.field}><span>File</span><input accept="image/jpeg,image/png,image/webp,image/avif,image/gif,video/mp4,video/webm,video/quicktime,application/pdf" name="file" required type="file" /></label>
      <label className={styles.field}><span>Alt text <span className={styles.subtle}>(leave blank for decorative media)</span></span><input maxLength={1000} name="altText" type="text" /></label>
      <button className={styles.saveButton} disabled={busy} type="submit">{busy ? "Uploading…" : "Upload"}</button>
    </div>
    <p aria-live="polite" className={styles.uploadMessage} role="status">{message}</p>
  </form>;
}

function uploadError(error?: string) {
  switch (error) {
    case "UNAUTHORIZED": return "Sign in as the administrator to upload media.";
    case "STORAGE_NOT_CONFIGURED": return "Supabase Storage is not configured on the server.";
    case "FILE_TOO_LARGE": return "This file exceeds the size limit for its category.";
    case "UNSUPPORTED_FILE_TYPE":
    case "FILE_CONTENT_MISMATCH": return "The file type is not supported or does not match its contents.";
    case "CATEGORY_MISMATCH": return "Choose a category that matches this file type.";
    default: return "The upload failed. Check the file and try again.";
  }
}
