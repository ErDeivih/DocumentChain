import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import {
  NotFoundError,
  UnauthorizedError,
  ValidationError,
  BlockchainError,
  IPFSError,
  ConflictError,
  LimitExceededError
} from '../utils/errors';

/**
 * Middleware de manejo de errores global
 * Debe colocarse al final de la cadena de middleware
 */
export function errorHandler(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Registrar error con contexto
  logger.error('Error en la petición', {
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    userId: req.user?.userId,
    ip: req.ip
  });

  // Errores personalizados
  if (error instanceof NotFoundError) {
    res.status(404).json({ error: error.message });
    return;
  }

  if (error instanceof UnauthorizedError) {
    res.status(401).json({ error: error.message });
    return;
  }

  if (error instanceof ValidationError) {
    res.status(400).json({ 
      error: error.message,
      field: error.field
    });
    return;
  }

  if (error instanceof BlockchainError) {
    res.status(500).json({ 
      error: error.message,
      transactionHash: error.transactionHash,
      code: error.code
    });
    return;
  }

  if (error instanceof IPFSError) {
    res.status(500).json({ 
      error: error.message,
      cid: error.cid
    });
    return;
  }

  if (error instanceof ConflictError) {
    res.status(409).json({ 
      error: error.message,
      field: error.field
    });
    return;
  }

  if (error instanceof LimitExceededError) {
    res.status(429).json({ 
      error: error.message,
      limit: error.limit,
      current: error.current
    });
    return;
  }

  // Error de tamaño de archivo de Multer
  if (error.code === 'LIMIT_FILE_SIZE') {
    res.status(400).json({ 
      error: 'Archivo demasiado grande',
      maxSize: '100MB' 
    });
    return;
  }

  // Error de cantidad de archivos de Multer
  if (error.code === 'LIMIT_FILE_COUNT') {
    res.status(400).json({ 
      error: 'Demasiados archivos',
      maxFiles: 10
    });
    return;
  }

  // Error de restricción única de Prisma
  if (error.code === 'P2002') {
    res.status(409).json({ 
      error: 'Ya existe un registro con este valor',
      field: error.meta?.target 
    });
    return;
  }

  // Registro no encontrado en Prisma
  if (error.code === 'P2025') {
    res.status(404).json({ error: 'Registro no encontrado' });
    return;
  }

  // Errores JWT
  if (error.name === 'JsonWebTokenError') {
    res.status(401).json({ error: 'Token inválido' });
    return;
  }

  if (error.name === 'TokenExpiredError') {
    res.status(401).json({ error: 'Token expirado' });
    return;
  }

  // Errores de validación
  if (error.name === 'ValidationError') {
    res.status(400).json({ 
      error: 'Validación fallida',
      details: error.message
    });
    return;
  }

  // Error por defecto
  res.status(error.status || 500).json({
    error: error.message || 'Error interno del servidor'
  });
}

/**
 * Manejador 404 para rutas no definidas
 */
export function notFoundHandler(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.path,
    method: req.method
  });
}

/**
 * Envoltorio de errores asíncronos
 * Envuelve manejadores de ruta asíncronos para capturar errores
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
