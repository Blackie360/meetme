CREATE TABLE "availability_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"booking_link_id" text NOT NULL,
	"start_hour" integer DEFAULT 9 NOT NULL,
	"end_hour" integer DEFAULT 17 NOT NULL,
	"days_of_week" text DEFAULT '[0,1,2,3,4]' NOT NULL,
	"timezone" text DEFAULT 'UTC' NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blocked_times" (
	"id" text PRIMARY KEY NOT NULL,
	"booking_link_id" text NOT NULL,
	"start_time" timestamp with time zone NOT NULL,
	"end_time" timestamp with time zone NOT NULL,
	"title" text,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
ALTER TABLE "availability_settings" ADD CONSTRAINT "availability_settings_booking_link_id_booking_links_id_fk" FOREIGN KEY ("booking_link_id") REFERENCES "public"."booking_links"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blocked_times" ADD CONSTRAINT "blocked_times_booking_link_id_booking_links_id_fk" FOREIGN KEY ("booking_link_id") REFERENCES "public"."booking_links"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "availability_settings_booking_link_unique" ON "availability_settings" USING btree ("booking_link_id");--> statement-breakpoint
CREATE INDEX "blocked_times_booking_link_id_idx" ON "blocked_times" USING btree ("booking_link_id");--> statement-breakpoint
CREATE INDEX "blocked_times_start_time_idx" ON "blocked_times" USING btree ("start_time");