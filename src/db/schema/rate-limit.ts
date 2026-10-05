import { sql } from "drizzle-orm";
import { check, index, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const requestRateLimit = pgTable("request_rate_limit", {
  keyHash: text("key_hash").primaryKey(),
  count: integer("count").notNull(),
  windowStartedAt: timestamp("window_started_at", { withTimezone: true, mode: "date" }).notNull(),
}, (table) => [
  check("request_rate_limit_count_check", sql`${table.count} > 0`),
  index("request_rate_limit_window_idx").on(table.windowStartedAt),
]);

export const adminLoginThrottle = pgTable("admin_login_throttle", {
  scope: text("scope").primaryKey(),
  count: integer("count").notNull(),
  windowStartedAt: timestamp("window_started_at", { withTimezone: true, mode: "date" }).notNull(),
}, (table) => [
  check("admin_login_throttle_count_check", sql`${table.count} > 0`),
]);
