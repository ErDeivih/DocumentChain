import { api } from '../lib/api';
import type { UserStats, SystemStats, DocumentStats } from '../types';

export const statsApi = {
  getMyStats: async (): Promise<{ stats: UserStats }> => {
    const response = await api.get<{ stats: UserStats }>('/stats/me');
    return response.data;
  },

  getSystemStats: async (): Promise<{ stats: SystemStats }> => {
    const response = await api.get<{ stats: SystemStats }>('/stats/system');
    return response.data;
  },

  getDocumentStats: async (documentId: string): Promise<{ stats: DocumentStats }> => {
    const response = await api.get<{ stats: DocumentStats }>(`/documents/${documentId}/stats`);
    return response.data;
  },

  getTopDocuments: async (metric: 'size' | 'versions' | 'signatures' | 'shares', limit = 10) => {
    const response = await api.get('/stats/top-documents', {
      params: { metric, limit }
    });
    return response.data;
  }
};

// Aliases for backward compatibility
export const getUserStats = statsApi.getMyStats;
export const getSystemStats = statsApi.getSystemStats;
export const getDocumentStats = statsApi.getDocumentStats;
