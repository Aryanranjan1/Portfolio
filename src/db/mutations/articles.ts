import { and, eq, inArray, ne, or } from "drizzle-orm";

import { db } from "@/db";
import { throwMappedDatabaseError } from "@/db/mutations/db-errors";

import {
  article,
  articleBlock,
  articleCategory,
  articleTag,
  tag,
} from "@/db/schema/articles";

export type ArticleReferenceInput = {
  name: string;
  slug: string;
  description?: string | null;
};

export async function createArticleCategory(input: ArticleReferenceInput & { description: string | null }) {
  try {
    const [duplicate] = await db.select({ id: articleCategory.id }).from(articleCategory)
      .where(or(eq(articleCategory.name, input.name), eq(articleCategory.slug, input.slug))).limit(1);
    if (duplicate) throw new Error("CONFLICT");
    const [row] = await db.insert(articleCategory).values(input).returning();
    return row;
  } catch (error) {
    throwMappedDatabaseError(error);
  }
}

export async function updateArticleCategory(id: string, input: ArticleReferenceInput & { description: string | null }) {
  try {
    const [existing] = await db.select({ id: articleCategory.id }).from(articleCategory).where(eq(articleCategory.id, id)).limit(1);
    if (!existing) throw new Error("NOT_FOUND");
    const [duplicate] = await db.select({ id: articleCategory.id }).from(articleCategory)
      .where(and(ne(articleCategory.id, id), or(eq(articleCategory.name, input.name), eq(articleCategory.slug, input.slug)))).limit(1);
    if (duplicate) throw new Error("CONFLICT");
    const [row] = await db.update(articleCategory).set(input).where(eq(articleCategory.id, id)).returning();
    if (!row) throw new Error("NOT_FOUND");
    return row;
  } catch (error) {
    throwMappedDatabaseError(error);
  }
}

export async function deleteArticleCategory(id: string) {
  try {
    const [row] = await db.delete(articleCategory).where(eq(articleCategory.id, id)).returning({ id: articleCategory.id });
    if (!row) throw new Error("NOT_FOUND");
    return row;
  } catch (error) {
    throwMappedDatabaseError(error);
  }
}

export async function createTag(input: { name: string; slug: string }) {
  try {
    const [duplicate] = await db.select({ id: tag.id }).from(tag)
      .where(or(eq(tag.name, input.name), eq(tag.slug, input.slug))).limit(1);
    if (duplicate) throw new Error("CONFLICT");
    const [row] = await db.insert(tag).values(input).returning();
    return row;
  } catch (error) {
    throwMappedDatabaseError(error);
  }
}

export async function updateTag(id: string, input: { name: string; slug: string }) {
  try {
    const [existing] = await db.select({ id: tag.id }).from(tag).where(eq(tag.id, id)).limit(1);
    if (!existing) throw new Error("NOT_FOUND");
    const [duplicate] = await db.select({ id: tag.id }).from(tag)
      .where(and(ne(tag.id, id), or(eq(tag.name, input.name), eq(tag.slug, input.slug)))).limit(1);
    if (duplicate) throw new Error("CONFLICT");
    const [row] = await db.update(tag).set(input).where(eq(tag.id, id)).returning();
    if (!row) throw new Error("NOT_FOUND");
    return row;
  } catch (error) {
    throwMappedDatabaseError(error);
  }
}

export async function deleteTag(id: string) {
  try {
    const [row] = await db.delete(tag).where(eq(tag.id, id)).returning({ id: tag.id });
    if (!row) throw new Error("NOT_FOUND");
    return row;
  } catch (error) {
    throwMappedDatabaseError(error);
  }
}

export type ArticleStatus =
  | "draft"
  | "published"
  | "archived";

export type ArticleTagInput = {
  tagId: string;
};

export type ArticleBlockInput = {
  id?: string;
  type:
    | "heading"
    | "paragraph"
    | "image"
    | "gallery"
    | "video"
    | "quote"
    | "list"
    | "code"
    | "table"
    | "comparison"
    | "callout"
    | "tool"
    | "embed";
  position: number;
  data: Record<string, unknown>;
};

export type CreateArticleInput = {
  slug: string;
  title: string;
  excerpt: string;
  categoryId: string;
  tags: ArticleTagInput[];
  status: ArticleStatus;
  featured: boolean;
  publishedAt: Date | null;
  seoTitle: string | null;
  seoDescription: string | null;
  canonicalOverride: string | null;
  robotsIndex: boolean;
  robotsFollow: boolean;
  socialTitle: string | null;
  socialDescription: string | null;
  socialImageId: string | null;
  blocks: ArticleBlockInput[];
};

export type UpdateArticleInput = CreateArticleInput & {
  id: string;
};

const blockTypes = [
  "heading",
  "paragraph",
  "image",
  "gallery",
  "video",
  "quote",
  "list",
  "code",
  "table",
  "comparison",
  "callout",
  "tool",
  "embed",
] as const;

function assertPublishedState(
  status: ArticleStatus,
  publishedAt: Date | null,
) {
  if (status === "published" && !publishedAt) {
    throw new Error("VALIDATION_ERROR");
  }
}

function assertUniqueStrings(values: string[]) {
  if (new Set(values).size !== values.length) {
    throw new Error("VALIDATION_ERROR");
  }
}

