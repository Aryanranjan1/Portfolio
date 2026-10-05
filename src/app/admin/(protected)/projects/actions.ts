"use server";
import { logServerError } from "@/lib/observability/log";

import { revalidatePath } from "next/cache";

import {
  createProject,
  createProjectCategory,
  createTechnology,
  deleteProject,
  deleteProjectCategory,
  deleteTechnology,
  setProjectStatus,
  updateProject,
  updateProjectCategory,
  updateTechnology,
  type ProjectCategoryRecordInput,
  type TechnologyInput,
  type CreateProjectInput,
  type ProjectStatus,
  type UpdateProjectInput,
} from "@/db/mutations/projects";

import { requireAdminAction } from "@/lib/auth/require-admin-action";
import { getProjectSlugById } from "@/db/queries/projects";

import {
  validateBoolean,
  validateCanonicalUrl,
  validateNonNegativeInteger,
  validateOptionalString,
  validatePosition,
  validateRequiredString,
  validateSlug,
  validateUrl,
  validateUuid,
} from "@/lib/validation";

import type { ActionResult } from "@/lib/actions/action-result";
import { PROJECT_BLOCK_TYPES as blockTypes, PROJECT_LINK_TYPES as linkTypes, PROJECT_MEDIA_ROLES as mediaRoles, PROJECT_SECTION_TYPES as sectionTypes } from "@/lib/projects/editor-options";
import { getProjectBlockDataErrors } from "@/lib/validation";
import { isDatabaseError } from "@/db/mutations/db-errors";

const projectStatuses: ProjectStatus[] = [
  "draft",
  "published",
  "archived",
];

function getProjectInputErrors(value: Record<string, unknown>): Record<string, string> {
  const errors: Record<string, string> = {};
  const required: Record<string, { label: string; max: number }> = {
    title: { label: "Title", max: 200 }, slug: { label: "Slug", max: 200 },
    shortDescription: { label: "Short description", max: 500 }, description: { label: "Description", max: 10000 },
    projectType: { label: "Project type", max: 100 },
  };
  for (const [field, rule] of Object.entries(required)) {
    const submitted = value[field];
    if (typeof submitted !== "string" || !submitted.trim()) errors[field] = `${rule.label} is required.`;
    else if (submitted.trim().length > rule.max) errors[field] = `${rule.label} must be ${rule.max} characters or fewer.`;
    else if (field === "slug" && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(submitted.trim())) errors[field] = "Slug must contain only lowercase letters, numbers, and hyphens.";
  }
  if (value.status === "published" && (value.publishedAt === null || value.publishedAt === undefined || value.publishedAt === "")) errors.publishedAt = "Published date is required when status is Published.";
  if (value.publishedAt !== null && value.publishedAt !== undefined && value.publishedAt !== "" && ((typeof value.publishedAt !== "string" && !(value.publishedAt instanceof Date)) || Number.isNaN(new Date(value.publishedAt as string | Date).getTime()))) errors.publishedAt = "Enter a valid published date.";
  if (typeof value.year === "number" && (!Number.isInteger(value.year) || value.year < 1900 || value.year > 2200)) errors.year = "Enter a whole year from 1900 to 2200.";
  for (const field of ["seoTitle", "seoDescription", "socialTitle", "socialDescription", "canonicalOverride"]) {
    const submitted = value[field];
    if (submitted == null || submitted === "") continue;
    const max = field === "seoDescription" || field === "socialDescription" ? 320 : 200;
    if (typeof submitted !== "string") errors[field] = "Enter text for this field.";
    else if (field !== "canonicalOverride" && submitted.length > max) errors[field] = `${field === "seoDescription" ? "SEO description" : field === "socialDescription" ? "Social description" : field === "seoTitle" ? "SEO title" : "Social title"} must be ${max} characters or fewer.`;
  }
  if (value.canonicalOverride !== null && value.canonicalOverride !== undefined && value.canonicalOverride !== "") {
    try { validateCanonicalUrl(value.canonicalOverride); }
    catch { errors.canonicalOverride = "Enter a valid public HTTPS canonical URL."; }
  }
  if (value.socialImageId != null && value.socialImageId !== "" && (typeof value.socialImageId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value.socialImageId))) errors.socialImageId = "Select a valid social image.";

  const attachedMedia = new Set(Array.isArray(value.media) ? value.media.map((item) => item && typeof item === "object" ? (item as Record<string, unknown>).mediaId : null) : []);
  if (Array.isArray(value.sections)) value.sections.forEach((section, si) => {
    if (!section || typeof section !== "object") return;
    const sectionValue = section as Record<string, unknown>;
    const sectionId = typeof sectionValue.id === "string" && sectionValue.id ? sectionValue.id : `position-${typeof sectionValue.position === "number" ? sectionValue.position : si}`;
    if (!Array.isArray(sectionValue.blocks)) return;
    sectionValue.blocks.forEach((block, bi) => {
      if (!block || typeof block !== "object") return;
      const blockValue = block as Record<string, unknown>;
      const blockId = typeof blockValue.id === "string" && blockValue.id ? blockValue.id : `position-${typeof blockValue.position === "number" ? blockValue.position : bi}`;
      const base = `sections.${sectionId}.blocks.${blockId}`;
      if (typeof blockValue.type !== "string") { errors[base] = "Choose a supported project block type."; return; }
      for (const [field, message] of Object.entries(getProjectBlockDataErrors(blockValue.type, blockValue.data))) {
        const path = field === "data" || field === "type" ? base : `${base}.data.${field}`;
        errors[path] = message;
      }
      const data = blockValue.data && typeof blockValue.data === "object" ? blockValue.data as Record<string, unknown> : {};
      if (blockValue.type === "image" && typeof data.mediaId === "string" && data.mediaId && !attachedMedia.has(data.mediaId)) errors[`${base}.data.mediaId`] = "Add this image to the project media assignments.";
      if (blockValue.type === "gallery" && Array.isArray(data.mediaIds)) data.mediaIds.forEach((id, index) => { if (typeof id === "string" && id && !attachedMedia.has(id)) errors[`${base}.data.mediaIds.${index}`] = "Add this image to the project media assignments."; });
    });
  });
  if (Array.isArray(value.links)) value.links.forEach((link, index) => {
    if (!link || typeof link !== "object") { errors[`links.${index}`] = `Project link ${index + 1} is invalid.`; return; }
    const row = link as Record<string, unknown>;
    if (typeof row.label !== "string" || !row.label.trim()) errors[`links.${index}.label`] = `Project link ${index + 1}: label is required.`;
    if (typeof row.url !== "string" || !validHttpUrl(row.url)) errors[`links.${index}.url`] = `Project link ${index + 1}: enter a valid HTTP(S) URL.`;
  });
  if (!Array.isArray(value.sections)) errors.sections = "Project sections could not be read.";
  if (!Array.isArray(value.media)) errors.media = "Project media assignments could not be read.";
  if (!Array.isArray(value.links)) errors.links = "Project links could not be read.";
  return errors;
}

