"use server";

import { revalidatePath } from "next/cache";

import {
  createContactMethod,
  createFaq,
  createTimelineEntry,
  deleteContactMethod,
  deleteFaq,
  deleteTimelineEntry,
  updateContactMethod,
  updateFaq,
  updateSiteSettings,
  updateTimelineEntry,
  type ContactMethodType,
  type CreateContactMethodInput,
  type CreateFaqInput,
  type CreateTimelineEntryInput,
  type UpdateContactMethodInput,
  type UpdateFaqInput,
  type UpdateSiteSettingsInput,
  type UpdateTimelineEntryInput,
} from "@/db/mutations/site";

import {
  createSkill,
  createSkillCategory,
  deleteSkill,
  deleteSkillCategory,
  updateSkill,
  updateSkillCategory,
  type SkillCategoryInput,
  type SkillInput,
} from "@/db/mutations/skills";

import { requireAdminAction } from "@/lib/auth/require-admin-action";

import {
  validateBoolean,
  validateEmail,
  validateNonNegativeInteger,
  validateOptionalString,
  validateRequiredString,
  validateSlug,
  validateUrl,
  validateUuid,
} from "@/lib/validation";

import type { ActionResult } from "@/lib/actions/action-result";

const contactMethodTypes: ContactMethodType[] = [
  "email",
  "linkedin",
  "github",
  "x",
  "location",
  "other",
];

/* -------------------------------------------------------------------------- */
/* Validators                                                                */
/* -------------------------------------------------------------------------- */

function validateSiteSettingsInput(
  input: unknown,
): UpdateSiteSettingsInput {
  if (!input || typeof input !== "object") {
    throw new Error("VALIDATION_ERROR");
  }

  const value = input as Record<string, unknown>;

  return {
    siteName: validateRequiredString(
      value.siteName,
      200,
    ),

    personName: validateRequiredString(
      value.personName,
      200,
    ),

    professionalTitle: validateRequiredString(
      value.professionalTitle,
      200,
    ),

    shortDescription: validateRequiredString(
      value.shortDescription,
      500,
    ),

    bio: validateRequiredString(
      value.bio,
      5000,
    ),

    location: validateRequiredString(
      value.location,
      200,
    ),

    education: validateOptionalString(
      value.education,
      500,
    ),

    interests: validateOptionalString(
      value.interests,
      1000,
    ),

    availabilityStatus: validateRequiredString(
      value.availabilityStatus,
      100,
    ),

    availabilityText: validateOptionalString(
      value.availabilityText,
      500,
    ),

    yearsBuilding: validateNonNegativeInteger(
      value.yearsBuilding,
    ),

    projectsCompleted: validateNonNegativeInteger(
      value.projectsCompleted,
    ),

    leetcodeSolved: validateNonNegativeInteger(
      value.leetcodeSolved,
    ),

    learningHours: validateNonNegativeInteger(
      value.learningHours,
    ),

    primaryEmail: validateEmail(
      value.primaryEmail,
    ),

    siteDescription: validateRequiredString(
      value.siteDescription,
      320,
    ),

    canonicalOrigin: validateUrl(
      value.canonicalOrigin,
    ),

    defaultSocialImageId:
      value.defaultSocialImageId === null ||
      value.defaultSocialImageId === undefined
        ? null
        : validateUuid(
            value.defaultSocialImageId,
          ),
  };
}

function validateContactMethodInput(
  input: unknown,
): CreateContactMethodInput {
  if (!input || typeof input !== "object") {
    throw new Error("VALIDATION_ERROR");
  }

  const value = input as Record<string, unknown>;

  if (
    typeof value.type !== "string" ||
    !contactMethodTypes.includes(
      value.type as ContactMethodType,
    )
  ) {
    throw new Error("VALIDATION_ERROR");
  }

  return {
    type: value.type as ContactMethodType,

    label: validateRequiredString(
      value.label,
      100,
    ),

    value: validateOptionalString(
      value.value,
      500,
    ),

    url:
      value.url === null ||
      value.url === undefined
        ? null
        : validateUrl(value.url),

    position: validateNonNegativeInteger(
      value.position,
    ),

    active: validateBoolean(
      value.active,
    ),
  };
}

function validateTimelineEntryInput(
  input: unknown,
): CreateTimelineEntryInput {
  if (!input || typeof input !== "object") {
    throw new Error("VALIDATION_ERROR");
  }

  const value = input as Record<string, unknown>;

  const year = validateNonNegativeInteger(
    value.year,
  );

  if (year < 1900 || year > 2200) {
    throw new Error("VALIDATION_ERROR");
  }

  return {
    year,

    title: validateRequiredString(
      value.title,
      200,
    ),

    description: validateRequiredString(
      value.description,
      2000,
    ),

    tag: validateOptionalString(
      value.tag,
      100,
    ),

    position: validateNonNegativeInteger(
      value.position,
    ),

    active: validateBoolean(
      value.active,
    ),
  };
}

