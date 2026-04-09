import { api } from '../lib/api';

export interface AdminSystemStats {
  totalUsers: number;
  totalAdmins: number;
  totalRegularUsers: number;
  totalDocuments: number;
  totalStorageUsed: string;
  recentUsers: Array<{
    username: string;
    email: string;
    role: 'USER' | 'ADMIN';
    createdAt: string;
  }>;
}

export const adminApi = {
  getSystemStats: async (): Promise<{ stats: AdminSystemStats }> => {
    const response = await api.get<{ stats: AdminSystemStats }>('/admin/stats');
    return response.data;
  },

  getAllUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },

  updateUserRole: async (userId: string, role: 'USER' | 'ADMIN') => {
    const response = await api.put(`/admin/users/${userId}/role`, { role });
    return response.data;
  },

  createAdminUser: async (data: {
    username: string;
    email: string;
    password: string;
    fullName: string;
  }) => {
    const response = await api.post('/admin/users', data);
    return response.data;
  },

  deleteUser: async (userId: string) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },

  suspendUser: async (userId: string, reason?: string) => {
    const response = await api.put(`/admin/users/${userId}/suspend`, { reason });
    return response.data;
  },

  unsuspendUser: async (userId: string) => {
    const response = await api.put(`/admin/users/${userId}/unsuspend`);
    return response.data;
  },
};
