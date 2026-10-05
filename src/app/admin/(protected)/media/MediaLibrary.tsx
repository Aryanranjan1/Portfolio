"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import type { getMediaLibrary, getMediaUsage } from "@/db/queries/media";
import { deleteMediaAction, updateMediaAltTextAction } from "./actions";
import shell from "@/components/admin/AdminShell.module.css";
import styles from "./MediaLibrary.module.css";

type MediaRows = Awaited<ReturnType<typeof getMediaLibrary>>;
type MediaDetails = NonNullable<Awaited<ReturnType<typeof getMediaUsage>>>;

export default function MediaLibrary({ items, details, selectedId }: { items: MediaRows; details: MediaDetails | null; selectedId: string | null }) {
  const [view, setView] = useState<"grid" | "list">("grid");
  return <>
    <div className={styles.libraryToolbar}>
      <p>{items.length} record{items.length === 1 ? "" : "s"}</p>
      <div aria-label="Media view" role="group">
        <button aria-pressed={view === "grid"} className={view === "grid" ? styles.selectedView : ""} onClick={() => setView("grid")} type="button">Grid</button>
        <button aria-pressed={view === "list"} className={view === "list" ? styles.selectedView : ""} onClick={() => setView("list")} type="button">List</button>
      </div>
    </div>
    {!items.length ? <section className={shell.statCard}>No media records found.</section> : view === "grid" ? <div className={styles.grid}>
      {items.map((item) => <Link aria-current={item.id === selectedId ? "page" : undefined} className={styles.card} href={`/admin/media?id=${item.id}`} key={item.id}>
        <MediaPreview mimeType={item.mimeType} url={item.url} alt={item.altText ?? ""} className={styles.preview} />
        <span className={styles.cardMeta}><strong>{item.filename}</strong><small>{item.mimeType} · {formatBytes(item.fileSizeBytes)}</small>{item.deletionPending && <small role="status">Storage deletion pending · open to retry</small>}</span>
      </Link>)}
    </div> : <div className={styles.list}>
      {items.map((item) => <Link aria-current={item.id === selectedId ? "page" : undefined} className={styles.listRow} href={`/admin/media?id=${item.id}`} key={item.id}>
        <MediaPreview mimeType={item.mimeType} url={item.url} alt={item.altText ?? ""} className={styles.listThumb} />
        <span className={styles.listInfo}><strong>{item.filename}</strong><small>{item.mimeType} · {formatBytes(item.fileSizeBytes)}{item.width && item.height ? ` · ${item.width} × ${item.height}` : ""}</small>{item.deletionPending && <small role="status">Storage deletion pending · open to retry</small>}</span>
        <time dateTime={item.createdAt.toISOString()}>{item.createdAt.toLocaleDateString()}</time>
      </Link>)}
    </div>}
    {details && <MediaDetailsDrawer details={details} />}
  </>;
}

function MediaPreview({ mimeType, url, alt, className }: { mimeType: string; url: string; alt: string; className: string }) {
  if (mimeType.startsWith("image/")) return <span className={className}><Image alt={alt} fill sizes="(max-width: 767px) 45vw, 260px" src={url} unoptimized /></span>;
  if (mimeType.startsWith("video/")) return <span className={`${className} ${styles.videoPreview}`}><video muted preload="metadata" src={url} /><span>VIDEO</span></span>;
  return <span className={`${className} ${styles.filePreview}`}><span aria-hidden="true">{mimeType === "application/pdf" ? "PDF" : "FILE"}</span></span>;
}

function MediaDetailsDrawer({ details }: { details: MediaDetails }) {
  const { item, usage } = details;
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  function saveAltText(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const altText = new FormData(event.currentTarget).get("altText");
    startTransition(async () => {
      const result = await updateMediaAltTextAction(item.id, altText);
      setMessage(result.success ? "Alt text saved." : describeError(result.error));
      if (result.success) router.refresh();
    });
  }

  function remove() {
    const references = usage.length ? `\n\nAffected references:\n${usage.map((reference) => `• ${reference.label} — ${reference.detail}`).join("\n")}` : "\n\nNo database references were found.";
    if (!window.confirm(`Delete “${item.filename}” from the library and Supabase Storage?${references}\n\nReferenced structured image blocks will be removed. This cannot be undone.`)) return;
    setMessage("");
    startTransition(async () => {
      const result = await deleteMediaAction(item.id);
      if (!result.success) { setMessage(describeError(result.error)); return; }
      router.push("/admin/media");
      router.refresh();
    });
  }

  return <div className={styles.overlay}>
    <Link aria-label="Close media details" className={styles.backdrop} href="/admin/media" />
    <aside aria-labelledby="media-detail-title" aria-modal="true" className={styles.drawer} role="dialog">
      <header className={styles.drawerHeader}><div><p className={styles.drawerEyebrow}>Media record</p><h2 id="media-detail-title">{item.filename}</h2></div><Link className={styles.close} href="/admin/media" aria-label="Close">×</Link></header>
      <div className={styles.drawerPreview}><MediaPreview mimeType={item.mimeType} url={item.url} alt={item.altText ?? ""} className={styles.detailPreview} /></div>
      {item.deletionPending && <p className={styles.feedback} role="status">Storage deletion is pending. References are already cleared; retry the delete action to finish cleanup.</p>}
      <dl className={styles.metadata}>
        <Meta label="Type" value={item.mimeType} /><Meta label="Size" value={formatBytes(item.fileSizeBytes)} />
        <Meta label="Width" value={item.width === null ? "Not available" : `${item.width} px`} />
        <Meta label="Height" value={item.height === null ? "Not available" : `${item.height} px`} />
        <Meta label="Created" value={item.createdAt.toLocaleString()} />
        <div><dt>URL</dt><dd><a href={item.url} rel="noreferrer" target="_blank">{item.url}</a></dd></div>
      </dl>
      {!item.deletionPending && <form className={styles.altForm} onSubmit={saveAltText}>
        <label className={shell.field}><span>Alt text</span><input defaultValue={item.altText ?? ""} maxLength={1000} name="altText" /></label>
        <button className={shell.actionButton} disabled={pending} type="submit">Save alt text</button>
      </form>}
      <section className={styles.usedBy}><h3>Used by · {usage.length}</h3>
        {usage.length ? <ul>{usage.map((reference, index) => <li key={`${reference.href}-${reference.detail}-${index}`}><Link href={reference.href}>{reference.label}</Link><span>{reference.detail}</span></li>)}</ul> : <p>No database references.</p>}
      </section>
      {message && <p className={styles.feedback} aria-live="polite" role="status">{message}</p>}
      <button className={styles.deleteButton} disabled={pending} onClick={remove} type="button">{pending ? "Working…" : item.deletionPending ? "Retry Storage deletion" : "Delete media and references"}</button>
    </aside>
  </div>;
}

function Meta({ label, value }: { label: string; value: string }) { return <div><dt>{label}</dt><dd>{value}</dd></div>; }
function formatBytes(bytes: number | null) {
  if (bytes === null) return "Unknown size";
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let size = bytes / 1024; let unit = units[0];
  for (let index = 1; size >= 1024 && index < units.length; index += 1) { size /= 1024; unit = units[index]; }
  return `${size.toFixed(1)} ${unit}`;
}
function describeError(error: string) {
  if (error === "STORAGE_DELETE_PENDING") return "The media references were removed, but the Storage object could not be deleted. Retry deletion here; the pending record keeps the object key for another attempt.";
  if (error === "UNAUTHORIZED" || error === "FORBIDDEN") return "Your administrator session is no longer authorized.";
  return `Operation failed (${error}).`;
}
