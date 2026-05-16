/**
 * Configuración del proveedor IPFS para el entorno de ejecución.
 *
 * La aplicación admite dos backends de almacenamiento:
 * - Nodo Kubo autoalojado (`IPFS_PROVIDER="self-hosted"`)
 * - Servicio gestionado Pinata (`IPFS_PROVIDER="pinata"`)
 */

import logger from '../utils/logger';
import { PinataIPFSClient } from './pinataClient';
import { env } from './env';

/**
 * Interfaz común para adaptadores de IPFS.
 * Define las operaciones básicas de almacenamiento y recuperación de contenido.
 */
export interface IPFSAdapter {
  add(fileData: Buffer): Promise<string>;
  cat(cid: string): Promise<Buffer>;
  pin(cid: string): Promise<void>;
  unpin(cid: string): Promise<void>;
  getPinStatus(cid: string): Promise<any>;
  listPins(): Promise<any[]>;
}

/**
 * Resultado de una operación de pin en IPFS.
 */
export interface PinResult {
  cid: string;
  status: string;
  size?: number;
}

/**
 * Estado de un pin en IPFS.
 */
export interface PinStatus {
  cid: string;
  pinned: boolean;
  size?: number;
  timestamp?: string;
}

const IPFS_PROVIDER = process.env.IPFS_PROVIDER?.trim() || 'self-hosted';
const IPFS_API_URL: string = env.IPFS_API_URL;
const IPFS_GATEWAY_URL: string = env.IPFS_GATEWAY_URL;
const PINATA_JWT = process.env.PINATA_JWT?.trim() || '';
const PINATA_API_KEY = process.env.PINATA_API_KEY?.trim() || '';
const PINATA_API_SECRET = process.env.PINATA_API_SECRET?.trim() || '';
const PINATA_GATEWAY_URL = process.env.PINATA_GATEWAY_URL?.trim() || '';

type SupportedProvider = 'self-hosted' | 'pinata';

/**
 * Normaliza el valor del proveedor de IPFS configurado.
 *
 * @param rawProvider - Valor bruto de la variable de entorno.
 * @returns Proveedor normalizado (`self-hosted` o `pinata`).
 * @throws Error si el proveedor no está soportado.
 */
function normalizeProvider(rawProvider: string): SupportedProvider {
  const provider = rawProvider.trim().toLowerCase();

  if (provider === 'self-hosted' || provider === 'selfhosted' || provider === 'node' || provider === 'local') {
    return 'self-hosted';
  }

  if (provider === 'pinata') {
    return 'pinata';
  }

  throw new Error(`Unsupported IPFS_PROVIDER "${rawProvider}". Use "self-hosted" or "pinata".`);
}

/**
 * Construye el objeto de estado de anclaje para un CID.
 *
 * @param cid - Identificador de contenido.
 * @param pinType - Tipo de anclaje (por defecto: `'recursive'`).
 * @returns Objeto con el estado de anclaje simulado.
 */
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
 * Cliente IPFS autoalojado basado en la API HTTP de Kubo.
 */
export class SelfHostedIPFSClient implements IPFSAdapter {
  private baseUrl: string;
  private gatewayUrl: string;

