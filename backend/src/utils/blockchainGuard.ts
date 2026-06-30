import prisma from '../config/database';
import { BlockchainCacheService } from '../services/blockchainCacheService';
import { NotFoundError, ValidationError } from './errors';

/**
 * Verifica que un documento existe en la base de datos.
 * @param documentId - ID del documento.
 * @returns El documento encontrado.
 * @throws {NotFoundError} Si el documento no existe.
 */
export async function assertDocument(documentId: string) {
  const document = await prisma.document.findUnique({ where: { id: documentId } });
  if (!document) throw new NotFoundError('Documento no encontrado');
  return document;
}

/**
 * Verifica que un documento no este archivado ni eliminado en blockchain.
 * @param blockchainId - ID blockchain del documento, o null si no esta sincronizado.
 * @param action - Accion que se intenta realizar (para el mensaje de error).
 * @throws {ValidationError} Si el documento esta eliminado o archivado en blockchain.
 */
export async function assertDocumentActive(blockchainId: string | null, action: string): Promise<void> {
  if (!blockchainId) return;
  if (await BlockchainCacheService.isDocumentDeleted(blockchainId)) {
    throw new ValidationError(`No se pueden ${action} documentos eliminados`);
  }
  if (await BlockchainCacheService.isDocumentArchived(blockchainId)) {
    throw new ValidationError(`No se pueden ${action} documentos archivados`);
  }
}
