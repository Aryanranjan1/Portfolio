import { randomUUID } from "node:crypto";
import { mutateApplication } from "@/lib/convex-server";

export type ContactMessageInput = { name: string; email: string; subject: string; message: string };

export async function submitContactMessage(input: ContactMessageInput) {
  const normalized = { name: input.name.trim(), email: input.email.trim().toLowerCase(), subject: input.subject.trim(), message: input.message.trim() };
  if (!normalized.name || normalized.name.length > 100 || !normalized.subject || normalized.subject.length > 200 || !normalized.message || normalized.message.length > 5000 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized.email) || normalized.email.length > 320) throw new Error("VALIDATION_ERROR");
  return mutateApplication("submitContact", { ...normalized, legacyId: randomUUID() });
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
  return mutateApplication<{ id: string }>("updateContactStatus", { id, status });
}
