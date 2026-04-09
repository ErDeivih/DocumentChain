/**
 * API client for Two-Factor Authentication (2FA)
 */

import { api } from '../lib/api';
import type { AuthResponse } from '../types';

export interface TwoFactorSetup {
  secret: string;
  qrCode: string;
  backupCodes: string[];
  otpauthUrl: string;
}

export interface TwoFactorStatus {
  enabled: boolean;
  hasBackupCodes: boolean;
  remainingBackupCodes?: number;
}

export const twoFactorApi = {
  /**
   * Get 2FA status for current user
   */
  getStatus: async (): Promise<TwoFactorStatus> => {
    const response = await api.get('/auth/2fa/status');
    return response.data;
  },

  /**
   * Setup 2FA - Generate secret and QR code
   */
  setup: async (): Promise<TwoFactorSetup> => {
    const response = await api.post('/auth/2fa/setup');
    return response.data;
  },

  /**
   * Enable 2FA after verifying TOTP code
   */
  enable: async (token: string): Promise<{ message: string; backupCodes: string[] }> => {
    const response = await api.post<{ message: string; backupCodes: string[] }>('/auth/2fa/enable', { token });
    return response.data;
  },

  /**
   * Disable 2FA
   */
  disable: async (token: string): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/2fa/disable', { token });
    return response.data;
  },

  /**
   * Regenerate backup codes
   */
  regenerateBackupCodes: async (token: string): Promise<{ message: string; backupCodes: string[] }> => {
    const response = await api.post<{ message: string; backupCodes: string[] }>('/auth/2fa/regenerate-backup-codes', { token });
    return response.data;
  },

  /**
   * Verify TOTP or backup code during login
   */
  verify: async (tempToken: string, token: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/2fa/verify', { tempToken, token });
    return response.data;
  },
};
