/**
 * Controlador de versiones refactorizado para firmas de wallet en el frontend.
 *
 * Implementa el patrón preparar/confirmar:
 * - prepareVersion: Crea el registro en base de datos con estado PREPARING.
 * - confirmVersion: Actualiza el registro tras la transacción en blockchain.
 *
 * El backend ya NO maneja contraseñas, cifra archivos ni firma transacciones;
 * estas operaciones las realiza el frontend o la wallet del usuario.
 */
import { Request, Response } from 'express';
import { VersionService } from '../services/versionService';
import logger from '../utils/logger';

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
   * Confirma la creación de una versión tras la transacción en blockchain.
   * Endpoint: POST /api/documents/:documentId/versions/confirm
   *
   * @param req - Objeto de solicitud HTTP autenticado con { versionId, txHash, blockchainId }.
   * @param res - Objeto de respuesta HTTP.
   * @returns Promesa que resuelve con la versión confirmada.
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
   * Prepara la restauración de una versión anterior (fase de preparación).
   * Endpoint: POST /api/documents/:documentId/versions/restore/prepare
   *
   * @param req - Objeto de solicitud HTTP autenticado con { versionNumber, walletId? }.
   * @param res - Objeto de respuesta HTTP.
   * @returns Promesa que resuelve con los datos necesarios para la transacción en blockchain.
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
   * Confirma la restauración de una versión tras la transacción en blockchain.
   * Endpoint: POST /api/versions/:versionId/restore/confirm
   *
   * @param req - Objeto de solicitud HTTP autenticado con { txHash }.
   * @param res - Objeto de respuesta HTTP.
   * @returns Promesa que resuelve con la versión restaurada.
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
      if (error.message?.includes('no encontrado')) {
        res.status(404).json({ error: error.message });
        return;
      }
      if (error.message?.includes('acceso') || error.message?.includes('permiso')) {
        res.status(403).json({ error: error.message });
        return;
      }
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Crea una nueva versión mediante el endpoint legado.
   * @deprecated Utilizar /versions/prepare + /versions/confirm en su lugar.
   * Endpoint: POST /api/documents/:documentId/versions
   *
   * @param req - Objeto de solicitud HTTP autenticado.
   * @param res - Objeto de respuesta HTTP.
   * @returns Promesa que resuelve con un error indicando la deprecación.
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
   * Prepara el cambio de versión operacional de un documento (fase de preparación on-chain).
   * Endpoint: POST /api/documents/:documentId/operational-version/prepare
   *
   * @param req - Objeto de solicitud HTTP autenticado con { versionNumber }.
   * @param res - Objeto de respuesta HTTP.
   * @returns Promesa que resuelve con los datos necesarios para la transacción en blockchain.
   */
  static async prepareSetOperational(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const documentId = req.params.documentId as string;
      const versionNumber = Number(req.body?.versionNumber);

      if (!Number.isInteger(versionNumber) || versionNumber <= 0) {
        res.status(400).json({ error: 'Número de versión inválido' });
        return;
      }

      const result = await VersionService.prepareSetOperational({
        documentId,
        versionNumber,
        userId: req.user.userId,
      });

      res.status(200).json(result);
    } catch (error: any) {
      logger.error('[PREPARE] Error al preparar cambio de versión operacional', {
        error: error.message,
        userId: req.user?.userId,
      });
      res.status(400).json({ error: error.message });
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
  static async confirmSetOperational(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const documentId = req.params.documentId as string;
      const versionNumber = Number(req.body?.versionNumber);
      const txHash = req.body?.txHash as string;

      if (!Number.isInteger(versionNumber) || versionNumber <= 0) {
        res.status(400).json({ error: 'Número de versión inválido' });
        return;
      }

      if (!txHash || typeof txHash !== 'string') {
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
    } catch (error: any) {
      logger.error('[CONFIRM] Error al confirmar cambio de versión operacional', {
        error: error.message,
        userId: req.user?.userId,
      });
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Restaura una versión anterior creando una nueva versión con el contenido antiguo (legado).
   * @deprecated Utilizar /versions/restore/prepare + /versions/restore/confirm en su lugar.
   * Endpoint: POST /api/documents/:documentId/versions/:versionId/restore
   *
   * @param req - Objeto de solicitud HTTP autenticado.
   * @param res - Objeto de respuesta HTTP.
   * @returns Promesa que resuelve con un error indicando la deprecación.
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
   * Obtiene una versión específica por su identificador.
   * Endpoint: GET /api/versions/:versionId
   *
   * @param req - Objeto de solicitud HTTP autenticado. Los parámetros deben incluir el ID de la versión.
   * @param res - Objeto de respuesta HTTP.
   * @returns Promesa que resuelve con los datos de la versión.
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
   * Descarga una versión específica (devuelve el archivo cifrado).
   * Endpoint: GET /api/versions/:versionId/download
   *
   * @param req - Objeto de solicitud HTTP autenticado. Los parámetros deben incluir el ID de la versión.
   * @param res - Objeto de respuesta HTTP con el archivo adjunto.
   * @returns Promesa que resuelve con el flujo de descarga de la versión.
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

      const filename = `${result.documentName}-v${result.versionNumber}${isUnencrypted ? '' : '.encrypted'}`;
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
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
    } catch (error: any) {
      logger.error('Error al descargar versión:', error);
      res.status(400).json({ error: error.message });
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
   * Revierte una restauración de versión eliminando el registro pero preservando IPFS.
   * Se utiliza cuando la transacción blockchain falla tras la fase de preparación de restauración.
   * Endpoint: POST /api/versions/:versionId/rollback-restore
   *
   * @param req - Objeto de solicitud HTTP autenticado. Los parámetros deben incluir el ID de la versión.
   * @param res - Objeto de respuesta HTTP.
   * @returns Promesa que resuelve con la confirmación de reversión.
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
