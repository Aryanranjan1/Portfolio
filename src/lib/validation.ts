import { normalizeUsableCanonicalOverride } from "@/lib/seo/origin-validation";

export function validateUuid(value: unknown) {
  if (typeof value !== "string") {
    throw new Error("VALIDATION_ERROR");
  }

  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!uuidPattern.test(value)) {
    throw new Error("VALIDATION_ERROR");
  }

  return value;
}

export function validateRequiredString(
  value: unknown,
  maxLength: number,
) {
  if (typeof value !== "string") {
    throw new Error("VALIDATION_ERROR");
  }

  const normalized = value.trim();

  if (!normalized || normalized.length > maxLength) {
    throw new Error("VALIDATION_ERROR");
  }

  return normalized;
}

export function validateOptionalString(
  value: unknown,
  maxLength: number,
) {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value !== "string") {
    throw new Error("VALIDATION_ERROR");
  }

  const normalized = value.trim();

  if (!normalized) {
    return null;
  }

  if (normalized.length > maxLength) {
    throw new Error("VALIDATION_ERROR");
  }

  return normalized;
}

export function validateEmail(value: unknown) {
  if (typeof value !== "string") {
    throw new Error("VALIDATION_ERROR");
  }

  const email = value.trim().toLowerCase();

  if (email.length > 320) {
    throw new Error("VALIDATION_ERROR");
  }

  const emailPattern =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email)) {
    throw new Error("VALIDATION_ERROR");
  }

  return email;
}

export function validateUrl(value: unknown) {
  if (typeof value !== "string") {
    throw new Error("VALIDATION_ERROR");
  }

  const url = value.trim();

  if (url.length > 2048) {
    throw new Error("VALIDATION_ERROR");
  }

  try {
    const parsed = new URL(url);

    if (
      parsed.protocol !== "http:" &&
      parsed.protocol !== "https:"
    ) {
      throw new Error();
    }
    const hostname = parsed.hostname.toLowerCase();
    if (
      hostname === "localhost" || hostname.endsWith(".localhost") ||
      hostname === "example.com" || hostname.endsWith(".example.com") ||
      hostname === "example.org" || hostname.endsWith(".example.org") ||
      hostname === "example.net" || hostname.endsWith(".example.net")
    ) throw new Error();
  } catch {
    throw new Error("VALIDATION_ERROR");
  }

  return url;
}

export function validateCanonicalUrl(value: unknown) {
  if (typeof value !== "string" || value.length > 2048) throw new Error("VALIDATION_ERROR");
  try {
    const url = new URL(value.trim());
    const normalized = normalizeUsableCanonicalOverride(url.toString());
    if (!normalized) throw new Error();
    return normalized;
  } catch {
    throw new Error("VALIDATION_ERROR");
  }
}

export function validateNonNegativeInteger(
  value: unknown,
) {
  if (
    typeof value !== "number" ||
    !Number.isInteger(value) ||
    value < 0
  ) {
    throw new Error("VALIDATION_ERROR");
  }

  return value;
}

export function validateSlug(value: unknown) {
  if (typeof value !== "string") {
    throw new Error("VALIDATION_ERROR");
  }

  const slug = value.trim().toLowerCase();

  if (
    !slug ||
    slug.length > 200 ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
  ) {
    throw new Error("VALIDATION_ERROR");
  }

  return slug;
}

export function validatePosition(value: unknown) {
  return validateNonNegativeInteger(value);
}

export function validateBoolean(value: unknown) {
  if (typeof value !== "boolean") {
    throw new Error("VALIDATION_ERROR");
  }

  return value;
}

const PROJECT_BLOCK_TYPES = ["rich_text", "quote", "image", "gallery", "problem_list", "objective_list", "technology_list", "process_steps", "metrics", "roadmap", "callout"] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isTextList(value: unknown): value is string[] {
  return Array.isArray(value) && value.length <= 100 && value.every((item) => typeof item === "string" && item.trim().length > 0 && item.length <= 5000);
}

export function isValidProjectBlockData(type: string, data: unknown): boolean {
  if (!isRecord(data)) return false;
  const hasOnly = (keys: string[]) => Object.keys(data).every((key) => keys.includes(key));
  const text = (key: string, max = 20000) => typeof data[key] === "string" && (data[key] as string).trim().length > 0 && (data[key] as string).length <= max;
  const uuid = (value: unknown) => typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
  switch (type) {
    case "rich_text": return hasOnly(["content"]) && text("content");
    case "quote": return hasOnly(["quote", "author"]) && text("quote") && (data.author === undefined || (typeof data.author === "string" && data.author.length <= 500));
    case "image": return hasOnly(["mediaId"]) && uuid(data.mediaId);
    case "gallery": return hasOnly(["mediaIds"]) && Array.isArray(data.mediaIds) && data.mediaIds.length > 0 && data.mediaIds.length <= 50 && data.mediaIds.every(uuid) && new Set(data.mediaIds).size === data.mediaIds.length;
    case "problem_list":
    case "objective_list": return hasOnly(["items"]) && isTextList(data.items) && data.items.length > 0;
    case "technology_list": return hasOnly(["items"]) && isTextList(data.items) && data.items.length > 0;
    case "process_steps": return hasOnly(["steps"]) && Array.isArray(data.steps) && data.steps.length > 0 && data.steps.length <= 100 && data.steps.every((step) => isRecord(step) && Object.keys(step).every((key) => ["title", "description"].includes(key)) && typeof step.title === "string" && step.title.trim().length > 0 && step.title.length <= 500 && typeof step.description === "string" && step.description.length > 0 && step.description.length <= 5000);
    case "metrics": return hasOnly(["metrics"]) && Array.isArray(data.metrics) && data.metrics.length > 0 && data.metrics.length <= 50 && data.metrics.every((metric) => isRecord(metric) && Object.keys(metric).every((key) => ["value", "label"].includes(key)) && typeof metric.value === "string" && metric.value.trim().length > 0 && metric.value.length <= 100 && typeof metric.label === "string" && metric.label.trim().length > 0 && metric.label.length <= 500);
    case "roadmap": return hasOnly(["items"]) && Array.isArray(data.items) && data.items.length > 0 && data.items.length <= 100 && data.items.every((item) => isRecord(item) && Object.keys(item).every((key) => ["title", "description", "phase"].includes(key)) && typeof item.title === "string" && item.title.trim().length > 0 && item.title.length <= 500 && typeof item.description === "string" && item.description.length > 0 && item.description.length <= 5000 && typeof item.phase === "string" && item.phase.trim().length > 0 && item.phase.length <= 100);
    case "callout": return hasOnly(["content", "title"]) && text("content") && (data.title === undefined || (typeof data.title === "string" && data.title.length <= 500));
    default: return false;
  }
}

