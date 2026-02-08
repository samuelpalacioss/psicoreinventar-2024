CREATE TABLE "Doctor_Identity" (
	"doctor_id" integer NOT NULL,
	"identity_id" integer NOT NULL,
	CONSTRAINT "Doctor_Identity_doctor_id_identity_id_pk" PRIMARY KEY("doctor_id","identity_id")
);
--> statement-breakpoint
CREATE TABLE "Doctor_Personality_Trait" (
	"doctor_id" integer NOT NULL,
	"personality_trait_id" integer NOT NULL,
	CONSTRAINT "Doctor_Personality_Trait_doctor_id_personality_trait_id_pk" PRIMARY KEY("doctor_id","personality_trait_id")
);
--> statement-breakpoint
CREATE TABLE "Identity" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	CONSTRAINT "Identity_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "Personality_Trait" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	CONSTRAINT "Personality_Trait_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "Doctor_Identity" ADD CONSTRAINT "Doctor_Identity_doctor_id_Doctor_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."Doctor"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Doctor_Identity" ADD CONSTRAINT "Doctor_Identity_identity_id_Identity_id_fk" FOREIGN KEY ("identity_id") REFERENCES "public"."Identity"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Doctor_Personality_Trait" ADD CONSTRAINT "Doctor_Personality_Trait_doctor_id_Doctor_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."Doctor"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Doctor_Personality_Trait" ADD CONSTRAINT "Doctor_Personality_Trait_personality_trait_id_Personality_Trait_id_fk" FOREIGN KEY ("personality_trait_id") REFERENCES "public"."Personality_Trait"("id") ON DELETE cascade ON UPDATE no action;