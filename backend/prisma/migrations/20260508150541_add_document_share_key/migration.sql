/*
  Warnings:

  - You are about to drop the column `blockchainRetries` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `blockchainRetries` on the `DocumentSignature` table. All the data in the column will be lost.
  - You are about to drop the column `totalRestores` on the `DocumentStats` table. All the data in the column will be lost.
  - You are about to drop the column `totalShares` on the `DocumentStats` table. All the data in the column will be lost.
  - You are about to drop the column `totalSignatures` on the `DocumentStats` table. All the data in the column will be lost.
  - You are about to drop the column `totalVersions` on the `DocumentStats` table. All the data in the column will be lost.
  - You are about to drop the column `totalViews` on the `DocumentStats` table. All the data in the column will be lost.
  - You are about to drop the column `gasUsed` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `activeUsers` on the `SystemStats` table. All the data in the column will be lost.
  - You are about to drop the column `newDocuments` on the `SystemStats` table. All the data in the column will be lost.
  - You are about to drop the column `newStorage` on the `SystemStats` table. All the data in the column will be lost.
  - You are about to drop the column `newUsers` on the `SystemStats` table. All the data in the column will be lost.
  - You are about to drop the column `totalDocuments` on the `SystemStats` table. All the data in the column will be lost.
  - You are about to drop the column `totalEvents` on the `SystemStats` table. All the data in the column will be lost.
  - You are about to drop the column `totalRestores` on the `SystemStats` table. All the data in the column will be lost.
  - You are about to drop the column `totalShares` on the `SystemStats` table. All the data in the column will be lost.
  - You are about to drop the column `totalSignatures` on the `SystemStats` table. All the data in the column will be lost.
  - You are about to drop the column `totalStorage` on the `SystemStats` table. All the data in the column will be lost.
  - You are about to drop the column `totalTransfers` on the `SystemStats` table. All the data in the column will be lost.
  - You are about to drop the column `totalUnpins` on the `SystemStats` table. All the data in the column will be lost.
  - You are about to drop the column `totalUsers` on the `SystemStats` table. All the data in the column will be lost.
  - You are about to drop the column `blockchainRetries` on the `Version` table. All the data in the column will be lost.
  - You are about to drop the `UserStats` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserStats" DROP CONSTRAINT "UserStats_userId_fkey";

-- AlterTable
ALTER TABLE "Document" DROP COLUMN "blockchainRetries";

-- AlterTable
ALTER TABLE "DocumentSignature" DROP COLUMN "blockchainRetries";

-- AlterTable
ALTER TABLE "DocumentStats" DROP COLUMN "totalRestores",
DROP COLUMN "totalShares",
DROP COLUMN "totalSignatures",
DROP COLUMN "totalVersions",
DROP COLUMN "totalViews";

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "gasUsed";

-- AlterTable
ALTER TABLE "SystemStats" DROP COLUMN "activeUsers",
DROP COLUMN "newDocuments",
DROP COLUMN "newStorage",
DROP COLUMN "newUsers",
DROP COLUMN "totalDocuments",
DROP COLUMN "totalEvents",
DROP COLUMN "totalRestores",
DROP COLUMN "totalShares",
DROP COLUMN "totalSignatures",
DROP COLUMN "totalStorage",
DROP COLUMN "totalTransfers",
DROP COLUMN "totalUnpins",
DROP COLUMN "totalUsers";

-- AlterTable
ALTER TABLE "Version" DROP COLUMN "blockchainRetries";

-- DropTable
DROP TABLE "UserStats";

-- CreateTable
CREATE TABLE "DocumentShareKey" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "encryptedSymmetricKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentShareKey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DocumentShareKey_documentId_idx" ON "DocumentShareKey"("documentId");

-- CreateIndex
CREATE INDEX "DocumentShareKey_userId_idx" ON "DocumentShareKey"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentShareKey_documentId_userId_key" ON "DocumentShareKey"("documentId", "userId");

-- AddForeignKey
ALTER TABLE "DocumentShareKey" ADD CONSTRAINT "DocumentShareKey_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentShareKey" ADD CONSTRAINT "DocumentShareKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
