-- AlterTable
ALTER TABLE "DocumentSignature"
  ADD COLUMN "signerUsernameSnapshot" TEXT,
  ADD COLUMN "signerFullNameSnapshot" TEXT,
  ADD COLUMN "signerWalletAddressSnapshot" TEXT;

-- DropForeignKey
ALTER TABLE "DocumentSignature" DROP CONSTRAINT IF EXISTS "DocumentSignature_userId_fkey";
ALTER TABLE "DocumentSignature" DROP CONSTRAINT IF EXISTS "DocumentSignature_signerWalletId_fkey";

-- DropIndex
DROP INDEX IF EXISTS "DocumentSignature_versionId_userId_key";

-- AlterTable
ALTER TABLE "DocumentSignature"
  ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "DocumentSignature"
  ADD CONSTRAINT "DocumentSignature_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "DocumentSignature"
  ADD CONSTRAINT "DocumentSignature_signerWalletId_fkey"
  FOREIGN KEY ("signerWalletId") REFERENCES "Wallet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE UNIQUE INDEX "DocumentSignature_versionId_userId_key" ON "DocumentSignature"("versionId", "userId");