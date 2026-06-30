import { Folder } from '@prisma/client';
import prisma from '../config/database';
import { NotFoundError, ValidationError, ConflictError } from '../utils/errors';

/**
 * Servicio de gestión de carpetas y organización jerárquica de documentos.
 * Permite crear, actualizar, eliminar y consultar carpetas asociadas a un usuario.
 */
export class FolderService {
  /**
   * Obtener todas las carpetas de un usuario.
   * @param userId - ID del usuario propietario
   * @returns Lista de carpetas con conteos de documentos y subcarpetas
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
   * Obtener una carpeta por ID incluyendo documentos y subcarpetas.
   * @param folderId - ID de la carpeta
   * @param userId - ID del usuario propietario
   * @returns Carpeta encontrada o null
   */
  static async getFolderById(folderId: string, userId: string): Promise<Folder | null> {
    return prisma.folder.findFirst({
      where: {
        id: folderId,
        userId,
      },
      include: {
        documents: {
          select: {
            id: true,
            name: true,
            fileExtension: true,
            size: true
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
   * Crear una nueva carpeta.
   * @param data - Datos de la carpeta a crear
   * @param data.userId - ID del propietario
   * @param data.name - Nombre de la carpeta
   * @param data.description - Descripción (opcional)
   * @param data.parentId - ID de la carpeta padre (opcional)
   * @param data.color - Color identificativo (opcional)
   * @returns Carpeta creada
   */
  static async createFolder(data: {
    userId: string;
    name: string;
    description?: string;
    parentId?: string;
    color?: string;
  }): Promise<Folder> {
    return prisma.$transaction(async (tx) => {
      // Validar que el nombre no esté duplicado en el mismo nivel
      const existing = await tx.folder.findFirst({
        where: {
          userId: data.userId,
          name: data.name,
          parentId: data.parentId || null,
        },
      });

      if (existing) {
        throw new ConflictError('Ya existe una carpeta con ese nombre en esta ubicación');
      }

      // Validar que la carpeta padre existe si se especifica
      if (data.parentId) {
        const parent = await tx.folder.findFirst({
          where: {
            id: data.parentId,
            userId: data.userId,
          },
        });

        if (!parent) {
          throw new NotFoundError('Carpeta padre');
        }
      }

      return tx.folder.create({
        data: {
          userId: data.userId,
          name: data.name,
          description: data.description,
          parentId: data.parentId,
          color: data.color,
        },
      });
    });
  }

  /**
   * Actualizar una carpeta existente.
   * @param folderId - ID de la carpeta
   * @param userId - ID del propietario
   * @param data - Campos a actualizar
   * @returns Carpeta actualizada
   */
  static async updateFolder(
    folderId: string,
    userId: string,
    data: {
      name?: string;
      description?: string;
      color?: string;
      parentId?: string;
    }
  ): Promise<Folder> {
    // Verificar que la carpeta pertenece al usuario
    const folder = await prisma.folder.findFirst({
      where: { id: folderId, userId },
    });

    if (!folder) {
      throw new NotFoundError('Carpeta', folderId);
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
        throw new ConflictError('Ya existe una carpeta con ese nombre en esta ubicación');
      }
    }

    // Validar que no se cree un ciclo si se cambia el padre
    if (data.parentId) {
      const isDescendant = await this.checkIfDescendant(folderId, data.parentId);
      if (isDescendant) {
        throw new ValidationError('No se puede mover una carpeta a una de sus subcarpetas');
      }
    }

    return prisma.folder.update({
      where: { id: folderId },
      data: {
        name: data.name,
        description: data.description,
        color: data.color,
        parentId: data.parentId,
      },
    });
  }

  /**
   * Eliminar una carpeta y, opcionalmente, su contenido.
   * @param folderId - ID de la carpeta
   * @param userId - ID del propietario
   * @param orphanContents - Si es true, mueve documentos y subcarpetas a la raíz antes de eliminar
   */
  static async deleteFolder(
    folderId: string,
    userId: string,
    orphanContents: boolean = false
  ): Promise<void> {
    const folder = await prisma.folder.findFirst({
      where: { id: folderId, userId },
      include: {
        documents: true,
        children: true,
      },
    });

    if (!folder) {
      throw new NotFoundError('Carpeta', folderId);
    }

    if (!orphanContents && (folder.documents.length > 0 || folder.children.length > 0)) {
      throw new ValidationError('La carpeta no está vacía. Mueve o elimina el contenido primero.');
    }

    await prisma.$transaction(async (tx) => {
      if (orphanContents) {
        await tx.document.updateMany({
          where: { folderId },
          data: { folderId: null },
        });

        await tx.folder.updateMany({
          where: { parentId: folderId },
          data: { parentId: null },
        });
      }

      await tx.folder.delete({
        where: { id: folderId },
      });
    });
  }

  /**
   * Mover documentos a una carpeta destino.
   * @param documentIds - IDs de los documentos a mover
   * @param folderId - ID de la carpeta destino (null para raíz)
   * @param userId - ID del propietario
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
        throw new NotFoundError('Carpeta de destino');
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
      throw new NotFoundError('Documentos');
    }

    // Mover documentos
    await prisma.document.updateMany({
      where: { id: { in: documentIds } },
      data: { folderId },
    });
  }

  /**
   * Obtener la ruta completa de una carpeta (breadcrumb).
   * @param folderId - ID de la carpeta destino
   * @param userId - ID del propietario
   * @returns Array de carpetas desde la raíz hasta la carpeta indicada
   */
  static async getFolderPath(folderId: string, userId: string): Promise<Folder[]> {
    const allFolders = await prisma.folder.findMany({
      where: { userId },
      select: { id: true, name: true, parentId: true },
    });

    const folderMap = new Map<string, { id: string; name: string; parentId: string | null }>();
    for (const f of allFolders) {
      folderMap.set(f.id, { id: f.id, name: f.name, parentId: f.parentId });
    }

    const path: { id: string; name: string; parentId: string | null }[] = [];
    let currentId: string | null = folderId;

    while (currentId) {
      const folder = folderMap.get(currentId);
      if (!folder) break;

      path.unshift(folder);
      currentId = folder.parentId;
    }

    return path as Folder[];
  }

  /**
   * Verificar si una carpeta es descendiente de otra (prevenir ciclos)
   */
  private static async checkIfDescendant(ancestorId: string, potentialDescendantId: string, depth: number = 0): Promise<boolean> {
    if (depth > 50) throw new ValidationError('Profundidad máxima de carpeta excedida');

    if (ancestorId === potentialDescendantId) {
      return true;
    }

    const folder = await prisma.folder.findUnique({
      where: { id: potentialDescendantId },
    });

    if (!folder || !folder.parentId) {
      return false;
    }

    return this.checkIfDescendant(ancestorId, folder.parentId, depth + 1);
  }
}