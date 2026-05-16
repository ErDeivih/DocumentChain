/**
 * API de Línea Temporal de Documentos.
 */

import { api } from '../lib/api';

/**
 * Evento en la línea temporal de un documento.
 */
export interface TimelineEvent {
  /** Identificador del evento. */
  id: string;
  /** Tipo de evento. */
  type: 'version_created' | 'document_signed' | 'document_shared' | 'permission_revoked' | 'ownership_transferred' | 'operational_changed';
  /** Marca temporal del evento. */
  timestamp: string;
  /** Actor que realizó la acción. */
  actor: {
    /** Identificador del actor. */
    id: string;
    /** Nombre de usuario. */
    username: string;
    /** Nombre completo. */
    fullName: string | null;
    /** Dirección de la wallet. */
    walletAddress?: string;
  };
  /** Detalles adicionales del evento. */
  details: Record<string, any>;
  /** Hash de la transacción blockchain. */
  blockchainTx?: string;
}

/**
 * Línea temporal completa de un documento.
 */
export interface DocumentTimeline {
  /** Identificador del documento. */
  documentId: string;
  /** Identificador en blockchain. */
  blockchainId: string;
  /** Lista de eventos. */
  events: TimelineEvent[];
}

/** API de línea temporal. */
export const timelineApi = {
  /**
   * Obtiene la línea temporal de un documento.
   * @param documentId - Identificador del documento.
   * @returns Línea temporal del documento.
   */
  getDocumentTimeline: async (documentId: string): Promise<DocumentTimeline> => {
    const response = await api.get(`/timeline/documents/${documentId}`);
    return response.data;
  },
};

export default timelineApi;
