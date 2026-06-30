/**
 * Controlador de documentos.
 *
 * Gestiona la subida, descarga, archivado, eliminación, transferencia
 * y restauración de documentos.
 */
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { DocumentService } from '../services/documentService';
import { TransferService } from '../services/transferService';
import { DocumentPermissionService } from '../services/documentPermissionService';
import { DocumentLifecycleService } from '../services/documentLifecycleService';
import logger from '../utils/logger';
import { isNonEmptyString, isValidTxHash } from '../utils/validation';
import { validateFile } from '../utils/fileValidation';
import { setDownloadHeaders, DownloadResult } from '../utils/downloadHeaders';
import { assertDocumentArchivedReceipt } from '../services/blockchainReceiptService';
import { NotFoundError, ValidationError } from '../utils/errors';

/**
 * Controlador de gestión de documentos.
 * Gestiona el ciclo de vida completo de los documentos: creación, consulta,
 * descarga, archivado, eliminación, transferencia y restauración.
 */
export class DocumentController {
  /**
    * Prepara un documento para su creación.
   * El frontend envia el archivo YA CIFRADO (o en crudo si es publico);
   * el backend lo valida, lo sube a IPFS y crea el registro en BD.
   */
  static async prepareDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      if (!req.file) {
        res.status(400).json({ error: 'No se ha subido ningún archivo' });
        return;
      }

      const {
        name,
        description,
        walletId,
        visibility,
        folderId,
        tags,
        fileExtension,
        encryptedSymmetricKey,
        contentHash,
        encryptionIV,
        encryptionAuthTag,
      } = req.body;

      // Validar campos requeridos
      if (!name) {
        res.status(400).json({ error: 'El nombre del documento es obligatorio' });
        return;
      }

      if (!walletId) {
        res.status(400).json({ error: 'El ID de la wallet es obligatorio' });
        return;
      }

      const validation = validateFile(req.file.originalname || name, req.file.mimetype, req.file.size);
      if (!validation.valid) {
        res.status(400).json({ error: validation.errors.join(', ') });
        return;
      }

      const result = await DocumentService.prepareDocument({
        name,
        description,
        mimeType: req.body.mimeType || req.file.mimetype,
        fileBuffer: req.file.buffer, // YA CIFRADO por el frontend (o raw si PUBLIC)
        ownerId: req.user.userId,
        walletId,
        visibility,
        folderId,
        tags: tags ? (typeof tags === 'string' ? JSON.parse(tags) : tags) : undefined,
        fileExtension,
        encryptedSymmetricKey,
        contentHash,
        encryptionIV,
        encryptionAuthTag,
      });

      logger.info('[PREPARE] Documento preparado', { 
        documentId: result.documentId, 
        userId: req.user.userId 
      });

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Confirma la creación de un documento tras la transacción en blockchain.
   * Endpoint: POST /api/documents/confirm
   *
   * @param req - Objeto de solicitud HTTP autenticado con { documentId, txHash, blockchainId }.
   * @param res - Objeto de respuesta HTTP.
   * @returns Promesa que resuelve con el documento confirmado.
   */
  static async confirmDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const { documentId, txHash, blockchainId } = req.body;

      if (!isNonEmptyString(documentId)) {
        res.status(400).json({ error: 'El ID del documento es obligatorio' });
        return;
      }

      if (!isValidTxHash(txHash)) {
        res.status(400).json({ error: 'Hash de transacción inválido' });
        return;
      }

      if (!isNonEmptyString(blockchainId)) {
        res.status(400).json({ error: 'El ID de blockchain es obligatorio' });
        return;
      }

      const document = await DocumentService.confirmDocument({
        documentId,
        txHash,
        blockchainId,
        confirmerUserId: req.user.userId,
      });

      logger.info('[CONFIRM] Documento confirmado', { 
        documentId, 
        txHash, 
        userId: req.user.userId 
      });

      res.status(200).json({ document });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtiene un documento por su identificador.
   * Endpoint: GET /api/documents/:documentId
   *
   * @param req - Objeto de solicitud HTTP autenticado. Los parámetros deben incluir el ID del documento.
   * @param res - Objeto de respuesta HTTP.
   * @returns Promesa que resuelve con los datos del documento.
   */
  static async getDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const documentId = req.params.documentId as string;

