import { getDocumentRegistryContract } from '../config/blockchain';
import prisma from '../config/database';
import logger from '../utils/logger';

export interface SystemStatus {
  isPaused: boolean;
  pausedAt?: Date;
  pausedBy?: string;
  reason?: string;
  blockchainPaused: boolean;
  lastChecked: Date;
}

export interface PauseSystemRequest {
  userId: string;
  reason: string;
}

/**
 * SystemService
 * 
 * Servicio para gestionar el estado de pausa de emergencia del sistema.
 * Implementa el Circuit Breaker Pattern a dos niveles:
 * 
 * 1. Base de Datos: Pausa las operaciones de escritura del backend
 * 2. Blockchain: Pausa las operaciones del smart contract
 * 
 * Cuando el sistema está pausado:
 * - ❌ NO se permiten operaciones de escritura (crear, editar, compartir, etc.)
 * - ✅ SÍ se permiten operaciones de lectura (ver documentos, consultar permisos)
 * - ✅ SÍ se permiten operaciones de autenticación
 * - ✅ SÍ se permite despausar el sistema (solo admins)
 */
export class SystemService {
  private static readonly SYSTEM_PAUSE_KEY = 'system_paused';
  private static readonly PAUSE_REASON_KEY = 'pause_reason';
  private static readonly PAUSED_BY_KEY = 'paused_by';
  private static readonly PAUSED_AT_KEY = 'paused_at';

