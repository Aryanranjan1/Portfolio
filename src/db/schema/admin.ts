import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const admin = pgTable(
  "admin",
  {
    id: uuid("id")
      .default(sql`uuidv7()`)
      .primaryKey(),

    singleton: boolean("singleton")
      .default(true)
      .notNull()
      .unique(),

    email: text("email")
      .notNull()
      .unique(),

    displayName: text("display_name")
      .notNull(),

    active: boolean("active")
      .default(true)
      .notNull(),

    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    check(
      "admin_singleton_true_check",
      sql`${table.singleton} = true`,
    ),
  ],
);