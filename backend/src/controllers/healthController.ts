import { Request, Response } from 'express';
import prisma from '../config/database';
import { provider } from '../config/blockchain';
import { logger } from '../utils/logger';
import webSocketService from '../services/webSocketService';

/**
 * HealthController - Endpoints para monitoring
 * 
 * Endpoints:
 * - GET /health - Health check básico
 * - GET /health/detailed - Health check detallado con todos los servicios
 * 
 * Servicios monitorizados:
 * - Database (PostgreSQL + Prisma)
 * - Blockchain (Ethereum RPC)
 * - IPFS (opcional)
 * - WebSocket (conexiones activas)
 * - Sistema (memoria, uptime)
 */
class HealthController {
  /**
   * GET /health
   * 
   * Health check básico - rápido para load balancers
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
   * GET /health/detailed
   * 
   * Health check detallado con estado de todos los servicios
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
        websocket: this.checkWebSocket(),
      },
      system: this.getSystemInfo(),
      responseTime: 0,
    };
    
    // Determinar estado general
    const serviceStatuses = Object.values(health.services).map(s => s.status);
    
    if (serviceStatuses.every(s => s === 'healthy')) {
      health.status = 'healthy';
    } else if (serviceStatuses.some(s => s === 'unhealthy')) {
      health.status = 'unhealthy';
    } else {
      health.status = 'degraded';
    }
    
    health.responseTime = Date.now() - startTime;
    
    const httpStatus = health.status === 'healthy' ? 200 : 
                      health.status === 'degraded' ? 200 : 503;
    
    res.status(httpStatus).json(health);
  }
  
  /**
   * Verificar estado de la base de datos
   */
  private async checkDatabase(): Promise<{
    status: 'healthy' | 'unhealthy';
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
   * Verificar estado del blockchain
   */
  private async checkBlockchain(): Promise<{
    status: 'healthy' | 'unhealthy';
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
   * Verificar estado del WebSocket
   */
  private checkWebSocket(): {
    status: 'healthy';
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
   * Obtener información del sistema
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