  /**
   * Pausar el sistema (backend + blockchain)
   * Solo ejecutable por administradores
   * 
   * @param request - Datos de la solicitud de pausa
   * @returns Estado del sistema después de pausar
   */
  static async pauseSystem(request: PauseSystemRequest): Promise<SystemStatus> {
    try {
      logger.warn(`[SYSTEM] 🛑 PAUSANDO SISTEMA por usuario ${request.userId}, razón: ${request.reason}`);

      const now = new Date();

      // 1. Pausar blockchain
      const contract = getDocumentRegistryContract();
      const isPausedBlockchain = await contract.isPaused();

      if (!isPausedBlockchain) {
        logger.info('[SYSTEM] Pausando contrato en blockchain...');
        const tx = await contract.pause();
        await tx.wait();
        logger.info('[SYSTEM] ✅ Contrato pausado en blockchain');
      } else {
        logger.info('[SYSTEM] Contrato ya estaba pausado en blockchain');
      }

      // 2. Guardar estado de pausa en DB
      await Promise.all([
        this.setConfigValue(this.SYSTEM_PAUSE_KEY, 'true'),
        this.setConfigValue(this.PAUSE_REASON_KEY, request.reason),
        this.setConfigValue(this.PAUSED_BY_KEY, request.userId),
        this.setConfigValue(this.PAUSED_AT_KEY, now.toISOString())
      ]);

      logger.warn('[SYSTEM] 🛑 SISTEMA PAUSADO COMPLETAMENTE');

      return {
        isPaused: true,
        pausedAt: now,
        pausedBy: request.userId,
        reason: request.reason,
        blockchainPaused: true,
        lastChecked: now
      };

    } catch (error) {
      logger.error('[SYSTEM] ❌ Error al pausar sistema:', error);
      throw new Error('Error al pausar el sistema: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  }

  /**
   * Despausar el sistema (backend + blockchain)
   * Solo ejecutable por administradores
   * 
   * @param userId - ID del administrador que despausa
   * @returns Estado del sistema después de despausar
   */
  static async unpauseSystem(userId: string): Promise<SystemStatus> {
    try {
      logger.info(`[SYSTEM] ✅ DESPAUSANDO SISTEMA por usuario ${userId}`);

      // 1. Despausar blockchain
      const contract = getDocumentRegistryContract();
      const isPausedBlockchain = await contract.isPaused();

      if (isPausedBlockchain) {
        logger.info('[SYSTEM] Despausando contrato en blockchain...');
        const tx = await contract.unpause();
        await tx.wait();
        logger.info('[SYSTEM] ✅ Contrato despausado en blockchain');
      } else {
        logger.info('[SYSTEM] Contrato ya estaba despausado en blockchain');
      }

      // 2. Eliminar estado de pausa de DB
      await Promise.all([
        this.deleteConfigValue(this.SYSTEM_PAUSE_KEY),
        this.deleteConfigValue(this.PAUSE_REASON_KEY),
        this.deleteConfigValue(this.PAUSED_BY_KEY),
        this.deleteConfigValue(this.PAUSED_AT_KEY)
      ]);

      logger.info('[SYSTEM] ✅ SISTEMA DESPAUSADO COMPLETAMENTE');

      return {
        isPaused: false,
        blockchainPaused: false,
        lastChecked: new Date()
      };

    } catch (error) {
      logger.error('[SYSTEM] ❌ Error al despausar sistema:', error);
      throw new Error('Error al despausar el sistema: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  }

  /**
   * Obtener el estado actual del sistema
   * Consulta tanto DB como blockchain para garantizar consistencia
   * 
   * @returns Estado actual del sistema
   */
  static async getSystemStatus(): Promise<SystemStatus> {
    try {
      // 1. Consultar estado en DB
      const [isPausedStr, reason, pausedBy, pausedAtStr] = await Promise.all([
        this.getConfigValue(this.SYSTEM_PAUSE_KEY),
        this.getConfigValue(this.PAUSE_REASON_KEY),
        this.getConfigValue(this.PAUSED_BY_KEY),
        this.getConfigValue(this.PAUSED_AT_KEY)
      ]);

      const isPausedDB = isPausedStr === 'true';
      const pausedAt = pausedAtStr ? new Date(pausedAtStr) : undefined;

      // 2. Consultar estado en blockchain
      const contract = getDocumentRegistryContract();
      const blockchainPaused = await contract.isPaused();

      // 3. Verificar consistencia
      if (isPausedDB !== blockchainPaused) {
        logger.warn(`[SYSTEM] ⚠️ INCONSISTENCIA: DB paused=${isPausedDB}, Blockchain paused=${blockchainPaused}`);
      }

      return {
        isPaused: isPausedDB || blockchainPaused, // Si cualquiera está pausado, el sistema está pausado
        pausedAt,
        pausedBy: pausedBy || undefined,
        reason: reason || undefined,
        blockchainPaused,
        lastChecked: new Date()
      };

    } catch (error) {
      logger.error('[SYSTEM] Error al obtener estado del sistema:', error);
      // En caso de error, asumir que el sistema está operativo
      return {
        isPaused: false,
        blockchainPaused: false,
        lastChecked: new Date()
      };
    }
  }

  /**
   * Verificar rápidamente si el sistema está pausado (solo DB)
   * Más rápido que getSystemStatus() pero solo consulta DB
   * 
   * @returns true si el sistema está pausado, false caso contrario
   */
  static async isPaused(): Promise<boolean> {
    try {
      const value = await this.getConfigValue(this.SYSTEM_PAUSE_KEY);
      return value === 'true';
    } catch (error) {
      logger.error('[SYSTEM] Error al verificar pausa:', error);
      return false;
    }
  }

  /**
   * Sincronizar estado de pausa entre DB y blockchain
   * Útil si hay inconsistencias
   * 
   * @returns Estado del sistema después de sincronizar
   */
  static async syncPauseStatus(): Promise<SystemStatus> {
    try {
      logger.info('[SYSTEM] 🔄 Sincronizando estado de pausa DB ↔ Blockchain...');

      const status = await this.getSystemStatus();

      if (status.isPaused !== status.blockchainPaused) {
        logger.warn('[SYSTEM] Detectada inconsistencia, sincronizando...');

        // Si blockchain está pausado pero DB no, pausar DB
        if (status.blockchainPaused && !status.isPaused) {
          await this.setConfigValue(this.SYSTEM_PAUSE_KEY, 'true');
          await this.setConfigValue(this.PAUSE_REASON_KEY, 'Sincronización automática con blockchain');
          await this.setConfigValue(this.PAUSED_AT_KEY, new Date().toISOString());
          logger.info('[SYSTEM] ✅ DB pausado para sincronizar con blockchain');
        }

        // Si DB está pausado pero blockchain no, despausar DB
        if (status.isPaused && !status.blockchainPaused) {
          await this.deleteConfigValue(this.SYSTEM_PAUSE_KEY);
          await this.deleteConfigValue(this.PAUSE_REASON_KEY);
          await this.deleteConfigValue(this.PAUSED_BY_KEY);
          await this.deleteConfigValue(this.PAUSED_AT_KEY);
          logger.info('[SYSTEM] ✅ DB despausado para sincronizar con blockchain');
        }

        return await this.getSystemStatus();
      }

      logger.info('[SYSTEM] ✅ Estados ya sincronizados');
      return status;

    } catch (error) {
      logger.error('[SYSTEM] ❌ Error al sincronizar estado de pausa:', error);
      throw error;
    }
  }

  // ============================================
  // HELPERS PRIVADOS PARA SYSTEMCONFIG
  // ============================================

  private static async getConfigValue(key: string): Promise<string | null> {
    const config = await prisma.systemConfig.findUnique({
      where: { key }
    });
    return config?.value || null;
  }

  private static async setConfigValue(key: string, value: string): Promise<void> {
    await prisma.systemConfig.upsert({
      where: { key },
      update: { value, updatedAt: new Date() },
      create: { key, value }
    });
  }

  private static async deleteConfigValue(key: string): Promise<void> {
    await prisma.systemConfig.deleteMany({
      where: { key }
    });
  }
}
