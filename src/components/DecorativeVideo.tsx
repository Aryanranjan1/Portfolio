"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import styles from "./DecorativeVideo.module.css";

type DecorativeVideoProps = {
  src: string;
  fallbackPoster?: string;
  fallbackSizes?: string;
  fallbackQuality?: number;
  fallbackPosterClassName?: string;
  fallbackLoadEager?: boolean;
  fallbackFetchPriority?: "high" | "low" | "auto";
  playbackRate: number;
  preload?: "none" | "metadata" | "auto";
  deferUntilVisible?: boolean;
  className?: string;
  videoClassName?: string;
};

export default function DecorativeVideo({
  src,
  fallbackPoster,
  fallbackSizes = "100vw",
  fallbackQuality = 60,
  fallbackPosterClassName = "",
  fallbackLoadEager = false,
  fallbackFetchPriority,
  playbackRate,
  preload = "none",
  deferUntilVisible = false,
  className = "",
  videoClassName = "",
}: DecorativeVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [posterReady, setPosterReady] = useState(!fallbackPoster);
  const [isNearViewport, setIsNearViewport] = useState(!deferUntilVisible);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const [preferencesAllowVideo, setPreferencesAllowVideo] = useState(false);
  const [hasPlayingFrame, setHasPlayingFrame] = useState(false);

  useEffect(() => {
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (navigator as Navigator & {
      connection?: EventTarget & { saveData?: boolean };
    }).connection;
    const syncPreferences = () => {
      const allowed = !motionPreference.matches && !connection?.saveData;
      setPreferencesAllowVideo(allowed);
      if (!allowed) {
        setShouldLoadVideo(false);
        setHasPlayingFrame(false);
      }
    };
    syncPreferences();
    motionPreference.addEventListener("change", syncPreferences);
    connection?.addEventListener("change", syncPreferences);
    return () => {
      motionPreference.removeEventListener("change", syncPreferences);
      connection?.removeEventListener("change", syncPreferences);
    };
  }, []);

  useEffect(() => {
    if (!preferencesAllowVideo) return;

    const idleWindow = window as Window & {
      requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
      cancelIdleCallback?: (handle: number) => void;
    };
    let secondFrame: number | undefined;
    let idleHandle: number | undefined;
    let timeoutHandle: number | undefined;
    const loadVideo = () => {
      setShouldLoadVideo(true);
    };

    // Give the decoded fallback at least one paint opportunity before scheduling media work.
    const firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        if (idleWindow.requestIdleCallback) {
          idleHandle = idleWindow.requestIdleCallback(loadVideo, { timeout: 2000 });
        } else {
          timeoutHandle = window.setTimeout(loadVideo, 0);
        }
      });
    });

    return () => {
      if (firstFrame !== undefined) window.cancelAnimationFrame(firstFrame);
      if (secondFrame !== undefined) window.cancelAnimationFrame(secondFrame);
      if (idleHandle !== undefined) idleWindow.cancelIdleCallback?.(idleHandle);
      if (timeoutHandle !== undefined) window.clearTimeout(timeoutHandle);
    };
  }, [preferencesAllowVideo]);

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

  const videoCanLoad = preferencesAllowVideo && shouldLoadVideo && isNearViewport && posterReady;

  useEffect(() => {
    const video = videoRef.current;
    if (!video || videoCanLoad) return;
    video.pause();
    video.load();
    setHasPlayingFrame(false);
  }, [videoCanLoad]);

  return (
    <div className={`${styles.mediaFrame} ${className}`}>
      {fallbackPoster && !hasPlayingFrame && (!deferUntilVisible || isNearViewport) ? (
        <Image
          src={fallbackPoster}
          alt=""
          fill
          sizes={fallbackSizes}
          quality={fallbackQuality}
          loading={fallbackLoadEager ? "eager" : undefined}
          fetchPriority={fallbackFetchPriority}
          className={`${styles.fallbackPoster} ${fallbackPosterClassName}`}
          onLoad={(event) => {
            void event.currentTarget.decode().catch(() => undefined).finally(() => setPosterReady(true));
          }}
          onError={() => setPosterReady(true)}
        />
      ) : null}
      <video
        ref={videoRef}
        aria-hidden="true"
        tabIndex={-1}
        autoPlay={videoCanLoad}
        loop
        muted
        playsInline
        preload={videoCanLoad ? preload : "none"}
        className={`${styles.video} ${videoClassName}`}
        style={{ visibility: hasPlayingFrame ? "visible" : "hidden" }}
        onCanPlay={() => setHasPlayingFrame(true)}
        onLoadedData={() => setHasPlayingFrame(true)}
        onPlaying={() => setHasPlayingFrame(true)}
        onError={() => setHasPlayingFrame(false)}
      >
        {videoCanLoad ? <source src={src} type="video/webm" /> : null}
      </video>
    </div>
  );
}
