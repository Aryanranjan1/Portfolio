"use server";

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

import {
  validateBoolean,
  validateNonNegativeInteger,
  validateOptionalString,
  validatePosition,
  validateRequiredString,
  validateSlug,
  validateUrl,
  validateUuid,
} from "@/lib/validation";

import type { ActionResult } from "@/lib/actions/action-result";

const projectStatuses: ProjectStatus[] = [
  "draft",
  "published",
  "archived",
];

const sectionTypes = [
  "about",
  "problem",
  "solution",
  "build",
  "results",
  "gallery",
  "whats_next",
] as const;

const blockTypes = [
  "rich_text",
  "quote",
  "image",
  "gallery",
  "problem_list",
  "objective_list",
  "technology_list",
  "process_steps",
  "metrics",
  "roadmap",
  "callout",
] as const;

const mediaRoles = [
  "hero",
  "preview",
  "problem_gallery",
  "wireframe",
  "gallery",
  "other",
] as const;

const linkTypes = [
  "live",
  "repository",
  "case_study",
  "documentation",
  "demo",
  "other",
] as const;

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
        : validateUrl(
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
    console.error(
      "createProjectAction failed:",
      error,
    );

    return {
      success: false,
      error: mapError(error),
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
  console.error("Project reference action failed:", error);
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

    const updated =
      await updateProject(
        updateInput,
      );

    revalidateProjectPaths(
      updated.slug,
    );

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    console.error(
      "updateProjectAction failed:",
      error,
    );

    return {
      success: false,
      error: mapError(error),
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

    await deleteProject(
      validatedId,
    );

    revalidatePath("/projects");

    revalidatePath("/");

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    console.error(
      "deleteProjectAction failed:",
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
    console.error(
      "setProjectStatusAction failed:",
      error,
    );

    return {
      success: false,
      error: mapError(error),
    };
  }
}

function revalidateProjectPaths(
  slug: string,
) {
  revalidatePath("/projects");
  revalidatePath(`/projects/${slug}`);
  revalidatePath("/");
}
