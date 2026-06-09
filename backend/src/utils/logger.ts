import winston from 'winston';
import path from 'path';
import fs from 'fs';

// Crear directorio de logs si no existe
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

/**
 * Enumeración con los contextos de flujo disponibles para el seguimiento de casos de uso.
 */
export enum FlowContext {
  AUTH = 'AUTH',
  FILE_UPLOAD = 'FILE_UPLOAD',
  FILE_DOWNLOAD = 'FILE_DOWNLOAD',
  FILE_DELETE = 'FILE_DELETE',
  FILE_SHARE = 'FILE_SHARE',
  FILE_VERSION = 'FILE_VERSION',
  SIGNATURE = 'SIGNATURE',
  BLOCKCHAIN = 'BLOCKCHAIN',
  IPFS = 'IPFS',
  ENCRYPTION = 'ENCRYPTION',
  NOTIFICATION = 'NOTIFICATION',
  SEARCH = 'SEARCH',
  QUOTA = 'QUOTA',
  WALLET = 'WALLET',
  RECOVERY = 'RECOVERY',
  GDPR = 'GDPR',
  ADMIN = 'ADMIN',
  SECURITY = 'SECURITY',
}

/**
 * Formato JSON para los archivos de log en entornos de producción.
 */
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

/**
 * Formato colorizado para la salida de logs por consola en entornos de desarrollo.
 */
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, context, flowId, userId, action, ...meta }) => {
    let log = `${timestamp} [${level}]`;
    
    // Agregar contexto de flujo
    if (flowId) log += ` [Flow: ${flowId}]`;
    if (userId) log += ` [User: ${userId}]`;
    if (context) log += ` [${context}]`;
    if (action) log += ` [${action}]`;
    
    log += `: ${message}`;
    
    // Metadata adicional
    const metaKeys = Object.keys(meta).filter(k => !['service', 'timestamp', 'level'].includes(k));
    if (metaKeys.length > 0) {
      const metaFiltered: Record<string, any> = {};
      metaKeys.forEach(k => metaFiltered[k] = meta[k]);
      log += ` ${JSON.stringify(metaFiltered)}`;
    }
    
    return log;
  })
);

/**
 * Logger principal de Winston configurado con transportes para archivos y consola.
 */
export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  defaultMeta: { service: 'decentralizedfs-api' },
  transports: [
    // Error logs (solo errores)
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880,  // 5MB
      maxFiles: 5,
    }),
    
    // Combined logs (todos los niveles)
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880,
      maxFiles: 10,
    }),
    
    // Flow logs (trazabilidad de casos de uso)
    new winston.transports.File({
      filename: path.join(logsDir, 'flows.log'),
      level: 'info',
      maxsize: 5242880,
      maxFiles: 3,
    }),
    
    // Blockchain logs
    new winston.transports.File({
      filename: path.join(logsDir, 'blockchain.log'),
      level: 'info',
      maxsize: 5242880,
      maxFiles: 5,
    }),
  ],
  
  exitOnError: false,
});

/**
 * Añade el transporte de consola cuando el entorno no es producción.
 */
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat,
  }));
}

/**
 * Logger de flujo que permite realizar un seguimiento completo de una operación
 * desde su inicio hasta su finalización.
 *
 * @example
 * const flow = new FlowLogger(FlowContext.FILE_UPLOAD, userId);
 * flow.start('upload', { filename: 'doc.pdf' });
 * flow.step('encrypt-file');
 * flow.step('upload-ipfs', { cid });
 * flow.success({ fileId: '123' });
 */
export class FlowLogger {
  private flowId: string;
  private context: FlowContext;
  private userId?: string;
  private startTime: number;

