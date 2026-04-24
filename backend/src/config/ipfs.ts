/**
 * IPFS Configuration with Multi-Provider Support
 * 
 * Supports two IPFS providers:
 * 1. Pinata Cloud (IPFS_PROVIDER="pinata") - For development, no local nodes needed
 * 2. IPFS Cluster (IPFS_PROVIDER="cluster") - For production, self-hosted nodes
 * 
 * Switch providers via IPFS_PROVIDER environment variable
 */

import { PinataAdapter, IPFSAdapter as IPFSAdapterInterface } from './ipfsPinataAdapter';
import logger from '../utils/logger';

// Re-export interface for external use
export type IPFSAdapter = IPFSAdapterInterface;

const {
  IPFS_PROVIDER = 'pinata', // Default to Pinata for easy development
  IPFS_API_URL = 'http://localhost:5001',
  IPFS_CLUSTER_API_URL = 'http://localhost:9094',
  IPFS_GATEWAY_URL = 'http://localhost:8080'
} = process.env;

/**
 * IPFS Cluster API client for self-hosted IPFS operations
 */
export class IPFSClusterClient implements IPFSAdapterInterface {
  private baseUrl: string;
  private ipfsApiUrl: string;

  constructor(
    baseUrl: string = IPFS_CLUSTER_API_URL,
    ipfsApiUrl: string = IPFS_API_URL
  ) {
    this.baseUrl = baseUrl;
    this.ipfsApiUrl = ipfsApiUrl;
    logger.info('🔗 IPFS Cluster adapter initialized (self-hosted nodes)');
  }

  /**
   * Upload file to IPFS via cluster proxy API
   * @param fileData - File data as Buffer
   * @returns CID (Content Identifier)
   */
  async add(fileData: Buffer): Promise<string> {
    const formData = new FormData();
    const blob = new Blob([new Uint8Array(fileData)]);
    formData.append('file', blob);

    const response = await fetch(`${this.baseUrl}/add`, {
      method: 'POST',
      body: formData as any
    });

    if (!response.ok) {
      throw new Error(`Error al subir a IPFS: ${response.statusText}`);
    }

    const result: any = await response.json();
    return result.cid || result.hash;
  }

  /**
   * Pin a CID in the IPFS cluster
   * @param cid - Content identifier to pin
   * @returns Promise that resolves when pinned
   */
  async pin(cid: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/pins/${cid}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Error al anclar CID ${cid}: ${response.statusText}`);
    }
  }

  /**
   * Unpin a CID from the IPFS cluster
   * Used when deleting documents
   * @param cid - Content identifier to unpin
   * @returns Promise that resolves when unpinned
   */
  async unpin(cid: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/pins/${cid}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error(`Error al desanclar CID ${cid}: ${response.statusText}`);
    }
  }

  /**
   * Get pin status for a CID
   * @param cid - Content identifier to check
   * @returns Pin status object
   */
  async getPinStatus(cid: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/pins/${cid}`);

    if (!response.ok) {
      throw new Error(`Error al obtener estado de anclaje para ${cid}: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * List all pinned CIDs
   * @returns Array of pinned CIDs
   */
  async listPins(): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/pins`);

    if (!response.ok) {
      throw new Error(`Error al listar anclajes: ${response.statusText}`);
    }

    return response.json() as Promise<any[]>;
  }

  /**
   * Download file from IPFS via gateway
   * @param cid - Content identifier
   * @returns File data as Buffer
   */
  async cat(cid: string): Promise<Buffer> {
    const response = await fetch(`${this.ipfsApiUrl}/api/v0/cat?arg=${cid}`, {
      method: 'POST'
    });

    if (!response.ok) {
      throw new Error(`Error al descargar CID ${cid}: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
}

/**
 * Factory function to get IPFS adapter based on configuration
 */
function getIPFSAdapter(): IPFSAdapterInterface {
  const provider = IPFS_PROVIDER.toLowerCase();
  
  if (provider === 'pinata') {
    logger.info('📍 Using Pinata Cloud IPFS provider');
    return new PinataAdapter();
  } else if (provider === 'cluster') {
    logger.info('📍 Using IPFS Cluster provider (self-hosted)');
    return new IPFSClusterClient();
  } else {
    logger.warn(`⚠️ Unknown IPFS_PROVIDER "${IPFS_PROVIDER}", defaulting to Pinata`);
    return new PinataAdapter();
  }
}

let ipfsClientInstance: IPFSAdapterInterface | null = null;

function getOrCreateIPFSClient(): IPFSAdapterInterface {
  if (!ipfsClientInstance) {
    ipfsClientInstance = getIPFSAdapter();
  }

  return ipfsClientInstance;
}

// Lazy client proxy: avoids crashing application startup when provider credentials
// are missing, and defers provider validation until an IPFS operation is invoked.
export const ipfsClient = new Proxy({} as IPFSAdapterInterface, {
  get(_target, prop, receiver) {
    const activeClient = getOrCreateIPFSClient();
    const value = Reflect.get(activeClient as unknown as object, prop, receiver);
    return typeof value === 'function' ? value.bind(activeClient) : value;
  },
}) as IPFSAdapterInterface;

// Legacy export for backward compatibility
export const ipfsClusterClient = ipfsClient;

/**
 * Upload file to IPFS and pin it automatically
 * Works with both Pinata and IPFS Cluster
 * 
 * @param fileData - File data as Buffer
 * @returns CID (Content Identifier)
 */
export async function uploadToIPFS(fileData: Buffer): Promise<string> {
  const cid = await ipfsClient.add(fileData);
  return cid;
}

/**
 * Download file from IPFS
 * Works with both Pinata and IPFS Cluster
 * 
 * @param cid - Content identifier
 * @returns File data as Buffer
 */
export async function downloadFromIPFS(cid: string): Promise<Buffer> {
  return await ipfsClient.cat(cid);
}

/**
 * Unpin file from IPFS
 * 
 * IMPORTANT: 
 * - With Pinata: Removes file from your Pinata account
 * - With IPFS Cluster: Removes from your cluster nodes
 * 
 * The file may still exist on other IPFS nodes globally.
 * IPFS is an immutable network - files cannot be truly "deleted".
 * 
 * @param cid - Content identifier to unpin
 */
export async function unpinFromIPFS(cid: string): Promise<void> {
  await ipfsClient.unpin(cid);
}

/**
 * @deprecated Use unpinFromIPFS instead. This function is kept for backward compatibility.
 * Will be removed in a future version.
 */
export const deleteFromIPFS = unpinFromIPFS;
