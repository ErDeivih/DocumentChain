-- DocumentStats removal
DROP TABLE IF EXISTS "DocumentStats";

-- Remove obsolete indexes
DROP INDEX IF EXISTS "Document_isArchived_idx";
DROP INDEX IF EXISTS "Document_isDeleted_idx";

-- Remove duplicated columns from Document (blockchain is source of truth)
ALTER TABLE "Document"
  DROP COLUMN IF EXISTS "isArchived",
  DROP COLUMN IF EXISTS "archivedAt",
  DROP COLUMN IF EXISTS "isDeleted",
  DROP COLUMN IF EXISTS "deletedAt";

-- Remove duplicated column from Version
ALTER TABLE "Version"
  DROP COLUMN IF EXISTS "isOperational";
