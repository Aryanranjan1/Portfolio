import { randomUUID } from "node:crypto";
import { mutateApplication } from "@/lib/convex-server";

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
  return mutateApplication("createMedia", { legacyId: randomUUID(), media: input });
}

export async function createUploadedMedia(input: Omit<MediaInput, "storageKey" | "url"> & { storageId: string; category: string }) {
  return mutateApplication<{ id: string; url: string; filename: string; mimeType: string; fileSizeBytes: number; width: number | null; height: number | null }>("createUploadedMedia", { legacyId: randomUUID(), ...input });
}

export async function updateMedia(id: string, input: MediaInput) {
  return mutateApplication("updateMedia", { id, media: input });
}

export async function updateMediaAltText(id: string, altText: string | null) {
  return mutateApplication("updateMediaAltText", { id, altText });
}

export async function deleteMediaWithReferences(id: string) {
  return mutateApplication("deleteMedia", { id });
}
