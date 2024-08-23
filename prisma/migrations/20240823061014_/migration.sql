/*
  Warnings:

  - You are about to drop the column `doctorEducation` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `doctorExperience` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `_SpecialtyToUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_SpecialtyToUser" DROP CONSTRAINT "_SpecialtyToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_SpecialtyToUser" DROP CONSTRAINT "_SpecialtyToUser_B_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "doctorEducation",
DROP COLUMN "doctorExperience";

-- DropTable
DROP TABLE "_SpecialtyToUser";

-- CreateTable
CREATE TABLE "DoctorProfile" (
    "id" TEXT NOT NULL,
    "licenseNumber" TEXT,
    "experience" TEXT,
    "graduationYear" TEXT,
    "education" TEXT,
    "description" TEXT,
    "clientExpectations" TEXT,
    "treatmentMethods" TEXT,
    "strengths" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "DoctorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_DoctorProfileToSpecialty" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "DoctorProfile_licenseNumber_key" ON "DoctorProfile"("licenseNumber");

-- CreateIndex
CREATE UNIQUE INDEX "DoctorProfile_userId_key" ON "DoctorProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "_DoctorProfileToSpecialty_AB_unique" ON "_DoctorProfileToSpecialty"("A", "B");

-- CreateIndex
CREATE INDEX "_DoctorProfileToSpecialty_B_index" ON "_DoctorProfileToSpecialty"("B");

-- AddForeignKey
ALTER TABLE "DoctorProfile" ADD CONSTRAINT "DoctorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DoctorProfileToSpecialty" ADD CONSTRAINT "_DoctorProfileToSpecialty_A_fkey" FOREIGN KEY ("A") REFERENCES "DoctorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DoctorProfileToSpecialty" ADD CONSTRAINT "_DoctorProfileToSpecialty_B_fkey" FOREIGN KEY ("B") REFERENCES "Specialty"("id") ON DELETE CASCADE ON UPDATE CASCADE;
