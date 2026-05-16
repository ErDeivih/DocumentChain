/**
 * Cliente API de Registros del Sistema (solo administradores).
 */

import { api } from '../lib/api';

/**
 * Entrada de registro del sistema.
 */
export interface LogEntry {
  /** Marca temporal del evento. */
  timestamp: string;
  /** Nivel de severidad. */
  level: string;
  /** Mensaje del registro. */
  message: string;
  /** Metadatos adicionales. */
  metadata?: Record<string, any>;
}

/**
 * Estadísticas de un archivo de registro.
 */
export interface LogStats {
  /** Nombre del archivo. */
  file: string;
  /** Tamaño en bytes. */
  size: number;
  /** Número de líneas. */
  lines: number;
  /** Fecha de última modificación. */
  modified: string;
}

/** API de registros del sistema. */
export const logsApi = {
  /**
   * Obtiene los registros recientes.
   * @param type - Tipo de registro ('combined' | 'error' | 'blockchain').
   * @param lines - Número de líneas a obtener (máx. 1000).
   * @returns Lista de registros y conteo.
   */
  getLogs: async (type: string = 'combined', lines: number = 100): Promise<{ logs: LogEntry[]; count: number }> => {
    const response = await api.get(`/logs?type=${type}&lines=${lines}`);
    return response.data;
  },

  /**
   * Obtiene estadísticas de los archivos de registro.
   * @returns Estadísticas de archivos de registro.
   */
  getLogStats: async (): Promise<{ stats: LogStats[] }> => {
    const response = await api.get('/logs/stats');
    return response.data;
  },

  /**
   * Limpia los registros (solo administradores).
   * @param type - Tipo de registro a limpiar ('combined' | 'error' | 'blockchain' | 'all').
   * @returns Mensaje de confirmación.
   */
  clearLogs: async (type: string): Promise<{ message: string }> => {
    const response = await api.post('/logs/clear', { type });
    return response.data;
  },

  /**
   * Registra un error desde el cliente.
   * @param error - Error ocurrido.
   * @param message - Mensaje descriptivo.
   * @param stack - Traza de pila (opcional).
   * @param context - Contexto adicional (opcional).
   * @returns Promesa vacía.
   */
  logClientError: async (error: any, message: string, stack?: string, context?: any): Promise<void> => {
    await api.post('/logs/client-error', { error, message, stack, context });
  },
};