  /**
   * Crea una instancia del cliente IPFS autoalojado.
   *
   * @param baseUrl - URL base de la API de IPFS (por defecto: `IPFS_API_URL`).
   * @param gatewayUrl - URL del gateway IPFS (por defecto: `IPFS_GATEWAY_URL`).
   */
  constructor(
    baseUrl: string = IPFS_API_URL,
    gatewayUrl: string = IPFS_GATEWAY_URL
  ) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.gatewayUrl = gatewayUrl.replace(/\/$/, '');
    logger.info('Self-hosted IPFS adapter initialized');
  }

  /**
   * Sube datos a IPFS.
   *
   * @param fileData - Buffer con los datos a almacenar.
   * @returns CID del contenido almacenado.
   * @throws Error si la respuesta de la API no es satisfactoria o no devuelve un CID válido.
   */
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

  /**
   * Ancla (pin) un CID en el nodo IPFS.
   *
   * @param cid - Identificador de contenido a anclar.
   * @throws Error si la operación de anclaje falla.
   */
  async pin(cid: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/v0/pin/add?arg=${encodeURIComponent(cid)}`, {
      method: 'POST'
    });

    if (!response.ok) {
      throw new Error(`Error al anclar CID ${cid}: ${response.status} ${response.statusText}`);
    }
  }

  /**
   * Desancla (unpin) un CID del nodo IPFS.
   *
   * @param cid - Identificador de contenido a desanclar.
   * @throws Error si la operación de desanclaje falla.
   */
  async unpin(cid: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/v0/pin/rm?arg=${encodeURIComponent(cid)}`, {
      method: 'POST'
    });

    if (!response.ok) {
      throw new Error(`Error al desanclar CID ${cid}: ${response.status} ${response.statusText}`);
    }
  }

  /**
   * Obtiene el estado de anclaje de un CID.
   *
   * @param cid - Identificador de contenido a consultar.
   * @returns Objeto con el estado de anclaje.
   * @throws Error si la consulta falla por motivos distintos a 404/500.
   */
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

  /**
   * Lista todos los CIDs anclados en el nodo.
   *
   * @returns Lista de objetos con información de anclaje.
   * @throws Error si la consulta a la API falla.
   */
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

  /**
   * Recupera el contenido asociado a un CID desde IPFS.
   *
   * @param cid - Identificador de contenido a descargar.
   * @returns Buffer con los datos recuperados.
   * @throws Error si la descarga falla.
   */
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

  /**
   * Construye la URL del gateway para un CID.
   *
   * @param cid - Identificador de contenido.
   * @returns URL completa del gateway.
   */
  getGatewayUrl(cid: string): string {
    return `${this.gatewayUrl}/ipfs/${cid}`;
  }
}

/**
 * Obtiene el adaptador de IPFS según la configuración actual.
 *
 * @returns Instancia de `IPFSAdapter` configurada (`SelfHostedIPFSClient` o `PinataIPFSClient`).
 * @throws Error si la configuración es insuficiente.
 */
function getIPFSAdapter(): IPFSAdapter {
  const provider = normalizeProvider(IPFS_PROVIDER);

  if (provider === 'pinata') {
    if (!PINATA_JWT) {
      throw new Error('IPFS_PROVIDER is "pinata" but PINATA_JWT is not set. Please configure PINATA_JWT (and optionally PINATA_GATEWAY_URL).');
    }
    logger.info('Using Pinata IPFS provider');
    return new PinataIPFSClient({
      jwt: PINATA_JWT,
      apiKey: PINATA_API_KEY || undefined,
      apiSecret: PINATA_API_SECRET || undefined,
      gatewayUrl: PINATA_GATEWAY_URL || 'https://gateway.pinata.cloud'
    });
  }

  logger.info('Using self-hosted IPFS node provider');
  return new SelfHostedIPFSClient();
}

let ipfsClientInstance: IPFSAdapter | null = null;

/**
 * Obtiene o crea el cliente IPFS singleton.
 *
 * @returns Instancia activa del adaptador IPFS.
 */
function getOrCreateIPFSClient(): IPFSAdapter {
  if (!ipfsClientInstance) {
    ipfsClientInstance = getIPFSAdapter();
  }

  return ipfsClientInstance;
}

/**
 * Proxy perezoso (lazy) del cliente IPFS.
 * El backend no interactúa con IPFS durante el arranque; una vez invocado,
 * el proxy redirige cada llamada al adaptador real.
 */
export const ipfsClient = new Proxy({} as IPFSAdapter, {
  get(_target, prop, receiver) {
    const activeClient = getOrCreateIPFSClient();
    const value = Reflect.get(activeClient as unknown as object, prop, receiver);
    return typeof value === 'function' ? value.bind(activeClient) : value;
  },
}) as IPFSAdapter;

export const ipfsNodeClient = ipfsClient;

/**
 * Sube datos a IPFS utilizando el cliente configurado.
 *
 * @param fileData - Buffer con los datos a almacenar.
 * @returns CID del contenido almacenado.
 */
export async function uploadToIPFS(fileData: Buffer): Promise<string> {
  return ipfsClient.add(fileData);
}

/**
 * Descarga contenido de IPFS a partir de su CID.
 *
 * @param cid - Identificador de contenido.
 * @returns Buffer con los datos recuperados.
 */
export async function downloadFromIPFS(cid: string): Promise<Buffer> {
  return ipfsClient.cat(cid);
}

/**
 * Desancla un CID de IPFS.
 *
 * @param cid - Identificador de contenido a desanclar.
 */
export async function unpinFromIPFS(cid: string): Promise<void> {
  await ipfsClient.unpin(cid);
}

/**
 * Alias de `unpinFromIPFS` para eliminar contenido de IPFS.
 */
export const deleteFromIPFS = unpinFromIPFS;
