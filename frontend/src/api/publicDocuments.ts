import axios from 'axios';
import type { PublicDocument } from '../types';

const API_URL = import.meta.env.VITE_API_URL || '/api';

/** Cliente axios público para documentos públicos. */
const publicApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/** API de documentos públicos. */
export const publicDocumentsApi = {
  /**
   * Obtiene un documento público por su identificador.
   * @param publicId - Identificador público del documento.
   * @returns Documento público.
   */
  get: async (publicId: string): Promise<{ document: PublicDocument }> => {
    const response = await publicApi.get<{ document: PublicDocument }>(`/public-documents/${publicId}`);
    return response.data;
  },

  /**
   * Genera la URL de contenido de un documento público.
   * @param publicId - Identificador público del documento.
   * @param versionNumber - Número de versión (opcional).
   * @returns URL del contenido.
   */
  getContentUrl: (publicId: string, versionNumber?: number): string => {
    return versionNumber
      ? `${API_URL}/public-documents/${publicId}/versions/${versionNumber}/content`
      : `${API_URL}/public-documents/${publicId}/content`;
  },

  /**
   * Genera la URL de descarga de un documento público.
   * @param publicId - Identificador público del documento.
   * @param versionNumber - Número de versión (opcional).
   * @returns URL de descarga.
   */
  getDownloadUrl: (publicId: string, versionNumber?: number): string => {
    return versionNumber
      ? `${API_URL}/public-documents/${publicId}/versions/${versionNumber}/download`
      : `${API_URL}/public-documents/${publicId}/download`;
  },
};

export default publicDocumentsApi;
