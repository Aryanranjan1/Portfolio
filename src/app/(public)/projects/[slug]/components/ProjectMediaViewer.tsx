"use client";

import Image from "next/image";
import { createPortal } from "react-dom";
import { useCallback, useEffect, useRef, useState } from "react";

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

export default function ProjectMediaViewer({ media, variant }: ProjectMediaViewerProps) {
  const validMedia = media.filter((item) => Boolean(item.url));
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const closeViewer = useCallback(() => setActiveIndex(null), [setActiveIndex]);

  if (validMedia.length === 0) return null;

  return (
    <>
      {variant === "single" ? (
        <figure className={styles.singleMedia}>
          <button type="button" className={styles.mediaButton} onClick={() => setActiveIndex(0)} aria-label={`Open ${getMediaDescription(validMedia[0]) || "project image"} in full size`}>
            <Image src={validMedia[0].url!} alt={getMediaDescription(validMedia[0])} width={validMedia[0].width ?? 1600} height={validMedia[0].height ?? 900} />
          </button>
          {validMedia[0].caption && <figcaption className={styles.mediaCaption}>{validMedia[0].caption}</figcaption>}
        </figure>
      ) : (
        <>
          <div className={styles.galleryGrid}>
            {validMedia.map((item, index) => {
              const description = getMediaDescription(item);
              return (
                <figure key={item.mediaId} className={styles.galleryItem}>
                  <button type="button" className={styles.galleryImageButton} onClick={() => setActiveIndex(index)} aria-label={`Open ${description || "project image"} in full size`}>
                    <Image src={item.url!} alt={description} width={item.width ?? 1600} height={item.height ?? 900} />
                  </button>
                  {item.caption && <figcaption className={styles.mediaCaption}>{item.caption}</figcaption>}
                </figure>
              );
            })}
          </div>
          <div className={styles.galleryCaptionRow}><span>GALLERY / PROJECT MEDIA</span><span>SELECT IMAGE TO EXPAND</span></div>
        </>
      )}
      <Lightbox media={validMedia} activeIndex={activeIndex} onIndexChange={setActiveIndex} onClose={closeViewer} />
    </>
  );
}

