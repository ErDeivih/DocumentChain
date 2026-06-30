/**
 * Controlador de versiones de documentos.
 *
 * Gestiona la creación, consulta, descarga, restauración y cambio de versión
 * operativa de documentos.
 */
import { Request, Response, NextFunction } from 'express';
import { VersionService } from '../services/versionService';
import logger from '../utils/logger';
import { isNonEmptyString, isValidTxHash, toPositiveInteger } from '../utils/validation';
import { validateFile } from '../utils/fileValidation';
import { buildAttachmentDisposition } from '../utils/httpHeaders';
import { NotFoundError, ValidationError } from '../utils/errors';

/**
 * Controlador de versiones de documentos.
 * Gestiona la creación, restauración, consulta, descarga y reversión
 * de versiones asociadas a un documento.
 */
export class VersionController {
  // ============================================
  // Endpoints del patrón Preparar/Confirmar
  // ============================================

  /**
   * Prepara una nueva versión para su creación.
   * El frontend envía el archivo ya cifrado junto con los metadatos de cifrado;
   * el backend lo sube a IPFS y crea el registro en estado PREPARING.
   * Endpoint: POST /api/documents/:documentId/versions/prepare
   *
   * @param req - Objeto de solicitud HTTP autenticado con el archivo y { comment, walletId }.
   * @param res - Objeto de respuesta HTTP.
   * @returns Promesa que resuelve con el resultado de la preparación de la versión.
   */
  static async prepareVersion(req: Request, res: Response, next: NextFunction): Promise<void> {
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
      const {
        comment,
        walletId,
        encryptedSymmetricKey,
        contentHash,
        encryptionIV,
        encryptionAuthTag,
        shareKeys,
      } = req.body;

      // Validar campos requeridos
      if (!walletId) {
        res.status(400).json({ error: 'El ID de la wallet es obligatorio' });
        return;
      }

      // Para subidas cifradas, usar siempre una extensión válida para la validación
      const validation = validateFile('version.txt', 'text/plain', req.file.size);
      if (!validation.valid) {
        res.status(400).json({ error: validation.errors.join(', ') });
        return;
      }

      // Llamar al servicio para preparar version (archivo pre-cifrado por el frontend)
      const result = await VersionService.prepareVersion({
        documentId,
        fileBuffer: req.file.buffer,
        comment,
        userId: req.user.userId,
        walletId,
        encryptedSymmetricKey,
        contentHash,
        encryptionIV,
        encryptionAuthTag,
        shareKeys,
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Confirma la creación de una versión tras la transacción en blockchain.
   * Endpoint: POST /api/documents/:documentId/versions/confirm
   *
   * @param req - Objeto de solicitud HTTP autenticado con { versionId, txHash, blockchainId }.
   * @param res - Objeto de respuesta HTTP.
   * @returns Promesa que resuelve con la versión confirmada.
   */
  static async confirmVersion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const { versionId, txHash, blockchainVersionNumber } = req.body;

      if (!isNonEmptyString(versionId)) {
        res.status(400).json({ error: 'El ID de la versión es obligatorio' });
        return;
      }

      if (!isValidTxHash(txHash)) {
        res.status(400).json({ error: 'Hash de transacción inválido' });
        return;
      }

      const version = await VersionService.confirmVersion({
        versionId,
        txHash,
        blockchainVersionNumber: blockchainVersionNumber || 0,
        confirmerUserId: req.user.userId,
      });

      logger.info('[CONFIRM] Versión confirmada', {
        versionId,
        txHash,
        userId: req.user.userId,
      });

      res.status(200).json({ version });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Prepara la restauración de una versión anterior (fase de preparación).
   * Endpoint: POST /api/documents/:documentId/versions/restore/prepare
   *
   * @param req - Objeto de solicitud HTTP autenticado con { versionNumber, walletId? }.
   * @param res - Objeto de respuesta HTTP.
   * @returns Promesa que resuelve con los datos necesarios para la transacción en blockchain.
   */
  static async prepareRestoreVersion(req: Request, res: Response, next: NextFunction): Promise<void> {
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

      // walletId es opcional — si no lo envía el frontend, el servicio omite la validación de wallet
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
    } catch (error) {
      next(error);
    }
  }

  /**
   * Confirma la restauración de una versión tras la transacción en blockchain.
   * Endpoint: POST /api/versions/:versionId/restore/confirm
   *
   * @param req - Objeto de solicitud HTTP autenticado con { txHash }.
   * @param res - Objeto de respuesta HTTP.
   * @returns Promesa que resuelve con la versión restaurada.
   */
  static async confirmRestoreVersion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const versionId = req.params.versionId as string;
      const { txHash } = req.body;

      if (!isValidTxHash(txHash)) {
        res.status(400).json({ error: 'Hash de transacción inválido' });
        return;
      }

      const version = await VersionService.confirmRestoreVersion(versionId, txHash, req.user.userId);

      logger.info('[RESTORE CONFIRM] Restauración confirmada', {
        versionId,
        txHash,
        userId: req.user.userId,
      });

      res.status(200).json({ version });
    } catch (error) {
      next(error);
    }
  }

  // ============================================
  // Endpoints existentes
  // ============================================

  /**
   * Obtiene todas las versiones de un documento.
   * Endpoint: GET /api/documents/:documentId/versions
   *
   * @param req - Objeto de solicitud HTTP autenticado. Los parámetros deben incluir el ID del documento.
   * @param res - Objeto de respuesta HTTP.
   * @returns Promesa que resuelve con la lista de versiones.
   */
  static async getVersions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const documentId = req.params.documentId as string;
      const versions = await VersionService.getDocumentVersions(documentId, req.user.userId);

