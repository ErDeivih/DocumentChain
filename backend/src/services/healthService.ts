import prisma from '../config/database';
import { provider } from '../config/blockchain';
import { emailService } from './emailService';
import webSocketService from './webSocketService';

/**
 * Servicio de salud del sistema. Verifica conectividad con BD, blockchain, IPFS y SMTP.
 */
export class HealthService {

  /**
   * Verifica conectividad con la base de datos ejecutando un query simple.
   * @returns {Promise<string>} 'ok' si la conexión es exitosa
   */
  static async checkDatabase() { await prisma.$queryRaw`SELECT 1`; return 'ok'; }
  /**
   * Verifica conectividad con blockchain consultando el último bloque.
   * @returns {Promise<{blockNumber: number}>} número del último bloque
   */
  static async checkBlockchain() { const blockNumber = await provider.getBlockNumber(); return { blockNumber }; }
  /**
   * Verifica conectividad con el servicio de correo electrónico.
   * @returns {Promise<object>} diagnóstico de la conexión SMTP
   */
  static async checkEmail() { await emailService.verifyConnection(); return emailService.getDiagnostics(); }
  /**
   * Recupera estadísticas del servicio WebSocket.
   * @returns {{stats: object}} estadísticas de conexiones activas
   */
  static checkWebSocket() { return { stats: webSocketService.getStats() }; }
  /**
   * Obtiene información del entorno de ejecución del sistema.
   * @returns {object} métricas de Node.js, SO, memoria y CPU
   */
  static getSystemInfo() {
    const os = require('os');
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    return {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      memory: {
        total: Math.round(totalMemory / 1024 / 1024),
        used: Math.round(usedMemory / 1024 / 1024),
        free: Math.round(freeMemory / 1024 / 1024),
        usagePercent: Math.round((usedMemory / totalMemory) * 100),
      },
      cpu: { cores: os.cpus().length },
    };
  }
}