function Lightbox({
  media,
  activeIndex,
  onIndexChange,
  onClose,
}: {
  media: Media[];
  activeIndex: number | null;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}) {
  const closeButton = useRef<HTMLButtonElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef({ startX: 0, startY: 0, lastX: 0, lastY: 0, startScale: 1, startDistance: 0, startPosition: { x: 0, y: 0 }, moved: false });
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const currentMedia = activeIndex === null ? null : media[activeIndex];
  const activeIndexRef = useRef(activeIndex);
  const isOpen = activeIndex !== null;
  const description = currentMedia ? getMediaDescription(currentMedia) : "";

  const resetZoom = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);
  const changeZoom = useCallback((amount: number) => {
    setScale((current) => {
      const next = Math.min(5, Math.max(1, current + amount));
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  }, []);

  useEffect(() => { activeIndexRef.current = activeIndex; }, [activeIndex]);

  const navigateTo = useCallback((index: number) => {
    resetZoom();
    pointers.current.clear();
    setDragging(false);
    onIndexChange(index);
  }, [onIndexChange, resetZoom]);

  useEffect(() => {
    if (!isOpen) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const scrollY = window.scrollY;
    const body = document.body;
    const oldStyles = { position: body.style.position, top: body.style.top, left: body.style.left, right: body.style.right, width: body.style.width, overflow: body.style.overflow };
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";
    closeButton.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      const currentIndex = activeIndexRef.current;
      if (currentIndex === null) return;
      if (event.key === "ArrowLeft") { event.preventDefault(); navigateTo((currentIndex - 1 + media.length) % media.length); }
      if (event.key === "ArrowRight") { event.preventDefault(); navigateTo((currentIndex + 1) % media.length); }
      if (event.key === "+" || event.key === "=") changeZoom(0.25);
      if (event.key === "-") changeZoom(-0.25);
      if (event.key === "0") resetZoom();
      if (event.key === "Tab") {
        const root = closeButton.current?.closest("[role='dialog']");
        const focusable = root?.querySelectorAll<HTMLElement>("button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex='-1'])");
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      Object.assign(body.style, oldStyles);
      window.scrollTo(0, scrollY);
      previousFocus?.focus();
    };
  }, [isOpen, media.length, onClose, navigateTo, changeZoom, resetZoom]);

  useEffect(() => {
    if (activeIndex === null || media.length < 2) return;
    [media[(activeIndex - 1 + media.length) % media.length], media[(activeIndex + 1) % media.length]].forEach((item) => {
      if (!item.url) return;
      const image = new window.Image();
      image.src = item.url;
    });
  }, [activeIndex, media]);

  if (typeof document === "undefined" || activeIndex === null || !currentMedia?.url) return null;

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    event.currentTarget.setPointerCapture(event.pointerId);
    const activePointers = [...pointers.current.values()];
    gesture.current = { ...gesture.current, startX: event.clientX, startY: event.clientY, lastX: event.clientX, lastY: event.clientY, startScale: scale, startDistance: activePointers.length > 1 ? distance(activePointers[0], activePointers[1]) : 0, startPosition: position, moved: false };
    if (scale > 1 || activePointers.length > 1) setDragging(true);
  };
  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(event.pointerId)) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const activePointers = [...pointers.current.values()];
    const deltaX = event.clientX - gesture.current.startX;
    const deltaY = event.clientY - gesture.current.startY;
    if (Math.abs(deltaX) > 6 || Math.abs(deltaY) > 6) gesture.current.moved = true;
    if (activePointers.length > 1 && gesture.current.startDistance > 0) {
      const nextScale = Math.min(5, Math.max(1, gesture.current.startScale * distance(activePointers[0], activePointers[1]) / gesture.current.startDistance));
      setScale(nextScale);
      if (nextScale === 1) setPosition({ x: 0, y: 0 });
    } else if (gesture.current.startScale > 1) {
      setPosition({ x: gesture.current.startPosition.x + deltaX, y: gesture.current.startPosition.y + deltaY });
    }
    gesture.current.lastX = event.clientX;
    gesture.current.lastY = event.clientY;
  };
  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const deltaX = event.clientX - gesture.current.startX;
    const deltaY = event.clientY - gesture.current.startY;
    const wasPinch = gesture.current.startDistance > 0;
    pointers.current.delete(event.pointerId);
    if (!pointers.current.size) setDragging(false);
    if (stageRef.current?.hasPointerCapture(event.pointerId)) stageRef.current.releasePointerCapture(event.pointerId);
    if (scale <= 1 && !wasPinch && Math.abs(deltaX) > 55 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
      navigateTo((activeIndex + (deltaX < 0 ? 1 : -1) + media.length) % media.length);
    }
  };

  return createPortal(
    <div className={styles.lightbox} role="dialog" aria-modal="true" aria-label={`${description || "Project image"} viewer`} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className={styles.viewerTop}>
        <div className={styles.viewerHeading}>
          <span className={styles.viewerEyebrow}>[ SYS.01 ] IMAGE_VIEWER</span>
          <span className={styles.viewerTitle}>{description || "PROJECT_ARCHIVE"}</span>
        </div>
        <span className={styles.viewerCount}>
          <span className={styles.viewerImageIndex}>[ IMG.{String(activeIndex + 1).padStart(3, "0")} ]</span>
          <span>{String(activeIndex + 1).padStart(2, "0")} / {String(media.length).padStart(2, "0")}</span>
          <span className={styles.viewerDimensions}>{currentMedia.width ?? 2400} × {currentMedia.height ?? 1600}</span>
        </span>
        <button ref={closeButton} type="button" className={styles.lightboxClose} onClick={onClose} aria-label="Close image viewer">×</button>
      </div>
      <button type="button" className={`${styles.viewerArrow} ${styles.viewerPrevious}`} aria-label="Previous image" onClick={() => navigateTo((activeIndex - 1 + media.length) % media.length)}>‹</button>
      <div ref={stageRef} className={`${styles.lightboxImageWrap} ${dragging ? styles.viewerDragging : ""}`} onWheel={(event) => { event.preventDefault(); changeZoom(event.deltaY < 0 ? 0.2 : -0.2); }} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={(event) => { pointers.current.delete(event.pointerId); setDragging(false); }} onDoubleClick={() => scale > 1 ? resetZoom() : setScale(2)}>
        <Image key={currentMedia.mediaId} className={styles.viewerImage} src={currentMedia.url} alt={description} width={currentMedia.width ?? 2400} height={currentMedia.height ?? 1600} quality={82} sizes="100vw" priority style={{ transform: `translate(${position.x}px, ${position.y}px) scale(${scale})` }} draggable={false} />
      </div>
      <button type="button" className={`${styles.viewerArrow} ${styles.viewerNext}`} aria-label="Next image" onClick={() => navigateTo((activeIndex + 1) % media.length)}>›</button>
      <div className={styles.viewerControls} aria-label="Image navigation and zoom controls">
        <span className={styles.viewerZoomLabel}>[ ZOOM ]</span>
        <button type="button" onClick={() => changeZoom(-0.25)} aria-label="Zoom out">−</button>
        <span className={styles.zoomLevel}>{Math.round(scale * 100)}%</span>
        <button type="button" onClick={() => changeZoom(0.25)} aria-label="Zoom in">+</button>
        <button type="button" onClick={resetZoom} aria-label="Reset zoom">⟲</button>
      </div>
      <span className={styles.viewerStatus}>[ STATUS ] ONLINE</span>
      {media.length > 1 && <div className={styles.viewerThumbnails} aria-label="Choose image">
        {media.map((item, index) => <button key={item.mediaId} type="button" aria-label={`View image ${index + 1}`} aria-current={index === activeIndex ? "true" : undefined} className={index === activeIndex ? styles.viewerThumbnailActive : undefined} onClick={() => navigateTo(index)}>
          <Image src={item.url!} alt="" width={64} height={44} sizes="64px" />
        </button>)}
      </div>}
    </div>,
    document.body,
  );
}

function distance(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
