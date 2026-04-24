/*
  Warnings:

  - The `blockchainStatus` column on the `Document` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `createdAt` on the `DocumentShare` table. All the data in the column will be lost.
  - The `blockchainStatus` column on the `DocumentShare` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `walletAddress` on the `DocumentSignature` table. All the data in the column will be lost.
  - The `blockchainStatus` column on the `DocumentSignature` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `blockchainStatus` column on the `Version` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `versionNumber` to the `Version` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BlockchainStatus" AS ENUM ('PREPARING', 'TX_SUBMITTED', 'SYNCED', 'FAILED');

-- DropIndex
DROP INDEX "DocumentSignature_walletAddress_idx";

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "blockchainTxHash" TEXT,
ADD COLUMN     "creatorWalletId" TEXT,
ALTER COLUMN "blockchainId" DROP NOT NULL,
DROP COLUMN "blockchainStatus",
ADD COLUMN     "blockchainStatus" "BlockchainStatus" NOT NULL DEFAULT 'PREPARING';

-- AlterTable
ALTER TABLE "DocumentShare" DROP COLUMN "createdAt",
ADD COLUMN     "blockchainTxHash" TEXT,
ADD COLUMN     "sharerWalletId" TEXT,
DROP COLUMN "blockchainStatus",
ADD COLUMN     "blockchainStatus" "BlockchainStatus" NOT NULL DEFAULT 'PREPARING';

-- AlterTable
ALTER TABLE "DocumentSignature" DROP COLUMN "walletAddress",
ADD COLUMN     "blockchainTxHash" TEXT,
ADD COLUMN     "signerWalletId" TEXT,
DROP COLUMN "blockchainStatus",
ADD COLUMN     "blockchainStatus" "BlockchainStatus" NOT NULL DEFAULT 'PREPARING';

-- AlterTable
ALTER TABLE "Version" ADD COLUMN     "blockchainTxHash" TEXT,
ADD COLUMN     "ipfsCid" TEXT,
ADD COLUMN     "isOperational" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "versionNumber" INTEGER NOT NULL,
DROP COLUMN "blockchainStatus",
ADD COLUMN     "blockchainStatus" "BlockchainStatus" NOT NULL DEFAULT 'PREPARING';

-- CreateIndex
CREATE INDEX "Document_blockchainStatus_idx" ON "Document"("blockchainStatus");

-- CreateIndex
CREATE INDEX "DocumentShare_blockchainStatus_idx" ON "DocumentShare"("blockchainStatus");

-- CreateIndex
CREATE INDEX "DocumentSignature_blockchainStatus_idx" ON "DocumentSignature"("blockchainStatus");

-- CreateIndex
CREATE INDEX "Version_blockchainStatus_idx" ON "Version"("blockchainStatus");

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_creatorWalletId_fkey" FOREIGN KEY ("creatorWalletId") REFERENCES "Wallet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentShare" ADD CONSTRAINT "DocumentShare_sharerWalletId_fkey" FOREIGN KEY ("sharerWalletId") REFERENCES "Wallet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentSignature" ADD CONSTRAINT "DocumentSignature_signerWalletId_fkey" FOREIGN KEY ("signerWalletId") REFERENCES "Wallet"("id") ON DELETE SET NULL ON UPDATE CASCADE;
