import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  unique,
} from "drizzle-orm/pg-core";

import { contentStatus } from "./enums";
import { media } from "./media";

export const project = pgTable(
  "project",
  {
    id: uuid("id")
      .default(sql`uuidv7()`)
      .primaryKey(),

    slug: text("slug").notNull().unique(),

    title: text("title").notNull(),

    shortDescription: text("short_description").notNull(),

    description: text("description").notNull(),

    projectType: text("project_type").notNull(),

    location: text("location"),

    year: integer("year"),

    status: contentStatus("status")
      .default("draft")
      .notNull(),

    featured: boolean("featured")
      .default(false)
      .notNull(),

    publishedAt: timestamp("published_at", {
      withTimezone: true,
      mode: "date",
    }),

    seoTitle: text("seo_title"),

    seoDescription: text("seo_description"),

    canonicalOverride: text("canonical_override"),

    robotsIndex: boolean("robots_index")
      .default(true)
      .notNull(),

    robotsFollow: boolean("robots_follow")
      .default(true)
      .notNull(),

    socialTitle: text("social_title"),

    socialDescription: text("social_description"),

    socialImageId: uuid("social_image_id").references(
      () => media.id,
      {
        onDelete: "set null",
      },
    ),

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
      "project_slug_format_check",
      sql`${table.slug} ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'`,
    ),

    check(
      "project_year_check",
      sql`${table.year} IS NULL OR ${table.year} BETWEEN 1900 AND 2200`,
    ),

    check(
      "project_published_at_check",
      sql`${table.status} <> 'published' OR ${table.publishedAt} IS NOT NULL`,
    ),

    index("project_published_idx")
      .on(table.publishedAt)
      .where(sql`${table.status} = 'published'`),

    index("project_featured_idx")
      .on(table.featured, table.publishedAt)
      .where(sql`${table.status} = 'published'`),

    index("project_status_updated_idx").on(
      table.status,
      table.updatedAt,
    ),
  ],
);

export const projectCategory = pgTable(
  "project_category",
  {
    id: uuid("id")
      .default(sql`uuidv7()`)
      .primaryKey(),

    name: text("name").notNull().unique(),

    slug: text("slug").notNull().unique(),

    description: text("description"),
  },
  (table) => [
    check(
      "project_category_slug_format_check",
      sql`${table.slug} ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'`,
    ),
  ],
);

export const technology = pgTable(
  "technology",
  {
    id: uuid("id")
      .default(sql`uuidv7()`)
      .primaryKey(),

    name: text("name").notNull().unique(),

    slug: text("slug").notNull().unique(),

    description: text("description"),

    websiteUrl: text("website_url"),

    iconMediaId: uuid("icon_media_id").references(
      () => media.id,
      {
        onDelete: "set null",
      },
    ),
  },
  (table) => [
    check(
      "technology_slug_format_check",
      sql`${table.slug} ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'`,
    ),
  ],
);

export const projectCategoryAssignment = pgTable(
  "project_category_assignment",
  {
    projectId: uuid("project_id")
      .notNull()
      .references(() => project.id, {
        onDelete: "cascade",
      }),

    categoryId: uuid("category_id")
      .notNull()
      .references(() => projectCategory.id, {
        onDelete: "restrict",
      }),
  },
  (table) => [
    primaryKey({
      columns: [table.projectId, table.categoryId],
    }),

    index("project_category_assignment_category_project_idx").on(
      table.categoryId,
      table.projectId,
    ),
  ],
);

export const projectTechnology = pgTable(
  "project_technology",
  {
    projectId: uuid("project_id")
      .notNull()
      .references(() => project.id, {
        onDelete: "cascade",
      }),

    technologyId: uuid("technology_id")
      .notNull()
      .references(() => technology.id, {
        onDelete: "restrict",
      }),

    position: integer("position")
      .default(0)
      .notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.projectId, table.technologyId],
    }),

    check(
      "project_technology_position_check",
      sql`${table.position} >= 0`,
    ),

    index("project_technology_project_position_idx").on(
      table.projectId,
      table.position,
    ),

    index("project_technology_technology_project_idx").on(
      table.technologyId,
      table.projectId,
    ),
  ],
);

