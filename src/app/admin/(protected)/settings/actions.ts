"use server";
import { logServerError } from "@/lib/observability/log";

import { revalidatePath } from "next/cache";

import {
  createContactMethod,
  createFaq,
  createFooterResource,
  createFooterExploreItem,
  createTimelineEntry,
  deleteContactMethod,
  deleteFaq,
  deleteFooterResource,
  deleteFooterExploreItem,
  deleteTimelineEntry,
  updateContactMethod,
  updateFaq,
  updateFooterResource,
  updateFooterExploreItem,
  updateSiteSettings,
  setDefaultSocialImage,
  setResumeMediaReference,
  reorderFooterResources,
  reorderFooterExploreItems,
  updateTimelineEntry,
  type ContactMethodType,
  type CreateContactMethodInput,
  type CreateFaqInput,
  type FooterResourceInput,
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
import { validateCanonicalOrigin } from "@/lib/site-origin";
import { isConfiguredContact } from "@/lib/contact/is-configured-contact";
import { deleteMediaWithReferences } from "@/db/mutations/media";
import {
  createAboutTechnology,
  deleteAboutTechnology,
  updateAboutTechnology,
  type AboutTechnologyInput,
} from "@/db/mutations/about-technologies";

const contactMethodTypes: ContactMethodType[] = [
  "email",
  "linkedin",
  "github",
  "x",
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

  const fieldErrors: Record<string, string> = {};
  const requiredFields: Record<string, number> = { siteName: 200, personName: 200, professionalTitle: 200, shortDescription: 500, bio: 5000, location: 200, availabilityStatus: 100, primaryEmail: 320, siteDescription: 320 };
  for (const [field, max] of Object.entries(requiredFields)) {
    if (typeof value[field] !== "string" || !value[field].trim()) fieldErrors[field] = `${field === "siteDescription" ? "Site description" : field.replace(/[A-Z]/g, (letter) => ` ${letter.toLowerCase()}`)} is required.`;
    else if (value[field].trim().length > max) fieldErrors[field] = `This field must be ${max} characters or fewer.`;
  }
  if (typeof value.primaryEmail === "string" && value.primaryEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.primaryEmail.trim())) fieldErrors.primaryEmail = "Enter a valid email address.";
  if (value.canonicalOrigin !== undefined && value.canonicalOrigin !== null && !normalizeCanonicalOrigin(value.canonicalOrigin)) fieldErrors.canonicalOrigin = "Enter a valid public HTTPS site URL.";
  for (const field of ["yearsBuilding", "projectsCompleted", "leetcodeSolved", "learningHours"]) if (typeof value[field] !== "number" || !Number.isInteger(value[field]) || value[field] < 0) fieldErrors[field] = "Enter a non-negative whole number.";
  if (value.defaultSocialImageId !== null && value.defaultSocialImageId !== undefined && value.defaultSocialImageId !== "" && (typeof value.defaultSocialImageId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value.defaultSocialImageId))) fieldErrors.defaultSocialImageId = "Select a valid image from Media Library.";
  if (Object.keys(fieldErrors).length) {
    const error = new Error("VALIDATION_ERROR") as Error & { fieldErrors: Record<string, string> };
    error.fieldErrors = fieldErrors;
    throw error;
  }

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

    canonicalOrigin: validateCanonicalOrigin(
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

  const contactValue = validateOptionalString(value.value, 500);
  let submittedUrl = value.url;
  if (submittedUrl === null || submittedUrl === undefined || submittedUrl === "") {
    submittedUrl = null;
    if (value.type === "email" && contactValue) {
      try { submittedUrl = `mailto:${validateEmail(contactValue)}`; } catch { throw new Error("INVALID_CONTACT_URL"); }
    }
  }

  const validated: CreateContactMethodInput = {
    type: value.type as ContactMethodType,

    label: validateRequiredString(
      value.label,
      100,
    ),

    value: contactValue,

    url: validateContactMethodUrl(value.type as ContactMethodType, submittedUrl),

    position: validateNonNegativeInteger(
      value.position,
    ),

    active: validateBoolean(
      value.active,
    ),
  };
  if (validated.active && !isConfiguredContact(validated)) throw new Error("INVALID_CONTACT_URL");
  return validated;
}

