"use server";
import { logServerError } from "@/lib/observability/log";

import { revalidatePath } from "next/cache";
import { deleteComment, moderateComment } from "@/db/mutations/comments";
import { requireAdminAction } from "@/lib/auth/require-admin-action";
import { validateUuid } from "@/lib/validation";
import type { ActionResult } from "@/lib/actions/action-result";

export async function moderateCommentAction(formData: FormData) {
  try {
    await requireAdminAction();
    const id = validateUuid(formData.get("id"));
    const status = formData.get("status");
    if (status !== "approved" && status !== "rejected") throw new Error("VALIDATION_ERROR");
    const slug = await moderateComment(id, status);
    revalidatePath("/admin/comments");
    if (slug) revalidatePath(`/blog/${slug}`);
  } catch (error) {
    logServerError("moderate_comment_action_failed", error);
    throw new Error("Unable to moderate this comment");
  }
}

export async function deleteCommentAction(id: string): Promise<ActionResult> {
  try {
    await requireAdminAction();
    const slug = await deleteComment(validateUuid(id));
    revalidatePath("/admin/comments");
    if (slug) revalidatePath(`/blog/${slug}`);
    return { success: true, data: undefined };
  } catch (error) {
    logServerError("delete_comment_action_failed", error);
    const message = error instanceof Error ? error.message : "";
    if (["UNAUTHORIZED", "FORBIDDEN", "VALIDATION_ERROR", "NOT_FOUND"].includes(message)) {
      return { success: false, error: message as Extract<ActionResult, { success: false }>["error"] };
    }
    return { success: false, error: "INTERNAL_ERROR" };
  }
}
