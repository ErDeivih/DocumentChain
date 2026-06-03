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

const CACHE_TTL_MS = 30_000;

export class BlockchainCacheService {
  private static cache = new Map<string, CacheEntry>();

  static async getDocumentState(blockchainId: string): Promise<DocState> {
    const cached = this.cache.get(blockchainId);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.state;
    }

    const state = await this.fetchDocumentState(blockchainId);
    this.cache.set(blockchainId, { state, timestamp: Date.now() });
    return state;
  }

  static async getOperationalVersionNumber(blockchainId: string): Promise<number> {
    const state = await this.getDocumentState(blockchainId);
    return state.currentVersion;
  }

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
      const promises = uncached.map(async (id) => {
        try {
          const state = await this.fetchDocumentState(id);
          this.cache.set(id, { state, timestamp: Date.now() });
          result.set(id, state);
        } catch (error) {
          logger.warn(`[BlockchainCache] No se pudo obtener estado para ${id}: ${error instanceof Error ? error.message : String(error)}`);
        }
      });
      await Promise.all(promises);
    }

    return result;
  }

  static async isDocumentArchived(blockchainId: string): Promise<boolean> {
    const state = await this.getDocumentState(blockchainId);
    return state.isArchived;
  }

  static async isDocumentDeleted(blockchainId: string): Promise<boolean> {
    const state = await this.getDocumentState(blockchainId);
    return state.isDeleted;
  }

  static invalidate(blockchainId: string): void {
    this.cache.delete(blockchainId);
  }

  static invalidateAll(): void {
    this.cache.clear();
  }

  private static async fetchDocumentState(blockchainId: string): Promise<DocState> {
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
      currentVersion: Number(doc.latestVersion),
      updatedAt: Number(doc.updatedAt),
    };
  }
}
