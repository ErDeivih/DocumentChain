import { v4 as uuidv4 } from 'uuid';
import prisma from '../config/database';
import { Argon2Service } from './argon2Service';
import { KeyManager } from '../lib/crypto/KeyManager';
import { BlockchainAdminService } from './blockchainAdminService';
import logger from '../utils/logger';

export class AdminService {
  static async getAllUsers() {
    return prisma.user.findMany({
      select: {
        id: true, username: true, email: true, fullName: true, role: true,
        createdAt: true, updatedAt: true,
        _count: { select: { documents: true, wallets: true, sessions: true } }
      },
      orderBy: [{ role: 'desc' }, { createdAt: 'desc' }]
    });
  }

  static async updateUserRole(userId: string, role: 'USER' | 'ADMIN', adminUserId: string) {
    if (!role || !['USER', 'ADMIN'].includes(role)) {
      throw Object.assign(new Error('Rol inválido. Debe ser USER o ADMIN'), { statusCode: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw Object.assign(new Error('Usuario no encontrado'), { statusCode: 404 });
    }

    if (adminUserId === userId && role === 'USER') {
      throw Object.assign(new Error('No puede quitar su propio rol de administrador'), { statusCode: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, username: true, email: true, role: true }
    });

    logger.info(`Rol del usuario ${updatedUser.username} cambiado a ${role} por el admin ${adminUserId}`);

    try {
      const primaryWallet = await prisma.wallet.findFirst({
        where: { userId: updatedUser.id, isPrimary: true }
      });

      if (primaryWallet) {
        if (role === 'ADMIN') {
          logger.info(`Otorgando ADMIN_ROLE en blockchain a ${updatedUser.username}...`);
          const grantResult = await BlockchainAdminService.grantAdminRole(primaryWallet.walletAddress);
          if (grantResult.success) {
            logger.info(`ADMIN_ROLE otorgado, tx: ${grantResult.txHash}`);
          } else {
            logger.warn(`No se pudo otorgar ADMIN_ROLE: ${grantResult.error}`);
          }
        } else {
          logger.info(`Revocando ADMIN_ROLE en blockchain de ${updatedUser.username}...`);
          const revokeResult = await BlockchainAdminService.revokeAdminRole(primaryWallet.walletAddress);
          if (revokeResult.success) {
            logger.info(`ADMIN_ROLE revocado, tx: ${revokeResult.txHash}`);
          } else {
            logger.warn(`No se pudo revocar ADMIN_ROLE: ${revokeResult.error}`);
          }
        }
      }
    } catch (syncError) {
      logger.error('Error al sincronizar rol con blockchain:', syncError);
    }

    return updatedUser;
  }

  static async createAdminUser(username: string, email: string, password: string, fullName?: string) {
    if (!username || !email || !password) {
      throw Object.assign(new Error('El nombre de usuario, email y contraseña son obligatorios'), { statusCode: 400 });
    }

    if (password.length < 6) {
      throw Object.assign(new Error('La contraseña debe tener al menos 6 caracteres'), { statusCode: 400 });
    }

    const existing = await prisma.user.findFirst({ where: { OR: [{ username }, { email }] } });
    if (existing) {
      throw Object.assign(new Error('El nombre de usuario o email ya existe'), { statusCode: 409 });
    }

    const { publicKey, privateKey } = KeyManager.generateKeyPair();
    const recoveryKey = KeyManager.generateRecoveryKey();
    const recoveryKeyHash = KeyManager.hashRecoveryKey(recoveryKey);
    const encryptedPrivateKey = KeyManager.encryptPrivateKey(privateKey, password);
    const encryptedPrivateKeyRecovery = KeyManager.encryptPrivateKeyWithRecovery(privateKey, recoveryKey);
    const passwordHash = await Argon2Service.hash(password);

    const newAdmin = await prisma.user.create({
      data: {
        id: uuidv4(),
        username,
        email,
        passwordHash,
        fullName: fullName || null,
        role: 'ADMIN',
        publicKey,
        encryptedPrivateKey,
        recoveryKeyHash,
        encryptedPrivateKeyRecovery
      },
      select: { id: true, username: true, email: true, fullName: true, role: true, createdAt: true }
    });

    logger.info(`Nuevo usuario admin creado: ${newAdmin.username}`);

    try {
      const primaryWallet = await prisma.wallet.findFirst({
        where: { userId: newAdmin.id, isPrimary: true }
      });

      if (primaryWallet) {
        const syncResult = await BlockchainAdminService.grantAdminRole(primaryWallet.walletAddress);
        if (syncResult.success) {
          logger.info(`Admin ${newAdmin.username} sincronizado con blockchain, tx: ${syncResult.txHash}`);
        } else {
          logger.warn(`No se pudo sincronizar admin con blockchain: ${syncResult.error}`);
        }
      }
    } catch (syncError) {
      logger.error('Error al sincronizar admin con blockchain:', syncError);
    }

    return { user: newAdmin, recoveryKey };
  }

  static async deleteUser(userId: string, adminUserId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw Object.assign(new Error('Usuario no encontrado'), { statusCode: 404 });
    }

    if (adminUserId === userId) {
      throw Object.assign(new Error('No puede eliminar su propia cuenta'), { statusCode: 400 });
    }

    if (user.role === 'ADMIN') {
      try {
        const primaryWallet = await prisma.wallet.findFirst({
          where: { userId: user.id, isPrimary: true }
        });
        if (primaryWallet) {
          const revokeResult = await BlockchainAdminService.revokeAdminRole(primaryWallet.walletAddress);
          if (revokeResult.success) {
            logger.info(`ADMIN_ROLE revocado de ${user.username}, tx: ${revokeResult.txHash}`);
          } else {
            logger.warn(`No se pudo revocar ADMIN_ROLE: ${revokeResult.error}`);
          }
        }
      } catch (revokeError) {
        logger.error('Error al revocar admin de blockchain:', revokeError);
      }
    }

    await prisma.user.delete({ where: { id: userId } });

    logger.info(`Usuario ${user.username} eliminado por el admin ${adminUserId}`);
  }

  static async getSystemStats() {
    const [totalUsers, totalAdmins, totalDocuments, recentUsers] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.document.count(),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { username: true, email: true, role: true, createdAt: true }
      })
    ]);

    return {
      totalUsers,
      totalAdmins,
      totalRegularUsers: totalUsers - totalAdmins,
      totalDocuments,
      recentUsers
    };
  }
}
