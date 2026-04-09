import winston from 'winston';
import path from 'path';
import fs from 'fs';

// Crear directorio de logs si no existe
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

/**
 * Contextos de flujo para tracking de casos de uso
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
  TWO_FACTOR = 'TWO_FACTOR',
  SECURITY = 'SECURITY',
}

// Formato JSON para archivos (producción)
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Formato colorizado para consola (desarrollo)
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

// Logger principal
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

// Console en desarrollo
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat,
  }));
}

/**
 * FlowLogger - Tracking de casos de uso completos
 * Permite seguir el flujo de una operación de principio a fin
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

  constructor(context: FlowContext, userId?: string) {
    this.flowId = `${context}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.context = context;
    this.userId = userId;
    this.startTime = Date.now();
  }

  /**
   * Log de inicio de flujo
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
   * Log de paso intermedio
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
   * Log de éxito
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
   * Log de error
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
   * Log de advertencia
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
   * Obtener flowId para correlación
   */
  getFlowId(): string {
    return this.flowId;
  }
}

// Niveles de log: error, warn, info, http, verbose, debug, silly

/**
 * Log de eventos blockchain
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
 * Log de errores blockchain
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
 * Log de errores IPFS
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
 * Log de actividad de usuario
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
 * Log de errores de autenticación
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
 * Wrapper para capturar errores en funciones async
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
        args: JSON.stringify(args)
      });
      throw error;
    }
  }) as T;
}

export default logger;
