/**
 * API de Línea Temporal de Documentos
 */

import { api } from '../lib/api';

export interface TimelineEvent {
  id: string;
  type: 'version_created' | 'document_signed' | 'document_shared' | 'permission_revoked' | 'ownership_transferred' | 'operational_changed';
  timestamp: string;
  actor: {
    id: string;
    username: string;
    fullName: string | null;
    walletAddress?: string;
  };
  details: Record<string, any>;
  blockchainTx?: string;
}

export interface DocumentTimeline {
  documentId: string;
  blockchainId: string;
  events: TimelineEvent[];
}

export const timelineApi = {
  /**
   * Obtener línea temporal de un documento
   */
  getDocumentTimeline: async (documentId: string): Promise<DocumentTimeline> => {
    const response = await api.get(`/timeline/documents/${documentId}`);
    return response.data;
  },
};

export default timelineApi;
