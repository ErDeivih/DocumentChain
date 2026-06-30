import { api } from '../lib/api';
import type { Signature } from '../types';
/** API de firmas de documentos. */
export const signaturesApi = {
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

  // ==================== MÉTODOS DEL SERVICIO BLOCKCHAIN ====================

  /**
   * Prepara una firma (patrón prepare/confirm).
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
   * Confirma una firma (patrón prepare/confirm).
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
