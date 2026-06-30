import { Request, Response, NextFunction } from 'express';
import { HealthService } from '../services/healthService';
import { logger } from '../utils/logger';

type ServiceStatus = 'healthy' | 'degraded' | 'unhealthy';

/**
 * Controlador de salud del sistema.
 * Expone endpoints para el monitoreo del estado de los servicios críticos:
 * base de datos, blockchain, email, WebSocket y recursos del sistema.
 */
export class HealthController {
  /**
   * Realiza una comprobación básica de salud del sistema.
   * Endpoint: GET /health
   *
   * @param req - Objeto de solicitud HTTP.
   * @param res - Objeto de respuesta HTTP.
   * @returns Promesa que resuelve con el estado de salud básico.
   */
  async healthCheck(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await HealthService.checkDatabase();
      
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      });
      
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Realiza una comprobación detallada de salud incluyendo todos los servicios.
   * Endpoint: GET /health/detailed
   *
   * @param req - Objeto de solicitud HTTP.
   * @param res - Objeto de respuesta HTTP.
   * @returns Promesa que resuelve con el estado detallado de cada servicio.
   */
  async detailedHealthCheck(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const startTime = Date.now();

    let dbResult: any;
    try {
      const dbStart = Date.now();
      await HealthService.checkDatabase();
      dbResult = { status: 'healthy' as ServiceStatus, latency: Date.now() - dbStart };
    } catch (error: any) {
      logger.error('Health check de base de datos fallido', { error });
      dbResult = { status: 'unhealthy' as ServiceStatus, error: error?.message || 'Error desconocido' };
    }

    let bcResult: any;
    try {
      const bcStart = Date.now();
      const { blockNumber } = await HealthService.checkBlockchain();
      bcResult = { status: 'healthy' as ServiceStatus, blockNumber, latency: Date.now() - bcStart };
    } catch (error: any) {
      logger.error('Health check de blockchain fallido', { error });
      bcResult = { status: 'unhealthy' as ServiceStatus, error: error?.message || 'Error desconocido' };
    }

    let emailResult: any;
    try {
      const emailStart = Date.now();
      const diagnostics = await HealthService.checkEmail();
      const emailStatus: ServiceStatus = diagnostics.warnings.length > 0 ? 'degraded' : 'healthy';
      emailResult = { status: emailStatus, latency: Date.now() - emailStart, ...diagnostics };
    } catch (error: any) {
      logger.error('Health check de email fallido', { error });
      emailResult = { status: 'unhealthy' as ServiceStatus, error: error?.message || 'Error desconocido' };
    }

    let wsResult: any;
    try {
      const { stats } = HealthService.checkWebSocket();
      wsResult = { status: 'healthy' as ServiceStatus, stats };
    } catch (error: any) {
      logger.error('Health check de WebSocket fallido', { error });
      wsResult = { status: 'unhealthy' as ServiceStatus, error: error?.message || 'Error desconocido' };
    }

    const systemInfo = HealthService.getSystemInfo();

    const health = {
      status: 'healthy' as ServiceStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        database: dbResult,
        blockchain: bcResult,
        email: emailResult,
        websocket: wsResult,
      },
      system: systemInfo,
      responseTime: 0,
    };

    const criticalStatuses = [
      health.services.database.status,
      health.services.blockchain.status,
    ];

    if (criticalStatuses.some(s => s === 'unhealthy')) {
      health.status = 'unhealthy';
    } else if (criticalStatuses.some(s => s === 'degraded')) {
      health.status = 'degraded';
    }

    health.responseTime = Date.now() - startTime;

    const httpStatus = health.status === 'healthy' ? 200 :
                      health.status === 'degraded' ? 200 : 503;

    res.status(httpStatus).json(health);
  }
}

export default new HealthController();
