import { Router } from 'express';
import { ShareController } from '../controllers/shareController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All share routes require authentication
router.get('/with-me', authenticate, ShareController.getSharedWithMe);

// Confirm share creation (shareId in body identifies the record — no documentId in URL needed)
router.post('/confirm', authenticate, ShareController.confirmShare);

// Confirm share revocation (shareId in body identifies the record — no documentId/userId in URL needed)
router.post('/revoke/confirm', authenticate, ShareController.confirmRevokeShare);

export default router;
