import { eq } from "drizzle-orm";

import { db } from "@/db";
import { media } from "@/db/schema/media";
import { throwMappedDatabaseError } from "@/db/mutations/db-errors";

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

export async function deleteMedia(id: string) {
  try {
    const [row] = await db.delete(media).where(eq(media.id, id)).returning({ id: media.id });
    if (!row) throw new Error("NOT_FOUND");
    return row;
  } catch (error) {
    throwMappedDatabaseError(error);
  }
}
