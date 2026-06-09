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

// Tipos para el patrón prepare/confirm (Arquitectura de Cifrado Backend)

/**
 * Datos de entrada para preparar la creación de una versión.
 */
export interface PrepareVersionInput {
  /** Identificador del documento. */
  documentId: string;
  /** Buffer del archivo sin cifrar (el backend cifra). */
  fileBuffer: ArrayBuffer;
  /** Wallet utilizada para firmar. */
  walletId: string;
  /** Comentario descriptivo. */
  comment?: string;
}

/**
 * Respuesta de la preparación de una versión.
 */
export interface PrepareVersionResponse {
  /** UUID de la versión en base de datos. */
  versionId: string;
  /** Número de versión. */
  versionNumber: number;
  /** Identificador bytes32 para blockchain. */
  blockchainId: string;
  /** CID del archivo cifrado en IPFS. */
  ipfsCid: string;
  /** Hash de la clave simétrica cifrada (bytes32 para blockchain). */
  encryptedKeyHash: string;
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
  // ==================== NUEVO PATRÓN PREPARE/CONFIRM ====================

  /**
   * Prepara la creación de una versión.
   *
   * Flujo:
   * 1. El frontend envía el archivo sin cifrar al backend (sobre HTTPS).
   * 2. El backend cifra el archivo con AES-256-GCM (genera nueva clave por versión).
   * 3. El backend cifra la clave simétrica con la clave pública del usuario.
   * 4. El backend sube el archivo cifrado a IPFS.
   * 5. El backend crea el registro en BD con estado PREPARING.
   * 6. Devuelve los datos necesarios para la transacción blockchain.
   *
   * @param input - Datos de entrada para la preparación.
   * @returns Datos preparados para la transacción blockchain.
   */
  prepareCreate: async (input: PrepareVersionInput): Promise<PrepareVersionResponse> => {
    const formData = new FormData();
    
    // Convertir ArrayBuffer a Blob para subida (sin cifrar)
    const fileBlob = new Blob([input.fileBuffer], { type: 'application/octet-stream' });
    formData.append('encryptedFile', fileBlob, 'version-file');
    formData.append('walletId', input.walletId);
    
    if (input.comment) {
      formData.append('comment', input.comment);
    }

    const response = await api.post<PrepareVersionResponse>(
      `/documents/${input.documentId}/versions/prepare`,
      formData,
      {
        ...retryOn429Config,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
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
   * Restaura una versión anterior de un documento.
   * @param documentId - Identificador del documento.
   * @param versionId - Identificador de la versión a restaurar.
   * @param password - Contraseña del usuario.
   * @param comment - Comentario descriptivo.
   * @returns Versión restaurada.
   */
  restore: async (
    documentId: string,
    versionId: string,
    password: string,
    comment?: string
  ): Promise<{ version: Version }> => {
    const response = await api.post<{ version: Version }>(
      `/documents/${documentId}/versions/${versionId}/restore`,
      { password, comment }
    );
    return response.data;
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

  // ==================== NUEVOS MÉTODOS DEL SERVICIO BLOCKCHAIN ====================

  /**
   * Revierte la creación de una versión (elimina versión e IPFS).
   * Úsese cuando la transacción blockchain falle después de la preparación.
   * @param versionId - Identificador de la versión.
   * @returns Promesa vacía.
   */
  rollback: async (versionId: string): Promise<void> => {
    await api.post(`/versions/${versionId}/rollback`);
  },

  /**
   * Revierte la restauración de una versión (elimina el registro de versión nuevo, conserva IPFS).
   * Úsese cuando la transacción blockchain de restauración falle.
   * @param versionId - Identificador de la versión.
   * @returns Promesa vacía.
   */
  rollbackRestore: async (versionId: string): Promise<void> => {
    await api.post(`/versions/${versionId}/rollback-restore`);
  }
};

/** Alias de {@link versionsApi.list}. */
export const listVersions = versionsApi.list;
