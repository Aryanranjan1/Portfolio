import { desc } from "drizzle-orm";
import { db } from "@/db";
import { media } from "@/db/schema/media";

export async function getMediaLibrary() {
  return db.select().from(media).orderBy(desc(media.createdAt));
}
