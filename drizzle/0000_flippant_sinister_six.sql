CREATE TYPE "public"."contact_submission_status" AS ENUM('unread', 'read', 'replied', 'archived');--> statement-breakpoint
CREATE TYPE "public"."content_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TABLE "admin" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"singleton" boolean DEFAULT true NOT NULL,
	"email" text NOT NULL,
	"display_name" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "admin_singleton_unique" UNIQUE("singleton"),
	CONSTRAINT "admin_email_unique" UNIQUE("email"),
	CONSTRAINT "admin_singleton_true_check" CHECK ("admin"."singleton" = true)
);
--> statement-breakpoint
CREATE TABLE "article" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"excerpt" text NOT NULL,
	"category_id" uuid NOT NULL,
	"status" "content_status" DEFAULT 'draft' NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"published_at" timestamp with time zone,
	"seo_title" text,
	"seo_description" text,
	"canonical_override" text,
	"robots_index" boolean DEFAULT true NOT NULL,
	"robots_follow" boolean DEFAULT true NOT NULL,
	"social_title" text,
	"social_description" text,
	"social_image_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "article_slug_unique" UNIQUE("slug"),
	CONSTRAINT "article_slug_format_check" CHECK ("article"."slug" ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
	CONSTRAINT "article_published_at_check" CHECK ("article"."status" <> 'published' OR "article"."published_at" IS NOT NULL)
);
--> statement-breakpoint
CREATE TABLE "article_block" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"article_id" uuid NOT NULL,
	"type" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	CONSTRAINT "article_block_article_id_position_unique" UNIQUE("article_id","position"),
	CONSTRAINT "article_block_type_check" CHECK ("article_block"."type" IN (
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
      )),
	CONSTRAINT "article_block_position_check" CHECK ("article_block"."position" >= 0),
	CONSTRAINT "article_block_data_object_check" CHECK (jsonb_typeof("article_block"."data") = 'object')
);
--> statement-breakpoint
CREATE TABLE "article_category" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	CONSTRAINT "article_category_name_unique" UNIQUE("name"),
	CONSTRAINT "article_category_slug_unique" UNIQUE("slug"),
	CONSTRAINT "article_category_slug_format_check" CHECK ("article_category"."slug" ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);
--> statement-breakpoint
CREATE TABLE "article_tag" (
	"article_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	CONSTRAINT "article_tag_article_id_tag_id_pk" PRIMARY KEY("article_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "tag" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	CONSTRAINT "tag_name_unique" UNIQUE("name"),
	CONSTRAINT "tag_slug_unique" UNIQUE("slug"),
	CONSTRAINT "tag_slug_format_check" CHECK ("tag"."slug" ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);
--> statement-breakpoint
CREATE TABLE "contact_submission" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"subject" text NOT NULL,
	"message" text NOT NULL,
	"status" "contact_submission_status" DEFAULT 'unread' NOT NULL,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"read_at" timestamp with time zone,
	"replied_at" timestamp with time zone,
	"archived_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "faq" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "faq_position_unique" UNIQUE("position"),
	CONSTRAINT "faq_position_check" CHECK ("faq"."position" >= 0)
);
--> statement-breakpoint
CREATE TABLE "timeline_entry" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"year" integer NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"tag" text,
	"position" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "timeline_entry_position_unique" UNIQUE("position"),
	CONSTRAINT "timeline_entry_year_check" CHECK ("timeline_entry"."year" BETWEEN 1900 AND 2200),
	CONSTRAINT "timeline_entry_position_check" CHECK ("timeline_entry"."position" >= 0)
);
--> statement-breakpoint
CREATE TABLE "media" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"storage_key" text NOT NULL,
	"url" text NOT NULL,
	"filename" text NOT NULL,
	"mime_type" text NOT NULL,
	"file_size_bytes" bigint,
	"width" integer,
	"height" integer,
	"alt_text" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "media_storage_key_unique" UNIQUE("storage_key")
);
--> statement-breakpoint
CREATE TABLE "contact_method" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"type" text NOT NULL,
	"label" text NOT NULL,
	"value" text,
	"url" text,
	"position" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "contact_method_type_check" CHECK ("contact_method"."type" IN ('email', 'linkedin', 'github', 'x', 'location', 'other')),
	CONSTRAINT "contact_method_position_check" CHECK ("contact_method"."position" >= 0)
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"singleton" boolean DEFAULT true NOT NULL,
	"site_name" text NOT NULL,
	"person_name" text NOT NULL,
	"professional_title" text NOT NULL,
	"short_description" text NOT NULL,
	"bio" text NOT NULL,
	"location" text NOT NULL,
	"education" text,
	"interests" text,
	"availability_status" text NOT NULL,
	"availability_text" text,
	"years_building" integer DEFAULT 0 NOT NULL,
	"projects_completed" integer DEFAULT 0 NOT NULL,
	"leetcode_solved" integer DEFAULT 0 NOT NULL,
	"learning_hours" integer DEFAULT 0 NOT NULL,
	"primary_email" text NOT NULL,
	"site_description" text NOT NULL,
	"canonical_origin" text NOT NULL,
	"default_social_image_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "site_settings_singleton_unique" UNIQUE("singleton"),
	CONSTRAINT "site_settings_singleton_true_check" CHECK ("site_settings"."singleton" = true)
);
--> statement-breakpoint
CREATE TABLE "project" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"short_description" text NOT NULL,
	"description" text NOT NULL,
	"project_type" text NOT NULL,
	"location" text,
	"year" integer,
	"status" "content_status" DEFAULT 'draft' NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"published_at" timestamp with time zone,
	"seo_title" text,
	"seo_description" text,
	"canonical_override" text,
	"robots_index" boolean DEFAULT true NOT NULL,
	"robots_follow" boolean DEFAULT true NOT NULL,
	"social_title" text,
	"social_description" text,
	"social_image_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "project_slug_unique" UNIQUE("slug"),
	CONSTRAINT "project_slug_format_check" CHECK ("project"."slug" ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
	CONSTRAINT "project_year_check" CHECK ("project"."year" IS NULL OR "project"."year" BETWEEN 1900 AND 2200),
	CONSTRAINT "project_published_at_check" CHECK ("project"."status" <> 'published' OR "project"."published_at" IS NOT NULL)
);
--> statement-breakpoint
CREATE TABLE "project_block" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"project_section_id" uuid NOT NULL,
	"type" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	CONSTRAINT "project_block_project_section_id_position_unique" UNIQUE("project_section_id","position"),
	CONSTRAINT "project_block_type_check" CHECK ("project_block"."type" IN (
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
      )),
	CONSTRAINT "project_block_position_check" CHECK ("project_block"."position" >= 0),
	CONSTRAINT "project_block_data_object_check" CHECK (jsonb_typeof("project_block"."data") = 'object')
);
--> statement-breakpoint
CREATE TABLE "project_category" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	CONSTRAINT "project_category_name_unique" UNIQUE("name"),
	CONSTRAINT "project_category_slug_unique" UNIQUE("slug"),
	CONSTRAINT "project_category_slug_format_check" CHECK ("project_category"."slug" ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);