      const document = await DocumentService.getDocumentById(
        documentId,
        req.user.userId
      );

      if (!document) {
        res.status(404).json({ error: 'Documento no encontrado o acceso denegado' });
        return;
      }

      res.status(200).json({ document });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Descarga un documento (devuelve el archivo cifrado).
   * Si la clave simétrica cifrada es 'UNENCRYPTED', el archivo es público.
   * Endpoint: GET /api/documents/:documentId/download
   *
   * @param req - Objeto de solicitud HTTP autenticado. Los parámetros deben incluir el ID del documento.
   * @param res - Objeto de respuesta HTTP con el archivo adjunto.
   * @returns Promesa que resuelve con el flujo de descarga del documento.
   */
  static async downloadDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const documentId = req.params.documentId as string;

      const result = await DocumentService.downloadDocument(
        documentId,
        req.user.userId
      );

      setDownloadHeaders(res, result as DownloadResult);

      res.send(result.encryptedFile);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lista los documentos accesibles para el usuario autenticado.
   * Permite filtrar por wallet, estado de archivado, término de búsqueda y tipo de archivo.
   * Endpoint: GET /api/documents
   *
   * @param req - Objeto de solicitud HTTP autenticado con filtros en la query string.
   * @param res - Objeto de respuesta HTTP.
   * @returns Promesa que resuelve con la lista paginada de documentos.
   */
  static async listDocuments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const { walletId, includeArchived, onlyArchived, folderId, search, fileType } = req.query;
      const page = req.pagination?.page ?? (parseInt(req.query.page as string) || 1);
      const limit = req.pagination?.limit ?? (parseInt(req.query.limit as string) || 10);

      const documents = await DocumentService.listDocuments(
        req.user.userId,
        {
          page,
          limit,
          walletId: walletId as string,
          includeArchived: includeArchived === 'true',
          onlyArchived: onlyArchived === 'true',
          folderId: folderId as string,
          search: search as string,
          fileType: fileType as string,
        }
      );

      res.status(200).json(documents);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Prepara el archivado de un documento (fase de preparación).
   * Endpoint: POST /api/documents/:documentId/archive/prepare
   *
   * @param req - Objeto de solicitud HTTP autenticado. Los parámetros deben incluir el ID del documento.
   * @param res - Objeto de respuesta HTTP.
   * @returns Promesa que resuelve con los datos necesarios para la transacción en blockchain.
   */
  static async prepareArchiveDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const documentId = req.params.documentId as string;

      const document = await DocumentService.getDocumentById(documentId, req.user.userId);
      if (!document) {
        res.status(404).json({ error: 'Documento no encontrado' });
        return;
      }

      await DocumentPermissionService.validateOwnership(document, req.user.userId, {
        errorMessage: 'No tienes permisos para archivar este documento',
      });

      if (!document.blockchainId) {
        res.status(400).json({ error: 'El documento no tiene ID de blockchain aún' });
        return;
      }

