"use server";
import { logServerError } from "@/lib/observability/log";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { createComment, type CreateCommentInput } from "@/db/mutations/comments";
import { validateRequiredString, validateSlug } from "@/lib/validation";
import { allowRateLimit, getTrustedClientAddress } from "@/lib/contact-rate-limit";
import type { ActionResult } from "@/lib/actions/action-result";

export async function submitCommentAction(
  input: CreateCommentInput,
): Promise<ActionResult> {
  try {
    if (!input || typeof input !== "object") {
      return {
        success: false,
        error: "VALIDATION_ERROR",
      };
    }

    const slug = validateSlug(input.slug);
    const name = validateRequiredString(input.name, 100);
    const content = validateRequiredString(input.content, 5000);

    const headersList = await headers();

    const address = getTrustedClientAddress(headersList);
    if (!address) throw new Error("RATE_LIMIT_UNAVAILABLE");
    if (!await allowRateLimit(`comment:${address}`)) {
      throw new Error("RATE_LIMITED");
    }

    await createComment({
      slug,
      name,
      content,
    });

    revalidatePath(`/blog/${slug}`);

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    if (error instanceof Error && error.message === "RATE_LIMITED") {
      return {
        success: false,
        error: "CONFLICT",
      };
    }

    if (error instanceof Error && error.message === "VALIDATION_ERROR") {
      return {
        success: false,
        error: "VALIDATION_ERROR",
      };
    }

    if (error instanceof Error && error.message === "NOT_FOUND") {
      return {
        success: false,
        error: "VALIDATION_ERROR",
      };
    }

    logServerError("submit_comment_action_failed", error);

    return {
      success: false,
      error: "INTERNAL_ERROR",
    };
  }
}
