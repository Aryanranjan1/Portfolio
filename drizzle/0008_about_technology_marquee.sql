CREATE TABLE "about_technology" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"label" text NOT NULL,
	"media_id" uuid,
	"position" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "about_technology_label_check" CHECK (length(trim("about_technology"."label")) BETWEEN 1 AND 100),
	CONSTRAINT "about_technology_position_check" CHECK ("about_technology"."position" >= 0)
);
--> statement-breakpoint
ALTER TABLE "about_technology" ADD CONSTRAINT "about_technology_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "about_technology_active_position_idx" ON "about_technology" USING btree ("active","position");
--> statement-breakpoint
INSERT INTO "about_technology" ("label", "media_id", "position", "active")
SELECT "name", "icon_media_id", row_number() OVER (ORDER BY "position", "id") - 1, true
FROM "skill"
ORDER BY "position", "id";
