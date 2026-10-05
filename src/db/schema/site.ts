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

import { media } from "./media";

export const siteSettings = pgTable(
  "site_settings",
  {
    id: uuid("id")
      .default(sql`uuidv7()`)
      .primaryKey(),

    singleton: boolean("singleton")
      .default(true)
      .notNull()
      .unique(),

    siteName: text("site_name").notNull(),

    personName: text("person_name").notNull(),

    professionalTitle: text("professional_title").notNull(),

    shortDescription: text("short_description").notNull(),

    bio: text("bio").notNull(),

    location: text("location").notNull(),

    education: text("education"),

    interests: text("interests"),

    availabilityStatus: text("availability_status").notNull(),

    availabilityText: text("availability_text"),

    yearsBuilding: integer("years_building")
      .default(0)
      .notNull(),

    projectsCompleted: integer("projects_completed")
      .default(0)
      .notNull(),

    leetcodeSolved: integer("leetcode_solved")
      .default(0)
      .notNull(),

    learningHours: integer("learning_hours")
      .default(0)
      .notNull(),

    primaryEmail: text("primary_email").notNull(),

    siteDescription: text("site_description").notNull(),

    canonicalOrigin: text("canonical_origin").notNull(),

    defaultSocialImageId: uuid("default_social_image_id").references(
      () => media.id,
      {
        onDelete: "set null",
      },
    ),

    resumeMediaId: uuid("resume_media_id").references(() => media.id, {
      onDelete: "set null",
    }),

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
      "site_settings_singleton_true_check",
      sql`${table.singleton} = true`,
    ),
  ],
);

export const contactMethod = pgTable(
  "contact_method",
  {
    id: uuid("id")
      .default(sql`uuidv7()`)
      .primaryKey(),

    type: text("type").notNull(),

    label: text("label").notNull(),

    value: text("value"),

    url: text("url"),

    position: integer("position")
      .default(0)
      .notNull(),

    active: boolean("active")
      .default(true)
      .notNull(),
  },
  (table) => [
    check(
      "contact_method_type_check",
      sql`${table.type} IN ('email', 'linkedin', 'github', 'x', 'location', 'other')`,
    ),
    check(
      "contact_method_position_check",
      sql`${table.position} >= 0`,
    ),
    unique("contact_method_position_unique").on(table.position),
  ],
);

export const footerResource = pgTable(
  "footer_resource",
  {
    id: uuid("id")
      .default(sql`uuidv7()`)
      .primaryKey(),

    label: text("label").notNull(),

    url: text("url").notNull(),

    active: boolean("active")
      .default(true)
      .notNull(),

    position: integer("position")
      .default(0)
      .notNull(),
  },
  (table) => [
    check(
      "footer_resource_position_check",
      sql`${table.position} >= 0`,
    ),
    index("footer_resource_active_position_idx").on(
      table.active,
      table.position,
    ),
  ],
);

export const footerExploreItem = pgTable("footer_explore_item", {
  id: uuid("id").default(sql`uuidv7()`).primaryKey(),
  label: text("label").notNull(),
  url: text("url").notNull(),
  active: boolean("active").default(true).notNull(),
  position: integer("position").default(0).notNull(),
}, (table) => [
  check("footer_explore_item_position_check", sql`${table.position} >= 0`),
  index("footer_explore_item_active_position_idx").on(table.active, table.position),
]);
