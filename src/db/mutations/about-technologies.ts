import { and, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { aboutTechnology } from "@/db/schema/content";
import { media } from "@/db/schema/media";

export type AboutTechnologyInput = {
  label: string;
  mediaId: string | null;
  position: number;
  active: boolean;
};

async function assertValidImage(mediaId: string | null) {
  if (!mediaId) return;
  const [image] = await db.select({ id: media.id }).from(media)
    .where(and(eq(media.id, mediaId), eq(media.deletionPending, false), sql`starts_with(${media.mimeType}, 'image/')`)).limit(1);
  if (!image) throw new Error("MEDIA_NOT_FOUND");
}

export async function createAboutTechnology(input: AboutTechnologyInput) {
  await assertValidImage(input.mediaId);
  const [row] = await db.insert(aboutTechnology).values(input).returning();
  if (!row) throw new Error("INTERNAL_ERROR");
  return row;
}

export async function updateAboutTechnology(id: string, input: AboutTechnologyInput) {
  await assertValidImage(input.mediaId);
  const [row] = await db.update(aboutTechnology).set({ ...input, updatedAt: new Date() })
    .where(eq(aboutTechnology.id, id)).returning();
  if (!row) throw new Error("NOT_FOUND");
  return row;
}

export async function deleteAboutTechnology(id: string) {
  const [row] = await db.delete(aboutTechnology).where(eq(aboutTechnology.id, id))
    .returning({ id: aboutTechnology.id });
  if (!row) throw new Error("NOT_FOUND");
  return row;
}
