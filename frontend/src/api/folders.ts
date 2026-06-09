import { api } from '../lib/api';
import { Folder, FolderPath, FolderStats } from '../types';

export type { Folder, FolderPath, FolderStats };

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
  /** Icono asociado. */
  icon?: string;
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
  /** Nuevo icono. */
  icon?: string;
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
 * Obtiene una carpeta específica por su ID.
 * @param folderId - Identificador de la carpeta.
 * @returns Carpeta encontrada.
 */
export async function getFolderById(folderId: string): Promise<{ folder: Folder }> {
  const response = await api.get(`/folders/${folderId}`);
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
 * Elimina una carpeta.
 * @param folderId - Identificador de la carpeta.
 * @param orphanContents - Indica si se deben mover los contenidos a la raíz.
 * @returns Promesa vacía.
 */
export async function deleteFolder(
  folderId: string,
  orphanContents: boolean = false
): Promise<void> {
  await api.delete(`/folders/${folderId}?orphanContents=${orphanContents}`);
}

/**
 * Mueve documentos a una carpeta.
 * @param folderId - Identificador de la carpeta destino (null para raíz).
 * @param documentIds - Identificadores de los documentos a mover.
 * @returns Promesa vacía.
 */
export async function moveDocumentsToFolder(
  folderId: string | null,
  documentIds: string[]
): Promise<void> {
  const targetId = folderId || 'root';
  await api.post(`/folders/${targetId}/move`, { documentIds });
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

/**
 * Obtiene las estadísticas de una carpeta.
 * @param folderId - Identificador de la carpeta.
 * @returns Estadísticas de la carpeta.
 */
export async function getFolderStats(folderId: string): Promise<{ stats: FolderStats }> {
  const response = await api.get(`/folders/${folderId}/stats`);
  return response.data;
}

/**
 * Objeto API de carpetas para importaciones más sencillas.
 */
export const foldersApi = {
  /** Obtiene todas las carpetas. */
  getAll: getFolders,
  /** Obtiene una carpeta por ID. */
  getById: getFolderById,
  /** Crea una carpeta. */
  create: createFolder,
  /** Actualiza una carpeta. */
  update: updateFolder,
  /** Elimina una carpeta. */
  delete: deleteFolder,
  /** Mueve documentos a una carpeta. */
  moveDocuments: moveDocumentsToFolder,
  /** Obtiene la ruta de una carpeta. */
  getPath: getFolderPath,
  /** Obtiene estadísticas de una carpeta. */
  getStats: getFolderStats,
};
