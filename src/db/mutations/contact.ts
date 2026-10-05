import { eq } from "drizzle-orm";

import { db } from "@/db";
import { contactSubmission } from "@/db/schema/content";

export type ContactMessageInput = { name: string; email: string; subject: string; message: string };

export async function submitContactMessage(input: ContactMessageInput) {
  const normalized = {
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    subject: input.subject.trim(),
    message: input.message.trim(),
  };
  if (!normalized.name || normalized.name.length > 100 || !normalized.subject || normalized.subject.length > 200 || !normalized.message || normalized.message.length > 5000 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized.email) || normalized.email.length > 320) {
    throw new Error("VALIDATION_ERROR");
  }
  await db.insert(contactSubmission).values(normalized);
}

export type ContactSubmissionStatus =
  | "unread"
  | "read"
  | "replied"
  | "archived";

export async function updateContactSubmissionStatus(
  id: string,
  status: ContactSubmissionStatus,
) {
  return db.transaction(async (tx) => {
    const [existing] = await tx.select({
      readAt: contactSubmission.readAt,
      repliedAt: contactSubmission.repliedAt,
      archivedAt: contactSubmission.archivedAt,
    }).from(contactSubmission).where(eq(contactSubmission.id, id)).limit(1);
    if (!existing) throw new Error("NOT_FOUND");

    const now = new Date();
    const values = {
      status,
      ...(status === "read" || status === "replied" ? { readAt: existing.readAt ?? now } : {}),
      ...(status === "replied" ? { repliedAt: existing.repliedAt ?? now } : {}),
      ...(status === "archived" ? { archivedAt: existing.archivedAt ?? now } : {}),
    };
    const [updated] = await tx.update(contactSubmission).set(values).where(eq(contactSubmission.id, id)).returning({ id: contactSubmission.id });
    if (!updated) throw new Error("NOT_FOUND");
    return updated;
  });
}
