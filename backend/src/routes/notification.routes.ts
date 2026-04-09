import express from 'express';
import notificationController from '../controllers/notificationController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

/**
 * GET /notifications
 * Obtener notificaciones del usuario con paginación y filtros
 */
router.get('/', notificationController.getNotifications.bind(notificationController));

/**
 * GET /notifications/unread-count
 * Obtener contador de notificaciones no leídas
 */
router.get('/unread-count', notificationController.getUnreadCount.bind(notificationController));

/**
 * POST /notifications/:id/read
 * Marcar notificación específica como leída
 */
router.post('/:id/read', notificationController.markAsRead.bind(notificationController));

/**
 * POST /notifications/mark-all-read
 * Marcar todas las notificaciones como leídas
 */
router.post('/mark-all-read', notificationController.markAllAsRead.bind(notificationController));

/**
 * DELETE /notifications/:id
 * Eliminar notificación
 */
router.delete('/:id', notificationController.deleteNotification.bind(notificationController));

/**
 * GET /notifications/preferences
 * Obtener preferencias de notificaciones del usuario
 */
router.get('/preferences', notificationController.getPreferences.bind(notificationController));

/**
 * PUT /notifications/preferences
 * Actualizar preferencias de notificaciones
 */
router.put('/preferences', notificationController.updatePreferences.bind(notificationController));

export default router;
