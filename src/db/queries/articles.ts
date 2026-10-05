import {
  and,
  desc,
  eq,
  gt,
  lt,
  ne,
  or,
} from "drizzle-orm";
import { cache } from "react";

import { db } from "../index";

import {
  article,
  articleBlock,
  articleCategory,
  articleTag,
  tag,
} from "../schema/articles";

import { media } from "../schema/media";
import { slugRedirect } from "../schema/slug-redirects";

/**
 * Get all published articles.
 */
export async function getPublishedArticles() {
  return db
    .select()
    .from(article)
    .where(eq(article.status, "published"))
    .orderBy(
      desc(article.publishedAt),
      desc(article.id),
    );
}

export async function getArticleSlugById(id: string) {
  const rows = await db.select({ slug: article.slug }).from(article).where(eq(article.id, id)).limit(1);
  return rows[0]?.slug ?? null;
}

export async function getArticleRedirectSlug(oldSlug: string) {
  const [row] = await db.select({ entityId: slugRedirect.entityId, newSlug: slugRedirect.newSlug }).from(slugRedirect)
    .where(and(eq(slugRedirect.kind, "article"), eq(slugRedirect.oldSlug, oldSlug))).limit(1);
  if (!row) return null;
  const [published] = await db.select({ slug: article.slug }).from(article)
    .where(and(eq(article.id, row.entityId), eq(article.slug, row.newSlug), eq(article.status, "published"))).limit(1);
  return published?.slug ?? null;
}

/** Published and indexable articles for discovery surfaces. */
export async function getDiscoverableArticles() {
  return db.select({ slug: article.slug, title: article.title, updatedAt: article.updatedAt, canonicalOverride: article.canonicalOverride })
    .from(article)
    .where(and(eq(article.status, "published"), eq(article.robotsIndex, true)))
    .orderBy(desc(article.publishedAt), desc(article.id));
}

/**
 * Get published articles prepared for the blog listing page.
 *
 * Includes:
 * - article information
 * - category information
 * - social image information
 *
 * The social image is optional because article.socialImageId
 * can be null.
 */
export async function getPublishedBlogArticles() {
  return db
    .select({
      id: article.id,
      slug: article.slug,
      title: article.title,
      excerpt: article.excerpt,
      featured: article.featured,
      publishedAt: article.publishedAt,

      category: {
        name: articleCategory.name,
        slug: articleCategory.slug,
      },

      image: {
        url: media.url,
        altText: media.altText,
      },
    })
    .from(article)
    .innerJoin(
      articleCategory,
      eq(article.categoryId, articleCategory.id),
    )
    .leftJoin(
      media,
      eq(article.socialImageId, media.id),
    )
    .where(eq(article.status, "published"))
    .orderBy(
      desc(article.publishedAt),
      desc(article.id),
    );
}

/**
 * Get the featured published article.
 */
export async function getFeaturedArticle() {
  const result = await db
    .select()
    .from(article)
    .where(
      and(
        eq(article.status, "published"),
        eq(article.featured, true),
      ),
    )
    .orderBy(
      desc(article.publishedAt),
      desc(article.id),
    )
    .limit(1);

  return result[0] ?? null;
}

/**
 * Get one published article by slug.
 */
export async function getPublishedArticleBySlug(
  slug: string,
) {
  const result = await db
    .select()
    .from(article)
    .where(
      and(
        eq(article.slug, slug),
        eq(article.status, "published"),
      ),
    )
    .limit(1);

  return result[0] ?? null;
}

/**
 * Get the category assigned to an article.
 */
export async function getArticleCategory(
  categoryId: string,
) {
  const result = await db
    .select()
    .from(articleCategory)
    .where(
      eq(articleCategory.id, categoryId),
    )
    .limit(1);

  return result[0] ?? null;
}

/**
 * Get tags assigned to an article.
 */
export async function getArticleTags(
  articleId: string,
) {
  return db
    .select({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
    })
    .from(articleTag)
    .innerJoin(
      tag,
      eq(articleTag.tagId, tag.id),
    )
    .where(eq(articleTag.articleId, articleId));
}

/**
 * Get the ordered blocks belonging to an article.
 */
export async function getArticleBlocks(
  articleId: string,
) {
  return db
    .select()
    .from(articleBlock)
    .where(
      eq(articleBlock.articleId, articleId),
    )
    .orderBy(articleBlock.position);
}

