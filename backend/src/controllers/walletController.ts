import { Request, Response } from 'express';
import { WalletService } from '../services/walletService';
import { BlockchainAdminService } from '../services/blockchainAdminService';
import logger from '../utils/logger';

export class WalletController {
  /**
   * Obtener todas las wallets del usuario actual
   * GET /api/wallets
   */
  static async getWallets(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const wallets = await WalletService.getUserWallets(req.user.userId);

      res.status(200).json({ wallets });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Añadir una nueva wallet
   * POST /api/wallets
   * Body: { address, signature, message, label?, isPrimary? }
   */
  static async addWallet(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const { address, signature, message, label, isPrimary } = req.body;

      console.debug(`[wallets:add] user=${req.user.userId} address=${address} label=${label} isPrimary=${isPrimary} hasSig=${!!signature} hasMsg=${!!message}`);

      if (!address) {
        res.status(400).json({ error: 'Se requiere la dirección de la wallet' });
        return;
      }

      // Verificar propiedad de la wallet si se proporciona firma
      if (signature && message) {
        const isValid = WalletService.verifyWalletSignature(address, message, signature);
        
        if (!isValid) {
          res.status(400).json({ error: 'Firma de wallet inválida' });
          return;
        }
      }

      const wallet = await WalletService.addWallet(
        req.user.userId,
        address,
        label,
        isPrimary
      );

      console.debug(`[wallets:add] created walletId=${wallet.id}`);

      // Si el usuario es admin, sincronizar con blockchain
      try {
        const syncResult = await BlockchainAdminService.syncAdminOnWalletConnect(req.user.userId, address);
        if (syncResult) {
          if (syncResult.success) {
            logger.info(`✅ Admin sincronizado con blockchain al conectar wallet, tx: ${syncResult.txHash}`);
          } else {
            logger.warn(`⚠️ No se pudo sincronizar admin con blockchain: ${syncResult.error}`);
          }
        }
      } catch (syncError) {
        // No fallar la adición de wallet si falla la sincronización
        logger.error('Error al sincronizar admin con blockchain:', syncError);
      }

      res.status(201).json({ wallet });
    } catch (error: any) {
      console.error('[wallets:add] error', error);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Eliminar una wallet
   * DELETE /api/wallets/:walletId
   */
  static async removeWallet(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const walletId = req.params.walletId as string;

      await WalletService.removeWallet(req.user.userId, walletId);

      res.status(200).json({ message: 'Wallet eliminada correctamente' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Establecer wallet principal
   * PUT /api/wallets/:walletId/primary
   */
  static async setPrimaryWallet(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const walletId = req.params.walletId as string;

      const wallet = await WalletService.setPrimaryWallet(req.user.userId, walletId);

      res.status(200).json({ wallet });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Actualizar etiqueta de wallet
   * PUT /api/wallets/:walletId/label
   * Body: { label }
   */
  static async updateLabel(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const walletId = req.params.walletId as string;
      const { label } = req.body;

      if (!label) {
        res.status(400).json({ error: 'Se requiere la etiqueta' });
        return;
      }

      const wallet = await WalletService.updateWalletLabel(
        req.user.userId,
        walletId,
        label
      );

      res.status(200).json({ wallet });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Obtener mensaje de desafío para verificación de wallet
   * POST /api/wallets/challenge
   * Body: { address }
   */
  static async getChallenge(req: Request, res: Response): Promise<void> {
    try {
      const { address } = req.body;

      if (!address) {
        res.status(400).json({ error: 'Se requiere la dirección de la wallet' });
        return;
      }

      const message = WalletService.generateChallengeMessage(address);

      res.status(200).json({ message });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Obtener wallet principal
   * GET /api/wallets/primary
   */
  static async getPrimaryWallet(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const wallet = await WalletService.getPrimaryWallet(req.user.userId);

      if (!wallet) {
        res.status(404).json({ error: 'No se encontró wallet principal' });
        return;
      }

      res.status(200).json({ wallet });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
