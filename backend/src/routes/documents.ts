/**
 * Document Routes - Refactored for Frontend Wallet Signatures
 * 
 * New prepare/confirm pattern:
 * - POST /prepare: Upload encrypted file, get data for blockchain signing
 * - POST /confirm: Confirm after blockchain transaction submitted
 * 
 */

import { Router } from 'express';
import { DocumentController } from '../controllers/documentController';
import { VersionController } from '../controllers/versionController';
import { SignatureController } from '../controllers/signatureController';
import { ShareController } from '../controllers/shareController';
import { StatsController } from '../controllers/statsController';
import { authenticate } from '../middleware/auth';
import { paginationMiddleware } from '../middleware/pagination';
import { uploadEncrypted } from '../middleware/upload';
import { uploadLimiter, generalLimiter, shareLimiter, blockchainLimiter } from '../middleware/rateLimiter';
import { validateBody, validateParams } from '../middleware/validator';
import { 
  documentIdSchema,
  documentOperationalVersionSchema,
  documentUserParamsSchema,
  documentVersionParamsSchema,
  documentVersionNumberParamsSchema,
} from '../schemas/document.schema';

const router = Router();

// ============================================
// NEW: Prepare/Confirm Pattern Endpoints
// ============================================

/**
 * POST /api/documents/prepare
 * Prepare a document for creation
 * - Uploads encrypted file to IPFS
 * - Creates DB record with PREPARING status
 * - Returns data needed for frontend to sign blockchain transaction
 */
router.post('/prepare', 
  authenticate, 
  uploadLimiter, 
  uploadEncrypted, 
  DocumentController.prepareDocument
);

/**
 * POST /api/documents/confirm
 * Confirm a document after blockchain transaction
 * - Updates DB record with TX_SUBMITTED status
 * - Event listener will update to SYNCED when confirmed
 */
router.post('/confirm', 
  authenticate, 
  generalLimiter, 
  DocumentController.confirmDocument
);

/**
 * POST /api/documents/:documentId/rollback
 * Rollback document creation (delete document + versions + IPFS)
 * Used when blockchain transaction fails after prepare
 */
router.post('/:documentId/rollback',
  authenticate,
  generalLimiter,
  validateParams(documentIdSchema),
  DocumentController.rollbackDocument
);

/**
 * GET /api/documents/wallet/:walletId
 * Get documents created with a specific wallet
 */
router.get('/wallet/:walletId', 
  authenticate, 
  generalLimiter, 
  DocumentController.getDocumentsByWallet
);

// ============================================
// Existing Endpoints (Updated)
// ============================================

// List documents - can filter by walletId
router.get('/', authenticate, generalLimiter, paginationMiddleware, DocumentController.listDocuments);

// Get document by ID
router.get('/:documentId', authenticate, validateParams(documentIdSchema), DocumentController.getDocument);

// Download document (returns encrypted file)
router.get('/:documentId/download', authenticate, validateParams(documentIdSchema), DocumentController.downloadDocument);

// NEW: Archive prepare/confirm
router.post('/:documentId/archive/prepare', authenticate, generalLimiter, validateParams(documentIdSchema), DocumentController.prepareArchiveDocument);
router.post('/:documentId/archive/confirm', authenticate, generalLimiter, validateParams(documentIdSchema), DocumentController.confirmArchiveDocument);

// Legacy lifecycle endpoints still used by the current frontend detail view.
router.put('/:documentId/archive', authenticate, generalLimiter, validateParams(documentIdSchema), DocumentController.archiveDocument);
router.put('/:documentId/unarchive', authenticate, generalLimiter, validateParams(documentIdSchema), DocumentController.unarchiveDocument);
router.delete('/:documentId', authenticate, generalLimiter, validateParams(documentIdSchema), DocumentController.deleteDocument);

// Transfer prepare/confirm (new pattern)
router.post('/:documentId/transfer/prepare', authenticate, generalLimiter, validateParams(documentIdSchema), DocumentController.prepareTransferDocument);
router.post('/:documentId/transfer/confirm', authenticate, generalLimiter, validateParams(documentIdSchema), DocumentController.confirmTransferDocument);

// ============================================
// Document Signatures
// ============================================
router.get('/:documentId/signatures', authenticate, validateParams(documentIdSchema), SignatureController.getDocumentSignatures);

// ============================================
// Document Stats
// ============================================
router.get('/:documentId/stats', authenticate, validateParams(documentIdSchema), StatsController.getDocumentStats);

// ============================================
// Document Sharing (NEW: prepare/confirm pattern)
// ============================================

/**
 * POST /api/documents/:documentId/share/prepare
 * Prepare a share for creation
 */
router.post('/:documentId/share/prepare', 
  authenticate, 
  shareLimiter, 
  validateParams(documentIdSchema), 
  ShareController.prepareShare
);

/**
 * POST /api/documents/:documentId/share/confirm
 * Confirm a share after blockchain transaction
 */
router.post('/:documentId/share/confirm', 
  authenticate, 
  shareLimiter, 
  validateParams(documentIdSchema), 
  ShareController.confirmShare
);

/**
 * POST /api/documents/:documentId/share/:userId/revoke/prepare
 * Prepare share revocation
 */
router.post('/:documentId/share/:userId/revoke/prepare', 
  authenticate, 
  shareLimiter, 
  validateParams(documentUserParamsSchema), 
  ShareController.prepareRevokeShare
);

/**
 * POST /api/documents/:documentId/share/:userId/revoke/confirm
 * Confirm share revocation
 */
router.post('/:documentId/share/:userId/revoke/confirm', 
  authenticate, 
  shareLimiter, 
  validateParams(documentUserParamsSchema), 
  ShareController.confirmRevokeShare
);

router.get('/:documentId/shares', authenticate, validateParams(documentIdSchema), ShareController.getDocumentShares);
router.get('/:documentId/my-role', authenticate, blockchainLimiter, validateParams(documentIdSchema), ShareController.getMyRole);
router.get('/:documentId/check-permission', authenticate, blockchainLimiter, validateParams(documentIdSchema), ShareController.checkPermission);

// ============================================
// Version Routes
// ============================================
router.get('/:documentId/versions', authenticate, validateParams(documentIdSchema), VersionController.getVersions);
router.put('/:documentId/operational-version', authenticate, generalLimiter, validateParams(documentIdSchema), validateBody(documentOperationalVersionSchema), VersionController.setOperational);
// NEW: prepare/confirm pattern for versions
router.post('/:documentId/versions/prepare', authenticate, uploadLimiter, uploadEncrypted, validateParams(documentIdSchema), VersionController.prepareVersion);
router.post('/:documentId/versions/confirm', authenticate, generalLimiter, validateParams(documentIdSchema), VersionController.confirmVersion);
// NEW: restore prepare/confirm
router.post('/:documentId/versions/restore/prepare', authenticate, generalLimiter, validateParams(documentIdSchema), VersionController.prepareRestoreVersion);
router.put('/:documentId/versions/:versionId/operational', authenticate, generalLimiter, validateParams(documentVersionParamsSchema), VersionController.setOperational);
router.post('/:documentId/versions/:versionId/restore', authenticate, validateParams(documentVersionParamsSchema), VersionController.restoreVersion);
// Signatures for a specific version number (for frontend listByVersion)
router.get('/:documentId/versions/:versionNumber/signatures', authenticate, validateParams(documentVersionNumberParamsSchema), SignatureController.getVersionSignaturesByNumber);

export default router;
