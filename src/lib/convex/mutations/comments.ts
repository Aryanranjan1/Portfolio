import { randomUUID } from "node:crypto";
import { mutateApplication } from "@/lib/convex-server";

export type CreateCommentInput = {
  slug: string;
  name: string;
  content: string;
};

export async function createComment(input: CreateCommentInput) {
  const normalized = { slug: input.slug.trim().toLowerCase(), name: input.name.trim(), content: input.content.trim() };

  if (
    !normalized.slug ||
    !normalized.name ||
    !normalized.content ||
    normalized.name.length > 100 ||
    normalized.content.length > 5000
  ) {
    throw new Error("VALIDATION_ERROR");
  }

  return mutateApplication("createComment", { ...normalized, legacyId: randomUUID() });
}

export async function moderateComment(id: string, status: "approved" | "rejected") {
  return mutateApplication<string | undefined>("moderateComment", { id, status });
}

export async function deleteComment(id: string) {
  return mutateApplication<string | undefined>("deleteComment", { id });
}
