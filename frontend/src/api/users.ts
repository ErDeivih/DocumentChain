/**
 * @fileoverview API de usuarios para el frontend.
 *
 * Gestiona operaciones de perfil, avatar, búsqueda de usuarios
 * y eliminación de cuenta.
 */

import { api } from '../lib/api';
import type { User } from '../types';

/**
 * Resultado de búsqueda de usuarios.
 */
export interface UserSearchResult {
  /** Identificador del usuario. */
  id: string;
  /** Nombre de usuario. */
  username: string;
  /** Nombre completo. */
  fullName: string | null;
  /** Correo electrónico. */
  email: string;
  /** URL del avatar. */
  avatarUrl?: string | null;
  /** Dirección de la wallet principal (helper). */
  walletAddress?: string;
}

/**
 * Respuesta de actualización de avatar.
 */
export interface UpdateAvatarResponse {
  /** URL del nuevo avatar. */
  avatarUrl: string;
}

/** API de operaciones con usuarios. */
export const usersApi = {
  /**
   * Obtiene el perfil del usuario actual.
   * @returns Datos del usuario.
   */
  getProfile: async (): Promise<User> => {
    const response = await api.get('/users/profile');
    return response.data.user;
  },

  /**
   * Actualiza el perfil del usuario.
   * @param data - Campos a actualizar (nombre, correo).
   * @returns Usuario actualizado.
   */
  updateProfile: async (data: { fullName?: string; email?: string }): Promise<User> => {
    const response = await api.put('/users/profile', data);
    return response.data.user;
  },

  /**
   * Sube o actualiza el avatar del usuario.
   * @param file - Archivo de imagen.
   * @returns URL del avatar actualizado.
   */
  updateAvatar: async (file: File): Promise<UpdateAvatarResponse> => {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await api.put('/users/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  /**
   * Elimina el avatar del usuario.
   * @returns Promesa vacía.
   */
  removeAvatar: async (): Promise<void> => {
    await api.delete('/users/me/avatar');
  },

  /**
   * Busca usuarios por nombre de usuario o correo.
   * @param query - Texto de búsqueda.
   * @returns Lista de usuarios coincidentes.
   */
  search: async (query: string): Promise<{ users: UserSearchResult[] }> => {
    const response = await api.get('/users/search', {
      params: { q: query }
    });
    return response.data;
  },

  /**
   * Obtiene un usuario por su ID incluyendo sus wallets.
   * @param userId - Identificador del usuario.
   * @returns Usuario con wallets y dirección principal como helper.
   */
  getUserById: async (userId: string): Promise<User> => {
    const response = await api.get(`/users/${userId}`);
    const user: User = response.data;
    // Extraer dirección de wallet principal como propiedad helper
    if (user.wallets && user.wallets.length > 0) {
      const primaryWallet = user.wallets.find(w => w.isPrimary) || user.wallets[0];
      user.walletAddress = primaryWallet.address;
    }
    return user;
  },

  /**
   * @deprecated Utilice getUserById en su lugar.
   * @param userId - Identificador del usuario.
   * @returns Usuario encontrado.
   */
  getById: async (userId: string): Promise<User> => {
    console.warn('usersApi.getById is deprecated. Use getUserById instead.');
    return usersApi.getUserById(userId);
  },

  /**
   * Elimina la cuenta del usuario.
   * @returns Promesa vacía.
   */
  deleteAccount: async (): Promise<void> => {
    await api.delete('/users/me');
  },
};

export default usersApi;
