/**
 * Version Controller - Refactored for Frontend Wallet Signatures
 * 
 * Implements the prepare/confirm pattern:
 * - prepareVersion: Creates DB record with PREPARING status
 * - confirmVersion: Updates record after blockchain transaction
 * 
 * The backend NO LONGER:
 * - Handles passwords
 * - Encrypts files (frontend does this)
 * - Signs blockchain transactions (user's wallet does this)
 */

import { Request, Response } from 'express';
import { VersionService } from '../services/versionService';
import logger from '../utils/logger';

export class VersionController {
  // ============================================
  // NEW: Prepare/Confirm Pattern Endpoints
  // ============================================

  /**
   * Prepare a version for creation
   * POST /api/documents/:documentId/versions/prepare
   * 
   * Frontend sends already-encrypted file with encryption metadata.
   * Backend uploads to IPFS and creates DB record with PREPARING status.
   */
  static async prepareVersion(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      if (!req.file) {
        res.status(400).json({ error: 'No se ha subido ningún archivo' });
        return;
      }

      const documentId = req.params.documentId as string;
      const { comment, walletId } = req.body;

      // Validate required fields
      if (!walletId) {
        res.status(400).json({ error: 'El ID de la wallet es obligatorio' });
        return;
      }

      // Call service to prepare version (backend encrypts the file)
      const result = await VersionService.prepareVersion({
        documentId,
        fileBuffer: req.file.buffer,
        comment,
        userId: req.user.userId,
        walletId,
      });

      res.status(200).json(result);
    } catch (error: any) {
      logger.error('[PREPARE] Error al preparar versión', {
        error: error.message,
        userId: req.user?.userId,
      });
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Confirm a version after blockchain transaction
   * POST /api/documents/:documentId/versions/confirm
   * 
   * Frontend calls this after signing and submitting the blockchain transaction.
   */
  static async confirmVersion(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const documentId = req.params.documentId as string;
      const { versionId, txHash, blockchainId } = req.body;

      if (!versionId) {
        res.status(400).json({ error: 'El ID de la versión es obligatorio' });
        return;
      }

      if (!txHash) {
        res.status(400).json({ error: 'El hash de la transacción es obligatorio' });
        return;
      }

      const version = await VersionService.confirmVersion({
        versionId,
        txHash,
        blockchainVersionNumber: typeof blockchainId === 'number' ? blockchainId : parseInt(blockchainId as string) || 0,
      });

      logger.info('[CONFIRM] Versión confirmada', {
        versionId,
        txHash,
        userId: req.user.userId,
      });

      res.status(200).json({ version });
    } catch (error: any) {
      logger.error('[CONFIRM] Error al confirmar versión', {
        error: error.message,
        userId: req.user?.userId,
      });
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Prepare a version restore
   * POST /api/documents/:documentId/versions/restore/prepare
   */
  static async prepareRestoreVersion(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const documentId = req.params.documentId as string;
      const { versionNumber, walletId } = req.body;

      if (typeof versionNumber === 'undefined' || versionNumber === null) {
        res.status(400).json({ error: 'El número de versión es obligatorio' });
        return;
      }

      // walletId is optional — if not sent by frontend the service skips wallet validation
      const result = await VersionService.prepareRestoreVersion(
        documentId,
        Number(versionNumber),
        req.user.userId,
        walletId,
      );

      logger.info('[RESTORE PREPARE] Restauración preparada', {
        versionId: result.versionId,
        documentId,
        userId: req.user.userId,
      });

      res.status(200).json(result);
    } catch (error: any) {
      logger.error('[RESTORE PREPARE] Error al preparar restauración', {
        error: error.message,
        userId: req.user?.userId,
      });
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Confirm a version restore after blockchain transaction
   * POST /api/versions/:versionId/restore/confirm
   */
  static async confirmRestoreVersion(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const versionId = req.params.versionId as string;
      const { txHash } = req.body;

      if (!txHash) {
        res.status(400).json({ error: 'El hash de la transacción es obligatorio' });
        return;
      }

      const version = await VersionService.confirmRestoreVersion(versionId, txHash);

      logger.info('[RESTORE CONFIRM] Restauración confirmada', {
        versionId,
        txHash,
        userId: req.user.userId,
      });

      res.status(200).json({ version });
    } catch (error: any) {
      logger.error('[RESTORE CONFIRM] Error al confirmar restauración', {
        error: error.message,
        userId: req.user?.userId,
      });
      res.status(400).json({ error: error.message });
    }
  }

  // ============================================
  // Existing Endpoints
  // ============================================

  /**
   * Get all versions of a document
   * GET /api/documents/:documentId/versions
   */
  static async getVersions(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const documentId = req.params.documentId as string;
      const versions = await VersionService.getDocumentVersions(documentId, req.user.userId);

      res.status(200).json({ versions });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Create new version (legacy - will be deprecated)
   * POST /api/documents/:documentId/versions
   */
  static async createVersion(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      if (!req.file) {
        res.status(400).json({ error: 'No se ha subido ningún archivo' });
        return;
      }

      // Legacy endpoint - redirect to new pattern
      res.status(400).json({
        error: 'Este endpoint está deprecado. Use /versions/prepare + /versions/confirm',
        deprecated: true,
      });
    } catch (error: any) {
      logger.error('Error al crear versión:', error);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Set version as operational
   * PUT /api/documents/:documentId/versions/:versionId/operational
   */
  static async setOperational(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const documentId = req.params.documentId as string;
      let versionNumber = Number(req.body?.versionNumber);

      if (!Number.isInteger(versionNumber) || versionNumber <= 0) {
        const versionId = req.params.versionId as string | undefined;

        if (!versionId) {
          res.status(400).json({ error: 'Número de versión inválido' });
          return;
        }

        const version = await VersionService.getVersion(versionId, req.user.userId);

        if (!version) {
          res.status(404).json({ error: 'Versión no encontrada' });
          return;
        }

        versionNumber = version.versionNumber;
      }

      const version = await VersionService.setOperationalVersion(documentId, versionNumber, req.user.userId);

      if (!version) {
        res.status(404).json({ error: 'Versión no encontrada' });
        return;
      }

      res.status(200).json({ message: 'Versión establecida como operacional', version });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Restore a version (creates new version with old content)
   * POST /api/documents/:documentId/versions/:versionId/restore
   */
  static async restoreVersion(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const documentId = req.params.documentId as string;
      const versionId = req.params.versionId as string;
      const { password, comment } = req.body;

      // Legacy endpoint - redirect to new pattern
      res.status(400).json({
        error: 'Este endpoint está deprecado. Use /versions/prepare + /versions/confirm',
        deprecated: true,
      });
    } catch (error: any) {
      logger.error('Error al restaurar versión:', error);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Get specific version
   * GET /api/versions/:versionId
   */
  static async getVersion(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const versionId = req.params.versionId as string;

      const version = await VersionService.getVersion(versionId, req.user.userId);

      if (!version) {
        res.status(404).json({ error: 'Versión no encontrada' });
        return;
      }

      res.status(200).json({ version });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Download specific version (returns encrypted file)
   * GET /api/versions/:versionId/download
   */
  static async downloadVersion(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const versionId = req.params.versionId as string;

      const result = await VersionService.downloadVersion(versionId, req.user.userId);
      const isUnencrypted = result.encryptedSymmetricKey === 'UNENCRYPTED';

      res.setHeader('X-IPFS-CID', result.ipfsCid);
      if (!isUnencrypted) {
        res.setHeader('X-Encrypted-Symmetric-Key', result.encryptedSymmetricKey);
        if (result.encryptionIV) {
          res.setHeader('X-Encryption-IV', result.encryptionIV);
        }
        if (result.encryptionAuthTag) {
          res.setHeader('X-Encryption-Auth-Tag', result.encryptionAuthTag);
        }
      }
      res.setHeader('X-Is-Encrypted', isUnencrypted ? 'false' : 'true');

      res.send(result.encryptedFile);
    } catch (error: any) {
      logger.error('Error al descargar versión:', error);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Rollback version creation
   * POST /api/versions/:versionId/rollback
   * 
   * Deletes version and unpins from IPFS.
   * Used when blockchain transaction fails after prepare.
   */
  static async rollbackVersion(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const versionId = req.params.versionId as string;

      await VersionService.rollbackVersion(versionId, req.user.userId);

      res.status(200).json({ message: 'Version rolled back successfully' });
    } catch (error: any) {
      logger.error('Error rolling back version', { error: error.message, userId: req.user?.userId });
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Rollback version restore
   * POST /api/versions/:versionId/rollback-restore
   * 
   * Deletes version but keeps IPFS (belongs to original version).
   * Used when blockchain transaction fails after restore prepare.
   */
  static async rollbackVersionRestore(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const versionId = req.params.versionId as string;

      await VersionService.rollbackVersionRestore(versionId, req.user.userId);

      res.status(200).json({ message: 'Version restore rolled back successfully (IPFS preserved)' });
    } catch (error: any) {
      logger.error('Error rolling back version restore', { error: error.message, userId: req.user?.userId });
      res.status(400).json({ error: error.message });
    }
  }
}
