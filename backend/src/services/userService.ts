import prisma from '../config/database';

/**
 * Perfil público de un usuario.
 * @property id - ID del usuario
 * @property username - Nombre de usuario único
 * @property email - Correo electrónico
 * @property fullName - Nombre completo
 * @property role - Rol en el sistema
 * @property publicKey - Clave pública para compartición segura
 * @property avatarUrl - URL del avatar
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
  avatarUrl?: string | null;  // Opcional hasta que se regenere el cliente Prisma
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
        fullName: true,
        role: true,
        publicKey: true,
        avatarUrl: true,
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
   * Obtener la clave pública de un usuario para compartir documentos.
   * @param userId - ID del usuario
   * @returns Clave pública o null
   */
  static async getUserPublicKey(userId: string): Promise<string | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { publicKey: true }
    });

    return user?.publicKey || null;
  }

  /**
   * Actualizar el perfil de un usuario.
   * @param userId - ID del usuario
   * @param updates - Campos a actualizar
   * @returns Perfil actualizado
   */
  static async updateProfile(
    userId: string,
    updates: { email?: string; fullName?: string; avatarUrl?: string }
  ): Promise<UserProfile> {
    // Check if email already exists (if updating email)
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
   * Actualizar el avatar de un usuario.
   * @param userId - ID del usuario
   * @param avatarUrl - URL de la nueva imagen de avatar
   * @returns Perfil actualizado
   */
  static async updateAvatar(userId: string, avatarUrl: string): Promise<UserProfile> {
    // Usar any temporalmente hasta que se regenere el cliente Prisma
    const user = await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        publicKey: true,
        avatarUrl: true,
        createdAt: true,
      }
    });

    return user;
  }

  /**
   * Eliminar el avatar de un usuario.
   * @param userId - ID del usuario
   * @returns Perfil actualizado
   */
  static async removeAvatar(userId: string): Promise<UserProfile> {
    // Usar any temporalmente hasta que se regenere el cliente Prisma
    const user = await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: null },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        publicKey: true,
        avatarUrl: true,
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
    avatarUrl: string | null;
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
        avatarUrl: true,
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
   * Eliminar un usuario (solo administradores).
   * Actualmente realiza borrado físico de la base de datos.
   * @param userId - ID del usuario a eliminar
   */
  static async deleteUser(userId: string): Promise<void> {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // For now, hard delete (in production, consider soft delete)
    // Delete related data first
    await prisma.session.deleteMany({ where: { userId } });
    await prisma.wallet.deleteMany({ where: { userId } });
    
    // Delete user
    await prisma.user.delete({ where: { id: userId } });
  }
}
