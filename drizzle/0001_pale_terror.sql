CREATE TABLE "Account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "Session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "Verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "Doctor_Condition" ALTER COLUMN "doctor_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "Doctor_Language" ALTER COLUMN "doctor_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "Doctor_Service" ALTER COLUMN "doctor_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "Doctor_Treatment_Method" ALTER COLUMN "doctor_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "Doctor" ALTER COLUMN "user_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "Payment" ALTER COLUMN "payment_method_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "Person" ALTER COLUMN "user_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "User" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "User" ALTER COLUMN "email" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "email_verified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "image" text;--> statement-breakpoint
ALTER TABLE "Account" ADD CONSTRAINT "Account_user_id_User_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Session" ADD CONSTRAINT "Session_user_id_User_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "Account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "Session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "Verification" USING btree ("identifier");--> statement-breakpoint
ALTER TABLE "User" DROP COLUMN "password";