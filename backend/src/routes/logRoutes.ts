import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { isAdmin } from '../middleware/isAdmin';
import * as logController from '../controllers/logController';

const router = Router();

/**
 * GET /api/logs
 * Get recent logs (admin only)
 * Query params: type (combined|error|blockchain), lines (max 1000)
 */
router.get('/', authenticate, isAdmin, logController.getLogs);

/**
 * GET /api/logs/stats
 * Get log file statistics (admin only)
 */
router.get('/stats', authenticate, isAdmin, logController.getLogStats);

/**
 * POST /api/logs/clear
 * Clear logs (admin only)
 * Body: { type: 'combined'|'error'|'blockchain'|'all' }
 */
router.post('/clear', authenticate, isAdmin, logController.clearLogs);

/**
 * POST /api/logs/client-error
 * Log error from client (authenticated users)
 * Body: { error, message, stack, context }
 */
router.post('/client-error', authenticate, logController.logClientError);

export default router;
