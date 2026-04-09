import { Category } from '@prisma/client';
import prisma from '../config/database';

export class CategoryService {
  /**
   * Obtener todas las categorías (predefinidas + personalizadas del usuario)
   */
  static async getCategories(userId: string): Promise<Category[]> {
    return prisma.category.findMany({
      where: {
        OR: [
          { isPredefined: true, isActive: true },
          { userId, isActive: true },
        ],
      },
      include: {
        _count: {
          select: {
            documents: true,
          },
        },
      },
      orderBy: [
        { isPredefined: 'desc' },
        { name: 'asc' },
      ],
    });
  }

  /**
   * Obtener solo categorías predefinidas
   */
  static async getPredefinedCategories(): Promise<Category[]> {
    return prisma.category.findMany({
      where: {
        isPredefined: true,
        isActive: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Obtener solo categorías personalizadas del usuario
   */
  static async getUserCustomCategories(userId: string): Promise<Category[]> {
    return prisma.category.findMany({
      where: {
        userId,
        isPredefined: false,
        isActive: true,
      },
      include: {
        _count: {
          select: {
            documents: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Obtener una categoría por ID
   */
  static async getCategoryById(categoryId: string, userId?: string): Promise<Category | null> {
    return prisma.category.findFirst({
      where: {
        id: categoryId,
        OR: [
          { isPredefined: true },
          { userId },
        ],
      },
      include: {
        _count: {
          select: {
            documents: true,
          },
        },
      },
    });
  }

  /**
   * Crear una categoría personalizada
   */
  static async createCategory(data: {
    userId: string;
    name: string;
    description?: string;
    color?: string;
    icon?: string;
  }): Promise<Category> {
    // Validar que el nombre no esté duplicado para el usuario
    const existing = await prisma.category.findFirst({
      where: {
        OR: [
          { userId: data.userId, name: data.name },
          { isPredefined: true, name: data.name },
        ],
      },
    });

    if (existing) {
      throw new Error('Ya existe una categoría con ese nombre');
    }

    return prisma.category.create({
      data: {
        userId: data.userId,
        name: data.name,
        description: data.description,
        color: data.color,
        icon: data.icon,
        isPredefined: false,
      },
    });
  }

  /**
   * Actualizar una categoría personalizada
   */
  static async updateCategory(
    categoryId: string,
    userId: string,
    data: {
      name?: string;
      description?: string;
      color?: string;
      icon?: string;
      isActive?: boolean;
    }
  ): Promise<Category> {
    // Verificar que la categoría existe y pertenece al usuario (no predefinida)
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        userId,
        isPredefined: false,
      },
    });

    if (!category) {
      throw new Error('Categoría no encontrada o no se puede modificar');
    }

    // Si se cambia el nombre, verificar que no esté duplicado
    if (data.name && data.name !== category.name) {
      const existing = await prisma.category.findFirst({
        where: {
          OR: [
            { userId, name: data.name },
            { isPredefined: true, name: data.name },
          ],
          id: { not: categoryId },
        },
      });

      if (existing) {
        throw new Error('Ya existe una categoría con ese nombre');
      }
    }

    return prisma.category.update({
      where: { id: categoryId },
      data: {
        name: data.name,
        description: data.description,
        color: data.color,
        icon: data.icon,
        isActive: data.isActive,
      },
    });
  }

  /**
   * Eliminar una categoría personalizada (desactivar)
   */
  static async deleteCategory(categoryId: string, userId: string): Promise<void> {
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        userId,
        isPredefined: false,
      },
    });

    if (!category) {
      throw new Error('Categoría no encontrada o no se puede eliminar');
    }

    // Desactivar en lugar de eliminar (para mantener historial)
    await prisma.category.update({
      where: { id: categoryId },
      data: { isActive: false },
    });

    // Opcional: Quitar la categoría de los documentos que la usen
    await prisma.document.updateMany({
      where: { categoryId },
      data: { categoryId: null },
    });
  }

  /**
   * Asignar categoría a documentos
   */
  static async assignCategoryToDocuments(
    documentIds: string[],
    categoryId: string | null,
    userId: string
  ): Promise<void> {
    // Validar que la categoría existe si se especifica
    if (categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          id: categoryId,
          OR: [
            { isPredefined: true },
            { userId },
          ],
          isActive: true,
        },
      });

      if (!category) {
        throw new Error('Categoría no encontrada');
      }
    }

    // Validar que todos los documentos pertenecen al usuario
    const documents = await prisma.document.findMany({
      where: {
        id: { in: documentIds },
        ownerId: userId,
      },
    });

    if (documents.length !== documentIds.length) {
      throw new Error('Algunos documentos no fueron encontrados o no te pertenecen');
    }

    // Asignar categoría
    await prisma.document.updateMany({
      where: { id: { in: documentIds } },
      data: { categoryId },
    });
  }

  /**
   * Obtener estadísticas de una categoría
   */
  static async getCategoryStats(categoryId: string, userId?: string) {
    const category = await this.getCategoryById(categoryId, userId);

    if (!category) {
      throw new Error('Categoría no encontrada');
    }

    const [documentCount, totalSize, recentDocuments] = await Promise.all([
      prisma.document.count({
        where: { categoryId }
        // ❌ NO filtrar por isDeleted (solo en blockchain)
      }),
      prisma.document.aggregate({
        where: { categoryId },
        _sum: { size: true },
      }),
      prisma.document.findMany({
        where: { categoryId },
        select: {
          id: true,
          name: true,
          size: true
          // ❌ NO seleccionar createdAt (solo en blockchain)
        },
        orderBy: { name: 'asc' },  // ✅ Cambiar a name
        take: 5,
      }),
    ]);

    return {
      category,
      documentCount,
      totalSize: (totalSize._sum?.size || BigInt(0)).toString(),
      recentDocuments: recentDocuments.map((document) => ({
        ...document,
        size: Number(document.size),
      })),
    };
  }

  /**
   * Buscar categorías por nombre
   */
  static async searchCategories(userId: string, query: string): Promise<Category[]> {
    return prisma.category.findMany({
      where: {
        OR: [
          { isPredefined: true },
          { userId },
        ],
        isActive: true,
        name: {
          contains: query,
          mode: 'insensitive',
        },
      },
      include: {
        _count: {
          select: {
            documents: true,
          },
        },
      },
      orderBy: [
        { isPredefined: 'desc' },
        { name: 'asc' },
      ],
    });
  }
}
