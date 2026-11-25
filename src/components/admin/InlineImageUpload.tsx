"use client";

import { useRef, useState } from "react";
import styles from "./AdminShell.module.css";

export type UploadedImage = { id: string; url: string; filename: string; mimeType: string; width?: number | null; height?: number | null; altText?: string | null };

export default function InlineImageUpload({ onUploaded }: { onUploaded: (media: UploadedImage) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  async function upload() {
    if (!selectedFile) return;
    setBusy(true); setMessage("Uploading…");
    try {
      const form = new FormData();
      form.set("category", "images"); form.set("file", selectedFile); form.set("altText", "");
      const response = await fetch("/api/admin/media/upload", { method: "POST", body: form });
      const result = await response.json() as { success?: boolean; error?: string; media?: UploadedImage };
      if (!response.ok || !result.media) { setMessage(uploadError(result.error)); return; }
      onUploaded(result.media);
      setMessage("Uploaded and selected.");
      setSelectedFile(null);
    } catch {
      setMessage("Upload failed. Check your connection and try again.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return <span className={styles.inlineImageUpload}>
    <input ref={inputRef} accept="image/jpeg,image/png,image/webp,image/avif,image/gif" aria-label="Choose image to upload" className={styles.visuallyHiddenInput} disabled={busy} type="file" onChange={(event) => { setSelectedFile(event.currentTarget.files?.[0] ?? null); setMessage(""); }} />
    <button className={styles.actionButton} disabled={busy} type="button" onClick={() => inputRef.current?.click()}>Choose image</button>
    {selectedFile && <small className={styles.selectedUploadFile}>{selectedFile.name} · {(selectedFile.size / 1024 / 1024).toFixed(1)} MB</small>}
    <button className={styles.saveButton} disabled={busy || !selectedFile} type="button" onClick={() => void upload()}>{busy ? "Uploading…" : "Upload"}</button>
    {message && <small aria-live="polite" role="status">{message}</small>}
  </span>;
}

function uploadError(error?: string) {
  if (error === "UNAUTHORIZED") return "Admin access is required to upload.";
  if (error === "FILE_TOO_LARGE") return "Image exceeds the upload size limit.";
  if (error === "INVALID_ALT_TEXT") return "Image metadata was incomplete. Please retry the upload.";
  if (error === "STORAGE_NOT_CONFIGURED") return "Media storage is not configured.";
  if (error === "UNSUPPORTED_FILE_TYPE" || error === "FILE_CONTENT_MISMATCH") return "Choose a supported image file.";
  return "Upload failed. Check the image and try again.";
}
