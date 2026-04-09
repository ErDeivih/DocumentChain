import axios from 'axios';
import type { PublicDocument } from '../types';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const publicApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const publicDocumentsApi = {
  get: async (publicId: string): Promise<{ document: PublicDocument }> => {
    const response = await publicApi.get<{ document: PublicDocument }>(`/public-documents/${publicId}`);
    return response.data;
  },

  getContentUrl: (publicId: string, versionNumber?: number): string => {
    return versionNumber
      ? `${API_URL}/public-documents/${publicId}/versions/${versionNumber}/content`
      : `${API_URL}/public-documents/${publicId}/content`;
  },

  getDownloadUrl: (publicId: string, versionNumber?: number): string => {
    return versionNumber
      ? `${API_URL}/public-documents/${publicId}/versions/${versionNumber}/download`
      : `${API_URL}/public-documents/${publicId}/download`;
  },
};

export default publicDocumentsApi;