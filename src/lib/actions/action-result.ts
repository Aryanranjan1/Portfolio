export type ActionResult<T = undefined> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error:
        | "UNAUTHORIZED"
        | "FORBIDDEN"
        | "VALIDATION_ERROR"
        | "NOT_FOUND"
        | "CONFLICT"
        | "INTERNAL_ERROR";
    };