import { and, desc, eq } from "drizzle-orm";
import { db } from "../index";
import { article } from "../schema/articles";
import { comment } from "../schema/comments";

export async function getCommentsByArticleSlug(slug: string) {
  return db
    .select({
      id: comment.id,
      name: comment.name,
      content: comment.content,
      createdAt: comment.createdAt,
    })
    .from(comment)
    .innerJoin(article, eq(comment.articleId, article.id))
    .where(
      and(
        eq(article.slug, slug),
        eq(comment.status, "approved"),
      ),
    )
    .orderBy(desc(comment.createdAt))
    .limit(20);
}

export async function getModerationComments(status: "all" | "pending" | "approved" | "rejected" = "pending") {
  const query = db.select({ id: comment.id, name: comment.name, content: comment.content, status: comment.status, createdAt: comment.createdAt, title: article.title, slug: article.slug })
    .from(comment).innerJoin(article, eq(comment.articleId, article.id));
  return (status === "all" ? await query.orderBy(desc(comment.createdAt), desc(comment.id)).limit(200)
    : await query.where(eq(comment.status, status)).orderBy(desc(comment.createdAt), desc(comment.id)).limit(200));
}
