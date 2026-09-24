import { sql } from "drizzle-orm";
import {
  check,
  integer,
  pgTable,
  text,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

import { media } from "./media";

export const skillCategory = pgTable(
  "skill_category",
  {
    id: uuid("id")
      .default(sql`uuidv7()`)
      .primaryKey(),

    name: text("name").notNull().unique(),

    slug: text("slug").notNull().unique(),

    description: text("description"),

    position: integer("position")
      .default(0)
      .notNull(),
  },
  (table) => [
    check(
      "skill_category_slug_format_check",
      sql`${table.slug} ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'`,
    ),

    check(
      "skill_category_position_check",
      sql`${table.position} >= 0`,
    ),

    unique().on(table.position),
  ],
);

export const skill = pgTable(
  "skill",
  {
    id: uuid("id")
      .default(sql`uuidv7()`)
      .primaryKey(),

    categoryId: uuid("category_id")
      .notNull()
      .references(() => skillCategory.id, {
        onDelete: "cascade",
      }),

    name: text("name").notNull(),

    slug: text("slug").notNull().unique(),

    description: text("description"),

    details: text("details"),

    iconMediaId: uuid("icon_media_id").references(
      () => media.id,
      {
        onDelete: "set null",
      },
    ),

    position: integer("position")
      .default(0)
      .notNull(),
  },
  (table) => [
    check(
      "skill_slug_format_check",
      sql`${table.slug} ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'`,
    ),

    check(
      "skill_position_check",
      sql`${table.position} >= 0`,
    ),

    unique().on(
      table.categoryId,
      table.position,
    ),
  ],
);