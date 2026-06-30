
/**
 * Controlador de firmas digitales.
 *
 * Gestiona la preparacion, confirmacion y consulta de firmas digitales
 * sobre versiones de documentos.
 */
import { Request, Response, NextFunction } from 'express';
import { SignatureService } from '../services/signatureService';
import logger from '../utils/logger';
import { isNonEmptyString, isValidTxHash, toPositiveInteger } from '../utils/validation';

/**
 * Controlador de firmas digitales.
 * Gestiona la preparación, confirmación, consulta y reversión de firmas
 * asociadas a versiones de documentos.
 */
export class SignatureController {
  // ============================================
  // Endpoints del patrón Preparar/Confirmar
  // ============================================

  /**
   * Prepara una firma para su creación.
   * El frontend solicita firmar una versión de documento;
   * el backend crea el registro en estado PREPARING.
   * Endpoint: POST /api/signatures/prepare
   *
   * @param req - Objeto de solicitud HTTP autenticado con { documentId, versionNumber, walletId }.
   * @param res - Objeto de respuesta HTTP.
   * @returns Promesa que resuelve con el resultado de la preparación de la firma.
   */
  static async prepareSignature(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const { documentId, versionNumber, walletId, signerWalletId, comment } = req.body;
      const effectiveWalletId = walletId || signerWalletId;

      if (!isNonEmptyString(documentId)) {
        res.status(400).json({ error: 'El ID del documento es obligatorio' });
        return;
      }

      if (!isNonEmptyString(effectiveWalletId)) {
        res.status(400).json({ error: 'El ID de la wallet es obligatorio (walletId o signerWalletId)' });
        return;
      }

      const parsedVersionNumber = toPositiveInteger(versionNumber || 1);
      if (!parsedVersionNumber) {
        res.status(400).json({ error: 'Número de versión inválido' });
        return;
      }

      const result = await SignatureService.prepareSignature({
        documentId,
        versionNumber: parsedVersionNumber,
        signerUserId: req.user.userId,
        signerWalletId: effectiveWalletId,
        comment: comment || undefined,
      });

      logger.info('[PREPARE] Firma preparada', {
        signatureId: result.signatureId,
        documentId,
        userId: req.user.userId,
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Confirma una firma tras la transacción en blockchain.
   * Endpoint: POST /api/signatures/confirm
   *
   * @param req - Objeto de solicitud HTTP autenticado con { signatureId, txHash, ecdsaSignature }.
   * @param res - Objeto de respuesta HTTP.
   * @returns Promesa que resuelve con la firma confirmada.
   */
  static async confirmSignature(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const { signatureId, txHash, ecdsaSignature } = req.body;

      if (!isNonEmptyString(signatureId)) {
        res.status(400).json({ error: 'El ID de la firma es obligatorio' });
        return;
      }

      if (!isValidTxHash(txHash)) {
        res.status(400).json({ error: 'Hash de transacción inválido' });
        return;
      }

      if (!isNonEmptyString(ecdsaSignature)) {
        res.status(400).json({ error: 'La firma ECDSA es obligatoria' });
        return;
      }

      const signature = await SignatureService.confirmSignature({
        signatureId,
        txHash,
        ecdsaSignature,
        confirmerUserId: req.user.userId,
      });

      logger.info('[CONFIRM] Firma confirmada', {
        signatureId,
        txHash,
        userId: req.user.userId,
      });

      res.status(200).json({ signature });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Revierte una firma que está en estado PREPARING.
   * Endpoint: DELETE /api/signatures/:signatureId/rollback
   *
   * @param req - Objeto de solicitud HTTP autenticado. Los parámetros deben incluir el ID de la firma.
   * @param res - Objeto de respuesta HTTP.
   * @returns Promesa que resuelve con un mensaje de confirmación.
   */
  static async rollbackSignature(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }
      const signatureId = req.params.signatureId as string;
      await SignatureService.rollbackSignature(signatureId, req.user.userId);
      res.status(200).json({ message: 'Firma revertida correctamente' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtiene las firmas de una versión específica identificada por su número.
   * Endpoint: GET /api/documents/:documentId/versions/:versionNumber/signatures
   *
   * @param req - Objeto de solicitud HTTP autenticado. Los parámetros deben incluir el ID del documento y el número de versión.
   * @param res - Objeto de respuesta HTTP.
   * @returns Promesa que resuelve con la lista de firmas de la versión.
   */
  static async getVersionSignaturesByNumber(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const documentId = req.params.documentId as string;
      const versionNumber = parseInt(req.params.versionNumber as string, 10);

      if (isNaN(versionNumber)) {
        res.status(400).json({ error: 'Número de versión inválido' });
        return;
      }

      const signatures = await SignatureService.getVersionSignaturesByNumber(documentId, versionNumber, req.user.userId);
      res.status(200).json({ signatures });
    } catch (error) {
      next(error);
    }
  }


}
