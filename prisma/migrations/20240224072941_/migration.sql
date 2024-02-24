/*
  Warnings:

  - The primary key for the `Product` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `productId` on the `Product` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[priceId]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `priceId` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stripeId` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_productId_fkey";

-- DropForeignKey
ALTER TABLE "Image" DROP CONSTRAINT "Image_productId_fkey";

-- AlterTable
ALTER TABLE "Product" DROP CONSTRAINT "Product_pkey",
DROP COLUMN "productId",
ADD COLUMN     "priceId" TEXT NOT NULL,
ADD COLUMN     "stripeId" TEXT NOT NULL,
ADD CONSTRAINT "Product_pkey" PRIMARY KEY ("stripeId");

-- CreateIndex
CREATE UNIQUE INDEX "Product_priceId_key" ON "Product"("priceId");

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("stripeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("stripeId") ON DELETE CASCADE ON UPDATE CASCADE;
