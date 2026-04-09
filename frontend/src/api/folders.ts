import { api } from '../lib/api';
import { Folder, FolderPath, FolderStats } from '../types';

export type { Folder, FolderPath, FolderStats };

export interface CreateFolderData {
  name: string;
  description?: string;
  parentId?: string;
  color?: string;
  icon?: string;
}

export interface UpdateFolderData {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  parentId?: string;
}

/**
 * Get all folders for the current user
 */
export async function getFolders(): Promise<{ folders: Folder[] }> {
  const response = await api.get('/folders');
  return response.data;
}

/**
 * Get a specific folder by ID
 */
export async function getFolderById(folderId: string): Promise<{ folder: Folder }> {
  const response = await api.get(`/folders/${folderId}`);
  return response.data;
}

/**
 * Create a new folder
 */
export async function createFolder(data: CreateFolderData): Promise<{ folder: Folder }> {
  const response = await api.post('/folders', data);
  return response.data;
}

/**
 * Update a folder
 */
export async function updateFolder(
  folderId: string,
  data: UpdateFolderData
): Promise<{ folder: Folder }> {
  const response = await api.put(`/folders/${folderId}`, data);
  return response.data;
}

/**
 * Delete a folder
 */
export async function deleteFolder(
  folderId: string,
  deleteContents: boolean = false
): Promise<void> {
  await api.delete(`/folders/${folderId}?deleteContents=${deleteContents}`);
}

/**
 * Move documents to a folder
 */
export async function moveDocumentsToFolder(
  folderId: string | null,
  documentIds: string[]
): Promise<void> {
  const targetId = folderId || 'root';
  await api.post(`/folders/${targetId}/move`, { documentIds });
}

/**
 * Get folder path (breadcrumb)
 */
export async function getFolderPath(folderId: string): Promise<{ path: FolderPath[] }> {
  const response = await api.get(`/folders/${folderId}/path`);
  return response.data;
}

/**
 * Get folder statistics
 */
export async function getFolderStats(folderId: string): Promise<{ stats: FolderStats }> {
  const response = await api.get(`/folders/${folderId}/stats`);
  return response.data;
}

/**
 * Folders API object for easier imports
 */
export const foldersApi = {
  getAll: getFolders,
  getById: getFolderById,
  create: createFolder,
  update: updateFolder,
  delete: deleteFolder,
  moveDocuments: moveDocumentsToFolder,
  getPath: getFolderPath,
  getStats: getFolderStats,
};
