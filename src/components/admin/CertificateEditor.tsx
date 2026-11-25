"use client";

import { useState, useTransition, type ChangeEvent, type DragEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { AdminCertificate } from "@/lib/convex/queries/admin";
import { saveCertificateAction } from "@/app/admin/(protected)/certificates/actions";
import styles from "./CertificateEditor.module.css";

type Props = { certificate: AdminCertificate | null; nextSortOrder: number };
type Upload = { url: string; storageId: string; width?: number; height?: number; size: number; fileName: string; mimeType: string };
type Draft = { title: string; slug: string; issuer: string; category: string; description: string; startDate: string; endDate: string; credentialId: string; credentialUrl: string; skills: string; image: Upload | null; imageAlt: string; pdf: Upload | null; sortOrder: string; status: "draft" | "published"; isSample: boolean };

function initialDraft(certificate: AdminCertificate | null, nextSortOrder: number): Draft {
  return {
    title: certificate?.title ?? "", slug: certificate?.slug ?? "", issuer: certificate?.issuer ?? "", category: certificate?.category ?? "",
    description: certificate?.description ?? "", startDate: certificate?.startDate ?? "", endDate: certificate?.endDate ?? "",
    credentialId: certificate?.credentialId ?? "", credentialUrl: certificate?.credentialUrl ?? "", skills: certificate?.skills.join(", ") ?? "",
    image: certificate?.imageUrl && certificate.imageStorageId ? { url: certificate.imageUrl, storageId: certificate.imageStorageId, width: certificate.imageWidth ?? undefined, height: certificate.imageHeight ?? undefined, size: 0, fileName: "Current image", mimeType: "image/webp" } : null,
    imageAlt: certificate?.imageAlt ?? "", pdf: certificate?.pdfUrl && certificate.pdfStorageId ? { url: certificate.pdfUrl, storageId: certificate.pdfStorageId, size: certificate.pdfSize ?? 0, fileName: certificate.pdfName ?? "Current certificate PDF", mimeType: "application/pdf" } : null,
    sortOrder: String(certificate?.sortOrder ?? nextSortOrder), status: certificate?.status ?? "draft", isSample: certificate?.isSample ?? false,
  };
}

function slugify(value: string) { return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }

export default function CertificateEditor({ certificate, nextSortOrder }: Props) {
  const router = useRouter();
  const [draft, setDraft] = useState(() => initialDraft(certificate, nextSortOrder));
  const [slugEdited, setSlugEdited] = useState(Boolean(certificate));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState<"image" | "pdf" | null>(null);
  const [progress, setProgress] = useState(0);
  const [pending, startTransition] = useTransition();
  const busy = pending || uploading !== null;

  function patch<K extends keyof Draft>(key: K, value: Draft[K]) { setDraft((current) => ({ ...current, [key]: value })); setErrors((current) => ({ ...current, [key]: "" })); }
  function titleChanged(event: ChangeEvent<HTMLInputElement>) {
    const title = event.target.value;
    setDraft((current) => ({ ...current, title, ...(!slugEdited ? { slug: slugify(title) } : {}) }));
    setErrors((current) => ({ ...current, title: "" }));
  }

  async function upload(kind: "image" | "pdf", file: File) {
    const max = kind === "image" ? 5 * 1024 * 1024 : 10 * 1024 * 1024;
    const allowed = kind === "image" ? ["image/jpeg", "image/png", "image/webp"] : ["application/pdf"];
    const key = kind === "image" ? "imageUrl" : "pdfUrl";
    if (!allowed.includes(file.type)) { setErrors((current) => ({ ...current, [key]: kind === "image" ? "Choose a JPG, PNG, or WebP image." : "Choose a PDF file." })); return; }
    if (file.size > max) { setErrors((current) => ({ ...current, [key]: `File exceeds the ${kind === "image" ? "5 MB" : "10 MB"} limit.` })); return; }
    setErrors((current) => ({ ...current, [key]: "" })); setMessage(""); setUploading(kind); setProgress(0);
    try {
      const token = await fetch("/api/admin/certificates/upload-token", { method: "POST", cache: "no-store" });
      const tokenData = await token.json() as { uploadUrl?: string; error?: string };
      if (!token.ok || !tokenData.uploadUrl) throw new Error(tokenData.error ?? "Could not authorize the upload.");
      const uploaded = await directUpload(tokenData.uploadUrl, file, (value) => setProgress(value));
      const verified = await fetch("/api/admin/certificates/verify-upload", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ storageId: uploaded.storageId, kind }), cache: "no-store" });
      const result = await verified.json() as { storageId?: string; url?: string; size?: number; width?: number; height?: number; mimeType?: string; error?: string };
      if (!verified.ok || !result.storageId || !result.url || !result.size || !result.mimeType) throw new Error(result.error ?? "The uploaded file could not be verified.");
      const asset: Upload = { storageId: result.storageId, url: result.url, size: result.size, width: result.width, height: result.height, fileName: file.name, mimeType: result.mimeType };
      if (kind === "image") patch("image", asset); else patch("pdf", asset);
      setMessage(`${kind === "image" ? "Image" : "PDF"} uploaded and verified.`);
    } catch (error) {
      setErrors((current) => ({ ...current, [key]: error instanceof Error ? error.message : "Upload failed. Try again." }));
    } finally { setUploading(null); setProgress(0); }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const nextErrors: Record<string, string> = {};
    if (draft.endDate && draft.startDate && draft.endDate < draft.startDate) nextErrors.endDate = "End date cannot be earlier than start date.";
    if (draft.status === "published") {
      if (!draft.image) nextErrors.imageUrl = "An image is required before publishing.";
      else if (!draft.image.width || !draft.image.height) nextErrors.imageUrl = "The image dimensions could not be read. Upload it again.";
      if (!draft.imageAlt.trim()) nextErrors.imageAlt = "Image alt text is required before publishing.";
      if (!draft.pdf || !draft.pdf.size) nextErrors.pdfUrl = "A verified PDF is required before publishing.";
    }
    if (Object.keys(nextErrors).length) { setErrors(nextErrors); return; }
    setErrors({}); setMessage("");
    const input = {
      ...draft, skills: draft.skills.split(",").map((skill) => skill.trim()).filter(Boolean),
      sortOrder: Number(draft.sortOrder),
      imageUrl: draft.image?.url ?? null, imageStorageId: draft.image?.storageId ?? null,
      imageWidth: draft.image?.width ?? null, imageHeight: draft.image?.height ?? null,
      pdfUrl: draft.pdf?.url ?? null, pdfStorageId: draft.pdf?.storageId ?? null, pdfSize: draft.pdf?.size ?? null,
      pdfName: draft.pdf?.fileName ?? null,
    };
    startTransition(async () => {
      const result = await saveCertificateAction(certificate?.id ?? null, input);
      if (!result.success) { setErrors(result.fieldErrors ?? {}); setMessage(result.error === "CONFLICT" ? "Resolve the slug error and save again." : "Could not save this certificate. Review the fields and try again."); return; }
      router.push("/admin/certificates"); router.refresh();
    });
  }

  function fileInput(kind: "image" | "pdf", event: ChangeEvent<HTMLInputElement>) { const file = event.target.files?.[0]; if (file) void upload(kind, file); event.currentTarget.value = ""; }
  function drop(kind: "image" | "pdf", event: DragEvent<HTMLLabelElement>) { event.preventDefault(); const file = event.dataTransfer.files[0]; if (file) void upload(kind, file); }
  const fieldError = (name: string) => errors[name] ? <small className={styles.fieldError} role="alert">{errors[name]}</small> : null;

  return <form className={styles.form} onSubmit={submit} noValidate>
    <div className={styles.formHeader}><div><p className={styles.eyebrow}>Certificates</p><h1>{certificate ? "Edit certificate" : "Create certificate"}</h1></div><Link href="/admin/certificates">Back to list</Link></div>
    <div className={styles.grid}>
      <label className={styles.field}><span>Title</span><input value={draft.title} onChange={titleChanged} maxLength={200} required aria-invalid={Boolean(errors.title)} />{fieldError("title")}</label>
      <label className={styles.field}><span>Slug</span><input value={draft.slug} onChange={(event) => { setSlugEdited(true); patch("slug", event.target.value.toLowerCase()); }} maxLength={200} required aria-invalid={Boolean(errors.slug)} />{fieldError("slug")}</label>
      <label className={styles.field}><span>Issuer</span><input value={draft.issuer} onChange={(event) => patch("issuer", event.target.value)} maxLength={200} required aria-invalid={Boolean(errors.issuer)} />{fieldError("issuer")}</label>
      <label className={styles.field}><span>Category</span><input value={draft.category} onChange={(event) => patch("category", event.target.value)} maxLength={100} required placeholder="Backend" aria-invalid={Boolean(errors.category)} />{fieldError("category")}</label>
      <label className={styles.field}><span>Start date (month)</span><input type="month" value={draft.startDate} onChange={(event) => patch("startDate", event.target.value)} />{fieldError("startDate")}</label>
      <label className={styles.field}><span>End date (month)</span><input type="month" value={draft.endDate} onChange={(event) => patch("endDate", event.target.value)} />{fieldError("endDate")}</label>
      <label className={`${styles.field} ${styles.full}`}><span>Description</span><textarea value={draft.description} onChange={(event) => patch("description", event.target.value)} rows={4} maxLength={5000} />{fieldError("description")}</label>
      <label className={styles.field}><span>Credential ID (optional)</span><input value={draft.credentialId} onChange={(event) => patch("credentialId", event.target.value)} maxLength={300} /></label>
      <label className={styles.field}><span>Verification URL (optional)</span><input type="url" value={draft.credentialUrl} onChange={(event) => patch("credentialUrl", event.target.value)} maxLength={2048} />{fieldError("credentialUrl")}</label>
      <label className={styles.field}><span>Skills (comma separated)</span><input value={draft.skills} onChange={(event) => patch("skills", event.target.value)} placeholder="APIs, Databases" />{fieldError("skills")}</label>
      <label className={styles.field}><span>Sort order</span><input type="number" min={0} step={1} value={draft.sortOrder} onChange={(event) => patch("sortOrder", event.target.value)} />{fieldError("sortOrder")}</label>
      <div className={`${styles.field} ${styles.full}`}><span>Certificate image (JPG, PNG, or WebP · max 5 MB)</span>
        {draft.image && <div className={styles.preview}><Image src={draft.image.url} alt="" width={draft.image.width ?? 800} height={draft.image.height ?? 600} unoptimized /><span>{draft.image.fileName}{draft.image.size ? ` · ${(draft.image.size / 1024 / 1024).toFixed(2)} MB` : ""}</span><button type="button" onClick={() => patch("image", null)}>Remove image</button></div>}
        <label className={styles.dropzone} onDragOver={(event) => event.preventDefault()} onDrop={(event) => drop("image", event)}><span>Drop an image here or choose a file</span><input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={(event) => fileInput("image", event)} /></label>
        {uploading === "image" && <progress value={progress} max={100} aria-label="Image upload progress" />}{fieldError("imageUrl")}
      </div>
      <label className={`${styles.field} ${styles.full}`}><span>Image alt text</span><input value={draft.imageAlt} onChange={(event) => patch("imageAlt", event.target.value)} maxLength={1000} aria-invalid={Boolean(errors.imageAlt)} />{fieldError("imageAlt")}</label>
      <div className={`${styles.field} ${styles.full}`}><span>Certificate PDF (max 10 MB)</span>
        {draft.pdf && <div className={styles.preview}><span>{draft.pdf.fileName}{draft.pdf.size ? ` · ${(draft.pdf.size / 1024 / 1024).toFixed(2)} MB` : ""}</span><a href={draft.pdf.url} target="_blank" rel="noopener noreferrer">Preview PDF ↗</a><button type="button" onClick={() => patch("pdf", null)}>Remove PDF</button></div>}
        <label className={styles.dropzone} onDragOver={(event) => event.preventDefault()} onDrop={(event) => drop("pdf", event)}><span>Drop a PDF here or choose a file</span><input type="file" accept="application/pdf,.pdf" disabled={busy} onChange={(event) => fileInput("pdf", event)} /></label>
        {uploading === "pdf" && <progress value={progress} max={100} aria-label="PDF upload progress" />}{fieldError("pdfUrl")}
      </div>
      <label className={styles.field}><span>Status</span><select value={draft.status} onChange={(event) => patch("status", event.target.value as Draft["status"])}><option value="draft">Draft</option><option value="published">Published</option></select>{fieldError("status")}</label>
      <label className={styles.check}><input type="checkbox" checked={draft.isSample} onChange={(event) => patch("isSample", event.target.checked)} /> Sample record (never included in public output)</label>
    </div>
    {message && <p className={styles.message} role="status">{message}</p>}
    <div className={styles.actions}><button type="submit" disabled={busy}>{pending ? "Saving…" : "Save certificate"}</button><Link href="/admin/certificates">Cancel</Link></div>
  </form>;
}

function directUpload(url: string, file: File, onProgress: (value: number) => void) {
  return new Promise<{ storageId: string }>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("POST", url);
    request.setRequestHeader("Content-Type", file.type);
    request.upload.onprogress = (event) => { if (event.lengthComputable) onProgress(Math.round(event.loaded / event.total * 100)); };
    request.onerror = () => reject(new Error("Upload failed. Check your connection."));
    request.onload = () => {
      if (request.status < 200 || request.status >= 300) { reject(new Error("Storage rejected this upload.")); return; }
      try { const value = JSON.parse(request.responseText) as { storageId?: string }; if (!value.storageId) throw new Error(); resolve({ storageId: value.storageId }); }
      catch { reject(new Error("Storage returned an invalid upload response.")); }
    };
    request.send(file);
  });
}
