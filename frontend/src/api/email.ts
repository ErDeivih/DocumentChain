import axios from 'axios';
import { api } from '../lib/api';

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