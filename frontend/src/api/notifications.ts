import { api } from '../lib/api';

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  link?: string | null;
}

export interface NotificationPreferences {
  emailEnabled: boolean;
  pushEnabled: boolean;
  typePreferences: Record<string, boolean>;
}

export const notificationsApi = {
  async list(params?: { unreadOnly?: boolean; limit?: number; offset?: number }) {
    const response = await api.get<{ success: boolean; notifications: NotificationItem[]; total: number }>('/notifications', { params });
    return response.data;
  },

  async markAllRead() {
    const response = await api.post<{ success: boolean; updated: number }>('/notifications/mark-all-read');
    return response.data;
  },

  async markRead(id: string) {
    const response = await api.post<{ success: boolean }>(`/notifications/${id}/read`);
    return response.data;
  },

  async getPreferences() {
    const response = await api.get<{ success: boolean; data: NotificationPreferences }>('/notifications/preferences');
    return response.data;
  },

  async updatePreferences(input: Partial<NotificationPreferences>) {
    const response = await api.put<{ success: boolean; data: NotificationPreferences }>('/notifications/preferences', input);
    return response.data;
  },
};
