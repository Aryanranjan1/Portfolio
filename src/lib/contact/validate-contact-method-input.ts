import {
  validateBoolean,
  validateEmail,
  validateNonNegativeInteger,
  validateOptionalString,
  validateRequiredString,
  validateUrl,
  validateUuid,
} from "@/lib/validation";
import type { ContactMethodType, CreateContactMethodInput } from "@/lib/convex/mutations/site";
import { isConfiguredContact } from "./is-configured-contact";

const contactMethodTypes: ContactMethodType[] = [
  "email", "linkedin", "github", "x", "threads", "instagram", "youtube", "location", "other",
];

export function validateContactMethodInput(input: unknown): CreateContactMethodInput {
  if (!input || typeof input !== "object") throw new Error("VALIDATION_ERROR");
  const value = input as Record<string, unknown>;

  if (value.iconMode !== "built_in" && value.iconMode !== "uploaded") throw new Error("VALIDATION_ERROR");
  if (typeof value.type !== "string" || !contactMethodTypes.includes(value.type as ContactMethodType)) {
    throw new Error("VALIDATION_ERROR");
  }

  const contactValue = validateOptionalString(value.value, 500);
  let submittedUrl = value.url;
  if (submittedUrl === null || submittedUrl === undefined || submittedUrl === "") {
    submittedUrl = null;
    if (value.type === "email" && contactValue) {
      try {
        submittedUrl = `mailto:${validateEmail(contactValue)}`;
      } catch {
        throw new Error("INVALID_CONTACT_URL");
      }
    }
  }

  const validated: CreateContactMethodInput = {
    type: value.type as ContactMethodType,
    label: validateRequiredString(value.label, 100),
    value: contactValue,
    url: validateContactMethodUrl(value.type as ContactMethodType, submittedUrl),
    position: validateNonNegativeInteger(value.position),
    active: validateBoolean(value.active),
    iconMode: value.iconMode,
    iconName: value.iconMode === "uploaded" ? null : validateContactIconName(value.iconName),
    iconMediaId: value.iconMode === "uploaded" ? validateUuid(value.iconMediaId) : null,
  };

  if (validated.active && !isConfiguredContact(validated)) throw new Error("INVALID_CONTACT_URL");
  return validated;
}

function validateContactIconName(value: unknown) {
  const allowed = ["email", "linkedin", "github", "x", "threads", "instagram", "youtube", "other"];
  if (typeof value !== "string" || !allowed.includes(value)) throw new Error("VALIDATION_ERROR");
  return value;
}

function validateContactMethodUrl(type: ContactMethodType, value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  if (type === "email" && typeof value === "string" && value.toLowerCase().startsWith("mailto:")) {
    try {
      return `mailto:${validateEmail(value.slice(7))}`;
    } catch {
      throw new Error("INVALID_CONTACT_URL");
    }
  }
  try {
    return validateUrl(value);
  } catch {
    throw new Error("INVALID_CONTACT_URL");
  }
}
