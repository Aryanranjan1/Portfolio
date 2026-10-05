/* eslint-disable react/jsx-no-comment-textnodes */
import type { Metadata } from "next";
import { serializeJsonLd } from "@/lib/json-ld";
import { getCanonicalSiteUrl } from "@/lib/site-origin";
import { getSiteSettings } from "@/db/queries/site";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import Image from "next/image";
import { getArticleRedirectSlug, getPublishedArticlePage } from "@/db/queries/articles";
import { getComments } from "@/lib/blog/get-comments";
import { isValidBlogBlock, type BlogBlock } from "@/lib/blog/block-schema";
import { classifyEmbedSource, classifyVideoSource } from "@/lib/blog/video-source";
import styles from "./ArticlePage.module.css";
import Comments from "@/components/comments";
import ScrollReveal from "@/components/ScrollReveal";
import PublicSiteShell from "@/components/PublicSiteShell";
import { getDefaultSocialImageMetadata } from "@/lib/seo/default-social-image";

type ArticlePageData = NonNullable<
  Awaited<ReturnType<typeof getPublishedArticlePage>>
>;

type RecentArticle = ArticlePageData["recentArticles"][number];

function formatDate(date: Date | null) {
  if (!date) {
    return "";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getHeadingData(block: BlogBlock) {
  if (block.type !== "heading") {
    return null;
  }

  const text = block.data.text;

  if (typeof text !== "string") {
    return null;
  }

  return {
    id: `section-${block.id}`,
    text,
  };
}

function getReadTime(blocks: BlogBlock[]) {
  const text = blocks
    .map((block) => {
      const data = block.data;

      if (typeof data.text === "string") {
        return data.text;
      }

      if (Array.isArray(data.items)) {
        return data.items
          .filter((item): item is string => typeof item === "string")
          .join(" ");
      }

      if (Array.isArray(data.rows)) {
        return data.rows
          .flat()
          .filter((cell): cell is string => typeof cell === "string")
          .join(" ");
      }

      if (typeof data.code === "string") {
        return data.code;
      }

      return "";
    })
    .join(" ");

  const words = text.trim().split(/\s+/).filter(Boolean).length;

  return Math.max(1, Math.ceil(words / 220));
}

function HeadingBlock({ block }: { block: BlogBlock }) {
  if (block.type !== "heading") {
    return null;
  }

  const text = block.data.text;

  if (typeof text !== "string") {
    return null;
  }

  const level = block.data.level === 3 ? 3 : block.data.level === 4 ? 4 : 2;

  const id = `section-${block.id}`;

  if (level === 4) {
    return (
      <h4 id={id} className={styles.heading}>
        {text}
      </h4>
    );
  }

  if (level === 3) {
    return (
      <h3 id={id} className={styles.heading}>
        {text}
      </h3>
    );
  }

  return (
    <h2 id={id} className={styles.heading}>
      {text}
    </h2>
  );
}

export function BlockRenderer({ block }: { block: BlogBlock }) {
  const data = block.data;

  switch (block.type) {
    case "heading":
      return <HeadingBlock block={block} />;

    case "paragraph":
      return <p className={styles.paragraph}>{data.text as string}</p>;

    case "image":
      return (
        <figure className={styles.imageBlock}>
          <div className={styles.imageFrame}>
            <Image
              src={data.url as string}
              alt={data.alt as string}
              width={1200}
              height={800}
              loading="lazy"
              unoptimized
            />
          </div>
          {typeof data.caption === "string" ? (
            <figcaption>{data.caption}</figcaption>
          ) : null}
        </figure>
      );

    case "gallery": {
      const images = data.images as Array<{
        url: string;
        alt: string;
        caption?: string;
      }>;

      return (
        <div className={styles.gallery}>
          {images.map((image, index) => (
            <figure key={`${block.id}-${index}`} className={styles.galleryItem}>
              <Image
                src={image.url}
                alt={image.alt}
                width={1200}
                height={800}
                loading="lazy"
                unoptimized
              />
              {image.caption ? <figcaption>{image.caption}</figcaption> : null}
            </figure>
          ))}
        </div>
      );
    }

    case "video": {
      const url = typeof data.url === "string" ? data.url : "";
      const title = typeof data.title === "string" && data.title.trim() ? data.title : "Article video";
      const source = classifyVideoSource(url);
      if (source.type === "direct") return <figure className={styles.videoBlock}><video controls preload="metadata" aria-label={title}><source src={source.url} type={source.mimeType} />Your browser does not support inline video playback. <a href={source.url}>Open the video</a>.</video></figure>;
      if (source.type === "youtube" || source.type === "vimeo") return <figure className={styles.videoBlock}><div className={styles.mediaFrame}><iframe src={source.url} title={title} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /></div><figcaption><a href={url} target="_blank" rel="noopener noreferrer">Open video at its source ↗</a></figcaption></figure>;
      return <figure className={styles.videoBlock}><a href={url} target="_blank" rel="noopener noreferrer" className={styles.videoLink}><span className={styles.playButton}>→</span><span>{title} · Open video externally</span></a></figure>;
    }

    case "quote":
      return (
        <blockquote className={styles.quote}>
          <p>{data.text as string}</p>
          {typeof data.author === "string" ? (
            <cite>— {data.author}</cite>
          ) : null}
        </blockquote>
      );

    case "code":
      return (
        <figure className={styles.codeBlock}>
          <div className={styles.codeHeader}>
            <span>
              {typeof data.filename === "string" ? data.filename : "CODE"}
            </span>
            <span>{data.language as string}</span>
          </div>
          <pre>
            <code>{data.code as string}</code>
          </pre>
        </figure>
      );

    case "list": {
      const items = data.items as string[];
      const ordered = data.ordered as boolean;

      if (ordered) {
        return (
          <ol className={styles.orderedList}>
            {items.map((item, index) => (
              <li key={`${block.id}-${index}`}>{item}</li>
            ))}
          </ol>
        );
      }

      return (
        <ul className={styles.unorderedList}>
          {items.map((item, index) => (
            <li key={`${block.id}-${index}`}>{item}</li>
          ))}
        </ul>
      );
    }

    case "table": {
      const columns = data.columns as string[];
      const rows = data.rows as string[][];

      return (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                {columns.map((column, index) => (
                  <th scope="col" key={`${block.id}-head-${index}`}>{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={`${block.id}-row-${rowIndex}`}>
                  {row.map((cell, cellIndex) => (
                    <td key={`${block.id}-${rowIndex}-${cellIndex}`}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    case "comparison": {
      const columns = data.columns as string[];
      const rows = data.rows as string[][];

      return (
        <div className={styles.tableWrapper}>
          <table className={styles.comparison}>
            <thead><tr>{columns.map((column, columnIndex) => <th scope="col" key={`${block.id}-column-${columnIndex}`}>{column}</th>)}</tr></thead>
            <tbody>{rows.map((row, rowIndex) => <tr key={`${block.id}-row-${rowIndex}`}>{columns.map((_, columnIndex) => <td key={`${block.id}-${rowIndex}-${columnIndex}`}>{row[columnIndex]}</td>)}</tr>)}</tbody>
          </table>
        </div>
      );
    }

    case "callout":
      return (
        <aside className={styles.callout}>
          {typeof data.title === "string" ? (
            <div className={styles.calloutTitle}>{data.title}</div>
          ) : null}
          <p>{data.text as string}</p>
        </aside>
      );

    case "tool":
      return (
        <aside className={styles.tool}>
          <div className={styles.toolLabel}>// TOOL</div>
          <h3>{data.name as string}</h3>
          {typeof data.description === "string" ? (
            <p>{data.description}</p>
          ) : null}
          {typeof data.url === "string" ? (
            <a href={data.url} target="_blank" rel="noopener noreferrer">
              Open tool →
            </a>
          ) : null}
        </aside>
      );

    case "embed": {
      const url = data.url as string;
      const source = classifyEmbedSource(url);

      if (!source) {
        return (
          <figure className={styles.embed}>
            <a href={url} target="_blank" rel="noopener noreferrer">
              {typeof data.title === "string" ? data.title : "Open embedded resource"}
            </a>
          </figure>
        );
      }

      return (
        <figure className={styles.embed}>
          <iframe
            src={source.url}
            title={
              typeof data.title === "string" ? data.title : "Embedded content"
            }
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
          <figcaption><a href={url} target="_blank" rel="noopener noreferrer">Open at {source.provider} ↗</a><span> If the frame is blank, the provider may block embedding.</span></figcaption>
          {typeof data.caption === "string" ? (
            <figcaption>{data.caption}</figcaption>
          ) : null}
        </figure>
      );
    }

    default:
      return null;
  }
}

function TableOfContents({
  headings,
}: {
  headings: Array<{
    id: string;
    text: string;
  }>;
}) {
  if (!headings.length) {
    return null;
  }

  return (
    <nav className={styles.toc} aria-label="Table of contents">
      {headings.map((heading, index) => (
        <a key={heading.id} href={`#${heading.id}`}>
          <span>{String(index + 1).padStart(2, "0")}</span>
          {heading.text}
        </a>
      ))}
    </nav>
  );
}

function SocialLinks({
  title,
  shareUrl,
}: {
  title: string;
  shareUrl: string;
}) {
  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(shareUrl);

  return (
    <div className={styles.socialLinks}>
      <a
        href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on X"
      >
        X
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on LinkedIn"
      >
        IN
      </a>
      <a
        href="https://github.com/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="GitHub"
      >
        GH
      </a>
    </div>
  );
}

function RecentArticles({ articles }: { articles: RecentArticle[] }) {
  if (!articles.length) {
    return null;
  }

  return (
    <section className={styles.recent}>
      <div className={styles.sectionLabel}>// RECENT ARTICLES</div>
      <div className={styles.recentList}>
        {articles.slice(0, 6).map((article, index) => (
          <Link
            key={article.id}
            href={`/blog/${article.slug}`}
            className={styles.recentCard}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            <div>
              <strong>{article.title}</strong>
              <small>{formatDate(article.publishedAt)}</small>
            </div>
            <b>→</b>
          </Link>
        ))}
      </div>
    </section>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getPublishedArticlePage(slug);

  if (!article) {
    const redirectSlug = await getArticleRedirectSlug(slug);
    if (redirectSlug) permanentRedirect(`/blog/${redirectSlug}`);
    return {};
  }

  const title = article.seoTitle ?? article.title;
  const description = article.seoDescription ?? article.excerpt;
  const canonical = await getCanonicalSiteUrl(`/blog/${article.slug}`, article.canonicalOverride) ?? undefined;
  const [settings, fallbackImages] = await Promise.all([getSiteSettings(), getDefaultSocialImageMetadata()]);
  const socialImage = article.socialImage ?? (fallbackImages?.[0] ? { ...fallbackImages[0], altText: fallbackImages[0].alt } : null);

  return {
    title,
    description,
    alternates: canonical ? { canonical } : undefined,
    ...(settings?.personName ? { authors: [{ name: settings.personName }] } : {}),
    robots: {
      index: article.robotsIndex,
      follow: article.robotsFollow,
    },
    openGraph: {
      title: article.socialTitle ?? title,
      description: article.socialDescription ?? description,
      type: "article",
      publishedTime: article.publishedAt?.toISOString(),
      url: canonical,
      ...(socialImage?.url ? { images: [{ url: socialImage.url, alt: socialImage.altText || article.title, ...(socialImage.width ? { width: socialImage.width } : {}), ...(socialImage.height ? { height: socialImage.height } : {}) }] } : {}),
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getPublishedArticlePage(slug);

  if (!article) {
    const redirectSlug = await getArticleRedirectSlug(slug);
    if (redirectSlug) permanentRedirect(`/blog/${redirectSlug}`);
    notFound();
  }

  const comments = await getComments(slug);

  /**
   * DB validation should already guarantee these blocks.
   * The second validation here is intentional: public rendering must remain
   * defensive even if malformed JSON somehow exists in JSONB.
   */
  const blocks = article.blocks
    .filter(isValidBlogBlock)
    .sort((a, b) => a.position - b.position);

  const headings = blocks
    .map(getHeadingData)
    .filter(
      (heading): heading is { id: string; text: string } => heading !== null,
    );

  const readTime = getReadTime(blocks);
  const publishedDate = formatDate(article.publishedAt);
  const [settings, shareUrl] = await Promise.all([getSiteSettings(), getCanonicalSiteUrl(`/blog/${article.slug}`, article.canonicalOverride)]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    datePublished: article.publishedAt?.toISOString(),
    dateModified: article.updatedAt?.toISOString(),
    mainEntityOfPage: shareUrl ?? `/blog/${article.slug}`,
    articleSection: article.category?.name,
    keywords: article.tags.map((tag) => tag.name),
    ...(settings?.personName ? { author: { "@type": "Person", name: settings.personName } } : {}),
  };

  return (
    <PublicSiteShell>
      <main className={styles.page}>
      <ScrollReveal />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(jsonLd),
        }}
      />

      <div className={styles.layout}>
        <aside className={styles.leftRail}>
          <div className={styles.railLabel}>// BLOG</div>
          <div className={styles.verticalLabel}>ARTICLE</div>

          <nav className={styles.railNav} aria-label="Blog sections">
            <Link href="/blog">IDEAS</Link>
            <Link href="/blog">TECHNOLOGY</Link>
            <Link href="/blog">SYSTEMS</Link>
          </nav>

          <div className={styles.leftRailBottom}>
            <span>{article.category?.name ?? "ARTICLE"}</span>
            <Link href="/blog">ALL ARTICLES →</Link>
          </div>
        </aside>

        <article className={styles.main}>
          <header className={styles.header} data-scroll-reveal>
            <div className={styles.metaRow}>
              <span>// {article.category?.name ?? "ARTICLE"}</span>
              <span>
                {publishedDate || "UNDATED"} {" • "} {readTime} MIN READ
              </span>
            </div>

            <h1 className={`${styles.title} public-hero-content-enter`}>{article.title}</h1>

            <p className={styles.excerpt}>{article.excerpt}</p>

            <div className={styles.articleHeaderMeta}>
              <div className={styles.articleHeaderLeft}>
                <span className={styles.metaLabel}>EDITORIAL</span>
                <span className={styles.metaCategory}>
                  SOFTWARE / ENGINEERING
                </span>

                <div className={styles.metaPublished}>
                  <span className={styles.metaLabel}>PUBLISHED</span>
                  {article.publishedAt ? <time dateTime={article.publishedAt.toISOString()}>{publishedDate}</time> : <span>UNDATED</span>}
                </div>
              </div>

              <div className={styles.articleHeaderRight}>
                <div className={styles.articleStats}>
                  <div className={styles.articleStat}>
                    <span className={styles.metaLabel}>READ TIME</span>
                    <span className={styles.metaValue}>{readTime} MIN</span>
                  </div>

                  <div className={styles.articleStat}>
                    <span className={styles.metaLabel}>BLOCKS</span>
                    <span className={styles.metaValue}>{blocks.length}</span>
                  </div>
                </div>

                <div className={styles.articleShare}>
                  <span className={styles.metaLabel}>SHARE</span>
                  <SocialLinks
                    title={article.title}
                    shareUrl={shareUrl ?? `/blog/${article.slug}`}
                  />
                </div>
              </div>
            </div>
          </header>

          <div className={styles.mobileToc}>
            <details>
              <summary>
                <span>// TABLE OF CONTENTS</span>
                <span>+</span>
              </summary>

              <TableOfContents headings={headings} />

              <a href="#comments" className={styles.commentsTocLink}>
                <span>05</span>
                Discussion
              </a>
            </details>
          </div>

          <div className={styles.content} data-scroll-reveal>
            {blocks.map((block) => (
              <div
                key={block.id}
                className={styles.block}
                data-block-type={block.type}
              >
                <BlockRenderer block={block} />
              </div>
            ))}
          </div>

          {article.tags.length > 0 ? (
            <div className={styles.tags}>
              <span className={styles.sectionLabel}>TAGS</span>
              <div className={styles.tagList}>
                {article.tags.map((tag) => (
                  <span key={tag.id}>{tag.name}</span>
                ))}
              </div>
            </div>
          ) : null}

          <div className={styles.mobileOnlySections}>
            <RecentArticles articles={article.recentArticles} />
          </div>

          <nav className={styles.articleNavigation} aria-label="Article navigation">
            {article.previousArticle ? (
              <Link
                href={`/blog/${article.previousArticle.slug}`}
                className={styles.navigationCard}
              >
                <span>← PREVIOUS</span>
                <strong>{article.previousArticle.title}</strong>
              </Link>
            ) : (
              <div />
            )}

            {article.nextArticle ? (
              <Link
                href={`/blog/${article.nextArticle.slug}`}
                className={`${styles.navigationCard} ${styles.next}`}
              >
                <span>NEXT →</span>
                <strong>{article.nextArticle.title}</strong>
              </Link>
            ) : (
              <div />
            )}
          </nav>

          <Comments comments={comments} slug={slug} />
        </article>

        <aside className={styles.rightRail}>
          <div className={styles.stickyRail}>
            <section>
              <div className={styles.sectionLabel}>// TABLE OF CONTENTS</div>

              <TableOfContents headings={headings} />

              <a href="#comments" className={styles.commentsTocLink}>
                <span>05</span>
                Discussion
              </a>
            </section>

            <section className={styles.railQuote}>
              <span>BUILD THE SIMPLEST THING THAT COULD WORK.</span>
              <small>// AR</small>
            </section>

            <RecentArticles articles={article.recentArticles} />
          </div>
        </aside>
      </div>
      </main>
    </PublicSiteShell>
  );
}
