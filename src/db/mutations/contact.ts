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
  const now = new Date();

  const values: {
    status: ContactSubmissionStatus;
    readAt?: Date | null;
    repliedAt?: Date | null;
    archivedAt?: Date | null;
  } = { status, readAt: null, repliedAt: null, archivedAt: null };

  if (status === "read") values.readAt = now;
  if (status === "replied") {
    values.readAt = now;
    values.repliedAt = now;
  }
  if (status === "archived") values.archivedAt = now;

  const result = await db
    .update(contactSubmission)
    .set(values)
    .where(
      eq(contactSubmission.id, id),
    )
    .returning({
      id: contactSubmission.id,
    });

  if (result.length === 0) {
    throw new Error("NOT_FOUND");
  }

  return result[0];
}
