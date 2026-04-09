import { Router } from 'express';
import { VersionController } from '../controllers/versionController';
import { SignatureController } from '../controllers/signatureController';
import { authenticate } from '../middleware/auth';
import { generalLimiter } from '../middleware/rateLimiter';

const router = Router();

// Version routes
router.get('/:versionId', authenticate, VersionController.getVersion);
router.get('/:versionId/download', authenticate, VersionController.downloadVersion);

// Rollback routes
router.post('/:versionId/rollback', authenticate, generalLimiter, VersionController.rollbackVersion);
router.post('/:versionId/rollback-restore', authenticate, generalLimiter, VersionController.rollbackVersionRestore);
// Restore confirm (after blockchain transaction for a restore prepare)
router.post('/:versionId/restore/confirm', authenticate, generalLimiter, VersionController.confirmRestoreVersion);

// Version signature routes
router.get('/:versionId/signatures', authenticate, SignatureController.getVersionSignatures);
router.get('/:versionId/signatures/check', authenticate, SignatureController.checkSignature);
router.get('/:versionId/signatures/me', authenticate, SignatureController.getMySignature);

export default router;
