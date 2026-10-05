import { getCommentsByArticleSlug } from "@/db/queries/comments";

export async function getComments(slug: string) {
  return getCommentsByArticleSlug(slug);
}