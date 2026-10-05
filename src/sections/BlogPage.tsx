/* eslint-disable react/jsx-no-comment-textnodes */
import Image from "next/image";
import Link from "next/link";
import styles from "./BlogPage.module.css";
import ScrollReveal from "@/components/ScrollReveal";

type BlogArticle = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  featured: boolean;
  publishedAt: Date | string | null;
  category: {
    name: string;
    slug: string;
  };
  image: {
    url: string;
    altText: string | null;
  } | null;
};

type SearchParams = {
  q?: string;
  category?: string;
  sort?: string;
  page?: string;
};

type BlogCategory = { name: string; slug: string; total: number };

type BlogPageProps = {
  articles: BlogArticle[];
  featured: BlogArticle | null;
  categories: BlogCategory[];
  totalPages: number;
  currentPage: number;
  searchParams?: SearchParams;
};

function formatDate(value: Date | string | null) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
    .format(date)
    .toUpperCase();
}

function readTime(article: BlogArticle) {
  const words = `${article.title} ${article.excerpt ?? ""}`
    .trim()
    .split(/\s+/).length;

  return Math.max(4, Math.ceil(words / 45));
}

function buildHref(
  current: SearchParams | undefined,
  updates: Partial<SearchParams>,
) {
  const params = new URLSearchParams();

  const merged = {
    q: current?.q,
    category: current?.category,
    sort: current?.sort,
    page: current?.page,
    ...updates,
  };

  Object.entries(merged).forEach(([key, value]) => {
    if (
      value &&
      value !== "all" &&
      value !== "latest" &&
      value !== "1"
    ) {
      params.set(key, value);
    }
  });

  const query = params.toString();

  return query ? `/blog?${query}` : "/blog";
}

function Arrow({ className = "" }: { className?: string }) {
  return (
    <span className={`${styles.diagonalArrow} ${className}`}>
      ↗
    </span>
  );
}

function SearchBox({
  value,
  mobile = false,
}: {
  value: string;
  mobile?: boolean;
}) {
  return (
    <form
      className={styles.searchBox}
      action="/blog"
      method="get"
    >
      <span className={styles.searchIcon}>⌕</span>

      <input
        name="q"
        defaultValue={value}
        type="search"
        placeholder="Search articles..."
        aria-label="Search articles"
      />

      {mobile && (
        <input
          type="hidden"
          name="page"
          value="1"
        />
      )}
    </form>
  );
}

function TopicList({
  current,
  topics,
}: {
  current?: SearchParams;
  topics: BlogCategory[];
}) {
  return (
    <div className={styles.topicList}>
      {topics.slice(0, 5).map((topic, index) => (
        <Link
          key={topic.slug}
          href={buildHref(current, {
            category: topic.slug,
            page: "1",
          })}
          className={styles.topic}
        >
          <span className={styles.topicLeft}>
            <span className={styles.topicNumber}>
              {String(index + 1).padStart(2, "0")}
            </span>

            <span>{topic.name}</span>
          </span>

          <span className={styles.topicRight}>
            <span className={styles.topicCount}>
              ({topic.total})
            </span>

            <Arrow />
          </span>
        </Link>
      ))}
    </div>
  );
}

function Quote() {
  return (
    <div className={styles.quote}>
      <div className={styles.quoteText}>
        “Good ideas deserve
        <br />
        good documentation.”
      </div>

      <div className={styles.quoteLine} />
    </div>
  );
}

function FeaturedArticle({
  article,
  responsive = false,
}: {
  article: BlogArticle;
  responsive?: boolean;
}) {
  return (
    <article
      data-scroll-reveal
      className={
        responsive
          ? styles.responsiveFeaturedCard
          : styles.featuredCard
      }
    >
      <Link
        href={`/blog/${article.slug}`}
        className={
          responsive
            ? styles.responsiveFeaturedImage
            : styles.featuredImage
        }
        aria-label={`Read ${article.title}`}
      >
        {article.image?.url ? (
          <Image
            src={article.image.url}
            alt={article.image.altText || article.title}
            fill
            sizes={
              responsive
                ? "(max-width: 500px) 100vw, (max-width: 1100px) 60vw, 225px"
                : "225px"
            }
          />
        ) : null}
      </Link>

      <div
        className={
          responsive
            ? styles.responsiveFeaturedInfo
            : styles.featuredInfo
        }
      >
        <span
          className={
            responsive
              ? styles.responsiveFeaturedCategory
              : styles.featuredCategory
          }
        >
          {article.category.name}
        </span>

        <Link
          href={`/blog/${article.slug}`}
          className={
            responsive
              ? styles.responsiveFeaturedTitle
              : styles.featuredTitle
          }
        >
          {article.title}
        </Link>

        {article.excerpt && (
          <p
            className={
              responsive
                ? styles.responsiveFeaturedDescription
                : styles.featuredDescription
            }
          >
            {article.excerpt}
          </p>
        )}

        <div
          className={
            responsive
              ? styles.responsiveFeaturedBottom
              : styles.featuredBottom
          }
        >
          <span>
            {formatDate(article.publishedAt)} •{" "}
            {readTime(article)} MIN READ
          </span>

          <Arrow />
        </div>
      </div>
    </article>
  );
}