function validateContactMethodUrl(type: ContactMethodType, value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  if (type === "email" && typeof value === "string" && value.toLowerCase().startsWith("mailto:")) {
    try { return `mailto:${validateEmail(value.slice(7))}`; } catch { throw new Error("INVALID_CONTACT_URL"); }
  }
  try { return validateUrl(value); } catch { throw new Error("INVALID_CONTACT_URL"); }
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

function validateAboutTechnologyInput(input: unknown): AboutTechnologyInput {
  if (!input || typeof input !== "object") throw new Error("VALIDATION_ERROR");
  const value = input as Record<string, unknown>;
  return {
    label: validateRequiredString(value.label, 100),
    mediaId: value.mediaId === null || value.mediaId === undefined || value.mediaId === "" ? null : validateUuid(value.mediaId),
    position: validateNonNegativeInteger(value.position),
    active: validateBoolean(value.active),
  };
}

/* -------------------------------------------------------------------------- */
/* Error mapping                                                             */
/* -------------------------------------------------------------------------- */

function mapError(error: unknown) {
  if (!(error instanceof Error)) {
    return "INTERNAL_ERROR" as const;
  }
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

    case "MEDIA_NOT_FOUND":
      return "MEDIA_NOT_FOUND" as const;

    case "CONFLICT":
      return "CONFLICT" as const;

    case "INVALID_CONTACT_URL":
      return "INVALID_CONTACT_URL" as const;

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
    logServerError("update_site_settings_action_failed",
      error,
    );

    return {
      success: false,
      error: mapError(error),
      ...((error && typeof error === "object" && "fieldErrors" in error) ? { fieldErrors: (error as { fieldErrors: Record<string, string> }).fieldErrors } : {}),
    };
  }
}

function normalizeCanonicalOrigin(value: unknown) {
  try { return validateCanonicalOrigin(value); } catch { return null; }
}

export async function setDefaultSocialImageAction(mediaId: unknown): Promise<ActionResult> {
  try {
    await requireAdminAction();
    const validatedId = mediaId === null || mediaId === "" ? null : validateUuid(mediaId);
    await setDefaultSocialImage(validatedId);
    revalidateSitePaths();
    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error: mapError(error),
      ...((error && typeof error === "object" && "fieldErrors" in error) ? { fieldErrors: (error as { fieldErrors: Record<string, string> }).fieldErrors } : {}),
    };
  }
}

