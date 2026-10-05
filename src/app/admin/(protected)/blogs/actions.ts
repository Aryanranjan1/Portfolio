"use server";
import { logServerError } from "@/lib/observability/log";

import { revalidatePath } from "next/cache";

import {
  createArticle,
  createArticleCategory,
  createTag,
  deleteArticle,
  deleteArticleCategory,
  deleteTag,
  setArticleStatus,
  updateArticle,
  updateArticleCategory,
  updateTag,
  type ArticleStatus,
  type CreateArticleInput,
  type UpdateArticleInput,
} from "@/db/mutations/articles";

import { requireAdminAction } from "@/lib/auth/require-admin-action";
import { getArticleSlugById } from "@/db/queries/articles";

import {
  validateBoolean,
  validateCanonicalUrl,
  validateNonNegativeInteger,
  validateOptionalString,
  validateRequiredString,
  validateSlug,
  validateUuid,
} from "@/lib/validation";

import type { ActionResult } from "@/lib/actions/action-result";
import { getBlockDataErrors } from "@/lib/blog/block-schema";
import { isDatabaseError } from "@/db/mutations/db-errors";

const articleStatuses: ArticleStatus[] = [
  "draft",
  "published",
  "archived",
];

const blockTypes = [
  "heading",
  "paragraph",
  "image",
  "gallery",
  "video",
  "quote",
  "list",
  "code",
  "table",
  "comparison",
  "callout",
  "tool",
  "embed",
] as const;

function validateArticleInput(
  input: unknown,
): CreateArticleInput {
  if (
    !input ||
    typeof input !== "object"
  ) {
    throw new Error("VALIDATION_ERROR");
  }

  const value =
    input as Record<string, unknown>;

  const fieldErrors: Record<string, string> = {};
  if (typeof value.title !== "string" || !value.title.trim()) fieldErrors.title = "Title is required.";
  else if (value.title.trim().length > 200) fieldErrors.title = "Title must be 200 characters or fewer.";
  if (typeof value.slug !== "string" || !value.slug.trim()) fieldErrors.slug = "Slug is required.";
  else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.slug.trim())) fieldErrors.slug = "Slug must contain only lowercase letters, numbers, and hyphens.";
  if (typeof value.excerpt !== "string" || !value.excerpt.trim()) fieldErrors.excerpt = "Excerpt is required.";
  else if (value.excerpt.trim().length > 1000) fieldErrors.excerpt = "Excerpt must be 1000 characters or fewer.";
  if (typeof value.categoryId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value.categoryId)) fieldErrors.categoryId = "Select a valid article category.";
  if (value.status === "published" && (value.publishedAt === null || value.publishedAt === undefined || value.publishedAt === "")) fieldErrors.publishedAt = "Published date is required when status is Published.";
  if (value.publishedAt !== null && value.publishedAt !== undefined && value.publishedAt !== "" && ((typeof value.publishedAt !== "string" && !(value.publishedAt instanceof Date)) || Number.isNaN(new Date(value.publishedAt as string | Date).getTime()))) fieldErrors.publishedAt = "Enter a valid published date.";
  if (value.seoDescription !== null && value.seoDescription !== undefined && (typeof value.seoDescription !== "string" || value.seoDescription.length > 160)) fieldErrors.seoDescription = "SEO description must be 160 characters or fewer.";
  if (value.canonicalOverride !== null && value.canonicalOverride !== undefined && value.canonicalOverride !== "") {
    try { validateCanonicalUrl(value.canonicalOverride); }
    catch { fieldErrors.canonicalOverride = "Enter a valid public HTTPS canonical URL."; }
  }
  if (Array.isArray(value.blocks)) value.blocks.forEach((block, index) => {
    if (!block || typeof block !== "object") return;
    const item = block as Record<string, unknown>;
    if (typeof item.type !== "string" || !item.data || typeof item.data !== "object" || Array.isArray(item.data)) return;
    const identity = typeof item.id === "string" && item.id ? item.id : `position-${typeof item.position === "number" ? item.position : index}`;
    for (const [field, message] of Object.entries(getBlockDataErrors(item.type, item.data))) {
      const path = ["data", "images", "items", "columns", "rows", "type"].includes(field) ? `blocks.${identity}` : `blocks.${identity}.${field}`;
      fieldErrors[path] = message;
    }
  });
  if (Object.keys(fieldErrors).length) {
    const error = new Error("VALIDATION_ERROR") as Error & { fieldErrors: Record<string, string> };
    error.fieldErrors = fieldErrors;
    throw error;
  }

  if (!Array.isArray(value.tags)) {
    throw new Error("VALIDATION_ERROR");
  }

  if (!Array.isArray(value.blocks)) {
    throw new Error("VALIDATION_ERROR");
  }

  if (
    typeof value.status !== "string" ||
    !articleStatuses.includes(
      value.status as ArticleStatus,
    )
  ) {
    throw new Error("VALIDATION_ERROR");
  }

  const publishedAt =
    value.publishedAt === null ||
    value.publishedAt === undefined
      ? null
      : validateDate(
          value.publishedAt,
        );

  return {
    slug: validateSlug(value.slug),

    title: validateRequiredString(
      value.title,
      200,
    ),

    excerpt: validateRequiredString(
      value.excerpt,
      1000,
    ),

    categoryId: validateUuid(
      value.categoryId,
    ),

    tags: value.tags.map(
      validateTagInput,
    ),

    status:
      value.status as ArticleStatus,

    featured: validateBoolean(
      value.featured,
    ),

    publishedAt,

    seoTitle:
      validateOptionalString(
        value.seoTitle,
        200,
      ),

    seoDescription:
      validateOptionalString(
        value.seoDescription,
        160,
      ),

    canonicalOverride:
      value.canonicalOverride ===
        null ||
      value.canonicalOverride ===
        undefined
        ? null
        : validateCanonicalUrl(
            value.canonicalOverride,
          ),

    robotsIndex: validateBoolean(
      value.robotsIndex,
    ),

    robotsFollow: validateBoolean(
      value.robotsFollow,
    ),

    socialTitle:
      validateOptionalString(
        value.socialTitle,
        200,
      ),

    socialDescription:
      validateOptionalString(
        value.socialDescription,
        320,
      ),

    socialImageId:
      value.socialImageId === null ||
      value.socialImageId === undefined
        ? null
        : validateUuid(
            value.socialImageId,
          ),

    blocks: value.blocks.map(
      validateBlockInput,
    ),
  };
}

