/**
 * @fileoverview API de autenticación para el frontend.
 *
 * Gestiona el registro, inicio de sesión, cierre de sesión,
 * refresco de tokens y recuperación de contraseñas.
 */

import { api } from '../lib/api';
import type { AuthResponse, LoginRequest, LoginResponse, RegisterRequest, User } from '../types';

/**
 * API de autenticación — Solo autenticación tradicional.
 *
 * Los usuarios inician sesión con nombre de usuario/correo y contraseña.
 * Las wallets se utilizan ÚNICAMENTE para firmar transacciones blockchain,
 * NUNCA para autenticación.
 */
export const authApi = {
  /**
   * Registra un nuevo usuario.
   *
   * El backend genera un par de claves RSA y cifra la clave privada
   * con la contraseña proporcionada.
   *
   * @param data - Datos de registro.
   * @returns Respuesta de autenticación con tokens.
   */
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  /**
   * Inicia sesión con nombre de usuario y contraseña.
   * @param data - Credenciales de inicio de sesión.
   * @returns Respuesta de autenticación.
   */
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', data);
    return response.data;
  },

  /**
   * Cierra la sesión del usuario.
   * @param refreshToken - Token de refresco a invalidar.
   * @returns Promesa vacía.
   */
  logout: async (refreshToken: string): Promise<void> => {
    await api.post('/auth/logout', { refreshToken });
  },

  /**
   * Refresca el token de acceso.
   * @param refreshToken - Token de refresco válido.
   * @returns Nuevo token de acceso y tiempo de expiración.
   */
  refresh: async (refreshToken: string): Promise<{ accessToken: string; expiresIn: number }> => {
    const response = await api.post<{ accessToken: string; expiresIn: number }>('/auth/refresh', { refreshToken });
    return response.data;
  },

  /**
   * Obtiene la información del usuario autenticado.
   * @returns Datos del usuario actual.
   */
  getMe: async (): Promise<{ user: User }> => {
    const response = await api.get<{ user: User }>('/auth/me');
    return response.data;
  },

  /**
   * Cambia la contraseña del usuario.
   * @param currentPassword - Contraseña actual.
   * @param newPassword - Nueva contraseña.
   * @returns Promesa vacía.
   */
  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await api.post('/auth/change-password', {
      currentPassword,
      newPassword
    });
  },

  /**
   * Solicita un correo de recuperación de contraseña.
   * @param email - Correo electrónico del usuario.
   * @returns Mensaje de confirmación.
   */
  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/forgot-password', { email });
    return response.data;
  },

  /**
   * Restablece la contraseña mediante token de recuperación.
   * @param data - Token, clave de recuperación y nueva contraseña.
   * @returns Mensaje de confirmación.
   */
  resetPassword: async (data: { token: string; recoveryKey: string; newPassword: string }): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/reset-password', data);
    return response.data;
  }
};

/** Alias de {@link authApi.changePassword}. */
export const changePassword = authApi.changePassword;