/**
 * Get the 6 most recent published articles.
 *
 * The current article is excluded when articleId
 * is provided.
 *
 * This is intentionally separate from getRelatedArticles().
 *
 * relatedArticles = same category
 * recentArticles  = global chronological list
 */
export async function getRecentArticles(
  articleId?: string,
  limit = 6,
) {
  const conditions = [
    eq(article.status, "published"),
  ];

  if (articleId) {
    conditions.push(
      ne(article.id, articleId),
    );
  }

  return db
    .select({
      id: article.id,
      slug: article.slug,
      title: article.title,
      excerpt: article.excerpt,
      publishedAt: article.publishedAt,
    })
    .from(article)
    .where(and(...conditions))
    .orderBy(
      desc(article.publishedAt),
      desc(article.id),
    )
    .limit(limit);
}

/**
 * Get the previous published article.
 *
 * Ordering:
 * published_at ASC
 * id ASC
 *
 * From the current article's perspective, this means
 * the immediately older article.
 */
export async function getPreviousArticle(
  publishedAt: Date,
  articleId: string,
) {
  const result = await db
    .select()
    .from(article)
    .where(
      and(
        eq(article.status, "published"),
        ne(article.id, articleId),
        or(
          lt(article.publishedAt, publishedAt),
          and(
            eq(
              article.publishedAt,
              publishedAt,
            ),
            lt(article.id, articleId),
          ),
        ),
      ),
    )
    .orderBy(
      desc(article.publishedAt),
      desc(article.id),
    )
    .limit(1);

  return result[0] ?? null;
}

/**
 * Get the next published article.
 *
 * Ordering:
 * published_at DESC
 * id DESC
 *
 * From the current article's perspective, this means
 * the immediately newer article.
 */
export async function getNextArticle(
  publishedAt: Date,
  articleId: string,
) {
  const result = await db
    .select()
    .from(article)
    .where(
      and(
        eq(article.status, "published"),
        ne(article.id, articleId),
        or(
          gt(article.publishedAt, publishedAt),
          and(
            eq(
              article.publishedAt,
              publishedAt,
            ),
            gt(article.id, articleId),
          ),
        ),
      ),
    )
    .orderBy(
      article.publishedAt,
      article.id,
    )
    .limit(1);

  return result[0] ?? null;
}

/**
 * Get related published articles.
 *
 * Articles are considered related when they share
 * the same category.
 *
 * The current article itself is excluded.
 */
export async function getRelatedArticles(
  articleId: string,
  categoryId: string,
) {
  return db
    .select()
    .from(article)
    .where(
      and(
        eq(article.status, "published"),
        eq(article.categoryId, categoryId),
        ne(article.id, articleId),
      ),
    )
    .orderBy(
      desc(article.publishedAt),
      desc(article.id),
    )
    .limit(3);
}

/**
 * Get a complete published article page.
 */
export const getPublishedArticlePage = cache(async function getPublishedArticlePage(slug: string) {
  const currentArticle =
    await getPublishedArticleBySlug(slug);

  if (!currentArticle) {
    return null;
  }

  const [
    category,
    tags,
    blocks,
    socialImage,
  ] = await Promise.all([
    getArticleCategory(
      currentArticle.categoryId,
    ),
    getArticleTags(
      currentArticle.id,
    ),
    getArticleBlocks(
      currentArticle.id,
    ),
    currentArticle.socialImageId
      ? db.select({ url: media.url, altText: media.altText, width: media.width, height: media.height }).from(media).where(eq(media.id, currentArticle.socialImageId)).then((rows) => rows[0] ?? null)
      : Promise.resolve(null),
  ]);

  const [
    previousArticle,
    nextArticle,
    recentArticles,
  ] = currentArticle.publishedAt
    ? await Promise.all([
        getPreviousArticle(
          currentArticle.publishedAt,
          currentArticle.id,
        ),

        getNextArticle(
          currentArticle.publishedAt,
          currentArticle.id,
        ),

        getRecentArticles(
          currentArticle.id,
          6,
        ),
      ])
    : [
        null,
        null,
        await getRecentArticles(
          currentArticle.id,
          6,
        ),
      ];

  const relatedArticles = category
    ? await getRelatedArticles(
        currentArticle.id,
        category.id,
      )
    : [];

  return {
    ...currentArticle,

    category,
    tags,
    blocks,
    socialImage,

    previousArticle,
    nextArticle,

    relatedArticles,

    recentArticles,
  };
});
