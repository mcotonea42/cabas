/*
  Warnings:

  - A unique constraint covering the columns `[inviteCode]` on the table `Household` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `inviteCode` to the `Household` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Household" ADD COLUMN     "inviteCode" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Household_inviteCode_key" ON "Household"("inviteCode");
