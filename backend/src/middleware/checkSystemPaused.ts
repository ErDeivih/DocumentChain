import { Request, Response, NextFunction } from 'express';
import { SystemService } from '../services/systemService';
import logger from '../utils/logger';

/**
 * Middleware para verificar si el sistema está pausado
 * 
 * Cuando el sistema está pausado (Circuit Breaker activado):
 * - ❌ Bloquea todas las operaciones de escritura (POST, PUT, PATCH, DELETE)
 * - ✅ Permite operaciones de lectura (GET)
 * - ✅ Permite endpoints de autenticación (/api/auth/*)
 * - ✅ Permite endpoints de admin del sistema (/api/admin/system/*)
 * 
 * Uso:
 * ```typescript
 * app.use('/api', checkSystemPaused);
 * ```
 */
export async function checkSystemPaused(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // 1. Permitir operaciones de lectura (GET)
    if (req.method === 'GET') {
      return next();
    }

    // 2. Permitir endpoints de autenticación (siempre accesibles)
    if (req.path.startsWith('/auth/')) {
      return next();
    }

    // 3. Permitir endpoints de gestión del sistema (para despausar)
    if (req.path.startsWith('/admin/system')) {
      return next();
    }

    // 4. Verificar si el sistema está pausado
    const isPaused = await SystemService.isPaused();

    if (isPaused) {
      logger.warn(`[SYSTEM_PAUSED] Bloqueada operación ${req.method} ${req.path} - Sistema en pausa de emergencia`);
      
      res.status(503).json({
        success: false,
        error: 'SYSTEM_PAUSED',
        message: 'El sistema está temporalmente pausado por mantenimiento de emergencia. Inténtelo más tarde.',
        details: {
          allowedOperations: ['Consultar documentos (GET)', 'Autenticación', 'Ver estado del sistema']
        }
      });
      return;
    }

    // 5. Sistema operativo, continuar
    next();

  } catch (error) {
    logger.error('[SYSTEM_PAUSED_MIDDLEWARE] Error al verificar estado del sistema:', error);
    
    // En caso de error al verificar, permitir la operación para no bloquear completamente el sistema
    // Esto es una decisión de diseño: preferir disponibilidad sobre consistencia en caso de fallo
    logger.warn('[SYSTEM_PAUSED_MIDDLEWARE] Permitiendo operación por error en verificación');
    next();
  }
}

/**
 * Middleware más estricto que también verifica blockchain
 * Solo para operaciones críticas
 * 
 * Uso:
 * ```typescript
 * router.post('/documents/create', checkSystemPausedStrict, documentController.create);
 * ```
 */
export async function checkSystemPausedStrict(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Aplicar los mismos filtros que el middleware básico
    if (req.method === 'GET' || 
        req.path.startsWith('/auth/') || 
        req.path.startsWith('/admin/system')) {
      return next();
    }

    // Verificar estado completo (DB + Blockchain)
    const status = await SystemService.getSystemStatus();

    if (status.isPaused || status.blockchainPaused) {
      logger.warn(`[SYSTEM_PAUSED_STRICT] Bloqueada operación ${req.method} ${req.path}`);
      
      res.status(503).json({
        success: false,
        error: 'SYSTEM_PAUSED',
        message: 'El sistema está temporalmente pausado por mantenimiento de emergencia.',
        details: {
          isPaused: status.isPaused,
          blockchainPaused: status.blockchainPaused,
          reason: status.reason,
          pausedAt: status.pausedAt
        }
      });
      return;
    }

    next();

  } catch (error) {
    logger.error('[SYSTEM_PAUSED_STRICT_MIDDLEWARE] Error al verificar estado del sistema:', error);
    
    // En modo estricto, bloquear en caso de error
    res.status(503).json({
      success: false,
      error: 'SYSTEM_CHECK_FAILED',
      message: 'No se pudo verificar el estado del sistema. Inténtelo más tarde.'
    });
  }
}
