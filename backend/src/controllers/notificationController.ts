import { Request, Response, NextFunction } from 'express';
import notificationService from '../services/notificationService';

/**
 * Controlador de notificaciones. Lista, marca como leídas y gestiona preferencias.
 */
export class NotificationController {

  /**
   * Obtiene el conteo de notificaciones no leídas del usuario autenticado.
   * Endpoint: GET /api/notifications/unread-count
   * @param {Request} req - Solicitud HTTP
   * @param {Response} res - Respuesta HTTP
   * @returns {Promise<void>}
   */
  static async getUnreadCount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) { res.status(401).json({ error: 'No autenticado' }); return; }
      const userId = req.user.userId;
      const count = await notificationService.getUnreadCount(userId);
      res.json({ success: true, count });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lista las notificaciones del usuario autenticado con filtros.
   * Endpoint: GET /api/notifications
   * @param {Request} req - Solicitud HTTP
   * @param {Response} res - Respuesta HTTP
   * @returns {Promise<void>}
   */
  static async listNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) { res.status(401).json({ error: 'No autenticado' }); return; }
      const userId = req.user.userId;
      const unreadOnly = req.query.unreadOnly === 'true';
      const limit = Number(req.query.limit || 50);
      const offset = Number(req.query.offset || 0);

      const { notifications, total } = await notificationService.getUserNotifications(userId, {
        unreadOnly,
        limit,
        offset,
      });

      res.json({ success: true, notifications, total });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Marca una notificación específica como leída.
   * Endpoint: PATCH /api/notifications/:id/read
   * @param {Request} req - Solicitud HTTP
   * @param {Response} res - Respuesta HTTP
   * @returns {Promise<void>}
   */
  static async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) { res.status(401).json({ error: 'No autenticado' }); return; }
      const userId = req.user.userId;
      await notificationService.markAsRead(req.params.id as string, userId);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Marca todas las notificaciones del usuario autenticado como leídas.
   * Endpoint: PATCH /api/notifications/read-all
   * @param {Request} req - Solicitud HTTP
   * @param {Response} res - Respuesta HTTP
   * @returns {Promise<void>}
   */
  static async markAllAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) { res.status(401).json({ error: 'No autenticado' }); return; }
      const userId = req.user.userId;
      const updated = await notificationService.markAllAsRead(userId);
      res.json({ success: true, updated });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtiene las preferencias de notificaciones del usuario autenticado.
   * Endpoint: GET /api/notifications/preferences
   * @param {Request} req - Solicitud HTTP
   * @param {Response} res - Respuesta HTTP
   * @returns {Promise<void>}
   */
  static async getPreferences(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) { res.status(401).json({ error: 'No autenticado' }); return; }
      const userId = req.user.userId;
      const preferences = await notificationService.getUserPreferences(userId);
      res.json({ success: true, data: preferences });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Actualiza las preferencias de notificaciones del usuario autenticado.
   * Endpoint: PUT /api/notifications/preferences
   * @param {Request} req - Solicitud HTTP
   * @param {Response} res - Respuesta HTTP
   * @returns {Promise<void>}
   */
  static async updatePreferences(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) { res.status(401).json({ error: 'No autenticado' }); return; }
      const userId = req.user.userId;
      const { emailEnabled, pushEnabled, typePreferences } = req.body || {};

      const updates: {
        emailEnabled?: boolean;
        pushEnabled?: boolean;
        typePreferences?: Record<string, boolean>;
      } = {};

      if (typeof emailEnabled === 'boolean') updates.emailEnabled = emailEnabled;
      if (typeof pushEnabled === 'boolean') updates.pushEnabled = pushEnabled;
      if (typePreferences && typeof typePreferences === 'object') updates.typePreferences = typePreferences;

      const preferences = await notificationService.updatePreferences(userId, updates);
      res.json({ success: true, data: preferences });
    } catch (error) {
      next(error);
    }
  }
}
