import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

import { contactSubmissionStatus } from "./enums";
import { media } from "./media";

export const aboutTechnology = pgTable(
  "about_technology",
  {
    id: uuid("id").default(sql`uuidv7()`).primaryKey(),
    label: text("label").notNull(),
    mediaId: uuid("media_id").references(() => media.id, { onDelete: "set null" }),
    position: integer("position").default(0).notNull(),
    active: boolean("active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    check("about_technology_label_check", sql`length(trim(${table.label})) BETWEEN 1 AND 100`),
    check("about_technology_position_check", sql`${table.position} >= 0`),
    index("about_technology_active_position_idx").on(table.active, table.position),
  ],
);

export const timelineEntry = pgTable(
  "timeline_entry",
  {
    id: uuid("id")
      .default(sql`uuidv7()`)
      .primaryKey(),

    year: integer("year").notNull(),

    title: text("title").notNull(),

    description: text("description").notNull(),

    tag: text("tag"),

    position: integer("position")
      .default(0)
      .notNull(),

    active: boolean("active")
      .default(true)
      .notNull(),
  },
  (table) => [
    check(
      "timeline_entry_year_check",
      sql`${table.year} BETWEEN 1900 AND 2200`,
    ),

    check(
      "timeline_entry_position_check",
      sql`${table.position} >= 0`,
    ),

    unique().on(table.position),
  ],
);

export const faq = pgTable(
  "faq",
  {
    id: uuid("id")
      .default(sql`uuidv7()`)
      .primaryKey(),

    question: text("question").notNull(),

    answer: text("answer").notNull(),

    position: integer("position")
      .default(0)
      .notNull(),

    active: boolean("active")
      .default(true)
      .notNull(),
  },
  (table) => [
    check(
      "faq_position_check",
      sql`${table.position} >= 0`,
    ),

    unique().on(table.position),
  ],
);

export const contactSubmission = pgTable(
  "contact_submission",
  {
    id: uuid("id")
      .default(sql`uuidv7()`)
      .primaryKey(),

    name: text("name").notNull(),

    email: text("email").notNull(),

    subject: text("subject").notNull(),

    message: text("message").notNull(),

    status: contactSubmissionStatus("status")
      .default("unread")
      .notNull(),

    submittedAt: timestamp("submitted_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),

    readAt: timestamp("read_at", {
      withTimezone: true,
      mode: "date",
    }),

    repliedAt: timestamp("replied_at", {
      withTimezone: true,
      mode: "date",
    }),

    archivedAt: timestamp("archived_at", {
      withTimezone: true,
      mode: "date",
    }),
  },
  (table) => [
    index("contact_submission_status_submitted_idx").on(
      table.status,
      table.submittedAt,
    ),
  ],
);
