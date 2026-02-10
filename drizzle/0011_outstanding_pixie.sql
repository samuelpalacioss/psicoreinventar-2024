CREATE TYPE "public"."consultation_type" AS ENUM('virtual_only', 'in_person', 'both');--> statement-breakpoint
ALTER TABLE "Doctor" ALTER COLUMN "place_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "Doctor" ADD COLUMN "consultation_type" "consultation_type" DEFAULT 'virtual_only' NOT NULL;--> statement-breakpoint
ALTER TABLE "Place" ADD COLUMN "osm_id" varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE "Place" ADD COLUMN "osm_type" varchar(20) NOT NULL;--> statement-breakpoint
ALTER TABLE "Place" ADD COLUMN "display_name" varchar(500) NOT NULL;--> statement-breakpoint
ALTER TABLE "Place" ADD COLUMN "display_place" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "Place" ADD COLUMN "display_address" varchar(500);--> statement-breakpoint
ALTER TABLE "Place" ADD COLUMN "class" varchar(100);--> statement-breakpoint
ALTER TABLE "Place" ADD COLUMN "city" varchar(255);--> statement-breakpoint
ALTER TABLE "Place" ADD COLUMN "state" varchar(255);--> statement-breakpoint
ALTER TABLE "Place" ADD COLUMN "country" varchar(255);--> statement-breakpoint
ALTER TABLE "Place" ADD COLUMN "postcode" varchar(20);--> statement-breakpoint
ALTER TABLE "Place" ADD COLUMN "lat" numeric(10, 7) NOT NULL;--> statement-breakpoint
ALTER TABLE "Place" ADD COLUMN "lon" numeric(10, 7) NOT NULL;--> statement-breakpoint
ALTER TABLE "Place" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "Place" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
CREATE INDEX "doctor_consultationType_idx" ON "Doctor" USING btree ("consultation_type");--> statement-breakpoint
ALTER TABLE "Place" DROP COLUMN "name";