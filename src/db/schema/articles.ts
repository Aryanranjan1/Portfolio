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
  unique,
  uuid,
} from "drizzle-orm/pg-core";

import { contentStatus } from "./enums";
import { media } from "./media";

export const articleCategory = pgTable(
  "article_category",
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
      "article_category_slug_format_check",
      sql`${table.slug} ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'`,
    ),
  ],
);

export const tag = pgTable(
  "tag",
  {
    id: uuid("id")
      .default(sql`uuidv7()`)
      .primaryKey(),

    name: text("name").notNull().unique(),

    slug: text("slug").notNull().unique(),
  },
  (table) => [
    check(
      "tag_slug_format_check",
      sql`${table.slug} ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'`,
    ),
  ],
);

export const article = pgTable(
  "article",
  {
    id: uuid("id")
      .default(sql`uuidv7()`)
      .primaryKey(),

    slug: text("slug").notNull().unique(),

    title: text("title").notNull(),

    excerpt: text("excerpt").notNull(),

    categoryId: uuid("category_id")
      .notNull()
      .references(() => articleCategory.id, {
        onDelete: "restrict",
      }),

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
      "article_slug_format_check",
      sql`${table.slug} ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'`,
    ),

    check(
      "article_published_at_check",
      sql`${table.status} <> 'published' OR ${table.publishedAt} IS NOT NULL`,
    ),

    index("article_published_idx")
      .on(table.publishedAt)
      .where(sql`${table.status} = 'published'`),

    index("article_featured_idx")
      .on(table.featured, table.publishedAt)
      .where(sql`${table.status} = 'published'`),

    index("article_status_updated_idx").on(
      table.status,
      table.updatedAt,
    ),
  ],
);

export const articleTag = pgTable(
  "article_tag",
  {
    articleId: uuid("article_id")
      .notNull()
      .references(() => article.id, {
        onDelete: "cascade",
      }),

    tagId: uuid("tag_id")
      .notNull()
      .references(() => tag.id, {
        onDelete: "restrict",
      }),
  },
  (table) => [
    primaryKey({
      columns: [table.articleId, table.tagId],
    }),

    index("article_tag_tag_article_idx").on(
      table.tagId,
      table.articleId,
    ),
  ],
);

export const articleBlock = pgTable(
  "article_block",
  {
    id: uuid("id")
      .default(sql`uuidv7()`)
      .primaryKey(),

    articleId: uuid("article_id")
      .notNull()
      .references(() => article.id, {
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
      "article_block_type_check",
      sql`${table.type} IN (
        'heading',
        'paragraph',
        'image',
        'gallery',
        'video',
        'quote',
        'list',
        'code',
        'table',
        'comparison',
        'callout',
        'tool',
        'embed'
      )`,
    ),

    check(
      "article_block_position_check",
      sql`${table.position} >= 0`,
    ),

    check(
      "article_block_data_object_check",
      sql`jsonb_typeof(${table.data}) = 'object'`,
    ),

    index("article_block_article_position_idx").on(
      table.articleId,
      table.position,
    ),

    unique().on(
      table.articleId,
      table.position,
    ),
  ],
);