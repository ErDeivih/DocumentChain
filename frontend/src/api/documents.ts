import { api } from '../lib/api';
import type { Document, PaginatedResponse, Version } from '../types';

export interface DocumentDownloadResponse {
  blob: Blob;
  filename: string;
  mimeType: string;
  isEncrypted: boolean;
  encryptedSymmetricKey?: string;
  encryptionIV?: string;
  encryptionAuthTag?: string;
}

function parseFilename(contentDisposition: string | undefined, fallbackName: string): string {
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

// Types for prepare/confirm pattern (Backend Encryption Architecture)
export interface PrepareDocumentInput {
  name: string;
  description?: string;
  mimeType: string;
  fileBuffer: ArrayBuffer;            // Unencrypted file (backend encrypts)
  walletId: string;                   // Wallet used for signing
  visibility?: 'PRIVATE' | 'PUBLIC';
  folderId?: string;
  categoryId?: string;
  tags?: string[];
}

export interface PrepareDocumentResponse {
  docId: string;           // bytes32 for blockchain
  ipfsCid: string;         // CID of encrypted file in IPFS
  documentId: string;      // UUID of document in DB
  publicId: string | null;
}

export interface ConfirmDocumentInput {
  documentId: string;
  txHash: string;          // Transaction hash from blockchain
  blockchainId?: string;   // Optional: from blockchain event
}

export const documentsApi = {
  // ==================== NEW PREPARE/CONFIRM PATTERN ====================

  /**
   * Prepare a document for creation.
   * 1. Frontend sends unencrypted file to backend (over HTTPS)
   * 2. Backend encrypts file with AES-256-GCM
   * 3. Backend encrypts symmetric key with user's public key
   * 4. Backend uploads encrypted file to IPFS
   * 5. Backend creates DB record with PREPARING status
   * 6. Returns data needed for blockchain transaction
   */
  prepareCreate: async (input: PrepareDocumentInput): Promise<PrepareDocumentResponse> => {
    const formData = new FormData();
    
    // Convert ArrayBuffer to Blob for upload (unencrypted)
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
    if (input.categoryId) {
      formData.append('categoryId', input.categoryId);
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
   * Confirm document creation after blockchain transaction.
   * Call this after the user signs and submits the blockchain transaction.
   */
  confirmCreate: async (input: ConfirmDocumentInput): Promise<{ document: Document }> => {
    const response = await api.post<{ document: Document }>('/documents/confirm', input);
    return response.data;
  },

  /**
   * Get documents created with a specific wallet.
   */
  getByWallet: async (walletId: string): Promise<{ documents: Document[] }> => {
    const response = await api.get<{ documents: Document[] }>(`/documents/wallet/${walletId}`);
    return response.data;
  },

  // ==================== EXISTING METHODS ====================

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

  get: async (id: string): Promise<{ document: Document }> => {
    const response = await api.get<{ document: Document }>(`/documents/${id}`);
    return response.data;
  },

  /**
   * @deprecated Use prepareCreate + confirmCreate instead
   * This method is kept for backward compatibility but will be removed.
   */
  upload: async (
    file: File, 
    name: string, 
    password: string, 
    options?: {
      description?: string;
      folderId?: string;
      categoryId?: string;
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
    if (options?.categoryId) {
      formData.append('categoryId', options.categoryId);
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

  archive: async (id: string): Promise<void> => {
    await api.put(`/documents/${id}/archive`);
  },

  unarchive: async (id: string): Promise<void> => {
    await api.put(`/documents/${id}/unarchive`);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/documents/${id}`);
  },

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

  // ==================== NEW BLOCKCHAIN SERVICE METHODS ====================

  /**
   * Rollback document creation (delete document + versions + IPFS)
   * Used when blockchain transaction fails after prepare
   */
  rollback: async (documentId: string): Promise<void> => {
    await api.post(`/documents/${documentId}/rollback`);
  },

  /**
   * Prepare document for archiving
   */
  prepareArchive: async (documentId: string): Promise<{ blockchainId: string }> => {
    const response = await api.post<{ blockchainId: string }>(`/documents/${documentId}/archive/prepare`);
    return response.data;
  },

  /**
   * Confirm document archiving after blockchain transaction
   */
  confirmArchive: async (params: { documentId: string; txHash: string }): Promise<void> => {
    await api.post(`/documents/${params.documentId}/archive/confirm`, { txHash: params.txHash });
  },

  /**
   * Prepare document transfer (Backend Encryption Architecture)
   * 1. Frontend decrypts symmetric key with current owner's private key
   * 2. Backend re-encrypts with new owner's public key
   * 3. Backend updates document ownership after blockchain confirmation
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
   * Confirm document transfer after blockchain transaction
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
   * Prepare version restore (create new version pointing to old IPFS)
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
   * Confirm version restore after blockchain transaction
   */
  confirmRestore: async (params: { versionId: string; txHash: string }): Promise<Version> => {
    const response = await api.post<{ version: Version }>(
      `/versions/${params.versionId}/restore/confirm`,
      { txHash: params.txHash }
    );
    return response.data.version;
  }
};

// Convenience function for upload (deprecated)
export const uploadDocument = async (
  file: File,
  password: string,
  options?: {
    folderId?: string;
    categoryId?: string;
    tags?: string[];
  }
): Promise<Document> => {
  const result = await documentsApi.upload(file, file.name, password, options);
  return result.document;
};

// Aliases for backward compatibility
export const listDocuments = documentsApi.list;
export const getDocument = documentsApi.get;
export const downloadDocument = documentsApi.download;
export const archiveDocument = documentsApi.archive;
export const deleteDocument = documentsApi.delete;
