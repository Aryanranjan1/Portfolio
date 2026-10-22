import IntroVideo from "@/sections/IntroVideo";
import ScrollReveal from "@/components/ScrollReveal";
import type { AboutProfile } from "@/lib/about/get-about-content";
import styles from "./IntroSection.module.css";

const INTRO_CONTENT = {
  sectionLabel: { prefix: "//", text: "ABOUT ME" },
  title: { mutedLines: ["turning ideas", "into useful things."] },
  meta: { index: "02", items: ["IDEAS", "CODE", "DISCIPLINE", "FREEDOM"] },
  quote: { lines: ["Same", "curiosity.", "Higher", "standards."] },
  identity: { items: ["DEVELOPER", "LEARNER", "BUILDER"], separator: "//" },
  poster: "/intro.webp",
} as const;

export default function IntroSection({ profile, year }: { profile: AboutProfile; year: number }) {
  return (
    <section id="about" aria-labelledby="intro-title" className={styles.section}>
      <div className={styles.inner}>
        <ScrollReveal />

        <div className={`${styles.topline} ${styles.reveal}`} data-scroll-reveal>
          <div className={styles.toplineLabel}>
            <span aria-hidden="true">{INTRO_CONTENT.sectionLabel.prefix}</span>
            {INTRO_CONTENT.sectionLabel.text}
          </div>
          <div aria-hidden="true" className={styles.toplineRule} />
        </div>

        <figure aria-hidden="true" className={styles.art}>
          <IntroVideo
            src="/intro.webm"
            fallbackPoster={INTRO_CONTENT.poster}
            fallbackSizes="(max-width: 760px) calc(100vw - 40px), (max-width: 1050px) 58vw, 66vw"
            fallbackQuality={60}
            className={styles.video}
          />
          <div className={styles.vignette} />
        </figure>

        <div className={`${styles.copy} ${styles.reveal}`} data-scroll-reveal>
          <h2 id="intro-title" className={styles.title}>
            {profile.professionalTitle}<br />
            {INTRO_CONTENT.title.mutedLines.map((line) => (
              <span key={line} className={styles.mutedLine}>{line}<br /></span>
            ))}
          </h2>
          <div aria-hidden="true" className={styles.divider} />
          <p className={styles.description}>{profile.shortDescription}</p>
        </div>

        <aside className={`${styles.meta} ${styles.reveal}`} data-scroll-reveal>
          <div className={styles.metaIndex}>{INTRO_CONTENT.meta.index}</div>
          <div className={styles.metaList}>
            {INTRO_CONTENT.meta.items.map((item) => <span key={item}>{item}</span>)}
          </div>
          <div aria-hidden="true" className={styles.metaDash} />
        </aside>

        <span aria-hidden="true" data-scroll-reveal className={`${styles.dot} ${styles.dotOne}`} />
        <span aria-hidden="true" data-scroll-reveal className={`${styles.dot} ${styles.dotTwo}`} />
        <span aria-hidden="true" className={styles.plus}>
          <span /><span />
        </span>

        <div className={`${styles.location} ${styles.reveal}`} data-scroll-reveal>
          <div className={styles.desktopLocation}>{profile.location.toUpperCase()}</div>
          <div className={styles.mobileLocation}>KOLKATA, WEST BENGAL, INDIA</div>
          <div>{`// ${year}`}</div>
        </div>

        <div className={`${styles.quote} ${styles.reveal}`} data-scroll-reveal>
          {INTRO_CONTENT.quote.lines.map((line) => <span key={line}>{line}<br /></span>)}
          <div aria-hidden="true" className={styles.quoteDash} />
        </div>

        <div className={`${styles.identity} ${styles.reveal}`} data-scroll-reveal>
          <span className={styles.bracket}>[</span>
          {INTRO_CONTENT.identity.items.map((item, index) => (
            <span key={item}>
              {item}
              {index < INTRO_CONTENT.identity.items.length - 1 && <span className={styles.slash}>{INTRO_CONTENT.identity.separator}</span>}
            </span>
          ))}
          <span className={styles.bracket}>]</span>
        </div>
      </div>
    </section>
  );
}
