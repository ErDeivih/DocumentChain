import { v4 as uuidv4 } from 'uuid';
import prisma from '../config/database';
import { deleteFromIPFS } from '../config/ipfs';
import { DocumentPermissionService } from './documentPermissionService';
import { BlockchainCacheService } from './blockchainCacheService';
import { assertDocumentDeletedReceipt, assertDocumentArchivedReceipt } from './blockchainReceiptService';
import { logger } from '../utils/logger';
import WebSocketService from './webSocketService';
import { ConflictError, NotFoundError, UnauthorizedError, ValidationError } from '../utils/errors';

// La reversión de archivado/desarchivado/borrado se maneja en dos fases (prepare/confirm).
// Si la tx blockchain falla, el frontend debe llamar al endpoint confirm con txHash: null.
// El estado se lee de blockchain bajo demanda.

/**
 * Servicio de ciclo de vida de documentos. Gestiona archivado, desarchivado y borrado logico.
 */
export class DocumentLifecycleService {

  /**
   * Elimina un documento validando receipt blockchain.
   * Desancla versiones de IPFS y crea registro de auditoría.
   * @param {string} documentId - UUID del documento
   * @param {string} userId - UUID del usuario
   * @param {string} txHash - Hash de transacción blockchain confirmada
   * @returns {Promise<void>}
   * @throws {Error} Si el documento no existe, estado inválido, o receipt no válido
   */
  static async softDeleteDocument(documentId: string, userId: string, txHash: string, skipOnChainValidation?: boolean): Promise<void> {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: { versions: { select: { ipfsCid: true } } },
    });

    if (!document) {
      throw new NotFoundError('Documento no encontrado');
    }

    if (document.blockchainId && await BlockchainCacheService.isDocumentDeleted(document.blockchainId)) {
      throw new ConflictError('El documento ya ha sido eliminado');
    }

    const ownership = await DocumentPermissionService.validateOwnership(document, userId, {
      errorMessage: 'No tienes permisos para eliminar este documento',
    });

    if (!document.blockchainId) {
      throw new ValidationError('El documento no tiene ID de blockchain aún');
    }

    if (!skipOnChainValidation) {
      await assertDocumentDeletedReceipt({
        txHash,
        docId: document.blockchainId,
        actorAddress: ownership.wallet.walletAddress,
      });
    }

    const cidsToUnpin = Array.from(
      new Set(document.versions.map((v) => v.ipfsCid).filter((cid): cid is string => Boolean(cid)))
    );

    // NOTA: isDeleted/isArchived NO se almacenan en BD. Blockchain es la única fuente de verdad.
    // Estas operaciones solo crean eventos y despinean IPFS. El estado se lee bajo demanda via BlockchainCacheService.
    // La transaccion de BD se hace primero para que, si falla, no se pierdan los datos de IPFS.
    await prisma.$transaction(async (tx) => {
      await tx.event.create({
        data: {
          id: uuidv4(),
          eventType: 'DOCUMENT_DELETED',
          userId,
          documentId: document.id,
          transactionHash: txHash,
          metadata: { cidsScheduledForUnpin: cidsToUnpin },
        },
      });
    });

    // El desanclaje de IPFS es best-effort: los fallos se registran pero NO bloquean la operacion de BD
    for (const cid of cidsToUnpin) {
      try {
        await deleteFromIPFS(cid);
      } catch (error) {
        logger.error('[DELETE] Error al desanclar documento de IPFS', {
          documentId, cid,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    if (document?.blockchainId) BlockchainCacheService.invalidate(document.blockchainId);

    try {
      const { default: notificationService, NotificationType } = await import('./notificationService');
      await notificationService.createNotification({
        userId: document.ownerId,
        type: NotificationType.FILE_DELETED,
        title: 'Documento eliminado',
        message: `El documento "${document.name}" ha sido eliminado.`,
        link: `/app/documents/${document.id}`,
        data: { documentId: document.id }
      });
    } catch (_) { logger.warn(`No se pudo crear notificacion de eliminacion para documento ${document.id}`); }

    WebSocketService.sendToUser(document.ownerId, 'document:updated', { type: 'DELETED', documentId });
  }

  /**
   * Cambia el estado de archivado de un documento validando receipt blockchain.
   * @param {string} documentId - UUID del documento
   * @param {string} userId - UUID del usuario
   * @param {string} txHash - Hash de transacción blockchain confirmada
   * @param {boolean} archived - true para archivar, false para desarchivar
   * @returns {Promise<void>}
   * @throws {Error} Si el documento no existe, estado inválido, o receipt no válido
   */
  private static async setArchiveStatus(documentId: string, userId: string, txHash: string, archived: boolean, skipOnChainValidation?: boolean) {
    const document = await prisma.document.findUnique({ where: { id: documentId } });
    if (!document)       throw new NotFoundError('Documento no encontrado');

    if (archived) {
      if (document.blockchainId && await BlockchainCacheService.isDocumentArchived(document.blockchainId)) throw new ConflictError('El documento ya está archivado');
    } else {
      if (!document.blockchainId || !(await BlockchainCacheService.isDocumentArchived(document.blockchainId))) throw new ConflictError('El documento no está archivado');
    }

    const ownership = await DocumentPermissionService.validateOwnership(document, userId, {
      errorMessage: archived ? 'No tienes permisos para archivar este documento' : 'No tienes permisos para desarchivar este documento',
    });

    if (!document.blockchainId) throw new ValidationError('El documento no tiene ID de blockchain aún');

    if (!skipOnChainValidation) {
      await assertDocumentArchivedReceipt({
        txHash,
        docId: document.blockchainId,
        actorAddress: ownership.wallet.walletAddress,
        archived,
      });
    }

    await prisma.$transaction(async (tx) => {
      await tx.event.create({
        data: {
          id: uuidv4(),
          eventType: archived ? 'DOCUMENT_ARCHIVED' : 'DOCUMENT_UNARCHIVED',
          userId,
          documentId: document.id,
          transactionHash: txHash,
          metadata: {},
        },
      });
    });

    logger.info(`Documento ${documentId} ${archived ? 'archivado' : 'desarchivado'} por ${userId}`);

    try {
      const { default: notificationService, NotificationType } = await import('./notificationService');
      await notificationService.createNotification({
        userId: document.ownerId,
        type: archived ? NotificationType.FILE_ARCHIVED : NotificationType.FILE_UPDATED,
        title: archived ? 'Documento archivado' : 'Documento desarchivado',
        message: archived
          ? `El documento "${document.name}" ha sido archivado.`
          : `El documento "${document.name}" ha sido desarchivado.`,
        link: `/app/documents/${document.id}`,
        data: { documentId: document.id }
      });
    } catch (_) { logger.warn(`No se pudo crear notificacion de archivado para documento ${document.id}`); }

    if (document?.blockchainId) BlockchainCacheService.invalidate(document.blockchainId);

    WebSocketService.sendToUser(document.ownerId, 'document:updated', { type: archived ? 'ARCHIVED' : 'UNARCHIVED', documentId });
  }

  /**
   * Archiva un documento validando receipt blockchain.
   * @param {string} documentId - UUID del documento
   * @param {string} userId - UUID del usuario
   * @param {string} txHash - Hash de transacción blockchain confirmada
   * @returns {Promise<void>}
   * @throws {Error} Si el documento no existe, estado inválido, o receipt no válido
   */
  static async archiveDocument(documentId: string, userId: string, txHash: string, skipOnChainValidation?: boolean): Promise<void> {
    return this.setArchiveStatus(documentId, userId, txHash, true, skipOnChainValidation);
  }

  /**
   * Desarchiva un documento validando receipt blockchain.
   * @param {string} documentId - UUID del documento
   * @param {string} userId - UUID del usuario
   * @param {string} txHash - Hash de transacción blockchain confirmada
   * @returns {Promise<void>}
   * @throws {Error} Si el documento no existe, estado inválido, o receipt no válido
   */
  static async unarchiveDocument(documentId: string, userId: string, txHash: string, skipOnChainValidation?: boolean): Promise<void> {
    return this.setArchiveStatus(documentId, userId, txHash, false, skipOnChainValidation);
  }
}
