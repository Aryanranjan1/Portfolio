"use client";

import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ProjectContent } from "@/lib/projects/get-project-content";
import styles from "./FeaturedProject.module.css";

function Arrow({ direction }: { direction: "left" | "right" }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
      {direction === "left" ? (
        <path d="M19 12H5m0 0 7-7m-7 7 7 7" />
      ) : (
        <path d="M5 12h14m0 0-7-7m7 7-7 7" />
      )}
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <path d="M14 5h5v5M19 5l-9 9" />
      <path d="M18 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

function hasDistinctCaption(caption: string, title: string) {
  const normalize = (value: string) =>
    value.trim().replace(/[\p{P}\p{S}]+$/u, "").replace(/\s+/g, " ").toLowerCase();
  const normalizedCaption = normalize(caption);
  return normalizedCaption.length > 0 && normalizedCaption !== normalize(title);
}

export default function FeaturedProject({ project }: { project: ProjectContent }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [viewerHeight, setViewerHeight] = useState<number | null>(null);
  const gallery = project.gallery;
  const active = gallery[activeIndex];
  const imageTriggerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const lightboxRef = useRef<HTMLDivElement>(null);
  const viewerColumnRef = useRef<HTMLDivElement>(null);
  const galleryListRef = useRef<HTMLElement>(null);
  const galleryItemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const liveDomain = project.liveUrl
    ? (() => {
        try {
          return new URL(project.liveUrl).hostname.replace(/^www\./, "");
        } catch {
          return project.liveUrl;
        }
      })()
    : "";
  const showIndex = String(activeIndex + 1).padStart(2, "0");
  const change = (step: number) =>
    setActiveIndex((index) => (index + step + gallery.length) % gallery.length);
  const galleryListStyle = viewerHeight
    ? ({ "--viewer-height": `${viewerHeight}px` } as CSSProperties)
    : undefined;

  useEffect(() => {
    if (gallery.length <= 6 || !viewerColumnRef.current) return;
    const viewer = viewerColumnRef.current;
    const updateHeight = () => setViewerHeight(viewer.getBoundingClientRect().height);
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(viewer);
    return () => observer.disconnect();
  }, [gallery.length]);

  useEffect(() => {
    const list = galleryListRef.current;
    const item = galleryItemRefs.current[activeIndex];
    if (list && item && list.scrollHeight > list.clientHeight + 1) {
      item.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex, gallery.length, viewerHeight]);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
    window.requestAnimationFrame(() => imageTriggerRef.current?.focus());
  }, []);

  useEffect(() => {
    if (!lightboxOpen) return;
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeLightbox();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = lightboxRef.current?.querySelectorAll<HTMLElement>(
        'button:not(:disabled), [href], [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [closeLightbox, lightboxOpen]);

  return (
    <section className={styles.featured} aria-labelledby="featured-project-title">
      <div className={styles.content}>
        <header className={styles.header}>
          <span className={styles.headerLabel}>
            <span className={styles.number}>{"// 003"}</span> Featured project
          </span>
          <span className={styles.headerMeta}>
            {[project.projectType, project.year].filter(Boolean).join(" · ")}
          </span>
        </header>

        <h2 className={styles.title} id="featured-project-title">
          {project.title}
        </h2>

        <div className={styles.intro}>
          <div className={styles.introCopy}>
            <p className={styles.lead}>{project.shortDescription}</p>
            {project.categories.length > 0 && (
              <div className={styles.categories}>
                {project.categories.map((category) => (
                  <span key={category}>{category}</span>
                ))}
              </div>
            )}
          </div>

          <div className={styles.specsColumn}>
            <dl className={styles.specs}>
              <div>
                <dt>Type</dt>
                <dd>{project.projectType}</dd>
              </div>
              {project.year != null && (
                <div>
                  <dt>Year</dt>
                  <dd>{project.year}</dd>
                </div>
              )}
              {project.location && (
                <div>
                  <dt>Location</dt>
                  <dd>{project.location}</dd>
                </div>
              )}
              {project.technologies.length > 0 && (
                <div>
                  <dt>Stack</dt>
                  <dd className={styles.stack}>
                    {project.technologies.map((item) => (
                      <span key={item}>{item}</span>
                    ))}
                  </dd>
                </div>
              )}
              {project.liveUrl && (
                <div>
                  <dt>Live site</dt>
                  <dd>
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {project.liveLabel || liveDomain}
                    </a>
                  </dd>
                </div>
              )}
            </dl>
            <div className={styles.actions}>
              <Link className={styles.primary} href={project.href}>
                View project <Arrow direction="right" />
              </Link>
              {project.liveUrl && (
                <a
                  className={styles.secondary}
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Live site <ExternalIcon />
                </a>
              )}
            </div>
          </div>
        </div>

        {gallery.length > 0 && (
          <div className={styles.gallery}>
            <div ref={viewerColumnRef} className={styles.viewerColumn}>
              <div
                className={`${styles.frame} ${project.liveUrl ? styles.frameWithBar : ""}`}
                tabIndex={0}
                aria-label="Project image viewer. Use left and right arrow keys to change images."
                onKeyDown={(event) => {
                  if (event.key === "ArrowLeft") {
                    event.preventDefault();
                    change(-1);
                  }
                  if (event.key === "ArrowRight") {
                    event.preventDefault();
                    change(1);
                  }
                }}
              >
                {project.liveUrl && (
                  <div className={styles.frameBar}>
                    <span className={styles.dots} aria-hidden="true">
                      <i />
                      <i />
                      <i />
                    </span>
                    <span>{liveDomain}</span>
                  </div>
                )}
                <div className={`${styles.imageArea} ${active.fit === "contain" ? styles.imageAreaContain : ""}`}>
                  <button
                    ref={imageTriggerRef}
                    type="button"
                    className={styles.imageTrigger}
                    aria-label={`Open larger image: ${active.title}`}
                    aria-haspopup="dialog"
                    onClick={() => setLightboxOpen(true)}
                  >
                    <Image
                      key={active.src}
                      src={active.src}
                      alt={active.alt || active.title || project.title}
                      fill
                      preload={activeIndex === 0}
                      loading={activeIndex === 0 ? undefined : "lazy"}
                      sizes="(max-width: 700px) 100vw, (max-width: 1100px) 100vw, 66vw"
                      className={`${styles.image} ${active.fit === "contain" ? styles.imageContain : ""}`}
                    />
                  </button>
                </div>
              </div>
              <div className={styles.viewerCaption}>
                <div>
                  <span className={styles.imageCount}>
                    {showIndex} / {String(gallery.length).padStart(2, "0")}
                  </span>
                  <span className={styles.imageTitle}>{active.title}</span>
                  {hasDistinctCaption(active.caption, active.title) && (
                    <p>{active.caption}</p>
                  )}
                </div>
                {gallery.length > 1 && (
                  <div className={styles.controls}>
                    <button
                      type="button"
                      aria-label="Previous image"
                      onClick={() => change(-1)}
                    >
                      <Arrow direction="left" />
                    </button>
                    <button
                      type="button"
                      aria-label="Next image"
                      onClick={() => change(1)}
                    >
                      <Arrow direction="right" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <aside
              ref={galleryListRef}
              className={`${styles.galleryList} ${gallery.length > 6 ? styles.galleryListScrollable : ""}`}
              style={galleryListStyle}
            >
              <div className={styles.galleryLabel}>{"// Gallery"}</div>
              <ol>
                {gallery.map((item, index) => (
                  <li key={`${item.src}-${index}`}>
                    <button
                      ref={(element) => {
                        galleryItemRefs.current[index] = element;
                      }}
                      type="button"
                      aria-pressed={index === activeIndex}
                      onClick={() => setActiveIndex(index)}
                    >
                      <span className={styles.galleryIndex}>
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className={styles.galleryItemCopy}>
                        <span className={styles.galleryTitle}>{item.title}</span>
                        {hasDistinctCaption(item.caption, item.title) && (
                          <span className={styles.galleryCaption}>
                            {item.caption}
                          </span>
                        )}
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
            </aside>
          </div>
        )}

        <div className={styles.results}>
          <div className={styles.resultsLabel}>{"// Results recorded"}</div>
          <div className={styles.resultStats}>
            {project.results.map((result, index) => (
              <div key={`${result.label}-${index}`}>
                <strong>{result.value}</strong>
                <span>{result.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <hr className={styles.divider} />

      {lightboxOpen && active && (
        <div
          ref={lightboxRef}
          className={styles.lightbox}
          role="dialog"
          aria-modal="true"
          aria-label={`Larger image: ${active.title}`}
          onClick={(event) => {
            if (event.target === event.currentTarget) closeLightbox();
          }}
        >
          <button
            ref={closeButtonRef}
            type="button"
            className={styles.lightboxClose}
            aria-label="Close larger image"
            onClick={closeLightbox}
          >
            <CloseIcon />
          </button>
          <div
            className={`${styles.lightboxMedia} ${active.fit === "contain" ? styles.lightboxContain : ""}`}
          >
            <Image
              src={active.src}
              alt={active.alt || active.title || project.title}
              fill
              sizes="100vw"
              className={styles.lightboxImage}
            />
          </div>
          <p className={styles.lightboxTitle}>{active.title}</p>
        </div>
      )}
    </section>
  );
}
