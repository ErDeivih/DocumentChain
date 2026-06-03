import { getDocumentRegistryContract, ADMIN_ROLE_HASH } from '../config/blockchain';
import prisma from '../config/database';
import logger from '../utils/logger';
import { ethers } from 'ethers';

/**
 * Resultado de una operación de sincronización de administrador en blockchain.
 * @property success - Indica si la operación fue exitosa
 * @property address - Dirección Ethereum afectada
 * @property txHash - Hash de la transacción (opcional)
 * @property error - Mensaje de error en caso de fallo
 */
export interface AdminSyncResult {
  success: boolean;
  address: string;
  txHash?: string;
  error?: string;
}

/**
 * Servicio para sincronizar administradores entre la base de datos y el contrato inteligente.
 * Asegura que los usuarios con rol ADMIN en la base de datos posean el rol ADMIN_ROLE en blockchain.
 *
 * Patrón Auto-sync:
 * - Cuando se crea un admin → se otorga ADMIN_ROLE en blockchain
 * - Cuando se elimina un admin → se revoca ADMIN_ROLE en blockchain
 * - syncAllAdmins() puede ejecutarse periódicamente para garantizar consistencia
 */
export class BlockchainAdminService {
  /**
   * Otorgar rol de administrador en blockchain a un usuario
   * 
   * @param userAddress - Dirección Ethereum del usuario
   * @returns Resultado de la operación con txHash
   */
  static async grantAdminRole(userAddress: string): Promise<AdminSyncResult> {
    try {
      if (!ethers.isAddress(userAddress)) {
        return {
          success: false,
          address: userAddress,
          error: 'Dirección Ethereum inválida'
        };
      }

      const contract = getDocumentRegistryContract();

      // Verificar si ya tiene el rol
      const hasRole = await contract.hasRole(ADMIN_ROLE_HASH, userAddress);
      if (hasRole) {
        logger.info(`[BLOCKCHAIN_ADMIN] Usuario ${userAddress} ya tiene ADMIN_ROLE`);
        return {
          success: true,
          address: userAddress,
          txHash: 'ALREADY_HAS_ROLE'
        };
      }

      // Otorgar rol
      logger.info(`[BLOCKCHAIN_ADMIN] Otorgando ADMIN_ROLE a ${userAddress}`);
      const tx = await contract.grantRole(ADMIN_ROLE_HASH, userAddress);
      const receipt = await tx.wait();

      logger.info(`[BLOCKCHAIN_ADMIN] ✅ ADMIN_ROLE otorgado a ${userAddress}, tx: ${receipt.hash}`);

      return {
        success: true,
        address: userAddress,
        txHash: receipt.hash
      };

    } catch (error) {
      logger.error(`[BLOCKCHAIN_ADMIN] ❌ Error al otorgar ADMIN_ROLE a ${userAddress}:`, error);
      return {
        success: false,
        address: userAddress,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Revocar rol de administrador en blockchain a un usuario
   * 
   * @param userAddress - Dirección Ethereum del usuario
   * @returns Resultado de la operación con txHash
   */
  static async revokeAdminRole(userAddress: string): Promise<AdminSyncResult> {
    try {
      if (!ethers.isAddress(userAddress)) {
        return {
          success: false,
          address: userAddress,
          error: 'Dirección Ethereum inválida'
        };
      }

      const contract = getDocumentRegistryContract();

      // Verificar si tiene el rol
      const hasRole = await contract.hasRole(ADMIN_ROLE_HASH, userAddress);
      if (!hasRole) {
        logger.info(`[BLOCKCHAIN_ADMIN] Usuario ${userAddress} no tiene ADMIN_ROLE`);
        return {
          success: true,
          address: userAddress,
          txHash: 'ALREADY_NO_ROLE'
        };
      }

      // Revocar rol
      logger.info(`[BLOCKCHAIN_ADMIN] Revocando ADMIN_ROLE a ${userAddress}`);
      const tx = await contract.revokeRole(ADMIN_ROLE_HASH, userAddress);
      const receipt = await tx.wait();

      logger.info(`[BLOCKCHAIN_ADMIN] ✅ ADMIN_ROLE revocado a ${userAddress}, tx: ${receipt.hash}`);

      return {
        success: true,
        address: userAddress,
        txHash: receipt.hash
      };

    } catch (error) {
      logger.error(`[BLOCKCHAIN_ADMIN] ❌ Error al revocar ADMIN_ROLE a ${userAddress}:`, error);
      return {
        success: false,
        address: userAddress,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Verificar si un usuario tiene rol de administrador en blockchain
   * 
   * @param userAddress - Dirección Ethereum del usuario
   * @returns true si tiene ADMIN_ROLE, false caso contrario
   */
  static async hasAdminRole(userAddress: string): Promise<boolean> {
    try {
      if (!ethers.isAddress(userAddress)) {
        return false;
      }

      const contract = getDocumentRegistryContract();
      return await contract.hasRole(ADMIN_ROLE_HASH, userAddress);

    } catch (error) {
      logger.error(`[BLOCKCHAIN_ADMIN] Error al verificar ADMIN_ROLE de ${userAddress}:`, error);
      return false;
    }
  }

  /**
   * Sincronizar TODOS los administradores de la DB con blockchain
   * 
   * Este método:
   * 1. Obtiene todos los usuarios con role=ADMIN en la DB
   * 2. Verifica que todos tengan ADMIN_ROLE en blockchain
   * 3. Otorga el rol a los que no lo tengan
   * 
   * Útil para:
   * - Ejecutar al iniciar el backend
   * - Ejecutar periódicamente (cronjob)
   * - Recuperar sincronización después de un error
   * 
   * @returns Array con el resultado de cada sincronización
   */
  static async syncAllAdmins(): Promise<AdminSyncResult[]> {
    try {
      logger.info('[BLOCKCHAIN_ADMIN] 🔄 Iniciando sincronización de administradores...');

      // 1. Obtener todos los admins de la DB con sus wallets
      const admins = await prisma.user.findMany({
        where: { role: 'ADMIN' },
        include: {
          wallets: {
            where: { isPrimary: true }
          }
        }
      });

      if (admins.length === 0) {
        logger.info('[BLOCKCHAIN_ADMIN] No hay administradores para sincronizar');
        return [];
      }

      logger.info(`[BLOCKCHAIN_ADMIN] Encontrados ${admins.length} administradores en DB`);

      const results: AdminSyncResult[] = [];

      // 2. Sincronizar cada admin en paralelo
      const syncPromises = admins.map(async (admin): Promise<AdminSyncResult> => {
        const primaryWallet = admin.wallets[0];
        if (!primaryWallet) {
          logger.warn(`[BLOCKCHAIN_ADMIN] Admin ${admin.username} (${admin.id}) no tiene wallet primaria`);
          return { success: false, address: 'NO_WALLET', error: `Admin ${admin.username} no tiene wallet` };
        }
        return this.grantAdminRole(primaryWallet.walletAddress);
      });

      const settled = await Promise.allSettled(syncPromises);
      for (const result of settled) {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          results.push({ success: false, address: 'ERROR', error: result.reason?.message || 'Error desconocido' });
        }
      }

      // 3. Resumen
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;

      logger.info(`[BLOCKCHAIN_ADMIN] ✅ Sincronización completada: ${successful} exitosas, ${failed} fallidas`);

      return results;

    } catch (error) {
      logger.error('[BLOCKCHAIN_ADMIN] ❌ Error en sincronización de administradores:', error);
      throw error;
    }
  }

  /**
   * Sincronizar un admin específico cuando conecta una wallet
   * 
   * Caso de uso: Usuario admin conecta su wallet por primera vez
   * 
   * @param userId - ID del usuario en la DB
   * @param walletAddress - Dirección de la wallet conectada
   */
  static async syncAdminOnWalletConnect(userId: string, walletAddress: string): Promise<AdminSyncResult | null> {
    try {
      // Verificar si el usuario es admin
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true, username: true }
      });

      if (!user || user.role !== 'ADMIN') {
        // No es admin, no hacer nada
        return null;
      }

      logger.info(`[BLOCKCHAIN_ADMIN] Admin ${user.username} conectó wallet ${walletAddress}, sincronizando...`);

      return await this.grantAdminRole(walletAddress);

    } catch (error) {
      logger.error(`[BLOCKCHAIN_ADMIN] Error en syncAdminOnWalletConnect:`, error);
      throw error;
    }
  }
}
