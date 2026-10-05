import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  check,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const media = pgTable(
  "media",
  {
    id: uuid("id")
      .default(sql`uuidv7()`)
      .primaryKey(),

    storageKey: text("storage_key")
      .notNull()
      .unique(),

    url: text("url").notNull(),

    filename: text("filename").notNull(),

    mimeType: text("mime_type").notNull(),

    fileSizeBytes: bigint("file_size_bytes", {
      mode: "number",
    }),

    width: integer("width"),

    height: integer("height"),

    altText: text("alt_text"),

    deletionPending: boolean("deletion_pending").default(false).notNull(),

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
      "media_file_size_bytes_check",
      sql`${table.fileSizeBytes} IS NULL OR ${table.fileSizeBytes} >= 0`,
    ),

    check(
      "media_width_check",
      sql`${table.width} IS NULL OR ${table.width} > 0`,
    ),

    check(
      "media_height_check",
      sql`${table.height} IS NULL OR ${table.height} > 0`,
    ),
  ],
);
