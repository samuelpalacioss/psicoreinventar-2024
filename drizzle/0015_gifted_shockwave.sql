CREATE TABLE "Conversation" (
	"id" serial PRIMARY KEY NOT NULL,
	"doctor_id" integer NOT NULL,
	"person_id" integer NOT NULL,
	"last_message_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Message" (
	"id" serial PRIMARY KEY NOT NULL,
	"conversation_id" integer NOT NULL,
	"sender_id" text NOT NULL,
	"content" text NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_doctor_id_Doctor_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."Doctor"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_person_id_Person_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."Person"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversation_id_Conversation_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."Conversation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Message" ADD CONSTRAINT "Message_sender_id_User_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "conversation_doctor_person_idx" ON "Conversation" USING btree ("doctor_id","person_id");--> statement-breakpoint
CREATE INDEX "conversation_doctorId_idx" ON "Conversation" USING btree ("doctor_id");--> statement-breakpoint
CREATE INDEX "conversation_personId_idx" ON "Conversation" USING btree ("person_id");--> statement-breakpoint
CREATE INDEX "conversation_lastMessageAt_idx" ON "Conversation" USING btree ("last_message_at");--> statement-breakpoint
CREATE INDEX "message_conversationId_idx" ON "Message" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "message_senderId_idx" ON "Message" USING btree ("sender_id");--> statement-breakpoint
CREATE INDEX "message_createdAt_idx" ON "Message" USING btree ("created_at");