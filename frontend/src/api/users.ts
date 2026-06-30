/**
 * @fileoverview API de usuarios para el frontend.
 *
 * Gestiona operaciones de perfil, búsqueda de usuarios
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
  /** Dirección de la wallet principal (helper). */
  walletAddress?: string;
}

/** API de operaciones con usuarios. */
export const usersApi = {
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
    const user: User = response.data.user;
    // Extraer dirección de wallet principal como propiedad helper
    if (user.wallets && user.wallets.length > 0) {
      const primaryWallet = user.wallets.find(w => w.isPrimary) || user.wallets[0];
      user.walletAddress = primaryWallet.address;
    }
    return user;
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
