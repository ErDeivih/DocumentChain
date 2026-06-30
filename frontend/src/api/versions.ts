import { api, type RetryableRequestConfig } from '../lib/api';
import type { Version } from '../types';
import { parseFilename } from './documents';

const retryOn429Config: RetryableRequestConfig = {
  retryOn429: true,
  retryOn429MaxAttempts: 2,
};

/**
 * Respuesta de descarga de una versión.
 */
export interface VersionDownloadResponse {
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
 * Datos de entrada para preparar la creación de una versión.
 */
export interface PrepareVersionInput {
  /** Identificador del documento. */
  documentId: string;
  /** Buffer del archivo YA CIFRADO por el frontend (o raw si doc público). */
  fileBuffer: ArrayBuffer;
  /** Wallet utilizada para firmar. */
  walletId: string;
  /** Comentario descriptivo. */
  comment?: string;
  /** Clave simétrica cifrada con RSA-OAEP por el frontend. */
  encryptedSymmetricKey?: string;
  /** SHA-256 hexadecimal del archivo original. */
  contentHash?: string;
  /** IV de AES-GCM en Base64. */
  encryptionIV?: string;
  /** AuthTag de AES-GCM en Base64. */
  encryptionAuthTag?: string;
  /** Claves re-cifradas para usuarios compartidos. */
  shareKeys?: Array<{ userId: string; reEncryptedKey: string }>;
}

/**
 * Respuesta de la preparación de una versión.
 */
export interface PrepareVersionResponse {
  versionId: string;
  versionNumber: number;
  blockchainId: string;
  ipfsCid: string;
  encryptedKeyHash: string;
  contentHash: string;
}

/**
 * Datos de entrada para confirmar la creación de una versión.
 */
export interface ConfirmVersionInput {
  /** Identificador del documento. */
  documentId: string;
  /** UUID de la versión. */
  versionId: string;
  /** Hash de la transacción blockchain. */
  txHash: string;
}

/** API de versiones de documentos. */
export const versionsApi = {
  /**
   * Prepara la creación de una versión.
   *
   * Flujo:
   * 1. El frontend cifra el archivo con AES-256-GCM y lo envía al backend ya cifrado.
   * 2. El backend valida los campos de cifrado y sube el archivo a IPFS.
   * 3. El backend crea el registro en BD con estado PREPARING.
   * 4. Devuelve los datos necesarios para la transacción blockchain.
   *
   * @param input - Datos de entrada para la preparación.
   * @returns Datos preparados para la transacción blockchain.
   */
  prepareCreate: async (input: PrepareVersionInput): Promise<PrepareVersionResponse> => {
    const formData = new FormData();
    
    // Convertir ArrayBuffer a Blob para subida (pre-cifrado por frontend)
    const fileBlob = new Blob([input.fileBuffer], { type: 'application/octet-stream' });
    formData.append('encryptedFile', fileBlob, 'version-file');
    formData.append('walletId', input.walletId);
    
    if (input.comment) {
      formData.append('comment', input.comment);
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
    if (input.shareKeys && input.shareKeys.length > 0) {
      formData.append('shareKeys', JSON.stringify(input.shareKeys));
    }

    const response = await api.post<PrepareVersionResponse>(
      `/documents/${input.documentId}/versions/prepare`,
      formData,
      retryOn429Config
    );
    return response.data;
  },

  /**
   * Confirma la creación de una versión tras la transacción blockchain.
   * @param input - Datos de confirmación.
   * @returns Versión creada.
   */
  confirmCreate: async (input: ConfirmVersionInput): Promise<{ version: Version }> => {
    const response = await api.post<{ version: Version }>(
      `/documents/${input.documentId}/versions/confirm`,
      input,
      retryOn429Config
    );
    return response.data;
  },

  // ==================== MÉTODOS EXISTENTES ====================

  /**
   * Lista las versiones de un documento.
   * @param documentId - Identificador del documento.
   * @returns Lista de versiones.
   */
  list: async (documentId: string): Promise<{ versions: Version[] }> => {
    const response = await api.get<{ versions: Version[] }>(`/documents/${documentId}/versions`);
    return response.data;
  },

  /**
   * Prepara el cambio de versión operativa.
   * @param documentId - Identificador del documento.
   * @param versionNumber - Número de versión a establecer como operativa.
   * @returns Datos preparados para la transacción.
   */
  prepareSetOperational: async (documentId: string, versionNumber: number): Promise<{
    blockchainId: string;
    versionNumber: number;
    documentName: string;
  }> => {
    const response = await api.post(`/documents/${documentId}/operational-version/prepare`, { versionNumber });
    return response.data;
  },

  /**
   * Confirma el cambio de versión operativa tras la transacción blockchain.
   * @param documentId - Identificador del documento.
   * @param versionNumber - Número de versión operativa.
   * @param txHash - Hash de la transacción.
   * @returns Promesa vacía.
   */
  confirmSetOperational: async (documentId: string, versionNumber: number, txHash: string): Promise<void> => {
    await api.post(`/documents/${documentId}/operational-version/confirm`, { versionNumber, txHash });
  },

  /**
   * Descarga una versión por su ID.
   * @param versionId - Identificador de la versión.
   * @returns Datos del archivo descargado.
   */
  download: async (versionId: string): Promise<VersionDownloadResponse> => {
    const response = await api.get(`/versions/${versionId}/download`, {
      responseType: 'blob'
    });
    return {
      blob: response.data,
      filename: parseFilename(response.headers['content-disposition'], `version-${versionId}`),
      mimeType: response.headers['x-mime-type'] || response.data.type || 'application/octet-stream',
      isEncrypted: response.headers['x-is-encrypted'] !== 'false',
      encryptedSymmetricKey: response.headers['x-encrypted-symmetric-key'],
      encryptionIV: response.headers['x-encryption-iv'],
      encryptionAuthTag: response.headers['x-encryption-auth-tag'],
    };
  },

  /**
   * Prepara la restauración de una versión anterior.
   * Crea una nueva versión copiando el contenido de la versión fuente.
   * @param documentId - Identificador del documento.
   * @param versionNumber - Número de la versión a restaurar.
   * @param walletId - ID de la wallet para firmar.
   * @returns Datos preparados para la transacción blockchain.
   */
  prepareRestoreVersion: async (documentId: string, versionNumber: number, walletId?: string): Promise<{
    versionId: string;
    blockchainId: string;
  }> => {
    const response = await api.post(`/documents/${documentId}/versions/restore/prepare`, { versionNumber, walletId });
    return response.data;
  },

  /**
   * Confirma la restauración de una versión tras la transacción blockchain.
   * @param versionId - Identificador de la nueva versión creada.
   * @param txHash - Hash de la transacción blockchain.
   * @returns Versión restaurada.
   */
  confirmRestoreVersion: async (versionId: string, txHash: string): Promise<{ version: Version }> => {
    const response = await api.post<{ version: Version }>(`/versions/${versionId}/restore/confirm`, { txHash });
    return response.data;
  },

  /**
   * Revierte la restauración de una versión (sin desanclar IPFS).
   * @param versionId - Identificador de la versión a revertir.
   */
  rollbackRestoreVersion: async (versionId: string): Promise<void> => {
    await api.post(`/versions/${versionId}/rollback-restore`);
  },

  rollback: async (versionId: string): Promise<void> => {
    await api.post(`/versions/${versionId}/rollback`);
  },

  rollbackSetOperational: async (documentId: string): Promise<void> => {
    await api.post(`/documents/${documentId}/operational-version/rollback`);
  },
};

export const listVersions = versionsApi.list;
