import { pgEnum } from "drizzle-orm/pg-core";

export const contentStatus = pgEnum("content_status", [
  "draft",
  "published",
  "archived",
]);

export const contactSubmissionStatus = pgEnum("contact_submission_status", [
  "unread",
  "read",
  "replied",
  "archived",
]);