function validateTagInput(
  value: unknown,
) {
  if (
    !value ||
    typeof value !== "object"
  ) {
    throw new Error("VALIDATION_ERROR");
  }

  const item =
    value as Record<string, unknown>;

  return {
    tagId: validateUuid(
      item.tagId,
    ),
  };
}

function validateBlockInput(
  value: unknown,
) {
  if (
    !value ||
    typeof value !== "object"
  ) {
    throw new Error("VALIDATION_ERROR");
  }

  const item =
    value as Record<string, unknown>;

  if (
    typeof item.type !== "string" ||
    !blockTypes.includes(
      item.type as (typeof blockTypes)[number],
    )
  ) {
    throw new Error("VALIDATION_ERROR");
  }

  if (
    !item.data ||
    typeof item.data !== "object" ||
    Array.isArray(item.data)
  ) {
    throw new Error("VALIDATION_ERROR");
  }

  return {
    id:
      item.id === null ||
      item.id === undefined
        ? undefined
        : validateUuid(item.id),

    type: item.type as
      (typeof blockTypes)[number],

    position:
      validateNonNegativeInteger(
        item.position,
      ),

    data:
      item.data as Record<
        string,
        unknown
      >,
  };
}

function validateDate(value: unknown) {
  if (
    typeof value !== "string" &&
    !(value instanceof Date)
  ) {
    throw new Error("VALIDATION_ERROR");
  }

  const date =
    value instanceof Date
      ? value
      : new Date(value);

  if (
    Number.isNaN(date.getTime())
  ) {
    throw new Error("VALIDATION_ERROR");
  }

  return date;
}

function mapError(error: unknown) {
  if (!(error instanceof Error)) {
    return "INTERNAL_ERROR" as const;
  }
  if (isDatabaseError(error, "23505")) return "CONFLICT" as const;
  if (isDatabaseError(error, "23503") || isDatabaseError(error, "23001")) return "CONFLICT" as const;
  if ("code" in error && typeof error.code === "string" && /^[0-9A-Z]{5}$/.test(error.code)) return "DATABASE_ERROR" as const;

  switch (error.message) {
    case "UNAUTHORIZED":
      return "UNAUTHORIZED" as const;

    case "FORBIDDEN":
      return "FORBIDDEN" as const;

    case "VALIDATION_ERROR":
      return "VALIDATION_ERROR" as const;

    case "NOT_FOUND":
      return "NOT_FOUND" as const;

    case "CONFLICT":
      return "CONFLICT" as const;

    case "DATABASE_ERROR":
      return "DATABASE_ERROR" as const;

    default:
      return "INTERNAL_ERROR" as const;
  }
}

export async function createArticleAction(
  input: unknown,
): Promise<ActionResult> {
  try {
    await requireAdminAction();

    const validated =
      validateArticleInput(input);

    const created =
      await createArticle(validated);

    revalidateArticlePaths(
      created.slug,
    );

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    logServerError("create_article_action_failed",
      error,
    );

    return {
      success: false,
      error: mapError(error),
      ...((error && typeof error === "object" && "fieldErrors" in error) ? { fieldErrors: (error as { fieldErrors: Record<string, string> }).fieldErrors } : {}),
    };
  }
}

