"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import styles from "./PublicLoading.module.css";

const LOADING_IMAGE = "https://ajgwjvvdvjjgkufohvwt.supabase.co/storage/v1/object/public/portfolio-media/Monochrome%20Stag%20Beneath%20the%20Moon.png";

export default function PublicLoading() {
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const start = performance.now();
    let frame = 0;
    const update = (now: number) => {
      const value = Math.min(100, Math.round(((now - start) / 1700) * 100));
      setProgress(value);
      if (value < 100) frame = window.requestAnimationFrame(update);
      else if (!reduceMotion) window.setTimeout(() => setExiting(true), 180);
    };
    frame = window.requestAnimationFrame(update);
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <main className={`${styles.loader} ${exiting ? styles.exiting : ""}`} aria-label="Loading portfolio" aria-busy="true">
      <Image className={styles.art} src={LOADING_IMAGE} alt="" fill priority sizes="100vw" />
      <div className={styles.atmosphere} aria-hidden="true" />
      <div className={`${styles.corner} ${styles.topLeft}`}>Developer<br />Builder<br />Designer<br />Problem Solver</div>
      <div className={`${styles.corner} ${styles.topRight}`}>Kolkata, India<br />{"// 2026"}</div>
      <div className={`${styles.corner} ${styles.bottomLeft}`}>Same curiosity.<br />Bigger things.</div>
      <div className={`${styles.corner} ${styles.bottomRight}`}>V2.0<br />A more open<br />tomorrow.</div>
      <section className={styles.center} aria-label="Loading progress">
        <div className={styles.bar} role="progressbar" aria-label="Loading progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
          <span className={styles.barFill} style={{ width: `${progress}%` }} />
        </div>
        <div className={styles.mobileLoader} role="progressbar" aria-label="Loading progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
          <span className={styles.mobileTrack} />
          <span className={styles.mobileFill} style={{ background: `conic-gradient(from -45deg, #efefeb ${progress * 3.6}deg, transparent ${progress * 3.6}deg)` }} />
        </div>
      </section>
    </main>
  );
}