--> statement-breakpoint
CREATE TABLE "project_category_assignment" (
	"project_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	CONSTRAINT "project_category_assignment_project_id_category_id_pk" PRIMARY KEY("project_id","category_id")
);
--> statement-breakpoint
CREATE TABLE "project_link" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"project_id" uuid NOT NULL,
	"type" text NOT NULL,
	"label" text NOT NULL,
	"url" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "project_link_project_id_position_unique" UNIQUE("project_id","position"),
	CONSTRAINT "project_link_type_check" CHECK ("project_link"."type" IN (
        'live',
        'repository',
        'case_study',
        'documentation',
        'demo',
        'other'
      )),
	CONSTRAINT "project_link_position_check" CHECK ("project_link"."position" >= 0)
);
--> statement-breakpoint
CREATE TABLE "project_media" (
	"project_id" uuid NOT NULL,
	"media_id" uuid NOT NULL,
	"role" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"caption" text,
	"alt_text_override" text,
	CONSTRAINT "project_media_project_id_media_id_role_unique" UNIQUE("project_id","media_id","role"),
	CONSTRAINT "project_media_role_check" CHECK ("project_media"."role" IN (
        'hero',
        'preview',
        'problem_gallery',
        'wireframe',
        'gallery',
        'other'
      )),
	CONSTRAINT "project_media_position_check" CHECK ("project_media"."position" >= 0)
);
--> statement-breakpoint
CREATE TABLE "project_section" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"project_id" uuid NOT NULL,
	"type" text NOT NULL,
	"title" text,
	"anchor" text,
	"position" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "project_section_project_id_position_unique" UNIQUE("project_id","position"),
	CONSTRAINT "project_section_project_id_type_unique" UNIQUE("project_id","type"),
	CONSTRAINT "project_section_type_check" CHECK ("project_section"."type" IN (
        'about',
        'problem',
        'solution',
        'build',
        'results',
        'gallery',
        'whats_next'
      )),
	CONSTRAINT "project_section_anchor_check" CHECK ("project_section"."anchor" IS NULL OR "project_section"."anchor" ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
	CONSTRAINT "project_section_position_check" CHECK ("project_section"."position" >= 0)
);
--> statement-breakpoint
CREATE TABLE "project_technology" (
	"project_id" uuid NOT NULL,
	"technology_id" uuid NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "project_technology_project_id_technology_id_pk" PRIMARY KEY("project_id","technology_id"),
	CONSTRAINT "project_technology_position_check" CHECK ("project_technology"."position" >= 0)
);
--> statement-breakpoint
CREATE TABLE "technology" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"website_url" text,
	"icon_media_id" uuid,
	CONSTRAINT "technology_name_unique" UNIQUE("name"),
	CONSTRAINT "technology_slug_unique" UNIQUE("slug"),
	CONSTRAINT "technology_slug_format_check" CHECK ("technology"."slug" ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);
