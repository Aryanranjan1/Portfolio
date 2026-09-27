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
  } catch {
    throw new Error("VALIDATION_ERROR");
  }

  return url;
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