import { and, eq, ne } from "drizzle-orm";

import { db } from "@/db";
import { article } from "@/db/schema/articles";
import { comment } from "@/db/schema/comments";

export type CreateCommentInput = {
  slug: string;
  name: string;
  content: string;
};

export async function createComment(input: CreateCommentInput) {
  const normalized = {
    slug: input.slug.trim().toLowerCase(),
    name: input.name.trim(),
    content: input.content.trim(),
  };

  if (
    !normalized.slug ||
    !normalized.name ||
    !normalized.content ||
    normalized.name.length > 100 ||
    normalized.content.length > 5000
  ) {
    throw new Error("VALIDATION_ERROR");
  }

  const [existingArticle] = await db
    .select({
      id: article.id,
    })
    .from(article)
    .where(and(eq(article.slug, normalized.slug), eq(article.status, "published")))
    .limit(1);

  if (!existingArticle) {
    throw new Error("NOT_FOUND");
  }

  const [createdComment] = await db
    .insert(comment)
    .values({
      articleId: existingArticle.id,
      name: normalized.name,
      content: normalized.content,
      status: "pending",
    })
    .returning({
      id: comment.id,
    });

  return createdComment;
}

export async function moderateComment(id: string, status: "approved" | "rejected") {
  const [updated] = await db.update(comment).set({ status, updatedAt: new Date() })
    .where(and(eq(comment.id, id), ne(comment.status, status))).returning({ articleId: comment.articleId });
  if (!updated) throw new Error("NOT_FOUND");
  const [item] = await db.select({ slug: article.slug }).from(article).where(eq(article.id, updated.articleId)).limit(1);
  return item?.slug;
}

export async function deleteComment(id: string) {
  const [deleted] = await db.delete(comment).where(eq(comment.id, id)).returning({ articleId: comment.articleId });
  if (!deleted) throw new Error("NOT_FOUND");
  const [item] = await db.select({ slug: article.slug }).from(article).where(eq(article.id, deleted.articleId)).limit(1);
  return item?.slug;
}
