import prisma from '../config/database';

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
  // lastLogin: Date | null; // Removed from Prisma schema
}

export class UserService {
  /**
   * Get user profile by ID
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
        // lastLogin removed from schema
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
   * Get user profile by username
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
        // lastLogin removed from schema
      }
    });

    return user;
  }

  /**
   * Get user's public key by ID (for sharing documents)
   */
  static async getUserPublicKey(userId: string): Promise<string | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { publicKey: true }
    });

    return user?.publicKey || null;
  }

  /**
   * Update user profile
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
        // lastLogin removed from schema
      }
    });

    return user;
  }

  /**
   * Update user avatar
   */
  static async updateAvatar(userId: string, avatarUrl: string): Promise<UserProfile> {
    // Usar any temporalmente hasta que se regenere el cliente Prisma
    const user = await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl } as any,
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

    return { ...user, avatarUrl };
  }

  /**
   * Remove user avatar
   */
  static async removeAvatar(userId: string): Promise<UserProfile> {
    // Usar any temporalmente hasta que se regenere el cliente Prisma
    const user = await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: null } as any,
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

    return { ...user, avatarUrl: null };
  }

  /**
   * Search users by username (for sharing documents)
   * Returns limited info for privacy
   */
  static async searchUsers(query: string, limit: number = 10): Promise<Array<{
    id: string;
    username: string;
    fullName: string | null;
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
        fullName: true
      },
      take: limit
    });

    return users;
  }

  /**
   * Get all users (admin only)
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
          // lastLogin removed from schema
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
   * Delete user (admin only)
   * Soft delete - keep data for audit but mark as inactive
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
