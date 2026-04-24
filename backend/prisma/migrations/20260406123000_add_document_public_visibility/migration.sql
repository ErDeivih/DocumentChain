DO $$
BEGIN
  CREATE TYPE "DocumentVisibility" AS ENUM ('PRIVATE', 'PUBLIC');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "Document"
  ADD COLUMN IF NOT EXISTS "publicId" TEXT,
  ADD COLUMN IF NOT EXISTS "visibility" "DocumentVisibility" NOT NULL DEFAULT 'PRIVATE';

CREATE UNIQUE INDEX IF NOT EXISTS "Document_publicId_key" ON "Document"("publicId");
CREATE INDEX IF NOT EXISTS "Document_publicId_idx" ON "Document"("publicId");
CREATE INDEX IF NOT EXISTS "Document_visibility_idx" ON "Document"("visibility");