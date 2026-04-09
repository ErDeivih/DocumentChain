import { Folder } from '@prisma/client';
import prisma from '../config/database';

export class FolderService {
  /**
   * Obtener todas las carpetas de un usuario
   */
  static async getUserFolders(userId: string): Promise<Folder[]> {
    return prisma.folder.findMany({
      where: { userId },
      include: {
        _count: {
          select: {
            documents: true,
            children: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Obtener una carpeta por ID
   */
  static async getFolderById(folderId: string, userId: string): Promise<Folder | null> {
    return prisma.folder.findFirst({
      where: {
        id: folderId,
        userId,
      },
      include: {
        documents: {
          // ❌ NO filtrar por isDeleted (solo en blockchain)
          select: {
            id: true,
            name: true,
            fileExtension: true,
            size: true
            // ❌ NO seleccionar createdAt (solo en blockchain)
          },
        },
        children: true,
        parent: true,
        _count: {
          select: {
            documents: true,
            children: true,
          },
        },
      },
    });
  }

  /**
   * Crear una nueva carpeta
   */
  static async createFolder(data: {
    userId: string;
    name: string;
    description?: string;
    parentId?: string;
    color?: string;
    icon?: string;
  }): Promise<Folder> {
    // Validar que el nombre no esté duplicado en el mismo nivel
    const existing = await prisma.folder.findFirst({
      where: {
        userId: data.userId,
        name: data.name,
        parentId: data.parentId || null,
      },
    });

    if (existing) {
      throw new Error('Ya existe una carpeta con ese nombre en esta ubicación');
    }

    // Validar que la carpeta padre existe si se especifica
    if (data.parentId) {
      const parent = await prisma.folder.findFirst({
        where: {
          id: data.parentId,
          userId: data.userId,
        },
      });

      if (!parent) {
        throw new Error('Carpeta padre no encontrada');
      }
    }

    return prisma.folder.create({
      data: {
        userId: data.userId,
        name: data.name,
        description: data.description,
        parentId: data.parentId,
        color: data.color,
        icon: data.icon,
      },
    });
  }

  /**
   * Actualizar una carpeta
   */
  static async updateFolder(
    folderId: string,
    userId: string,
    data: {
      name?: string;
      description?: string;
      color?: string;
      icon?: string;
      parentId?: string;
    }
  ): Promise<Folder> {
    // Verificar que la carpeta pertenece al usuario
    const folder = await prisma.folder.findFirst({
      where: { id: folderId, userId },
    });

    if (!folder) {
      throw new Error('Carpeta no encontrada');
    }

    // Si se cambia el nombre, verificar que no esté duplicado
    if (data.name && data.name !== folder.name) {
      const existing = await prisma.folder.findFirst({
        where: {
          userId,
          name: data.name,
          parentId: data.parentId !== undefined ? data.parentId : folder.parentId,
          id: { not: folderId },
        },
      });

      if (existing) {
        throw new Error('Ya existe una carpeta con ese nombre en esta ubicación');
      }
    }

    // Validar que no se cree un ciclo si se cambia el padre
    if (data.parentId) {
      const isDescendant = await this.checkIfDescendant(folderId, data.parentId);
      if (isDescendant) {
        throw new Error('No se puede mover una carpeta a una de sus subcarpetas');
      }
    }

    return prisma.folder.update({
      where: { id: folderId },
      data: {
        name: data.name,
        description: data.description,
        color: data.color,
        icon: data.icon,
        parentId: data.parentId,
      },
    });
  }

  /**
   * Eliminar una carpeta (y opcionalmente su contenido)
   */
  static async deleteFolder(
    folderId: string,
    userId: string,
    deleteContents: boolean = false
  ): Promise<void> {
    const folder = await prisma.folder.findFirst({
      where: { id: folderId, userId },
      include: {
        documents: true,
        children: true,
      },
    });

    if (!folder) {
      throw new Error('Carpeta no encontrada');
    }

    if (!deleteContents && (folder.documents.length > 0 || folder.children.length > 0)) {
      throw new Error('La carpeta no está vacía. Mueve o elimina el contenido primero.');
    }

    if (deleteContents) {
      // Mover documentos a la raíz
      await prisma.document.updateMany({
        where: { folderId },
        data: { folderId: null },
      });

      // Mover subcarpetas a la raíz
      await prisma.folder.updateMany({
        where: { parentId: folderId },
        data: { parentId: null },
      });
    }

    await prisma.folder.delete({
      where: { id: folderId },
    });
  }

  /**
   * Mover documentos a una carpeta
   */
  static async moveDocumentsToFolder(
    documentIds: string[],
    folderId: string | null,
    userId: string
  ): Promise<void> {
    // Validar que la carpeta existe si se especifica
    if (folderId) {
      const folder = await prisma.folder.findFirst({
        where: { id: folderId, userId },
      });

      if (!folder) {
        throw new Error('Carpeta de destino no encontrada');
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

    // Mover documentos
    await prisma.document.updateMany({
      where: { id: { in: documentIds } },
      data: { folderId },
    });
  }

  /**
   * Obtener la ruta completa de una carpeta (breadcrumb)
   */
  static async getFolderPath(folderId: string, userId: string): Promise<Folder[]> {
    const path: Folder[] = [];
    let currentId: string | null = folderId;

    while (currentId) {
      const folder: any = await prisma.folder.findFirst({
        where: { id: currentId, userId },
      });

      if (!folder) break;

      path.unshift(folder);
      currentId = folder.parentId;
    }

    return path;
  }

  /**
   * Verificar si una carpeta es descendiente de otra (prevenir ciclos)
   */
  private static async checkIfDescendant(ancestorId: string, potentialDescendantId: string): Promise<boolean> {
    if (ancestorId === potentialDescendantId) {
      return true;
    }

    const folder = await prisma.folder.findUnique({
      where: { id: potentialDescendantId },
    });

    if (!folder || !folder.parentId) {
      return false;
    }

    return this.checkIfDescendant(ancestorId, folder.parentId);
  }

  /**
   * Obtener estadísticas de una carpeta
   */
  static async getFolderStats(folderId: string, userId: string) {
    const folder = await prisma.folder.findFirst({
      where: { id: folderId, userId },
    });

    if (!folder) {
      throw new Error('Carpeta no encontrada');
    }

    const [documentCount, totalSize, subfolderCount] = await Promise.all([
      prisma.document.count({
        where: { folderId }
        // ❌ NO filtrar por isDeleted (solo en blockchain)
      }),
      prisma.document.aggregate({
        where: { folderId },
        _sum: { size: true },
      }),
      prisma.folder.count({
        where: { parentId: folderId },
      }),
    ]);

    return {
      documentCount,
      totalSize: (totalSize._sum?.size || BigInt(0)).toString(),
      subfolderCount,
    };
  }
}