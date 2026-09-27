export function isDatabaseError(
  error: unknown,
  code: string,
): boolean {
  const seen = new Set<object>();
  let current: unknown = error;

  while (typeof current === "object" && current !== null && !seen.has(current)) {
    seen.add(current);
    if ("code" in current && (current as { code?: unknown }).code === code) {
      return true;
    }
    current = "cause" in current
      ? (current as { cause?: unknown }).cause
      : undefined;
  }

  return false;
}

export function throwMappedDatabaseError(error: unknown): never {
  if (isDatabaseError(error, "23505")) {
    throw new Error("CONFLICT");
  }
  if (isDatabaseError(error, "23503") || isDatabaseError(error, "23001")) {
    throw new Error("CONFLICT");
  }
  throw error;
}