export function getProjectBlockDataErrors(type: string, data: unknown): Record<string, string> {
  if (isValidProjectBlockData(type, data)) return {};
  if (!isRecord(data)) return { data: "Block data must be an object." };
  const errors: Record<string, string> = {};
  const only = (allowed: string[]) => {
    if (Object.keys(data).some((key) => !allowed.includes(key))) errors.data = "This block contains unsupported fields.";
  };
  const text = (field: string, label: string, max = 20000) => {
    const value = data[field];
    if (typeof value !== "string" || !value.trim()) errors[field] = `${label} is required.`;
    else if (value.length > max) errors[field] = `${label} must be ${max} characters or fewer.`;
  };
  const rows = (field: string, columns: string[], labels: Record<string, string>, maxLength: Record<string, number>) => {
    const value = data[field];
    if (!Array.isArray(value) || value.length === 0) { errors[field] = `Add at least one ${labels[field] ?? field.replaceAll("_", " ").replace(/s$/, "")}.`; return; }
    if (value.length > 100) errors[field] = "This block supports up to 100 items.";
    value.forEach((row, index) => {
      if (!isRecord(row)) { errors[`${field}.${index}`] = `Item ${index + 1} is invalid.`; return; }
      if (Object.keys(row).some((key) => !columns.includes(key))) errors[`${field}.${index}`] = `Item ${index + 1} contains unsupported fields.`;
      for (const key of columns) {
        const item = row[key];
        const label = labels[key] ?? key;
        if (typeof item !== "string" || !item.trim()) errors[`${field}.${index}.${key}`] = `${label} is required.`;
        else if (item.length > maxLength[key]) errors[`${field}.${index}.${key}`] = `${label} must be ${maxLength[key]} characters or fewer.`;
      }
    });
  };
  switch (type) {
    case "rich_text": only(["content"]); text("content", "Content"); break;
    case "quote": only(["quote", "author"]); text("quote", "Quote"); if (data.author !== undefined && (typeof data.author !== "string" || data.author.length > 500)) errors.author = "Attribution must be 500 characters or fewer."; break;
    case "image": only(["mediaId"]); if (typeof data.mediaId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(data.mediaId)) errors.mediaId = "Select an image from Media Library."; break;
    case "gallery": {
      only(["mediaIds"]);
      if (!Array.isArray(data.mediaIds) || !data.mediaIds.length) errors.mediaIds = "Add at least one image to the gallery.";
      else if (data.mediaIds.length > 50) errors.mediaIds = "A gallery supports up to 50 images.";
      else {
        const seen = new Set<string>();
        data.mediaIds.forEach((id, index) => {
          if (typeof id !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) errors[`mediaIds.${index}`] = `Select an image for gallery item ${index + 1}.`;
          else if (seen.has(id)) errors[`mediaIds.${index}`] = "Choose a different image; gallery images cannot be repeated.";
          else seen.add(id);
        });
      }
      break;
    }
    case "problem_list": case "objective_list": case "technology_list": {
      only(["items"]);
      if (!Array.isArray(data.items) || !data.items.length) errors.items = "Add at least one item.";
      else if (data.items.length > 100) errors.items = "This list supports up to 100 items.";
      else data.items.forEach((item, index) => {
        if (typeof item !== "string" || !item.trim()) errors[`items.${index}`] = `Item ${index + 1} is required.`;
        else if (item.length > 5000) errors[`items.${index}`] = `Item ${index + 1} must be 5000 characters or fewer.`;
      });
      break;
    }
    case "process_steps": only(["steps"]); rows("steps", ["title", "description"], { title: "Step title", description: "Step description", steps: "process step" }, { title: 500, description: 5000 }); break;
    case "metrics": only(["metrics"]); rows("metrics", ["value", "label"], { value: "Metric value", label: "Metric label", metrics: "metric" }, { value: 100, label: 500 }); break;
    case "roadmap": only(["items"]); rows("items", ["phase", "title", "description"], { phase: "Phase", title: "Item title", description: "Item description", items: "roadmap item" }, { phase: 100, title: 500, description: 5000 }); break;
    case "callout": only(["content", "title"]); text("content", "Content"); if (data.title !== undefined && (typeof data.title !== "string" || data.title.length > 500)) errors.title = "Title must be 500 characters or fewer."; break;
    default: return { type: "Choose a supported project block type." };
  }
  return errors;
}

export function isProjectBlockType(value: string): value is (typeof PROJECT_BLOCK_TYPES)[number] {
  return (PROJECT_BLOCK_TYPES as readonly string[]).includes(value);
}
