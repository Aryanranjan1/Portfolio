import type { ActionResult } from "@/lib/actions/action-result";

type DeleteActionResult = ActionResult<{ cacheInvalidated: boolean }>;

const messages: Partial<Record<string, string>> = {
  UNAUTHORIZED: "Your admin session expired. Sign in again before deleting this message.",
  FORBIDDEN: "Your account does not have permission to delete messages.",
  VALIDATION_ERROR: "This message has an invalid record ID and was not deleted.",
  NOT_FOUND: "This message was already deleted.",
};

export function getMessageDeletionFeedback(result: DeleteActionResult) {
  if (!result.success) {
    return {
      kind: "failed" as const,
      message: messages[result.error] ?? "The message could not be deleted. Please try again.",
      refresh: result.error === "NOT_FOUND",
    };
  }

  return {
    kind: "deleted" as const,
    cacheInvalidated: result.data.cacheInvalidated,
  };
}
