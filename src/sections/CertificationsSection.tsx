import type { Certificate } from "@/lib/convex/queries/site";
import CertificationsCarousel from "./CertificationsCarousel";
import styles from "./Certifications.module.css";

export default function CertificationsSection({ certificates }: { certificates: Certificate[] }) {
  if (!certificates.length) return null;
  return <section className={styles.section} id="certifications" aria-labelledby="certifications-heading">
    <div className={styles.wrap}>
      <header className={styles.bar}><h2 id="certifications-heading">{"// 005  CERTIFICATIONS"}</h2></header>
      <CertificationsCarousel certificates={certificates} />
    </div>
  </section>;
}
