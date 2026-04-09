import { v4 as uuidv4 } from 'uuid';
import { ethers } from 'ethers';
import prisma from '../config/database';

const MAX_WALLETS_PER_USER = 5;

export interface WalletInfo {
  id: string;
  address: string;
  label: string | null;
  isPrimary: boolean;
  // createdAt: Date; // Removed from Prisma schema
}

export class WalletService {
  /**
   * Obtener todas las wallets de un usuario
   */
  static async getUserWallets(userId: string): Promise<WalletInfo[]> {
    const wallets = await prisma.wallet.findMany({
      where: { userId },
      select: {
        id: true,
        walletAddress: true,
        nickname: true,
        isPrimary: true,
        // createdAt removed from schema
      },
      orderBy: [
        { isPrimary: 'desc' },
        { id: 'asc' }
      ]
    });

    // Map database fields to interface
    return wallets.map(wallet => ({
      id: wallet.id,
      address: wallet.walletAddress,
      label: wallet.nickname,
      isPrimary: wallet.isPrimary,
      // createdAt removed from Wallet model
    }));
  }

  /**
   * Añadir una nueva wallet para el usuario
   * Permite máximo 5 wallets por usuario
   */
  static async addWallet(
    userId: string,
    address: string,
    label?: string,
    isPrimary: boolean = false
  ): Promise<WalletInfo> {
    // Validate Ethereum address
    if (!ethers.isAddress(address)) {
      throw new Error('Dirección Ethereum inválida');
    }

    // Normalize address (checksum format)
    const normalizedAddress = ethers.getAddress(address);

    // Check if wallet already exists for this user
    const existingWallet = await prisma.wallet.findFirst({
      where: {
        userId,
        walletAddress: normalizedAddress
      }
    });

    if (existingWallet) {
      throw new Error('La wallet ya ha sido añadida');
    }

    // Check wallet limit (max 5 per user)
    const walletCount = await prisma.wallet.count({
      where: { userId }
    });

    if (walletCount >= MAX_WALLETS_PER_USER) {
      throw new Error(`Máximo ${MAX_WALLETS_PER_USER} wallets por usuario`);
    }

    // If setting as primary, unset other primary wallets
    if (isPrimary) {
      await prisma.wallet.updateMany({
        where: { userId },
        data: { isPrimary: false }
      });
    }

    // If this is the first wallet, make it primary
    const isFirstWallet = walletCount === 0;

    // Create wallet
    const wallet = await prisma.wallet.create({
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
        // createdAt removed from schema
      }
    });

    // Map to interface
    return {
      id: wallet.id,
      address: wallet.walletAddress,
      label: wallet.nickname,
      isPrimary: wallet.isPrimary,
      // createdAt removed from Wallet model
    };
  }

  /**
   * Eliminar una wallet
   * No se puede eliminar la wallet principal si existen otras wallets
   */
  static async removeWallet(userId: string, walletId: string): Promise<void> {
    const wallet = await prisma.wallet.findFirst({
      where: {
        id: walletId,
        userId
      }
    });

    if (!wallet) {
      throw new Error('Wallet no encontrada');
    }

    // Check if this is the primary wallet
    if (wallet.isPrimary) {
      const walletCount = await prisma.wallet.count({
        where: { userId }
      });

      if (walletCount > 1) {
        throw new Error('No se puede eliminar la wallet principal. Establezca otra wallet como principal primero.');
      }
    }

    // Delete wallet
    await prisma.wallet.delete({
      where: { id: walletId }
    });
  }

  /**
   * Establecer una wallet como principal
   */
  static async setPrimaryWallet(userId: string, walletId: string): Promise<WalletInfo> {
    // Verify wallet belongs to user
    const wallet = await prisma.wallet.findFirst({
      where: {
        id: walletId,
        userId
      }
    });

    if (!wallet) {
      throw new Error('Wallet no encontrada');
    }

    // Unset other primary wallets
    await prisma.wallet.updateMany({
      where: { userId },
      data: { isPrimary: false }
    });

    // Set this wallet as primary
    const updatedWallet = await prisma.wallet.update({
      where: { id: walletId },
      data: { isPrimary: true },
      select: {
        id: true,
        walletAddress: true,
        nickname: true,
        isPrimary: true,
        // createdAt removed from schema
      }
    });

    // Map to interface
    return {
      id: updatedWallet.id,
      address: updatedWallet.walletAddress,
      label: updatedWallet.nickname,
      isPrimary: updatedWallet.isPrimary,
      // createdAt removed from Wallet model
    };
  }

  /**
   * Actualizar etiqueta de wallet
   */
  static async updateWalletLabel(
    userId: string,
    walletId: string,
    label: string
  ): Promise<WalletInfo> {
    // Verify wallet belongs to user
    const wallet = await prisma.wallet.findFirst({
      where: {
        id: walletId,
        userId
      }
    });

    if (!wallet) {
      throw new Error('Wallet no encontrada');
    }

    const updatedWallet = await prisma.wallet.update({
      where: { id: walletId },
      data: { nickname: label },
      select: {
        id: true,
        walletAddress: true,
        nickname: true,
        isPrimary: true,
        // createdAt removed from schema
      }
    });

    // Map to interface
    return {
      id: updatedWallet.id,
      address: updatedWallet.walletAddress,
      label: updatedWallet.nickname,
      isPrimary: updatedWallet.isPrimary,
      // createdAt removed from Wallet model
    };
  }

  /**
   * Obtener wallet principal del usuario
   */
  static async getPrimaryWallet(userId: string): Promise<WalletInfo | null> {
    const wallet = await prisma.wallet.findFirst({
      where: {
        userId,
        isPrimary: true
      },
      select: {
        id: true,
        walletAddress: true,
        nickname: true,
        isPrimary: true,
        // createdAt removed from schema
      }
    });

    if (!wallet) {
      return null;
    }

    // Map to interface
    return {
      id: wallet.id,
      address: wallet.walletAddress,
      label: wallet.nickname,
      isPrimary: wallet.isPrimary,
      // createdAt removed from Wallet model
    };
  }

  /**
   * Verificar propiedad de wallet firmando un mensaje
   * Usado durante la conexión de wallet para probar que el usuario es dueño de la wallet
   */
  static verifyWalletSignature(
    address: string,
    message: string,
    signature: string
  ): boolean {
    try {
      const recoveredAddress = ethers.verifyMessage(message, signature);
      return recoveredAddress.toLowerCase() === address.toLowerCase();
    } catch {
      return false;
    }
  }

  /**
   * Generar un mensaje de desafío para verificación de wallet
   */
  static generateChallengeMessage(address: string): string {
    const timestamp = Date.now();
    return `Firme este mensaje para verificar que es dueño de la wallet ${address}. Marca de tiempo: ${timestamp}`;
  }
}
