/**
 * Pinata IPFS Adapter
 * Uses Pinata Cloud API for IPFS operations
 * Perfect for development - no need to run local IPFS nodes
 */

import FormData from 'form-data';
import axios from 'axios';
import logger from '../utils/logger';

const {
  PINATA_API_KEY,
  PINATA_SECRET_KEY,
  PINATA_JWT,
  PINATA_GATEWAY = 'gateway.pinata.cloud'
} = process.env;

export interface IPFSAdapter {
  add(fileData: Buffer): Promise<string>;
  cat(cid: string): Promise<Buffer>;
  pin(cid: string): Promise<void>;
  unpin(cid: string): Promise<void>;
  getPinStatus(cid: string): Promise<any>;
  listPins(): Promise<any[]>;
}

/**
 * Pinata Cloud IPFS Adapter
 * Uses Pinata API for all IPFS operations
 */
export class PinataAdapter implements IPFSAdapter {
  private baseUrl = 'https://api.pinata.cloud';
  private headers: Record<string, string>;

  constructor() {
    // Priorizar JWT si está disponible, sino usar API Key + Secret
    if (PINATA_JWT) {
      this.headers = {
        'Authorization': `Bearer ${PINATA_JWT}`
      };
    } else if (PINATA_API_KEY && PINATA_SECRET_KEY) {
      this.headers = {
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET_KEY
      };
    } else {
      throw new Error('Pinata credentials not configured. Set PINATA_JWT or PINATA_API_KEY + PINATA_SECRET_KEY');
    }

    logger.info('🌐 Pinata IPFS adapter initialized (cloud gateway)');
  }

  /**
   * Upload file to Pinata
   */
  async add(fileData: Buffer): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', fileData, {
        filename: `document-${Date.now()}.enc`,
        contentType: 'application/octet-stream'
      });

      // Metadata opcional
      const metadata = JSON.stringify({
        name: `Document-${Date.now()}`,
        keyvalues: {
          source: 'documentchain',
          encrypted: 'true'
        }
      });
      formData.append('pinataMetadata', metadata);

      const response = await axios.post(`${this.baseUrl}/pinning/pinFileToIPFS`, formData, {
        headers: {
          ...this.headers,
          ...formData.getHeaders()
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity
      });

      logger.info(`✅ File pinned to Pinata: ${response.data.IpfsHash}`);
      return response.data.IpfsHash;

    } catch (error: any) {
      logger.error('❌ Error uploading to Pinata:', error.response?.data || error.message);
      throw new Error(`Pinata upload failed: ${error.response?.data?.error || error.message}`);
    }
  }

  /**
   * Download file from Pinata gateway
   */
  async cat(cid: string): Promise<Buffer> {
    try {
      const gatewayUrl = `https://${PINATA_GATEWAY}/ipfs/${cid}`;
      
      const response = await fetch(gatewayUrl);

      if (!response.ok) {
        throw new Error(`Pinata download error: ${response.status} ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      logger.info(`✅ File downloaded from Pinata: ${cid} (${arrayBuffer.byteLength} bytes)`);
      return Buffer.from(arrayBuffer);

    } catch (error) {
      logger.error(`❌ Error downloading from Pinata (${cid}):`, error);
      throw new Error(`Pinata download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Pin existing CID to Pinata (by hash)
   */
  async pin(cid: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/pinning/pinByHash`, {
        method: 'POST',
        headers: {
          ...this.headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          hashToPin: cid,
          pinataMetadata: {
            name: `Document-${cid.substring(0, 10)}`,
            keyvalues: {
              source: 'documentchain',
              pinned_manually: 'true'
            }
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.warn(`⚠️ Pinata pin by hash warning: ${response.status} - ${errorText}`);
        // No lanzar error si ya está pinned
        if (response.status === 400) {
          logger.info(`ℹ️ CID ${cid} may already be pinned`);
          return;
        }
        throw new Error(`Pinata pin error: ${response.status} - ${errorText}`);
      }

      logger.info(`✅ CID pinned to Pinata: ${cid}`);

    } catch (error) {
      logger.error(`❌ Error pinning to Pinata (${cid}):`, error);
      throw error;
    }
  }

  /**
   * Unpin CID from Pinata
   */
  async unpin(cid: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/pinning/unpin/${cid}`, {
        method: 'DELETE',
        headers: this.headers
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Pinata unpin error: ${response.status} - ${errorText}`);
      }

      logger.info(`✅ CID unpinned from Pinata: ${cid}`);

    } catch (error) {
      logger.error(`❌ Error unpinning from Pinata (${cid}):`, error);
      throw error;
    }
  }

  /**
   * Get pin status for a CID
   */
  async getPinStatus(cid: string): Promise<any> {
    try {
      const response = await fetch(
        `${this.baseUrl}/data/pinList?hashContains=${cid}&status=pinned`,
        {
          method: 'GET',
          headers: this.headers
        }
      );

      if (!response.ok) {
        throw new Error(`Pinata status error: ${response.status}`);
      }

      const result: any = await response.json();
      
      if (result.rows && result.rows.length > 0) {
        const pin = result.rows[0];
        return {
          status: 'pinned',
          size: pin.size,
          peer_map: { pinata: { status: 'pinned' } }
        };
      }

      return {
        status: 'not_found',
        peer_map: {}
      };

    } catch (error) {
      logger.error(`❌ Error getting pin status from Pinata (${cid}):`, error);
      return {
        status: 'error',
        peer_map: {}
      };
    }
  }

  /**
   * List all pinned CIDs
   */
  async listPins(): Promise<any[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/data/pinList?status=pinned&pageLimit=1000`,
        {
          method: 'GET',
          headers: this.headers
        }
      );

      if (!response.ok) {
        throw new Error(`Pinata list error: ${response.status}`);
      }

      const result: any = await response.json();
      return result.rows || [];

    } catch (error) {
      logger.error('❌ Error listing pins from Pinata:', error);
      throw error;
    }
  }

  /**
   * Test Pinata connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/data/testAuthentication`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        logger.error('❌ Pinata authentication failed');
        return false;
      }

      const result: any = await response.json();
      logger.info(`✅ Pinata authentication successful: ${result.message}`);
      return true;

    } catch (error) {
      logger.error('❌ Error testing Pinata connection:', error);
      return false;
    }
  }
}
