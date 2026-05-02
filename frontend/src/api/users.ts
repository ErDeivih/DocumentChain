/**
 * API de Usuarios
 */

import { api } from '../lib/api';
import type { User } from '../types';

export interface UserSearchResult {
  id: string;
  username: string;
  fullName: string | null;
  email: string;
  avatarUrl?: string | null;
  // Helper for getting primary wallet address
  walletAddress?: string;
}

export interface UpdateAvatarResponse {
  avatarUrl: string;
}

export interface UserSuspensionPreparation {
  action: 'suspend' | 'unsuspend';
  method: 'suspendMyself' | 'unsuspendMyself';
  contractAddress: string;
  wallet: {
    id: string;
    address: string;
    label: string | null;
  };
  currentDbSuspended: boolean;
  currentOnChainSuspended: boolean;
  reason: string | null;
}

export interface UserSuspensionConfirmation {
  success: boolean;
  message: string;
  txHash: string;
  user: User;
}

export const usersApi = {
  /**
   * Obtener perfil del usuario actual
   */
  getProfile: async (): Promise<User> => {
    const response = await api.get('/users/profile');
    return response.data.user;
  },

  /**
   * Actualizar perfil
   */
  updateProfile: async (data: { fullName?: string; email?: string }): Promise<User> => {
    const response = await api.put('/users/profile', data);
    return response.data.user;
  },

  /**
   * Subir avatar
   */
  updateAvatar: async (file: File): Promise<UpdateAvatarResponse> => {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await api.put('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  /**
   * Eliminar avatar
   */
  removeAvatar: async (): Promise<void> => {
    await api.delete('/users/avatar');
  },

  /**
   * Buscar usuarios
   */
  search: async (query: string): Promise<{ users: UserSearchResult[] }> => {
    const response = await api.get('/users/search', {
      params: { q: query }
    });
    return response.data;
  },

  /**
   * Obtener usuario por ID con wallets
   */
  getUserById: async (userId: string): Promise<User> => {
    const response = await api.get(`/users/${userId}`);
    const user: User = response.data;
    // Extract primary wallet address as helper property
    if (user.wallets && user.wallets.length > 0) {
      const primaryWallet = user.wallets.find(w => w.isPrimary) || user.wallets[0];
      user.walletAddress = primaryWallet.address;
    }
    return user;
  },

  /**
   * DEPRECATED: Use getUserById instead
   */
  getById: async (userId: string): Promise<User> => {
    console.warn('usersApi.getById is deprecated. Use getUserById instead.');
    return usersApi.getUserById(userId);
  },

  prepareSuspendMe: async (reason?: string): Promise<UserSuspensionPreparation> => {
    const response = await api.post('/users/me/suspend/prepare', { reason });
    return response.data;
  },

  confirmSuspendMe: async (txHash: string, reason?: string): Promise<UserSuspensionConfirmation> => {
    const response = await api.post('/users/me/suspend/confirm', { txHash, reason });
    return response.data;
  },

  prepareUnsuspendMe: async (): Promise<UserSuspensionPreparation> => {
    const response = await api.post('/users/me/unsuspend/prepare');
    return response.data;
  },

  confirmUnsuspendMe: async (txHash: string): Promise<UserSuspensionConfirmation> => {
    const response = await api.post('/users/me/unsuspend/confirm', { txHash });
    return response.data;
  },

  deleteAccount: async (txHash: string): Promise<void> => {
    await api.delete('/users/me', { data: { txHash } });
  },
};

export default usersApi;
