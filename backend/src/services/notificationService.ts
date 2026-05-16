import prisma from '../config/database';
import { FlowLogger, FlowContext, logger } from '../utils/logger';
import WebSocketService from './webSocketService';
import { emailService } from './emailService';

/**
 * Tipos de notificaciones soportadas por el sistema.
 */
export enum NotificationType {
  FILE_UPLOADED = 'FILE_UPLOADED',
  FILE_SHARED = 'FILE_SHARED',
  FILE_SIGNED = 'FILE_SIGNED',
  FILE_DELETED = 'FILE_DELETED',
  FILE_UPDATED = 'FILE_UPDATED',
  FILE_ARCHIVED = 'FILE_ARCHIVED',
  SHARE_REVOKED = 'SHARE_REVOKED',
  QUOTA_WARNING = 'QUOTA_WARNING',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  BLOCKCHAIN_CONFIRMED = 'BLOCKCHAIN_CONFIRMED',
  SECURITY_ALERT = 'SECURITY_ALERT',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
  FILE_TRANSFER = 'FILE_TRANSFER',
  ACCESS_GRANTED = 'ACCESS_GRANTED',
  ACCESS_REVOKED = 'ACCESS_REVOKED',
  NEW_VERSION = 'NEW_VERSION',
  SYSTEM = 'SYSTEM',
}

/**
 * Datos requeridos para crear una notificación.
 * @property userId - Identificador del destinatario
 * @property type - Tipo de notificación
 * @property title - Título de la notificación
 * @property message - Cuerpo del mensaje
 * @property link - Enlace de acción (opcional)
 * @property data - Metadatos adicionales (opcional)
 */
export interface CreateNotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  data?: Record<string, any>;
}

/**
 * Opciones de consulta y filtrado de notificaciones.
 * @property unreadOnly - Solo notificaciones no leídas
 * @property type - Filtrar por tipo específico
 * @property limit - Límite de resultados
 * @property offset - Desplazamiento para paginación
 */
export interface GetNotificationsOptions {
  unreadOnly?: boolean;
  type?: NotificationType;
  limit?: number;
  offset?: number;
}

/**
 * Sistema de notificaciones multi-canal.
 * Gestiona la creación, consulta y envío de notificaciones mediante base de datos, WebSocket y email.
 *
 * Canales:
 * - Base de datos: histórico persistente
 * - WebSocket: push en tiempo real
 * - Email: notificaciones por correo según preferencias del usuario
 *
 * ⚠️ IMPORTANTE: Las notificaciones SON DATOS PRIVADOS del usuario.
 * NO se almacenan en blockchain.
 */
export class NotificationService {
  /**
   * Crear y enviar notificación multi-canal
   * 
   * @param data - Datos de la notificación
   * @returns Notificación creada
   * 
   * @example
   * await notificationService.createNotification({
   *   userId: 'user-uuid',
   *   type: NotificationType.FILE_SHARED,
   *   title: 'Nuevo archivo compartido',
   *   message: 'Alice compartió "documento.pdf" contigo',
   *   link: '/files/abc123',
   *   data: { fileId: 'abc123', ownerId: 'alice-uuid' }
   * });
   */
  async createNotification(data: CreateNotificationData): Promise<any> {
    const flow = new FlowLogger(FlowContext.NOTIFICATION, data.userId);
    
    try {
      flow.start('create-notification', { type: data.type, title: data.title });
      
      // 1. Verificar preferencias del usuario
      flow.step('check-preferences');
      const preferences = await this.getUserPreferences(data.userId);
      
      const shouldNotify = this.shouldNotify(preferences, data.type);
      if (!shouldNotify) {
        flow.warn('notification-skipped', { reason: 'disabled-in-preferences' });
        // Crear en BD pero no enviar
        const notification = await prisma.notification.create({ data });
        return notification;
      }
      
      // 2. Crear en BD (siempre guardar histórico)
      flow.step('save-database');
      const notification = await prisma.notification.create({ data });
      
      // 3. Enviar por WebSocket si usuario está conectado y push habilitado
      if (preferences.pushEnabled && WebSocketService.isUserConnected(data.userId)) {
        flow.step('send-websocket');
        WebSocketService.sendToUser(data.userId, 'notification', notification);
        logger.debug('Notificación WebSocket enviada', { userId: data.userId, type: data.type });
      }

      // 4. Enviar email si está habilitado. Un fallo SMTP no debe romper el flujo principal.
      if (preferences.emailEnabled) {
        flow.step('send-email');
        await this.sendNotificationEmail(data).catch((error) => {
          logger.warn('No se pudo enviar la notificación por email', {
            userId: data.userId,
            type: data.type,
            error: error instanceof Error ? error.message : 'Error desconocido',
          });
        });
      }
      
      flow.success({ notificationId: notification.id });
      
      return notification;
      
    } catch (error) {
      flow.error(error as Error, { type: data.type });
      throw error;
    }
  }
  
