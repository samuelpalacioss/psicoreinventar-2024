CREATE INDEX "doctor_condition_conditionId_idx" ON "Doctor_Condition" USING btree ("condition_id");--> statement-breakpoint
CREATE INDEX "doctor_language_languageId_idx" ON "Doctor_Language" USING btree ("language_id");--> statement-breakpoint
CREATE INDEX "doctor_service_serviceId_idx" ON "Doctor_Service" USING btree ("service_id");--> statement-breakpoint
CREATE INDEX "doctor_treatment_method_treatmentMethodId_idx" ON "Doctor_Treatment_Method" USING btree ("treatment_method_id");--> statement-breakpoint
CREATE INDEX "doctor_isActive_idx" ON "Doctor" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "doctor_placeId_idx" ON "Doctor" USING btree ("place_id");