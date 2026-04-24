/*
  Warnings:

  - You are about to drop the `DocumentShare` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "DocumentShare" DROP CONSTRAINT "DocumentShare_documentId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentShare" DROP CONSTRAINT "DocumentShare_sharerWalletId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentShare" DROP CONSTRAINT "DocumentShare_userId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentShare" DROP CONSTRAINT "DocumentShare_versionId_fkey";

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "encryptionAuthTag" TEXT,
ADD COLUMN     "encryptionIV" TEXT;

-- AlterTable
ALTER TABLE "Version" ADD COLUMN     "encryptionAuthTag" TEXT,
ADD COLUMN     "encryptionIV" TEXT;

-- DropTable
DROP TABLE "DocumentShare";

-- DropEnum
DROP TYPE "DocumentRole";

-- CreateTable
CREATE TABLE "SystemConfig" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SystemConfig_key_key" ON "SystemConfig"("key");

-- CreateIndex
CREATE INDEX "SystemConfig_key_idx" ON "SystemConfig"("key");
