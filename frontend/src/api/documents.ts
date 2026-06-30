import axios from 'axios';
import { api } from '../lib/api';
import type { Document, PaginatedDocumentsResponse, PublicDocument } from '../types';

/**
 * Respuesta de descarga de documento.
 */
export interface DocumentDownloadResponse {
  /** Contenido del archivo como Blob. */
  blob: Blob;
  /** Nombre del archivo. */
  filename: string;
  /** Tipo MIME del archivo. */
  mimeType: string;
  /** Indica si el archivo está cifrado. */
  isEncrypted: boolean;
  /** Clave simétrica cifrada (si aplica). */
  encryptedSymmetricKey?: string;
  /** Vector de inicialización (si aplica). */
  encryptionIV?: string;
  /** Etiqueta de autenticación (si aplica). */
  encryptionAuthTag?: string;
}

/**
 * Extrae el nombre de archivo del header Content-Disposition.
 * @param contentDisposition - Valor del header.
 * @param fallbackName - Nombre por defecto si no se encuentra.
 * @returns Nombre de archivo extraído.
 */
export function parseFilename(contentDisposition: string | undefined, fallbackName: string): string {
  if (!contentDisposition) {
    return fallbackName;
  }

  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1]);
  }

  const quotedMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
  if (quotedMatch?.[1]) {
    return quotedMatch[1];
  }

  return fallbackName;
}

/**
 * Datos de entrada para preparar la creación de un documento.
 */
export interface PrepareDocumentInput {
  /** Nombre del documento. */
  name: string;
  /** Descripción opcional. */
  description?: string;
  /** Tipo MIME del archivo. */
  mimeType: string;
  /** Buffer del archivo YA CIFRADO por el frontend (o raw si PUBLIC). */
  fileBuffer: ArrayBuffer;
  /** Identificador de la wallet para firmar. */
  walletId: string;
  /** Visibilidad del documento. */
  visibility?: 'PRIVATE' | 'PUBLIC';
  /** Identificador de carpeta opcional. */
  folderId?: string;
  /** Etiquetas opcionales. */
  tags?: string[];
  /** Clave simétrica cifrada con RSA-OAEP por el frontend. */
  encryptedSymmetricKey?: string;
  /** SHA-256 hexadecimal del archivo original. */
  contentHash?: string;
  /** IV de AES-GCM en Base64. */
  encryptionIV?: string;
  /** AuthTag de AES-GCM en Base64. */
  encryptionAuthTag?: string;
}

/**
 * Respuesta de la preparación de creación de documento.
 */
export interface PrepareDocumentResponse {
  /** Identificador bytes32 para blockchain. */
  docId: string;
  /** CID del archivo cifrado en IPFS. */
  ipfsCid: string;
  /** UUID del documento en base de datos. */
  documentId: string;
  /** Identificador público (si aplica). */
  publicId: string | null;
  /** Hash de la clave simétrica cifrada (bytes32 para blockchain). */
  encryptedKeyHash: string;
  /** Hash SHA-256 del contenido (bytes32 para blockchain). */
  contentHash: string;
}

/**
 * Datos de entrada para confirmar la creación de un documento.
 */
export interface ConfirmDocumentInput {
  /** UUID del documento. */
  documentId: string;
  /** Hash de la transacción blockchain. */
  txHash: string;
  /** Identificador blockchain opcional (desde evento). */
  blockchainId?: string;
}

// ==================== DOCUMENTOS PÚBLICOS ====================

const API_URL = import.meta.env.VITE_API_URL || '/api';

const publicApi = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const publicDocumentsApi = {
  get: async (publicId: string): Promise<{ document: PublicDocument }> => {
    const response = await publicApi.get<{ document: PublicDocument }>(`/public-documents/${publicId}`);
    return response.data;
  },
  getContentUrl: (publicId: string, versionNumber?: number): string => {
    return versionNumber
      ? `${API_URL}/public-documents/${publicId}/versions/${versionNumber}/content`
      : `${API_URL}/public-documents/${publicId}/content`;
  },
  getDownloadUrl: (publicId: string, versionNumber?: number): string => {
    return versionNumber
      ? `${API_URL}/public-documents/${publicId}/versions/${versionNumber}/download`
      : `${API_URL}/public-documents/${publicId}/download`;
  },
};

// ==================== API DE DOCUMENTOS ====================

