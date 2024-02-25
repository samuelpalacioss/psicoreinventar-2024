/*
  Warnings:

  - A unique constraint covering the columns `[stripeSessionId]` on the table `Appointment` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Appointment_stripeSessionId_key" ON "Appointment"("stripeSessionId");