function validateFaqInput(
  input: unknown,
): CreateFaqInput {
  if (!input || typeof input !== "object") {
    throw new Error("VALIDATION_ERROR");
  }

  const value = input as Record<string, unknown>;

  return {
    question: validateRequiredString(
      value.question,
      500,
    ),

    answer: validateRequiredString(
      value.answer,
      5000,
    ),

    position: validateNonNegativeInteger(
      value.position,
    ),

    active: validateBoolean(
      value.active,
    ),
  };
}

function validateSkillCategoryInput(
  input: unknown,
): SkillCategoryInput {
  if (!input || typeof input !== "object") {
    throw new Error("VALIDATION_ERROR");
  }

  const value = input as Record<string, unknown>;

  return {
    name: validateRequiredString(
      value.name,
      100,
    ),

    slug: validateSlug(
      value.slug,
    ),

    description: validateOptionalString(
      value.description,
      1000,
    ),

    position: validateNonNegativeInteger(
      value.position,
    ),
  };
}

function validateSkillInput(
  input: unknown,
): SkillInput {
  if (!input || typeof input !== "object") {
    throw new Error("VALIDATION_ERROR");
  }

  const value = input as Record<string, unknown>;

  return {
    categoryId: validateUuid(
      value.categoryId,
    ),

    name: validateRequiredString(
      value.name,
      100,
    ),

    slug: validateSlug(
      value.slug,
    ),

    description: validateOptionalString(
      value.description,
      1000,
    ),

    details: validateOptionalString(
      value.details,
      5000,
    ),

    iconMediaId:
      value.iconMediaId === null ||
      value.iconMediaId === undefined ||
      value.iconMediaId === ""
        ? null
        : validateUuid(
            value.iconMediaId,
          ),

    position: validateNonNegativeInteger(
      value.position,
    ),
  };
}

/* -------------------------------------------------------------------------- */
/* Error mapping                                                             */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/* Site Settings                                                             */
/* -------------------------------------------------------------------------- */

export async function updateSiteSettingsAction(
  input: unknown,
): Promise<ActionResult> {
  try {
    await requireAdminAction();

    const validated =
      validateSiteSettingsInput(input);

    await updateSiteSettings(validated);

    revalidateSitePaths();

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    console.error(
      "updateSiteSettingsAction failed:",
      error,
    );

    return {
      success: false,
      error: mapError(error),
    };
  }
}

/* -------------------------------------------------------------------------- */
/* Contact Methods                                                           */
/* -------------------------------------------------------------------------- */

export async function createContactMethodAction(
  input: unknown,
): Promise<ActionResult> {
  try {
    await requireAdminAction();

    const validated =
      validateContactMethodInput(input);

    await createContactMethod(validated);

    revalidateContactPaths();

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    console.error(
      "createContactMethodAction failed:",
      error,
    );

    return {
      success: false,
      error: mapError(error),
    };
  }
}