function validateArticleReference(input: unknown, withDescription: boolean) {
  if (!input || typeof input !== "object") throw new Error("VALIDATION_ERROR");
  const value = input as Record<string, unknown>;
  const data = { name: validateRequiredString(value.name, 100), slug: validateSlug(value.slug) };
  return withDescription ? { ...data, description: validateOptionalString(value.description, 1000) } : data;
}

async function runArticleReferenceAction(kind: "category" | "tag", operation: "create" | "update" | "delete", input: unknown): Promise<ActionResult> {
  try {
    await requireAdminAction();
    let id: string | null = null;
    let value = input;
    if (operation !== "create") {
      if (!input || typeof input !== "object") throw new Error("VALIDATION_ERROR");
      const record = input as Record<string, unknown>;
      id = validateUuid(record.id);
      value = record;
    }
    if (kind === "category") {
      if (operation === "create") await createArticleCategory(validateArticleReference(value, true) as { name: string; slug: string; description: string | null });
      if (operation === "update") await updateArticleCategory(id!, validateArticleReference(value, true) as { name: string; slug: string; description: string | null });
      if (operation === "delete") await deleteArticleCategory(id!);
    } else {
      if (operation === "create") await createTag(validateArticleReference(value, false));
      if (operation === "update") await updateTag(id!, validateArticleReference(value, false));
      if (operation === "delete") await deleteTag(id!);
    }
    revalidatePath("/blog");
    revalidatePath("/");
    revalidatePath("/blog/[slug]", "page");
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: mapError(error) };
  }
}

export async function createArticleCategoryAction(input: unknown) { return runArticleReferenceAction("category", "create", input); }
export async function updateArticleCategoryAction(input: unknown) { return runArticleReferenceAction("category", "update", input); }
export async function deleteArticleCategoryAction(input: unknown) { return runArticleReferenceAction("category", "delete", input); }
export async function createTagAction(input: unknown) { return runArticleReferenceAction("tag", "create", input); }
export async function updateTagAction(input: unknown) { return runArticleReferenceAction("tag", "update", input); }
export async function deleteTagAction(input: unknown) { return runArticleReferenceAction("tag", "delete", input); }

export async function updateArticleAction(
  input: unknown,
): Promise<ActionResult> {
  try {
    await requireAdminAction();

    if (
      !input ||
      typeof input !== "object"
    ) {
      return {
        success: false,
        error: "VALIDATION_ERROR",
      };
    }

    const value =
      input as Record<string, unknown>;

    const id = validateUuid(
      value.id,
    );

    const validated =
      validateArticleInput(input);

    const updateInput: UpdateArticleInput =
      {
        ...validated,
        id,
      };

    const oldSlug = await getArticleSlugById(id);
    if (!oldSlug) throw new Error("NOT_FOUND");

    const updated =
      await updateArticle(
        updateInput,
      );

    revalidateArticlePaths(
      oldSlug,
      updated.slug,
    );

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    logServerError("update_article_action_failed",
      error,
    );

    return {
      success: false,
      error: mapError(error),
      ...((error && typeof error === "object" && "fieldErrors" in error) ? { fieldErrors: (error as { fieldErrors: Record<string, string> }).fieldErrors } : {}),
    };
  }
}

export async function deleteArticleAction(
  id: string,
): Promise<ActionResult> {
  try {
    await requireAdminAction();

    const validatedId =
      validateUuid(id);

    const deleted = await deleteArticle(
      validatedId,
    );

    revalidatePath("/blog");
    revalidatePath("/");
    revalidatePath(`/blog/${deleted.slug}`);

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    logServerError("delete_article_action_failed",
      error,
    );

    return {
      success: false,
      error: mapError(error),
    };
  }
}

export async function setArticleStatusAction(
  id: string,
  status: ArticleStatus,
  publishedAt?: string | null,
): Promise<ActionResult> {
  try {
    await requireAdminAction();

    const validatedId =
      validateUuid(id);

    if (
      !articleStatuses.includes(status)
    ) {
      return {
        success: false,
        error: "VALIDATION_ERROR",
      };
    }

   const validatedPublishedAt =
  publishedAt === undefined ||
  publishedAt === null
    ? null
    : validateDate(publishedAt);

    const updated =
      await setArticleStatus(
        validatedId,
        status,
        validatedPublishedAt,
      );

    revalidateArticlePaths(
      updated.slug,
    );

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    logServerError("set_article_status_action_failed",
      error,
    );

    return {
      success: false,
      error: mapError(error),
    };
  }
}

function revalidateArticlePaths(
  ...slugs: string[]
) {
  revalidatePath("/blog");
  revalidatePath("/");
  for (const slug of new Set(slugs)) revalidatePath(`/blog/${slug}`);
}
