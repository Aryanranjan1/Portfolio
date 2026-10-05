"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import styles from "../ProjectPage.module.css";

type Media = {
  mediaId: string;
  role: string;
  position: number;
  caption: string | null;
  altTextOverride: string | null;
  url: string | null;
  filename: string;
  width: number | null;
  height: number | null;
  altText: string | null;
};

type ProjectMediaViewerProps = {
  media: Media[];
  variant: "single" | "gallery";
};

function getMediaDescription(item: Media) {
  return item.altTextOverride?.trim() || item.altText?.trim() || item.caption?.trim() || "";
}

export default function ProjectMediaViewer({
  media,
  variant,
}: ProjectMediaViewerProps) {
  const [activeMedia, setActiveMedia] =
    useState<Media | null>(null);

  useEffect(() => {
    if (!activeMedia) {
      return;
    }

    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      if (event.key === "Escape") {
        setActiveMedia(null);
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown,
    );

    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown,
      );

      document.body.style.overflow = "";
    };
  }, [activeMedia]);

  const validMedia = media.filter(
    (item) => Boolean(item.url),
  );

  if (validMedia.length === 0) {
    return null;
  }

  if (variant === "single") {
    const item = validMedia[0];
    const description = getMediaDescription(item);

    return (
      <>
        <figure className={styles.singleMedia}>
          <button
            type="button"
            className={styles.mediaButton}
            onClick={() =>
              setActiveMedia(item)
            }
            aria-label={`Open ${
              description || "project image"
            } in full size`}
          >
            <Image
              src={item.url!}
              alt={
                description
              }
              width={item.width ?? 1600}
              height={item.height ?? 900}
            />

            <span
              className={styles.mediaOverlay}
              aria-hidden="true"
            >
              VIEW FULL SIZE ↗
            </span>
          </button>

          {item.caption && (
            <figcaption
              className={styles.mediaCaption}
            >
              {item.caption}
            </figcaption>
          )}
        </figure>

        <Lightbox
          media={activeMedia}
          onClose={() =>
            setActiveMedia(null)
          }
        />
      </>
    );
  }

  return (
    <>
      <div className={styles.galleryGrid}>
        {validMedia.map((item) => (
          <figure
            key={item.mediaId}
            className={styles.galleryItem}
          >
            {(() => {
              const description = getMediaDescription(item);
              return <button
                type="button"
                className={styles.galleryImageButton}
                onClick={() => setActiveMedia(item)}
                aria-label={`Open ${description || "project image"} in full size`}
              >
                <Image
                  src={item.url!}
                  alt={description}
                  width={item.width ?? 1600}
                  height={item.height ?? 900}
                />
                <span className={styles.galleryImageOverlay} aria-hidden="true">VIEW ↗</span>
              </button>;
            })()}

            {item.caption && (
              <figcaption
                className={styles.mediaCaption}
              >
                {item.caption}
              </figcaption>
            )}
          </figure>
        ))}
      </div>

      <div
        className={
          styles.galleryCaptionRow
        }
      >
        <span>
          GALLERY / PROJECT MEDIA
        </span>

        <span>
          SELECT IMAGE TO EXPAND
        </span>
      </div>

      <Lightbox
        media={activeMedia}
        onClose={() =>
          setActiveMedia(null)
        }
      />
    </>
  );
}

function Lightbox({
  media,
  onClose,
}: {
  media: Media | null;
  onClose: () => void;
}) {
  const closeButton = useRef<HTMLButtonElement>(null);
  const description = media ? getMediaDescription(media) : "";

  useEffect(() => {
    if (!media?.url) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeButton.current?.focus();
    const handleTab = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const root = closeButton.current?.closest("[role='dialog']");
      const focusable = root?.querySelectorAll<HTMLElement>("button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex='-1'])");
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", handleTab);
    return () => {
      document.removeEventListener("keydown", handleTab);
      previous?.focus();
    };
  }, [media?.mediaId, media?.url]);

  if (!media?.url) return null;

  return (
    <div
      className={styles.lightbox}
      role="dialog"
      aria-modal="true"
      aria-label={`${description || "Project image"} viewer`}
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <button
        ref={closeButton}
        type="button"
        className={styles.lightboxClose}
        onClick={onClose}
        aria-label="Close image viewer"
      >
        ×
      </button>

      <div
        className={
          styles.lightboxImageWrap
        }
      >
        <Image
          src={media.url}
          alt={
          description
          }
          width={media.width ?? 2400}
          height={media.height ?? 1600}
          sizes="94vw"
        />
      </div>
    </div>
  );
}
