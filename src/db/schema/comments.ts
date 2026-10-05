import { sql } from "drizzle-orm";
import {
  index,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { commentStatus } from "./enums";
import { article } from "./articles";

export const comment = pgTable(
  "comment",
  {
    id: uuid("id")
      .default(sql`uuidv7()`)
      .primaryKey(),

    articleId: uuid("article_id")
      .notNull()
      .references(() => article.id, {
        onDelete: "cascade",
      }),

    name: text("name").notNull(),

    content: text("content").notNull(),

    status: commentStatus("status")
      .default("pending")
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
    index("comment_article_status_created_idx").on(
      table.articleId,
      table.status,
      table.createdAt,
    ),
  ],
);