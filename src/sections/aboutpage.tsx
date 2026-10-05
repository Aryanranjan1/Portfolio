import Image from "next/image";
import type { ReactNode } from "react";

import type { AboutContent } from "@/lib/about/get-about-content";

import styles from "./Aboutpage.module.css";
import TechnologyMarquee from "./TechnologyMarquee";
import SkillsAccordion from "./aboutpage-SkillsAccordion";
import ScrollReveal from "@/components/ScrollReveal";

const ABOUT_IMAGE = "/aboutBG.png";



type Props = {
  content: AboutContent;
  technologies?: { id: string; label: string; position: number; logoUrl: string | null }[];
  /** Rendered full-width between the journey and the philosophy strip. */
  children?: ReactNode;
};

export default function About({ content, technologies = [], children }: Props) {
  const { profile, currently, skillCategories, timeline } = content;

  const metaItems = [
    { label: "Location", value: profile.location },
    { label: "Education", value: profile.education },
    { label: "Interests", value: profile.interests },
  ].filter((item) => item.value);

  const stats = [
    { value: profile.yearsBuilding, label: "Years of building" },
    { value: profile.projectsCompleted, label: "Projects completed" },
    { value: profile.leetcodeSolved, label: "LeetCode problems solved" },
    { value: profile.learningHours, label: "Hours of learning" },
  ];

  return (
    <div className={styles.page}>
      {/* HERO — decorative composition */}
      <div className={styles.hero}>
        <Image
          className={`${styles.heroImage} public-hero-media-enter`}
          src={ABOUT_IMAGE}
          alt=""
          fill
          preload
          sizes="100vw"
        />

        <div className={styles.heroOverlay} aria-hidden="true" />

        <div className={styles.heroInner} aria-hidden="true">
          <div className={styles.heroLeft}>
            <div className={styles.heroIndex}>
              01 / 04
              <span className={styles.heroRule} />
            </div>

            <div className={styles.heroStack}>
              <span>CODE</span>
              <span>DESIGN</span>
              <span>AUTOMATE</span>
              <span>REPEAT</span>
            </div>

            <div className={styles.heroLeftBottom}>
              A MORE OPEN
              <br />
              TOMORROW.
            </div>
          </div>

          <div className={`${styles.heroSideCopy} ${styles.heroSideCopyLeft}`}>
            <strong>
              DISCIPLINE
              <br />
              CREATES
              <br />
              FREEDOM
            </strong>
          </div>

          <div className={styles.heroRight}>
            <div className={styles.heroDate}>
              {profile.location}
              <br />
              {`// ${content.year}`}
            </div>

            <div className={styles.heroScroll}>
              <span className={styles.heroScrollLabel}>SCROLL</span>
              <span className={styles.heroScrollLine} />
              <span className={styles.heroScrollDot} />
            </div>
          </div>

          <div className={`${styles.heroSideCopy} ${styles.heroSideCopyRight}`}>
            BETTER
            <br />
            SYSTEMS.
            <br />
            BRIGHTER
            <br />
            PEOPLE.
          </div>
        </div>
      </div>

      <div className={styles.main}>
        <ScrollReveal />
        {/* ABOUT */}
        <section className={styles.about} data-scroll-reveal aria-labelledby="about-title">
          <div className={styles.aboutMedia}>
            <Image
              className={styles.aboutMediaImage}
              src={ABOUT_IMAGE}
              alt=""
              fill
              sizes="(max-width: 600px) 100vw, (max-width: 900px) 30vw, 22vw"
            />

            <span className={styles.aboutMediaLabel} aria-hidden="true">
              {`// ${content.initials}`}
            </span>
          </div>

          <div className={styles.aboutCopy}>
            <div className={styles.sectionKicker} aria-hidden="true">
              {"// 002"}
            </div>

            <h1 className={styles.aboutTitle} id="about-title">
              WHO AM I?
            </h1>

            {profile.bio.split(/\n{2,}/).map((paragraph) => (
              <p key={paragraph} className={styles.aboutText}>
                {paragraph}
              </p>
            ))}

            <dl className={styles.aboutMeta}>
              {metaItems.map((item) => (
                <div key={item.label} className={styles.metaItem}>
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>

            <div className={styles.aboutNumbers}>
              {stats.map((stat) => (
                <div key={stat.label} className={styles.number}>
                  <strong>{stat.value}+</strong>
                  <span>{stat.label}</span>
                </div>
              ))}

              <p className={`${styles.number} ${styles.quoteNum}`}>
                “Consistency
                <br />
                compounds.”
              </p>
            </div>
          </div>

          <aside className={styles.current} aria-labelledby="current-heading">
            <h2 className={styles.currentTitle} id="current-heading">
              {"// Currently"}
            </h2>

            <ul className={styles.currentList}>
              {currently.items.map((item) => (
                <li key={item}>
                  {item}
                  <span className={styles.currentDot} aria-hidden="true" />
                </li>
              ))}
            </ul>

            <blockquote className={styles.quote}>{currently.quote}</blockquote>
          </aside>
        </section>

        {/* SKILLS */}
        <section className={styles.section} data-scroll-reveal aria-labelledby="skills-heading">
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle} id="skills-heading">
              {"// 004 \u00a0 SKILLS & TECHNOLOGIES"}
            </h2>

            <span className={styles.sectionAside} aria-hidden="true">
              ALWAYS LEARNING →
            </span>
          </div>

          <SkillsAccordion categories={skillCategories} />
        </section>

        <section className={styles.marqueeSection} aria-label="Technology">
          <TechnologyMarquee technologies={technologies} theme="light" />
        </section>

        {/* JOURNEY */}
        <section
          className={`${styles.section} ${styles.journey}`}
          data-scroll-reveal
          aria-labelledby="journey-heading"
        >
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle} id="journey-heading">
              {"// 005 \u00a0 MY JOURNEY"}
            </h2>

            <span className={styles.sectionAside} aria-hidden="true">
              A CONTINUOUS PROCESS →
            </span>
          </div>

          <div className={styles.timeline}>
            <ol className={styles.timelineTrack}>
              {timeline.map((entry) => (
                <li
                  key={entry.id}
                  className={`${styles.timelineItem} ${
                    entry.current ? styles.active : ""
                  }`}
                  aria-current={entry.current ? "step" : undefined}
                >
                  <div className={styles.timelineNode} aria-hidden="true" />
                  <div className={styles.timelineYear}>{entry.year}</div>
                  <h3 className={styles.timelineTitle}>{entry.title}</h3>
                  <div className={styles.timelineCopy}>{entry.description}</div>
                  <span className={styles.timelineTag}>{entry.tag}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </div>

      {/* Existing Projects + Blog sections (full-width, own styling) */}
      {children}

    </div>
  );
}
