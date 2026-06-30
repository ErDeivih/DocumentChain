/**
 * API de Auditoría Blockchain - Acceso Público.
 * Similar a Etherscan, cualquier persona puede consultar datos de blockchain.
 */

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

/** Cliente axios público (sin autenticación). */
const publicApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Evento de auditoría registrado en blockchain.
 */
export interface AuditEvent {
  /** Identificador del evento. */
  id: string;
  /** Tipo de evento. */
  eventType: string;
  /** Identificador en blockchain. */
  blockchainId: string;
  /** Actor que realizó la acción. */
  actor: string;
  /** Marca temporal del evento. */
  timestamp: string;
  /** Número de bloque. */
  blockNumber: number;
  /** Hash de la transacción. */
  transactionHash: string;
  /** Detalles adicionales del evento. */
  details: Record<string, any>;
}

/**
 * Rastro de auditoría de un documento.
 */
export interface AuditTrail {
  /** Indica si la consulta fue exitosa. */
  success: boolean;
  /** Identificador en blockchain. */
  blockchainId: string;
  /** Número total de eventos. */
  totalEvents: number;
  /** Lista de eventos de auditoría. */
  events: AuditEvent[];
}

/**
 * Resultado de verificación de integridad de un documento.
 */
export interface IntegrityCheck {
  /** Indica si la integridad es válida. */
  valid: boolean;
  /** Datos almacenados en blockchain. */
  blockchainData: {
    /** Indica si el documento existe en blockchain. */
    exists: boolean;
    /** Propietario en blockchain. */
    owner: string;
    /** Hash del archivo. */
    fileHash: string;
    /** Indica si está marcado como eliminado. */
    isDeleted: boolean;
  };
  /** Datos almacenados en base de datos. */
  databaseData: {
    /** Indica si existe en base de datos. */
    exists: boolean;
    /** Nombre del documento. */
    name: string | null;
    /** Hash del contenido. */
    contentHash: string | null;
  };
  /** Coincidencias entre fuentes. */
  match: {
    /** Coincidencia del hash de contenido. */
    contentHash: boolean;
    /** Coincidencia del propietario. */
    owner: boolean;
  };
}

/**
 * Prueba de propiedad de un documento.
 */
export interface OwnershipProof {
  /** Indica si la dirección es propietaria. */
  isOwner: boolean;
  /** Identificador en blockchain. */
  blockchainId: string;
  /** Dirección de la wallet consultada. */
  walletAddress: string;
  /** Información del documento en blockchain. */
  documentInfo: {
    /** Propietario registrado. */
    owner: string;
    /** Hash del archivo. */
    fileHash: string;
    /** Fecha de creación. */
    createdAt: string;
  };
}

/**
 * Metadatos públicos de un documento.
 */
export interface PublicMetadata {
  /** Identificador en blockchain. */
  blockchainId: string;
  /** Identificador del documento. */
  documentId?: string;
  /** Identificador público. */
  publicId?: string | null;
  /** Visibilidad del documento. */
  visibility?: string;
  /** Propietario del documento. */
  owner: string;
  /** Hash del archivo. */
  fileHash: string;
  /** CID del contenido en IPFS. */
  contentCid: string;
  /** Fecha de creación. */
  createdAt: string;
  /** Versión actual. */
  currentVersion: number;
}

/**
 * Estadísticas públicas del sistema.
 */
export interface PublicStats {
  /** Número total de documentos. */
  totalDocuments: number;
  /** Número total de firmas. */
  totalSignatures: number;
  /** Número total de compartidos. */
  totalShares: number;
  /** Número total de versiones. */
  totalVersions: number;
  /** Usuarios activos. */
  activeUsers: number;
}

/**
 * Detalles de una transacción blockchain.
 */
export interface TransactionDetails {
  /** Indica si la consulta fue exitosa. */
  success: boolean;
  /** Información de la transacción. */
  transaction: {
    /** Hash de la transacción. */
    hash: string;
    /** Dirección origen. */
    from: string;
    /** Dirección destino. */
    to: string | null;
    /** Valor transferido. */
    value: string;
    /** Precio del gas. */
    gasPrice: string | null;
    /** Gas utilizado. */
    gasUsed: string | null;
    /** Estado de la transacción. */
    status: number | null;
    /** Número de bloque. */
    blockNumber: number | null;
    /** Marca temporal. */
    timestamp: string | null;
  };
  /** Eventos asociados a la transacción. */
  events: Array<{
    /** Nombre del evento. */
    name: string;
    /** Argumentos del evento. */
    args: Record<string, any>;
    /** Identificador en blockchain. */
    blockchainId: string;
    /** Documento asociado (si aplica). */
    document?: {
      /** Identificador del documento. */
      id: string;
      /** Nombre del documento. */
      name: string;
      /** Identificador público. */
      publicId: string | null;
      /** Visibilidad. */
      visibility: string;
      /** Nombre de usuario del propietario. */
      ownerUsername: string;
    } | null;
  }>;
}

/** API de auditoría blockchain pública. */
export const auditApi = {
  /**
   * Obtiene el historial completo de auditoría de un documento.
   * @param blockchainId - Identificador en blockchain.
   * @returns Rastro de auditoría.
   */
  getAuditTrail: async (blockchainId: string): Promise<AuditTrail> => {
    const response = await publicApi.get(`/audit/trail/${blockchainId}`);
    return response.data;
  },

  /**
   * Verifica la integridad de un documento.
   * @param fileId - Identificador del archivo.
   * @returns Resultado de la verificación de integridad.
   */
  verifyIntegrity: async (fileId: string): Promise<{ success: boolean; integrity: IntegrityCheck }> => {
    const response = await publicApi.get(`/audit/integrity/${fileId}`);
    return response.data;
  },

  /**
   * Verifica la propiedad de un documento.
   * @param blockchainId - Identificador en blockchain.
   * @param walletAddress - Dirección de la wallet.
   * @returns Prueba de propiedad.
   */
  verifyOwnership: async (blockchainId: string, walletAddress: string): Promise<{ success: boolean; ownership: OwnershipProof }> => {
    const response = await publicApi.get(`/audit/ownership/${blockchainId}/${walletAddress}`);
    return response.data;
  },

  /**
   * Obtiene los metadatos públicos de un documento.
   * @param blockchainId - Identificador en blockchain.
   * @returns Metadatos públicos.
   */
  getPublicMetadata: async (blockchainId: string): Promise<{ success: boolean; metadata: PublicMetadata }> => {
    const response = await publicApi.get(`/audit/metadata/${blockchainId}`);
    return response.data;
  },

  /**
   * Obtiene los detalles de una transacción por su hash.
   * @param txHash - Hash de la transacción.
   * @returns Detalles de la transacción.
   */
  getTransactionByHash: async (txHash: string): Promise<TransactionDetails> => {
    const response = await publicApi.get(`/audit/transaction/${txHash}`);
    return response.data;
  },

  /**
   * Consulta eventos de auditoría con filtros y paginación.
   * @param params - Parámetros de consulta (filtros, offset, limit).
   * @returns Lista paginada de eventos.
   */
  queryEvents: async (params: Record<string, unknown>): Promise<any> => {
    const response = await publicApi.get('/audit/events', { params });
    return response.data;
  },
};

export default auditApi;
