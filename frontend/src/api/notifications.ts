import { api } from '../lib/api';

/**
 * Elemento de notificación recibido del backend.
 * @property id - Identificador único de la notificación
 * @property type - Tipo de notificación (FILE_SHARED, NEW_VERSION, etc.)
 * @property title - Título de la notificación
 * @property message - Mensaje descriptivo
 * @property isRead - Indica si la notificación ha sido leída
 * @property createdAt - Fecha de creación en formato ISO
 * @property link - Enlace opcional al recurso relacionado
 */
export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  link?: string | null;
}

/**
 * Preferencias de notificación del usuario.
 * @property emailEnabled - Notificaciones por correo habilitadas
 * @property pushEnabled - Notificaciones push en la aplicación habilitadas
 * @property typePreferences - Mapa de tipos de notificación a booleano de habilitación
 */
interface NotificationPreferences {
  emailEnabled: boolean;
  pushEnabled: boolean;
  typePreferences: Record<string, boolean>;
}

export const notificationsApi = {
  /**
   * Obtiene la lista de notificaciones del usuario.
   *
   * @param params - Parámetros opcionales de filtrado
   * @param params.unreadOnly - Solo notificaciones no leídas
   * @param params.limit - Máximo de resultados
   * @param params.offset - Desplazamiento para paginación
   * @returns Respuesta con lista de notificaciones y total
   */
  async list(params?: { unreadOnly?: boolean; limit?: number; offset?: number }) {
    const response = await api.get<{ success: boolean; notifications: NotificationItem[]; total: number }>('/notifications', { params });
    return response.data;
  },

  /**
   * Marca todas las notificaciones como leídas.
   *
   * @returns Respuesta con el número de notificaciones actualizadas
   */
  async markAllRead() {
    const response = await api.post<{ success: boolean; updated: number }>('/notifications/mark-all-read');
    return response.data;
  },

  /**
   * Marca una notificación específica como leída.
   *
   * @param notificationId - ID de la notificación
   * @returns Respuesta indicando éxito
   */
  async markAsRead(notificationId: string) {
    const response = await api.post<{ success: boolean }>(`/notifications/${notificationId}/read`);
    return response.data;
  },

  /**
   * Obtiene las preferencias de notificación del usuario.
   *
   * @returns Respuesta con las preferencias de notificación
   */
  async getPreferences() {
    const response = await api.get<{ success: boolean; data: NotificationPreferences }>('/notifications/preferences');
    return response.data;
  },

  /**
   * Actualiza las preferencias de notificación del usuario.
   *
   * @param input - Preferencias parciales a actualizar
   * @returns Respuesta con las preferencias actualizadas
   */
  async updatePreferences(input: Partial<NotificationPreferences>) {
    const response = await api.put<{ success: boolean; data: NotificationPreferences }>('/notifications/preferences', input);
    return response.data;
  },

  /**
   * Obtiene el número de notificaciones no leídas del usuario.
   *
   * @returns Cantidad de notificaciones sin leer
   */
  async getUnreadCount(): Promise<number> {
    const response = await api.get<{ success: boolean; count: number }>('/notifications/unread-count');
    return response.data.count;
  },
};
