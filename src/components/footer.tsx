import Image from "next/image";
import Link from "next/link";
import { DM_Mono, Space_Grotesk } from "next/font/google";

import styles from "./Footer.module.css";
import { getFooterContent } from "@/lib/footer/get-footer-content";
import ScrollReveal from "@/components/ScrollReveal";
import { applicationAssets } from "@/lib/application-assets";
import FooterSocialLinks from "@/components/FooterSocialLinks";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

const decorativeText = {
  year: "// 2026",
  item: "// 009",
  worldwide: "// Working worldwide.",
};

export default async function Footer() {
  const content = await getFooterContent();
  return (
    <footer
      id="site-footer"
      className={`${styles["site-footer"]} ${spaceGrotesk.variable} ${dmMono.variable}`}
    >
      <ScrollReveal />
      <section className={styles["footer-hero"]} data-scroll-reveal>
        <div className={styles["footer-hero-inner"]}>
          <div
            className={styles["hero-technical-line"]}
            aria-hidden="true"
          />

          <div
            className={styles["desktop-bottom-detail"]}
            aria-hidden="true"
          >
            <span>BUILD</span>
            <span>DESIGN</span>
            <span>DEPLOY</span>
            <span>ITERATE</span>
          </div>

          <div
            className={styles["responsive-bottom-detail"]}
            aria-hidden="true"
          >
            <strong>KOLKATA, INDIA</strong>

            <span>{decorativeText.year}</span>
          </div>

          <div className={styles["hero-content"]}>
            <div className={styles["hero-meta"]}>
              <div className={styles["hero-meta-left"]}>
                <span className={styles["hero-meta-symbol"]}>✦</span>

                <span>{decorativeText.item}</span>

                <span
                  className={styles["hero-meta-rule"]}
                  aria-hidden="true"
                />
              </div>

              <div className={styles["hero-meta-right"]}>
                SAME CURIOSITY.
                <br />
                BIGGER THINGS.
              </div>
            </div>

            <p className={styles["hero-eyebrow"]}>
              IDEAS TODAY.
              <br />
              A BRIGHTER TOMORROW.
            </p>

            <h2 className={styles["hero-title"]}>
              <span>READY TO BUILD</span>

              <span>TOGETHER?</span>
            </h2>

            <p className={styles["hero-description"]}>
              I’m always open to discussing new projects,
              opportunities, or just interesting ideas.
            </p>

            <Link href="/contact" className={styles["hero-cta"]}>
              <span>GET IN TOUCH</span>

              <span
                className={styles["hero-cta-arrow"]}
                aria-hidden="true"
              >
                →
              </span>
            </Link>
          </div>

          <div className={styles["hero-art"]} aria-hidden="true">
            <Image
              className={styles["hero-art-image"]}
              src={applicationAssets.footerHalftoneMountain.url}
              alt=""
              fill
              sizes="(max-width: 767px) 125vw, (max-width: 1024px) 114vw, 70vw"
              quality={60}
            />

            <div
              className={styles["hero-art-fade"]}
              aria-hidden="true"
            />
          </div>
        </div>
      </section>

      <section className={styles["footer-main"]} data-scroll-reveal>
        <div className={styles["footer-grid"]}>
          <div
            className={`${styles["footer-column"]} ${styles["identity-column"]}`}
          >
            <div
              className={styles["identity-mark"]}
              aria-hidden="true"
            >
              <svg viewBox="0 0 32 32" fill="currentColor">
                <path
                  d="
                    M16 1
                    L20.2 6.4
                    L27 5.8
                    L26.2 12.5
                    L31 16
                    L26.2 19.5
                    L27 26.2
                    L20.2 25.6
                    L16 31
                    L11.8 25.6
                    L5 26.2
                    L5.8 19.5
                    L1 16
                    L5.8 12.5
                    L5 5.8
                    L11.8 6.4
                    Z
                  "
                />

                <path
                  d="
                    M11 16.2
                    L14.2 19.4
                    L21.5 11.9
                  "
                  fill="none"
                  stroke="var(--bg)"
                  strokeWidth="2.3"
                />
              </svg>
            </div>

            <h3 className={styles["identity-name"]}>
              {content.name}
            </h3>

            <p className={styles["identity-description"]}>
              {content.description}
            </p>

            <FooterSocialLinks
              links={content.socialLinks}
              className={styles.socials}
              linkClassName={styles["social-link"]}
            />

            <Link
              href="/contact"
              className={styles["connect-link"]}
            >
              <span>LET’S CONNECT</span>

              <span
                className={styles["connect-arrow"]}
                aria-hidden="true"
              >
                →
              </span>
            </Link>
          </div>

          {/* MOBILE */}
          <div className={styles["mobile-footer-columns"]}>
            <details className={styles["accordion-column"]}>
              <summary className={styles["accordion-trigger"]}>
                <span className={styles["accordion-number"]}>
                  01.
                </span>

                <span className={styles["accordion-title"]}>
                  NAVIGATE
                </span>

                <span
                  className={styles["accordion-symbol"]}
                  aria-hidden="true"
                />
              </summary>

              <div className={styles["accordion-content"]}>
                <div
                  className={
                    styles["accordion-content-inner"]
                  }
                >
                  <nav className={styles["footer-links"]}>
                    <Link
                      href="/"
                      className={styles["footer-link"]}
                    >
                      Home
                    </Link>

                    <Link
                      href="/about"
                      className={styles["footer-link"]}
                    >
                      About
                    </Link>

                    <Link
                      href="/projects"
                      className={styles["footer-link"]}
                    >
                      Projects
                    </Link>

                    <Link
                      href="/blog"
                      className={styles["footer-link"]}
                    >
                      Blog
                    </Link>

                    <Link
                      href="/contact"
                      className={styles["footer-link"]}
                    >
                      Contact
                    </Link>
                  </nav>
                </div>
              </div>
            </details>

            <details className={styles["accordion-column"]}>
              <summary className={styles["accordion-trigger"]}>
                <span className={styles["accordion-number"]}>
                  02.
                </span>

                <span className={styles["accordion-title"]}>
                  EXPLORE
                </span>

                <span
                  className={styles["accordion-symbol"]}
                  aria-hidden="true"
                />
              </summary>

              <div className={styles["accordion-content"]}>
                <div
                  className={
                    styles["accordion-content-inner"]
                  }
                >
                  <nav className={styles["footer-links"]}>
                    {content.exploreItems.map((item) => <a className={styles["footer-link"]} href={item.url} key={item.id}>{item.label}</a>)}
                  </nav>
                </div>
              </div>
            </details>

            <details className={styles["accordion-column"]}>
              <summary className={styles["accordion-trigger"]}>
                <span className={styles["accordion-number"]}>
                  03.
                </span>

                <span className={styles["accordion-title"]}>
                  RESOURCES
                </span>

                <span
                  className={styles["accordion-symbol"]}
                  aria-hidden="true"
                />
              </summary>

              <div className={styles["accordion-content"]}>
                <div
                  className={
                    styles["accordion-content-inner"]
                  }
                >
                  <nav className={styles["footer-links"]}>
                    {content.resources.map((resource) => (
                      <a className={styles["footer-link"]} href={resource.url} key={resource.id}>
                        {resource.label}
                      </a>
                    ))}
                  </nav>
                </div>
              </div>
            </details>

            <details className={styles["accordion-column"]}>
              <summary className={styles["accordion-trigger"]}>
                <span className={styles["accordion-number"]}>
                  04.
                </span>

                <span className={styles["accordion-title"]}>
                  LOCATION
                </span>

                <span
                  className={styles["accordion-symbol"]}
                  aria-hidden="true"
                />
              </summary>

              <div className={styles["accordion-content"]}>
                <div
                  className={
                    styles["accordion-content-inner"]
                  }
                >
                  <p className={styles["location-city"]}>
                    {content.location}
                  </p>

                  <p
                    className={styles["location-subtitle"]}
                  >
                    {decorativeText.worldwide}
                  </p>

                  <div className={styles["map-wrap"]}>
                    <Image
                      className={styles["map-image"]}
                      src="/world_map_transparent.png"
                      alt=""
                      fill
                      sizes="(max-width: 767px) 145px, 165px"
                    />
                  </div>

                  <p
                    className={styles["location-caption"]}
                  >
                    <strong>
                      OPEN TO OPPORTUNITIES
                    </strong>
                    ANYWHERE ON THE MAP.
                  </p>
                </div>
              </div>
            </details>
          </div>

          {/* DESKTOP / TABLET */}
          <div className={styles["desktop-footer-columns"]}>
            <div className={styles["footer-column"]}>
              <h3
                className={
                  styles["footer-column-heading"]
                }
              >
                01. NAVIGATE
              </h3>

              <nav className={styles["footer-links"]}>
                <Link
                  href="/"
                  className={styles["footer-link"]}
                >
                  Home
                </Link>

                <Link
                  href="/about"
                  className={styles["footer-link"]}
                >
                  About
                </Link>

                <Link
                  href="/projects"
                  className={styles["footer-link"]}
                >
                  Projects
                </Link>

                <Link
                  href="/blog"
                  className={styles["footer-link"]}
                >
                  Blog
                </Link>

                <Link
                  href="/contact"
                  className={styles["footer-link"]}
                >
                  Contact
                </Link>
              </nav>
            </div>

            <div className={styles["footer-column"]}>
              <h3
                className={
                  styles["footer-column-heading"]
                }
              >
                02. EXPLORE
              </h3>

              <nav className={styles["footer-links"]}>
                {content.exploreItems.map((item) => <a className={styles["footer-link"]} href={item.url} key={item.id}>{item.label}</a>)}
              </nav>
            </div>

            <div className={styles["footer-column"]}>
              <h3
                className={
                  styles["footer-column-heading"]
                }
              >
                03. RESOURCES
              </h3>

              <nav className={styles["footer-links"]}>
                {content.resources.map((resource) => (
                  <a className={styles["footer-link"]} href={resource.url} key={resource.id}>
                    {resource.label}
                  </a>
                ))}
              </nav>
            </div>

            <div className={styles["footer-column"]}>
              <h3
                className={
                  styles["footer-column-heading"]
                }
              >
                04. LOCATION
              </h3>

              <p className={styles["location-city"]}>
                {content.location}
              </p>

              <p
                className={styles["location-subtitle"]}
              >
                {decorativeText.worldwide}
              </p>

              <div className={styles["map-wrap"]}>
                <Image
                  className={styles["map-image"]}
                  src="/world_map_transparent.png"
                  alt=""
                  fill
                  sizes="(max-width: 767px) 145px, 165px"
                />
              </div>

              <p
                className={styles["location-caption"]}
              >
                <strong>
                  OPEN TO OPPORTUNITIES
                </strong>
                ANYWHERE ON THE MAP.
              </p>
            </div>
          </div>
        </div>

        <div className={styles["footer-legal"]}>
          <div className={styles["legal-copy"]}>
            © {new Date().getFullYear()} Aryan Ranjan.
            <br />
            All rights reserved.
          </div>

          <nav className={styles["legal-links"]}>
            <Link href="/privacy">
              Privacy Policy
            </Link>

            <Link href="/terms">Terms</Link>

            <Link href="/sitemap.xml">Sitemap</Link>

            <a href="#site-footer">
              ↑ Back to top
            </a>
          </nav>
        </div>
      </section>
    </footer>
  );
}
