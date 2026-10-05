import { sql } from "drizzle-orm";
import { check, pgEnum, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";

export const slugRedirectKind = pgEnum("slug_redirect_kind", ["project", "article"]);

export const slugRedirect = pgTable("slug_redirect", {
  kind: slugRedirectKind("kind").notNull(),
  entityId: uuid("entity_id").notNull(),
  oldSlug: text("old_slug").notNull(),
  newSlug: text("new_slug").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
}, (table) => [
  unique("slug_redirect_kind_old_slug_unique").on(table.kind, table.oldSlug),
  check("slug_redirect_slug_format_check", sql`${table.oldSlug} ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' AND ${table.newSlug} ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'`),
  check("slug_redirect_not_self_check", sql`${table.oldSlug} <> ${table.newSlug}`),
]);