  /**
   * Obtener notificaciones de usuario
   * 
   * @param userId - ID del usuario
   * @param options - Opciones de filtrado y paginación
   * @returns Notificaciones y total
   */
  async getUserNotifications(
    userId: string,
    options?: GetNotificationsOptions
  ): Promise<{ notifications: any[]; total: number }> {
    try {
      const where: any = { userId };
      
      if (options?.unreadOnly) {
        where.isRead = false;
      }
      
      if (options?.type) {
        where.type = options.type;
      }
      
      const [notifications, total] = await Promise.all([
        prisma.notification.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: options?.limit || 50,
          skip: options?.offset || 0,
        }),
        prisma.notification.count({ where }),
      ]);
      
      return { notifications, total };
      
    } catch (error) {
      logger.error('Error al obtener notificaciones de usuario', { userId, error });
      throw error;
    }
  }
  
  /**
   * Marcar notificación como leída
   * 
   * @param notificationId - ID de la notificación
   * @param userId - ID del usuario (validación)
   */
  async markAsRead(notificationId: string, userId: string): Promise<void> {
    try {
      await prisma.notification.updateMany({
        where: { 
          id: notificationId, 
          userId 
        },
        data: { 
          isRead: true, 
          readAt: new Date() 
        },
      });
      
      logger.debug('Notificación marcada como leída', { notificationId, userId });
      
    } catch (error) {
      logger.error('Error al marcar notificación como leída', { notificationId, error });
      throw error;
    }
  }
  
  /**
   * Marcar todas las notificaciones como leídas
   * 
   * @param userId - ID del usuario
   * @returns Cantidad de notificaciones actualizadas
   */
  async markAllAsRead(userId: string): Promise<number> {
    try {
      const result = await prisma.notification.updateMany({
        where: { 
          userId, 
          isRead: false 
        },
        data: { 
          isRead: true, 
          readAt: new Date() 
        },
      });
      
      logger.info('Todas las notificaciones marcadas como leídas', { userId, count: result.count });
      
      return result.count;
      
    } catch (error) {
      logger.error('Error al marcar todas las notificaciones como leídas', { userId, error });
      throw error;
    }
  }
  
  /**
   * Eliminar notificación
   * 
   * @param notificationId - ID de la notificación
   * @param userId - ID del usuario (validación)
   */
  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    try {
      await prisma.notification.deleteMany({
        where: { 
          id: notificationId, 
          userId 
        },
      });
      
      logger.debug('Notificación eliminada', { notificationId, userId });
      
    } catch (error) {
      logger.error('Error al eliminar notificación', { notificationId, error });
      throw error;
    }
  }
  
  /**
   * Obtener conteo de notificaciones no leídas
   * 
   * @param userId - ID del usuario
   * @returns Cantidad de notificaciones no leídas
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const count = await prisma.notification.count({
        where: { 
          userId, 
          isRead: false 
        },
      });
      
      return count;
      
    } catch (error) {
      logger.error('Error al obtener conteo de no leídas', { userId, error });
      return 0;
    }
  }
  
  /**
   * Obtener preferencias de notificación del usuario
   * Crea preferencias por defecto si no existen
   * 
   * @param userId - ID del usuario
   * @returns Preferencias de notificación
   */
  async getUserPreferences(userId: string): Promise<any> {
    try {
      let preferences = await prisma.notificationPreference.findUnique({
        where: { userId },
      });
      
      // Crear preferencias por defecto si no existen
      if (!preferences) {
        preferences = await prisma.notificationPreference.create({
          data: {
            userId,
            emailEnabled: true,
            pushEnabled: true,
            typePreferences: {},
          },
        });
      }
      
      return preferences;
      
    } catch (error) {
      logger.error('Error al obtener preferencias de notificación', { userId, error });
      // Retornar preferencias por defecto en caso de error
      return {
        emailEnabled: true,
        pushEnabled: true,
        typePreferences: {},
      };
    }
  }
  
  /**
   * Verificar si se debe enviar notificación según preferencias
   * 
   * @param preferences - Preferencias del usuario
   * @param type - Tipo de notificación
   * @returns true si se debe notificar
   */
  private shouldNotify(preferences: any, type: NotificationType): boolean {
    // Si no hay preferencias de tipo específicas, notificar
    const typePrefs = preferences.typePreferences as Record<string, boolean> || {};
    
    // Si está definido explícitamente, usar esa preferencia
    if (type in typePrefs) {
      return typePrefs[type];
    }
    
    // Por defecto, notificar (opt-out)
    return true;
  }
  
  /**
   * Actualizar preferencias de notificación
   * 
   * @param userId - ID del usuario
   * @param updates - Actualizaciones de preferencias
   */
  async updatePreferences(
    userId: string,
    updates: {
      emailEnabled?: boolean;
      pushEnabled?: boolean;
      typePreferences?: Record<string, boolean>;
    }
  ): Promise<any> {
    try {
      const preferences = await prisma.notificationPreference.upsert({
        where: { userId },
        create: {
          userId,
          emailEnabled: updates.emailEnabled ?? true,
          pushEnabled: updates.pushEnabled ?? true,
          typePreferences: updates.typePreferences ?? {},
        },
        update: updates,
      });
      
      logger.info('Preferencias de notificación actualizadas', { 
        userId, 
        emailEnabled: preferences.emailEnabled, 
        pushEnabled: preferences.pushEnabled 
      });
      
      return preferences;
      
    } catch (error) {
      logger.error('Error al actualizar preferencias de notificación', { userId, error });
      throw error;
    }
  }

  private async sendNotificationEmail(data: CreateNotificationData): Promise<void> {
    const recipient = await prisma.user.findUnique({
      where: { id: data.userId },
      select: {
        email: true,
        username: true,
      },
    });

    if (!recipient?.email || !recipient.username) {
      return;
    }

    const actionUrl = this.buildEmailActionUrl(data.link, data.data);
    const actionText = this.getNotificationActionText(data.type);

    await emailService.sendNotification(
      recipient.email,
      recipient.username,
      data.title,
      data.message,
      actionUrl,
      actionText
    );
  }

  private buildEmailActionUrl(
    link?: string,
    data?: Record<string, any>
  ): string | undefined {
    const configuredBaseUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
    const fallbackDocumentId = typeof data?.documentId === 'string' ? data.documentId : undefined;
    const rawLink = link || (fallbackDocumentId ? `/app/documents/${fallbackDocumentId}` : undefined);

    if (!rawLink) {
      return undefined;
    }

    let normalizedPath = rawLink.trim();

    if (/^https?:\/\//i.test(normalizedPath)) {
      return normalizedPath;
    }

    if (normalizedPath.startsWith('/files/')) {
      normalizedPath = normalizedPath.replace(/^\/files\//, '/app/documents/');
      normalizedPath = normalizedPath.replace(/\/versions$/, '');
    }

    if (!normalizedPath.startsWith('/')) {
      normalizedPath = `/${normalizedPath}`;
    }

    return `${configuredBaseUrl}${normalizedPath}`;
  }

  private getNotificationActionText(type: NotificationType): string {
    switch (type) {
      case NotificationType.FILE_SHARED:
        return 'Abrir documento compartido';
      case NotificationType.NEW_VERSION:
        return 'Ver nueva versión';
      case NotificationType.FILE_SIGNED:
        return 'Ver firma registrada';
      case NotificationType.BLOCKCHAIN_CONFIRMED:
        return 'Ver documento';
      case NotificationType.SHARE_REVOKED:
        return 'Revisar accesos';
      case NotificationType.FILE_TRANSFER:
      case NotificationType.FILE_UPDATED:
        return 'Ver cambios';
      default:
        return 'Ver detalles';
    }
  }
}

export default new NotificationService();
