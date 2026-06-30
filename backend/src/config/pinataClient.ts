import logger from '../utils/logger';
import type { IPFSAdapter } from './ipfs';

/**
 * Configuración necesaria para inicializar el cliente de Pinata.
 */
export interface PinataConfig {
  /** Token JWT de autenticación de Pinata. */
  jwt: string;
  /** Clave de API opcional. */
  apiKey?: string;
  /** Secreto de API opcional. */
  apiSecret?: string;
  /** URL del gateway dedicado de Pinata. */
  gatewayUrl: string;
}

/**
 * Cliente IPFS para Pinata que implementa la interfaz `IPFSAdapter`.
 * Utiliza la API v1 de Pinata para anclar, desanclar y listar archivos,
 * así como el gateway dedicado para descargas.
 */
export class PinataIPFSClient implements IPFSAdapter {
  private jwt: string;
  private apiKey?: string;
  private apiSecret?: string;
  private gatewayUrl: string;
  private apiBase = 'https://api.pinata.cloud';

  /**
   * Crea una instancia del cliente de Pinata.
   *
   * @param config - Configuración de autenticación y gateway.
   */
  constructor(config: PinataConfig) {
    this.jwt = config.jwt;
    this.apiKey = config.apiKey;
    this.apiSecret = config.apiSecret;
    this.gatewayUrl = config.gatewayUrl.replace(/\/$/, '');
    logger.info('Adaptador IPFS de Pinata inicializado', { gateway: this.gatewayUrl });
  }

  /**
   * Construye las cabeceras HTTP necesarias para las peticiones a la API de Pinata.
   *
   * @returns Objeto con las cabeceras de autorización.
   */
  private headers(): Record<string, string> {
    const h: Record<string, string> = {};
    // Autenticacion con API key+secret de Pinata (funciona incluso con JWT expirado)
    if (this.apiKey && this.apiSecret) {
      h['pinata_api_key'] = this.apiKey;
      h['pinata_secret_api_key'] = this.apiSecret;
    } else {
      // Autenticacion solo con JWT (API v3 o cuando no hay API key disponible)
      h['Authorization'] = `Bearer ${this.jwt}`;
    }
    return h;
  }

  /**
   * Sube datos a IPFS a través de Pinata.
   *
   * @param fileData - Buffer con los datos a almacenar.
   * @returns CID del contenido anclado.
   * @throws Error si la subida falla o no se devuelve un CID.
   */
  async add(fileData: Buffer): Promise<string> {
    const formData = new FormData();
    const blob = new Blob([new Uint8Array(fileData)]);
    formData.append('file', blob, 'documentchain.enc');

    const response = await fetch(`${this.apiBase}/pinning/pinFileToIPFS`, {
      method: 'POST',
      headers: this.headers(),
      body: formData as any
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Pinata upload error ${response.status}: ${text}`);
    }

    const result = await response.json() as { IpfsHash?: string; ipfsHash?: string; hash?: string };
    const cid = result.IpfsHash || result.ipfsHash || result.hash;

    if (!cid) {
      throw new Error('Pinata did not return a CID');
    }

    logger.info(`Archivo subido a Pinata: ${cid}`);
    return cid;
  }

  /**
   * Descarga el contenido asociado a un CID desde el gateway de Pinata.
   *
   * @param cid - Identificador de contenido a descargar.
   * @returns Buffer con los datos recuperados.
   * @throws Error si la descarga falla.
   */
  async cat(cid: string): Promise<Buffer> {
    const url = `${this.gatewayUrl}/ipfs/${cid}`;
    const response = await fetch(url, { method: 'GET' });

    if (!response.ok) {
      throw new Error(`Pinata gateway download error ${response.status} for CID ${cid}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  /**
   * Ancla un CID en Pinata.
   * Dado que Pinata ya ancla automáticamente al subir, esta operación es un no-op,
   * pero se registra para trazabilidad.
   *
   * @param cid - Identificador de contenido a anclar.
   */
  async pin(cid: string): Promise<void> {
    logger.debug(`Pinata pin called for ${cid} (ya anclado en la subida)`);
  }

  /**
   * Desancla un CID de Pinata.
   *
   * @param cid - Identificador de contenido a desanclar.
   * @throws Error si la operación de desanclaje falla (excepto error 404, que se trata como éxito).
   */
  async unpin(cid: string): Promise<void> {
    const response = await fetch(`${this.apiBase}/pinning/unpin/${cid}`, {
      method: 'DELETE',
      headers: this.headers()
    });

    if (!response.ok) {
      const text = await response.text();
      // 404 means it was already unpinned or never existed; treat as success.
      if (response.status === 404) {
        logger.warn(`Pinata unpin 404 for ${cid}: ${text}`);
        return;
      }
      throw new Error(`Pinata unpin error ${response.status}: ${text}`);
    }

    logger.info(`Archivo desanclado de Pinata: ${cid}`);
  }

  /**
   * Consulta el estado de anclaje de un CID en Pinata.
   *
   * @param cid - Identificador de contenido a consultar.
   * @returns Objeto con el estado de anclaje (`pinned`, `unpinned` o `unknown`).
   */
  async getPinStatus(cid: string): Promise<any> {
    try {
      const list = await this.listPins();
      const found = list.find((p: any) => p.cid === cid);
      if (found) {
        return {
          cid,
          status: 'pinned',
          type: 'remote',
          peer_map: { pinata: { status: 'pinned' } }
        };
      }
      return {
        cid,
        status: 'unpinned',
        peer_map: {}
      };
    } catch (error) {
      logger.error(`Error al verificar estado de Pinata para ${cid}:`, error);
      return {
        cid,
        status: 'unknown',
        peer_map: {}
      };
    }
  }

  /**
   * Lista todos los CIDs anclados actualmente en Pinata.
   *
   * @returns Arreglo de objetos con información de cada anclaje.
   * @throws Error si la consulta a la API falla.
   */
  async listPins(): Promise<any[]> {
    const response = await fetch(`${this.apiBase}/data/pinList?status=pinned&pageLimit=1000`, {
      method: 'GET',
      headers: this.headers()
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Pinata list pins error ${response.status}: ${text}`);
    }

    const result = await response.json() as { rows?: Array<{ ipfs_pin_hash: string; date_pinned: string }> };
    return (result.rows || []).map((row) => ({
      cid: row.ipfs_pin_hash,
      status: 'pinned',
      type: 'remote',
      datePinned: row.date_pinned,
      peer_map: { pinata: { status: 'pinned' } }
    }));
  }

  /**
   * Obtiene la URL completa del gateway de Pinata para un CID determinado.
   *
   * @param cid - Identificador de contenido.
   * @returns URL de acceso al contenido a través del gateway.
   */
  getGatewayUrl(cid: string): string {
    return `${this.gatewayUrl}/ipfs/${cid}`;
  }

  /**
   * Desancla en bloque todos los archivos almacenados actualmente en Pinata.
   * Útil para limpiezas de datos de prueba y respetar los límites del plan gratuito.
   *
   * @returns Número de elementos desanclados correctamente.
   */
  async unpinAll(): Promise<number> {
    logger.info('Obteniendo todos los pines de Pinata para limpieza...');
    const pins = await this.listPins();
    logger.info(`Found ${pins.length} pins to remove`);

    let removed = 0;
    for (const pin of pins) {
      try {
        await this.unpin(pin.cid);
        removed++;
      } catch (err) {
        logger.error(`Failed to unpin ${pin.cid}:`, err);
      }
    }

    logger.info(`Limpieza de Pinata completada. Eliminados ${removed}/${pins.length} pins.`);
    return removed;
  }
}
