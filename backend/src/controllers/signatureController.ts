/**
 * Signature Controller - Refactored for Frontend Wallet Signatures
 * 
 * Implements the prepare/confirm pattern:
 * - prepareSignature: Creates DB record with PREPARING status
 * - confirmSignature: Updates record after blockchain transaction
 * 
 * The backend NO LONGER:
 * - Handles passwords
 * - Signs blockchain transactions (user's wallet does this)
 */

import { Request, Response } from 'express';
import { SignatureService } from '../services/signatureService';
import logger from '../utils/logger';
import prisma from '../config/database';

export class SignatureController {
  // ============================================
  // NEW: Prepare/Confirm Pattern Endpoints
  // ============================================

  /**
   * Prepare a signature for creation
   * POST /api/signatures/prepare
   * 
   * Frontend requests to sign a document version.
   * Backend creates DB record with PREPARING status.
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
   * Confirm a signature after blockchain transaction
   * POST /api/signatures/confirm
   * 
   * Frontend calls this after signing and submitting the blockchain transaction.
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
   * Get signatures for a version
   * GET /api/versions/:versionId/signatures
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
   * Get all signatures for a document
   * GET /api/documents/:documentId/signatures
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
   * Check if user has signed a version
   * GET /api/versions/:versionId/signatures/check
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
   * Get user's signature for a version
   * GET /api/versions/:versionId/signatures/me
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
   * Rollback a signature preparation (delete PREPARING record)
   * POST /api/signatures/:signatureId/rollback
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
   * Get signatures for a specific version by version number
   * GET /api/documents/:documentId/versions/:versionNumber/signatures
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
