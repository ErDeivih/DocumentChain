import { ethers } from 'ethers';
import { getContracts } from '../config/blockchain';
import { logger } from '../utils/logger';

interface DocState {
  isArchived: boolean;
  isDeleted: boolean;
  owner: string;
  currentVersion: number;
  updatedAt: number;
}

interface CacheEntry {
  state: DocState;
  timestamp: number;
}

const CACHE_TTL_MS = parseInt(process.env.BLOCKCHAIN_CACHE_TTL_MS || '30000', 10);

/**
 * Servicio de cache blockchain. Consulta y cachea estado on-chain de documentos
 * para evitar llamadas redundantes al contrato inteligente.
 */
export class BlockchainCacheService {

  private static cache = new Map<string, CacheEntry>();

  /**
   * Obtiene el estado de un documento desde blockchain con caché TTL 30s.
   * @param {string} blockchainId - Identificador bytes32 del documento
   * @returns {Promise<DocState>}
   */
  static async getDocumentState(blockchainId: string): Promise<DocState> {
    const cached = this.cache.get(blockchainId);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.state;
    }

    const state = await this.fetchDocumentState(blockchainId);
    this.cache.set(blockchainId, { state, timestamp: Date.now() });
    return state;
  }

  /**
   * Obtiene el número de versión operacional de un documento desde blockchain.
   * @param {string} blockchainId - Identificador bytes32 del documento
   * @returns {Promise<number>}
   */
  static async getOperationalVersionNumber(blockchainId: string): Promise<number> {
    const state = await this.getDocumentState(blockchainId);
    return state.currentVersion;
  }

  /**
   * Obtiene el estado de múltiples documentos desde blockchain en lotes.
   * Aprovecha el caché TTL 30s y consulta blockchain solo para los no cacheados.
   * @param {string[]} blockchainIds - Lista de identificadores bytes32 de documentos
   * @returns {Promise<Map<string, DocState>>}
   */
  static async batchGetDocumentStates(blockchainIds: string[]): Promise<Map<string, DocState>> {
    const result = new Map<string, DocState>();
    const uncached: string[] = [];

    for (const id of blockchainIds) {
      const cached = this.cache.get(id);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        result.set(id, cached.state);
      } else {
        uncached.push(id);
      }
    }

    if (uncached.length > 0) {
      const CHUNK_SIZE = 10;
      for (let i = 0; i < uncached.length; i += CHUNK_SIZE) {
        const chunk = uncached.slice(i, i + CHUNK_SIZE).map(async (id) => {
          try {
            const state = await this.fetchDocumentState(id);
            this.cache.set(id, { state, timestamp: Date.now() });
            result.set(id, state);
          } catch (error) {
            logger.warn(`[BlockchainCache] No se pudo obtener estado para ${id}`);
          }
        });
        await Promise.all(chunk);
      }
    }

    return result;
  }

  /**
   * Verifica si un documento está archivado en blockchain.
   * @param {string} blockchainId - Identificador bytes32 del documento
   * @returns {Promise<boolean>}
   */
  static async isDocumentArchived(blockchainId: string): Promise<boolean> {
    const state = await this.getDocumentState(blockchainId);
    return state.isArchived;
  }

  /**
   * Verifica si un documento está eliminado en blockchain.
   * @param {string} blockchainId - Identificador bytes32 del documento
   * @returns {Promise<boolean>}
   */
  static async isDocumentDeleted(blockchainId: string): Promise<boolean> {
    const state = await this.getDocumentState(blockchainId);
    return state.isDeleted;
  }

  /**
   * Invalida la entrada de caché para un documento específico.
   * @param {string} blockchainId - Identificador bytes32 del documento
   */
  static invalidate(blockchainId: string): void {
    this.cache.delete(blockchainId);
  }

  /**
   * Invalida todas las entradas del caché blockchain.
   */
  static invalidateAll(): void {
    this.cache.clear();
  }

  /**
   * Consulta el estado del documento directamente desde el smart contract.
   * En caso de error de RPC, retorna valores por defecto priorizando disponibilidad.
   * @param {string} blockchainId - Identificador bytes32 del documento
   * @returns {Promise<DocState>}
   */
  private static async fetchDocumentState(blockchainId: string): Promise<DocState> {
    try {
      const contracts = getContracts();
      const doc = await contracts.documentRegistry.getDocument(blockchainId);

      if (doc.owner === ethers.ZeroAddress) {
        return {
          isArchived: false,
          isDeleted: true,
          owner: ethers.ZeroAddress,
          currentVersion: 0,
          updatedAt: 0,
        };
      }

      return {
        isArchived: doc.isArchived,
        isDeleted: doc.isDeleted,
        owner: doc.owner,
        currentVersion: Number(doc.currentVersion),
        updatedAt: Number(doc.updatedAt),
      };
    } catch (error) {
      logger.warn(`[BlockchainCache] Error al obtener estado para ${blockchainId}: ${error instanceof Error ? error.message : String(error)}`);
      return { isArchived: false, isDeleted: false, owner: ethers.ZeroAddress, currentVersion: 0, updatedAt: 0 };
      // DECISIÓN DE DISEÑO: isDeleted por defecto es false (disponibilidad sobre seguridad en modo demo).
      // Prioriza la visibilidad de documentos sobre el bloqueo por error de RPC.
      // Trade-off aceptado porque: (1) es una demo local, (2) cache TTL es solo 30s,
      // (3) en producción se revertiría a true para evitar mostrar documentos eliminados.
    }
  }
}
