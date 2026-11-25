"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import type { Certificate } from "@/lib/convex/queries/site";
import styles from "./Certifications.module.css";

function monthLabel(value: string) {
  const [year, month] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(year, month - 1, 1)));
}

function DateRange({ item }: { item: Certificate }) {
  if (item.startDate && item.endDate) return <><time dateTime={item.startDate}>{monthLabel(item.startDate)}</time> – <time dateTime={item.endDate}>{monthLabel(item.endDate)}</time></>;
  const date = item.endDate || item.startDate;
  return date ? <time dateTime={date}>{monthLabel(date)}</time> : null;
}

function sortDate(item: Certificate) { return item.endDate || item.startDate || ""; }

export default function CertificationsCarousel({ certificates }: { certificates: Certificate[] }) {
  const track = useRef<HTMLUListElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const [category, setCategory] = useState("All");
  const [newest, setNewest] = useState(true);
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(4);
  const [activeCertificate, setActiveCertificate] = useState<Certificate | null>(null);
  const categories = useMemo(() => [...new Set(certificates.map((item) => item.category))].sort((a, b) => a.localeCompare(b)), [certificates]);
  const visible = useMemo(() => certificates
    .filter((item) => category === "All" || item.category === category)
    .slice()
    .sort((a, b) => {
      const aDate = sortDate(a), bDate = sortDate(b);
      if (!aDate && !bDate) return a.sortOrder - b.sortOrder;
      if (!aDate) return 1;
      if (!bDate) return -1;
      return (newest ? bDate.localeCompare(aDate) : aDate.localeCompare(bDate)) || a.sortOrder - b.sortOrder;
    }), [certificates, category, newest]);
  const total = Math.max(1, Math.ceil(visible.length / perPage));

  const go = useCallback((nextPage: number) => {
    const list = track.current;
    if (!list) return;
    const pageIndex = Math.max(0, Math.min(total - 1, nextPage));
    const first = list.querySelector<HTMLElement>(`[data-slide-index="${pageIndex * perPage}"]`);
    if (!first) { setPage(pageIndex); return; }
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const left = first.getBoundingClientRect().left - list.getBoundingClientRect().left + list.scrollLeft;
    list.scrollTo({ left, behavior: reduceMotion ? "auto" : "smooth" });
    setPage(pageIndex);
  }, [perPage, total]);

  useEffect(() => {
    const update = () => {
      const width = window.innerWidth;
      setPerPage(width <= 520 ? 1 : width <= 760 ? 2 : width <= 1000 ? 3 : 4);
      setPage(0);
      if (track.current) track.current.scrollLeft = 0;
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    const list = track.current;
    if (!list) return;
    const updatePage = () => {
      const step = list.querySelector<HTMLElement>("[data-slide-index='1']")?.offsetLeft;
      const first = list.querySelector<HTMLElement>("[data-slide-index='0']")?.offsetLeft ?? 0;
      if (!step || !perPage) { setPage(0); return; }
      const max = list.scrollWidth - list.clientWidth;
      const next = max > 0 && list.scrollLeft >= max - 2 ? total - 1 : Math.round(list.scrollLeft / ((step - first) * perPage));
      setPage(Math.max(0, Math.min(total - 1, next)));
    };
    list.addEventListener("scroll", updatePage, { passive: true });
    return () => list.removeEventListener("scroll", updatePage);
  }, [perPage, total]);

  useEffect(() => { if (page >= total) go(total - 1); }, [go, page, total]);

  useEffect(() => {
    if (!activeCertificate || !dialog.current || dialog.current.open) return;
    dialog.current.showModal();
    closeButton.current?.focus();
  }, [activeCertificate]);

  return <>
    <div className={styles.tools}>
      <div className={styles.filters} role="group" aria-label="Filter certificates by category">
        {["All", ...categories].map((name) => <button key={name} type="button" aria-pressed={category === name} onClick={() => { setCategory(name); setPage(0); if (track.current) track.current.scrollLeft = 0; }}>{name}<sup>{name === "All" ? certificates.length : certificates.filter((item) => item.category === name).length}</sup></button>)}
      </div>
      <button type="button" className={styles.sort} aria-label={`Sort certificates ${newest ? "newest first" : "oldest first"}`} onClick={() => { setNewest((value) => !value); setPage(0); if (track.current) track.current.scrollLeft = 0; }}>{newest ? "Newest first ↓" : "Oldest first ↑"}</button>
    </div>
    <ul className={styles.grid} ref={track} tabIndex={0} aria-label="Certificates, use the arrow buttons or swipe to change page" onKeyDown={(event) => { if (event.key === "ArrowRight") { event.preventDefault(); go(page + 1); } if (event.key === "ArrowLeft") { event.preventDefault(); go(page - 1); } }}>
      {visible.map((item, index) => <li className={styles.slide} data-slide-index={index} key={item.id}>
        <article className={styles.card}>
          <a className={styles.cardLink} href={item.pdfUrl!} target="_blank" rel="noopener noreferrer" aria-label={`Open PDF certificate: ${item.title}`}>
            <span className={styles.frame}><Image src={item.imageUrl!} alt={item.imageAlt ?? "Certificate image"} width={item.imageWidth ?? 800} height={item.imageHeight ?? 600} loading="lazy" unoptimized /><span className={styles.view} aria-hidden="true">VIEW CERTIFICATE ↗</span></span>
            <span className={styles.title}>{item.title}</span>
            <span className={styles.issuer}>{item.issuer}</span>
            <span className={styles.foot}><span className={styles.date}><DateRange item={item} /></span><span className={styles.tag}>{item.category}</span></span>
          </a>
          <button className={styles.detailsLink} type="button" aria-haspopup="dialog" onClick={() => setActiveCertificate(item)}>Details ↗<span className={styles.srOnly}> for {item.title}</span></button>
        </article>
      </li>)}
    </ul>
    <nav className={styles.nav} aria-label="Certificate pages">
      <div className={styles.pages}>{Array.from({ length: total }, (_, index) => <button key={index} type="button" aria-label={`Page ${index + 1}`} aria-current={page === index ? "page" : undefined} onClick={() => go(index)}>{String(index + 1).padStart(2, "0")}</button>)}</div>
      <p className={styles.status} aria-live="polite">Page {page + 1} of {total} · {visible.length} certificates</p>
      <div className={styles.arrows}><button type="button" aria-label="Previous page" disabled={page === 0} onClick={() => go(page - 1)}>←</button><button type="button" aria-label="Next page" disabled={page >= total - 1} onClick={() => go(page + 1)}>→</button></div>
    </nav>
    {activeCertificate && <dialog
      className={styles.dialog}
      ref={dialog}
      aria-labelledby="certificate-dialog-title"
      onClose={() => setActiveCertificate(null)}
      onClick={(event) => { if (event.target === dialog.current) dialog.current?.close(); }}
    >
      <div className={styles.dialogHeader}>
        <p>Certificate details</p>
        <button ref={closeButton} className={styles.closeButton} type="button" onClick={() => dialog.current?.close()} aria-label="Close certificate details">×</button>
      </div>
      <div className={styles.dialogContent}>
        <div className={styles.dialogImage}><Image src={activeCertificate.imageUrl!} alt={activeCertificate.imageAlt ?? `Certificate image for ${activeCertificate.title}`} width={activeCertificate.imageWidth ?? 800} height={activeCertificate.imageHeight ?? 600} unoptimized /></div>
        <div className={styles.detailBody}>
          <h3 id="certificate-dialog-title">{activeCertificate.title}</h3>
          <p><strong>Issuer:</strong> {activeCertificate.issuer}</p>
          <p><strong>Category:</strong> {activeCertificate.category}</p>
          {(activeCertificate.startDate || activeCertificate.endDate) && <p><strong>Date:</strong> <DateRange item={activeCertificate} /></p>}
          {activeCertificate.description && <p>{activeCertificate.description}</p>}
          {activeCertificate.credentialId && <p><strong>Credential ID:</strong> {activeCertificate.credentialId}</p>}
          {activeCertificate.skills.length > 0 && <p><strong>Skills:</strong> {activeCertificate.skills.join(", ")}</p>}
          <p className={styles.detailLinks}>
            <a href={activeCertificate.pdfUrl!} target="_blank" rel="noopener noreferrer">Open certificate PDF ↗</a>
            {activeCertificate.credentialUrl && <a href={activeCertificate.credentialUrl} target="_blank" rel="noopener noreferrer">Verify credential ↗</a>}
          </p>
        </div>
      </div>
    </dialog>}
  </>;
}
