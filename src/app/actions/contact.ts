"use server";

import { submitContactMessage, type ContactMessageInput } from "@/db/mutations/contact";

import { validateEmail, validateRequiredString } from "@/lib/validation";

import type { ActionResult } from "@/lib/actions/action-result";
import { headers } from "next/headers";
import { allowContactSubmission } from "@/lib/contact-rate-limit";

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
    const address = headersList.get("x-forwarded-for")?.split(",")[0]?.trim()
      || headersList.get("x-real-ip")?.trim()
      || "unknown";
    if (!allowContactSubmission(address)) throw new Error("RATE_LIMITED");
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
    if (
      error instanceof Error &&
      error.message === "VALIDATION_ERROR"
    ) {
      return {
        success: false,
        error: "VALIDATION_ERROR",
      };
    }

    console.error(
      "submitContactAction failed:",
      error,
    );

    return {
      success: false,
      error: "INTERNAL_ERROR",
    };
  }
}
