CREATE TABLE "footer_explore_item" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"label" text NOT NULL,
	"url" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "footer_explore_item_position_check" CHECK ("footer_explore_item"."position" >= 0)
);
--> statement-breakpoint
CREATE INDEX "footer_explore_item_active_position_idx" ON "footer_explore_item" USING btree ("active","position");
--> statement-breakpoint
INSERT INTO "footer_explore_item" ("label", "url", "active", "position")
SELECT 'All Articles', '/blog', true, 0
WHERE NOT EXISTS (SELECT 1 FROM "footer_explore_item");