/** API de operaciones con documentos. */
export const documentsApi = {
  // ==================== PATRÓN PREPARE/CONFIRM ====================

  /**
   * Prepara la creación de un documento.
   *
   * Flujo:
   * 1. El frontend cifra el archivo con AES-256-GCM y lo envía al backend ya cifrado.
   * 2. El backend valida los campos de cifrado y sube el archivo a IPFS.
   * 3. El backend crea el registro en BD con estado PREPARING.
   * 4. Devuelve los datos necesarios para la transacción blockchain.
   *
   * @param input - Datos de entrada para la preparación.
   * @returns Respuesta con docId, ipfsCid y documentId.
   */
  prepareCreate: async (input: PrepareDocumentInput): Promise<PrepareDocumentResponse> => {
    const formData = new FormData();

    // Convertir ArrayBuffer a Blob para subida (pre-cifrado por frontend)
    const fileBlob = new Blob([input.fileBuffer], { type: input.mimeType });
    formData.append('encryptedFile', fileBlob, input.name);
    formData.append('name', input.name);
    formData.append('mimeType', input.mimeType);
    formData.append('walletId', input.walletId);
    formData.append('visibility', input.visibility || 'PRIVATE');

    if (input.description) {
      formData.append('description', input.description);
    }
    if (input.folderId) {
      formData.append('folderId', input.folderId);
    }
    if (input.tags && input.tags.length > 0) {
      formData.append('tags', JSON.stringify(input.tags));
    }
    if (input.encryptedSymmetricKey) {
      formData.append('encryptedSymmetricKey', input.encryptedSymmetricKey);
    }
    if (input.contentHash) {
      formData.append('contentHash', input.contentHash);
    }
    if (input.encryptionIV) {
      formData.append('encryptionIV', input.encryptionIV);
    }
    if (input.encryptionAuthTag != null) {
      formData.append('encryptionAuthTag', input.encryptionAuthTag);
    }

    const response = await api.post<PrepareDocumentResponse>('/documents/prepare', formData);
    return response.data;
  },

  /**
   * Confirma la creación de un documento tras la transacción blockchain.
   *
   * Llámalo después de que el usuario firme y envíe la transacción.
   *
   * @param input - Datos de confirmación.
   * @returns Documento creado.
   */
  confirmCreate: async (input: ConfirmDocumentInput): Promise<{ document: Document }> => {
    const response = await api.post<{ document: Document }>('/documents/confirm', input);
    return response.data;
  },

  // ==================== MÉTODOS EXISTENTES ====================

  /**
   * Lista los documentos del usuario con paginación y filtros.
   * @param params - Parámetros de filtrado y paginación.
   * @returns Respuesta paginada con documentos.
   */
  list: async (params?: {
    includeArchived?: boolean;
    onlyArchived?: boolean;
    page?: number;
    limit?: number;
    folderId?: string;
    search?: string;
    fileType?: string;
  }): Promise<PaginatedDocumentsResponse> => {
    const response = await api.get<PaginatedDocumentsResponse>('/documents', { params });
    return response.data;
  },

  /**
   * Obtiene un documento por su ID.
   * @param id - Identificador del documento.
   * @returns Documento encontrado.
   */
  get: async (id: string): Promise<{ document: Document }> => {
    const response = await api.get<{ document: Document }>(`/documents/${id}`);
    return response.data;
  },

  /**
   * Descarga un documento por su ID.
   * @param id - Identificador del documento.
   * @returns Datos del archivo descargado.
   */
  download: async (id: string): Promise<DocumentDownloadResponse> => {
    const response = await api.get(`/documents/${id}/download`, {
      responseType: 'blob'
    });

    return {
      blob: response.data,
      filename: parseFilename(response.headers['content-disposition'], `document-${id}`),
      mimeType: response.headers['x-mime-type'] || response.data.type || 'application/octet-stream',
      isEncrypted: response.headers['x-is-encrypted'] !== 'false',
      encryptedSymmetricKey: response.headers['x-encrypted-symmetric-key'],
      encryptionIV: response.headers['x-encryption-iv'],
      encryptionAuthTag: response.headers['x-encryption-auth-tag'],
    };
  },

  /**
   * Prepara el archivado de un documento.
   *
   * @param id - Identificador del documento
   * @returns Datos con el blockchainId para la transacción
   */
  archive: async (id: string): Promise<{ blockchainId: string }> => {
    const prepareRes = await api.post(`/documents/${id}/archive/prepare`);
    return prepareRes.data;
  },
  /**
   * Confirma el archivado de un documento tras la transacción blockchain.
   *
   * @param id - Identificador del documento
   * @param txHash - Hash de la transacción blockchain
   */
  archiveConfirm: async (id: string, txHash: string): Promise<void> => {
    await api.post(`/documents/${id}/archive/confirm`, { txHash });
  },

  /**
   * Prepara el desarchivado de un documento.
   *
   * @param id - Identificador del documento
   * @returns Datos con el blockchainId para la transacción
   */
  unarchive: async (id: string): Promise<{ blockchainId: string }> => {
    const prepareRes = await api.post(`/documents/${id}/unarchive/prepare`);
    return prepareRes.data;
  },
  /**
   * Confirma el desarchivado de un documento tras la transacción blockchain.
   *
   * @param id - Identificador del documento
   * @param txHash - Hash de la transacción blockchain
   */
  unarchiveConfirm: async (id: string, txHash: string): Promise<void> => {
    await api.post(`/documents/${id}/unarchive/confirm`, { txHash });
  },

  /**
   * Prepara la eliminación de un documento.
   *
   * @param id - Identificador del documento
   * @returns Datos con el blockchainId para la transacción
   */
  delete: async (id: string): Promise<{ blockchainId: string }> => {
    const prepareRes = await api.post(`/documents/${id}/delete/prepare`);
    return prepareRes.data;
  },
  /**
   * Confirma la eliminación de un documento tras la transacción blockchain.
   *
   * @param id - Identificador del documento
   * @param txHash - Hash de la transacción blockchain
   */
  deleteConfirm: async (id: string, txHash: string): Promise<void> => {
    await api.post(`/documents/${id}/delete/confirm`, { txHash });
  },

  // ==================== MÉTODOS DE SERVICIO BLOCKCHAIN ====================

  /**
   * Revierte la creación de un documento (elimina documento, versiones e IPFS).
   *
   * Utilízalo cuando la transacción blockchain falle después de la preparación.
   *
   * @param documentId - UUID del documento.
   * @returns Promesa vacía.
   */
  rollback: async (documentId: string): Promise<void> => {
    await api.post(`/documents/${documentId}/rollback`);
  },

  /**
   * Prepara la transferencia de un documento.
   *
   * Flujo:
   * 1. El frontend descifra la clave simétrica con la clave privada del propietario actual.
   * 2. El backend re-cifra con la clave pública del nuevo propietario.
   * 3. El backend actualiza la propiedad tras confirmación blockchain.
   *
   * @param params - Parámetros de la transferencia.
   * @returns Datos preparados para la transacción blockchain.
   */
  prepareTransfer: async (params: {
    documentId: string;
    newOwnerId: string;
    walletId: string;
    newOwnerWalletAddress: string;
    reEncryptedSymmetricKey?: string;
  }): Promise<{
    transferId: string;
    documentId: string;
    docId: string;
    currentOwnerAddress: string;
    newOwnerAddress: string;
    message: string;
    nonce: number;
  }> => {
    const response = await api.post(`/documents/${params.documentId}/transfer/prepare`, {
      newOwnerId: params.newOwnerId,
      walletId: params.walletId,
      newOwnerWalletAddress: params.newOwnerWalletAddress,
      reEncryptedSymmetricKey: params.reEncryptedSymmetricKey
    });
    return response.data;
  },

  /**
   * Confirma la transferencia tras la transacción blockchain.
   * @param params - Parámetros de confirmación.
   * @param params.documentId - UUID del documento.
   * @param params.transferId - Identificador de la transferencia.
   * @param params.txHash - Hash de la transacción.
   * @param params.signature - Firma adicional (opcional).
   * @returns Promesa vacía.
   */
  confirmTransfer: async (params: {
    documentId: string;
    transferId: string;
    txHash: string;
    signature?: string;
  }): Promise<void> => {
    await api.post(`/documents/${params.documentId}/transfer/confirm`, {
      transferId: params.transferId,
      txHash: params.txHash,
      signature: params.signature || ''
    });
  },

  /**
   * Revierte una transferencia preparada tras un fallo en la transacción blockchain.
   * @param documentId - UUID del documento.
   * @param transferId - Identificador de la transferencia.
   * @returns Promesa vacía.
   */
  rollbackTransfer: async (documentId: string, transferId: string): Promise<void> => {
    await api.post(`/documents/${documentId}/transfer/rollback`, { transferId });
  },

  update: async (id: string, data: { name?: string; description?: string; tags?: string[]; folderId?: string | null }): Promise<Document> => {
    const response = await api.put<Document>(`/documents/${id}`, data);
    return response.data;
  },
};

// Alias para compatibilidad hacia atrás

/** Alias de {@link documentsApi.list}. */
export const listDocuments = documentsApi.list;
/** Alias de {@link documentsApi.get}. */
export const getDocument = documentsApi.get;
/** Alias de {@link documentsApi.download}. */
export const downloadDocument = documentsApi.download;

