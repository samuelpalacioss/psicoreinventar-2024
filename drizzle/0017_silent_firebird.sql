CREATE TYPE "public"."payment_status" AS ENUM('pending', 'paid');--> statement-breakpoint
ALTER TABLE "Payment" ALTER COLUMN "payment_method_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "Payment" ALTER COLUMN "payout_method_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "Payment" ADD COLUMN "status" "payment_status" DEFAULT 'pending' NOT NULL;--> statement-breakpoint
-- Backfill: every existing payment came from the patient booking flow (charged with a payment method), so it is paid
UPDATE "Payment" SET "status" = 'paid';