/* eslint-disable react/jsx-no-comment-textnodes */

"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import type { BlogArticle, BlogContent } from "@/lib/convex/queries/blog";

import styles from "./BlogSection.module.css";
import ScrollReveal from "@/components/ScrollReveal";

type Props = {
  content: BlogContent;
};

const MAX_VISIBLE_RECENT = 4;

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(date));
}

export default function BlogSectionClient({ content }: Props) {
  const articles = content.recent;
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [featuredImageRatio, setFeaturedImageRatio] = useState("16 / 9");
  const [visibleRecentCount, setVisibleRecentCount] = useState(() =>
    Math.min(articles.length, MAX_VISIBLE_RECENT),
  );
  const dialogRef = useRef<HTMLDivElement>(null);
  const articleListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!searchOpen) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = dialogRef.current;
    const focusable = () => Array.from(dialog?.querySelectorAll<HTMLElement>("button:not([disabled]), input:not([disabled]), a[href], [tabindex]:not([tabindex='-1'])") ?? []);
    focusable()[0]?.focus();
    const trapFocus = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const items = focusable();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", trapFocus);
    return () => {
      document.removeEventListener("keydown", trapFocus);
      previousFocus?.focus();
    };
  }, [searchOpen]);

  useLayoutEffect(() => {
    const list = articleListRef.current;
    if (!list) return;

    const desktopQuery = window.matchMedia("(min-width: 1024px)");
    const updateVisibleCount = () => {
      if (!desktopQuery.matches) {
        setVisibleRecentCount(articles.length);
        return;
      }

      const listStyle = window.getComputedStyle(list);
      const availableHeight =
        list.clientHeight - Number.parseFloat(listStyle.paddingTop || "0");
      const naturalHeights = Array.from(
        list.querySelectorAll<HTMLElement>(`:scope > a .${styles.articleMain}`),
      )
        .slice(0, MAX_VISIBLE_RECENT)
        .map((main) => main.getBoundingClientRect().height);
      const minItemHeight = Math.max(1, ...naturalHeights) + 32;
      const count = articles.length
        ? Math.max(
            1,
            Math.min(
              MAX_VISIBLE_RECENT,
              articles.length,
              Math.floor(availableHeight / minItemHeight),
            ),
          )
        : 0;

      setVisibleRecentCount(count);
    };

    updateVisibleCount();
    const observer = new ResizeObserver(updateVisibleCount);
    observer.observe(list);
    list
      .querySelectorAll<HTMLElement>(`.${styles.articleMain}`)
      .forEach((main, index) => {
        if (index < MAX_VISIBLE_RECENT) observer.observe(main);
      });
    desktopQuery.addEventListener("change", updateVisibleCount);

    return () => {
      observer.disconnect();
      desktopQuery.removeEventListener("change", updateVisibleCount);
    };
  }, [articles]);

  const searchResults = useMemo(() => {
    const value = query.toLowerCase().trim();

    if (!value) {
      return articles;
    }

    return articles.filter((article) =>
      [article.title, article.category, article.description]
        .join(" ")
        .toLowerCase()
        .includes(value),
    );
  }, [articles, query]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSearchOpen(false);
        setQuery("");
      }
    }

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  function closeSearch() {
    setSearchOpen(false);
    setQuery("");
  }

  if (!content.featured && !articles.length) {
    return (
      <section
        className={styles.blogSection}
        id="blog"
        aria-labelledby="blog-heading"
      >
        <div className={styles.empty}>No published articles yet.</div>
      </section>
    );
  }

  return (
    <>
      <section
        className={styles.blogSection}
        id="blog"
        aria-labelledby="blog-heading"
      >
        <div className={styles.blogContainer}>
          <header className={styles.blogIntro}>
            <div className={styles.introTop}>
              <div className={styles.systemLabel}>
                <span className={styles.statusDot} aria-hidden="true" />
                Technical Writing
              </div>

              <h2 className={styles.blogHeading} id="blog-heading">
                WRITINGS
              </h2>

              <p className={styles.introDescription}>
                Technical articles on web development, software engineering,
                system design, databases, DevOps, and computer science.
              </p>
            </div>

            <div className={styles.introBottom}>
              <span className={styles.introIndex}>/ BLOG / 001</span>

              <div className={styles.asciiMark} aria-hidden="true">
                {`┌──────────┐
│  WRITE   │
│  BUILD   │
│  LEARN   │
└──────────┘`}
              </div>
            </div>
          </header>

          {content.featured && (
            <section
              className={styles.featured}
              aria-labelledby="featured-heading"
            >
              <ScrollReveal />
              <div className={styles.sectionLabel}>
                // <strong>FEATURED_ARTICLE</strong>
              </div>

              <article className={styles.featuredCard} data-scroll-reveal>
                <Link
                  href={content.featured.url}
                  className={styles.featuredImageWrap}
                  style={{ aspectRatio: featuredImageRatio }}
                  aria-label={`Read ${content.featured.title}`}
                >
                  {content.featured.image ? (
                    <Image
                      src={content.featured.image}
                      alt={content.featured.imageAlt || content.featured.title}
                      fill
                      priority={false}
                      sizes="(max-width: 1023px) 90vw, 45vw"
                      className={styles.featuredImage}
                      onLoad={(event) => {
                        const { naturalWidth, naturalHeight } = event.currentTarget;
                        if (naturalWidth > 0 && naturalHeight > 0) {
                          setFeaturedImageRatio(`${naturalWidth} / ${naturalHeight}`);
                        }
                      }}
                    />
                  ) : (
                    <span className={styles.featuredImageFallback} aria-hidden="true" />
                  )}
                  <span className={styles.imageLabel} aria-hidden="true">
                    ARTICLE / 001
                  </span>
                </Link>

                <div className={styles.featuredContent}>
                  <div className={styles.featuredMeta}>
                    <span className={styles.featuredCategory}>
                      {content.featured.category}
                    </span>
                    <span className={styles.featuredNumber}>#001</span>
                  </div>

                  <Link
                    href={content.featured.url}
                    className={styles.featuredTitleLink}
                  >
                    <h3 className={styles.featuredTitle} id="featured-heading">
                      {content.featured.title}
                    </h3>
                  </Link>

                  {content.featured.description && (
                    <p className={styles.featuredDescription}>
                      {content.featured.description}
                    </p>
                  )}

                  <div className={styles.featuredFooter}>
                    <time
                      className={styles.featuredDate}
                      dateTime={content.featured.date}
                    >
                      {formatDate(content.featured.date)}
                    </time>
                    <Link
                      href={content.featured.url}
                      className={styles.readButton}
                    >
                      Read article <span className={styles.arrow} aria-hidden="true">→</span>
                    </Link>
                  </div>
                </div>
              </article>
            </section>
          )}

          <section
            className={styles.recent}
            aria-labelledby="recent-heading"
          >
            <div className={styles.recentHeader}>
              <div className={styles.sectionLabel}>
                // <strong id="recent-heading">RECENT_ARTICLES</strong>
              </div>

              <div className={styles.recentControls}>
                <button
                  type="button"
                  className={styles.searchButton}
                  onClick={() => setSearchOpen(true)}
                  aria-label="Search blog articles"
                  aria-haspopup="dialog"
                  aria-expanded={searchOpen}
                  title="Search articles"
                >
                  <svg
                    className={styles.searchIcon}
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle
                      cx="11"
                      cy="11"
                      r="6.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />

                    <path
                      d="M16 16L21 21"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className={styles.articleList} ref={articleListRef}>
              <ScrollReveal />
              {articles.map((article, index) => {
                const hiddenAtDesktop = index >= visibleRecentCount;
                return (
                  <RecentArticle
                    key={article.id}
                    article={article}
                    index={index}
                    hiddenAtDesktop={hiddenAtDesktop}
                  />
                );
              })}
            </div>
          </section>
        </div>
      </section>

      <div
        ref={dialogRef}
        className={`${styles.searchOverlay} ${
          searchOpen ? styles.active : ""
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Search blog articles"
        aria-hidden={!searchOpen}
        inert={!searchOpen}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            closeSearch();
          }
        }}
      >
        <button
          type="button"
          className={styles.closeSearch}
          onClick={closeSearch}
        >
          [ ESC ] CLOSE
        </button>

        <div className={styles.searchBox}>
          <div className={styles.searchLabel}>
            Search technical articles
          </div>

          <input
            className={styles.searchInput}
            type="search"
            placeholder="search articles..."
            autoComplete="off"
            autoFocus={searchOpen}
            aria-label="Search blog articles"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />

          <div className={styles.searchResults}>
            {searchResults.map((article) => (
              <Link
                key={article.id}
                href={article.url}
                className={styles.searchResult}
                onClick={closeSearch}
              >
                <div className={styles.searchResultMeta}>
                  <span>{article.category}</span>
                  <span>{formatDate(article.date)}</span>
                </div>

                <div className={styles.searchResultTitle}>
                  {article.title}
                </div>
              </Link>
            ))}

            {query.trim() && searchResults.length === 0 && (
              <div className={styles.searchNoResults}>
                No articles found.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function RecentArticle({
  article,
  index,
  hiddenAtDesktop,
}: {
  article: BlogArticle;
  index: number;
  hiddenAtDesktop: boolean;
}) {
  return (
    <Link
      data-scroll-reveal
      data-count-hidden={hiddenAtDesktop ? "" : undefined}
      href={article.url}
      className={styles.articleLink}
      aria-label={`Read ${article.title}`}
      aria-hidden={hiddenAtDesktop || undefined}
      tabIndex={hiddenAtDesktop ? -1 : undefined}
    >
      <article className={styles.article}>
        <div className={styles.articleNumber}>
          {String(index + 1).padStart(2, "0")}
        </div>

        <div className={styles.articleMain}>
          <div className={styles.articleTitle}>{article.title}</div>

          <div className={styles.articleCategory}>
            {article.category}
          </div>

          <p className={styles.articleDescription}>
            {article.description}
          </p>

          <time className={styles.articleDate} dateTime={article.date}>
            {formatDate(article.date)}
          </time>
        </div>
      </article>
    </Link>
  );
}
