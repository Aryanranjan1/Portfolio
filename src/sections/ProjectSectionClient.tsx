/* eslint-disable react/jsx-no-comment-textnodes */

"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from "react";

import type { ProjectContent } from "@/lib/projects/get-project-content";
import ScrollReveal from "@/components/ScrollReveal";
import layout from "./ProjectSectionLayout.module.css";

export type ProjectsSectionTheme = "light" | "dark";

type ProjectsSectionClientProps = {
  projects: ProjectContent[];
  /** Colour theme. Defaults to "light". */
  theme?: ProjectsSectionTheme;
};

export default function ProjectsSectionClient({
  projects,
  theme = "light",
}: ProjectsSectionClientProps) {
  /* Anything other than "dark" falls back to light */
  const resolvedTheme: ProjectsSectionTheme =
    theme === "dark" ? "dark" : "light";

  const projectCount = projects.length;

  /* Featured project */
  const [featuredIndex, setFeaturedIndex] = useState(0);

  /* More Projects slider position */
  const [sliderIndex, setSliderIndex] = useState(0);

  /* Number of visible cards */
  const [visibleCards, setVisibleCards] = useState(4);

  useEffect(() => {
    const updateVisibleCards = () => {
      if (window.innerWidth <= 520) {
        setVisibleCards(1);
      } else if (window.innerWidth <= 1023) {
        setVisibleCards(2);
      } else {
        setVisibleCards(4);
      }
    };

    updateVisibleCards();
    window.addEventListener("resize", updateVisibleCards);

    return () => {
      window.removeEventListener("resize", updateVisibleCards);
    };
  }, []);

  const currentProject = projects[featuredIndex] ?? null;

  const projectNumber = String(featuredIndex + 1).padStart(2, "0");
  const totalProjects = String(projectCount).padStart(2, "0");
  const detailCounter = String(featuredIndex + 1).padStart(3, "0");

  /* Slider limits */
  const maxSliderIndex = Math.max(0, projectCount - visibleCards);
  const safeSliderIndex = Math.min(sliderIndex, maxSliderIndex);
  const canGoPrevious = safeSliderIndex > 0;
  const canGoNext = safeSliderIndex < maxSliderIndex;

  /* Featured project navigation (keyboard) */
  const previousFeaturedProject = useCallback(() => {
    if (projectCount === 0) return;
    setFeaturedIndex((index) =>
      index === 0 ? projectCount - 1 : index - 1,
    );
  }, [projectCount]);

  const nextFeaturedProject = useCallback(() => {
    if (projectCount === 0) return;
    setFeaturedIndex((index) =>
      index === projectCount - 1 ? 0 : index + 1,
    );
  }, [projectCount]);

  /* More Projects slider navigation */
  const previousSlide = useCallback(() => {
    setSliderIndex((index) => Math.max(0, index - 1));
  }, []);

  const nextSlide = useCallback(() => {
    setSliderIndex((index) => Math.min(maxSliderIndex, index + 1));
  }, [maxSliderIndex]);

  /* Keyboard navigation */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;

      if (
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "SELECT" ||
        target?.isContentEditable
      ) {
        return;
      }

      if (event.key === "ArrowLeft") previousFeaturedProject();
      if (event.key === "ArrowRight") nextFeaturedProject();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [nextFeaturedProject, previousFeaturedProject]);

  /* Slider transform */
  const sliderStyle = useMemo(
    () =>
      ({
        "--visible-cards": visibleCards,
        transform: `translateX(calc(${safeSliderIndex} * (-100% / ${visibleCards})))`,
      }) as CSSProperties,
    [safeSliderIndex, visibleCards],
  );

  if (!currentProject) {
    return null;
  }

  /* Project role */
  const getRole = (project: ProjectContent) => {
    if (
      "role" in project &&
      typeof project.role === "string" &&
      project.role.trim()
    ) {
      return project.role;
    }

    if (project.projectType) return project.projectType;

    if (project.categories.length > 0) return project.categories[0];

    return "DIGITAL PRODUCT";
  };

  /* Project highlights */
  const getHighlights = (project: ProjectContent) => {
    const highlights: string[] = [];

    if (project.categories.length > 0) {
      highlights.push(...project.categories.slice(0, 2));
    }

    if (project.status) {
      highlights.push(project.status);
    }

    return highlights.slice(0, 3);
  };

  return (
    <section
      className={`projects-section ${layout.stableSection}`}
      id="projects"
      data-theme={resolvedTheme}
      aria-labelledby="projects-title"
    >
      <div className={`projects-container ${layout.stableContainer}`}>
        <ScrollReveal />
        {/* ==================================================
            MAIN PROJECT AREA
        ================================================== */}

        <div className={`projects-body ${layout.stableBody}`}>
          {/* LEFT RAIL */}

          <aside className="project-rail">
            <div className="rail-top">
              <div className="micro-label">
                <span className="square" aria-hidden="true" />
                <span>SELECTED WORK</span>
              </div>

              <h2 className="rail-title" id="projects-title">
                PROJECTS
              </h2>

              <p className="rail-description">
                Digital products, web experiences, and systems built with
                purpose.
              </p>

              <p className="rail-categories">DIGITAL / SYSTEMS / WEB</p>
            </div>
          </aside>

          {/* FEATURED PROJECT */}

          <section
            className={`featured-project ${layout.stableFeaturedProject}`}
            data-scroll-reveal
            aria-labelledby="featured-project-title"
          >
            <div className="featured-label">
              <span>// </span>
              <strong>FEATURED PROJECT</strong>
            </div>

            <div className={`featured-frame ${layout.stableFrame}`}>
              <Link
                href={currentProject.href}
                className={`featured-image-link ${layout.stableImageLink}`}
                aria-label={`View ${currentProject.title} project`}
              >
                <div className={`featured-image-wrap ${layout.stableImageWrap}`}>
                  <Image
                    key={currentProject.id}
                    src={currentProject.image?.src ?? "/hero.png"}
                    alt={currentProject.image?.alt ?? currentProject.title}
                    fill
                    loading="lazy"
                    sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 50vw"
                    className="featured-image"
                  />

                  <span className="image-tag">
                    {currentProject.projectType}
                  </span>

                  <span className="image-index">
                    {projectNumber}
                    <span aria-hidden="true"> / </span>
                    {totalProjects}
                  </span>
                </div>
              </Link>
            </div>
          </section>

          {/* PROJECT DETAILS */}

          <section
            className="project-details"
            data-scroll-reveal
            aria-labelledby="featured-project-title"
          >
            <header className="details-header">
              <span>// PROJECT DETAILS</span>
              <span aria-live="polite">{detailCounter}</span>
            </header>

            {/* PROJECT */}

            <div className="detail-row project-name-row">
              <div className="detail-index">{projectNumber}</div>

              <div className="project-name-content">
                <div className="detail-label">PROJECT NAME</div>

                <div className="project-name-line">
                  <span aria-hidden="true" />

                  <h3 className="project-name" id="featured-project-title">
                    {currentProject.title}
                  </h3>

                  <Link
                    href={currentProject.href}
                    className="external-arrow"
                    aria-label={`Open ${currentProject.title}`}
                  >
                    ↗
                  </Link>
                </div>

                <p className="detail-description">
                  {currentProject.shortDescription ||
                    currentProject.description}
                </p>
              </div>
            </div>

            {/* ROLE */}

            <div className="detail-row">
              <div className="detail-index">02</div>

              <div className="detail-content">
                <div className="detail-label">ROLE</div>
                <p className="role">{getRole(currentProject)}</p>
              </div>
            </div>

            {/* STACK */}

            <div className="detail-row">
              <div className="detail-index">03</div>

              <div className="detail-content">
                <div className="detail-label">TECH STACK</div>

                <ul className="stack" aria-label="Technology stack">
                  {currentProject.technologies.map((technology) => (
                    <li className="stack-pill" key={technology}>
                      {technology}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* HIGHLIGHTS */}

            <div className="detail-row">
              <div className="detail-index">04</div>

              <div className="detail-content">
                <div className="detail-label">KEY FEATURES</div>

                <ul className="feature-list">
                  {getHighlights(currentProject).map((highlight) => (
                    <li className="feature-item" key={highlight}>
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* ACTIONS */}

            <div className="detail-actions">
              <Link href={currentProject.href} className="live-button">
                <span>VIEW LIVE PROJECT</span>
                <span aria-hidden="true" className="live-arrow">
                  →
                </span>
              </Link>

              <Link href={currentProject.href} className="case-link">
                <span>VIEW</span>
                <span>CASE STUDY</span>
              </Link>
            </div>
          </section>
        </div>

        {/* ==================================================
            MORE PROJECTS SLIDER
        ================================================== */}

        <section
          className="more-projects"
          data-scroll-reveal
          aria-labelledby="more-projects-title"
        >
          <div className="more-header">
            <h3 id="more-projects-title">// MORE PROJECTS</h3>

            <div className="more-controls">
              <button
                type="button"
                className="nav-button"
                onClick={previousSlide}
                disabled={!canGoPrevious}
                aria-label="Previous projects"
              >
                ←
              </button>

              <button
                type="button"
                className="nav-button"
                onClick={nextSlide}
                disabled={!canGoNext}
                aria-label="Next projects"
              >
                →
              </button>
            </div>
          </div>

          <div className="project-slider">
            <div className="project-slider-track" style={sliderStyle}>
              {projects.map((project, index) => {
                const isActive = project.id === currentProject.id;

                return (
                  <div className="project-slide" key={project.id}>
                    <button
                      type="button"
                      className={`project-card ${
                        isActive ? "project-card-active" : ""
                      }`}
                      onClick={() => setFeaturedIndex(index)}
                      aria-label={`Select ${project.title}`}
                      aria-pressed={isActive}
                    >
                      <div className="project-thumb">
                        {project.image ? (
                          <Image
                            src={project.image.src}
                            alt={project.image.alt || project.title}
                            fill
                            sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 25vw"
                            loading="lazy"
                            className="project-thumb-image"
                          />
                        ) : (
                          <div
                            className="project-thumb-placeholder"
                            aria-hidden="true"
                          />
                        )}
                      </div>

                      <div className="project-card-body">
                        <div className="project-card-topline">
                          <span className="card-title">{project.title}</span>

                          <span className="card-number">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                        </div>

                        <span className="card-type">
                          {project.projectType}
                        </span>
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ==================================================
            "/ BUILD ... IDEAS INTO REALITY"
            Lives directly in .projects-container (not inside the
            rail) so `bottom: 0` pins it to the bottom of the whole
            section, in the left column, beside the slider.
        ================================================== */}

        <div className="rail-bottom-footer" aria-hidden="true">
          <div className="rail-system">{`/ BUILD
/ DESIGN
/ DEPLOY
/ ITERATE`}</div>

          <div className="rail-mark">
            IDEAS
            <br />
            INTO
            <br />
            REALITY
          </div>
        </div>
      </div>

      {/*
        GLOBAL on purpose: styled-jsx scoping does not reach <Link> or
        <Image>, so scoped styles never applied to them. Every selector is
        prefixed with .projects-section so nothing leaks.
      */}
      <style jsx global>{`
        /* ==================================================
           THEME TOKENS
           Light is the default. Dark applies when the component
           receives theme="dark" (rendered as data-theme="dark").
        ================================================== */

        .projects-section {
          --ps-bg: #e1e1e3;
          --ps-fg: #050505;
          --ps-on-fg: #ffffff;
          --ps-fg-hover: #1a1a1a;
          --ps-muted: #71716d;
          --ps-line: rgba(5, 5, 5, 0.32);
          --ps-line-soft: rgba(5, 5, 5, 0.14);
          --ps-surface: #c9c9cb;
          --ps-surface-2: #d7d7d9;
          --ps-chip-bg: rgba(225, 225, 227, 0.88);
          --ps-pill-bg: rgba(255, 255, 255, 0.12);
          --ps-nav-hover-bg: #ffffff;
          --ps-nav-hover-fg: #050505;
          color-scheme: light;
        }

        .projects-section[data-theme="dark"] {
          --ps-bg: #0c0c0d;
          --ps-fg: #ecece8;
          --ps-on-fg: #0c0c0d;
          --ps-fg-hover: #ffffff;
          --ps-muted: #9b9b95;
          --ps-line: rgba(236, 236, 232, 0.28);
          --ps-line-soft: rgba(236, 236, 232, 0.12);
          --ps-surface: #1b1b1d;
          --ps-surface-2: #232325;
          --ps-chip-bg: rgba(12, 12, 13, 0.88);
          --ps-pill-bg: rgba(255, 255, 255, 0.05);
          --ps-nav-hover-bg: #ecece8;
          --ps-nav-hover-fg: #0c0c0d;
          color-scheme: dark;
        }

        /* ==================================================
           BASE
        ================================================== */

        .projects-section {
          width: 100%;
          padding: 28px 5vw;
          overflow: hidden;
          background: var(--ps-bg);
          color: var(--ps-fg);
        }

        .projects-section *,
        .projects-section *::before,
        .projects-section *::after {
          box-sizing: border-box;
        }

        .projects-section a {
          color: inherit;
          text-decoration: none;
        }

        .projects-section button {
          font: inherit;
          color: inherit;
        }

        .projects-section .projects-container {
          position: relative;
          width: min(100%, 1500px);
          margin: 0 auto;
        }

        .projects-section .projects-container::before {
          content: "";
          position: absolute;
          top: 0;
          bottom: 0;
          left: calc((100% - 48px) * 0.55 / 3.05);
          width: 1px;
          background: var(--ps-line);
          z-index: 20;
          pointer-events: none;
        }

        .projects-section .projects-body {
          display: grid;
          grid-template-columns: 0.55fr 1.55fr 0.95fr;
          gap: 24px;
          align-items: stretch;
        }

        /* ==================================================
           LEFT RAIL
        ================================================== */

        .projects-section .project-rail {
          position: relative;
          min-width: 0;
          min-height: 690px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding-right: 24px;
        }

        .projects-section .rail-top {
          display: flex;
          flex-direction: column;
          gap: 26px;
        }

        .projects-section .micro-label {
          display: flex;
          align-items: center;
          gap: 9px;
          color: var(--ps-muted);
          font-family: "DM Mono", monospace;
          font-size: 8px;
          line-height: 1;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .projects-section .square {
          width: 7px;
          height: 7px;
          flex: 0 0 7px;
          background: var(--ps-fg);
        }

        .projects-section .rail-title {
          width: max-content;
          margin: 0;
          color: var(--ps-fg);
          font-family: "Space Grotesk", sans-serif;
          font-size: clamp(52px, 5vw, 78px);
          font-weight: 600;
          line-height: 0.82;
          letter-spacing: -0.075em;
          writing-mode: vertical-rl;
          transform: rotate(180deg);
        }

        .projects-section .rail-description {
          max-width: 165px;
          margin: 0;
          color: var(--ps-muted);
          font-family: "Space Grotesk", sans-serif;
          font-size: 11px;
          line-height: 1.5;
        }

        .projects-section .rail-categories {
          max-width: 165px;
          margin: 0;
          color: var(--ps-fg);
          font-family: "DM Mono", monospace;
          font-size: 8px;
          line-height: 1.45;
          letter-spacing: 0.08em;
        }

        /*
         * "/ BUILD ... IDEAS INTO REALITY"
         * Child of .projects-container, so bottom: 0 = bottom of the
         * whole section. Width matches the rail column (same maths as
         * the vertical divider) so it stays left of the slider.
         */
        .projects-section .rail-bottom-footer {
          position: absolute;
          left: 18px;
          bottom: 0;
          width: calc((100% - 48px) * 0.55 / 3.05 - 18px);
          z-index: 21;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 18px;
        }

        .projects-section .rail-system {
          white-space: pre-line;
          color: var(--ps-muted);
          font-family: "DM Mono", monospace;
          font-size: 8px;
          line-height: 1.45;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .projects-section .rail-mark {
          width: max-content;
          padding: 10px 12px;
          border: 1px solid var(--ps-line);
          color: var(--ps-fg);
          font-family: "DM Mono", monospace;
          font-size: 8px;
          line-height: 1.2;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        /* ==================================================
           FEATURED PROJECT
        ================================================== */

        .projects-section .featured-project {
          min-width: 0;
          display: flex;
          flex-direction: column;
        }

        .projects-section .featured-label {
          height: 34px;
          padding-top: 8px;
          color: var(--ps-muted);
          font-family: "DM Mono", monospace;
          font-size: 8px;
          line-height: 1;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .projects-section .featured-label strong {
          color: var(--ps-fg);
          font-weight: 500;
        }

        /*
         * The frame gets its height from min-height (desktop) or
         * height (tablet/mobile). The link is absolutely positioned
         * inside it, so <Image fill> always has a real box to fill.
         */
        .projects-section .featured-frame {
          position: relative;
          flex: 1;
          min-height: 655px;
          border-top: 1px solid var(--ps-line);
          border-bottom: 1px solid var(--ps-line);
        }

        .projects-section .featured-image-link {
          position: absolute;
          top: 4px;
          bottom: 4px;
          left: 0;
          right: 0;
          display: block;
        }

        .projects-section .featured-image-wrap {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
          background: var(--ps-surface);
        }

        /*
         * GREYSCALE BY DEFAULT, COLOUR ON HOVER
         * - Targets "img" explicitly (higher specificity than any
         *   global img reset) and uses !important so nothing in the
         *   rest of the site can cancel the filter.
         * - Transitions are on the img itself, so the colour fades in.
         */
        .projects-section .featured-image-wrap img.featured-image {
          object-fit: cover;
          filter: grayscale(100%) !important;
          -webkit-filter: grayscale(100%) !important;
          transform: scale(1);
          transform-origin: center center;
          transition:
            transform 500ms cubic-bezier(0.22, 1, 0.36, 1),
            filter 350ms ease,
            -webkit-filter 350ms ease;
          animation: projects-fade 350ms ease;
        }

        .projects-section .featured-image-wrap:hover img.featured-image,
        .projects-section
          .featured-image-link:focus-visible
          .featured-image-wrap
          img.featured-image {
          transform: scale(1.025);
          filter: grayscale(0%) !important;
          -webkit-filter: grayscale(0%) !important;
        }

        /*
         * Only real touch devices (no hover AND coarse pointer) get
         * colour by default. Plain (hover: none) also matches some
         * hybrid laptops / emulators and was switching the effect off.
         */
        @media (hover: none) and (pointer: coarse) {
          .projects-section .featured-image-wrap img.featured-image {
            filter: grayscale(0%) !important;
            -webkit-filter: grayscale(0%) !important;
          }
        }

        @keyframes projects-fade {
          from {
            opacity: 0.35;
          }
          to {
            opacity: 1;
          }
        }

        .projects-section .image-tag {
          position: absolute;
          left: 12px;
          bottom: 12px;
          z-index: 2;
          padding: 6px 8px;
          background: var(--ps-fg);
          color: var(--ps-on-fg);
          font-family: "DM Mono", monospace;
          font-size: 8px;
          line-height: 1;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .projects-section .image-index {
          position: absolute;
          right: 12px;
          bottom: 12px;
          z-index: 2;
          padding: 6px 8px;
          background: var(--ps-chip-bg);
          color: var(--ps-fg);
          font-family: "DM Mono", monospace;
          font-size: 8px;
          line-height: 1;
          letter-spacing: 0.06em;
        }

        /* ==================================================
           DETAILS
        ================================================== */

        .projects-section .project-details {
          min-width: 0;
          min-height: 690px;
          padding-left: 24px;
          border-left: 1px solid var(--ps-line);
          display: flex;
          flex-direction: column;
        }

        .projects-section .details-header {
          height: 34px;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding-top: 8px;
          padding-bottom: 8px;
          border-bottom: 1px solid var(--ps-line);
          color: var(--ps-muted);
          font-family: "DM Mono", monospace;
          font-size: 8px;
          line-height: 1;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .projects-section .detail-row {
          padding: 20px 0;
          border-bottom: 1px solid var(--ps-line-soft);
        }

        .projects-section .project-name-row {
          padding-top: 22px;
        }

        .projects-section .detail-index {
          display: block;
          margin-bottom: 15px;
          color: var(--ps-muted);
          font-family: "DM Mono", monospace;
          font-size: 8px;
          line-height: 1;
        }

        .projects-section .detail-label {
          margin-bottom: 11px;
          color: var(--ps-muted);
          font-family: "DM Mono", monospace;
          font-size: 8px;
          line-height: 1;
          letter-spacing: 0.07em;
          text-transform: uppercase;
        }

        .projects-section .project-name-content {
          min-width: 0;
        }

        .projects-section .project-name-line {
          display: grid;
          grid-template-columns: 42px minmax(0, 1fr) 30px;
          align-items: start;
        }

        .projects-section .project-name {
          grid-column: 2;
          margin: 0;
          color: var(--ps-fg);
          font-family: "Space Grotesk", sans-serif;
          font-size: clamp(24px, 2vw, 31px);
          font-weight: 500;
          line-height: 0.98;
          letter-spacing: -0.055em;
        }

        .projects-section .external-arrow {
          grid-column: 3;
          justify-self: end;
          color: var(--ps-fg);
          font-family: "DM Mono", monospace;
          font-size: 28px;
          line-height: 0.7;
          transform: translateY(1px);
          transition: transform 180ms ease;
        }

        .projects-section .project-name-row:hover .external-arrow {
          transform: translate(3px, -3px);
        }

        .projects-section .detail-description {
          max-width: 335px;
          margin: 15px 0 0 42px;
          color: var(--ps-muted);
          font-family: "Space Grotesk", sans-serif;
          font-size: 10px;
          line-height: 1.55;
        }

        .projects-section .detail-content {
          margin-left: 42px;
        }

        .projects-section .role {
          margin: 0;
          color: var(--ps-fg);
          font-family: "Space Grotesk", sans-serif;
          font-size: 12px;
          line-height: 1.35;
        }

        .projects-section .stack {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .projects-section .stack-pill {
          padding: 7px 10px;
          border: 1px solid var(--ps-line);
          background: var(--ps-pill-bg);
          color: var(--ps-fg);
          font-family: "Space Grotesk", sans-serif;
          font-size: 9px;
          line-height: 1;
        }

        .projects-section .feature-list {
          display: flex;
          flex-direction: column;
          gap: 7px;
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .projects-section .feature-item {
          position: relative;
          padding-left: 15px;
          color: var(--ps-muted);
          font-family: "Space Grotesk", sans-serif;
          font-size: 11px;
          line-height: 1.2;
        }

        .projects-section .feature-item::before {
          content: "+";
          position: absolute;
          left: 0;
          top: -1px;
          color: var(--ps-fg);
          font-family: "DM Mono", monospace;
        }

        /* ==================================================
           ACTION BUTTONS
        ================================================== */

        .projects-section .detail-actions {
          display: flex;
          flex-wrap: wrap;
          align-items: stretch;
          gap: 12px;
          margin-top: auto;
          padding-top: 22px;
          width: 100%;
          min-width: 0;
        }

        .projects-section .live-button,
        .projects-section .case-link {
          position: relative;
          display: inline-flex;
          align-items: center;
          min-height: 48px;
          padding: 0 16px;
          font-family: "DM Mono", monospace;
          font-size: 8px;
          line-height: 1.1;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          white-space: nowrap;
          cursor: pointer;
          overflow: hidden;
          transition:
            transform 220ms cubic-bezier(0.22, 1, 0.36, 1),
            background 220ms ease,
            color 220ms ease,
            border-color 220ms ease;
        }

        /* Primary: black, text left, arrow right */
        .projects-section .live-button {
          flex: 2 1 190px;
          min-width: 0;
          justify-content: space-between;
          background: var(--ps-fg);
          color: var(--ps-on-fg);
          border: 1px solid var(--ps-fg);
        }

        .projects-section .live-button .live-arrow {
          flex: 0 0 auto;
          margin-left: 28px;
          transition: transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        .projects-section .live-button:hover,
        .projects-section .live-button:focus-visible {
          transform: translateY(-2px);
          background: var(--ps-fg-hover);
        }

        .projects-section .live-button:hover .live-arrow,
        .projects-section .live-button:focus-visible .live-arrow {
          transform: translateX(5px);
        }

        /* Secondary: outlined, two stacked lines, arrow on the right */
        .projects-section .case-link {
          flex: 1 1 116px;
          min-width: 116px;
          flex-direction: column;
          align-items: flex-start;
          justify-content: center;
          gap: 3px;
          padding-right: 30px;
          color: var(--ps-fg);
          background: transparent;
          border: 1px solid var(--ps-line);
        }

        .projects-section .case-link::after {
          content: "↗";
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          font-family: "DM Mono", monospace;
          font-size: 11px;
          transition: transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        .projects-section .case-link:hover,
        .projects-section .case-link:focus-visible {
          transform: translateY(-2px);
          background: var(--ps-fg);
          color: var(--ps-on-fg);
          border-color: var(--ps-fg);
        }

        .projects-section .case-link:hover::after,
        .projects-section .case-link:focus-visible::after {
          transform: translate(3px, -4px);
        }

        /* ==================================================
           MORE PROJECTS
        ================================================== */

        .projects-section .more-projects {
          position: relative;
          z-index: 1;
          margin-left: calc((100% - 48px) * 0.55 / 3.05 + 24px);
          margin-top: 16px;
          padding-top: 10px;
          border-top: 1px solid var(--ps-line);
        }

        .projects-section .more-header {
          min-height: 30px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: var(--ps-muted);
          font-family: "DM Mono", monospace;
          font-size: 8px;
          line-height: 1;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .projects-section .more-header h3 {
          margin: 0;
          font: inherit;
        }

        .projects-section .more-controls {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .projects-section .nav-button {
          width: 32px;
          height: 32px;
          display: grid;
          place-items: center;
          padding: 0;
          border: 1px solid var(--ps-line);
          border-radius: 50%;
          background: transparent;
          color: var(--ps-fg);
          font-family: "DM Mono", monospace;
          font-size: 15px;
          cursor: pointer;
          transition:
            background 180ms ease,
            color 180ms ease,
            border-color 180ms ease,
            transform 180ms ease,
            opacity 180ms ease;
        }

        .projects-section .nav-button:hover:not(:disabled),
        .projects-section .nav-button:focus-visible:not(:disabled) {
          background: var(--ps-nav-hover-bg);
          color: var(--ps-nav-hover-fg);
          border-color: var(--ps-fg);
          transform: translateY(-1px);
          outline: none;
        }

        .projects-section .nav-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .projects-section .nav-button:disabled {
          opacity: 0.28;
          cursor: default;
        }

        .projects-section .project-slider {
          width: 100%;
          overflow: hidden;
        }

        .projects-section .project-slider-track {
          display: flex;
          width: 100%;
          transition: transform 400ms cubic-bezier(0.22, 1, 0.36, 1);
          will-change: transform;
        }

        .projects-section .project-slide {
          flex: 0 0 calc(100% / var(--visible-cards));
          min-width: 0;
          padding-right: 20px;
        }

        .projects-section .project-card {
          display: block;
          width: 100%;
          padding: 0;
          border: 1px solid transparent;
          background: transparent;
          text-align: left;
          cursor: pointer;
          transition:
            border-color 180ms ease,
            transform 220ms ease;
        }

        .projects-section .project-card:hover,
        .projects-section .project-card:focus-visible {
          transform: translateY(-2px);
        }

        .projects-section .project-card-active {
          border-color: var(--ps-line);
        }

        .projects-section .project-thumb {
          position: relative;
          width: 100%;
          aspect-ratio: 2.22 / 1;
          overflow: hidden;
          background: var(--ps-surface-2);
        }

        /* Greyscale by default, full colour on hover / focus / selected */
        .projects-section .project-thumb img.project-thumb-image {
          object-fit: cover;
          filter: grayscale(100%) !important;
          -webkit-filter: grayscale(100%) !important;
          transform: scale(1);
          transform-origin: center center;
          transition:
            transform 400ms cubic-bezier(0.22, 1, 0.36, 1),
            filter 300ms ease,
            -webkit-filter 300ms ease;
        }

        .projects-section .project-card:hover .project-thumb img.project-thumb-image,
        .projects-section
          .project-card:focus-visible
          .project-thumb
          img.project-thumb-image,
        .projects-section
          .project-card-active
          .project-thumb
          img.project-thumb-image {
          transform: scale(1.025);
          filter: grayscale(0%) !important;
          -webkit-filter: grayscale(0%) !important;
        }

        .projects-section .project-thumb-placeholder {
          width: 100%;
          height: 100%;
          background: var(--ps-surface-2);
        }

        .projects-section .project-card-body {
          padding: 10px 10px 8px;
        }

        .projects-section .project-card-topline {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 12px;
        }

        .projects-section .card-title {
          min-width: 0;
          color: var(--ps-fg);
          font-family: "Space Grotesk", sans-serif;
          font-size: 13px;
          line-height: 1;
          letter-spacing: -0.025em;
          font-weight: 500;
        }

        .projects-section .card-number {
          flex: 0 0 auto;
          color: var(--ps-muted);
          font-family: "DM Mono", monospace;
          font-size: 8px;
          line-height: 1;
        }

        .projects-section .card-type {
          display: block;
          margin-top: 6px;
          color: var(--ps-muted);
          font-family: "DM Mono", monospace;
          font-size: 7px;
          line-height: 1;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        /* ==================================================
           TABLET  (<= 1023px)
        ================================================== */

        @media (max-width: 1023px) {
          .projects-section .projects-body {
            grid-template-columns: 0.42fr 1.35fr 0.9fr;
            gap: 16px;
          }

          .projects-section .project-rail {
            padding-right: 16px;
          }

          .projects-section .rail-bottom-footer {
            width: calc((100% - 32px) * 0.42 / 2.67 - 18px);
          }

          .projects-section .projects-container::before {
            left: calc((100% - 32px) * 0.42 / 2.67);
          }

          .projects-section .project-details {
            padding-left: 16px;
          }

          .projects-section .more-projects {
            margin-left: calc((100% - 32px) * 0.42 / 2.67 + 16px);
          }

          .projects-section .detail-description,
          .projects-section .detail-content {
            margin-left: 28px;
          }

          .projects-section .project-name-line {
            grid-template-columns: 28px minmax(0, 1fr) 25px;
          }

          .projects-section .project-slide {
            padding-right: 12px;
          }

          .projects-section .live-button {
            flex-basis: 170px;
          }

          .projects-section .case-link {
            min-width: 108px;
            flex-basis: 108px;
          }
        }

        /* ==================================================
           MOBILE  (<= 767px)
        ================================================== */

        @media (max-width: 767px) {
          .projects-section {
            padding: 24px;
            overflow: visible;
          }

          .projects-section .projects-body {
            display: flex;
            flex-direction: column;
            gap: 28px;
          }

          .projects-section .projects-container::before {
            display: none;
          }

          .projects-section .project-rail {
            min-height: 0;
            padding-right: 0;
            padding-bottom: 20px;
            border-bottom: 1px solid var(--ps-line);
          }

          .projects-section .rail-top {
            gap: 18px;
          }

          /* Footer becomes a normal row at the very bottom of the section */
          .projects-section .rail-bottom-footer {
            position: static;
            width: 100%;
            margin-top: 28px;
            padding-top: 20px;
            border-top: 1px solid var(--ps-line);
            flex-direction: row;
            align-items: flex-end;
            justify-content: space-between;
            gap: 16px;
          }

          .projects-section .rail-title {
            writing-mode: horizontal-tb;
            transform: none;
            font-size: clamp(56px, 13vw, 86px);
          }

          .projects-section .rail-description {
            max-width: 520px;
          }

          .projects-section .featured-label {
            height: 30px;
          }

          /* flex: none stops the frame collapsing to 0 height */
          .projects-section .featured-frame {
            flex: none;
            min-height: 240px;
            height: 62vw;
            max-height: 560px;
          }

          .projects-section .project-details {
            min-height: 0;
            border-left: 0;
            padding-left: 0;
          }

          .projects-section .detail-actions {
            margin-top: 0;
          }

          .projects-section .more-projects {
            margin-left: 0;
            margin-top: 28px;
          }

          .projects-section .project-slide {
            padding-right: 14px;
          }
        }

        /* ==================================================
           MOBILE  (<= 520px)
        ================================================== */

        @media (max-width: 520px) {
          .projects-section {
            padding: 20px;
          }

          .projects-section .project-name {
            font-size: 25px;
            line-height: 1;
            letter-spacing: -0.045em;
          }

          .projects-section .detail-row {
            padding: 18px 0;
          }

          .projects-section .detail-description,
          .projects-section .detail-content {
            margin-left: 0;
          }

          .projects-section .detail-description {
            margin-top: 14px;
            max-width: 100%;
          }

          .projects-section .project-name-line {
            grid-template-columns: minmax(0, 1fr) 26px;
          }

          .projects-section .project-name-line > span:first-child {
            display: none;
          }

          .projects-section .project-name-line .project-name {
            grid-column: 1;
            min-width: 0;
          }

          .projects-section .project-name-line .external-arrow {
            grid-column: 2;
            grid-row: 1;
            justify-self: end;
          }

          /* Buttons stack; flex: 0 0 auto so flex-basis never becomes height */
          .projects-section .detail-actions {
            flex-direction: column;
            flex-wrap: nowrap;
            align-items: stretch;
            gap: 10px;
          }

          .projects-section .live-button,
          .projects-section .case-link {
            flex: 0 0 auto;
            width: 100%;
            min-width: 0;
          }

          .projects-section .case-link {
            min-height: 46px;
          }

          .projects-section .project-slide {
            padding-right: 0;
          }

          .projects-section .project-slider-track {
            transition-duration: 350ms;
          }

          .projects-section .project-thumb {
            aspect-ratio: 2.2 / 1;
          }
        }

        /* ==================================================
           REDUCED MOTION
        ================================================== */

        @media (prefers-reduced-motion: reduce) {
          .projects-section *,
          .projects-section *::before,
          .projects-section *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </section>
  );
}
