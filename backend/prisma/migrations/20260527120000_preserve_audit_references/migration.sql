-- Preserve audit/history rows when optional parent records are removed.
ALTER TABLE "Document" DROP CONSTRAINT IF EXISTS "Document_creatorWalletId_fkey";
ALTER TABLE "Document" ADD CONSTRAINT "Document_creatorWalletId_fkey"
  FOREIGN KEY ("creatorWalletId") REFERENCES "Wallet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Document" DROP CONSTRAINT IF EXISTS "Document_folderId_fkey";
ALTER TABLE "Document" ADD CONSTRAINT "Document_folderId_fkey"
  FOREIGN KEY ("folderId") REFERENCES "Folder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "DocumentSignature" DROP CONSTRAINT IF EXISTS "DocumentSignature_signerWalletId_fkey";
ALTER TABLE "DocumentSignature" ADD CONSTRAINT "DocumentSignature_signerWalletId_fkey"
  FOREIGN KEY ("signerWalletId") REFERENCES "Wallet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "DocumentSignature" DROP CONSTRAINT IF EXISTS "DocumentSignature_userId_fkey";
ALTER TABLE "DocumentSignature" ADD CONSTRAINT "DocumentSignature_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Event" DROP CONSTRAINT IF EXISTS "Event_documentId_fkey";
ALTER TABLE "Event" ADD CONSTRAINT "Event_documentId_fkey"
  FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;
