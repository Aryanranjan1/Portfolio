CREATE TYPE "public"."slug_redirect_kind" AS ENUM('project', 'article');--> statement-breakpoint
CREATE TABLE "admin_login_throttle" (
	"scope" text PRIMARY KEY NOT NULL,
	"count" integer NOT NULL,
	"window_started_at" timestamp with time zone NOT NULL,
	CONSTRAINT "admin_login_throttle_count_check" CHECK ("admin_login_throttle"."count" > 0)
);
--> statement-breakpoint
CREATE TABLE "request_rate_limit" (
	"key_hash" text PRIMARY KEY NOT NULL,
	"count" integer NOT NULL,
	"window_started_at" timestamp with time zone NOT NULL,
	CONSTRAINT "request_rate_limit_count_check" CHECK ("request_rate_limit"."count" > 0)
);
--> statement-breakpoint
CREATE TABLE "slug_redirect" (
	"kind" "slug_redirect_kind" NOT NULL,
	"old_slug" text NOT NULL,
	"new_slug" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "slug_redirect_kind_old_slug_unique" UNIQUE("kind","old_slug"),
	CONSTRAINT "slug_redirect_slug_format_check" CHECK ("slug_redirect"."old_slug" ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' AND "slug_redirect"."new_slug" ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
	CONSTRAINT "slug_redirect_not_self_check" CHECK ("slug_redirect"."old_slug" <> "slug_redirect"."new_slug")
);
--> statement-breakpoint
ALTER TABLE "media" ADD COLUMN "deletion_pending" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX "request_rate_limit_window_idx" ON "request_rate_limit" USING btree ("window_started_at");