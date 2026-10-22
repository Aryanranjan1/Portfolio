"use server";
import { logServerActionError, logServerError } from "@/lib/observability/log";

import { revalidatePath } from "next/cache";

import { requireAdminAction } from "@/lib/auth/require-admin-action";

import {
  validateUuid,
} from "@/lib/validation";

import {
  deleteContactSubmission,
  updateContactSubmissionStatus,
  type ContactSubmissionStatus,
} from "@/lib/convex/mutations/contact";
import { validateContactSubmissionId } from "@/lib/contact/validate-contact-submission-id";
import { deleteContactSubmissionAndInvalidate } from "@/lib/contact/delete-contact-submission";

import type { ActionResult } from "@/lib/actions/action-result";

const allowedStatuses: ContactSubmissionStatus[] = [
  "unread",
  "read",
  "replied",
  "archived",
];

export async function updateContactStatusAction(
  id: string,
  status: ContactSubmissionStatus,
): Promise<ActionResult> {
  try {
    await requireAdminAction();

    const validatedId =
      validateUuid(id);

    if (
      !allowedStatuses.includes(status)
    ) {
      return {
        success: false,
        error: "VALIDATION_ERROR",
      };
    }

    await updateContactSubmissionStatus(
      validatedId,
      status,
    );

    revalidatePath("/admin/messages");

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    if (
      error instanceof Error
    ) {
      switch (error.message) {
        case "UNAUTHORIZED":
          return {
            success: false,
            error: "UNAUTHORIZED",
          };

        case "FORBIDDEN":
          return {
            success: false,
            error: "FORBIDDEN",
          };

        case "VALIDATION_ERROR":
          return {
            success: false,
            error: "VALIDATION_ERROR",
          };

        case "NOT_FOUND":
          return {
            success: false,
            error: "NOT_FOUND",
          };
      }
    }

    logServerError("update_contact_status_action_failed",
      error,
    );

    return {
      success: false,
      error: "INTERNAL_ERROR",
    };
  }
}

export async function deleteContactSubmissionAction(
  id: string,
): Promise<ActionResult<{ cacheInvalidated: boolean }>> {
  try {
    await requireAdminAction();
    const validatedId = validateContactSubmissionId(id);
    const outcome = await deleteContactSubmissionAndInvalidate(
      validatedId,
      deleteContactSubmission,
      () => revalidatePath("/admin/messages"),
    );
    if (!outcome.cacheInvalidated) {
      logServerActionError(
        "delete_contact_submission_cache_invalidation_failed",
        outcome.cacheInvalidationError,
        [validatedId],
      );
    }
    return { success: true, data: { cacheInvalidated: outcome.cacheInvalidated } };
  } catch (error) {
    logServerActionError("delete_contact_submission_action_failed", error, [id]);
    const message = error instanceof Error ? error.message : "";
    if (["UNAUTHORIZED", "FORBIDDEN", "VALIDATION_ERROR", "NOT_FOUND"].includes(message)) {
      return { success: false, error: message as Extract<ActionResult, { success: false }>["error"] };
    }
    return { success: false, error: "INTERNAL_ERROR" };
  }
}
