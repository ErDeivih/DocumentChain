/**
 * Transfer Routes
 * API endpoints para transferencia de propiedad de documentos
 */

import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { TransferService } from '../services/transferService';
import logger from '../utils/logger';

const router = Router();

/**
 * POST /api/transfers/prepare
 * Preparar transferencia de documento
 */
router.post('/prepare', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const {
      documentId,
      newOwnerId,
      currentOwnerWalletId,
      newOwnerWalletAddress,
      decryptedSymmetricKey,
    } = req.body;

    if (!documentId || !newOwnerId || !currentOwnerWalletId || !newOwnerWalletAddress) {
      return res.status(400).json({
        error: 'Faltan parámetros requeridos',
      });
    }

    const result = await TransferService.prepareTransfer({
      documentId,
      currentOwnerId: userId,
      newOwnerId,
      currentOwnerWalletId,
      newOwnerWalletAddress,
      decryptedSymmetricKey,
    });

    logger.info(`Transfer preparada: ${documentId} -> ${newOwnerId}`, {
      userId,
      documentId,
      transferId: result.transferId,
    });

    res.status(200).json(result);
  } catch (error: any) {
    logger.error('Error al preparar transferencia', {
      error: error.message,
      userId: req.user?.userId,
    });
    res.status(400).json({ error: error.message || 'Error al preparar transferencia' });
  }
});

/**
 * POST /api/transfers/confirm
 * Confirmar transferencia después de transacción blockchain
 */
router.post('/confirm', authenticate, async (req: Request, res: Response) => {
  try {
    const { transferId, txHash, signature } = req.body;

    if (!transferId || !txHash || !signature) {
      return res.status(400).json({
        error: 'Faltan parámetros requeridos',
      });
    }

    await TransferService.confirmTransfer({
      transferId,
      txHash,
      signature,
    });

    logger.info(`Transfer confirmada: ${transferId}`, {
      userId: req.user?.userId,
      txHash,
    });

    res.status(200).json({
      success: true,
      message: 'Transferencia confirmada exitosamente',
    });
  } catch (error: any) {
    logger.error('Error al confirmar transferencia', {
      error: error.message,
      userId: req.user?.userId,
    });
    res.status(400).json({ error: error.message || 'Error al confirmar transferencia' });
  }
});

/**
 * GET /api/transfers/history/:documentId
 * Obtener historial de transferencias de un documento
 */
router.get('/history/:documentId', authenticate, async (req: Request, res: Response) => {
  try {
    const documentId = req.params.documentId as string;

    const history = await TransferService.getTransferHistory(documentId);

    res.status(200).json({ history });
  } catch (error: any) {
    logger.error('Error al obtener historial de transferencias', {
      error: error.message,
      userId: req.user?.userId,
    });
    res.status(400).json({ error: error.message || 'Error al obtener historial' });
  }
});

export default router;
