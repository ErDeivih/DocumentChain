import { Request, Response } from 'express';
import prisma from '../config/database';
import { provider } from '../config/blockchain';
import { emailService } from '../services/emailService';
import { logger } from '../utils/logger';
import webSocketService from '../services/webSocketService';

type ServiceStatus = 'healthy' | 'degraded' | 'unhealthy';

/**
 * Controlador de salud del sistema.
 * Expone endpoints para el monitoreo del estado de los servicios críticos:
 * base de datos, blockchain, email, WebSocket y recursos del sistema.
 */
class HealthController {
  /**
   * Realiza una comprobación básica de salud del sistema.
   * Endpoint: GET /health
   *
   * @param req - Objeto de solicitud HTTP.
   * @param res - Objeto de respuesta HTTP.
   * @returns Promesa que resuelve con el estado de salud básico.
   */
  async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      // Ping simple a BD
      await prisma.$queryRaw`SELECT 1`;
      
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      });
      
    } catch (error) {
      logger.error('Health check fallido', { error });
      
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
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
  async detailedHealthCheck(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    
    const health = {
      status: 'healthy' as 'healthy' | 'degraded' | 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        database: await this.checkDatabase(),
        blockchain: await this.checkBlockchain(),
        email: await this.checkEmail(),
        websocket: this.checkWebSocket(),
      },
      system: this.getSystemInfo(),
      responseTime: 0,
    };
    
    // El estado global se usa como readiness de la API.
    // Solo depende de los servicios críticos para servir peticiones.
    const criticalStatuses = [
      health.services.database.status,
      health.services.blockchain.status,
    ];

    if (criticalStatuses.some(s => s === 'unhealthy')) {
      health.status = 'unhealthy';
    } else if (criticalStatuses.some(s => s === 'degraded')) {
      health.status = 'degraded';
    } else {
      health.status = 'healthy';
    }
    
    health.responseTime = Date.now() - startTime;
    
    const httpStatus = health.status === 'healthy' ? 200 : 
                      health.status === 'degraded' ? 200 : 503;
    
    res.status(httpStatus).json(health);
  }
  
  /**
   * Verifica el estado de conectividad de la base de datos.
   *
   * @returns Promesa que resuelve con el estado, latencia y posible error de la base de datos.
   */
  private async checkDatabase(): Promise<{
    status: ServiceStatus;
    latency?: number;
    error?: string;
  }> {
    const startTime = Date.now();
    
    try {
      // Query simple para medir latencia
      await prisma.$queryRaw`SELECT 1`;
      
      const latency = Date.now() - startTime;
      
      return {
        status: 'healthy',
        latency,
      };
      
    } catch (error) {
      logger.error('Health check de base de datos fallido', { error });
      
      return {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }
  
  /**
   * Verifica el estado de conectividad con la blockchain.
   *
   * @returns Promesa que resuelve con el estado, número de bloque, latencia y posible error.
   */
  private async checkBlockchain(): Promise<{
    status: ServiceStatus;
    blockNumber?: number;
    latency?: number;
    error?: string;
  }> {
    const startTime = Date.now();
    
    try {
      // Obtener bloque actual
      const blockNumber = await provider.getBlockNumber();
      const latency = Date.now() - startTime;
      
      return {
        status: 'healthy',
        blockNumber,
        latency,
      };
      
    } catch (error) {
      logger.error('Health check de blockchain fallido', { error });
      
      return {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }
  
  /**
   * Verifica el estado del servicio WebSocket.
   *
   * @returns Estado del WebSocket junto con estadísticas de conexiones activas.
   */
  private checkWebSocket(): {
    status: ServiceStatus;
    stats: {
      totalConnectedUsers: number;
      totalConnections: number;
      usersWithMultipleConnections: number;
    };
  } {
    const stats = webSocketService.getStats();
    
    return {
      status: 'healthy',
      stats,
    };
  }

  /**
   * Verifica el estado del servicio SMTP y su configuración efectiva.
   *
   * @returns Promesa que resuelve con el estado, latencia, configuración y advertencias del servicio de email.
   */
  private async checkEmail(): Promise<{
    status: ServiceStatus;
    latency?: number;
    smtpHost: string;
    smtpPort: number;
    smtpSecure: boolean;
    smtpUsesAuth: boolean;
    fromEmail: string;
    warnings: string[];
    error?: string;
  }> {
    const diagnostics = emailService.getDiagnostics();
    const startTime = Date.now();

    try {
      const smtpHealthy = await emailService.verifyConnection();
      const latency = Date.now() - startTime;

      if (!smtpHealthy) {
        return {
          status: 'unhealthy',
          latency,
          ...diagnostics,
          error: 'No se pudo verificar la conectividad SMTP',
        };
      }

      return {
        status: diagnostics.warnings.length > 0 ? 'degraded' : 'healthy',
        latency,
        ...diagnostics,
      };
    } catch (error) {
      logger.error('Health check de email fallido', { error });

      return {
        status: 'unhealthy',
        ...diagnostics,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }
  
  /**
   * Obtiene información del entorno de ejecución del sistema.
   *
   * @returns Objeto con versión de Node.js, plataforma, arquitectura, memoria y núcleos de CPU.
   */
  private getSystemInfo(): {
    nodeVersion: string;
    platform: string;
    arch: string;
    memory: {
      total: number;
      used: number;
      free: number;
      usagePercent: number;
    };
    cpu: {
      cores: number;
    };
  } {
    const memUsage = process.memoryUsage();
    const totalMemory = require('os').totalmem();
    const freeMemory = require('os').freemem();
    const usedMemory = totalMemory - freeMemory;
    
    return {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      memory: {
        total: Math.round(totalMemory / 1024 / 1024), // MB
        used: Math.round(usedMemory / 1024 / 1024), // MB
        free: Math.round(freeMemory / 1024 / 1024), // MB
        usagePercent: Math.round((usedMemory / totalMemory) * 100),
      },
      cpu: {
        cores: require('os').cpus().length,
      },
    };
  }
}

export default new HealthController();
