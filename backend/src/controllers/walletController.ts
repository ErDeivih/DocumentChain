import { Request, Response } from 'express';
import { WalletService } from '../services/walletService';
import { BlockchainAdminService } from '../services/blockchainAdminService';
import logger from '../utils/logger';

/**
 * Controlador de wallets.
 * Gestiona la obtención, adición, eliminación, configuración principal
 * y verificación de las direcciones de wallet de los usuarios.
 */
export class WalletController {
  /**
   * Obtiene todas las wallets asociadas al usuario autenticado.
   * Endpoint: GET /api/wallets
   *
   * @param req - Objeto de solicitud HTTP autenticado.
   * @param res - Objeto de respuesta HTTP.
   * @returns Promesa que resuelve con la lista de wallets.
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
   * Añade una nueva wallet al usuario autenticado.
   * Endpoint: POST /api/wallets
   *
   * @param req - Objeto de solicitud HTTP autenticado con { address, signature?, message?, label?, isPrimary? }.
   * @param res - Objeto de respuesta HTTP.
   * @returns Promesa que resuelve con la wallet creada.
   */
  static async addWallet(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const { address, signature, message, label, isPrimary } = req.body;

      logger.debug(`[wallets:add] user=${req.user.userId} address=${address} label=${label} isPrimary=${isPrimary} hasSig=${!!signature} hasMsg=${!!message}`);

      if (!address) {
        res.status(400).json({ error: 'Se requiere la dirección de la wallet' });
        return;
      }

      if (!signature || !message) {
        res.status(400).json({ error: 'Se requiere la firma del desafío de wallet' });
        return;
      }

      const isValid = WalletService.verifyWalletSignature(address, message, signature);

      if (!isValid) {
        res.status(400).json({ error: 'Firma de wallet inválida' });
        return;
      }

      const wallet = await WalletService.addWallet(
        req.user.userId,
        address,
        label,
        isPrimary
      );

      logger.debug(`[wallets:add] created walletId=${wallet.id}`);

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
      logger.error('[wallets:add] error', error);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Elimina una wallet del usuario autenticado.
   * Endpoint: DELETE /api/wallets/:walletId
   *
   * @param req - Objeto de solicitud HTTP autenticado. Los parámetros deben incluir el ID de la wallet.
   * @param res - Objeto de respuesta HTTP.
   * @returns Promesa que resuelve con la confirmación de eliminación.
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
   * Establece una wallet como principal para el usuario autenticado.
   * Endpoint: PUT /api/wallets/:walletId/primary
   *
   * @param req - Objeto de solicitud HTTP autenticado. Los parámetros deben incluir el ID de la wallet.
   * @param res - Objeto de respuesta HTTP.
   * @returns Promesa que resuelve con la wallet actualizada.
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
   * Actualiza la etiqueta (nombre descriptivo) de una wallet.
   * Endpoint: PUT /api/wallets/:walletId/label
   *
   * @param req - Objeto de solicitud HTTP autenticado con { label } en el cuerpo.
   * @param res - Objeto de respuesta HTTP.
   * @returns Promesa que resuelve con la wallet actualizada.
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
   * Genera un mensaje de desafío para la verificación de propiedad de una wallet.
   * Endpoint: POST /api/wallets/challenge
   *
   * @param req - Objeto de solicitud HTTP con { address } en el cuerpo.
   * @param res - Objeto de respuesta HTTP.
   * @returns Promesa que resuelve con el mensaje de desafío.
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
   * Obtiene la wallet principal del usuario autenticado.
   * Endpoint: GET /api/wallets/primary
   *
   * @param req - Objeto de solicitud HTTP autenticado.
   * @param res - Objeto de respuesta HTTP.
   * @returns Promesa que resuelve con la wallet principal o un error 404.
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
