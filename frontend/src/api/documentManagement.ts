/**
 * API de Gestión de Documentos
 * Cambio de versión operacional y transferencia de propiedad
 */

import { api } from '../lib/api';

export interface Version {
  versionNumber: number;
  ipfsCid: string;
  createdBy: string;
  createdAt: string;
  isOperational: boolean;
  restoredFrom?: number;
  comment?: string;
}

export interface SetOperationalVersionResponse {
  success: boolean;
  transactionHash?: string;
}

export interface TransferOwnershipResponse {
  success: boolean;
  transactionHash?: string;
}

export const documentManagementApi = {
  /**
   * Obtener versiones de un documento
   */
  getDocumentVersions: async (documentId: string): Promise<Version[]> => {
    const response = await api.get(`/documents/${documentId}/versions`);
    return response.data;
  },

  /**
   * Cambiar versión operacional
   */
  setOperationalVersion: async (
    documentId: string,
    versionNumber: number
  ): Promise<SetOperationalVersionResponse> => {
    const response = await api.put(`/documents/${documentId}/operational-version`, {
      versionNumber
    });
    return response.data;
  },

  /**
   * Transferir propiedad de un documento
   */
  transferOwnership: async (
    documentId: string,
    newOwnerId: string,
    password: string
  ): Promise<TransferOwnershipResponse> => {
    const response = await api.post(`/documents/${documentId}/transfer`, {
      newOwnerId,
      password
    });
    return response.data;
  },
};

export default documentManagementApi;
