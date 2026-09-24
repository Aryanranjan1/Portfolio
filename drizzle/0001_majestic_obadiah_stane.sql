ALTER TABLE "contact_method" ADD CONSTRAINT "contact_method_position_unique" UNIQUE("position");--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_file_size_bytes_check" CHECK ("media"."file_size_bytes" IS NULL OR "media"."file_size_bytes" >= 0);--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_width_check" CHECK ("media"."width" IS NULL OR "media"."width" > 0);--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_height_check" CHECK ("media"."height" IS NULL OR "media"."height" > 0);