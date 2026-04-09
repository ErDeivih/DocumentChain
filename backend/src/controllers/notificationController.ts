import { Request, Response } from 'express';
import notificationService from '../services/notificationService';
import { logger } from '../utils/logger';

/**
 * NotificationController - Endpoints para notificaciones
 * 
 * Endpoints:
 * - GET /notifications - Obtener notificaciones del usuario
 * - GET /notifications/unread-count - Contador de no leídas
 * - POST /notifications/:id/read - Marcar como leída
 * - POST /notifications/mark-all-read - Marcar todas como leídas
 * - DELETE /notifications/:id - Eliminar notificación
 * - GET /notifications/preferences - Obtener preferencias
 * - PUT /notifications/preferences - Actualizar preferencias
 */
class NotificationController {
  /**
   * GET /notifications
   * 
   * Obtener notificaciones del usuario con filtros y paginación
   * 
   * Query params:
   * - isRead: boolean (filtrar por leídas/no leídas)
   * - type: NotificationType (filtrar por tipo)
   * - skip: number (paginación)
   * - take: number (paginación)
   */
  async getNotifications(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      
      const unreadOnly = req.query.isRead === 'true' ? false : 
                         req.query.isRead === 'false' ? true : 
                         undefined;
      
      const type = req.query.type as string | undefined;
      const offset = req.query.skip ? parseInt(req.query.skip as string) : 0;
      const limit = req.query.take ? parseInt(req.query.take as string) : 20;
      
      const result = await notificationService.getUserNotifications(userId, {
        unreadOnly,
        type: type as any,
        offset,
        limit,
      });
      
      // Get unread count
      const unread = await notificationService.getUnreadCount(userId);
      
      res.json({
        notifications: result.notifications,
        total: result.total,
        unread,
      });
      
    } catch (error) {
      logger.error('Error al obtener notificaciones', {
        userId: (req as any).user?.userId,
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
      
      res.status(500).json({
        success: false,
        error: 'Error al recuperar notificaciones',
      });
    }
  }
  
  /**
   * GET /notifications/unread-count
   * 
   * Obtener cantidad de notificaciones no leídas
   */
  async getUnreadCount(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      
      const count = await notificationService.getUnreadCount(userId);
      
      res.json({
        success: true,
        data: { count },
      });
      
    } catch (error) {
      logger.error('Error al obtener contador de no leídas', {
        userId: (req as any).user?.userId,
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
      
      res.status(500).json({
        success: false,
        error: 'Error al obtener contador de no leídas',
      });
    }
  }
  
  /**
   * POST /notifications/:id/read
   * 
   * Marcar notificación como leída
   */
  async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const notificationId = req.params.id as string;
      
      await notificationService.markAsRead(notificationId, userId);
      
      res.json({
        success: true,
        message: 'Notificación marcada como leída',
      });
      
    } catch (error) {
      logger.error('Error al marcar notificación como leída', {
        userId: (req as any).user?.userId,
        notificationId: req.params.id,
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
      
      res.status(500).json({
        success: false,
        error: 'Error al marcar notificación como leída',
      });
    }
  }
  
  /**
   * POST /notifications/mark-all-read
   * 
   * Marcar todas las notificaciones como leídas
   */
  async markAllAsRead(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      
      const count = await notificationService.markAllAsRead(userId);
      
      res.json({
        success: true,
        message: `${count} notificaciones marcadas como leídas`,
        data: { count },
      });
      
    } catch (error) {
      logger.error('Error al marcar todas las notificaciones como leídas', {
        userId: (req as any).user?.userId,
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
      
      res.status(500).json({
        success: false,
        error: 'Error al marcar todas las notificaciones como leídas',
      });
    }
  }
  
  /**
   * DELETE /notifications/:id
   * 
   * Eliminar notificación
   */
  async deleteNotification(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const notificationId = req.params.id as string;
      
      await notificationService.deleteNotification(notificationId, userId);
      
      res.json({
        success: true,
        message: 'Notificación eliminada',
      });
      
    } catch (error) {
      logger.error('Error al eliminar notificación', {
        userId: (req as any).user?.userId,
        notificationId: req.params.id,
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
      
      res.status(500).json({
        success: false,
        error: 'Error al eliminar notificación',
      });
    }
  }
  
  /**
   * GET /notifications/preferences
   * 
   * Obtener preferencias de notificaciones del usuario
   */
  async getPreferences(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      
      const preferences = await notificationService.getUserPreferences(userId);
      
      res.json({
        success: true,
        data: preferences,
      });
      
    } catch (error) {
      logger.error('Error al obtener preferencias de notificaciones', {
        userId: (req as any).user?.userId,
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
      
      res.status(500).json({
        success: false,
        error: 'Error al obtener preferencias',
      });
    }
  }
  
  /**
   * PUT /notifications/preferences
   * 
   * Actualizar preferencias de notificaciones
   * 
   * Body:
   * - emailEnabled: boolean
   * - pushEnabled: boolean
   * - typePreferences: Record<NotificationType, boolean>
   */
  async updatePreferences(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const { emailEnabled, pushEnabled, typePreferences } = req.body;
      
      const preferences = await notificationService.updatePreferences(userId, {
        emailEnabled,
        pushEnabled,
        typePreferences,
      });
      
      res.json({
        success: true,
        message: 'Preferencias actualizadas',
        data: preferences,
      });
      
    } catch (error) {
      logger.error('Error al actualizar preferencias de notificaciones', {
        userId: (req as any).user?.userId,
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
      
      res.status(500).json({
        success: false,
        error: 'Error al actualizar preferencias',
      });
    }
  }
}

export default new NotificationController();
