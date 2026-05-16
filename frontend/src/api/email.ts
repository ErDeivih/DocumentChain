import axios from 'axios';
import { api } from '../lib/api';

/**
 * Respuesta de verificación de correo electrónico.
 */
export interface VerifyEmailResponse {
  /** Indica si la verificación fue exitosa. */
  success: boolean;
  /** Mensaje descriptivo. */
  message: string;
  /** Nombre de usuario verificado. */
  username?: string;
}

/**
 * Estructura de error de la API de correo.
 */
interface EmailApiError {
  /** Tipo de error. */
  error?: string;
  /** Mensaje descriptivo. */
  message?: string;
}

/** API de verificación de correo electrónico. */
export const emailApi = {
  /**
   * Verifica una dirección de correo mediante token.
   * @param token - Token de verificación.
   * @returns Resultado de la verificación.
   */
  verifyEmail: async (token: string): Promise<VerifyEmailResponse> => {
    const response = await api.get<VerifyEmailResponse>(`/email/verify/${encodeURIComponent(token)}`);
    return response.data;
  },

  /**
   * Reenvía el correo de verificación.
   * @param email - Dirección de correo electrónico.
   * @returns Resultado de la operación.
   */
  resendVerification: async (email: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post<{ success: boolean; message: string }>('/email/resend-verification', { email });
    return response.data;
  },
};

/**
 * Obtiene un mensaje de error legible a partir de una excepción de la API de correo.
 * @param error - Error capturado.
 * @returns Mensaje de error localizado.
 */
export function getEmailVerificationErrorMessage(error: unknown): string {
  if (axios.isAxiosError<EmailApiError>(error)) {
    return error.response?.data?.message || error.response?.data?.error || 'No se pudo verificar el email. Solicita un nuevo enlace.';
  }

  if (error instanceof Error) {
    return error.message || 'No se pudo verificar el email. Solicita un nuevo enlace.';
  }

  return 'No se pudo verificar el email. Solicita un nuevo enlace.';
}
