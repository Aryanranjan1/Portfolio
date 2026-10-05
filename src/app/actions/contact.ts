"use server";
import { logServerError } from "@/lib/observability/log";

import { submitContactMessage, type ContactMessageInput } from "@/db/mutations/contact";

import { validateEmail, validateRequiredString } from "@/lib/validation";

import type { ActionResult } from "@/lib/actions/action-result";
import { headers } from "next/headers";
import { allowRateLimit, getTrustedClientAddress } from "@/lib/contact-rate-limit";

export async function submitContactAction(
  input: ContactMessageInput,
): Promise<ActionResult> {
  try {
    if (
      !input ||
      typeof input !== "object"
    ) {
      return {
        success: false,
        error: "VALIDATION_ERROR",
      };
    }

    const headersList = await headers();
    const address = getTrustedClientAddress(headersList);
    if (!address) throw new Error("RATE_LIMIT_UNAVAILABLE");
    if (!await allowRateLimit(`contact:${address}`)) throw new Error("RATE_LIMITED");
    const email = validateEmail(
      input.email,
    );

    await submitContactMessage({
      name: validateRequiredString(input.name, 100),
      email,
      subject: validateRequiredString(input.subject, 200),
      message: validateRequiredString(input.message, 5000),
    });

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    if (error instanceof Error && error.message === "RATE_LIMITED") {
      return { success: false, error: "CONFLICT" };
    }
    if (error instanceof Error && error.message === "RATE_LIMIT_UNAVAILABLE") return { success: false, error: "INTERNAL_ERROR" };
    if (
      error instanceof Error &&
      error.message === "VALIDATION_ERROR"
    ) {
      return {
        success: false,
        error: "VALIDATION_ERROR",
      };
    }

    logServerError("submit_contact_action_failed",
      error,
    );

    return {
      success: false,
      error: "INTERNAL_ERROR",
    };
  }
}
