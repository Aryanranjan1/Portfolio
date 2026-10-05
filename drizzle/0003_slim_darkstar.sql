CREATE TABLE "footer_resource" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"label" text NOT NULL,
	"url" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "footer_resource_position_check" CHECK ("footer_resource"."position" >= 0)
);
--> statement-breakpoint
CREATE INDEX "footer_resource_active_position_idx" ON "footer_resource" USING btree ("active","position");