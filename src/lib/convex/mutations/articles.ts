import { randomUUID } from "node:crypto";
import { mutateApplication } from "@/lib/convex-server";
import type { ConvexRow } from "../types";

type ArticleRecord = ConvexRow<"article">;
type ArticleCategoryRecord = ConvexRow<"articleCategory">;
type TagRecord = ConvexRow<"tag">;

export type ArticleReferenceInput = { name: string; slug: string; description?: string | null };
export type ArticleStatus = "draft" | "published" | "archived";
export type ArticleTagInput = { tagId: string };
export type ArticleBlockInput = { id?: string; type: "heading" | "paragraph" | "image" | "gallery" | "video" | "quote" | "list" | "code" | "table" | "comparison" | "callout" | "tool" | "embed"; position: number; data: Record<string, unknown> };
export type CreateArticleInput = {
  slug: string; title: string; excerpt: string; categoryId: string; tags: ArticleTagInput[]; status: ArticleStatus; featured: boolean; publishedAt: Date | null;
  seoTitle: string | null; seoDescription: string | null; canonicalOverride: string | null; robotsIndex: boolean; robotsFollow: boolean;
  socialTitle: string | null; socialDescription: string | null; socialImageId: string | null; blocks: ArticleBlockInput[];
};
export type UpdateArticleInput = CreateArticleInput & { id: string };

export function createArticleCategory(input: ArticleReferenceInput & { description: string | null }) { return mutateApplication<ArticleCategoryRecord>("simpleCreate", { table: "articleCategory", legacyId: randomUUID(), data: input }); }
export function updateArticleCategory(id: string, input: ArticleReferenceInput & { description: string | null }) { return mutateApplication<ArticleCategoryRecord>("simpleUpdate", { table: "articleCategory", id, data: input }); }
export function deleteArticleCategory(id: string) { return mutateApplication<{ id: string }>("simpleDelete", { table: "articleCategory", id }); }
export function createTag(input: { name: string; slug: string }) { return mutateApplication<TagRecord>("simpleCreate", { table: "tag", legacyId: randomUUID(), data: input }); }
export function updateTag(id: string, input: { name: string; slug: string }) { return mutateApplication<TagRecord>("simpleUpdate", { table: "tag", id, data: input }); }
export function deleteTag(id: string) { return mutateApplication<{ id: string }>("simpleDelete", { table: "tag", id }); }

function withNewBlockIds(input: CreateArticleInput) {
  return { ...input, blocks: input.blocks.map(({ id, ...block }) => ({ legacyId: id ?? randomUUID(), ...block })) };
}

export function createArticle(input: CreateArticleInput) {
  return mutateApplication<ArticleRecord>("createArticle", { legacyId: randomUUID(), data: withNewBlockIds(input) });
}

export function updateArticle(input: UpdateArticleInput) {
  const { id, ...data } = input;
  return mutateApplication<ArticleRecord>("updateArticle", { id, data: withNewBlockIds(data) });
}

export function deleteArticle(id: string) { return mutateApplication<Pick<ArticleRecord, "id" | "slug">>("deleteArticle", { id }); }
export function setArticleStatus(id: string, status: ArticleStatus, publishedAt: Date | null) { return mutateApplication<ArticleRecord>("setArticleStatus", { id, status, publishedAt }); }
