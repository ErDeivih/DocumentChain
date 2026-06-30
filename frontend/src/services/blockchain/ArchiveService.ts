import { documentsApi } from '../../api/documents';
import type { DocumentRegistryContract } from '../../lib/blockchain/contracts';

import { TX_TIMEOUT_MS } from './config';
import { withTimeout } from '../../lib/utils';

/**
 * Servicio de archivado, desarchivado y eliminación de documentos.
 */
export class ArchiveService {
  /**
   * Archiva un documento, ocultándolo de la vista principal.
   * @param params.documentId - ID del documento a archivar
   * @returns Promesa que resuelve cuando el documento queda archivado
   */
  async archive(params: { documentId: string; registryContract: DocumentRegistryContract }): Promise<string> {
    const { documentId, registryContract } = params;
    try {
      const { blockchainId } = await documentsApi.archive(documentId);
      const tx = await registryContract.setArchiveStatus(blockchainId, true);
      await withTimeout(tx.wait(), TX_TIMEOUT_MS, 'Tiempo de espera agotado');
      await documentsApi.archiveConfirm(documentId, tx.hash);
      return tx.hash;
    } catch (err: any) {
      console.warn('[ArchiveService] Error al archivar documento', { documentId, error: err.message });
      throw new Error(err.message || 'Error al archivar el documento');
    }
  }

  /**
   * Desarchiva un documento, devolviéndolo a la vista principal.
   * @param params.documentId - ID del documento a desarchivar
   * @returns Promesa que resuelve cuando el documento vuelve a estar activo
   */
  async unarchive(params: { documentId: string; registryContract: DocumentRegistryContract }): Promise<string> {
    const { documentId, registryContract } = params;
    try {
      const { blockchainId } = await documentsApi.unarchive(documentId);
      const tx = await registryContract.setArchiveStatus(blockchainId, false);
      await withTimeout(tx.wait(), TX_TIMEOUT_MS, 'Tiempo de espera agotado');
      await documentsApi.unarchiveConfirm(documentId, tx.hash);
      return tx.hash;
    } catch (err: any) {
      console.warn('[ArchiveService] Error al desarchivar documento', { documentId, error: err.message });
      throw new Error(err.message || 'Error al desarchivar el documento');
    }
  }

  /**
   * Elimina un documento del sistema (borrado lógico).
   * @param params.documentId - ID del documento a eliminar
   * @returns Promesa que resuelve cuando el documento queda eliminado
   */
  async deleteDocument(params: { documentId: string; registryContract: DocumentRegistryContract }): Promise<string> {
    const { documentId, registryContract } = params;
    try {
      const { blockchainId } = await documentsApi.delete(documentId);
      const tx = await registryContract.deleteDocument(blockchainId);
      await withTimeout(tx.wait(), TX_TIMEOUT_MS, 'Tiempo de espera agotado');
      await documentsApi.deleteConfirm(documentId, tx.hash);
      return tx.hash;
    } catch (err: any) {
      console.warn('[ArchiveService] Error al eliminar documento', { documentId, error: err.message });
      throw new Error(err.message || 'Error al eliminar el documento');
    }
  }
}

export const archiveService = new ArchiveService();
