import { api } from '../lib/api';

/**
 * Estadísticas del sistema para el panel de administración.
 */
export interface AdminSystemStats {
  /** Número total de usuarios registrados. */
  totalUsers: number;
  /** Número total de administradores. */
  totalAdmins: number;
  /** Número total de usuarios regulares. */
  totalRegularUsers: number;
  /** Número total de documentos. */
  totalDocuments: number;
  /** Lista de usuarios registrados recientemente. */
  recentUsers: Array<{
    /** Nombre de usuario. */
    username: string;
    /** Correo electrónico. */
    email: string;
    /** Rol del usuario. */
    role: 'USER' | 'ADMIN';
    /** Fecha de creación en formato ISO. */
    createdAt: string;
  }>;
}

/** API de administración del sistema. */
export const adminApi = {
  /**
   * Obtiene las estadísticas generales del sistema.
   * @returns Estadísticas del sistema.
   */
  getSystemStats: async (): Promise<{ stats: AdminSystemStats }> => {
    const response = await api.get<{ stats: AdminSystemStats }>('/admin/stats');
    return response.data;
  },

  /**
   * Obtiene la lista de todos los usuarios.
   * @returns Lista de usuarios.
   */
  getAllUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },

  /**
   * Actualiza el rol de un usuario.
   * @param userId - Identificador del usuario.
   * @param role - Nuevo rol ('USER' o 'ADMIN').
   * @returns Resultado de la operación.
   */
  updateUserRole: async (userId: string, role: 'USER' | 'ADMIN') => {
    const response = await api.put(`/admin/users/${userId}/role`, { role });
    return response.data;
  },

  /**
   * Crea un nuevo usuario administrador.
   * @param data - Datos del usuario a crear.
   * @param data.username - Nombre de usuario.
   * @param data.email - Correo electrónico.
   * @param data.password - Contraseña.
   * @param data.fullName - Nombre completo.
   * @returns Usuario creado.
   */
  createAdminUser: async (data: {
    username: string;
    email: string;
    password: string;
    fullName: string;
    publicKey?: string;
    encryptedPrivateKey?: string;
    salt?: string;
    recoveryKeyHash?: string;
    encryptedPrivateKeyRecovery?: string;
    recoveryKeySalt?: string;
  }) => {
    const response = await api.post('/admin/users', data);
    return response.data;
  },

  /**
   * Elimina un usuario del sistema.
   * @param userId - Identificador del usuario.
   * @returns Resultado de la operación.
   */
  deleteUser: async (userId: string) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },

};
