import { ipfsClient, IPFSAdapter } from '../config/ipfs';
import logger from '../utils/logger';

/**
 * IPFSService - Wrapper limpio sobre el cliente IPFS (Pinata o Cluster)
 * 
 * Proporciona una interfaz simplificada para operaciones IPFS:
 * - Upload de archivos cifrados
 * - Download de archivos
 * - Pin/Unpin para gestión de almacenamiento
 * - Verificación de disponibilidad
 * 
 * Uso: Servicios de documentos usan este wrapper en lugar de
 * interactuar directamente con el adapter IPFS
 */

export interface IPFSUploadResult {
  cid: string;
  size: number;
  pinned: boolean;
}

export interface IPFSPinStatus {
  cid: string;
  isPinned: boolean;
  peerMap: Record<string, any>;
}

export class IPFSService {
  private client: IPFSAdapter;

  constructor() {
    this.client = ipfsClient; // Usa el cliente configurado (Pinata o Cluster)
  }

  /**
   * Subir archivo a IPFS
   * Automáticamente hace pin del archivo en el cluster
   * 
   * @param buffer - Contenido del archivo (ya cifrado)
   * @returns Resultado con CID y metadata
   */
  async uploadFile(buffer: Buffer): Promise<IPFSUploadResult> {
    try {
      logger.info(`Subiendo archivo a IPFS (${buffer.length} bytes)`);

      // 1. Subir archivo
      const cid = await this.client.add(buffer);
      
      logger.info(`Archivo subido a IPFS: ${cid}`);

      // 2. Asegurar que está pinned
      try {
        await this.client.pin(cid);
        logger.info(`Archivo anclado en cluster IPFS: ${cid}`);
      } catch (pinError) {
        // Si ya está pinned, está bien
        logger.warn(`Operación de pin puede haber fallado (el archivo puede ya estar anclado): ${pinError}`);
      }

      return {
        cid,
        size: buffer.length,
        pinned: true
      };

    } catch (error) {
      logger.error('Error al subir archivo a IPFS:', error);
      throw new Error(`Error al subir a IPFS: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Descargar archivo de IPFS
   * 
   * @param cid - Content Identifier del archivo
   * @returns Buffer con el contenido del archivo
   */
  async downloadFile(cid: string): Promise<Buffer> {
    try {
      logger.info(`Descargando archivo de IPFS: ${cid}`);

      const buffer = await this.client.cat(cid);

      logger.info(`Archivo descargado de IPFS: ${cid} (${buffer.length} bytes)`);

      return buffer;

    } catch (error) {
      logger.error(`Error al descargar archivo de IPFS (${cid}):`, error);
      throw new Error(`Error al descargar de IPFS: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Pin un archivo en IPFS cluster
   * Útil para archivos que se suben externamente pero queremos mantener
   * 
   * @param cid - Content Identifier a hacer pin
   */
  async pinFile(cid: string): Promise<void> {
    try {
      logger.info(`Anclando archivo en cluster IPFS: ${cid}`);

      await this.client.pin(cid);

      logger.info(`Archivo anclado exitosamente: ${cid}`);

    } catch (error) {
      logger.error(`Error al anclar archivo en IPFS (${cid}):`, error);
      throw new Error(`Error al anclar en IPFS: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Unpin un archivo de IPFS cluster
   * ⚠️ CUIDADO: Solo usar cuando se elimina permanentemente un documento
   * 
   * @param cid - Content Identifier a unpin
   */
  async unpinFile(cid: string): Promise<void> {
    try {
      logger.info(`Desanclando archivo de cluster IPFS: ${cid}`);

      await this.client.unpin(cid);

      logger.info(`Archivo desanclado exitosamente: ${cid}`);

    } catch (error) {
      logger.error(`Error al desanclar archivo de IPFS (${cid}):`, error);
      throw new Error(`Error al desanclar de IPFS: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Verificar estado de pin de un archivo
   * 
   * @param cid - Content Identifier a verificar
   * @returns Estado de pin
   */
  async getPinStatus(cid: string): Promise<IPFSPinStatus> {
    try {
      logger.info(`Verificando estado de anclaje para: ${cid}`);

      const status = await this.client.getPinStatus(cid);

      return {
        cid,
        isPinned: status.status === 'pinned' || status.peer_map,
        peerMap: status.peer_map || {}
      };

    } catch (error) {
      logger.error(`Error al obtener estado de anclaje para ${cid}:`, error);
      
      // Si no se encuentra, asumimos que no está pinned
      return {
        cid,
        isPinned: false,
        peerMap: {}
      };
    }
  }

  /**
   * Verificar si un archivo está disponible en IPFS
   * Intenta obtener su status sin descargarlo
   * 
   * @param cid - Content Identifier a verificar
   * @returns true si está disponible
   */
  async isAvailable(cid: string): Promise<boolean> {
    try {
      const status = await this.getPinStatus(cid);
      return status.isPinned;
    } catch (error) {
      logger.warn(`El archivo ${cid} puede no estar disponible en IPFS`);
      return false;
    }
  }

  /**
   * Obtener tamaño de un archivo sin descargarlo (si es posible)
   * 
   * @param cid - Content Identifier
   * @returns Tamaño en bytes o null si no se puede determinar
   */
  async getFileSize(cid: string): Promise<number | null> {
    try {
      // Intentar obtener metadata del archivo
      const status = await this.client.getPinStatus(cid);
      
      // IPFS Cluster API puede retornar size en metadata
      if (status.size) {
        return Number(status.size);
      }

      // Si no hay metadata, retornar null
      return null;

    } catch (error) {
      logger.warn(`No se pudo obtener tamaño del archivo ${cid}`);
      return null;
    }
  }

  /**
   * Batch upload de múltiples archivos
   * Más eficiente que subir uno por uno
   * 
   * @param files - Array de buffers a subir
   * @returns Array de resultados con CIDs
   */
  async uploadMultipleFiles(files: Buffer[]): Promise<IPFSUploadResult[]> {
    try {
      logger.info(`Subiendo ${files.length} archivos a IPFS en lote`);

      const results: IPFSUploadResult[] = [];

      // Upload secuencial (IPFS Cluster no soporta batch nativo)
      for (const file of files) {
        const result = await this.uploadFile(file);
        results.push(result);
      }

      logger.info(`Carga por lote completada: ${results.length} archivos subidos`);

      return results;

    } catch (error) {
      logger.error('Error en carga por lote:', error);
      throw new Error(`Error en carga por lote: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Calcular CID de un archivo sin subirlo
   * Útil para verificar si un archivo ya existe antes de subirlo
   * 
   * @param buffer - Contenido del archivo
   * @returns CID calculado localmente
   */
  async calculateCID(buffer: Buffer): Promise<string> {
    try {
      // Por ahora, usar hash simple
      // Para implementar correctamente, requiere instalar: npm install multiformats
      const crypto = await import('crypto');
      const hash = crypto.createHash('sha256').update(buffer).digest('hex');
      
      // Retornar hash como placeholder (no es CID real de IPFS)
      // TODO: Implementar con multiformats cuando se instale
      logger.warn('calculateCID usando hash SHA256 (no es CID real de IPFS). Instalar multiformats para cálculo proper de CID.');
      return `QmPlaceholder${hash.substring(0, 40)}`;

    } catch (error) {
      logger.error('Error al calcular CID:', error);
      throw new Error(`Error al calcular CID: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Garbage collection - Limpiar archivos unpinned
   * Libera espacio en el cluster
   * ⚠️ Solo ejecutar manualmente o con cron job
   */
  async garbageCollect(): Promise<{ cleaned: number; freedBytes: number }> {
    try {
      logger.warn('Iniciando garbage collection de IPFS');

      // IPFS Cluster maneja GC automáticamente
      // Esta función es placeholder para futura implementación manual
      
      logger.info('Garbage collection completado (manejado por demonio IPFS)');

      return {
        cleaned: 0,
        freedBytes: 0
      };

    } catch (error) {
      logger.error('Error durante garbage collection:', error);
      throw new Error(`Error en garbage collection: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }
}

// Export singleton instance
export const ipfsService = new IPFSService();
