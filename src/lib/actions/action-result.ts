export type ActionResult<T = undefined> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      fieldErrors?: Record<string, string>;
      error:
        | "UNAUTHORIZED"
        | "FORBIDDEN"
        | "VALIDATION_ERROR"
        | "NOT_FOUND"
        | "CONFLICT"
        | "INVALID_CONTACT_URL"
        | "DATABASE_ERROR"
        | "MEDIA_NOT_FOUND"
        | "STORAGE_NOT_CONFIGURED"
        | "STORAGE_DELETE_PENDING"
        | "INTERNAL_ERROR";
    };
