"use server";
import { logServerError } from "@/lib/observability/log";

import { revalidatePath } from "next/cache";

import { requireAdminAction } from "@/lib/auth/require-admin-action";

import {
  validateUuid,
} from "@/lib/validation";

import {
  updateContactSubmissionStatus,
  type ContactSubmissionStatus,
} from "@/db/mutations/contact";

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
