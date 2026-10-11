import { readPublic } from "@/lib/convex-read";
import { readAdmin } from "@/lib/convex-server";

export async function getCommentsByArticleSlug(slug: string) {
  return readPublic<{ id: string; name: string; content: string; createdAt: Date }[]>("commentsByArticleSlug", { slug });
}

export async function getModerationComments(status: "all" | "pending" | "approved" | "rejected" = "pending") {
  return readAdmin<{ id: string; name: string; content: string; status: string; createdAt: Date; title: string; slug: string }[]>("moderationComments", { status });
}