function validHttpUrl(value: string) {
  try { const url = new URL(value); return url.protocol === "http:" || url.protocol === "https:"; } catch { return false; }
}

function validateProjectInput(
  input: unknown,
): CreateProjectInput {
  if (
    !input ||
    typeof input !== "object"
  ) {
    throw new Error("VALIDATION_ERROR");
  }

  const value =
    input as Record<string, unknown>;

  const fieldErrors = getProjectInputErrors(value);
  if (Object.keys(fieldErrors).length) {
    const error = new Error("VALIDATION_ERROR") as Error & { fieldErrors: Record<string, string> };
    error.fieldErrors = fieldErrors;
    throw error;
  }

  if (
    !Array.isArray(value.categories) ||
    !Array.isArray(value.technologies) ||
    !Array.isArray(value.media) ||
    !Array.isArray(value.sections) ||
    !Array.isArray(value.links)
  ) {
    throw new Error("VALIDATION_ERROR");
  }

  if (
    typeof value.status !== "string" ||
    !projectStatuses.includes(
      value.status as ProjectStatus,
    )
  ) {
    throw new Error("VALIDATION_ERROR");
  }

  const year =
    value.year === null ||
    value.year === undefined
      ? null
      : validateNonNegativeInteger(
          value.year,
        );

  if (
    year !== null &&
    (year < 1900 || year > 2200)
  ) {
    throw new Error("VALIDATION_ERROR");
  }

  const publishedAt =
    value.publishedAt === null ||
    value.publishedAt === undefined
      ? null
      : validateDate(value.publishedAt);

  return {
    slug: validateSlug(value.slug),

    title: validateRequiredString(
      value.title,
      200,
    ),

    shortDescription:
      validateRequiredString(
        value.shortDescription,
        500,
      ),

    description:
      validateRequiredString(
        value.description,
        10000,
      ),

    projectType:
      validateRequiredString(
        value.projectType,
        100,
      ),

    location:
      validateOptionalString(
        value.location,
        200,
      ),

    year,

    status:
      value.status as ProjectStatus,

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
        320,
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

    categories:
      value.categories.map(
        validateCategoryInput,
      ),

    technologies:
      value.technologies.map(
        validateTechnologyInput,
      ),

    media:
      value.media.map(
        validateMediaInput,
      ),

    sections:
      value.sections.map(
        validateSectionInput,
      ),

    links:
      value.links.map(
        validateLinkInput,
      ),
  };
}

