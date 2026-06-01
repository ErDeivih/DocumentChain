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
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const errorLike = error instanceof Error ? error : new Error('Error desconocido');
  const codedError = error as { code?: string; meta?: { target?: unknown }; name?: string; status?: number };

  // Registrar error con contexto
  logger.error('Error en la petición', {
    error: errorLike.message,
    stack: errorLike.stack,
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
  if (codedError.code === 'LIMIT_FILE_SIZE') {
    res.status(400).json({ 
      error: 'Archivo demasiado grande',
      maxSize: '100MB' 
    });
    return;
  }

  // Error de cantidad de archivos de Multer
  if (codedError.code === 'LIMIT_FILE_COUNT') {
    res.status(400).json({ 
      error: 'Demasiados archivos',
      maxFiles: 10
    });
    return;
  }

  // Error de restricción única de Prisma
  if (codedError.code === 'P2002') {
    res.status(409).json({ 
      error: 'Ya existe un registro con este valor',
      field: codedError.meta?.target 
    });
    return;
  }

  // Registro no encontrado en Prisma
  if (codedError.code === 'P2025') {
    res.status(404).json({ error: 'Registro no encontrado' });
    return;
  }

  // Errores JWT
  if (codedError.name === 'JsonWebTokenError') {
    res.status(401).json({ error: 'Token inválido' });
    return;
  }

  if (codedError.name === 'TokenExpiredError') {
    res.status(401).json({ error: 'Token expirado' });
    return;
  }

  // Errores de validación
  if (codedError.name === 'ValidationError') {
    res.status(400).json({ 
      error: 'Validación fallida',
      details: errorLike.message
    });
    return;
  }

  // Error por defecto
  res.status(codedError.status || 500).json({
    error: errorLike.message || 'Error interno del servidor'
  });
}

/**
 * Manejador 404 para rutas no definidas
 */
export function notFoundHandler(
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.path,
    method: req.method
  });
}
