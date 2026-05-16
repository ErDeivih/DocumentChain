import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import type { ApiError } from '../types';

/** URL base del API, obtenida de variables de entorno o resuelta relativa a `/api`. */
const API_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Instancia configurada de Axios para comunicación con el backend.
 *
 * Incluye interceptores para inyección de token y manejo de errores,
 * reintentos ante código 429 y refresco automático de sesión ante 401.
 */
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Importante para CORS con credentials
});

/**
 * Configuración extendida de peticiones Axios que permite definir
 * comportamiento de reintento ante respuesta 429 (Too Many Requests).
 */
export interface RetryableRequestConfig<D = any> extends AxiosRequestConfig<D> {
  /** Indica si se debe reintentar la petición ante un 429. */
  retryOn429?: boolean;
  /** Número máximo de intentos de reintento por 429. */
  retryOn429MaxAttempts?: number;
}

/** Indica si actualmente se está refrescando el token de acceso. */
let isRefreshing = false;

/** Cola de peticiones fallidas que esperan la resolución del refresco de token. */
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

/**
 * Procesa la cola de peticiones pendientes tras un intento de refresco.
 *
 * @param error - Error ocurrido durante el refresco; si es nulo, se reintentan las peticiones.
 * @param token - Nuevo token de acceso a inyectar en las peticiones reintentadas.
 */
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

// Interceptor de peticiones: añade el token de autorización si está disponible.
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

// Interceptor de respuestas: maneja 429 (reintentos) y 401 (refresco de token).
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
      _retry429Count?: number;
    } & RetryableRequestConfig;

    // No intentar refrescar token en endpoints de autenticación
    const isAuthEndpoint = originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/register') ||
      originalRequest.url?.includes('/auth/forgot-password') ||
      originalRequest.url?.includes('/auth/reset-password') ||
      originalRequest.url?.includes('/auth/refresh');

    // Reintento ante 429 (Too Many Requests)
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

    // Refresco automático de token ante 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        // Encolar petición hasta que finalice el refresco
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
        // Sin token de refresco: limpiar datos y notificar a AuthContext
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');

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

        // Fallo al refrescar: limpiar sesión y notificar a AuthContext
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');

        window.dispatchEvent(new CustomEvent('auth:logout'));

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Mapea mensajes de error de blockchain a descripciones localizadas en español.
 *
 * @param message - Mensaje original del error.
 * @returns Mensaje localizado, o `null` si no hay coincidencia.
 */
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

/**
 * Extrae un mensaje de error legible a partir de cualquier valor de error.
 *
 * - Si es un error Axios, intenta obtener el mensaje del backend o devuelve
   un texto según el código de estado HTTP.
 * - Si es un error de blockchain, lo mapea a un mensaje localizado.
 * - En cualquier otro caso, devuelve el mensaje original o un texto genérico.
 *
 * @param error - Error capturado (puede ser de Axios, blockchain o genérico).
 * @returns Mensaje descriptivo en español.
 */
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

    // Nunca exponer errores técnicos/códigos de estado crudos al usuario
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
