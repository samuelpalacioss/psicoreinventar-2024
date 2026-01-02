CREATE TYPE "public"."appointment_status" AS ENUM('scheduled', 'confirmed', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."condition_type" AS ENUM('primary', 'other');--> statement-breakpoint
CREATE TYPE "public"."day_of_week" AS ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');--> statement-breakpoint
CREATE TYPE "public"."institution_type" AS ENUM('university', 'hospital', 'clinic', 'research_center', 'other');--> statement-breakpoint
CREATE TYPE "public"."language_type" AS ENUM('native', 'foreign');--> statement-breakpoint
CREATE TYPE "public"."payment_method_type" AS ENUM('card', 'pago_movil');--> statement-breakpoint
CREATE TYPE "public"."payout_status" AS ENUM('pending', 'processing', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."payout_type" AS ENUM('bank_transfer', 'pago_movil');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('patient', 'doctor', 'admin');--> statement-breakpoint
CREATE TABLE "Age_Group" (
	"id" serial PRIMARY KEY NOT NULL,
	"doctor_id" integer NOT NULL,
	"name" varchar(50) NOT NULL,
	"min_age" integer NOT NULL,
	"max_age" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Appointment" (
	"id" serial PRIMARY KEY NOT NULL,
	"person_id" integer NOT NULL,
	"doctor_id" integer NOT NULL,
	"doctor_service_doctor_id" integer NOT NULL,
	"doctor_service_service_id" integer NOT NULL,
	"payment_id" integer NOT NULL,
	"start_date_time" timestamp NOT NULL,
	"end_date_time" timestamp NOT NULL,
	"status" "appointment_status" NOT NULL,
	"cancellation_reason" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "Appointment_payment_id_unique" UNIQUE("payment_id")
);
--> statement-breakpoint
CREATE TABLE "Condition" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Doctor_Condition" (
	"doctor_id" serial NOT NULL,
	"condition_id" integer NOT NULL,
	"type" "condition_type" NOT NULL,
	CONSTRAINT "Doctor_Condition_doctor_id_condition_id_pk" PRIMARY KEY("doctor_id","condition_id")
);
--> statement-breakpoint
CREATE TABLE "Doctor_Language" (
	"doctor_id" serial NOT NULL,
	"language_id" integer NOT NULL,
	"type" "language_type" NOT NULL,
	CONSTRAINT "Doctor_Language_doctor_id_language_id_pk" PRIMARY KEY("doctor_id","language_id")
);
--> statement-breakpoint
CREATE TABLE "Doctor_Service" (
	"doctor_id" serial NOT NULL,
	"service_id" integer NOT NULL,
	"amount" integer NOT NULL,
	CONSTRAINT "Doctor_Service_doctor_id_service_id_pk" PRIMARY KEY("doctor_id","service_id")
);
--> statement-breakpoint
CREATE TABLE "Doctor_Treatment_Method" (
	"doctor_id" serial NOT NULL,
	"treatment_method_id" integer NOT NULL,
	CONSTRAINT "Doctor_Treatment_Method_doctor_id_treatment_method_id_pk" PRIMARY KEY("doctor_id","treatment_method_id")
);
--> statement-breakpoint
CREATE TABLE "Doctor" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"ci" integer NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"middle_name" varchar(100),
	"first_last_name" varchar(100) NOT NULL,
	"second_last_name" varchar(100),
	"birth_date" date NOT NULL,
	"address" varchar(500) NOT NULL,
	"place_id" integer NOT NULL,
	"biography" text NOT NULL,
	"first_session_expectation" text NOT NULL,
	"biggest_strengths" text NOT NULL,
	"is_active" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "Doctor_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "Doctor_ci_unique" UNIQUE("ci")
);
--> statement-breakpoint
CREATE TABLE "Education" (
	"id" serial PRIMARY KEY NOT NULL,
	"doctor_id" integer NOT NULL,
	"institution_id" integer NOT NULL,
	"degree" varchar(100) NOT NULL,
	"specialization" varchar(255) NOT NULL,
	"start_year" smallint NOT NULL,
	"end_year" smallint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Institution" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" "institution_type" NOT NULL,
	"place_id" integer NOT NULL,
	"is_verified" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "Language" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Payment_Method_Person" (
	"id" serial PRIMARY KEY NOT NULL,
	"person_id" integer NOT NULL,
	"payment_method_id" integer NOT NULL,
	"is_preferred" boolean DEFAULT false,
	"nickname" varchar(100) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Payment_Method" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" "payment_method_type" NOT NULL,
	"card_number" varchar(4),
	"card_holder_name" varchar(255),
	"card_brand" varchar(50),
	"expiration_month" smallint,
	"expiration_year" smallint,
	"pago_movil_phone" varchar(20),
	"pago_movil_bank_code" varchar(10),
	"pago_movil_ci" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Payment" (
	"id" serial PRIMARY KEY NOT NULL,
	"person_id" integer NOT NULL,
	"payment_method_id" serial NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"date" date NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Payout" (
	"id" serial PRIMARY KEY NOT NULL,
	"doctor_id" integer NOT NULL,
	"type" "payout_type" NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"status" "payout_status" DEFAULT 'pending' NOT NULL,
	"bank_name" varchar(255),
	"account_number" varchar(50),
	"account_type" varchar(50),
	"pago_movil_phone" varchar(20),
	"pago_movil_bank_code" varchar(10),
	"pago_movil_ci" integer,
	"processed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Person" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"ci" integer NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"middle_name" varchar(100),
	"first_last_name" varchar(100) NOT NULL,
	"second_last_name" varchar(100),
	"birth_date" date NOT NULL,
	"address" varchar(500) NOT NULL,
	"place_id" integer NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "Person_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "Person_ci_unique" UNIQUE("ci")
);
--> statement-breakpoint
CREATE TABLE "Phone" (
	"id" serial PRIMARY KEY NOT NULL,
	"person_id" integer,
	"doctor_id" integer,
	"area_code" integer NOT NULL,
	"number" integer NOT NULL,
	CONSTRAINT "phone_owner_check" CHECK (("Phone"."person_id" IS NOT NULL AND "Phone"."doctor_id" IS NULL) OR ("Phone"."person_id" IS NULL AND "Phone"."doctor_id" IS NOT NULL))
);
--> statement-breakpoint
CREATE TABLE "Place" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"person_id" integer NOT NULL,
	"condition_id" integer,
	"title" varchar(255) NOT NULL,
	"level" varchar(100),
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Review" (
	"id" serial PRIMARY KEY NOT NULL,
	"appointment_id" integer NOT NULL,
	"score" smallint NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "Review_appointment_id_unique" UNIQUE("appointment_id")
);
--> statement-breakpoint
CREATE TABLE "Schedule" (
	"id" serial PRIMARY KEY NOT NULL,
	"doctor_id" integer NOT NULL,
	"day" "day_of_week" NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Service" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" varchar(500) NOT NULL,
	"duration" integer DEFAULT 45 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Treatment_Method" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "User" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"role" "user_role" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "User_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "Age_Group" ADD CONSTRAINT "Age_Group_doctor_id_Doctor_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."Doctor"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_person_id_Person_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."Person"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_doctor_id_Doctor_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."Doctor"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_payment_id_Payment_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."Payment"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Doctor_Condition" ADD CONSTRAINT "Doctor_Condition_doctor_id_Doctor_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."Doctor"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Doctor_Condition" ADD CONSTRAINT "Doctor_Condition_condition_id_Condition_id_fk" FOREIGN KEY ("condition_id") REFERENCES "public"."Condition"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Doctor_Language" ADD CONSTRAINT "Doctor_Language_doctor_id_Doctor_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."Doctor"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Doctor_Language" ADD CONSTRAINT "Doctor_Language_language_id_Language_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."Language"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Doctor_Service" ADD CONSTRAINT "Doctor_Service_doctor_id_Doctor_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."Doctor"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Doctor_Service" ADD CONSTRAINT "Doctor_Service_service_id_Service_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."Service"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Doctor_Treatment_Method" ADD CONSTRAINT "Doctor_Treatment_Method_doctor_id_Doctor_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."Doctor"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Doctor_Treatment_Method" ADD CONSTRAINT "Doctor_Treatment_Method_treatment_method_id_Treatment_Method_id_fk" FOREIGN KEY ("treatment_method_id") REFERENCES "public"."Treatment_Method"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Doctor" ADD CONSTRAINT "Doctor_user_id_User_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Doctor" ADD CONSTRAINT "Doctor_place_id_Place_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."Place"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Education" ADD CONSTRAINT "Education_doctor_id_Doctor_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."Doctor"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Education" ADD CONSTRAINT "Education_institution_id_Institution_id_fk" FOREIGN KEY ("institution_id") REFERENCES "public"."Institution"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Institution" ADD CONSTRAINT "Institution_place_id_Place_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."Place"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Payment_Method_Person" ADD CONSTRAINT "Payment_Method_Person_person_id_Person_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."Person"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Payment_Method_Person" ADD CONSTRAINT "Payment_Method_Person_payment_method_id_Payment_Method_id_fk" FOREIGN KEY ("payment_method_id") REFERENCES "public"."Payment_Method"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_person_id_Person_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."Person"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_payment_method_id_Payment_Method_id_fk" FOREIGN KEY ("payment_method_id") REFERENCES "public"."Payment_Method"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_doctor_id_Doctor_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."Doctor"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Person" ADD CONSTRAINT "Person_user_id_User_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Person" ADD CONSTRAINT "Person_place_id_Place_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."Place"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Phone" ADD CONSTRAINT "Phone_person_id_Person_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."Person"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Phone" ADD CONSTRAINT "Phone_doctor_id_Doctor_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."Doctor"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Progress" ADD CONSTRAINT "Progress_person_id_Person_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."Person"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Progress" ADD CONSTRAINT "Progress_condition_id_Condition_id_fk" FOREIGN KEY ("condition_id") REFERENCES "public"."Condition"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Review" ADD CONSTRAINT "Review_appointment_id_Appointment_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."Appointment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_doctor_id_Doctor_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."Doctor"("id") ON DELETE cascade ON UPDATE no action;