export const projectSection = pgTable(
  "project_section",
  {
    id: uuid("id")
      .default(sql`uuidv7()`)
      .primaryKey(),

    projectId: uuid("project_id")
      .notNull()
      .references(() => project.id, {
        onDelete: "cascade",
      }),

    type: text("type").notNull(),

    title: text("title"),

    anchor: text("anchor"),

    position: integer("position")
      .default(0)
      .notNull(),
  },
  (table) => [
    check(
      "project_section_type_check",
      sql`${table.type} IN (
        'about',
        'problem',
        'solution',
        'build',
        'results',
        'gallery',
        'whats_next'
      )`,
    ),

    check(
      "project_section_anchor_check",
      sql`${table.anchor} IS NULL OR ${table.anchor} ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'`,
    ),

    check(
      "project_section_position_check",
      sql`${table.position} >= 0`,
    ),

    index("project_section_project_position_idx").on(
      table.projectId,
      table.position,
    ),

    unique().on(
      table.projectId,
      table.position,
    ),

    unique().on(
      table.projectId,
      table.type,
    ),
  ],
);

export const projectBlock = pgTable(
  "project_block",
  {
    id: uuid("id")
      .default(sql`uuidv7()`)
      .primaryKey(),

    projectSectionId: uuid("project_section_id")
      .notNull()
      .references(() => projectSection.id, {
        onDelete: "cascade",
      }),

    type: text("type").notNull(),

    position: integer("position")
      .default(0)
      .notNull(),

    data: jsonb("data")
      .$type<Record<string, unknown>>()
      .default({})
      .notNull(),
  },
  (table) => [
    check(
      "project_block_type_check",
      sql`${table.type} IN (
        'rich_text',
        'quote',
        'image',
        'gallery',
        'problem_list',
        'objective_list',
        'technology_list',
        'process_steps',
        'metrics',
        'roadmap',
        'callout'
      )`,
    ),

    check(
      "project_block_position_check",
      sql`${table.position} >= 0`,
    ),

    check(
      "project_block_data_object_check",
      sql`jsonb_typeof(${table.data}) = 'object'`,
    ),

    index("project_block_section_position_idx").on(
      table.projectSectionId,
      table.position,
    ),

    unique().on(
      table.projectSectionId,
      table.position,
    ),
  ],
);

export const projectLink = pgTable(
  "project_link",
  {
    id: uuid("id")
      .default(sql`uuidv7()`)
      .primaryKey(),

    projectId: uuid("project_id")
      .notNull()
      .references(() => project.id, {
        onDelete: "cascade",
      }),

    type: text("type").notNull(),

    label: text("label").notNull(),

    url: text("url").notNull(),

    position: integer("position")
      .default(0)
      .notNull(),
  },
  (table) => [
    check(
      "project_link_type_check",
      sql`${table.type} IN (
        'live',
        'repository',
        'case_study',
        'documentation',
        'demo',
        'other'
      )`,
    ),

    check(
      "project_link_position_check",
      sql`${table.position} >= 0`,
    ),

    index("project_link_project_position_idx").on(
      table.projectId,
      table.position,
    ),

    unique().on(
      table.projectId,
      table.position,
    ),
  ],
);

export const projectMedia = pgTable(
  "project_media",
  {
    projectId: uuid("project_id")
      .notNull()
      .references(() => project.id, {
        onDelete: "cascade",
      }),

    mediaId: uuid("media_id")
      .notNull()
      .references(() => media.id, {
        onDelete: "restrict",
      }),

    role: text("role").notNull(),

    position: integer("position")
      .default(0)
      .notNull(),

    caption: text("caption"),

    altTextOverride: text("alt_text_override"),
  },
  (table) => [
    check(
      "project_media_role_check",
      sql`${table.role} IN (
        'hero',
        'preview',
        'problem_gallery',
        'wireframe',
        'gallery',
        'other'
      )`,
    ),

    check(
      "project_media_position_check",
      sql`${table.position} >= 0`,
    ),

    index("project_media_project_position_idx").on(
      table.projectId,
      table.position,
    ),

    unique().on(
      table.projectId,
      table.mediaId,
      table.role,
    ),
  ],
);