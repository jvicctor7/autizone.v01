/*
  Warnings:

  - You are about to drop the column `doneAt` on the `UserGeneratedWord` table. All the data in the column will be lost.
  - You are about to drop the column `xpGained` on the `UserGeneratedWord` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserGeneratedWord" DROP COLUMN "doneAt",
DROP COLUMN "xpGained",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "times" INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE INDEX "UserGeneratedWord_generatedWordId_idx" ON "UserGeneratedWord"("generatedWordId");