export default function BlogPage({
  articles,
  featured,
  categories,
  totalPages,
  currentPage,
  searchParams,
}: BlogPageProps) {
  const activeCategory =
    searchParams?.category ?? "all";

  const oldestFirst =
    searchParams?.sort === "oldest";

  const visibleArticles = articles;

  const sortHref = buildHref(searchParams, {
    sort: oldestFirst
      ? "latest"
      : "oldest",
    page: "1",
  });

  const previousHref = buildHref(
    searchParams,
    {
      page: String(
        Math.max(
          1,
          currentPage - 1,
        ),
      ),
    },
  );

  const nextHref = buildHref(
    searchParams,
    {
      page: String(
        Math.min(
          totalPages,
          currentPage + 1,
        ),
      ),
    },
  );

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div
          className={`${styles.heroImage} public-hero-media-enter`}
          aria-hidden="true"
        />

        <div
          className={styles.heroOverlay}
        />

        <div
          className={styles.heroNoise}
        />

        <div className={styles.heroContent}>
          <div className={styles.heroLabel}>
            // BLOG
          </div>

          <div className={styles.heroBottom}>
            <div>
              <h1
                className={`${styles.heroTitle} public-hero-content-enter`}
              >
                IDEAS
                <br />
                IN PROGRESS.
              </h1>

              <div
                className={styles.heroLine}
              />

              <p
                className={
                  styles.heroDescription
                }
              >
                Notes, learnings, and thoughts
                <br />
                on building a better tomorrow.
              </p>
            </div>

            <div
              className={styles.heroMeta}
            >
              TECHNOLOGY
              <br />
              SYSTEMS
              <br />
              PEOPLE
              <br />
              A MORE OPEN
              <br />
              TOMORROW
            </div>
          </div>

          <div
            className={styles.heroIndex}
          >
            // 002
          </div>
        </div>
      </section>

      <section className={styles.content}>
        <div className={styles.toolbar}>
          <div className={styles.sectionLabel}>
            <span>// 001</span>
            <span>ARTICLES</span>
          </div>

          <div className={styles.categories}>
                {[
                  { label: "All", value: "all" },
                  ...categories.map((item) => ({ label: item.name, value: item.slug })),
                ].map((category) => (
              <Link
                key={category.value}
                href={buildHref(
                  searchParams,
                  {
                    category:
                      category.value,
                    page: "1",
                  },
                )}
                className={`${styles.category} ${
                  activeCategory ===
                  category.value
                    ? styles.active
                    : ""
                }`}
              >
                {category.label}
              </Link>
            ))}

            <Link
              href={sortHref}
              className={styles.sort}
            >
              SORT:{" "}
              {oldestFirst
                ? "OLDEST ↑"
                : "LATEST ↓"}
            </Link>
          </div>

          <Link
            href={sortHref}
            className={styles.sortMobile}
          >
            SORT:{" "}
            {oldestFirst
              ? "OLDEST ↑"
              : "LATEST ↓"}
          </Link>
        </div>

        <section
          aria-label="Featured article"
            className={
              styles.responsiveFeatured
            }
        >
            <ScrollReveal />
            <div
              className={
                styles.responsiveFeaturedMain
              }
            >
              <div
                className={
                  styles.responsiveFeaturedHeading
                }
              >
                // 003&nbsp;&nbsp; FEATURED
              </div>

              {featured ? (
                <FeaturedArticle article={featured} responsive />
              ) : (
                <p className={styles.featuredEmpty}>No published article is currently marked as featured.</p>
              )}
            </div>

            <aside
              data-scroll-reveal
              className={
                styles.responsiveFeaturedSide
              }
            >
              <div
                className={
                  styles.responsiveSideSection
                }
              >
                <div
                  className={
                    styles.responsiveSideTitle
                  }
                >
                  // 002&nbsp;&nbsp; SEARCH
                </div>

                <SearchBox
                  value={
                    searchParams?.q ?? ""
                  }
                  mobile
                />
              </div>

              <div
                className={
                  styles.responsiveSideSection
                }
              >
                <div
                  className={
                    styles.responsiveSideTitle
                  }
                >
                  // 004&nbsp;&nbsp; POPULAR TOPICS
                </div>

                <TopicList
                  current={searchParams}
                  topics={categories}
                />
              </div>

              <Quote />
            </aside>
        </section>

        <div className={styles.mainGrid}>
          <div>
            {visibleArticles.length > 0 ? (
              <div
                className={
                  styles.articleGrid
                }
              >
                <ScrollReveal />
                {visibleArticles.map(
                  (article) => (
                    <article
                      data-scroll-reveal
                      className={
                        styles.article
                      }
                      key={article.id}
                    >
                      <Link
                        href={`/blog/${article.slug}`}
                        className={
                          styles.articleImage
                        }
                        aria-label={`Read ${article.title}`}
                      >
                        {article.image
                          ?.url ? (
                          <Image
                            src={
                              article.image
                                .url
                            }
                            alt={
                              article.image
                                .altText ||
                              article.title
                            }
                            fill
                            sizes="(max-width: 500px) 105px, (max-width: 1100px) 48vw, 30vw"
                          />
                        ) : null}
                      </Link>

                      <span
                        className={
                          styles.articleCategory
                        }
                      >
                        {article.category.name}
                      </span>

                      <Link
                        href={`/blog/${article.slug}`}
                        className={
                          styles.articleTitle
                        }
                      >
                        {article.title}
                      </Link>

                      {article.excerpt && (
                        <p
                          className={
                            styles.articleDescription
                          }
                        >
                          {article.excerpt}
                        </p>
                      )}

                      <div
                        className={
                          styles.articleFooter
                        }
                      >
                        <span
                          className={
                            styles.articleMeta
                          }
                        >
                          {formatDate(
                            article.publishedAt,
                          )}{" "}
                          •{" "}
                          {readTime(
                            article,
                          )}{" "}
                          MIN READ
                        </span>

                        <Link
                          href={`/blog/${article.slug}`}
                          className={
                            styles.articleArrow
                          }
                          aria-label={`Read ${article.title}`}
                        >
                          ↗
                        </Link>
                      </div>
                    </article>
                  ),
                )}
              </div>
            ) : (
              <div
                className={
                  styles.emptyState
                }
              >
                // NO ARTICLES FOUND
              </div>
            )}

            <div
              className={
                styles.pagination
              }
            >
              <Link
                href={previousHref}
                className={`${styles.pageButton} ${
                  currentPage === 1
                    ? styles.disabled
                    : ""
                }`}
                aria-label="Previous page"
                aria-disabled={
                  currentPage === 1
                }
              >
                ←
              </Link>

              {Array.from(
                {
                  length: totalPages,
                },
                (_, index) => {
                  const number =
                    index + 1;

                  return (
                    <Link
                      key={number}
                      href={buildHref(
                        searchParams,
                        {
                          page: String(
                            number,
                          ),
                        },
                      )}
                      className={`${styles.pageButton} ${
                        number ===
                        currentPage
                          ? styles.active
                          : ""
                      }`}
                    >
                      {number}
                    </Link>
                  );
                },
              )}

              <Link
                href={nextHref}
                className={`${styles.pageButton} ${
                  currentPage ===
                  totalPages
                    ? styles.disabled
                    : ""
                }`}
                aria-label="Next page"
                aria-disabled={
                  currentPage ===
                  totalPages
                }
              >
                →
              </Link>
            </div>
          </div>

          <aside
            className={styles.sidebar}
          >
            <div
              className={
                styles.sidebarSection
              }
            >
              <div
                className={
                  styles.sidebarTitle
                }
              >
                // 002&nbsp;&nbsp; SEARCH
              </div>

              <SearchBox
                value={
                  searchParams?.q ?? ""
                }
              />
            </div>

            <div
              className={
                styles.sidebarSection
              }
            >
              <div
                className={
                  styles.sidebarTitle
                }
              >
                // 004&nbsp;&nbsp; POPULAR TOPICS
              </div>

              <TopicList
                current={searchParams}
                topics={categories}
              />
            </div>

            <Quote />
          </aside>
        </div>
      </section>
    </main>
  );
}
