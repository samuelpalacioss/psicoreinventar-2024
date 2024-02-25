/*
  Warnings:

  - You are about to drop the column `stripePriceId` on the `Appointment` table. All the data in the column will be lost.
  - Added the required column `stripeSessionId` to the `Appointment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Appointment" DROP COLUMN "stripePriceId",
ADD COLUMN     "stripeSessionId" TEXT NOT NULL;
