import Image from "next/image";
import Link from "next/link";
import { DM_Mono, Space_Grotesk } from "next/font/google";

import styles from "./Footer.module.css";
import { getFooterContent } from "@/lib/footer/get-footer-content";
import ScrollReveal from "@/components/ScrollReveal";

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
              src="https://ajgwjvvdvjjgkufohvwt.supabase.co/storage/v1/object/public/portfolio-media/Halftone%20Moonlit%20Mountain%20Landscape.png"
              alt=""
              fill
              sizes="(max-width: 767px) 140vw, (max-width: 1024px) 114vw, 70vw"
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

            <div className={styles["socials"]}>
              <a
                href={content.githubUrl || undefined}
                hidden={!content.githubUrl}
                className={styles["social-link"]}
                aria-label="GitHub"
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fill="currentColor"
                    d="
                      M12 .7
                      a12 12 0 0 0-3.79 23.39
                      c.6.11.82-.26.82-.58
                      v-2.04
                      c-3.34.73-4.04-1.61-4.04-1.61
                      -.55-1.39-1.33-1.76-1.33-1.76
                      -1.09-.75.08-.74.08-.74
                      1.2.09 1.84 1.23 1.84 1.23
                      1.07 1.84 2.8 1.31 3.48 1
                      .11-.78.42-1.31.76-1.61
                      -2.67-.3-5.47-1.34-5.47-5.95
                      0-1.31.47-2.38 1.23-3.22
                      -.12-.3-.53-1.52.12-3.17
                      0 0 1-.32 3.3 1.23
                      a11.5 11.5 0 0 1 6 0
                      c2.29-1.55 3.29-1.23 3.29-1.23
                      .65 1.65.24 2.87.12 3.17
                      .77.84 1.23 1.91 1.23 3.22
                      0 4.62-2.81 5.64-5.49 5.94
                      .43.37.81 1.1.81 2.22
                      v3.29
                      c0 .32.22.7.83.58
                      A12 12 0 0 0 12 .7Z
                    "
                  />
                </svg>
              </a>

              <a
                href={content.linkedinUrl || undefined}
                hidden={!content.linkedinUrl}
                className={styles["social-link"]}
                aria-label="LinkedIn"
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fill="currentColor"
                    d="
                      M5.04 3.5
                      a2.5 2.5 0 1 1 0 5
                      a2.5 2.5 0 0 1 0-5Z

                      M2.8 9.5
                      h4.48
                      V21
                      H2.8
                      V9.5Z

                      M10 9.5
                      h4.3
                      v1.57
                      h.06
                      c.6-1.14 2.06-2.34 4.24-2.34
                      4.53 0 5.37 2.98 5.37 6.86
                      V21
                      h-4.48
                      v-4.78
                      c0-1.14-.02-2.6-1.58-2.6
                      -1.6 0-1.84 1.22-1.84 2.52
                      V21
                      H10
                      V9.5Z
                    "
                  />
                </svg>
              </a>

              <a
                href={content.xUrl || undefined}
                hidden={!content.xUrl}
                className={styles["social-link"]}
                aria-label="X"
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fill="currentColor"
                    d="
                      M18.9 2
                      H22
                      l-6.77 7.74
                      L23.2 22
                      h-6.24
                      l-4.89-6.39
                      L6.48 22
                      H3.36
                      l7.24-8.28
                      L2.8 2
                      h6.4
                      l4.42 5.84
                      L18.9 2Z

                      m-1.1 17.85
                      h1.73
                      L8.26 4.03
                      H6.4
                      L17.8 19.85Z
                    "
                  />
                </svg>
              </a>

              <a
                href={undefined}
                hidden
                className={styles["social-link"]}
                aria-label="YouTube"
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fill="currentColor"
                    d="
                      M23.5 6.2
                      a3.01 3.01 0 0 0-2.12-2.13
                      C19.51 3.55 12 3.55 12 3.55
                      s-7.51 0-9.38.52
                      A3.01 3.01 0 0 0 .5 6.2
                      A31.3 31.3 0 0 0 0 12
                      a31.3 31.3 0 0 0 .5 5.8
                      3.01 3.01 0 0 0 2.12 2.13
                      c1.87.52 9.38.52 9.38.52
                      s7.51 0 9.38-.52
                      a3.01 3.01 0 0 0 2.12-2.13
                      A31.3 31.3 0 0 0 24 12
                      a31.3 31.3 0 0 0-.5-5.8Z

                      M9.55 15.58
                      V8.42
                      L15.73 12
                      l-6.18 3.58Z
                    "
                  />
                </svg>
              </a>

              <a
                href={content.email || undefined}
                hidden={!content.email}
                className={styles["social-link"]}
                aria-label="Email"
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <rect
                    x="3"
                    y="5.5"
                    width="18"
                    height="13"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  />

                  <path
                    d="M3.5 6L12 13L20.5 6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  />
                </svg>
              </a>
            </div>

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
