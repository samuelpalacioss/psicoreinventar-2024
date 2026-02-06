ALTER TABLE "Payout_Method" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."payout_type";--> statement-breakpoint
CREATE TYPE "public"."payout_type" AS ENUM('bank_account', 'pago_movil');--> statement-breakpoint
ALTER TABLE "Payout_Method" ALTER COLUMN "type" SET DATA TYPE "public"."payout_type" USING "type"::"public"."payout_type";