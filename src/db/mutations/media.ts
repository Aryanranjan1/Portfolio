import { eq, inArray, sql } from "drizzle-orm";

import { db } from "@/db";
import { media } from "@/db/schema/media";
import { throwMappedDatabaseError } from "@/db/mutations/db-errors";
import { article, articleBlock } from "@/db/schema/articles";
import { project, projectBlock, projectMedia, technology } from "@/db/schema/projects";
import { skill } from "@/db/schema/skills";
import { aboutTechnology } from "@/db/schema/content";
import { siteSettings } from "@/db/schema/site";
import { deleteSupabaseMediaObject } from "@/lib/media/supabase-storage";

export type MediaInput = {
  storageKey: string;
  url: string;
  filename: string;
  mimeType: string;
  fileSizeBytes: number | null;
  width: number | null;
  height: number | null;
  altText: string | null;
};

export async function createMedia(input: MediaInput) {
  try {
    const [duplicate] = await db.select({ id: media.id }).from(media).where(eq(media.storageKey, input.storageKey)).limit(1);
    if (duplicate) throw new Error("CONFLICT");
    const [row] = await db.insert(media).values(input).returning();
    return row;
  } catch (error) {
    throwMappedDatabaseError(error);
  }
}

export async function updateMedia(id: string, input: MediaInput) {
  try {
    const [existing] = await db.select({ id: media.id }).from(media).where(eq(media.id, id)).limit(1);
    if (!existing) throw new Error("NOT_FOUND");
    const [duplicate] = await db.select({ id: media.id }).from(media).where(eq(media.storageKey, input.storageKey)).limit(1);
    if (duplicate && duplicate.id !== id) throw new Error("CONFLICT");
    const [row] = await db.update(media).set({ ...input, updatedAt: new Date() }).where(eq(media.id, id)).returning();
    if (!row) throw new Error("NOT_FOUND");
    return row;
  } catch (error) {
    throwMappedDatabaseError(error);
  }
}

export async function updateMediaAltText(id: string, altText: string | null) {
  const [row] = await db.update(media).set({ altText, updatedAt: new Date() }).where(sql`${media.id} = ${id} AND ${media.deletionPending} = false`).returning();
  if (!row) throw new Error("NOT_FOUND");
  return row;
}

export async function deleteMediaWithReferences(id: string) {
  try {
    const record = await db.transaction(async (tx) => {
      const [record] = await tx.select().from(media).where(eq(media.id, id)).limit(1);
      if (!record) throw new Error("NOT_FOUND");

      if (record.deletionPending) return record;

      await tx.delete(projectMedia).where(eq(projectMedia.mediaId, id));
      await tx.delete(projectBlock).where(sql`${projectBlock.data}->>'mediaId' = ${id} OR ${projectBlock.data}->'mediaIds' @> ${JSON.stringify([id])}::jsonb`);
      const articleReferences = await tx.select({ id: articleBlock.id }).from(articleBlock).where(sql`${articleBlock.data}->>'url' = ${record.url} OR ${articleBlock.data}->'images' @> ${JSON.stringify([{ url: record.url }])}::jsonb`);
      if (articleReferences.length) await tx.delete(articleBlock).where(inArray(articleBlock.id, articleReferences.map((item) => item.id)));

      await tx.update(project).set({ socialImageId: null, updatedAt: new Date() }).where(eq(project.socialImageId, id));
      await tx.update(article).set({ socialImageId: null, updatedAt: new Date() }).where(eq(article.socialImageId, id));
      await tx.update(technology).set({ iconMediaId: null }).where(eq(technology.iconMediaId, id));
      await tx.update(skill).set({ iconMediaId: null }).where(eq(skill.iconMediaId, id));
      await tx.update(aboutTechnology).set({ mediaId: null, updatedAt: new Date() }).where(eq(aboutTechnology.mediaId, id));
      await tx.update(siteSettings).set({ defaultSocialImageId: null, updatedAt: new Date() }).where(eq(siteSettings.defaultSocialImageId, id));
      await tx.update(siteSettings).set({ resumeMediaId: null, updatedAt: new Date() }).where(eq(siteSettings.resumeMediaId, id));
      const [pending] = await tx.update(media).set({ deletionPending: true, updatedAt: new Date() }).where(eq(media.id, id)).returning();
      if (!pending) throw new Error("NOT_FOUND");
      return pending;
    });

    await deleteSupabaseMediaObject(record.storageKey);
    await db.delete(media).where(eq(media.id, id));
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") throw error;
    if (error instanceof Error && ["STORAGE_NOT_CONFIGURED", "STORAGE_DELETE_FAILED"].includes(error.message)) throw new Error("STORAGE_DELETE_PENDING");
    throwMappedDatabaseError(error);
  }
}
