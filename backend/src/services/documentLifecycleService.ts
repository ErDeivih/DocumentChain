import { v4 as uuidv4 } from 'uuid';
import prisma from '../config/database';
import { deleteFromIPFS } from '../config/ipfs';
import { DocumentPermissionService } from './documentPermissionService';
import { assertDocumentDeletedReceipt, assertDocumentArchivedReceipt } from './blockchainReceiptService';
import { logger } from '../utils/logger';

export class DocumentLifecycleService {
  static async softDeleteDocument(documentId: string, userId: string, txHash: string): Promise<void> {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: { versions: { select: { ipfsCid: true } } },
    });

    if (!document) {
      throw new Error('Documento no encontrado');
    }

    if (document.isDeleted) {
      throw new Error('El documento ya ha sido eliminado');
    }

    const ownership = await DocumentPermissionService.validateOwnership(document, userId, {
      errorMessage: 'No tienes permisos para eliminar este documento',
    });

    if (!document.blockchainId) {
      throw new Error('El documento no tiene ID de blockchain aún');
    }

    await assertDocumentDeletedReceipt({
      txHash,
      docId: document.blockchainId,
      actorAddress: ownership.wallet.walletAddress,
    });

    const deletedAt = new Date();
    const cidsToUnpin = Array.from(
      new Set(document.versions.map((v) => v.ipfsCid).filter((cid): cid is string => Boolean(cid)))
    );

    await prisma.$transaction(async (tx) => {
      await tx.document.update({
        where: { id: documentId },
        data: { isDeleted: true, deletedAt, isArchived: false, archivedAt: null },
      });

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
  }

  static async archiveDocument(documentId: string, userId: string, txHash: string): Promise<void> {
    const document = await prisma.document.findUnique({ where: { id: documentId } });
    if (!document) throw new Error('Documento no encontrado');
    if (document.isArchived) throw new Error('El documento ya está archivado');

    await DocumentPermissionService.validateOwnership(document, userId, {
      errorMessage: 'No tienes permisos para archivar este documento',
    });

    if (!document.blockchainId) throw new Error('El documento no tiene ID de blockchain aún');

    const ownership = await DocumentPermissionService.validateOwnership(document, userId);
    await assertDocumentArchivedReceipt({
      txHash,
      docId: document.blockchainId,
      actorAddress: ownership.wallet.walletAddress,
      archived: true,
    });

    await prisma.$transaction(async (tx) => {
      await tx.document.update({
        where: { id: documentId },
        data: { isArchived: true, archivedAt: new Date() },
      });

      await tx.event.create({
        data: {
          id: uuidv4(),
          eventType: 'DOCUMENT_ARCHIVED',
          userId,
          documentId: document.id,
          transactionHash: txHash,
          metadata: {},
        },
      });
    });

    logger.info(`Documento ${documentId} archivado por ${userId}`);
  }

  static async unarchiveDocument(documentId: string, userId: string, txHash: string): Promise<void> {
    const document = await prisma.document.findUnique({ where: { id: documentId } });
    if (!document) throw new Error('Documento no encontrado');
    if (!document.isArchived) throw new Error('El documento no está archivado');

    await DocumentPermissionService.validateOwnership(document, userId, {
      errorMessage: 'No tienes permisos para desarchivar este documento',
    });

    if (!document.blockchainId) throw new Error('El documento no tiene ID de blockchain aún');

    const ownership2 = await DocumentPermissionService.validateOwnership(document, userId);
    await assertDocumentArchivedReceipt({
      txHash,
      docId: document.blockchainId,
      actorAddress: ownership2.wallet.walletAddress,
      archived: false,
    });

    await prisma.$transaction(async (tx) => {
      await tx.document.update({
        where: { id: documentId },
        data: { isArchived: false, archivedAt: null },
      });

      await tx.event.create({
        data: {
          id: uuidv4(),
          eventType: 'DOCUMENT_UNARCHIVED',
          userId,
          documentId: document.id,
          transactionHash: txHash,
          metadata: {},
        },
      });
    });

    logger.info(`Documento ${documentId} desarchivado por ${userId}`);
  }
}
