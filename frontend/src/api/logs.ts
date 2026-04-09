/**
 * API client for System Logs (Admin only)
 */

import { api } from '../lib/api';

export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  metadata?: Record<string, any>;
}

export interface LogStats {
  file: string;
  size: number;
  lines: number;
  modified: string;
}

export const logsApi = {
  /**
   * Get recent logs
   * @param type - 'combined' | 'error' | 'blockchain'
   * @param lines - Number of lines to fetch (max 1000)
   */
  getLogs: async (type: string = 'combined', lines: number = 100): Promise<{ logs: LogEntry[]; count: number }> => {
    const response = await api.get(`/logs?type=${type}&lines=${lines}`);
    return response.data;
  },

  /**
   * Get log file statistics
   */
  getLogStats: async (): Promise<{ stats: LogStats[] }> => {
    const response = await api.get('/logs/stats');
    return response.data;
  },

  /**
   * Clear logs (admin only)
   * @param type - 'combined' | 'error' | 'blockchain' | 'all'
   */
  clearLogs: async (type: string): Promise<{ message: string }> => {
    const response = await api.post('/logs/clear', { type });
    return response.data;
  },

  /**
   * Log error from client
   */
  logClientError: async (error: any, message: string, stack?: string, context?: any): Promise<void> => {
    await api.post('/logs/client-error', { error, message, stack, context });
  },
};