      res.status(200).json({
        documentId,
        blockchainId: document.blockchainId,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Confirma el archivado de un documento tras la transacción en blockchain.
   * Endpoint: POST /api/documents/:documentId/archive/confirm
   *
   * @param req - Objeto de solicitud HTTP autenticado con { txHash } en el cuerpo.
   * @param res - Objeto de respuesta HTTP.
   * @returns Promesa que resuelve con el documento archivado.
   */
  static async confirmArchiveDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const documentId = req.params.documentId as string;
      const { txHash } = req.body;

      if (!isValidTxHash(txHash)) {
        res.status(400).json({ error: 'Hash de transacción inválido' });
        return;
      }

      await DocumentLifecycleService.archiveDocument(documentId, req.user.userId, txHash, req.body.skipOnChainValidation);

      res.status(200).json({ message: 'Documento archivado correctamente' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Prepara la eliminación de un documento (fase de preparación).
   * Endpoint: POST /api/documents/:documentId/delete/prepare
   *
   * @param req - Objeto de solicitud HTTP autenticado. Los parámetros deben incluir el ID del documento.
   * @param res - Objeto de respuesta HTTP.
   * @returns Promesa que resuelve con los datos necesarios para la transacción en blockchain.
   */
  static async prepareDeleteDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const documentId = req.params.documentId as string;
      const document = await DocumentService.getDocumentById(documentId, req.user.userId);
      if (!document) {
        res.status(404).json({ error: 'Documento no encontrado' });
        return;
      }

      await DocumentPermissionService.validateOwnership(document, req.user.userId, {
        errorMessage: 'No tienes permisos para eliminar este documento',
      });

      if (!document.blockchainId) {
        res.status(400).json({ error: 'El documento no tiene ID de blockchain aún' });
        return;
      }

      res.status(200).json({ documentId, blockchainId: document.blockchainId });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Confirma la eliminación de un documento tras la transacción en blockchain.
   * Endpoint: POST /api/documents/:documentId/delete/confirm
   *
   * @param req - Objeto de solicitud HTTP autenticado con { txHash } en el cuerpo.
   * @param res - Objeto de respuesta HTTP.
   * @returns Promesa que resuelve con la confirmación de eliminación.
   */
  static async confirmDeleteDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const documentId = req.params.documentId as string;
      const { txHash } = req.body;

      if (!isValidTxHash(txHash)) {
        res.status(400).json({ error: 'Hash de transacción inválido' });
        return;
      }

      await DocumentLifecycleService.softDeleteDocument(documentId, req.user.userId, txHash, req.body.skipOnChainValidation);

      res.status(200).json({ message: 'Documento eliminado correctamente' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Prepara la desarchivación de un documento (fase de preparación).
   * Endpoint: POST /api/documents/:documentId/unarchive/prepare
   *
   * @param req - Objeto de solicitud HTTP autenticado. Los parámetros deben incluir el ID del documento.
   * @param res - Objeto de respuesta HTTP.
   * @returns Promesa que resuelve con los datos necesarios para la transacción en blockchain.
   */
  static async prepareUnarchiveDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const documentId = req.params.documentId as string;

      const document = await DocumentService.getDocumentById(documentId, req.user.userId);
      if (!document) {
        res.status(404).json({ error: 'Documento no encontrado' });
        return;
      }

      // Validar propiedad (on-chain o BD como respaldo)
      await DocumentPermissionService.validateOwnership(document, req.user.userId, {
        errorMessage: 'No tienes permisos para desarchivar este documento',
      });

      res.status(200).json({
        documentId,
        blockchainId: document.blockchainId,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Confirma la desarchivación de un documento tras la transacción en blockchain.
   * Endpoint: POST /api/documents/:documentId/unarchive/confirm
   *
   * @param req - Objeto de solicitud HTTP autenticado con { txHash } en el cuerpo.
   * @param res - Objeto de respuesta HTTP.
   * @returns Promesa que resuelve con el documento desarchivado.
   */
  static async confirmUnarchiveDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const documentId = req.params.documentId as string;
      const { txHash } = req.body;

      if (!isValidTxHash(txHash)) {
        res.status(400).json({ error: 'Hash de transacción inválido' });
        return;
      }

      await DocumentLifecycleService.unarchiveDocument(documentId, req.user.userId, txHash, req.body.skipOnChainValidation);

      res.status(200).json({ message: 'Documento desarchivado correctamente' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Actualiza los metadatos de un documento sin operación en blockchain.
   * Endpoint: PUT /api/documents/:documentId
   *
   * @param req - Objeto de solicitud HTTP autenticado con los campos a actualizar en el cuerpo.
   * @param res - Objeto de respuesta HTTP.
   * @returns Promesa que resuelve con el documento actualizado.
   */
  static async updateDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const documentId = req.params.documentId as string;
      const { name, description, folderId, tags } = req.body;

      const updated = await DocumentService.updateDocument(documentId, req.user.userId, {
        name, description, folderId, tags,
      });

      res.status(200).json({
        message: 'Documento actualizado correctamente',
        document: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Prepara la transferencia de un documento a otro usuario (fase de preparación).
   * Endpoint: POST /api/documents/:documentId/transfer/prepare
   *
   * @param req - Objeto de solicitud HTTP autenticado con los datos del destinatario y la wallet.
   * @param res - Objeto de respuesta HTTP.
   * @returns Promesa que resuelve con el resultado de la preparación de la transferencia.
   */
  static async prepareTransferDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const documentId = req.params.documentId as string;
      const { newOwnerId, walletId, newOwnerWalletAddress, reEncryptedSymmetricKey } = req.body;

      if (!newOwnerId) {
        res.status(400).json({ error: 'El ID del nuevo propietario es obligatorio' });
        return;
      }

      if (!walletId) {
        res.status(400).json({ error: 'El ID de la wallet es obligatorio' });
        return;
      }

      if (!newOwnerWalletAddress) {
        res.status(400).json({ error: 'La dirección de wallet del nuevo propietario es obligatoria' });
        return;
      }

      // Llamar al servicio de transferencia
      const result = await TransferService.prepareTransfer({
        documentId,
        currentOwnerId: req.user.userId,
        newOwnerId,
        currentOwnerWalletId: walletId,
        newOwnerWalletAddress,
        reEncryptedSymmetricKey,
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Confirma la transferencia de un documento tras la transacción en blockchain.
   * Endpoint: POST /api/documents/:documentId/transfer/confirm
   *
   * @param req - Objeto de solicitud HTTP autenticado con { txHash, transferId, signature? }.
   * @param res - Objeto de respuesta HTTP.
   * @returns Promesa que resuelve con la confirmación de transferencia.
   */
  static async confirmTransferDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const documentId = req.params.documentId as string;
      const { txHash, transferId, signature } = req.body;

      if (!txHash) {
        res.status(400).json({ error: 'El hash de la transacción es obligatorio' });
        return;
      }

      if (!isValidTxHash(txHash)) {
        res.status(400).json({ error: 'Hash de transacción inválido' });
        return;
      }

      if (!transferId) {
        res.status(400).json({ error: 'El ID de transferencia es obligatorio' });
        return;
      }

      // Llamar al servicio de transferencia
      await TransferService.confirmTransfer({
        transferId,
        txHash,
        signature: signature || '',
        documentId,
        confirmerUserId: req.user.userId,
        skipOnChainValidation: req.body.skipOnChainValidation,
      });

      res.status(200).json({ message: 'Transferencia confirmada correctamente' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Revierte la creación de un documento eliminando registros y desanclando de IPFS.
   * Se utiliza cuando la transacción blockchain falla tras la fase de preparación.
   * Endpoint: POST /api/documents/:documentId/rollback
   *
   * @param req - Objeto de solicitud HTTP autenticado. Los parámetros deben incluir el ID del documento.
   * @param res - Objeto de respuesta HTTP.
   * @returns Promesa que resuelve con la confirmación de reversión.
   */
  static async rollbackDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const documentId = req.params.documentId as string;

      await DocumentService.rollbackDocument(documentId, req.user.userId);

        res.status(200).json({ message: 'Documento revertido correctamente' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtiene las claves públicas de los usuarios con los que se ha compartido un documento.
   * Endpoint: GET /api/documents/:documentId/share-keys
   */
  static async getShareKeys(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { documentId } = req.params;
      // Verificar que el solicitante es el propietario del documento
      const document = await DocumentService.getDocumentById(documentId, req.user!.userId);
      if (!document) {
        res.status(404).json({ error: 'Documento no encontrado' });
        return;
      }
      if (document.ownerId !== req.user!.userId) {
        res.status(403).json({ error: 'Solo el propietario puede consultar las claves de compartición' });
        return;
      }
      const shareKeys = await DocumentService.getShareKeys(documentId);
      res.status(200).json({ shareKeys });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Rollback de transferencia tras fallo blockchain.
   * Endpoint: POST /documents/:documentId/transfer/rollback
   */
  static async rollbackTransfer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { documentId } = req.params;
      const { transferId } = req.body;
      await TransferService.rollbackTransfer(documentId, req.user!.userId, transferId);
      res.status(200).json({ success: true, message: 'Transferencia cancelada' });
    } catch (error) {
      next(error);
    }
  }
}
