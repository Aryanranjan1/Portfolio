import type { ConvexRow } from "../types";
import { readPublic } from "@/lib/convex-read";
import { readAdmin } from "@/lib/convex-server";

type Media = ConvexRow<"media">;

export async function getMediaLibrary() {
  return readAdmin<Media[]>("mediaLibrary");
}

export async function getMediaById(mediaId: string) {
  return readPublic<Pick<Media, "id" | "url" | "filename" | "mimeType" | "width" | "height" | "altText"> | null>("mediaById", { id: mediaId });
}

export async function getMediaUsage(mediaId: string) {
  return readAdmin<{ item: Media; usage: { label: string; detail: string; href: string }[] } | null>("mediaUsage", { id: mediaId });
}
