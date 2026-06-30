import { api, type RetryableRequestConfig } from '../lib/api';
import type { Share, DocumentRole } from '../types';

/** Documento recibido mediante compartición. */
export interface SharedWithMeDocument {
  id: string;
  name: string;
  mimeType?: string;
  size?: number;
  sharedBy?: string;
  role?: DocumentRole;
  sharedAt?: string;
  blockchainTxHash?: string | null;
}

const retryOn429Config: RetryableRequestConfig = {
  retryOn429: true,
  retryOn429MaxAttempts: 2,
};

/**
 * Datos de entrada para preparar un compartido.
 */
export interface PrepareShareInput {
  /** Identificador del documento. */
  documentId: string;
  /** Identificador del usuario con quien se comparte. */
  sharedWithUserId: string;
  /** Rol asignado al destinatario. */
  role: DocumentRole;
  /** Identificador de la wallet del compartidor. */
  sharerWalletId: string;
  /** Clave simétrica re-cifrada por el frontend con la clave pública del destinatario (RSA-OAEP). */
  reEncryptedSymmetricKey: string;
}

/**
 * Respuesta de la preparación de un compartido.
 */
export interface PrepareShareResponse {
  /** Identificador bytes32 para blockchain. */
  blockchainId: string;
  /** Dirección de la wallet del destinatario. */
  sharedWithAddress: string;
  /** UUID del compartido en base de datos. */
  shareId: string;
}

/**
 * Datos de entrada para confirmar un compartido.
 */
export interface ConfirmShareInput {
  /** UUID del compartido. */
  shareId: string;
  /** Hash de la transacción blockchain. */
  txHash: string;
  /** Identificador del documento. */
  documentId: string;
}

/**
 * Datos de entrada para preparar la revocación de un compartido.
 */
export interface PrepareRevokeShareInput {
  /** Identificador del documento. */
  documentId: string;
  /** Identificador del usuario destinatario. */
  userId: string;
  /** Identificador de la wallet del compartidor. */
  sharerWalletId: string;
}

/**
 * Respuesta de la preparación de revocación de un compartido.
 */
export interface PrepareRevokeShareResponse {
  /** UUID del compartido. */
  shareId: string;
  /** Identificador bytes32 para blockchain. */
  blockchainId: string;
  /** Dirección de la wallet del destinatario. */
  sharedWithAddress: string;
}

/**
 * Datos de entrada para confirmar la revocación de un compartido.
 */
export interface ConfirmRevokeShareInput {
  /** UUID del compartido. */
  shareId: string;
  /** Hash de la transacción blockchain. */
  txHash: string;
}

/** API de compartidos de documentos. */
export const sharesApi = {
  /**
   * Prepara la creación de un compartido.
   *
   * Flujo:
   * 1. El frontend descifra la clave simétrica con la clave privada del usuario localmente.
   * 2. El frontend re-cifra la clave con la clave pública del destinatario (RSA-OAEP).
   * 3. El frontend envía la clave ya re-cifrada al backend (sobre HTTPS).
   * 4. El backend almacena la clave tal cual y crea el registro en BD con estado PREPARING.
   * 5. Devuelve los datos necesarios para la transacción blockchain.
   *
   * @param input - Datos de entrada para la preparación.
   * @returns Datos preparados para la transacción blockchain.
   */
  prepareShare: async (input: PrepareShareInput): Promise<PrepareShareResponse> => {
    const response = await api.post<PrepareShareResponse>(
      `/documents/${input.documentId}/share/prepare`,
      {
        sharedWithUserId: input.sharedWithUserId,
        role: input.role,
        walletId: input.sharerWalletId,
        reEncryptedSymmetricKey: input.reEncryptedSymmetricKey
      },
      retryOn429Config
    );
    return response.data;
  },

  /**
   * Confirma la creación de un compartido tras la transacción blockchain.
   * @param input - Datos de confirmación.
   * @returns Compartido creado.
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
   * Prepara la revocación de un compartido.
   * @param input - Datos de entrada para la preparación.
   * @returns Datos preparados para la transacción blockchain.
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
   * Confirma la revocación de un compartido tras la transacción blockchain.
   * @param input - Datos de confirmación.
   * @returns Promesa vacía.
   */
  confirmRevoke: async (input: ConfirmRevokeShareInput): Promise<void> => {
    await api.post(`/shares/revoke/confirm`, input);
  },

      /**
      * Revierte una revocación de compartición si la transacción falló.
      * @param shareId - ID de la compartición a revertir
     */
    rollbackRevoke: async (shareId: string): Promise<void> => {
    await api.post(`/shares/${shareId}/rollback-revoke`);
  },

  /**
   * Lista los compartidos de un documento.
   * @param documentId - Identificador del documento.
   * @returns Lista de compartidos.
   */
  list: async (documentId: string): Promise<{ shares: Share[] }> => {
    const response = await api.get<{ shares: Share[] }>(`/documents/${documentId}/shares`);
    return response.data;
  },

  /**
   * Obtiene los documentos compartidos con el usuario actual.
   * @param params - Parámetros de filtrado y paginación.
   * @returns Documentos compartidos y metadatos de paginación.
   */
  getSharedWithMe: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    fileType?: string;
    sharedBy?: string;
    walletId?: string;
  }): Promise<{ documents: SharedWithMeDocument[]; total: number; page: number; totalPages: number }> => {
    const response = await api.get('/shares/with-me', { params });
    return response.data;
  },

  /**
   * Obtiene el rol del usuario actual sobre un documento.
   * @param documentId - Identificador del documento.
   * @returns Rol del usuario.
   */
  getMyRole: async (documentId: string): Promise<{ role: DocumentRole }> => {
    const response = await api.get<{ role: DocumentRole }>(`/documents/${documentId}/my-role`);
    return response.data;
  },


};

// Alias para compatibilidad hacia atrás

/** Alias de {@link sharesApi.list}. */
export const listShares = sharesApi.list;
/** Alias de {@link sharesApi.getSharedWithMe}. */
export const getSharedWithMe = sharesApi.getSharedWithMe;
/** Alias de {@link sharesApi.getMyRole}. */
export const getMyRole = sharesApi.getMyRole;
