"use server";
import { logServerError } from "@/lib/observability/log";

import { revalidatePath } from "next/cache";
import { createMedia, deleteMediaWithReferences, updateMedia, updateMediaAltText, type MediaInput } from "@/db/mutations/media";
import { requireAdminAction } from "@/lib/auth/require-admin-action";
import { validateOptionalString, validateRequiredString, validateUuid, validateUrl } from "@/lib/validation";
import type { ActionResult } from "@/lib/actions/action-result";
import { getMediaUsage } from "@/db/queries/media";

function validateMedia(input: unknown): MediaInput {
  if (!input || typeof input !== "object") throw new Error("VALIDATION_ERROR");
  const value = input as Record<string, unknown>;
  const integerOrNull = (entry: unknown) => {
    if (entry == null || entry === "") return null;
    if (typeof entry !== "number" || !Number.isSafeInteger(entry) || entry < 0) throw new Error("VALIDATION_ERROR");
    return entry;
  };
  const widthOrHeight = (entry: unknown) => {
    const number = integerOrNull(entry);
    if (number === 0) throw new Error("VALIDATION_ERROR");
    return number;
  };
  const url = validateRequiredString(value.url, 2048);
  const safeUrl = url.startsWith("/") && !url.startsWith("//") ? url : validateUrl(url);
  const mimeType = validateRequiredString(value.mimeType, 255).toLowerCase();
  if (!/^[a-z0-9][a-z0-9!#$&^_.+-]*\/[a-z0-9][a-z0-9!#$&^_.+-]*$/.test(mimeType)) throw new Error("VALIDATION_ERROR");
  return {
    storageKey: validateRequiredString(value.storageKey, 1024),
    url: safeUrl,
    filename: validateRequiredString(value.filename, 255),
    mimeType,
    fileSizeBytes: integerOrNull(value.fileSizeBytes),
    width: widthOrHeight(value.width),
    height: widthOrHeight(value.height),
    altText: validateOptionalString(value.altText, 1000),
  };
}

async function execute(operation: "create" | "update", input: unknown): Promise<ActionResult> {
  try {
    await requireAdminAction();
    if (operation === "create") await createMedia(validateMedia(input));
    else {
      if (!input || typeof input !== "object") throw new Error("VALIDATION_ERROR");
      const value = input as Record<string, unknown>;
      await updateMedia(validateUuid(value.id), validateMedia(value));
    }
    revalidatePath("/admin/media");
    revalidatePath("/"); revalidatePath("/projects"); revalidatePath("/blog"); revalidatePath("/about");
    revalidatePath("/projects/[slug]", "page"); revalidatePath("/blog/[slug]", "page");
    return { success: true, data: undefined };
  } catch (error) {
    if (error instanceof Error && ["UNAUTHORIZED", "FORBIDDEN", "VALIDATION_ERROR", "NOT_FOUND", "CONFLICT", "STORAGE_NOT_CONFIGURED", "STORAGE_DELETE_PENDING"].includes(error.message)) {
      return { success: false, error: error.message as Extract<ActionResult, { success: false }>["error"] };
    }
    logServerError("media_action_failed", error);
    return { success: false, error: "INTERNAL_ERROR" };
  }
}

export async function createMediaAction(input: unknown) { return execute("create", input); }
export async function updateMediaAction(input: unknown) { return execute("update", input); }

export async function updateMediaAltTextAction(id: string, input: unknown): Promise<ActionResult> {
  try {
    await requireAdminAction();
    const altText = validateOptionalString(input, 1000);
    await updateMediaAltText(validateUuid(id), altText);
    revalidateMediaPaths();
    return { success: true, data: undefined };
  } catch (error) {
    return mapMediaError(error);
  }
}

export async function deleteMediaAction(id: string): Promise<ActionResult> {
  try {
    await requireAdminAction();
    const mediaId = validateUuid(id);
    const preview = await getMediaUsage(mediaId);
    if (!preview) throw new Error("NOT_FOUND");
    await deleteMediaWithReferences(mediaId);
    revalidateMediaPaths();
    return { success: true, data: undefined };
  } catch (error) {
    if (error instanceof Error && error.message === "STORAGE_DELETE_PENDING") {
      logServerError("media_storage_delete_pending", error, { entityType: "media", entityId: id });
      revalidateMediaPaths();
    }
    return mapMediaError(error);
  }
}

function revalidateMediaPaths() {
  revalidatePath("/admin/media");
  revalidatePath("/"); revalidatePath("/projects"); revalidatePath("/blog"); revalidatePath("/about");
  revalidatePath("/projects/[slug]", "page"); revalidatePath("/blog/[slug]", "page");
}

function mapMediaError(error: unknown): ActionResult {
  if (error instanceof Error && ["UNAUTHORIZED", "FORBIDDEN", "VALIDATION_ERROR", "NOT_FOUND", "CONFLICT", "STORAGE_NOT_CONFIGURED", "STORAGE_DELETE_PENDING"].includes(error.message)) {
    return { success: false, error: error.message as Extract<ActionResult, { success: false }>["error"] };
  }
  logServerError("media_action_failed", error);
  return { success: false, error: "INTERNAL_ERROR" };
}
