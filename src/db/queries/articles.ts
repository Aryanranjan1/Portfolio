import {
  and,
  desc,
  eq,
  gt,
  lt,
  ne,
  or,
} from "drizzle-orm";

import { db } from "../index";

import {
  article,
  articleBlock,
  articleCategory,
  articleTag,
  tag,
} from "../schema/articles";

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
    .where(eq(articleCategory.id, categoryId))
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
    .where(eq(articleBlock.articleId, articleId))
    .orderBy(articleBlock.position);
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
            eq(article.publishedAt, publishedAt),
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
            eq(article.publishedAt, publishedAt),
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
export async function getPublishedArticlePage(
  slug: string,
) {
  const currentArticle =
    await getPublishedArticleBySlug(slug);

  if (!currentArticle) {
    return null;
  }

  const [
    category,
    tags,
    blocks,
  ] = await Promise.all([
    getArticleCategory(currentArticle.categoryId),
    getArticleTags(currentArticle.id),
    getArticleBlocks(currentArticle.id),
  ]);

  const previousArticle =
    currentArticle.publishedAt
      ? await getPreviousArticle(
          currentArticle.publishedAt,
          currentArticle.id,
        )
      : null;

  const nextArticle =
    currentArticle.publishedAt
      ? await getNextArticle(
          currentArticle.publishedAt,
          currentArticle.id,
        )
      : null;

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
    previousArticle,
    nextArticle,
    relatedArticles,
  };
}