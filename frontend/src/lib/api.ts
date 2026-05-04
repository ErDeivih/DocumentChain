import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import type { ApiError } from '../types';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Importante para CORS con credentials
});

export interface RetryableRequestConfig<D = any> extends AxiosRequestConfig<D> {
  retryOn429?: boolean;
  retryOn429MaxAttempts?: number;
}

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
      _retry429Count?: number;
    } & RetryableRequestConfig;

    // Don't attempt to refresh token for auth endpoints
    const isAuthEndpoint = originalRequest.url?.includes('/auth/login') || 
                           originalRequest.url?.includes('/auth/2fa/verify') ||
                           originalRequest.url?.includes('/auth/register') ||
                           originalRequest.url?.includes('/auth/forgot-password') ||
                           originalRequest.url?.includes('/auth/reset-password') ||
                           originalRequest.url?.includes('/auth/refresh');

    if (
      error.response?.status === 429 &&
      (originalRequest.method?.toLowerCase() === 'get' || originalRequest.retryOn429)
    ) {
      const retryCount = originalRequest._retry429Count ?? 0;
      const maxRetryAttempts = originalRequest.retryOn429MaxAttempts ?? 2;

      if (retryCount < maxRetryAttempts) {
        originalRequest._retry429Count = retryCount + 1;

        const retryAfterHeader = error.response.headers?.['retry-after'];
        const retryAfterSeconds = Number(retryAfterHeader);
        const retryDelayMs = Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0
          ? retryAfterSeconds * 1000
          : 750 * (retryCount + 1);

        await new Promise((resolve) => window.setTimeout(resolve, retryDelayMs));
        return api(originalRequest);
      }
    }

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        // Queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        // No refresh token - clear auth data and let ProtectedRoute handle redirect
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        // Trigger a custom event to notify AuthContext
        window.dispatchEvent(new CustomEvent('auth:logout'));
        
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
        const { accessToken } = response.data;

        localStorage.setItem('accessToken', accessToken);
        window.dispatchEvent(new CustomEvent('auth:token-refreshed', {
          detail: { accessToken },
        }));

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        processQueue(null, accessToken);

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);

        // Refresh failed - clear auth data and let ProtectedRoute handle redirect
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        // Trigger a custom event to notify AuthContext
        window.dispatchEvent(new CustomEvent('auth:logout'));

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

function mapBlockchainError(message: string): string | null {
  const m = message.toLowerCase();
  if (m.includes('user denied') || m.includes('rejected') || m.includes('cancelled') || m.includes('user rejected')) {
    return 'Operación cancelada. Rechazaste la transacción en tu wallet.';
  }
  if (m.includes('already signed') || m.includes('ya has firmado')) {
    return 'Ya has firmado esta versión del documento. No es necesario firmar de nuevo.';
  }
  if (m.includes('already shared') || m.includes('ya compartido')) {
    return 'Este documento ya está compartido con ese usuario.';
  }
  if (m.includes('not owner') || m.includes('no eres el propietario')) {
    return 'No eres el propietario de este documento. Solo el OWNER puede realizar esta acción.';
  }
  if (m.includes('no read permission') || m.includes('not authorized')) {
    return 'No tienes permiso para realizar esta acción sobre el documento.';
  }
  if (m.includes('document not found') || m.includes('does not exist')) {
    return 'El documento no existe en el contrato inteligente. Puede que aún no esté sincronizado con blockchain.';
  }
  if (m.includes('insufficient funds')) {
    return 'No tienes suficientes fondos en tu wallet para cubrir el gas de la transacción.';
  }
  if (m.includes('nonce') || m.includes('replacement fee too low')) {
    return 'Error de sincronización con la blockchain. Intenta de nuevo en unos segundos.';
  }
  if (m.includes('network') || m.includes('disconnect') || m.includes('underlying network changed')) {
    return 'Error de conexión con la red blockchain. Verifica que tu nodo Hardhat esté activo y que estés en la red correcta.';
  }
  if (m.includes('gas required exceeds allowance') || m.includes('out of gas')) {
    return 'La transacción requiere más gas del disponible. Intenta con un límite de gas más alto.';
  }
  if (m.includes('execution reverted')) {
    return 'La transacción fue revertida por el contrato inteligente. Verifica los permisos y el estado del documento.';
  }
  return null;
}

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data as ApiError;
    const status = error.response?.status;

    if (
      apiError?.error &&
      typeof apiError.error === 'string' &&
      status !== undefined &&
      status < 500
    ) {
      return apiError.error;
    }

    // Never expose raw technical errors/status codes to end users
    if (status === 400) return 'No se pudo procesar la solicitud. Revise los datos e inténtelo de nuevo.';
    if (status === 401) return 'Tu sesión no es válida o ha expirado. Inicia sesión de nuevo.';
    if (status === 403) return 'No tienes permisos para realizar esta acción.';
    if (status === 404) return 'No se encontró la información solicitada.';
    if (status === 429) return 'Se han realizado demasiadas solicitudes en poco tiempo. Inténtalo de nuevo en unos segundos.';
    if (status === 409) return 'La operación no pudo completarse por un conflicto de datos.';
    if (status === 422) return 'Hay datos inválidos en el formulario. Revísalos e inténtalo de nuevo.';
    if (status && status >= 500) return 'Ha ocurrido un problema temporal en el servidor. Inténtalo en unos minutos.';

    if (apiError?.error) return 'No se pudo completar la operación. Inténtalo de nuevo.';
    return 'Ha ocurrido un error inesperado. Inténtalo de nuevo.';
  }
  if (error instanceof Error) {
    const blockchainMsg = mapBlockchainError(error.message);
    if (blockchainMsg) return blockchainMsg;
    return error.message || 'Ha ocurrido un error inesperado.';
  }
  return 'Ha ocurrido un error inesperado.';
}
