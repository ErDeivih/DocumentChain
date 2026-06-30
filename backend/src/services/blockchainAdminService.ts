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
