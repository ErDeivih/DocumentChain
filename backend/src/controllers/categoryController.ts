import { Request, Response } from 'express';
import { CategoryService } from '../services/categoryService';

/**
 * GET /api/categories
 * Obtener todas las categorías (predefinidas + personalizadas)
 */
export async function getCategories(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const categories = await CategoryService.getCategories(userId);
    
    res.json({
      success: true,
      categories,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Error al obtener categorías',
    });
  }
}

/**
 * GET /api/categories/predefined
 * Obtener solo categorías predefinidas
 */
export async function getPredefinedCategories(req: Request, res: Response) {
  try {
    const categories = await CategoryService.getPredefinedCategories();
    
    res.json({
      success: true,
      categories,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Error al obtener categorías predefinidas',
    });
  }
}

/**
 * GET /api/categories/custom
 * Obtener solo categorías personalizadas del usuario
 */
export async function getUserCustomCategories(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const categories = await CategoryService.getUserCustomCategories(userId);
    
    res.json({
      success: true,
      categories,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Error al obtener categorías personalizadas',
    });
  }
}

/**
 * GET /api/categories/:id
 * Obtener una categoría por ID
 */
export async function getCategoryById(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const userId = req.user?.userId;
    
    const category = await CategoryService.getCategoryById(id, userId);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Categoría no encontrada',
      });
    }
    
    res.json({
      success: true,
      category,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Error al obtener categoría',
    });
  }
}

/**
 * POST /api/categories
 * Crear una categoría personalizada
 */
export async function createCategory(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const { name, description, color, icon } = req.body;
    
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'El nombre de la categoría es requerido',
      });
    }
    
    const category = await CategoryService.createCategory({
      userId,
      name: name.trim(),
      description,
      color,
      icon,
    });
    
    res.status(201).json({
      success: true,
      category,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Error al crear categoría',
    });
  }
}

/**
 * PUT /api/categories/:id
 * Actualizar una categoría personalizada
 */
export async function updateCategory(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const userId = req.user!.userId;
    const { name, description, color, icon, isActive } = req.body;
    
    const category = await CategoryService.updateCategory(id, userId, {
      name,
      description,
      color,
      icon,
      isActive,
    });
    
    res.json({
      success: true,
      category,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Error al actualizar categoría',
    });
  }
}

/**
 * DELETE /api/categories/:id
 * Eliminar (desactivar) una categoría personalizada
 */
export async function deleteCategory(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const userId = req.user!.userId;
    
    await CategoryService.deleteCategory(id, userId);
    
    res.json({
      success: true,
      message: 'Categoría eliminada exitosamente',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Error al eliminar categoría',
    });
  }
}

/**
 * POST /api/categories/assign
 * Asignar categoría a documentos
 */
export async function assignCategoryToDocuments(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const { documentIds, categoryId } = req.body;
    
    if (!Array.isArray(documentIds) || documentIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Se requiere un array de IDs de documentos',
      });
    }
    
    await CategoryService.assignCategoryToDocuments(
      documentIds,
      categoryId || null,
      userId
    );
    
    res.json({
      success: true,
      message: 'Categoría asignada exitosamente',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Error al asignar categoría',
    });
  }
}

/**
 * GET /api/categories/:id/stats
 * Obtener estadísticas de una categoría
 */
export async function getCategoryStats(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const userId = req.user?.userId;
    
    const stats = await CategoryService.getCategoryStats(id, userId);
    
    res.json({
      success: true,
      stats,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Error al obtener estadísticas',
    });
  }
}

/**
 * GET /api/categories/search
 * Buscar categorías por nombre
 */
export async function searchCategories(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const { q } = req.query;
    
    if (!q || typeof q !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Se requiere un término de búsqueda (q)',
      });
    }
    
    const categories = await CategoryService.searchCategories(userId, q);
    
    res.json({
      success: true,
      categories,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Error al buscar categorías',
    });
  }
}