      res.status(200).json({ versions });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Prepara el cambio de versión operacional de un documento (fase de preparación on-chain).
   * Endpoint: POST /api/documents/:documentId/operational-version/prepare
   *
   * @param req - Objeto de solicitud HTTP autenticado con { versionNumber }.
   * @param res - Objeto de respuesta HTTP.
   * @returns Promesa que resuelve con los datos necesarios para la transacción en blockchain.
   */
  static async prepareSetOperational(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const documentId = req.params.documentId as string;
      const versionNumber = toPositiveInteger(req.body?.versionNumber);

      if (!versionNumber) {
        res.status(400).json({ error: 'Número de versión inválido' });
        return;
      }

      const result = await VersionService.prepareSetOperational({
        documentId,
        versionNumber,
        userId: req.user.userId,
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Confirma el cambio de versión operacional tras la transacción en blockchain.
   * Endpoint: POST /api/documents/:documentId/operational-version/confirm
   *
   * @param req - Objeto de solicitud HTTP autenticado con { versionNumber, txHash }.
   * @param res - Objeto de respuesta HTTP.
   * @returns Promesa que resuelve con la confirmación del cambio operacional.
   */
  static async confirmSetOperational(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const documentId = req.params.documentId as string;
      const versionNumber = toPositiveInteger(req.body?.versionNumber);
      const txHash = req.body?.txHash as string;

      if (!versionNumber) {
        res.status(400).json({ error: 'Número de versión inválido' });
        return;
      }

      if (!isValidTxHash(txHash)) {
        res.status(400).json({ error: 'Hash de transacción inválido' });
        return;
      }

      await VersionService.confirmSetOperational({
        documentId,
        versionNumber,
        txHash,
        userId: req.user.userId,
      });

      res.status(200).json({
        message: 'Transacción registrada. El cambio se sincronizará con la blockchain en breve.',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtiene una versión específica por su identificador.
   * Endpoint: GET /api/versions/:versionId
   *
   * @param req - Objeto de solicitud HTTP autenticado. Los parámetros deben incluir el ID de la versión.
   * @param res - Objeto de respuesta HTTP.
   * @returns Promesa que resuelve con los datos de la versión.
   */
  static async getVersion(req: Request, res: Response, next: NextFunction): Promise<void> {
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
    } catch (error) {
      next(error);
    }
  }

  /**
   * Descarga una versión específica (devuelve el archivo cifrado).
   * Endpoint: GET /api/versions/:versionId/download
   *
   * @param req - Objeto de solicitud HTTP autenticado. Los parámetros deben incluir el ID de la versión.
   * @param res - Objeto de respuesta HTTP con el archivo adjunto.
   * @returns Promesa que resuelve con el flujo de descarga de la versión.
   */
  static async downloadVersion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const versionId = req.params.versionId as string;

      const result = await VersionService.downloadVersion(versionId, req.user.userId);
      const isUnencrypted = result.encryptedSymmetricKey === 'UNENCRYPTED';

      const extIndex = result.documentName.lastIndexOf('.');
      const baseName = extIndex >= 0 ? result.documentName.substring(0, extIndex) : result.documentName;
      const ext = extIndex >= 0 ? result.documentName.substring(extIndex) : '';
      const filename = `${baseName}-v${result.versionNumber}${ext}${isUnencrypted ? '' : '.encrypted'}`;
      res.setHeader('Content-Type', isUnencrypted ? (result.mimeType || 'application/octet-stream') : 'application/octet-stream');
      res.setHeader('Content-Disposition', buildAttachmentDisposition(filename));
      res.setHeader('X-Mime-Type', result.mimeType);
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
    } catch (error) {
      next(error);
    }
  }

  /**
   * Revierte la creación de una versión eliminando el registro y desanclando de IPFS.
   * Se utiliza cuando la transacción blockchain falla tras la fase de preparación.
   * Endpoint: POST /api/versions/:versionId/rollback
   *
   * @param req - Objeto de solicitud HTTP autenticado. Los parámetros deben incluir el ID de la versión.
   * @param res - Objeto de respuesta HTTP.
   * @returns Promesa que resuelve con la confirmación de reversión.
   */
  static async rollbackVersion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const versionId = req.params.versionId as string;

      await VersionService.rollbackVersion(versionId, req.user.userId);

        res.status(200).json({ message: 'Versión revertida correctamente' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Revierte una restauración de versión eliminando el registro pero preservando IPFS.
   * Se utiliza cuando la transacción blockchain falla tras la fase de preparación de restauración.
   * Endpoint: POST /api/versions/:versionId/rollback-restore
   *
   * @param req - Objeto de solicitud HTTP autenticado. Los parámetros deben incluir el ID de la versión.
   * @param res - Objeto de respuesta HTTP.
   * @returns Promesa que resuelve con la confirmación de reversión.
   */
  static async rollbackVersionRestore(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const versionId = req.params.versionId as string;

      await VersionService.rollbackVersionRestore(versionId, req.user.userId);

        res.status(200).json({ message: 'Restauración de versión revertida correctamente (IPFS preservado)' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Rollback de cambio de version operativa.
   * Endpoint: POST /documents/:id/operational-version/rollback
   */
  static async rollbackSetOperational(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }
      const { documentId } = req.params;
      await VersionService.rollbackSetOperational(documentId, req.user.userId);
      res.status(200).json({ success: true, message: 'Cambio de version operativa cancelado' });
    } catch (error) {
      next(error);
    }
  }
}
