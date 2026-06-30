import { unpinFromIPFS } from '../config/ipfs';
import { logger } from '../utils/logger';

/**
 * Servicio de almacenamiento. Gestiona la subida de archivos a IPFS mediante el proveedor configurado.
 */
export class FileStorageService {
  /**
   * Desancla todos los CIDs de IPFS asociados a los documentos de un usuario.
   * Operación best-effort: los fallos individuales se loguean sin interrumpir.
   * @param {string} userId - UUID del usuario
   * @param {Array<{ versions: Array<{ ipfsCid: string | null }> }>} documents - Documentos con sus versiones e IPFS CIDs
   */
  static async unpinAllDocumentCIDs(userId: string, documents: Array<{ versions: Array<{ ipfsCid: string | null }> }>): Promise<void> {
    const cidsToUnpin = new Set<string>();
    for (const doc of documents) {
      for (const version of doc.versions) {
        if (version.ipfsCid) cidsToUnpin.add(version.ipfsCid);
      }
    }
    for (const cid of cidsToUnpin) {
      try {
        await unpinFromIPFS(cid);
        logger.info(`Despineado CID ${cid}`);
      } catch (ipfsError) {
        logger.warn(`No se pudo despinear CID ${cid}:`, ipfsError);
      }
    }
  }

}
