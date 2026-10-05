"use client";

import { useEffect, useRef } from "react";

/** Uses IntersectionObserver to activate CSS reveals owned by this section. */
export default function ScrollReveal() {
  const marker = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const scope = marker.current?.parentElement;
    const targets = scope?.querySelectorAll<HTMLElement>("[data-scroll-reveal]");
    if (!scope || !targets?.length || !("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("css-reveal-visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

    targets.forEach((target) => {
      target.classList.add("css-reveal-pending");
      observer.observe(target);
    });

    return () => {
      observer.disconnect();
      targets.forEach((target) => {
        target.classList.remove("css-reveal-pending", "css-reveal-visible");
      });
    };
  }, []);

  return <span ref={marker} hidden aria-hidden="true" />;
}
