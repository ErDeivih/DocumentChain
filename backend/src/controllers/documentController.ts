/**
 * Document Controller - Refactored for Frontend Wallet Signatures
 * 
 * Implements the prepare/confirm pattern:
 * - prepareDocument: Uploads encrypted file to IPFS, creates DB record
 * - confirmDocument: Updates record after blockchain transaction
 * 
 * The backend encrypts private documents, stores public documents without encryption,
 * and leaves blockchain signing to the user's wallet in the frontend.
 */

import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../config/database';
import { deleteFromIPFS } from '../config/ipfs';
import { DocumentService } from '../services/documentService';
import { TransferService } from '../services/transferService';
import logger from '../utils/logger';

export class DocumentController {
  private static async softDeleteDocument(documentId: string, userId: string, txHash?: string | null) {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        versions: {
          select: {
            ipfsCid: true,
          },
        },
      },
    });

    if (!document) {
      throw new Error('Documento no encontrado');
    }

    if (document.ownerId !== userId) {
      throw new Error('No tienes permisos para eliminar este documento');
    }

    if (document.isDeleted) {
      throw new Error('El documento ya ha sido eliminado');
    }

    const deletedAt = new Date();
    const cidsToUnpin = Array.from(
      new Set(document.versions.map((version) => version.ipfsCid).filter((cid): cid is string => Boolean(cid)))
    );

    await prisma.$transaction(async (tx) => {
      await tx.document.update({
        where: { id: documentId },
        data: {
          isDeleted: true,
          deletedAt,
          isArchived: false,
          archivedAt: null,
        },
      });

      await tx.event.create({
        data: {
          id: uuidv4(),
          eventType: 'DOCUMENT_DELETED',
          userId,
          documentId: document.id,
          transactionHash: txHash || null,
          metadata: {
            cidsScheduledForUnpin: cidsToUnpin,
          },
        },
      });
    });

    for (const cid of cidsToUnpin) {
      try {
        await deleteFromIPFS(cid);
      } catch (error) {
        logger.error('[DELETE] Error al desanclar documento de IPFS', {
          documentId,
          cid,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  /**
   * Prepare a document for creation
   * POST /api/documents/prepare
   * 
  * Frontend sends the raw file.
  * Backend decides whether to encrypt it based on document visibility.
   */
  static async prepareDocument(req: Request, res: Response): Promise<void> {
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
        categoryId,
        tags,
        fileExtension,
      } = req.body;

      // Validate required fields
      if (!name) {
        res.status(400).json({ error: 'El nombre del documento es obligatorio' });
        return;
      }

      if (!walletId) {
        res.status(400).json({ error: 'El ID de la wallet es obligatorio' });
        return;
      }

      const result = await DocumentService.prepareDocument({
        name,
        description,
        mimeType: req.file.mimetype,
        fileBuffer: req.file.buffer, // UNENCRYPTED file - backend will encrypt
        ownerId: req.user.userId,
        walletId,
        visibility,
        folderId,
        categoryId,
        tags: tags ? (typeof tags === 'string' ? JSON.parse(tags) : tags) : undefined,
        fileExtension,
      });

      logger.info('[PREPARE] Documento preparado', { 
        documentId: result.documentId, 
        userId: req.user.userId 
      });

      res.status(200).json(result);
    } catch (error: any) {
      logger.error('[PREPARE] Error al preparar documento', { 
        error: error.message, 
        userId: req.user?.userId 
      });
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Confirm a document after blockchain transaction
   * POST /api/documents/confirm
   * 
   * Frontend calls this after signing and submitting the blockchain transaction.
   */
  static async confirmDocument(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const { documentId, txHash, blockchainId } = req.body;

      if (!documentId) {
        res.status(400).json({ error: 'El ID del documento es obligatorio' });
        return;
      }

      if (!txHash) {
        res.status(400).json({ error: 'El hash de la transacción es obligatorio' });
        return;
      }

      if (!blockchainId) {
        res.status(400).json({ error: 'El ID de blockchain es obligatorio' });
        return;
      }

      const document = await DocumentService.confirmDocument({
        documentId,
        txHash,
        blockchainId,
      });

      logger.info('[CONFIRM] Documento confirmado', { 
        documentId, 
        txHash, 
        userId: req.user.userId 
      });

      res.status(200).json({ document });
    } catch (error: any) {
      logger.error('[CONFIRM] Error al confirmar documento', { 
        error: error.message, 
        userId: req.user?.userId 
      });
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Get document by ID
   * GET /api/documents/:documentId
   */
  static async getDocument(req: Request, res: Response): Promise<void> {
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
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Download document (returns encrypted file)
   * GET /api/documents/:documentId/download
   * 
   * Returns the encrypted file from IPFS. Frontend handles decryption.
   * If encryptedSymmetricKey is 'UNENCRYPTED', the file is public (not encrypted).
   */
  static async downloadDocument(req: Request, res: Response): Promise<void> {
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

      const isUnencrypted = result.encryptedSymmetricKey === 'UNENCRYPTED';

      // Set headers for file download
      res.setHeader('Content-Type', isUnencrypted ? result.mimeType : 'application/octet-stream');
      res.setHeader('Content-Disposition', 
        `attachment; filename="${result.name}${isUnencrypted ? '' : '.encrypted'}"`
      );
      
      // Only send encryption key header if file is actually encrypted
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
      res.setHeader('X-Mime-Type', result.mimeType);

      res.send(result.encryptedFile);
    } catch (error: any) {
      logger.error('[DOWNLOAD] Error al descargar documento', { 
        error: error.message, 
        userId: req.user?.userId 
      });
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * List documents for user
   * GET /api/documents?walletId=xxx&includeArchived=false&onlyArchived=false&search=xxx&fileType=pdf
   * 
   * Can filter by wallet, archived status, search term, and file type.
   */
  static async listDocuments(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const { walletId, includeArchived, onlyArchived, folderId, categoryId, search, fileType } = req.query;
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
          categoryId: categoryId as string,
          search: search as string,
          fileType: fileType as string,
        }
      );

      res.status(200).json(documents);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Get documents by wallet
   * GET /api/documents/wallet/:walletId
   */
  static async getDocumentsByWallet(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const walletId = req.params.walletId as string;

      const documents = await DocumentService.getDocumentsByWallet(
        req.user.userId,
        walletId
      );

      res.status(200).json({ documents });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Archive document (prepare phase)
   * POST /api/documents/:documentId/archive/prepare
   */
  static async prepareArchiveDocument(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const documentId = req.params.documentId as string;

      // Verify ownership
      const document = await prisma.document.findUnique({
        where: { id: documentId },
      });

      if (!document) {
        res.status(404).json({ error: 'Documento no encontrado' });
        return;
      }

      if (document.ownerId !== req.user.userId) {
        res.status(403).json({ error: 'No tienes permisos para archivar este documento' });
        return;
      }

      if (!document.blockchainId) {
        res.status(400).json({ error: 'El documento no tiene ID de blockchain aún' });
        return;
      }

      res.status(200).json({
        documentId,
        blockchainId: document.blockchainId,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Confirm archive document
   * POST /api/documents/:documentId/archive/confirm
   */
  static async confirmArchiveDocument(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const documentId = req.params.documentId as string;
      const { txHash } = req.body;

      // Verify ownership
      const document = await prisma.document.findUnique({
        where: { id: documentId },
      });

      if (!document) {
        res.status(404).json({ error: 'Documento no encontrado' });
        return;
      }

      if (document.ownerId !== req.user.userId) {
        res.status(403).json({ error: 'No tienes permisos para archivar este documento' });
        return;
      }

      const updated = await prisma.document.update({
        where: { id: documentId },
        data: {
          isArchived: true,
          archivedAt: new Date(),
        },
      });

      await prisma.event.create({
        data: {
          id: uuidv4(),
          eventType: 'DOCUMENT_ARCHIVED',
          userId: req.user.userId,
          documentId: document.id,
          transactionHash: txHash || null,
        },
      });

      res.status(200).json({
        message: 'Documento archivado correctamente',
        document: updated,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Archive document (legacy - will be deprecated)
   * PUT /api/documents/:documentId/archive
   */
  static async archiveDocument(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const documentId = req.params.documentId as string;

      // Check ownership
      const document = await prisma.document.findUnique({
        where: { id: documentId },
      });

      if (!document) {
        res.status(404).json({ error: 'Documento no encontrado' });
        return;
      }

      if (document.ownerId !== req.user.userId) {
        res.status(403).json({ error: 'No tienes permisos para archivar este documento' });
        return;
      }

      // Archive document
      const updated = await prisma.document.update({
        where: { id: documentId },
        data: {
          isArchived: true,
          archivedAt: new Date(),
        },
      });

      // Log event
      await prisma.event.create({
        data: {
          id: uuidv4(),
          eventType: 'DOCUMENT_ARCHIVED',
          userId: req.user.userId,
          documentId: document.id,
        },
      });

      res.status(200).json({ 
        message: 'Documento archivado correctamente',
        document: updated,
      });
    } catch (error: any) {
      logger.error('Error archiving document:', error);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Unarchive document (legacy - will be deprecated)
   * PUT /api/documents/:documentId/unarchive
   */
  static async unarchiveDocument(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const documentId = req.params.documentId as string;

      // Check ownership
      const document = await prisma.document.findUnique({
        where: { id: documentId },
      });

      if (!document) {
        res.status(404).json({ error: 'Documento no encontrado' });
        return;
      }

      if (document.ownerId !== req.user.userId) {
        res.status(403).json({ error: 'No tienes permisos para desarchivar este documento' });
        return;
      }

      // Unarchive document
      const updated = await prisma.document.update({
        where: { id: documentId },
        data: {
          isArchived: false,
          archivedAt: null,
        },
      });

      // Log event
      await prisma.event.create({
        data: {
          id: uuidv4(),
          eventType: 'DOCUMENT_UNARCHIVED',
          userId: req.user.userId,
          documentId: document.id,
        },
      });

      res.status(200).json({ 
        message: 'Documento desarchivado correctamente',
        document: updated,
      });
    } catch (error: any) {
      logger.error('Error unarchiving document:', error);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Delete document (prepare phase)
   * POST /api/documents/:documentId/delete/prepare
   */
  static async prepareDeleteDocument(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const documentId = req.params.documentId as string;
      const { walletId } = req.body;

      if (!walletId) {
        res.status(400).json({ error: 'El ID de la wallet es obligatorio' });
        return;
      }

      // Verify ownership
      const document = await prisma.document.findUnique({
        where: { id: documentId },
      });

      if (!document) {
        res.status(404).json({ error: 'Documento no encontrado' });
        return;
      }

      if (document.ownerId !== req.user.userId) {
        res.status(403).json({ error: 'No tienes permisos para eliminar este documento' });
        return;
      }

      if (document.isDeleted) {
        res.status(400).json({ error: 'El documento ya ha sido eliminado' });
        return;
      }

      if (!document.blockchainId) {
        res.status(400).json({ error: 'El documento no tiene ID de blockchain aún' });
        return;
      }

      res.status(200).json({
        documentId,
        blockchainId: document.blockchainId,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Confirm delete document
   * POST /api/documents/:documentId/delete/confirm
   */
  static async confirmDeleteDocument(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const documentId = req.params.documentId as string;
      const { txHash } = req.body;

      await DocumentController.softDeleteDocument(documentId, req.user.userId, txHash || null);

      res.status(200).json({ message: 'Documento eliminado correctamente' });
    } catch (error: any) {
      if (error.message === 'Documento no encontrado') {
        res.status(404).json({ error: error.message });
        return;
      }

      if (error.message === 'No tienes permisos para eliminar este documento') {
        res.status(403).json({ error: error.message });
        return;
      }

      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Delete document (legacy - will be deprecated)
   * DELETE /api/documents/:documentId
   */
  static async deleteDocument(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const documentId = req.params.documentId as string;

      await DocumentController.softDeleteDocument(documentId, req.user.userId);

      res.status(200).json({ message: 'Documento eliminado correctamente' });
    } catch (error: any) {
      if (error.message === 'Documento no encontrado') {
        res.status(404).json({ error: error.message });
        return;
      }

      if (error.message === 'No tienes permisos para eliminar este documento') {
        res.status(403).json({ error: error.message });
        return;
      }

      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Transfer document (prepare phase)
   * POST /api/documents/:documentId/transfer/prepare
   */
  static async prepareTransferDocument(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const documentId = req.params.documentId as string;
      const { newOwnerId, walletId, newOwnerWalletAddress, decryptedSymmetricKey } = req.body;

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

      // Call transfer service
      const result = await TransferService.prepareTransfer({
        documentId,
        currentOwnerId: req.user.userId,
        newOwnerId,
        currentOwnerWalletId: walletId,
        newOwnerWalletAddress,
        decryptedSymmetricKey,
      });

      res.status(200).json(result);
    } catch (error: any) {
      logger.error('[PREPARE] Error al preparar transferencia', {
        error: error.message,
        userId: req.user?.userId,
      });
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Confirm transfer document
   * POST /api/documents/:documentId/transfer/confirm
   */
  static async confirmTransferDocument(req: Request, res: Response): Promise<void> {
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

      if (!transferId) {
        res.status(400).json({ error: 'El ID de transferencia es obligatorio' });
        return;
      }

      // Call transfer service
      await TransferService.confirmTransfer({
        transferId,
        txHash,
        signature: signature || '',
      });

      res.status(200).json({ message: 'Transferencia confirmada correctamente' });
    } catch (error: any) {
      logger.error('[CONFIRM] Error al confirmar transferencia', {
        error: error.message,
        userId: req.user?.userId,
      });
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Transfer document (legacy - will be deprecated)
   * POST /api/documents/:documentId/transfer
   */
  static async transferDocument(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const documentId = req.params.documentId as string;
      const { newOwnerId, currentPassword, newOwnerPassword } = req.body;

      // TODO: This should use prepare/confirm pattern
      res.status(200).json({ message: 'Documento transferido correctamente' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Create document (legacy - will be deprecated)
   * POST /api/documents
   * 
   * This endpoint is kept for backward compatibility.
   * New implementations should use /prepare + /confirm.
   */
  static async createDocument(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      if (!req.file) {
        res.status(400).json({ error: 'No se ha subido ningún archivo' });
        return;
      }

      const { name, description, password } = req.body;

      if (!name) {
        res.status(400).json({ error: 'El nombre del documento es obligatorio' });
        return;
      }

      // Legacy endpoint - redirect to new pattern
      res.status(400).json({ 
        error: 'Este endpoint está deprecado. Use /api/documents/prepare + /confirm',
        deprecated: true 
      });
    } catch (error: any) {
      logger.error('Error al crear documento (legacy)', { error: error.message, userId: req.user?.userId });
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Rollback document creation
   * POST /api/documents/:documentId/rollback
   * 
   * Deletes document, versions, and unpins from IPFS.
   * Used when blockchain transaction fails after prepare.
   */
  static async rollbackDocument(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const documentId = req.params.documentId as string;

      await DocumentService.rollbackDocument(documentId, req.user.userId);

      res.status(200).json({ message: 'Document rolled back successfully' });
    } catch (error: any) {
      logger.error('Error rolling back document', { error: error.message, userId: req.user?.userId });
      res.status(400).json({ error: error.message });
    }
  }
}
