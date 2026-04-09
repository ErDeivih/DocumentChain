import { api } from '../lib/api';
import { Category, CategoryStats } from '../types';

export interface CreateCategoryData {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}

export interface UpdateCategoryData {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  isActive?: boolean;
}

/**
 * Get all categories (predefined + custom)
 */
export async function getCategories(): Promise<{ categories: Category[] }> {
  const response = await api.get('/categories');
  return response.data;
}

/**
 * Get only predefined categories
 */
export async function getPredefinedCategories(): Promise<{ categories: Category[] }> {
  const response = await api.get('/categories/predefined');
  return response.data;
}

/**
 * Get only custom categories
 */
export async function getCustomCategories(): Promise<{ categories: Category[] }> {
  const response = await api.get('/categories/custom');
  return response.data;
}

/**
 * Get a specific category by ID
 */
export async function getCategoryById(categoryId: string): Promise<{ category: Category }> {
  const response = await api.get(`/categories/${categoryId}`);
  return response.data;
}

/**
 * Create a custom category
 */
export async function createCategory(data: CreateCategoryData): Promise<{ category: Category }> {
  const response = await api.post('/categories', data);
  return response.data;
}

/**
 * Update a custom category
 */
export async function updateCategory(
  categoryId: string,
  data: UpdateCategoryData
): Promise<{ category: Category }> {
  const response = await api.put(`/categories/${categoryId}`, data);
  return response.data;
}

/**
 * Delete a custom category
 */
export async function deleteCategory(categoryId: string): Promise<void> {
  await api.delete(`/categories/${categoryId}`);
}

/**
 * Assign category to documents
 */
export async function assignCategoryToDocuments(
  documentIds: string[],
  categoryId: string | null
): Promise<void> {
  await api.post('/categories/assign', { documentIds, categoryId });
}

/**
 * Get category statistics
 */
export async function getCategoryStats(categoryId: string): Promise<CategoryStats> {
  const response = await api.get(`/categories/${categoryId}/stats`);
  return response.data.stats;
}

/**
 * Search categories by name
 */
export async function searchCategories(query: string): Promise<{ categories: Category[] }> {
  const response = await api.get(`/categories/search?q=${encodeURIComponent(query)}`);
  return response.data;
}
