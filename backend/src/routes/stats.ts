import { Router } from 'express';
import { StatsController } from '../controllers/statsController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

// User stats
router.get('/me', authenticate, StatsController.getMyStats);

// Admin stats
router.get('/system', authenticate, requireAdmin, StatsController.getSystemStats);
router.get('/top-documents', authenticate, requireAdmin, StatsController.getTopDocuments);
router.get('/user/:userId', authenticate, requireAdmin, StatsController.getUserStats);

export default router;
