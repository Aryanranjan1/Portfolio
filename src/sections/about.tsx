/* eslint-disable react/jsx-no-comment-textnodes */
import Image from "next/image";
import SkillsAccordion from "./SkillsAccordion";
import styles from "./About.module.css";
import { getAboutContent } from "@/lib/about/get-about-content";
import type { AboutContent } from "@/lib/about/get-about-content";

// Rendered 4x so the track is always wider than the container.
// The animation moves by -50%, which lands exactly on a repeat of the same logos.
const GROUP_COUNT = 4;

function LogoGroup({ items }: { items: { id: string; label: string; logoUrl: string | null }[] }) {
  return (
    <div className={styles.marqueeGroup} aria-hidden="true">
      {items.map((item) => {
        return (
        <span
          className={styles.brand}
          key={item.id}
          title={item.label}
        >
          {item.logoUrl && <Image className={styles.brandImage} src={item.logoUrl} alt="" width={24} height={24} unoptimized />}
          <span className={styles.brandName}>{item.label}</span>
        </span>
        );
      })}
    </div>
  );
}

export default async function About({ content: providedContent, technologies = [] }: { content?: AboutContent; technologies?: { id: string; label: string; logoUrl: string | null }[] } = {}) {
  const content = providedContent ?? await getAboutContent();
  return (
    <section
      className={styles.aboutSection}
      id="about"
      aria-labelledby="about-heading"
    >
      <div className={styles.container}>
        <div className={styles.body}>
          {/* LEFT RAIL */}
          <aside className={styles.rail}>
            <div className={styles.railMeta}>
              <span>
                <strong>02</strong>
              </span>

              <span>// ABOUT</span>
            </div>

            <div className={styles.railMain}>
              <div>
                <h2 className={styles.railHeading}>ABOUT</h2>

                <p className={styles.railDescription}>
                  {content.profile.shortDescription}
                </p>
              </div>

              <div className={styles.railBottom}>
                <div className={styles.railSystem}>
                  / BUILD
                  <br />
                  / LEARN
                  <br />
                  / AUTOMATE
                </div>

                <div className={styles.railMark}>
                  SAME
                  <br />
                  CURIOSITY
                  <br />
                  DIFFERENT
                  <br />
                  PROBLEMS
                </div>
              </div>
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <div className={styles.content}>
            {/* IMAGE + SKILLS */}
            <div className={styles.skillsUpper}>
              <div className={styles.personalMedia}>
                <div className={styles.mediaMeta}>// IDENTITY / 001</div>

                <figure className={styles.personalImage}>
                  <Image
                    src="/intro.png"
                    alt=""
                    fill
                    sizes="(max-width: 760px) 100vw, 50vw"
                    className={styles.image}
                  />

                  <span className={styles.imageLabel}>ABOUT / 001</span>
                </figure>
              </div>

              <SkillsAccordion categories={content.skillCategories} />
            </div>

            {/* ENGINEERING FOCUS */}
            <div className={styles.aboutPurpose}>
              <div className={styles.purposeCopy}>
                <p className={styles.purposeLabel}>// ENGINEERING FOCUS</p>

                <h2 className={styles.purposeTitle} id="about-heading">
                  BACKEND SYSTEMS
                  <span className={styles.muted}> &amp; AUTOMATION.</span>
                </h2>

                <p className={styles.purposeDescription}>{content.profile.bio}</p>

                <span className={styles.purposeIndex}>#002</span>
              </div>

              <figure className={styles.purposeVisual}>
                <Image
                  src="/intro.png"
                  alt=""
                  width={800}
                  height={640}
                  sizes="(max-width: 760px) 100vw, 30vw"
                  className={styles.stagImage}
                />
              </figure>
            </div>

            {/* MARQUEE */}
            <div
              className={styles.marquee}
              role="img"
              aria-label={`Technologies: ${technologies.map((item) => item.label).join(", ")}`}
            >
              <div className={styles.marqueeTrack}>
                {Array.from({ length: GROUP_COUNT }, (_, i) => (
                  <LogoGroup key={i} items={technologies} />
                ))}
              </div>

              <span
                className={`${styles.marqueeFade} ${styles.marqueeFadeLeft}`}
                aria-hidden="true"
              />

              <span
                className={`${styles.marqueeFade} ${styles.marqueeFadeRight}`}
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
