"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { AdminCertificate } from "@/lib/convex/queries/admin";
import { deleteCertificateAction, reorderCertificatesAction } from "@/app/admin/(protected)/certificates/actions";
import styles from "./CertificatesManager.module.css";

export default function CertificatesManager({ certificates }: { certificates: AdminCertificate[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  function reorder(index: number, offset: number) {
    const next = [...certificates];
    const destination = index + offset;
    if (destination < 0 || destination >= next.length) return;
    [next[index], next[destination]] = [next[destination], next[index]];
    startTransition(async () => { const result = await reorderCertificatesAction(next.map((item) => item.id)); setMessage(result.success ? "Certificate order saved." : "Could not save certificate order."); if (result.success) router.refresh(); });
  }
  function remove(certificate: AdminCertificate) {
    if (!window.confirm(`Delete “${certificate.title}” and its image and PDF?`)) return;
    startTransition(async () => { const result = await deleteCertificateAction(certificate.id); setMessage(result.success ? "Certificate deleted." : "Could not delete this certificate."); if (result.success) router.refresh(); });
  }
  return <>
    <header className={styles.header}><div><p className={styles.eyebrow}>Content management</p><h1>Certificates</h1><p>Manage drafts, publications, files, and display order.</p></div><Link className={styles.primary} href="/admin/certificates/new">Create certificate</Link></header>
    {message && <p className={styles.message} role="status">{message}</p>}
    {certificates.length === 0 ? <section className={styles.empty}><h2>No certificates yet</h2><p>Create a draft, add its image and PDF, then publish it when ready.</p><Link href="/admin/certificates/new">Create a certificate →</Link></section> : <ol className={styles.list}>
      {certificates.map((certificate, index) => <li className={styles.row} key={certificate.id}>
        <div className={styles.thumb}>{certificate.imageUrl ? <Image src={certificate.imageUrl} alt="" width={120} height={90} unoptimized /> : <span>No image</span>}</div>
        <div className={styles.body}><h2>{certificate.title}</h2><p>{certificate.issuer} · {certificate.category}</p><span className={`${styles.status} ${certificate.status === "published" ? styles.published : ""}`}>{certificate.status}{certificate.isSample ? " · sample" : ""}</span></div>
        <div className={styles.controls}><button type="button" aria-label={`Move ${certificate.title} up`} disabled={pending || index === 0} onClick={() => reorder(index, -1)}>↑</button><button type="button" aria-label={`Move ${certificate.title} down`} disabled={pending || index === certificates.length - 1} onClick={() => reorder(index, 1)}>↓</button><Link href={`/admin/certificates/${certificate.id}`}>Edit</Link><button type="button" disabled={pending} onClick={() => remove(certificate)}>Delete</button></div>
      </li>)}
    </ol>}
  </>;
}
