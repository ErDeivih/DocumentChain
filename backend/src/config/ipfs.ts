/**
 * IPFS configuration for the single self-hosted runtime.
 *
 * The application targets one self-hosted Kubo node exposed through the HTTP API.
 * The canonical and supported provider value is IPFS_PROVIDER="self-hosted".
 */

import logger from '../utils/logger';

export interface IPFSAdapter {
  add(fileData: Buffer): Promise<string>;
  cat(cid: string): Promise<Buffer>;
  pin(cid: string): Promise<void>;
  unpin(cid: string): Promise<void>;
  getPinStatus(cid: string): Promise<any>;
  listPins(): Promise<any[]>;
}

const {
  IPFS_PROVIDER = 'self-hosted',
  IPFS_API_URL = 'http://localhost:5001',
  IPFS_GATEWAY_URL = 'http://localhost:8080'
} = process.env;

type SupportedProvider = 'self-hosted';

function normalizeProvider(rawProvider: string): SupportedProvider {
  const provider = rawProvider.trim().toLowerCase();

  if (provider === 'self-hosted' || provider === 'selfhosted' || provider === 'node' || provider === 'local') {
    return 'self-hosted';
  }

  throw new Error(`Unsupported IPFS_PROVIDER "${rawProvider}". Use "self-hosted".`);
}

function buildPinnedStatus(cid: string, pinType: string = 'recursive') {
  return {
    cid,
    status: 'pinned',
    type: pinType,
    peer_map: {
      selfHostedNode: {
        status: 'pinned'
      }
    }
  };
}

/**
 * Self-hosted IPFS client backed by the Kubo HTTP API.
 */
export class SelfHostedIPFSClient implements IPFSAdapter {
  private baseUrl: string;
  private gatewayUrl: string;

  constructor(
    baseUrl: string = IPFS_API_URL,
    gatewayUrl: string = IPFS_GATEWAY_URL
  ) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.gatewayUrl = gatewayUrl.replace(/\/$/, '');
    logger.info('Self-hosted IPFS adapter initialized');
  }

  async add(fileData: Buffer): Promise<string> {
    const formData = new FormData();
    const blob = new Blob([new Uint8Array(fileData)]);
    formData.append('file', blob, 'documentchain.enc');

    const response = await fetch(`${this.baseUrl}/api/v0/add?pin=true&cid-version=1`, {
      method: 'POST',
      body: formData as any
    });

    if (!response.ok) {
      throw new Error(`Error al subir a IPFS: ${response.status} ${response.statusText}`);
    }

    const result = await response.json() as { Hash?: string; cid?: string; hash?: string };
    const cid = result.Hash || result.cid || result.hash;

    if (!cid) {
      throw new Error('La API de IPFS no devolvio un CID valido');
    }

    return cid;
  }

  async pin(cid: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/v0/pin/add?arg=${encodeURIComponent(cid)}`, {
      method: 'POST'
    });

    if (!response.ok) {
      throw new Error(`Error al anclar CID ${cid}: ${response.status} ${response.statusText}`);
    }
  }

  async unpin(cid: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/v0/pin/rm?arg=${encodeURIComponent(cid)}`, {
      method: 'POST'
    });

    if (!response.ok) {
      throw new Error(`Error al desanclar CID ${cid}: ${response.status} ${response.statusText}`);
    }
  }

  async getPinStatus(cid: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/v0/pin/ls?arg=${encodeURIComponent(cid)}`, {
      method: 'POST'
    });

    if (!response.ok) {
      if (response.status === 404 || response.status === 500) {
        return {
          cid,
          status: 'unpinned',
          peer_map: {}
        };
      }

      throw new Error(`Error al obtener estado de anclaje para ${cid}: ${response.status} ${response.statusText}`);
    }

    const result = await response.json() as { Keys?: Record<string, { Type?: string }> };
    const pinType = result.Keys?.[cid]?.Type;

    return pinType ? buildPinnedStatus(cid, pinType) : {
      cid,
      status: 'unpinned',
      peer_map: {}
    };
  }

  async listPins(): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/api/v0/pin/ls`, {
      method: 'POST'
    });

    if (!response.ok) {
      throw new Error(`Error al listar anclajes: ${response.status} ${response.statusText}`);
    }

    const result = await response.json() as { Keys?: Record<string, { Type?: string }> };
    return Object.entries(result.Keys ?? {}).map(([cid, details]) => buildPinnedStatus(cid, details.Type));
  }

  async cat(cid: string): Promise<Buffer> {
    const response = await fetch(`${this.baseUrl}/api/v0/cat?arg=${encodeURIComponent(cid)}`, {
      method: 'POST'
    });

    if (!response.ok) {
      throw new Error(`Error al descargar CID ${cid}: ${response.status} ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  getGatewayUrl(cid: string): string {
    return `${this.gatewayUrl}/ipfs/${cid}`;
  }
}

function getIPFSAdapter(): IPFSAdapter {
  const provider = normalizeProvider(IPFS_PROVIDER);
  logger.info('Using self-hosted IPFS node provider');
  return new SelfHostedIPFSClient();
}

let ipfsClientInstance: IPFSAdapter | null = null;

function getOrCreateIPFSClient(): IPFSAdapter {
  if (!ipfsClientInstance) {
    ipfsClientInstance = getIPFSAdapter();
  }

  return ipfsClientInstance;
}

// Lazy client proxy: backend startup does not touch IPFS until an operation needs it,
// but once invoked the proxy forwards every call to the real self-hosted adapter.
export const ipfsClient = new Proxy({} as IPFSAdapter, {
  get(_target, prop, receiver) {
    const activeClient = getOrCreateIPFSClient();
    const value = Reflect.get(activeClient as unknown as object, prop, receiver);
    return typeof value === 'function' ? value.bind(activeClient) : value;
  },
}) as IPFSAdapter;

export const ipfsNodeClient = ipfsClient;

export async function uploadToIPFS(fileData: Buffer): Promise<string> {
  return ipfsClient.add(fileData);
}

export async function downloadFromIPFS(cid: string): Promise<Buffer> {
  return ipfsClient.cat(cid);
}

export async function unpinFromIPFS(cid: string): Promise<void> {
  await ipfsClient.unpin(cid);
}

export const deleteFromIPFS = unpinFromIPFS;
