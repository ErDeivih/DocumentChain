/**
 * Controlador de firmas refactorizado para firmas de wallet en el frontend.
 *
 * Implementa el patrón preparar/confirmar:
 * - prepareSignature: Crea el registro en base de datos con estado PREPARING.
 * - confirmSignature: Actualiza el registro tras la transacción en blockchain.
 *
 * El backend ya NO maneja contraseñas ni firma transacciones blockchain;
 * estas operaciones las realiza la wallet del usuario.
 */
import { Request, Response } from 'express';
import { SignatureService } from '../services/signatureService';
import logger from '../utils/logger';
import prisma from '../config/database';

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
  static async prepareSignature(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const { documentId, versionNumber, walletId, signerWalletId } = req.body;
      // Accept either field name to be compatible with different frontend versions
      const effectiveWalletId = walletId || signerWalletId;

      // Validate required fields
      if (!documentId) {
        res.status(400).json({ error: 'El ID del documento es obligatorio' });
        return;
      }

      // walletId is REQUIRED — the user must explicitly choose the wallet they sign with.
      // We do NOT fall back to the primary wallet: the signer is a deliberate identity choice.
      if (!effectiveWalletId) {
        res.status(400).json({ error: 'El ID de la wallet es obligatorio (walletId o signerWalletId)' });
        return;
      }

      const result = await SignatureService.prepareSignature({
        documentId,
        versionNumber: versionNumber || 1,
        signerUserId: req.user.userId,
        signerWalletId: effectiveWalletId,
      });

      logger.info('[PREPARE] Firma preparada', {
        signatureId: result.signatureId,
        documentId,
        userId: req.user.userId,
      });

      res.status(200).json(result);
    } catch (error: any) {
      logger.error('[PREPARE] Error al preparar firma', {
        error: error.message,
        userId: req.user?.userId,
      });
      res.status(400).json({ error: error.message });
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
  static async confirmSignature(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const { signatureId, txHash, ecdsaSignature } = req.body;

      if (!signatureId) {
        res.status(400).json({ error: 'El ID de la firma es obligatorio' });
        return;
      }

      if (!txHash) {
        res.status(400).json({ error: 'El hash de la transacción es obligatorio' });
        return;
      }

      if (!ecdsaSignature) {
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
    } catch (error: any) {
      logger.error('[CONFIRM] Error al confirmar firma', {
        error: error.message,
        userId: req.user?.userId,
      });
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Obtiene todas las firmas asociadas a una versión específica.
   * Endpoint: GET /api/versions/:versionId/signatures
   *
   * @param req - Objeto de solicitud HTTP autenticado. Los parámetros deben incluir el ID de la versión.
   * @param res - Objeto de respuesta HTTP.
   * @returns Promesa que resuelve con la lista de firmas.
   */
  static async getVersionSignatures(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const versionId = req.params.versionId as string;

      const signatures = await SignatureService.getVersionSignatures(versionId, req.user.userId);
      res.status(200).json({ signatures });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Obtiene todas las firmas asociadas a un documento.
   * Endpoint: GET /api/documents/:documentId/signatures
   *
   * @param req - Objeto de solicitud HTTP autenticado. Los parámetros deben incluir el ID del documento.
   * @param res - Objeto de respuesta HTTP.
   * @returns Promesa que resuelve con la lista de firmas del documento.
   */
  static async getDocumentSignatures(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const documentId = req.params.documentId as string;

      const signatures = await SignatureService.getDocumentSignatures(documentId, req.user.userId);
      res.status(200).json({ signatures });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Verifica si el usuario autenticado ha firmado una versión específica.
   * Endpoint: GET /api/versions/:versionId/signatures/check
   *
   * @param req - Objeto de solicitud HTTP autenticado. Los parámetros deben incluir el ID de la versión.
   * @param res - Objeto de respuesta HTTP.
   * @returns Promesa que resuelve con un indicador booleano.
   */
  static async checkSignature(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const versionId = req.params.versionId as string;

      const hasSigned = await SignatureService.checkSignature(versionId, req.user.userId);
      res.status(200).json({ hasSigned });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Obtiene la firma del usuario autenticado para una versión específica.
   * Endpoint: GET /api/versions/:versionId/signatures/me
   *
   * @param req - Objeto de solicitud HTTP autenticado. Los parámetros deben incluir el ID de la versión.
   * @param res - Objeto de respuesta HTTP.
   * @returns Promesa que resuelve con la firma del usuario o un error 404.
   */
  static async getMySignature(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const versionId = req.params.versionId as string;

      const signature = await SignatureService.getMySignature(versionId, req.user.userId);

      if (!signature) {
        res.status(404).json({ error: 'Firma no encontrada' });
        return;
      }

      res.status(200).json({ signature });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Revierte una firma en estado PREPARING eliminando su registro.
   * Endpoint: POST /api/signatures/:signatureId/rollback
   *
   * @param req - Objeto de solicitud HTTP autenticado. Los parámetros deben incluir el ID de la firma.
   * @param res - Objeto de respuesta HTTP.
   * @returns Promesa que resuelve con la confirmación de reversión.
   */
  static async rollbackSignature(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const signatureId = req.params.signatureId as string;

      await SignatureService.rollbackSignature(signatureId, req.user.userId);
      res.status(200).json({ message: 'Firma revertida correctamente' });
    } catch (error: any) {
      logger.error('[ROLLBACK] Error al revertir firma', {
        error: error.message,
        userId: req.user?.userId,
      });
      res.status(400).json({ error: error.message });
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
  static async getVersionSignaturesByNumber(req: Request, res: Response): Promise<void> {
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

      // Resolve versionId from documentId + versionNumber
      const version = await prisma.version.findFirst({
        where: { documentId, versionNumber },
      });

      if (!version) {
        res.status(404).json({ error: 'Versión no encontrada' });
        return;
      }

      const signatures = await SignatureService.getVersionSignatures(version.id, req.user.userId);
      res.status(200).json({ signatures });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
