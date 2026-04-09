import { api, type RetryableRequestConfig } from '../lib/api';
import type { Version } from '../types';

const retryOn429Config: RetryableRequestConfig = {
  retryOn429: true,
  retryOn429MaxAttempts: 2,
};

export interface VersionDownloadResponse {
  blob: Blob;
  isEncrypted: boolean;
  encryptedSymmetricKey?: string;
  encryptionIV?: string;
  encryptionAuthTag?: string;
}

// Types for prepare/confirm pattern (Backend Encryption Architecture)
export interface PrepareVersionInput {
  documentId: string;
  fileBuffer: ArrayBuffer;            // Unencrypted file (backend encrypts)
  walletId: string;                   // Wallet used for signing
  comment?: string;
}

export interface PrepareVersionResponse {
  versionId: string;        // UUID of version in DB
  versionNumber: number;    // Version number
  blockchainId: string;     // bytes32 for blockchain
  ipfsCid: string;          // CID of encrypted file in IPFS
}

export interface ConfirmVersionInput {
  documentId: string;
  versionId: string;
  txHash: string;
}

export const versionsApi = {
  // ==================== NEW PREPARE/CONFIRM PATTERN ====================

  /**
   * Prepare a version for creation.
   * 1. Frontend sends unencrypted file to backend (over HTTPS)
   * 2. Backend encrypts file with AES-256-GCM (generates new key per version)
   * 3. Backend encrypts symmetric key with user's public key
   * 4. Backend uploads encrypted file to IPFS
   * 5. Backend creates DB record with PREPARING status
   * 6. Returns data needed for blockchain transaction
   */
  prepareCreate: async (input: PrepareVersionInput): Promise<PrepareVersionResponse> => {
    const formData = new FormData();
    
    // Convert ArrayBuffer to Blob for upload (unencrypted)
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
   * Confirm version creation after blockchain transaction.
   */
  confirmCreate: async (input: ConfirmVersionInput): Promise<{ version: Version }> => {
    const response = await api.post<{ version: Version }>(
      `/documents/${input.documentId}/versions/confirm`,
      input,
      retryOn429Config
    );
    return response.data;
  },

  // ==================== EXISTING METHODS ====================

  list: async (documentId: string): Promise<{ versions: Version[] }> => {
    const response = await api.get<{ versions: Version[] }>(`/documents/${documentId}/versions`);
    return response.data;
  },

  /**
   * @deprecated Use prepareCreate + confirmCreate instead
   */
  create: async (
    documentId: string,
    file: File,
    password: string,
    comment?: string
  ): Promise<{ version: Version }> => {
    console.warn('versionsApi.create is deprecated. Use prepareCreate + confirmCreate instead.');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('password', password);
    if (comment) {
      formData.append('comment', comment);
    }

    const response = await api.post<{ version: Version }>(
      `/documents/${documentId}/versions`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response.data;
  },

  setOperational: async (documentId: string, versionId: string): Promise<void> => {
    await api.put(`/documents/${documentId}/versions/${versionId}/operational`);
  },

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

  download: async (versionId: string): Promise<VersionDownloadResponse> => {
    const response = await api.get(`/versions/${versionId}/download`, {
      responseType: 'blob'
    });
    return {
      blob: response.data,
      isEncrypted: response.headers['x-is-encrypted'] !== 'false',
      encryptedSymmetricKey: response.headers['x-encrypted-symmetric-key'],
      encryptionIV: response.headers['x-encryption-iv'],
      encryptionAuthTag: response.headers['x-encryption-auth-tag'],
    };
  },

  // ==================== NEW BLOCKCHAIN SERVICE METHODS ====================

  /**
   * Rollback version creation (delete version + IPFS)
   * Used when blockchain transaction fails after prepare
   */
  rollback: async (versionId: string): Promise<void> => {
    await api.post(`/versions/${versionId}/rollback`);
  },

  /**
   * Rollback version restore (delete new version record, keep IPFS)
   * Used when restore blockchain transaction fails
   */
  rollbackRestore: async (versionId: string): Promise<void> => {
    await api.post(`/versions/${versionId}/rollback-restore`);
  }
};

// Aliases for backward compatibility
export const listVersions = versionsApi.list;
export const createVersion = versionsApi.create;
export const setOperationalVersion = versionsApi.setOperational;
export const restoreVersion = versionsApi.restore;
export const downloadVersion = versionsApi.download;