function validateCategoryInput(
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
    categoryId: validateUuid(
      item.categoryId,
    ),
  };
}

function validateTechnologyInput(
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
    technologyId: validateUuid(
      item.technologyId,
    ),

    position: validatePosition(
      item.position,
    ),
  };
}

function validateMediaInput(
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
    typeof item.role !== "string" ||
    !mediaRoles.includes(
      item.role as (typeof mediaRoles)[number],
    )
  ) {
    throw new Error("VALIDATION_ERROR");
  }

  return {
    mediaId: validateUuid(
      item.mediaId,
    ),

    role: item.role as
      (typeof mediaRoles)[number],

    position: validatePosition(
      item.position,
    ),

    caption:
      validateOptionalString(
        item.caption,
        500,
      ),

    altTextOverride:
      validateOptionalString(
        item.altTextOverride,
        500,
      ),
  };
}

function validateSectionInput(
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
    !sectionTypes.includes(
      item.type as (typeof sectionTypes)[number],
    )
  ) {
    throw new Error("VALIDATION_ERROR");
  }

  if (!Array.isArray(item.blocks)) {
    throw new Error("VALIDATION_ERROR");
  }

  return {
    id:
      item.id === null ||
      item.id === undefined
        ? undefined
        : validateUuid(item.id),

    type: item.type as
      (typeof sectionTypes)[number],

    title:
      validateOptionalString(
        item.title,
        200,
      ),

    anchor:
      validateOptionalString(
        item.anchor,
        100,
      ),

    position: validatePosition(
      item.position,
    ),

    blocks:
      item.blocks.map(
        validateBlockInput,
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

    position: validatePosition(
      item.position,
    ),

    data:
      item.data as Record<
        string,
        unknown
      >,
  };
}

function validateLinkInput(
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
    !linkTypes.includes(
      item.type as (typeof linkTypes)[number],
    )
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
      (typeof linkTypes)[number],

    label: validateRequiredString(
      item.label,
      100,
    ),

    url: validateUrl(item.url),

    position: validatePosition(
      item.position,
    ),
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
  if (error.message === "DATABASE_ERROR" || ("code" in error && typeof error.code === "string" && /^[0-9A-Z]{5}$/.test(error.code))) return "DATABASE_ERROR" as const;

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

export async function createProjectAction(
  input: unknown,
): Promise<ActionResult> {
  try {
    await requireAdminAction();

    const validated =
      validateProjectInput(input);

    const created =
      await createProject(validated);

    revalidateProjectPaths(
      created.slug,
    );

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    logServerError("create_project_action_failed",
      error,
    );

    return {
      success: false,
      error: mapError(error),
      ...((error && typeof error === "object" && "fieldErrors" in error) ? { fieldErrors: (error as { fieldErrors: Record<string, string> }).fieldErrors } : {}),
    };
  }
}

function validateReferenceInput(input: unknown, technologyInput = false): ProjectCategoryRecordInput | TechnologyInput {
  if (!input || typeof input !== "object") throw new Error("VALIDATION_ERROR");
  const value = input as Record<string, unknown>;
  const base = {
    name: validateRequiredString(value.name, 100),
    slug: validateSlug(value.slug),
    description: validateOptionalString(value.description, 1000),
  };
  if (!technologyInput) return base;
  return {
    ...base,
    websiteUrl: value.websiteUrl == null || value.websiteUrl === "" ? null : validateUrl(value.websiteUrl),
    iconMediaId: value.iconMediaId == null || value.iconMediaId === "" ? null : validateUuid(value.iconMediaId),
  };
}

type ActionErrorCode = Extract<ActionResult, { success: false }>["error"];

function mapReferenceError(error: unknown): ActionErrorCode {
  if (error instanceof Error && ["UNAUTHORIZED", "FORBIDDEN", "VALIDATION_ERROR", "NOT_FOUND", "CONFLICT"].includes(error.message)) {
    return error.message as ActionErrorCode;
  }
  logServerError("project_reference_action_failed", error);
  return "INTERNAL_ERROR";
}

async function runProjectReferenceAction(
  op: "createCategory" | "updateCategory" | "deleteCategory" | "createTechnology" | "updateTechnology" | "deleteTechnology",
  input: unknown,
): Promise<ActionResult> {
  try {
    await requireAdminAction();
    const needsId = op.startsWith("update") || op.startsWith("delete");
    let id: string | null = null;
    let value = input;
    if (needsId) {
      if (!input || typeof input !== "object") throw new Error("VALIDATION_ERROR");
      const record = input as Record<string, unknown>;
      id = validateUuid(record.id);
      value = record;
    }
    if (op === "createCategory") await createProjectCategory(validateReferenceInput(value) as ProjectCategoryRecordInput);
    if (op === "updateCategory") await updateProjectCategory(id!, validateReferenceInput(value) as ProjectCategoryRecordInput);
    if (op === "deleteCategory") await deleteProjectCategory(id!);
    if (op === "createTechnology") await createTechnology(validateReferenceInput(value, true) as TechnologyInput);
    if (op === "updateTechnology") await updateTechnology(id!, validateReferenceInput(value, true) as TechnologyInput);
    if (op === "deleteTechnology") await deleteTechnology(id!);
    revalidatePath("/"); revalidatePath("/projects");
    revalidatePath("/projects/[slug]", "page");
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: mapReferenceError(error) };
  }
}

