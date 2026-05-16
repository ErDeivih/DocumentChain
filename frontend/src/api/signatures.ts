import { api } from '../lib/api';
import type { Signature } from '../types';

// Tipos para el patrón prepare/confirm

/**
 * Datos de entrada para preparar una firma.
 */
export interface PrepareSignatureInput {
  /** Identificador del documento. */
  documentId: string;
  /** Número de versión a firmar. */
  versionNumber: number;
  /** Identificador de la wallet del firmante. */
  signerWalletId: string;
}

/**
 * Respuesta de la preparación de una firma.
 */
export interface PrepareSignatureResponse {
  /** UUID de la firma en base de datos. */
  signatureId: string;
  /** Identificador bytes32 para blockchain. */
  blockchainId: string;
  /** Número de versión en blockchain. */
  versionId: number;
  /** Hash del contenido a firmar. */
  contentHash: string;
}

/**
 * Datos de entrada para confirmar una firma.
 */
export interface ConfirmSignatureInput {
  /** UUID de la firma. */
  signatureId: string;
  /** Hash de la transacción blockchain. */
  txHash: string;
  /** Firma ECDSA generada por la wallet. */
  ecdsaSignature: string;
}

/** API de firmas de documentos. */
export const signaturesApi = {
  // ==================== NUEVO PATRÓN PREPARE/CONFIRM ====================

  /**
   * Prepara una firma para una versión de documento.
   *
   * Flujo:
   * 1. El backend valida el acceso y crea el registro en BD con estado PREPARING.
   * 2. Devuelve el hash del contenido que el usuario debe firmar con su wallet.
   *
   * @param input - Datos de entrada para la preparación.
   * @returns Datos preparados para la firma.
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
   * Confirma una firma tras la transacción blockchain.
   *
   * Llámalo después de que el usuario firme con su wallet y envíe la transacción.
   *
   * @param input - Datos de confirmación.
   * @returns Firma creada.
   */
  confirmSign: async (input: ConfirmSignatureInput): Promise<{ signature: Signature }> => {
    const response = await api.post<{ signature: Signature }>('/signatures/confirm', input);
    return response.data;
  },

  // ==================== MÉTODOS EXISTENTES ====================

  /**
   * Obtiene las firmas de un documento.
   * @param documentId - Identificador del documento.
   * @returns Lista de firmas.
   */
  list: async (documentId: string): Promise<{ signatures: Signature[] }> => {
    const response = await api.get<{ signatures: Signature[] }>(`/documents/${documentId}/signatures`);
    return {
      signatures: response.data.signatures.map(normalizeSignature),
    };
  },

  /**
   * Obtiene las firmas de una versión específica.
   * @param documentId - Identificador del documento.
   * @param versionNumber - Número de versión.
   * @returns Lista de firmas.
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
   * Verifica una firma.
   * @param documentId - Identificador del documento.
   * @param versionNumber - Número de versión.
   * @param signerAddress - Dirección del firmante.
   * @returns Indica si la firma es válida.
   */
  verify: async (documentId: string, versionNumber: number, signerAddress: string): Promise<{ valid: boolean }> => {
    const response = await api.get<{ valid: boolean }>(
      `/documents/${documentId}/versions/${versionNumber}/signatures/${signerAddress}/verify`
    );
    return response.data;
  },

  // ==================== MÉTODOS DEL SERVICIO BLOCKCHAIN ====================

  /**
   * Prepara una firma (alias de prepareSign).
   * @param input - Datos de entrada.
   * @returns Datos preparados para la firma.
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
   * Confirma una firma (alias de confirmSign).
   * @param input - Datos de confirmación.
   * @returns Firma creada.
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
   * Revierte la creación de una firma.
   * @param signatureId - Identificador de la firma.
   * @returns Promesa vacía.
   */
  rollback: async (signatureId: string): Promise<void> => {
    await api.post(`/signatures/${signatureId}/rollback`);
  }
};

// Alias para compatibilidad hacia atrás

/** Alias de {@link signaturesApi.list}. */
export const listSignatures = signaturesApi.list;
/** Alias de {@link signaturesApi.listByVersion}. */
export const listSignaturesByVersion = signaturesApi.listByVersion;
/** Alias de {@link signaturesApi.verify}. */
export const verifySignature = signaturesApi.verify;

/**
 * Normaliza una firma asegurando la dirección de la wallet.
 * @param signature - Firma a normalizar.
 * @returns Firma normalizada.
 */
function normalizeSignature(signature: Signature): Signature {
  return {
    ...signature,
    walletAddress: signature.walletAddress || signature.signer?.walletAddress,
  };
}
