"use client";

import { useRef, useState } from "react";
import styles from "./About.module.css";
import type { AboutSkillCategory } from "@/lib/about/get-about-content";

export default function SkillsAccordion({ categories }: { categories: AboutSkillCategory[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [pinnedIndex, setPinnedIndex] = useState<number | null>(null);

  const pinnedRef = useRef<number | null>(null);

  const openCategory = (index: number) => {
    setOpenIndex(index);
  };

  const closeCategory = (index: number) => {
    if (pinnedRef.current === index) {
      return;
    }

    setOpenIndex((current) =>
      current === index ? null : current
    );
  };

  const toggleCategory = (index: number) => {
    const isOpen = openIndex === index;
    const isPinned = pinnedRef.current === index;

    if (isOpen && isPinned) {
      pinnedRef.current = null;
      setPinnedIndex(null);
      setOpenIndex(null);
      return;
    }

    pinnedRef.current = index;
    setPinnedIndex(index);
    setOpenIndex(index);
  };

  return (
    <section
      className={styles.skillsAccordion}
      aria-label="Technical skills"
    >
      <div className={styles.accordionMeta}>003</div>

      {categories.map((skill, index) => {
        const isOpen = openIndex === index;
        const isPinned = pinnedIndex === index;

        return (
          <article
            className={`${styles.skillCategory} ${
              isOpen ? styles.skillCategoryOpen : ""
            } ${isPinned ? styles.skillCategoryPinned : ""}`}
            key={skill.id}
            onMouseEnter={() => openCategory(index)}
            onMouseLeave={() => closeCategory(index)}
          >
            <button
              type="button"
              className={styles.skillHeader}
              aria-expanded={isOpen}
              aria-controls={`skill-details-${skill.id}`}
              onClick={() => toggleCategory(index)}
            >
              <span className={styles.skillNumber}>
                {String(index + 1).padStart(2, "0")}
              </span>

              <span className={styles.skillSummary}>
                <span className={styles.skillTitle}>
                  {skill.name}
                </span>

                <span className={styles.skillPreview}>
                  {skill.skills.map((item) => item.name).join(", ")}
                </span>
              </span>

              <span
                className={styles.skillButton}
                aria-hidden="true"
              >
                →
              </span>
            </button>

            <div
              id={`skill-details-${skill.id}`}
              className={styles.skillDetailsWrap}
              aria-hidden={!isOpen}
            >
              <div className={styles.skillDetails}>
                <div className={styles.skillDetailsInner}>
                  <div className={styles.skillDetailList}>
                    {skill.skills.map(({ id, name }) => (
                      <div
                        className={styles.skillDetailItem}
                        key={id}
                      >
                        <div className={styles.skillDetailName}>
                          {name}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}