export async function setResumeMediaAction(mediaId: unknown): Promise<ActionResult<{ cleanupPending: boolean }>> {
  try {
    await requireAdminAction();
    const validatedId = mediaId === null || mediaId === "" ? null : validateUuid(mediaId);
    const previousId = await setResumeMediaReference(validatedId);
    let cleanupPending = false;
    if (previousId && previousId !== validatedId) {
      try {
        await deleteMediaWithReferences(previousId);
      } catch (error) {
        cleanupPending = true;
        logServerError("previous_resume_cleanup_failed", error instanceof Error ? error.message : "unknown error");
      }
    }
    revalidateSitePaths();
    revalidatePath("/admin/media");
    revalidatePath("/admin/settings");
    return { success: true, data: { cleanupPending } };
  } catch (error) {
    return { success: false, error: mapError(error) };
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
    logServerError("create_contact_method_action_failed",
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
    logServerError("update_contact_method_action_failed",
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
    logServerError("delete_contact_method_action_failed",
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
    logServerError("create_timeline_entry_action_failed",
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
    logServerError("update_timeline_entry_action_failed",
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
    logServerError("delete_timeline_entry_action_failed",
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
    logServerError("create_faq_action_failed",
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
    logServerError("update_faq_action_failed",
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
    logServerError("delete_faq_action_failed",
      error,
    );

    return {
      success: false,
      error: mapError(error),
    };
  }
}

function validateFooterResourceInput(input: unknown): FooterResourceInput {
  if (!input || typeof input !== "object") throw new Error("VALIDATION_ERROR");
  const value = input as Record<string, unknown>;
  const rawUrl = validateRequiredString(value.url, 2048);
  let url: string;
  if (rawUrl.startsWith("/") && !rawUrl.startsWith("//") && !rawUrl.startsWith("/\\")) {
    url = rawUrl;
  } else {
    url = validateUrl(rawUrl);
  }
  return {
    label: validateRequiredString(value.label, 100),
    url,
    active: validateBoolean(value.active),
    position: validateNonNegativeInteger(value.position),
  };
}

export async function createFooterResourceAction(input: unknown): Promise<ActionResult> {
  try {
    await requireAdminAction();
    await createFooterResource(validateFooterResourceInput(input));
    revalidateFooterPaths();
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: mapError(error) };
  }
}

export async function updateFooterResourceAction(input: unknown): Promise<ActionResult> {
  try {
    await requireAdminAction();
    if (!input || typeof input !== "object") throw new Error("VALIDATION_ERROR");
    const value = input as Record<string, unknown>;
    await updateFooterResource(validateUuid(value.id), validateFooterResourceInput(value));
    revalidateFooterPaths();
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: mapError(error) };
  }
}

export async function deleteFooterResourceAction(id: string): Promise<ActionResult> {
  try {
    await requireAdminAction();
    await deleteFooterResource(validateUuid(id));
    revalidateFooterPaths();
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: mapError(error) };
  }
}

export async function reorderFooterResourcesAction(input: unknown): Promise<ActionResult> {
  try {
    await requireAdminAction();
    if (!Array.isArray(input)) throw new Error("VALIDATION_ERROR");
    const items = input.map((entry) => {
      if (!entry || typeof entry !== "object") throw new Error("VALIDATION_ERROR");
      const value = entry as Record<string, unknown>;
      return { id: validateUuid(value.id), position: validateNonNegativeInteger(value.position) };
    });
    if (new Set(items.map((item) => item.position)).size !== items.length) throw new Error("VALIDATION_ERROR");
    await reorderFooterResources(items);
    revalidateFooterPaths();
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: mapError(error) };
  }
}

export async function createFooterExploreItemAction(input: unknown): Promise<ActionResult> {
  try { await requireAdminAction(); await createFooterExploreItem(validateFooterResourceInput(input)); revalidateFooterPaths(); return { success: true, data: undefined }; }
  catch (error) { return { success: false, error: mapError(error) }; }
}
export async function updateFooterExploreItemAction(input: unknown): Promise<ActionResult> {
  try { await requireAdminAction(); if (!input || typeof input !== "object") throw new Error("VALIDATION_ERROR"); const value = input as Record<string, unknown>; await updateFooterExploreItem(validateUuid(value.id), validateFooterResourceInput(value)); revalidateFooterPaths(); return { success: true, data: undefined }; }
  catch (error) { return { success: false, error: mapError(error) }; }
}
export async function deleteFooterExploreItemAction(id: string): Promise<ActionResult> {
  try { await requireAdminAction(); await deleteFooterExploreItem(validateUuid(id)); revalidateFooterPaths(); return { success: true, data: undefined }; }
  catch (error) { return { success: false, error: mapError(error) }; }
}
export async function reorderFooterExploreItemsAction(input: unknown): Promise<ActionResult> {
  try { await requireAdminAction(); if (!Array.isArray(input)) throw new Error("VALIDATION_ERROR"); const items = input.map((entry) => { if (!entry || typeof entry !== "object") throw new Error("VALIDATION_ERROR"); const value = entry as Record<string, unknown>; return { id: validateUuid(value.id), position: validateNonNegativeInteger(value.position) }; }); if (new Set(items.map((item) => item.position)).size !== items.length) throw new Error("VALIDATION_ERROR"); await reorderFooterExploreItems(items); revalidateFooterPaths(); return { success: true, data: undefined }; }
  catch (error) { return { success: false, error: mapError(error) }; }
}

function revalidateFooterPaths() {
  revalidatePath("/(public)", "layout");
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
    logServerError("create_skill_category_action_failed",
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
    logServerError("update_skill_category_action_failed",
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
    logServerError("delete_skill_category_action_failed",
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
    logServerError("create_skill_action_failed",
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
    logServerError("update_skill_action_failed",
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
    logServerError("delete_skill_action_failed",
      error,
    );

    return {
      success: false,
      error: mapError(error),
    };
  }
}

export async function createAboutTechnologyAction(input: unknown): Promise<ActionResult> {
  try {
    await requireAdminAction();
    await createAboutTechnology(validateAboutTechnologyInput(input));
    revalidateAboutPaths();
    revalidatePath("/admin/settings");
    return { success: true, data: undefined };
  } catch (error) {
    logServerError("create_about_technology_action_failed", error);
    return { success: false, error: mapError(error) };
  }
}

export async function updateAboutTechnologyAction(input: unknown): Promise<ActionResult> {
  try {
    await requireAdminAction();
    if (!input || typeof input !== "object") throw new Error("VALIDATION_ERROR");
    const value = input as Record<string, unknown>;
    await updateAboutTechnology(validateUuid(value.id), validateAboutTechnologyInput(value));
    revalidateAboutPaths();
    revalidatePath("/admin/settings");
    return { success: true, data: undefined };
  } catch (error) {
    logServerError("update_about_technology_action_failed", error);
    return { success: false, error: mapError(error) };
  }
}

export async function deleteAboutTechnologyAction(id: string): Promise<ActionResult> {
  try {
    await requireAdminAction();
    await deleteAboutTechnology(validateUuid(id));
    revalidateAboutPaths();
    revalidatePath("/admin/settings");
    return { success: true, data: undefined };
  } catch (error) {
    logServerError("delete_about_technology_action_failed", error);
    return { success: false, error: mapError(error) };
  }
}

/* -------------------------------------------------------------------------- */
/* Revalidation                                                               */
/* -------------------------------------------------------------------------- */

function revalidateSitePaths() {
  revalidatePath("/", "layout");
}

function revalidateContactPaths() {
  revalidatePath("/(public)", "layout");
  revalidatePath("/", "layout");
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
