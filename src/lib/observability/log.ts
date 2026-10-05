import "server-only";

const SAFE_ERROR_CODES = new Set([
  "DATABASE_ERROR",
  "STORAGE_NOT_CONFIGURED",
  "STORAGE_UPLOAD_FAILED",
  "STORAGE_DELETE_FAILED",
  "STORAGE_DELETE_PENDING",
  "MEDIA_RECORD_FAILED",
  "INVALID_CONTACT_URL",
  "RATE_LIMIT_UNAVAILABLE",
  "RATE_LIMITED",
  "VALIDATION_ERROR",
  "UNAUTHORIZED",
  "FORBIDDEN",
  "NOT_FOUND",
  "CONFLICT",
  "INTERNAL_ERROR",
]);

function getSafeErrorFields(error: unknown) {
  if (!(error instanceof Error)) return { errorName: "UnknownError" };
  const fields: { errorName: string; errorCode?: string; databaseCode?: string } = {
    errorName: /^[A-Za-z][A-Za-z0-9]{0,63}$/.test(error.name) ? error.name : "Error",
  };
  if (SAFE_ERROR_CODES.has(error.message)) fields.errorCode = error.message;
  if ("code" in error && typeof error.code === "string" && /^[0-9A-Z]{5}$/.test(error.code)) {
    fields.databaseCode = error.code;
  }
  return fields;
}

/** Log safe operational context without serializing arbitrary exceptions or inputs. */
export function logServerError(
  event: string,
  error?: unknown,
  details?: { httpStatus?: number; cleanupStatus?: number; cleanupFailed?: boolean; entityType?: "media"; entityId?: string; storageObjectKey?: string },
) {
  console.error(JSON.stringify({
    level: "error",
    event,
    timestamp: new Date().toISOString(),
    ...getSafeErrorFields(error),
    ...(details?.httpStatus && details.httpStatus >= 100 && details.httpStatus <= 599 ? { httpStatus: details.httpStatus } : {}),
    ...(details?.cleanupStatus && details.cleanupStatus >= 100 && details.cleanupStatus <= 599 ? { cleanupStatus: details.cleanupStatus } : {}),
    ...(typeof details?.cleanupFailed === "boolean" ? { cleanupFailed: details.cleanupFailed } : {}),
    ...(details?.entityType === "media" && details.entityId && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(details.entityId)
      ? { entityType: details.entityType, entityId: details.entityId }
      : {}),
    ...(details?.storageObjectKey && /^(images|videos|documents|resume|other)\/[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(jpg|jpeg|png|webp|avif|gif|mp4|webm|mov|pdf)$/i.test(details.storageObjectKey)
      ? { storageObjectKey: details.storageObjectKey }
      : {}),
  }));
}

export function logSecurityEvent(event: "admin_login_succeeded" | "admin_login_failed" | "admin_logout") {
  console.warn(JSON.stringify({ level: "security", event, timestamp: new Date().toISOString() }));
}
