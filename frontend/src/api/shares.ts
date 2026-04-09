import { api, type RetryableRequestConfig } from '../lib/api';
import type { Share, DocumentRole } from '../types';

const retryOn429Config: RetryableRequestConfig = {
  retryOn429: true,
  retryOn429MaxAttempts: 2,
};

// Types for prepare/confirm pattern (Backend Encryption Architecture)
export interface PrepareShareInput {
  documentId: string;
  sharedWithUserId: string;
  role: DocumentRole;
  sharerWalletId: string;
  decryptedSymmetricKey: string;  // Symmetric key decrypted by frontend (sent over HTTPS, backend re-encrypts)
}

export interface PrepareShareResponse {
  blockchainId: string;     // bytes32 for blockchain
  sharedWithAddress: string;  // Recipient's wallet address
  shareId: string;          // UUID of share in DB
}

export interface ConfirmShareInput {
  shareId: string;
  txHash: string;
}

export interface PrepareRevokeShareInput {
  documentId: string;
  userId: string;
  sharerWalletId: string;
}

export interface PrepareRevokeShareResponse {
  shareId: string;
  blockchainId: string;
  sharedWithAddress: string;
}

export interface ConfirmRevokeShareInput {
  shareId: string;
  txHash: string;
}

export const sharesApi = {
  // ==================== NEW PREPARE/CONFIRM PATTERN ====================

  /**
   * Prepare a share for creation.
   * 1. Frontend decrypts symmetric key with user's private key locally
   * 2. Frontend sends decrypted key to backend (over HTTPS)
   * 3. Backend re-encrypts symmetric key with recipient's public key
   * 4. Backend creates DB record with PREPARING status
   * 5. Returns data needed for blockchain transaction
   */
  prepareShare: async (input: PrepareShareInput): Promise<PrepareShareResponse> => {
    const response = await api.post<PrepareShareResponse>(
      `/documents/${input.documentId}/share/prepare`,
      {
        sharedWithUserId: input.sharedWithUserId,
        role: input.role,
        walletId: input.sharerWalletId,
        decryptedSymmetricKey: input.decryptedSymmetricKey
      },
      retryOn429Config
    );
    return response.data;
  },

  /**
   * Confirm share creation after blockchain transaction.
   */
  confirmShare: async (input: ConfirmShareInput): Promise<{ share: Share }> => {
    const response = await api.post<{ share: Share }>(
      `/shares/confirm`,
      input,
      retryOn429Config
    );
    return response.data;
  },

  /**
   * Prepare a share for revocation.
   */
  prepareRevoke: async (input: PrepareRevokeShareInput): Promise<PrepareRevokeShareResponse> => {
    const response = await api.post<PrepareRevokeShareResponse>(
      `/documents/${input.documentId}/share/${input.userId}/revoke/prepare`,
      {
        sharerWalletId: input.sharerWalletId
      }
    );
    return response.data;
  },

  /**
   * Confirm share revocation after blockchain transaction.
   */
  confirmRevoke: async (input: ConfirmRevokeShareInput): Promise<void> => {
    await api.post(`/shares/revoke/confirm`, input);
  },

  list: async (documentId: string): Promise<{ shares: Share[] }> => {
    const response = await api.get<{ shares: Share[] }>(`/documents/${documentId}/shares`);
    return response.data;
  },

  getSharedWithMe: async (params?: {
    page?: number;
    limit?: number;    search?: string;
    fileType?: string;
    walletId?: string;  }): Promise<{ documents: any[]; total: number; page: number; totalPages: number }> => {
    const response = await api.get('/shares/with-me', { params });
    return response.data;
  },

  getMyRole: async (documentId: string): Promise<{ role: DocumentRole }> => {
    const response = await api.get<{ role: DocumentRole }>(`/documents/${documentId}/my-role`);
    return response.data;
  },

  checkPermission: async (documentId: string, role: DocumentRole): Promise<{ hasPermission: boolean }> => {
    const response = await api.get<{ hasPermission: boolean }>(
      `/documents/${documentId}/check-permission`,
      { params: { role } }
    );
    return response.data;
  },

};

// Aliases for backward compatibility
export const listShares = sharesApi.list;
export const getSharedWithMe = sharesApi.getSharedWithMe;
export const getMyRole = sharesApi.getMyRole;
