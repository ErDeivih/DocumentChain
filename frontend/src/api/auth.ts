import axios from 'axios';
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
   * El frontend genera el par de claves RSA y cifra la clave privada
   * con la contraseña y la clave de recuperación antes de enviarlas.
   *
   * @param data - Datos de registro incluyendo claves criptográficas.
   * @returns Respuesta de autenticación con tokens y recovery key.
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
   refresh: async (refreshToken: string): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> => {
     const response = await api.post<{ accessToken: string; refreshToken: string; expiresIn: number }>('/auth/refresh', { refreshToken });
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
   * Cambia la contraseña del usuario con la clave privada ya re-cifrada por el frontend.
   * @param currentPassword - Contraseña actual (para verificación server-side).
   * @param newEncryptedPrivateKey - Clave privada re-cifrada con la nueva contraseña.
   * @param newSalt - Nueva sal.
   * @param newPassword - Nueva contraseña en texto plano (el servidor la valida y hashea).
   * @returns Promesa vacía.
   */
  changePassword: async (currentPassword: string, newEncryptedPrivateKey: string, newSalt: string, newPassword: string): Promise<void> => {
    await api.post('/auth/change-password', {
      currentPassword,
      newEncryptedPrivateKey,
      newSalt,
      newPassword
    });
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/forgot-password', { email });
    return response.data;
  },

  /**
   * Verifica el token de restablecimiento y la clave de recuperación.
   * @returns Datos de recuperación: encryptedPrivateKeyRecovery + recoveryKeySalt.
   */
  resetPasswordVerify: async (data: { token: string; recoveryKey: string }): Promise<{ encryptedPrivateKeyRecovery: string; recoveryKeySalt: string | null }> => {
    const response = await api.post<{ success: boolean; encryptedPrivateKeyRecovery: string; recoveryKeySalt: string | null }>('/auth/reset-password/verify', data);
    return response.data;
  },

  /**
   * Confirma el restablecimiento con la clave ya re-cifrada por el frontend.
   */
  resetPassword: async (data: { token: string; newEncryptedPrivateKey: string; newSalt: string; newPassword: string }): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/reset-password', data);
    return response.data;
  }
};

// ==================== VERIFICACIÓN DE EMAIL ====================

export interface VerifyEmailResponse {
  success: boolean;
  message: string;
  username?: string;
}

interface EmailApiError {
  error?: string;
  message?: string;
}

export const emailApi = {
  verifyEmail: async (token: string): Promise<VerifyEmailResponse> => {
    const response = await api.get<VerifyEmailResponse>(`/email/verify/${encodeURIComponent(token)}`);
    return response.data;
  },
  resendVerification: async (email: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post<{ success: boolean; message: string }>('/email/resend-verification', { email });
    return response.data;
  },
};

export function getEmailVerificationErrorMessage(error: unknown): string {
  if (axios.isAxiosError<EmailApiError>(error)) {
    return error.response?.data?.message || error.response?.data?.error || 'No se pudo verificar el email. Solicita un nuevo enlace.';
  }
  if (error instanceof Error) {
    return error.message || 'No se pudo verificar el email. Solicita un nuevo enlace.';
  }
  return 'No se pudo verificar el email. Solicita un nuevo enlace.';
}

/** Alias de {@link authApi.changePassword}. */
export const changePassword = authApi.changePassword;