export async function createProjectCategoryAction(input: unknown) { return runProjectReferenceAction("createCategory", input); }
export async function updateProjectCategoryAction(input: unknown) { return runProjectReferenceAction("updateCategory", input); }
export async function deleteProjectCategoryAction(input: unknown) { return runProjectReferenceAction("deleteCategory", input); }
export async function createTechnologyAction(input: unknown) { return runProjectReferenceAction("createTechnology", input); }
export async function updateTechnologyAction(input: unknown) { return runProjectReferenceAction("updateTechnology", input); }
export async function deleteTechnologyAction(input: unknown) { return runProjectReferenceAction("deleteTechnology", input); }

export async function updateProjectAction(
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
      validateProjectInput(input);

    const updateInput: UpdateProjectInput =
      {
        ...validated,
        id,
      };

    const oldSlug = await getProjectSlugById(id);
    if (!oldSlug) throw new Error("NOT_FOUND");

    const updated =
      await updateProject(
        updateInput,
      );

    revalidateProjectPaths(
      oldSlug,
      updated.slug,
    );

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    logServerError("update_project_action_failed",
      error,
    );

    return {
      success: false,
      error: mapError(error),
      ...((error && typeof error === "object" && "fieldErrors" in error) ? { fieldErrors: (error as { fieldErrors: Record<string, string> }).fieldErrors } : {}),
    };
  }
}

export async function deleteProjectAction(
  id: string,
): Promise<ActionResult> {
  try {
    await requireAdminAction();

    const validatedId =
      validateUuid(id);

    const deleted = await deleteProject(
      validatedId,
    );

    revalidatePath("/projects");
    revalidatePath("/");
    revalidatePath(`/projects/${deleted.slug}`);

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    logServerError("delete_project_action_failed",
      error,
    );

    return {
      success: false,
      error: mapError(error),
    };
  }
}

export async function setProjectStatusAction(
  id: string,
  status: ProjectStatus,
  publishedAt?: string | null,
): Promise<ActionResult> {
  try {
    await requireAdminAction();

    const validatedId =
      validateUuid(id);

    if (
      !projectStatuses.includes(status)
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
      await setProjectStatus(
        validatedId,
        status,
        validatedPublishedAt,
      );

    revalidateProjectPaths(
      updated.slug,
    );

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    logServerError("set_project_status_action_failed",
      error,
    );

    return {
      success: false,
      error: mapError(error),
    };
  }
}

function revalidateProjectPaths(
  ...slugs: string[]
) {
  revalidatePath("/projects");
  revalidatePath("/");
  for (const slug of new Set(slugs)) revalidatePath(`/projects/${slug}`);
}
