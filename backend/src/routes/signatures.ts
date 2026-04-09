/**
 * Signature Routes - Refactored for Frontend Wallet Signatures
 * 
 * New prepare/confirm pattern:
 * - POST /prepare: Request to sign a document version
 * - POST /confirm: Confirm after blockchain transaction submitted
 * 
 */

import { Router } from 'express';
import { SignatureController } from '../controllers/signatureController';
import { authenticate } from '../middleware/auth';
import { generalLimiter, blockchainLimiter } from '../middleware/rateLimiter';

const router = Router();

// ============================================
// NEW: Prepare/Confirm Pattern Endpoints
// ============================================

/**
 * POST /api/signatures/prepare
 * Prepare a signature for creation
 * - Creates DB record with PREPARING status
 * - Returns data needed for frontend to sign blockchain transaction
 */
router.post('/prepare', 
  authenticate, 
  blockchainLimiter, 
  SignatureController.prepareSignature
);

/**
 * POST /api/signatures/confirm
 * Confirm a signature after blockchain transaction
 * - Updates DB record with TX_SUBMITTED status
 * - Event listener will update to SYNCED when confirmed
 */
router.post('/confirm', 
  authenticate, 
  generalLimiter, 
  SignatureController.confirmSignature
);

// NOTE: removeSignature (DELETE /:signatureId) has been removed intentionally.
// Signatures are immutable — once placed on the blockchain they cannot be revoked.
// Deleting them from the DB while the blockchain record persists creates inconsistency.

// Rollback a signature preparation (used only when blockchain tx fails, PREPARING status only)
router.post('/:signatureId/rollback', authenticate, generalLimiter, SignatureController.rollbackSignature);

export default router;