function assertUniqueNumbers(values: number[]) {
  if (new Set(values).size !== values.length) {
    throw new Error("VALIDATION_ERROR");
  }
}

async function validateArticleReferences(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  input: CreateArticleInput,
) {
  // Category

  const categories = await tx
    .select({
      id: articleCategory.id,
    })
    .from(articleCategory)
    .where(eq(articleCategory.id, input.categoryId));

  if (categories.length === 0) {
    throw new Error("NOT_FOUND");
  }

  // Tags

  const tagIds = input.tags.map(
    (tagInput) => tagInput.tagId,
  );

  assertUniqueStrings(tagIds);

  if (tagIds.length > 0) {
    const existingTags = await tx
      .select({
        id: tag.id,
      })
      .from(tag)
      .where(inArray(tag.id, tagIds));

    if (existingTags.length !== tagIds.length) {
      throw new Error("NOT_FOUND");
    }
  }

  // Blocks

  assertUniqueNumbers(
    input.blocks.map(
      (block) => block.position,
    ),
  );

  for (const block of input.blocks) {
    if (
      !blockTypes.includes(
        block.type as (typeof blockTypes)[number],
      )
    ) {
      throw new Error("VALIDATION_ERROR");
    }

    if (
      !Number.isInteger(block.position) ||
      block.position < 0
    ) {
      throw new Error("VALIDATION_ERROR");
    }

    if (
      typeof block.data !== "object" ||
      block.data === null ||
      Array.isArray(block.data)
    ) {
      throw new Error("VALIDATION_ERROR");
    }
  }
}

export async function createArticle(
  input: CreateArticleInput,
) {
  assertPublishedState(
    input.status,
    input.publishedAt,
  );

  return db.transaction(async (tx) => {
    await validateArticleReferences(
      tx,
      input,
    );

    const [createdArticle] = await tx
      .insert(article)
      .values({
        slug: input.slug,
        title: input.title,
        excerpt: input.excerpt,
        categoryId: input.categoryId,
        status: input.status,
        featured: input.featured,
        publishedAt: input.publishedAt,
        seoTitle: input.seoTitle,
        seoDescription: input.seoDescription,
        canonicalOverride: input.canonicalOverride,
        robotsIndex: input.robotsIndex,
        robotsFollow: input.robotsFollow,
        socialTitle: input.socialTitle,
        socialDescription: input.socialDescription,
        socialImageId: input.socialImageId,
      })
      .returning();

    if (!createdArticle) {
      throw new Error("INTERNAL_ERROR");
    }

    await replaceArticleRelationships(
      tx,
      createdArticle.id,
      input,
    );

    return createdArticle;
  });
}

export async function updateArticle(
  input: UpdateArticleInput,
) {
  assertPublishedState(
    input.status,
    input.publishedAt,
  );

  return db.transaction(async (tx) => {
    await validateArticleReferences(
      tx,
      input,
    );

    const [updatedArticle] = await tx
      .update(article)
      .set({
        slug: input.slug,
        title: input.title,
        excerpt: input.excerpt,
        categoryId: input.categoryId,
        status: input.status,
        featured: input.featured,
        publishedAt: input.publishedAt,
        seoTitle: input.seoTitle,
        seoDescription: input.seoDescription,
        canonicalOverride: input.canonicalOverride,
        robotsIndex: input.robotsIndex,
        robotsFollow: input.robotsFollow,
        socialTitle: input.socialTitle,
        socialDescription: input.socialDescription,
        socialImageId: input.socialImageId,
        updatedAt: new Date(),
      })
      .where(eq(article.id, input.id))
      .returning();

    if (!updatedArticle) {
      throw new Error("NOT_FOUND");
    }

    await replaceArticleRelationships(
      tx,
      updatedArticle.id,
      input,
    );

    return updatedArticle;
  });
}

export async function deleteArticle(
  articleId: string,
) {
  const result = await db
    .delete(article)
    .where(eq(article.id, articleId))
    .returning({
      id: article.id,
      slug: article.slug,
    });

  if (result.length === 0) {
    throw new Error("NOT_FOUND");
  }

  return result[0];
}

export async function setArticleStatus(
  articleId: string,
  status: ArticleStatus,
  publishedAt: Date | null,
) {
  assertPublishedState(
    status,
    publishedAt,
  );

  const [updatedArticle] = await db
    .update(article)
    .set({
      status,
      publishedAt,
      updatedAt: new Date(),
    })
    .where(eq(article.id, articleId))
    .returning();

  if (!updatedArticle) {
    throw new Error("NOT_FOUND");
  }

  return updatedArticle;
}

async function replaceArticleRelationships(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  articleId: string,
  input: CreateArticleInput,
) {
  // Tags

  await tx
    .delete(articleTag)
    .where(
      eq(
        articleTag.articleId,
        articleId,
      ),
    );

  if (input.tags.length > 0) {
    await tx
      .insert(articleTag)
      .values(
        input.tags.map((item) => ({
          articleId,
          tagId: item.tagId,
        })),
      );
  }

  // Blocks

  await tx
    .delete(articleBlock)
    .where(
      eq(
        articleBlock.articleId,
        articleId,
      ),
    );

  if (input.blocks.length > 0) {
    await tx
      .insert(articleBlock)
      .values(
        input.blocks.map((block) => ({
          articleId,
          type: block.type,
          position: block.position,
          data: block.data,
        })),
      );
  }
}
