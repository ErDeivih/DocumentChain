import { v4 as uuidv4 } from 'uuid';
import { ethers } from 'ethers';
import prisma from '../config/database';
import { BlockchainAdminService } from './blockchainAdminService';
import logger from '../utils/logger';
import { NotFoundError, ValidationError, ConflictError } from '../utils/errors';

const MAX_WALLETS_PER_USER = 5;

/**
 * Información de una wallet asociada a un usuario.
 * @property id - Identificador de la wallet
 * @property address - Dirección Ethereum
 * @property label - Etiqueta o nickname
 * @property isPrimary - Indica si es la wallet principal del usuario
 */
export interface WalletInfo {
  id: string;
  address: string;
  label: string | null;
  isPrimary: boolean;
   
}

/**
 * Servicio de gestión de wallets Ethereum de los usuarios.
 * Permite añadir, eliminar, etiquetar y establecer wallets principales.
 */
export class WalletService {
  /**
   * Obtener todas las wallets de un usuario.
   * @param userId - ID del usuario
   * @returns Lista de wallets ordenadas por primarias primero
   */
  static async getUserWallets(userId: string): Promise<WalletInfo[]> {
    const wallets = await prisma.wallet.findMany({
      where: { userId },
      select: {
        id: true,
        walletAddress: true,
        nickname: true,
        isPrimary: true,
         
      },
      orderBy: [
        { isPrimary: 'desc' },
        { id: 'asc' }
      ]
    });

    // Mapear campos de base de datos a interfaz
    return wallets.map(wallet => ({
      id: wallet.id,
      address: wallet.walletAddress,
      label: wallet.nickname,
      isPrimary: wallet.isPrimary,
       
    }));
  }

  /**
   * Añadir una nueva wallet para el usuario.
   * Permite un máximo de 5 wallets por usuario.
   * @param userId - ID del usuario
   * @param address - Dirección Ethereum
   * @param label - Etiqueta descriptiva (opcional)
   * @param isPrimary - Indica si debe ser la wallet principal
   * @returns Wallet creada
   */
  static async addWallet(
    userId: string,
    address: string,
    label?: string,
    isPrimary: boolean = false
  ): Promise<WalletInfo> {
    // Validar dirección Ethereum
    if (!ethers.isAddress(address)) {
      throw new ValidationError('Dirección Ethereum inválida', 'address');
    }

    // Normalizar dirección (formato checksum)
    const normalizedAddress = ethers.getAddress(address);

    // Verificar si la wallet ya existe para este usuario + crear + marcar primaria atómicamente
    const wallet = await prisma.$transaction(async (tx) => {
      const existingWallet = await tx.wallet.findFirst({
        where: {
          userId,
          walletAddress: normalizedAddress
        }
      });

      if (existingWallet) {
        throw new ConflictError('La wallet ya ha sido añadida');
      }

      if (isPrimary) {
        await tx.wallet.updateMany({
          where: { userId },
          data: { isPrimary: false }
        });
      }
      const walletCount = await tx.wallet.count({
        where: { userId }
      });

      if (walletCount >= MAX_WALLETS_PER_USER) {
        throw new ValidationError(`Máximo ${MAX_WALLETS_PER_USER} wallets por usuario`);
      }

      const isFirstWallet = walletCount === 0;

      return tx.wallet.create({
        data: {
          id: uuidv4(),
          userId,
          walletAddress: normalizedAddress,
          nickname: label,
          isPrimary: isPrimary || isFirstWallet
        },
        select: {
          id: true,
          walletAddress: true,
          nickname: true,
          isPrimary: true,
          
        }
      });
    });

    // Mapear a interfaz
    const walletInfo: WalletInfo = {
      id: wallet.id,
      address: wallet.walletAddress,
      label: wallet.nickname,
      isPrimary: wallet.isPrimary,
    };

    // Sincronizar rol admin en blockchain si el usuario es admin
    try {
      const syncResult = await BlockchainAdminService.syncAdminOnWalletConnect(userId, normalizedAddress);
      if (syncResult) {
        if (syncResult.success) {
          logger.info(`Admin sincronizado con blockchain al conectar wallet, tx: ${syncResult.txHash}`);
        } else {
          logger.warn(`No se pudo sincronizar admin con blockchain: ${syncResult.error}`);
        }
      }
    } catch (syncError) {
      logger.error('Error al sincronizar admin con blockchain:', syncError);
    }

    return walletInfo;
  }

