/* eslint-disable react/jsx-no-comment-textnodes */

"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";

import type { ProjectContent } from "@/lib/projects/get-project-content";
import styles from "./ProjectsPageClient.module.css";
import ScrollReveal from "@/components/ScrollReveal";

type ProjectsPageClientProps = {
  projects: ProjectContent[];
  categories: string[];
};


function getImageSrc(image: ProjectContent["image"]): string | null {
  if (!image) return null;
  if (typeof image === "string") return image;
  return image.src;
}

function normalize(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function getProjectTypeLabel(project: ProjectContent) {
  return project.projectType || "Project";
}

function matchesFilter(project: ProjectContent, filter: string) {
  if (filter === "All") return true;

  const target = normalize(filter);

  return (
    project.categories.some((category) => normalize(category) === target) ||
    normalize(project.projectType).includes(target)
  );
}

export default function ProjectsPageClient({
  projects,
  categories,
}: ProjectsPageClientProps) {
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const isDesktop = useSyncExternalStore(
    (onStoreChange) => {
      const mediaQuery = window.matchMedia("(min-width: 1221px)");
      mediaQuery.addEventListener("change", onStoreChange);
      return () => mediaQuery.removeEventListener("change", onStoreChange);
    },
    () => window.matchMedia("(min-width: 1221px)").matches,
    () => false,
  );

  // Real project cards per page. The "New ideas" card is NOT counted here —
  // it is always appended after them, on every page.
  const projectsPerPage = isDesktop ? 8 : 9;
  const featuredProject = projects.find((project) => project.featured) ?? null;
  const filters = ["All", ...categories];

  const filteredProjects = useMemo(() => {
    const query = normalize(search);

    return projects.filter((project) => {
      if (!matchesFilter(project, activeFilter)) return false;
      if (!query) return true;

      const searchableText = [
        project.title,
        project.shortDescription,
        project.description,
        project.projectType,
        project.location,
        ...project.categories,
        ...project.technologies,
      ]
        .filter(Boolean)
        .join(" ");

      return normalize(searchableText).includes(query);
    });
  }, [activeFilter, projects, search]);

  const projectGridItems = useMemo(() => {
    if (!featuredProject) return filteredProjects;

    return filteredProjects.filter(
      (project) => project.id !== featuredProject.id,
    );
  }, [featuredProject, filteredProjects]);

  const totalPages = Math.max(
    1,
    Math.ceil(projectGridItems.length / projectsPerPage),
  );

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const visibleProjects = useMemo(() => {
    const start = (safeCurrentPage - 1) * projectsPerPage;
    return projectGridItems.slice(start, start + projectsPerPage);
  }, [projectGridItems, projectsPerPage, safeCurrentPage]);

  const featuredImage = featuredProject
    ? getImageSrc(featuredProject.image)
    : null;

  const featuredTags = featuredProject?.technologies.slice(0, 4) ?? [];

  const setFilter = (filter: string) => {
    setActiveFilter(filter);
    setCurrentPage(1);
  };

  const setSearchQuery = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  return (
    <section className={styles.projectsSection}>
      <div className={styles.projectsShell}>
        <div className={styles.sectionMeta}>
          <span>// 002&nbsp;&nbsp; ALL PROJECTS</span>
          <span>
            {projectGridItems.length.toString().padStart(2, "0")} PROJECT
            {projectGridItems.length === 1 ? "" : "S"}
          </span>
        </div>

        <div className={styles.filtersRow}>
          <div className={styles.filters}>
            {filters.map((filter) => (
              <button
                key={filter}
                type="button"
                className={`${styles.filterButton} ${
                  activeFilter === filter ? styles.filterButtonActive : ""
                }`}
                onClick={() => setFilter(filter)}
              >
                {filter}
              </button>
            ))}

            <label className={styles.search}>
              <span>⌕</span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search projects..."
                aria-label="Search projects"
              />
            </label>
          </div>
        </div>

        <div className={styles.mobileFilter}>
          <select
            value={activeFilter}
            onChange={(event) => setFilter(event.target.value)}
            aria-label="Filter projects"
          >
            {filters.map((filter) => (
              <option key={filter} value={filter}>
                {filter === "All" ? "All Projects" : filter}
              </option>
            ))}
          </select>

          <button
            type="button"
            className={styles.mobileSearch}
            onClick={() => {
              const query = window.prompt("Search projects", search);
              if (query !== null) setSearchQuery(query);
            }}
            aria-label="Search projects"
          >
            ⌕
          </button>
        </div>

        {featuredProject && (
          <section className={styles.featured} data-scroll-reveal>
            <div className={styles.featuredGrid}>
              <div className={styles.featuredCopy}>
                <div className={styles.kicker}>
                  // 003&nbsp;&nbsp; FEATURED PROJECT
                </div>

                <h2>{featuredProject.title}</h2>

                {featuredTags.length > 0 && (
                  <div className={styles.tags}>
                    {featuredTags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                )}

                <p>{featuredProject.shortDescription}</p>

                <div className={styles.actions}>
                  <Link
                    href={featuredProject.href}
                    className={styles.actionPrimary}
                  >
                    View Project <span>→</span>
                  </Link>

                  <Link href={featuredProject.href} className={styles.action}>
                    Case Study
                  </Link>
                </div>
              </div>

              <Link
                href={featuredProject.href}
                className={styles.featuredImage}
              >
                {featuredImage ? (
                  <Image
                    src={featuredImage}
                    alt={featuredProject.title}
                    fill
                    loading="lazy"
                    className={styles.featuredImg}
                    sizes="(max-width: 767px) 100vw, (max-width: 1220px) 50vw, 40vw"
                  />
                ) : (
                  <div className={styles.imagePlaceholder}>NO IMAGE</div>
                )}
              </Link>

              <aside className={styles.impact}>
                <div className={styles.impactTitle}>// IMPACT</div>

                <div className={styles.impactStat}>
                  <div className={styles.impactNumber}>
                    {featuredProject.year ?? "—"}
                  </div>
                  <div className={styles.impactLabel}>Project Year</div>
                </div>

                <div className={styles.impactStat}>
                  <div className={styles.impactNumber}>
                    {featuredProject.technologies.length}
                  </div>
                  <div className={styles.impactLabel}>Technologies</div>
                </div>

                <div className={styles.impactStat}>
                  <div className={styles.impactNumber}>
                    {featuredProject.categories.length}
                  </div>
                  <div className={styles.impactLabel}>Categories</div>
                </div>

                {featuredProject.technologies.length > 0 && (
                  <div className={styles.tech}>
                    <div className={styles.techLabel}>// Tech Stack</div>
                    <div className={styles.techIcons}>
                      {featuredProject.technologies.slice(0, 4).map((tech) => (
                        <span key={tech}>{tech}</span>
                      ))}
                    </div>
                  </div>
                )}
              </aside>
            </div>
          </section>
        )}

        <section className={styles.projects}>
          <div className={styles.projectGrid}>
            <ScrollReveal />
            {visibleProjects.map((project, index) => {
              const imageSrc = getImageSrc(project.image);
              const projectNumber =
                (safeCurrentPage - 1) * projectsPerPage + index + 4;

              return (
                <Link
                  href={project.href}
                  key={project.id}
                  data-scroll-reveal
                  className={styles.card}
                >
                  <div className={styles.cardImage}>
                    {imageSrc ? (
                      <Image
                        src={imageSrc}
                        alt={project.title}
                        fill
                        className={styles.cardImg}
                        sizes="(max-width: 767px) 92px, (max-width: 1220px) 50vw, 33vw"
                      />
                    ) : (
                      <div className={styles.imagePlaceholder}>NO IMAGE</div>
                    )}
                  </div>

                  <div className={styles.cardMeta}>
                    // {String(projectNumber).padStart(3, "0")}
                  </div>

                  <h3 className={styles.cardTitle}>{project.title}</h3>

                  <p className={styles.cardDesc}>
                    {project.shortDescription || getProjectTypeLabel(project)}
                  </p>

                  <div className={styles.cardBottom}>
                    <div className={styles.cardTags}>
                      {project.technologies.slice(0, 3).map((technology) => (
                        <span key={technology}>{technology}</span>
                      ))}
                    </div>

                    <span className={styles.arrow}>↗</span>
                  </div>
                </Link>
              );
            })}

            {/* Always the last cell of the grid, on every page, regardless of
                filters/search/pagination. Behaves like a button → /contact. */}
            <Link href="/contact" className={styles.emptyCard}>
              <div className={styles.emptyInner}>
                <span className={styles.plus}>+</span>
                <strong>NEW IDEAS</strong>
                <span>ALWAYS WELCOME</span>
              </div>
            </Link>
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                type="button"
                className={styles.pageBtn}
                disabled={safeCurrentPage === 1}
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                aria-label="Previous page"
              >
                ←
              </button>

              {Array.from({ length: totalPages }, (_, index) => {
                const page = index + 1;

                return (
                  <button
                    key={page}
                    type="button"
                    className={`${styles.pageBtn} ${
                      safeCurrentPage === page ? styles.pageBtnActive : ""
                    }`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                );
              })}

              <button
                type="button"
                className={styles.pageBtn}
                disabled={safeCurrentPage === totalPages}
                onClick={() =>
                  setCurrentPage((page) => Math.min(totalPages, page + 1))
                }
                aria-label="Next page"
              >
                →
              </button>
            </div>
          )}
        </section>
      </div>

      {/* =========================
          BOTTOM CTA (from reference HTML)
      ========================= */}
<section className={styles.cta}>
  <div className={styles.ctaInner}>
    <div className={styles.ctaCopy}>
      <div className={styles.ctaKicker}>// 013</div>

      <h2 className={styles.ctaTitle}>
        HAVE A PROJECT
        <br />
        IN MIND?
      </h2>
    </div>

    <div className={styles.ctaMessage}>
      <p className={styles.ctaText}>
        Let&apos;s build something great together.
        <br />
        I&apos;m always open to new opportunities,
        <br />
        collaborations, or just a good conversation.
      </p>
    </div>

    <Link href="/contact" className={styles.ctaAction}>
      <span>Get In Touch</span>
      <span>→</span>
    </Link>
  </div>

  <div className={styles.ctaFade} />

  <div className={styles.ctaArt}>
    <Image
      src="/cta-image.png"
      alt=""
      fill
      className={styles.ctaArtImage}
      sizes="(max-width: 767px) 55vw, (max-width: 1220px) 33vw, 33vw"
    />
  </div>
</section>
    </section>
  );
}
