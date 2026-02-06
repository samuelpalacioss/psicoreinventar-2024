CREATE TABLE "Payout_Method" (
	"id" serial PRIMARY KEY NOT NULL,
	"doctor_id" integer NOT NULL,
	"type" "payout_type" NOT NULL,
	"bank_name" varchar(255),
	"account_number" varchar(50),
	"account_type" varchar(50),
	"pago_movil_phone" varchar(20),
	"pago_movil_bank_code" varchar(10),
	"pago_movil_ci" integer,
	"is_preferred" boolean DEFAULT false,
	"nickname" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "Payout" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "Payout" CASCADE;--> statement-breakpoint
ALTER TABLE "Payment_Method" RENAME COLUMN "card_number" TO "card_token";--> statement-breakpoint
ALTER TABLE "Review" DROP CONSTRAINT "Review_appointment_id_unique";--> statement-breakpoint
ALTER TABLE "Review" DROP CONSTRAINT "Review_appointment_id_Appointment_id_fk";
--> statement-breakpoint
ALTER TABLE "Review" ALTER COLUMN "appointment_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "Payment_Method" ADD COLUMN "card_last_4" varchar(4);--> statement-breakpoint
ALTER TABLE "Payment" ADD COLUMN "payout_method_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "Progress" ADD COLUMN "doctor_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "Progress" ADD COLUMN "appointment_id" integer;--> statement-breakpoint
ALTER TABLE "Review" ADD COLUMN "doctor_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "Review" ADD COLUMN "person_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "Review" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "Payout_Method" ADD CONSTRAINT "Payout_Method_doctor_id_Doctor_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."Doctor"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_payout_method_id_Payout_Method_id_fk" FOREIGN KEY ("payout_method_id") REFERENCES "public"."Payout_Method"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Progress" ADD CONSTRAINT "Progress_doctor_id_Doctor_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."Doctor"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Progress" ADD CONSTRAINT "Progress_appointment_id_Appointment_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."Appointment"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Review" ADD CONSTRAINT "Review_doctor_id_Doctor_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."Doctor"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Review" ADD CONSTRAINT "Review_person_id_Person_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."Person"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Review" ADD CONSTRAINT "Review_appointment_id_Appointment_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."Appointment"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "review_doctor_person_idx" ON "Review" USING btree ("doctor_id","person_id");--> statement-breakpoint
DROP TYPE "public"."payout_status";