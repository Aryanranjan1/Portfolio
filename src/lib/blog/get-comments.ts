import { getCommentsByArticleSlug } from "@/lib/convex/queries/comments";

export async function getComments(slug: string) {
  return getCommentsByArticleSlug(slug);
}