  /**
   * Crea una nueva instancia de `FlowLogger`.
   *
   * @param context - Contexto de flujo que identifica el caso de uso.
   * @param userId - Identificador opcional del usuario asociado al flujo.
   */
  constructor(context: FlowContext, userId?: string) {
    this.flowId = `${context}-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    this.context = context;
    this.userId = userId;
    this.startTime = Date.now();
  }

  /**
   * Registra el inicio de un flujo de operaciones.
   *
   * @param action - Nombre de la acción que inicia el flujo.
   * @param data - Datos adicionales opcionales a registrar.
   */
  start(action: string, data?: any): void {
    logger.info(`Iniciando flujo ${this.context}`, {
      flowId: this.flowId,
      context: this.context,
      userId: this.userId,
      action,
      ...data,
    });
  }

  /**
   * Registra un paso intermedio dentro del flujo.
   *
   * @param step - Nombre del paso ejecutado.
   * @param data - Datos adicionales opcionales a registrar.
   */
  step(step: string, data?: any): void {
    logger.info(`${this.context} - ${step}`, {
      flowId: this.flowId,
      context: this.context,
      userId: this.userId,
      action: step,
      duration: Date.now() - this.startTime,
      ...data,
    });
  }

  /**
   * Registra la finalización exitosa del flujo.
   *
   * @param result - Resultado opcional de la operación.
   */
  success(result?: any): void {
    logger.info(`${this.context} completado exitosamente`, {
      flowId: this.flowId,
      context: this.context,
      userId: this.userId,
      duration: Date.now() - this.startTime,
      result,
    });
  }

  /**
   * Registra un error ocurrido durante la ejecución del flujo.
   *
   * @param error - Instancia del error producido.
   * @param data - Datos adicionales opcionales a registrar.
   */
  error(error: Error, data?: any): void {
    logger.error(`${this.context} falló`, {
      flowId: this.flowId,
      context: this.context,
      userId: this.userId,
      duration: Date.now() - this.startTime,
      error: error.message,
      stack: error.stack,
      ...data,
    });
  }

  /**
   * Registra una advertencia dentro del flujo.
   *
   * @param message - Mensaje descriptivo de la advertencia.
   * @param data - Datos adicionales opcionales a registrar.
   */
  warn(message: string, data?: any): void {
    logger.warn(`${this.context} - ${message}`, {
      flowId: this.flowId,
      context: this.context,
      userId: this.userId,
      duration: Date.now() - this.startTime,
      ...data,
    });
  }

  /**
   * Obtiene el identificador único del flujo para correlación entre logs.
   *
   * @returns Cadena con el identificador del flujo.
   */
  getFlowId(): string {
    return this.flowId;
  }
}

/**
 * Registra un evento relacionado con la blockchain.
 *
 * @param eventType - Tipo de evento ocurrido.
 * @param data - Datos asociados al evento (hash de transacción, número de bloque, gas usado, etc.).
 */
export function logBlockchainEvent(
  eventType: string,
  data: {
    transactionHash?: string;
    blockNumber?: number;
    gasUsed?: string;
    [key: string]: any;
  }
) {
  logger.info(`[BLOCKCHAIN] ${eventType}`, {
    ...data,
    category: 'blockchain'
  });
}

/**
 * Registra un error ocurrido durante una operación blockchain.
 *
 * @param operation - Nombre de la operación que falló.
 * @param error - Instancia del error producido.
 * @param metadata - Metadatos adicionales opcionales.
 */
export function logBlockchainError(
  operation: string,
  error: Error,
  metadata?: any
) {
  logger.error(`[BLOCKCHAIN ERROR] ${operation}: ${error.message}`, {
    error: error.message,
    stack: error.stack,
    metadata,
    category: 'blockchain-error'
  });
}

/**
 * Registra un error ocurrido durante una operación IPFS.
 *
 * @param operation - Nombre de la operación que falló.
 * @param error - Instancia del error producido.
 * @param cid - Identificador de contenido (CID) afectado, si aplica.
 */
export function logIPFSError(
  operation: string,
  error: Error,
  cid?: string
) {
  logger.error(`[IPFS ERROR] ${operation}: ${error.message}`, {
    error: error.message,
    stack: error.stack,
    cid,
    category: 'ipfs-error'
  });
}

/**
 * Registra una actividad realizada por un usuario.
 *
 * @param userId - Identificador del usuario.
 * @param action - Descripción de la acción realizada.
 * @param metadata - Metadatos adicionales opcionales.
 */
export function logUserActivity(
  userId: string,
  action: string,
  metadata?: any
) {
  logger.info(`[USER ACTIVITY] ${action}`, {
    userId,
    ...metadata,
    category: 'user-activity'
  });
}

/**
 * Registra un error ocurrido durante el proceso de autenticación.
 *
 * @param action - Acción que intentaba realizar el usuario.
 * @param error - Mensaje descriptivo del error.
 * @param metadata - Metadatos adicionales opcionales.
 */
export function logAuthError(
  action: string,
  error: string,
  metadata?: any
) {
  logger.warn(`[AUTH] ${action}: ${error}`, {
    error,
    ...metadata,
    category: 'auth'
  });
}

/**
 * Envoltura que captura y registra automáticamente errores en funciones asíncronas.
 *
 * @param fn - Función asíncrona a envolver.
 * @param context - Contexto descriptivo para los mensajes de log.
 * @returns Función envuelta con el mismo tipo que la original.
 */
export function withLogging<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context: string
): T {
  return (async (...args: any[]) => {
    try {
      logger.debug(`[${context}] Iniciando...`);
      const result = await fn(...args);
      logger.debug(`[${context}] Completado exitosamente`);
      return result;
    } catch (error: any) {
      logger.error(`[${context}] Error: ${error.message}`, {
        error: error.message,
        stack: error.stack,
        args: args.map((a: any) => typeof a).join(', ')
      });
      throw error;
    }
  }) as T;
}

export default logger;
