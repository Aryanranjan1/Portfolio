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
      if (motionPreference.matches || !isNearViewport) {
        video.pause();
      } else {
        void video.play().catch(() => undefined);
      }
    };

    syncPlayback();
    motionPreference.addEventListener("change", syncPlayback);
    return () => motionPreference.removeEventListener("change", syncPlayback);
  }, [isNearViewport, playbackRate, src]);

  return (
    <video
      ref={videoRef}
      aria-hidden="true"
      tabIndex={-1}
      autoPlay={isNearViewport}
      loop
      muted
      playsInline
      preload={isNearViewport ? preload : "none"}
      poster={poster}
      className={`${styles.video} ${className}`}
    >
      <source src={src} type="video/webm" />
    </video>
  );
}
