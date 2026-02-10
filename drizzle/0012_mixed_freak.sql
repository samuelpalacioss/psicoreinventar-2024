ALTER TABLE "Payout_Method" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."payout_type";--> statement-breakpoint
CREATE TYPE "public"."payout_type" AS ENUM('cash', 'zelle', 'pago_movil', 'bank_transfer');--> statement-breakpoint
ALTER TABLE "Payout_Method" ALTER COLUMN "type" SET DATA TYPE "public"."payout_type" USING "type"::"public"."payout_type";--> statement-breakpoint
ALTER TABLE "Payout_Method" ADD COLUMN "zelle_email" varchar(255);--> statement-breakpoint
ALTER TABLE "Payout_Method" ADD COLUMN "zelle_phone" varchar(20);