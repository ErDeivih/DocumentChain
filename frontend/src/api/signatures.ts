import { api } from '../lib/api';
import type { Signature } from '../types';

// Types for prepare/confirm pattern
export interface PrepareSignatureInput {
  documentId: string;
  versionNumber: number;
  signerWalletId: string;
}

export interface PrepareSignatureResponse {
  signatureId: string;       // UUID of signature in DB
  blockchainId: string;      // bytes32 for blockchain
  versionId: number;         // Version number on blockchain
  contentHash: string;       // Hash to sign
}

export interface ConfirmSignatureInput {
  signatureId: string;
  txHash: string;
  ecdsaSignature: string;    // The actual signature from wallet
}

export const signaturesApi = {
  // ==================== NEW PREPARE/CONFIRM PATTERN ====================

  /**
   * Prepare a signature for a document version.
   * 1. Backend validates access and creates DB record with PREPARING status
   * 2. Returns content hash that user needs to sign with their wallet
   */
  prepareSign: async (input: PrepareSignatureInput): Promise<PrepareSignatureResponse> => {
    const response = await api.post<PrepareSignatureResponse>('/signatures/prepare', {
      documentId: input.documentId,
      versionNumber: input.versionNumber,
      signerWalletId: input.signerWalletId
    });
    return response.data;
  },

  /**
   * Confirm signature after blockchain transaction.
   * Call this after the user signs with their wallet and submits the transaction.
   */
  confirmSign: async (input: ConfirmSignatureInput): Promise<{ signature: Signature }> => {
    const response = await api.post<{ signature: Signature }>('/signatures/confirm', input);
    return response.data;
  },

  // ==================== EXISTING METHODS ====================

  /**
   * Get signatures for a document
   */
  list: async (documentId: string): Promise<{ signatures: Signature[] }> => {
    const response = await api.get<{ signatures: Signature[] }>(`/documents/${documentId}/signatures`);
    return {
      signatures: response.data.signatures.map(normalizeSignature),
    };
  },

  /**
   * Get signatures for a specific version
   */
  listByVersion: async (documentId: string, versionNumber: number): Promise<{ signatures: Signature[] }> => {
    const response = await api.get<{ signatures: Signature[] }>(
      `/documents/${documentId}/versions/${versionNumber}/signatures`
    );
    return {
      signatures: response.data.signatures.map(normalizeSignature),
    };
  },

  /**
   * Verify a signature
   */
  verify: async (documentId: string, versionNumber: number, signerAddress: string): Promise<{ valid: boolean }> => {
    const response = await api.get<{ valid: boolean }>(
      `/documents/${documentId}/versions/${versionNumber}/signatures/${signerAddress}/verify`
    );
    return response.data;
  },

  // ==================== BLOCKCHAIN SERVICE METHODS ====================

  /**
   * Prepare signature (alias for prepareSign)
   */
  prepare: async (input: { documentId: string; versionNumber: number; walletId: string; comment?: string }): Promise<{
    signatureId: string;
    blockchainId: string;
    messageToSign: string;
  }> => {
    const response = await api.post('/signatures/prepare', {
      documentId: input.documentId,
      versionNumber: input.versionNumber,
      walletId: input.walletId,
      comment: input.comment
    });
    return response.data;
  },

  /**
   * Confirm signature (alias for confirmSign)
   */
  confirm: async (input: { signatureId: string; transactionHash: string; signature: string }): Promise<Signature> => {
    const response = await api.post<{ signature: Signature }>('/signatures/confirm', {
      signatureId: input.signatureId,
      txHash: input.transactionHash,
      ecdsaSignature: input.signature
    });
    return response.data.signature;
  },

  /**
   * Rollback signature creation
   */
  rollback: async (signatureId: string): Promise<void> => {
    await api.post(`/signatures/${signatureId}/rollback`);
  }
};

// Aliases for backward compatibility
export const listSignatures = signaturesApi.list;
export const listSignaturesByVersion = signaturesApi.listByVersion;
export const verifySignature = signaturesApi.verify;

function normalizeSignature(signature: Signature): Signature {
  return {
    ...signature,
    walletAddress: signature.walletAddress || signature.signer?.walletAddress,
  };
}