  /**
   * Eliminar una wallet de un usuario.
   * No se puede eliminar la wallet principal si existen otras wallets.
   * @param userId - ID del usuario
   * @param walletId - ID de la wallet a eliminar
   */
  static async removeWallet(userId: string, walletId: string): Promise<void> {
    const wallet = await prisma.wallet.findFirst({
      where: {
        id: walletId,
        userId
      }
    });

    if (!wallet) {
      throw new NotFoundError('Wallet', walletId);
    }

    if (wallet.isPrimary) {
      const walletCount = await prisma.wallet.count({ where: { userId } });
      if (walletCount > 1) {
        throw new ValidationError('No se puede eliminar la wallet principal. Establezca otra wallet como principal primero.');
      }
      throw new ValidationError('No se puede eliminar la única wallet de la cuenta.');
    }

    // Eliminar wallet
    await prisma.wallet.delete({
      where: { id: walletId }
    });
  }

  /**
   * Establecer una wallet como principal para un usuario.
   * @param userId - ID del usuario
   * @param walletId - ID de la wallet a establecer como principal
   * @returns Wallet actualizada
   */
  static async setPrimaryWallet(userId: string, walletId: string): Promise<WalletInfo> {
    // Verificar que la wallet pertenece al usuario
    const wallet = await prisma.wallet.findFirst({
      where: {
        id: walletId,
        userId
      }
    });

    if (!wallet) {
      throw new NotFoundError('Wallet', walletId);
    }

    // Desmarcar otras wallets primarias + marcar esta atómicamente
    const updatedWallet = await prisma.$transaction(async (tx) => {
      await tx.wallet.updateMany({
        where: { userId },
        data: { isPrimary: false }
      });

      return tx.wallet.update({
        where: { id: walletId },
        data: { isPrimary: true },
        select: {
          id: true,
          walletAddress: true,
          nickname: true,
          isPrimary: true,
          
        }
      });
    });

    // Mapear a interfaz
    return {
      id: updatedWallet.id,
      address: updatedWallet.walletAddress,
      label: updatedWallet.nickname,
      isPrimary: updatedWallet.isPrimary,
       
    };
  }

  /**
   * Actualizar la etiqueta (nickname) de una wallet.
   * @param userId - ID del usuario
   * @param walletId - ID de la wallet
   * @param label - Nueva etiqueta
   * @returns Wallet actualizada
   */
  static async updateWalletLabel(
    userId: string,
    walletId: string,
    label: string
  ): Promise<WalletInfo> {
    // Verificar que la wallet pertenece al usuario
    const wallet = await prisma.wallet.findFirst({
      where: {
        id: walletId,
        userId
      }
    });

    if (!wallet) {
      throw new NotFoundError('Wallet', walletId);
    }

    const updatedWallet = await prisma.wallet.update({
      where: { id: walletId },
      data: { nickname: label },
      select: {
        id: true,
        walletAddress: true,
        nickname: true,
        isPrimary: true,
         
      }
    });

    // Mapear a interfaz
    return {
      id: updatedWallet.id,
      address: updatedWallet.walletAddress,
      label: updatedWallet.nickname,
      isPrimary: updatedWallet.isPrimary,
       
    };
  }

  /**
   * Verificar la propiedad de una wallet mediante firma de mensaje.
   * @param address - Dirección Ethereum
   * @param message - Mensaje firmado
   * @param signature - Firma ECDSA
   * @returns true si la firma corresponde a la dirección
   */
  static verifyWalletSignature(
    address: string,
    message: string,
    signature: string
  ): boolean {
    try {
      const recoveredAddress = ethers.verifyMessage(message, signature);
      return recoveredAddress.toLowerCase() === address.toLowerCase();
    } catch (error) {
      logger.warn(`[walletService] Fallo en la verificación de firma de wallet: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }

  /**
   * Generar un mensaje de desafío para verificación de wallet.
   * @param address - Dirección Ethereum a verificar
   * @returns Mensaje de desafío con marca de tiempo
   */
  static generateChallengeMessage(address: string): string {
    const timestamp = Date.now();
    return `Firme este mensaje para verificar que es dueño de la wallet ${address}. Marca de tiempo: ${timestamp}`;
  }
}
