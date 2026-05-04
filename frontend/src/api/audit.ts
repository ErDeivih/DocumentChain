/**
 * API de Auditoría Blockchain - Acceso Público
 * Similar a Etherscan, cualquier persona puede consultar datos de blockchain
 */

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

// Cliente axios público (sin autenticación)
const publicApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface AuditEvent {
  id: string;
  eventType: string;
  blockchainId: string;
  actor: string;
  timestamp: string;
  blockNumber: number;
  transactionHash: string;
  details: Record<string, any>;
}

export interface AuditTrail {
  success: boolean;
  blockchainId: string;
  totalEvents: number;
  events: AuditEvent[];
}

export interface IntegrityCheck {
  valid: boolean;
  blockchainData: {
    exists: boolean;
    owner: string;
    fileHash: string;
    isDeleted: boolean;
  };
  databaseData: {
    exists: boolean;
    name: string | null;
    contentHash: string | null;
  };
  match: {
    contentHash: boolean;
    owner: boolean;
  };
}

export interface OwnershipProof {
  isOwner: boolean;
  blockchainId: string;
  walletAddress: string;
  documentInfo: {
    owner: string;
    fileHash: string;
    createdAt: string;
  };
}

export interface PublicMetadata {
  blockchainId: string;
  documentId?: string;
  publicId?: string | null;
  visibility?: string;
  owner: string;
  fileHash: string;
  contentCid: string;
  createdAt: string;
  isDeleted: boolean;
  currentVersion: number;
}

export interface PublicStats {
  totalDocuments: number;
  totalSignatures: number;
  totalShares: number;
  totalVersions: number;
  activeUsers: number;
  lastBlockSynced: number;
}

export interface AuditHealth {
  success: boolean;
  service: string;
  status: string;
  blockchain: {
    connected: boolean;
    latestBlock: number;
  };
  timestamp: string;
}

export interface TransactionDetails {
  success: boolean;
  transaction: {
    hash: string;
    from: string;
    to: string | null;
    value: string;
    gasPrice: string | null;
    gasUsed: string | null;
    status: number | null;
    blockNumber: number | null;
    timestamp: string | null;
  };
  events: Array<{
    name: string;
    args: Record<string, any>;
    blockchainId: string;
    document?: {
      id: string;
      name: string;
      publicId: string | null;
      visibility: string;
      ownerUsername: string;
    } | null;
  }>;
}

export const auditApi = {
  /**
   * Obtener historial completo de auditoría de un documento
   */
  getAuditTrail: async (blockchainId: string): Promise<AuditTrail> => {
    const response = await publicApi.get(`/audit/trail/${blockchainId}`);
    return response.data;
  },

  /**
   * Verificar integridad de un documento
   */
  verifyIntegrity: async (fileId: string): Promise<{ success: boolean; integrity: IntegrityCheck }> => {
    const response = await publicApi.get(`/audit/integrity/${fileId}`);
    return response.data;
  },

  /**
   * Verificar propiedad de un documento
   */
  verifyOwnership: async (blockchainId: string, walletAddress: string): Promise<{ success: boolean; ownership: OwnershipProof }> => {
    const response = await publicApi.get(`/audit/ownership/${blockchainId}/${walletAddress}`);
    return response.data;
  },

  /**
   * Obtener metadatos públicos de un documento
   */
  getPublicMetadata: async (blockchainId: string): Promise<{ success: boolean; metadata: PublicMetadata }> => {
    const response = await publicApi.get(`/audit/metadata/${blockchainId}`);
    return response.data;
  },

  /**
   * Obtener estadísticas públicas del sistema
   */
  getPublicStats: async (): Promise<{ success: boolean; stats: PublicStats }> => {
    const response = await publicApi.get('/audit/stats');
    return response.data;
  },

  /**
   * Verificar estado del servicio de auditoría
   */
  getHealth: async (): Promise<AuditHealth> => {
    const response = await publicApi.get('/audit/health');
    return response.data;
  },

  /**
   * Obtener detalles de una transacción por su hash
   */
  getTransactionByHash: async (txHash: string): Promise<TransactionDetails> => {
    const response = await publicApi.get(`/audit/transaction/${txHash}`);
    return response.data;
  },
};

export default auditApi;
