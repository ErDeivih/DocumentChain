import { api } from '../lib/api';
import { Folder, FolderPath } from '../types';

export type { Folder, FolderPath };

/**
 * Datos para crear una nueva carpeta.
 */
export interface CreateFolderData {
  /** Nombre de la carpeta. */
  name: string;
  /** Descripción opcional. */
  description?: string;
  /** Identificador de la carpeta padre. */
  parentId?: string;
  /** Color asociado. */
  color?: string;
}

/**
 * Datos para actualizar una carpeta existente.
 */
export interface UpdateFolderData {
  /** Nuevo nombre. */
  name?: string;
  /** Nueva descripción. */
  description?: string;
  /** Nuevo color. */
  color?: string;
  /** Nuevo identificador de carpeta padre. */
  parentId?: string;
}

/**
 * Obtiene todas las carpetas del usuario actual.
 * @returns Lista de carpetas.
 */
export async function getFolders(): Promise<{ folders: Folder[] }> {
  const response = await api.get('/folders');
  return response.data;
}

/**
 * Crea una nueva carpeta.
 * @param data - Datos de la carpeta.
 * @returns Carpeta creada.
 */
export async function createFolder(data: CreateFolderData): Promise<{ folder: Folder }> {
  const response = await api.post('/folders', data);
  return response.data;
}

/**
 * Actualiza una carpeta existente.
 * @param folderId - Identificador de la carpeta.
 * @param data - Datos a actualizar.
 * @returns Carpeta actualizada.
 */
export async function updateFolder(
  folderId: string,
  data: UpdateFolderData
): Promise<{ folder: Folder }> {
  const response = await api.put(`/folders/${folderId}`, data);
  return response.data;
}

/**
 * Obtiene la ruta de una carpeta (migas de pan).
 * @param folderId - Identificador de la carpeta.
 * @returns Ruta de carpetas ancestro.
 */
export async function getFolderPath(folderId: string): Promise<{ path: FolderPath[] }> {
  const response = await api.get(`/folders/${folderId}/path`);
  return response.data;
}

export async function deleteFolder(id: string, orphanContents?: boolean): Promise<void> {
  await api.delete(`/folders/${id}`, { params: orphanContents ? { orphanContents: 'true' } : undefined });
}

export async function moveDocumentsToFolder(folderId: string, documentIds: string[]): Promise<void> {
  await api.post(`/folders/${folderId}/move`, { documentIds });
}
