/*
  Warnings:

  - You are about to drop the column `userId` on the `GeneratedWord` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "GeneratedWord" DROP COLUMN "userId";

-- CreateTable
CREATE TABLE "UserGeneratedWord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "generatedWordId" TEXT NOT NULL,
    "doneAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "xpGained" INTEGER,

    CONSTRAINT "UserGeneratedWord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserGeneratedWord_userId_idx" ON "UserGeneratedWord"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserGeneratedWord_userId_generatedWordId_key" ON "UserGeneratedWord"("userId", "generatedWordId");

-- AddForeignKey
ALTER TABLE "UserGeneratedWord" ADD CONSTRAINT "UserGeneratedWord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserGeneratedWord" ADD CONSTRAINT "UserGeneratedWord_generatedWordId_fkey" FOREIGN KEY ("generatedWordId") REFERENCES "GeneratedWord"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
