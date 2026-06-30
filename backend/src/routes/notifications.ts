/**
 * @fileoverview Rutas de gestión de notificaciones del usuario.
 *
 * Proporciona los endpoints para consultar notificaciones, marcarlas como
 * leídas, obtener el contador de no leídas y gestionar las preferencias
 * de notificación del usuario autenticado.
 */
import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { generalLimiter } from '../middleware/rateLimiter';
import { validateParams } from '../middleware/validator';
import { NotificationController } from '../controllers/notificationController';

const notificationIdSchema = z.object({ id: z.string().min(1) });

const router = Router();


router.get('/unread-count', authenticate, generalLimiter, NotificationController.getUnreadCount);
router.get('/', authenticate, generalLimiter, NotificationController.listNotifications);
router.post('/mark-all-read', authenticate, generalLimiter, NotificationController.markAllAsRead);
router.post('/:id/read', authenticate, generalLimiter, validateParams(notificationIdSchema), NotificationController.markAsRead);
router.get('/preferences', authenticate, generalLimiter, NotificationController.getPreferences);
router.put('/preferences', authenticate, generalLimiter, NotificationController.updatePreferences);

export default router;
