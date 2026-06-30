import prisma from '../config/database';
import { FileStorageService } from './fileStorageService';
import logger from '../utils/logger';

/**
 * Perfil público de un usuario.
 * @property id - ID del usuario
 * @property username - Nombre de usuario único
 * @property email - Correo electrónico
 * @property fullName - Nombre completo
 * @property role - Rol en el sistema
 * @property publicKey - Clave pública para compartición segura
 * @property createdAt - Fecha de registro
 * @property wallets - Carteras asociadas al usuario
 */
export interface UserProfile {
  id: string;
  username: string;
  email: string;
  fullName: string | null;
  role: string;
  publicKey: string;
  createdAt: Date;
  wallets?: Array<{
    id: string;
    address: string;
    label: string | null;
    isPrimary: boolean;
  }>;
}

/**
 * Servicio de gestión de perfiles de usuario.
 * Proporciona operaciones de consulta, búsqueda y actualización de datos de usuario.
 */
export class UserService {
  /**
   * Obtener el perfil de un usuario por su ID.
   * @param userId - ID del usuario
   * @returns Perfil del usuario o null si no existe
   */
  static async getUserById(userId: string): Promise<UserProfile | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        emailVerified: true,
        fullName: true,
        role: true,
        publicKey: true,
        encryptedPrivateKey: true,
        createdAt: true,
        wallets: {
          select: {
            id: true,
            walletAddress: true,
            nickname: true,
            isPrimary: true,
          },
          orderBy: [
            { isPrimary: 'desc' },
            { addedAt: 'asc' },
          ],
        },
         
      }
    });

    if (!user) {
      return null;
    }

    return {
      ...user,
      wallets: user.wallets.map((wallet) => ({
        id: wallet.id,
        address: wallet.walletAddress,
        label: wallet.nickname,
        isPrimary: wallet.isPrimary,
      })),
    };
  }

  /**
   * Obtener el perfil de un usuario por su nombre de usuario.
   * @param username - Nombre de usuario
   * @returns Perfil del usuario o null si no existe
   */
  static async getUserByUsername(username: string): Promise<UserProfile | null> {
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        publicKey: true,
        createdAt: true,
         
      }
    });

    return user;
  }

  /**
   * Actualizar el perfil de un usuario.
   * @param userId - ID del usuario
   * @param updates - Campos a actualizar
   * @returns Perfil actualizado
   */
  static async updateProfile(
    userId: string,
    updates: { email?: string; fullName?: string }
  ): Promise<UserProfile> {
    // Verificar si el email ya existe (si se actualiza el email)
    if (updates.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: updates.email,
          NOT: { id: userId }
        }
      });

      if (existingUser) {
        throw new Error('Email ya en uso');
      }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updates,
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        publicKey: true,
        createdAt: true,
         
      }
    });

    return user;
  }

  /**
   * Buscar usuarios por nombre de usuario para compartir documentos.
   * Devuelve información limitada por privacidad.
   * @param query - Texto de búsqueda
   * @param limit - Máximo de resultados
   * @returns Lista de usuarios coincidentes
   */
  static async searchUsers(query: string, limit: number = 10): Promise<Array<{
    id: string;
    username: string;
    fullName: string | null;
    email: string;
  }>> {
    const users = await prisma.user.findMany({
      where: {
        username: {
          contains: query,
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
      },
      take: limit
    });

    return users;
  }

  /**
   * Obtener todos los usuarios (solo administradores).
   * @param page - Número de página
   * @param limit - Resultados por página
   * @returns Lista paginada de usuarios
   */
  static async getAllUsers(page: number = 1, limit: number = 50): Promise<{
    users: UserProfile[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          username: true,
        email: true,
        emailVerified: true,
        fullName: true,
          role: true,
          publicKey: true,
          createdAt: true,
           
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count()
    ]);

    return {
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Obtiene el perfil público de un usuario (sin datos criptográficos).
   * @param userId - ID del usuario.
   * @returns Perfil público del usuario o null si no existe.
   */
  static async getUserPublicProfile(userId: string): Promise<Partial<UserProfile> | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        fullName: true,
        role: true,
        publicKey: true,
        createdAt: true,
        wallets: {
          where: { isPrimary: true },
          select: {
            id: true,
            walletAddress: true,
            isPrimary: true,
            nickname: true,
          },
        },
      },
    });
    if (!user) return null;
    return {
      ...user,
      wallets: user.wallets.map(w => ({
        id: w.id,
        address: w.walletAddress,
        label: w.nickname,
        isPrimary: w.isPrimary,
      })),
    };
  }

  /**
   * Eliminar un usuario (solo administradores).
   * Actualmente realiza borrado físico de la base de datos.
   * @param userId - ID del usuario a eliminar
   */
  static async deleteUser(userId: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('Usuario no encontrado');

    await prisma.$transaction(async (tx) => {
      await tx.session.deleteMany({ where: { userId } });
      await tx.wallet.deleteMany({ where: { userId } });
      await tx.user.delete({ where: { id: userId } });
    });
  }

  /**
   * Elimina permanentemente la cuenta del usuario, sus archivos de IPFS y su avatar.
   *
   * @param userId - ID del usuario a eliminar
   * @throws {Error} Si el usuario no existe
   */
  static async deleteMyAccount(userId: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, username: true } });
    if (!user) throw new Error('Usuario no encontrado');
    // Recopilar CIDs de IPFS antes de la transaccion (el cascade elimina documentos)
    const documents = await prisma.document.findMany({
      where: { ownerId: userId },
      include: { versions: { select: { ipfsCid: true } } },
    });

    // DB cleanup: delete related records first, then user
    await prisma.$transaction(async (tx) => {
      await tx.event.create({ data: { eventType: 'ACCOUNT_DELETED', userId, metadata: {} } });
      await tx.documentShareKey.deleteMany({ where: { userId } });
      await tx.session.deleteMany({ where: { userId } });
      await tx.wallet.deleteMany({ where: { userId } });
      await tx.folder.deleteMany({ where: { userId } });
      await tx.notification.deleteMany({ where: { userId } });
      await tx.user.delete({ where: { id: userId } });
    });
    try {
      await FileStorageService.unpinAllDocumentCIDs(userId, documents);
    } catch (ipfsError) { logger.error('Error durante unpin de IPFS:', ipfsError); }
    logger.info(`Usuario eliminado: ${user.username} (${userId})`);
  }
}
