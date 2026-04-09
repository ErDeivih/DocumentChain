import { api } from '../lib/api';

export interface Notification {
  id: string;
  userId: string;
  type:
    | 'DOCUMENT_CREATED'
    | 'DOCUMENT_SHARED'
    | 'DOCUMENT_SIGNED'
    | 'VERSION_CREATED'
    | 'PERMISSION_GRANTED'
    | 'PERMISSION_REVOKED'
    | 'SYSTEM'
    | 'FILE_SHARED'
    | 'FILE_UPLOADED'
    | 'FILE_SIGNED'
    | 'FILE_UPDATED'
    | 'FILE_ARCHIVED'
    | 'SHARE_REVOKED'
    | 'BLOCKCHAIN_CONFIRMED'
    | 'NEW_VERSION';
  title: string;
  message: string;
  relatedDocumentId?: string;
  link?: string;
  data?: Record<string, any>;
  metadata?: Record<string, any>;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface NotificationPreference {
  id: string;
  userId: string;
  emailEnabled: boolean;
  pushEnabled: boolean;
  typePreferences: Record<string, boolean>;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  total: number;
  unread: number;
}

/**
 * Get user notifications with pagination and filters
 */
export const getNotifications = async (params?: {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
  type?: string;
}): Promise<NotificationsResponse> => {
  const take = params?.limit;
  const skip = params?.page && params.limit ? (params.page - 1) * params.limit : undefined;

  const response = await api.get('/notifications', {
    params: {
      take,
      skip,
      type: params?.type,
      isRead: params?.unreadOnly ? 'false' : undefined,
    },
  });
  return response.data;
};

/**
 * Get count of unread notifications
 */
export const getUnreadCount = async (): Promise<{ count: number }> => {
  const response = await api.get('/notifications/unread-count');
  return response.data.data; // Backend returns { success, data: { count } }
};

/**
 * Mark a notification as read
 */
export const markAsRead = async (id: string): Promise<void> => {
  await api.post(`/notifications/${id}/read`);
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (): Promise<void> => {
  await api.post('/notifications/mark-all-read');
};

/**
 * Delete a notification
 */
export const deleteNotification = async (id: string): Promise<void> => {
  await api.delete(`/notifications/${id}`);
};

/**
 * Get user notification preferences
 */
export const getNotificationPreferences = async (): Promise<NotificationPreference> => {
  const response = await api.get('/notifications/preferences');
  return response.data.data;
};

/**
 * Update notification preferences
 */
export const updateNotificationPreferences = async (
  preferences: Partial<Omit<NotificationPreference, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
): Promise<NotificationPreference> => {
  const response = await api.put('/notifications/preferences', preferences);
  return response.data.data;
};