--> statement-breakpoint
CREATE TABLE "skill" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"category_id" uuid NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"details" text,
	"icon_media_id" uuid,
	"position" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "skill_slug_unique" UNIQUE("slug"),
	CONSTRAINT "skill_category_id_position_unique" UNIQUE("category_id","position"),
	CONSTRAINT "skill_slug_format_check" CHECK ("skill"."slug" ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
	CONSTRAINT "skill_position_check" CHECK ("skill"."position" >= 0)
);
--> statement-breakpoint
CREATE TABLE "skill_category" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"position" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "skill_category_name_unique" UNIQUE("name"),
	CONSTRAINT "skill_category_slug_unique" UNIQUE("slug"),
	CONSTRAINT "skill_category_position_unique" UNIQUE("position"),
	CONSTRAINT "skill_category_slug_format_check" CHECK ("skill_category"."slug" ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
	CONSTRAINT "skill_category_position_check" CHECK ("skill_category"."position" >= 0)
);
--> statement-breakpoint
ALTER TABLE "article" ADD CONSTRAINT "article_category_id_article_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."article_category"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article" ADD CONSTRAINT "article_social_image_id_media_id_fk" FOREIGN KEY ("social_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article_block" ADD CONSTRAINT "article_block_article_id_article_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."article"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article_tag" ADD CONSTRAINT "article_tag_article_id_article_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."article"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article_tag" ADD CONSTRAINT "article_tag_tag_id_tag_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tag"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_default_social_image_id_media_id_fk" FOREIGN KEY ("default_social_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project" ADD CONSTRAINT "project_social_image_id_media_id_fk" FOREIGN KEY ("social_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_block" ADD CONSTRAINT "project_block_project_section_id_project_section_id_fk" FOREIGN KEY ("project_section_id") REFERENCES "public"."project_section"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_category_assignment" ADD CONSTRAINT "project_category_assignment_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_category_assignment" ADD CONSTRAINT "project_category_assignment_category_id_project_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."project_category"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_link" ADD CONSTRAINT "project_link_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_media" ADD CONSTRAINT "project_media_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_media" ADD CONSTRAINT "project_media_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_section" ADD CONSTRAINT "project_section_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_technology" ADD CONSTRAINT "project_technology_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_technology" ADD CONSTRAINT "project_technology_technology_id_technology_id_fk" FOREIGN KEY ("technology_id") REFERENCES "public"."technology"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "technology" ADD CONSTRAINT "technology_icon_media_id_media_id_fk" FOREIGN KEY ("icon_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill" ADD CONSTRAINT "skill_category_id_skill_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."skill_category"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill" ADD CONSTRAINT "skill_icon_media_id_media_id_fk" FOREIGN KEY ("icon_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "article_published_idx" ON "article" USING btree ("published_at") WHERE "article"."status" = 'published';--> statement-breakpoint
CREATE INDEX "article_featured_idx" ON "article" USING btree ("featured","published_at") WHERE "article"."status" = 'published';--> statement-breakpoint
CREATE INDEX "article_status_updated_idx" ON "article" USING btree ("status","updated_at");--> statement-breakpoint
CREATE INDEX "article_block_article_position_idx" ON "article_block" USING btree ("article_id","position");--> statement-breakpoint
CREATE INDEX "article_tag_tag_article_idx" ON "article_tag" USING btree ("tag_id","article_id");--> statement-breakpoint
CREATE INDEX "contact_submission_status_submitted_idx" ON "contact_submission" USING btree ("status","submitted_at");--> statement-breakpoint
CREATE INDEX "project_published_idx" ON "project" USING btree ("published_at") WHERE "project"."status" = 'published';--> statement-breakpoint
CREATE INDEX "project_featured_idx" ON "project" USING btree ("featured","published_at") WHERE "project"."status" = 'published';--> statement-breakpoint
CREATE INDEX "project_status_updated_idx" ON "project" USING btree ("status","updated_at");--> statement-breakpoint
CREATE INDEX "project_block_section_position_idx" ON "project_block" USING btree ("project_section_id","position");--> statement-breakpoint
CREATE INDEX "project_category_assignment_category_project_idx" ON "project_category_assignment" USING btree ("category_id","project_id");--> statement-breakpoint
CREATE INDEX "project_link_project_position_idx" ON "project_link" USING btree ("project_id","position");--> statement-breakpoint
CREATE INDEX "project_media_project_position_idx" ON "project_media" USING btree ("project_id","position");--> statement-breakpoint
CREATE INDEX "project_section_project_position_idx" ON "project_section" USING btree ("project_id","position");--> statement-breakpoint
CREATE INDEX "project_technology_project_position_idx" ON "project_technology" USING btree ("project_id","position");--> statement-breakpoint
CREATE INDEX "project_technology_technology_project_idx" ON "project_technology" USING btree ("technology_id","project_id");