/**
 * @fileoverview API de documentos para el frontend.
 *
 * Proporciona métodos para crear, listar, descargar, archivar, transferir
 * y gestionar versiones de documentos mediante el patrón prepare/confirm.
 */

import { api } from '../lib/api';
import type { Document, PaginatedResponse, Version } from '../types';

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

// Tipos para el patrón prepare/confirm (Arquitectura de Cifrado Backend)

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
  /** Buffer del archivo sin cifrar (el backend se encarga del cifrado). */
  fileBuffer: ArrayBuffer;
  /** Identificador de la wallet para firmar. */
  walletId: string;
  /** Visibilidad del documento. */
  visibility?: 'PRIVATE' | 'PUBLIC';
  /** Identificador de carpeta opcional. */
  folderId?: string;
  /** Etiquetas opcionales. */
  tags?: string[];
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

/** API de operaciones con documentos. */
export const documentsApi = {
  // ==================== PATRÓN PREPARE/CONFIRM ====================

  /**
   * Prepara la creación de un documento.
   *
   * Flujo:
   * 1. El frontend envía el archivo sin cifrar al backend (sobre HTTPS).
   * 2. El backend cifra el archivo con AES-256-GCM.
   * 3. El backend cifra la clave simétrica con la clave pública del usuario.
   * 4. El backend sube el archivo cifrado a IPFS.
   * 5. El backend crea el registro en BD con estado PREPARING.
   * 6. Devuelve los datos necesarios para la transacción blockchain.
   *
   * @param input - Datos de entrada para la preparación.
   * @returns Respuesta con docId, ipfsCid y documentId.
   */
  prepareCreate: async (input: PrepareDocumentInput): Promise<PrepareDocumentResponse> => {
    const formData = new FormData();

    // Convertir ArrayBuffer a Blob para subida (sin cifrar)
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

    const response = await api.post<PrepareDocumentResponse>('/documents/prepare', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
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

  /**
   * Obtiene los documentos creados con una wallet específica.
   * @param walletId - Identificador de la wallet.
   * @returns Lista de documentos.
   */
  getByWallet: async (walletId: string): Promise<{ documents: Document[] }> => {
    const response = await api.get<{ documents: Document[] }>(`/documents/wallet/${walletId}`);
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
  }): Promise<PaginatedResponse<Document>> => {
    const response = await api.get<PaginatedResponse<Document>>('/documents', { params });
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
   * @deprecated Utilice prepareCreate + confirmCreate en su lugar.
   * Este método se mantiene por compatibilidad pero será eliminado.
   * @param file - Archivo a subir.
   * @param name - Nombre del documento.
   * @param password - Contraseña del usuario.
   * @param options - Opciones adicionales.
   * @returns Documento creado.
   */
  upload: async (
    file: File,
    name: string,
    password: string,
    options?: {
      description?: string;
      folderId?: string;
      tags?: string[];
    }
  ): Promise<{ document: Document }> => {
    console.warn('documentsApi.upload is deprecated. Use prepareCreate + confirmCreate instead.');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);
    formData.append('password', password);
    if (options?.description) {
      formData.append('description', options.description);
    }
    if (options?.folderId) {
      formData.append('folderId', options.folderId);
    }
    if (options?.tags && options.tags.length > 0) {
      formData.append('tags', JSON.stringify(options.tags));
    }

    const response = await api.post<{ document: Document }>('/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
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
   * Archiva un documento.
   * @param id - Identificador del documento.
   * @returns Promesa vacía.
   */
  archive: async (id: string): Promise<void> => {
    await api.post(`/documents/${id}/archive/prepare`);
    await api.post(`/documents/${id}/archive/confirm`, { txHash: null });
  },

  /**
   * Desarchiva un documento.
   * @param id - Identificador del documento.
   * @returns Promesa vacía.
   */
  unarchive: async (id: string): Promise<void> => {
    await api.post(`/documents/${id}/unarchive/prepare`);
    await api.post(`/documents/${id}/unarchive/confirm`, { txHash: null });
  },

  /**
   * Elimina un documento.
   * @param id - Identificador del documento.
   * @returns Promesa vacía.
   */
  delete: async (id: string): Promise<void> => {
    await api.post(`/documents/${id}/delete/prepare`);
    await api.post(`/documents/${id}/delete/confirm`, { txHash: null });
  },

  /**
   * Transfiere la propiedad de un documento a otro usuario.
   * @param id - Identificador del documento.
   * @param newOwnerId - Identificador del nuevo propietario.
   * @param currentPassword - Contraseña del propietario actual.
   * @param newOwnerPassword - Contraseña del nuevo propietario.
   * @returns Promesa vacía.
   */
  transfer: async (
    id: string,
    newOwnerId: string,
    currentPassword: string,
    newOwnerPassword: string
  ): Promise<void> => {
    await api.post(`/documents/${id}/transfer`, {
      newOwnerId,
      currentPassword,
      newOwnerPassword
    });
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
   * Prepara el archivado de un documento.
   * @param documentId - UUID del documento.
   * @returns Identificador blockchain del documento.
   */
  prepareArchive: async (documentId: string): Promise<{ blockchainId: string }> => {
    const response = await api.post<{ blockchainId: string }>(`/documents/${documentId}/archive/prepare`);
    return response.data;
  },

  /**
   * Confirma el archivado tras la transacción blockchain.
   * @param params - Parámetros de confirmación.
   * @param params.documentId - UUID del documento.
   * @param params.txHash - Hash de la transacción.
   * @returns Promesa vacía.
   */
  confirmArchive: async (params: { documentId: string; txHash: string }): Promise<void> => {
    await api.post(`/documents/${params.documentId}/archive/confirm`, { txHash: params.txHash });
  },

  /**
   * Prepara la transferencia de un documento (Arquitectura de Cifrado Backend).
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
    decryptedSymmetricKey?: string;
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
      decryptedSymmetricKey: params.decryptedSymmetricKey
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
   * Prepara la restauración de una versión anterior.
   * @param params - Parámetros de restauración.
   * @param params.documentId - UUID del documento.
   * @param params.versionNumber - Número de versión a restaurar.
   * @returns Identificadores de la versión y del documento en blockchain.
   */
  prepareRestore: async (params: { documentId: string; versionNumber: number }): Promise<{
    versionId: string;
    blockchainId: string;
  }> => {
    const response = await api.post<{ versionId: string; blockchainId: string }>(
      `/documents/${params.documentId}/versions/restore/prepare`,
      { versionNumber: params.versionNumber }
    );
    return response.data;
  },

  /**
   * Confirma la restauración de una versión tras la transacción blockchain.
   * @param params - Parámetros de confirmación.
   * @param params.versionId - Identificador de la versión.
   * @param params.txHash - Hash de la transacción.
   * @returns Versión restaurada.
   */
  confirmRestore: async (params: { versionId: string; txHash: string }): Promise<Version> => {
    const response = await api.post<{ version: Version }>(
      `/versions/${params.versionId}/restore/confirm`,
      { txHash: params.txHash }
    );
    return response.data.version;
  }
};

/**
 * Función de conveniencia para subir documentos (obsoleto).
 * @deprecated Utilice documentsApi.prepareCreate + confirmCreate.
 * @param file - Archivo a subir.
 * @param password - Contraseña del usuario.
 * @param options - Opciones adicionales.
 * @returns Documento creado.
 */
export const uploadDocument = async (
  file: File,
  password: string,
  options?: {
    folderId?: string;
    tags?: string[];
  }
): Promise<Document> => {
  const result = await documentsApi.upload(file, file.name, password, options);
  return result.document;
};

// Alias para compatibilidad hacia atrás

/** Alias de {@link documentsApi.list}. */
export const listDocuments = documentsApi.list;
/** Alias de {@link documentsApi.get}. */
export const getDocument = documentsApi.get;
/** Alias de {@link documentsApi.download}. */
export const downloadDocument = documentsApi.download;
/** Alias de {@link documentsApi.archive}. */
export const archiveDocument = documentsApi.archive;
/** Alias de {@link documentsApi.delete}. */
export const deleteDocument = documentsApi.delete;
