"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./DecorativeVideo.module.css";

type DecorativeVideoProps = {
  src: string;
  poster: string;
  playbackRate: number;
  preload?: "none" | "metadata" | "auto";
  deferUntilVisible?: boolean;
  className?: string;
};

export default function DecorativeVideo({
  src,
  poster,
  playbackRate,
  preload = "none",
  deferUntilVisible = false,
  className = "",
}: DecorativeVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isNearViewport, setIsNearViewport] = useState(!deferUntilVisible);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);

  useEffect(() => {
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (motionPreference.matches || connection?.saveData) return;

    const idleWindow = window as Window & {
      requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
      cancelIdleCallback?: (handle: number) => void;
    };
    let idleHandle: number | undefined;
    let timeoutHandle: number | undefined;
    const loadVideo = () => {
      if (!motionPreference.matches && !connection?.saveData) setShouldLoadVideo(true);
    };

    if (idleWindow.requestIdleCallback) {
      idleHandle = idleWindow.requestIdleCallback(loadVideo, { timeout: 2000 });
    } else {
      timeoutHandle = window.setTimeout(loadVideo, 0);
    }

    return () => {
      if (idleHandle !== undefined) idleWindow.cancelIdleCallback?.(idleHandle);
      if (timeoutHandle !== undefined) window.clearTimeout(timeoutHandle);
    };
  }, []);

  useEffect(() => {
    if (!deferUntilVisible || isNearViewport) return;

    const video = videoRef.current;
    if (!video) return;

    if (!("IntersectionObserver" in window)) {
      const fallbackTimer = setTimeout(() => setIsNearViewport(true), 0);
      return () => clearTimeout(fallbackTimer);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsNearViewport(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px" },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [deferUntilVisible, isNearViewport]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPlayback = () => {
      video.playbackRate = playbackRate;
      if (motionPreference.matches || !shouldLoadVideo || !isNearViewport) {
        video.pause();
      } else {
        void video.play().catch(() => undefined);
      }
    };

    syncPlayback();
    motionPreference.addEventListener("change", syncPlayback);
    return () => motionPreference.removeEventListener("change", syncPlayback);
  }, [isNearViewport, playbackRate, shouldLoadVideo, src]);

  const videoCanPlay = shouldLoadVideo && isNearViewport;

  return (
    <video
      ref={videoRef}
      aria-hidden="true"
      tabIndex={-1}
      autoPlay={videoCanPlay}
      loop
      muted
      playsInline
      preload={videoCanPlay ? preload : "none"}
      poster={poster}
      className={`${styles.video} ${className}`}
    >
      {videoCanPlay ? <source src={src} type="video/webm" /> : null}
    </video>
  );
}
