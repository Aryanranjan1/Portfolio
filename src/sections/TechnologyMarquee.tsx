import Image from "next/image";
import styles from "./TechnologyMarquee.module.css";

type Technology = { id: string; label: string; logoUrl: string | null };

export default function TechnologyMarquee({ technologies, theme, inset = false }: { technologies: Technology[]; theme: "dark" | "light"; inset?: boolean }) {
  return (
    <div className={`${styles.marquee} ${theme === "dark" ? styles.dark : styles.light} ${inset ? styles.inset : ""}`} role="group" aria-label="Technology">
      <div className={styles.track}>
        {Array.from({ length: 4 }, (_, group) => (
          <div className={styles.group} key={group} aria-hidden={group > 0}>
            {technologies.map((item) => (
              <span className={styles.brand} key={`${group}-${item.id}`}>
                {item.logoUrl && <Image className={styles.brandImage} src={item.logoUrl} alt="" width={24} height={24} unoptimized />}
                <span className={styles.brandName}>{item.label}</span>
              </span>
            ))}
          </div>
        ))}
      </div>
      <span className={`${styles.fade} ${styles.fadeLeft}`} aria-hidden="true" />
      <span className={`${styles.fade} ${styles.fadeRight}`} aria-hidden="true" />
    </div>
  );
}