export async function updateContactMethodAction(
  input: unknown,
): Promise<ActionResult> {
  try {
    await requireAdminAction();

    if (!input || typeof input !== "object") {
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
      validateContactMethodInput(input);

    const updateInput:
      UpdateContactMethodInput = {
        ...validated,
        id,
      };

    await updateContactMethod(
      updateInput,
    );

    revalidateContactPaths();

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    console.error(
      "updateContactMethodAction failed:",
      error,
    );

    return {
      success: false,
      error: mapError(error),
    };
  }
}

export async function deleteContactMethodAction(
  id: string,
): Promise<ActionResult> {
  try {
    await requireAdminAction();

    await deleteContactMethod(
      validateUuid(id),
    );

    revalidateContactPaths();

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    console.error(
      "deleteContactMethodAction failed:",
      error,
    );

    return {
      success: false,
      error: mapError(error),
    };
  }
}

/* -------------------------------------------------------------------------- */
/* Timeline                                                                   */
/* -------------------------------------------------------------------------- */

export async function createTimelineEntryAction(
  input: unknown,
): Promise<ActionResult> {
  try {
    await requireAdminAction();

    const validated =
      validateTimelineEntryInput(input);

    await createTimelineEntry(validated);

    revalidateAboutPaths();

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    console.error(
      "createTimelineEntryAction failed:",
      error,
    );

    return {
      success: false,
      error: mapError(error),
    };
  }
}

export async function updateTimelineEntryAction(
  input: unknown,
): Promise<ActionResult> {
  try {
    await requireAdminAction();

    if (!input || typeof input !== "object") {
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
      validateTimelineEntryInput(input);

    const updateInput:
      UpdateTimelineEntryInput = {
        ...validated,
        id,
      };

    await updateTimelineEntry(
      updateInput,
    );

    revalidateAboutPaths();

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    console.error(
      "updateTimelineEntryAction failed:",
      error,
    );

    return {
      success: false,
      error: mapError(error),
    };
  }
}

export async function deleteTimelineEntryAction(
  id: string,
): Promise<ActionResult> {
  try {
    await requireAdminAction();

    await deleteTimelineEntry(
      validateUuid(id),
    );

    revalidateAboutPaths();

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    console.error(
      "deleteTimelineEntryAction failed:",
      error,
    );

    return {
      success: false,
      error: mapError(error),
    };
  }
}

/* -------------------------------------------------------------------------- */
/* FAQ                                                                        */
/* -------------------------------------------------------------------------- */

export async function createFaqAction(
  input: unknown,
): Promise<ActionResult> {
  try {
    await requireAdminAction();

    const validated =
      validateFaqInput(input);

    await createFaq(validated);

    revalidateFaqPaths();

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    console.error(
      "createFaqAction failed:",
      error,
    );

    return {
      success: false,
      error: mapError(error),
    };
  }
}

export async function updateFaqAction(
  input: unknown,
): Promise<ActionResult> {
  try {
    await requireAdminAction();

    if (!input || typeof input !== "object") {
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
      validateFaqInput(input);

    const updateInput: UpdateFaqInput = {
      ...validated,
      id,
    };

    await updateFaq(updateInput);

    revalidateFaqPaths();

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    console.error(
      "updateFaqAction failed:",
      error,
    );

    return {
      success: false,
      error: mapError(error),
    };
  }
}

export async function deleteFaqAction(
  id: string,
): Promise<ActionResult> {
  try {
    await requireAdminAction();

    await deleteFaq(
      validateUuid(id),
    );

    revalidateFaqPaths();

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    console.error(
      "deleteFaqAction failed:",
      error,
    );

    return {
      success: false,
      error: mapError(error),
    };
  }
}

/* -------------------------------------------------------------------------- */
/* Skill Categories                                                           */
/* -------------------------------------------------------------------------- */

export async function createSkillCategoryAction(
  input: unknown,
): Promise<ActionResult> {
  try {
    await requireAdminAction();

    const validated =
      validateSkillCategoryInput(input);

    await createSkillCategory(
      validated,
    );

    revalidateSkillPaths();

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    console.error(
      "createSkillCategoryAction failed:",
      error,
    );

    return {
      success: false,
      error: mapError(error),
    };
  }
}

export async function updateSkillCategoryAction(
  input: unknown,
): Promise<ActionResult> {
  try {
    await requireAdminAction();

    if (!input || typeof input !== "object") {
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
      validateSkillCategoryInput(input);

    await updateSkillCategory(
      id,
      validated,
    );

    revalidateSkillPaths();

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    console.error(
      "updateSkillCategoryAction failed:",
      error,
    );

    return {
      success: false,
      error: mapError(error),
    };
  }
}

export async function deleteSkillCategoryAction(
  id: string,
): Promise<ActionResult> {
  try {
    await requireAdminAction();

    await deleteSkillCategory(
      validateUuid(id),
    );

    revalidateSkillPaths();

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    console.error(
      "deleteSkillCategoryAction failed:",
      error,
    );

    return {
      success: false,
      error: mapError(error),
    };
  }
}

/* -------------------------------------------------------------------------- */
/* Skills                                                                     */
/* -------------------------------------------------------------------------- */

export async function createSkillAction(
  input: unknown,
): Promise<ActionResult> {
  try {
    await requireAdminAction();

    const validated =
      validateSkillInput(input);

    await createSkill(validated);

    revalidateSkillPaths();

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    console.error(
      "createSkillAction failed:",
      error,
    );

    return {
      success: false,
      error: mapError(error),
    };
  }
}

export async function updateSkillAction(
  input: unknown,
): Promise<ActionResult> {
  try {
    await requireAdminAction();

    if (!input || typeof input !== "object") {
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
      validateSkillInput(input);

    await updateSkill(
      id,
      validated,
    );

    revalidateSkillPaths();

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    console.error(
      "updateSkillAction failed:",
      error,
    );

    return {
      success: false,
      error: mapError(error),
    };
  }
}

export async function deleteSkillAction(
  id: string,
): Promise<ActionResult> {
  try {
    await requireAdminAction();

    await deleteSkill(
      validateUuid(id),
    );

    revalidateSkillPaths();

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    console.error(
      "deleteSkillAction failed:",
      error,
    );

    return {
      success: false,
      error: mapError(error),
    };
  }
}

/* -------------------------------------------------------------------------- */
/* Revalidation                                                               */
/* -------------------------------------------------------------------------- */

function revalidateSitePaths() {
  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/contact");
  revalidatePath("/blog");
  revalidatePath("/projects");
}

function revalidateContactPaths() {
  revalidatePath("/");
  revalidatePath("/contact");
}

function revalidateAboutPaths() {
  revalidatePath("/");
  revalidatePath("/about");
}

function revalidateFaqPaths() {
  revalidatePath("/");
  revalidatePath("/contact");
}

function revalidateSkillPaths() {
  revalidatePath("/");
  revalidatePath("/about");
}