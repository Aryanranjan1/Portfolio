"use client";

import { useState } from "react";

import type { AboutSkillCategory } from "@/lib/about/get-about-content";

import styles from "./Aboutpage.module.css";

type Props = {
  categories: AboutSkillCategory[];
};

/**
 * Above 600px every category is always expanded (pure CSS). Below 600px
 * the categories collapse into a one-open-at-a-time accordion; the toggle
 * button only exists in that range (see .skillToggle in About.module.css).
 */
export default function SkillsAccordion({ categories }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className={styles.skillsGrid}>
      {categories.map((category, index) => {
        const isOpen = openId === category.id;
        const headingId = `skill-${category.slug}`;
        const panelId = `skill-${category.slug}-items`;

        return (
          <div
            key={category.id}
            className={`${styles.skillCol} ${isOpen ? styles.open : ""}`}
          >
            <div className={styles.skillNum} aria-hidden="true">
              {String(index + 1).padStart(2, "0")}.
            </div>

            <h3 className={styles.skillName} id={headingId}>
              {category.name}
            </h3>

            <ul className={styles.skillItems} id={panelId}>
              {category.skills.map((skill) => (
                <li key={skill.id}>{skill.name}</li>
              ))}
            </ul>

            <button
              type="button"
              className={styles.skillToggle}
              aria-expanded={isOpen}
              aria-controls={panelId}
              aria-labelledby={headingId}
              onClick={() => setOpenId(isOpen ? null : category.id)}
            />
          </div>
        );
      })}
    </div>
  );
}
