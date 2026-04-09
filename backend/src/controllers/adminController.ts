import { Request, Response } from 'express';
import prisma from '../config/database';
import { Argon2Service } from '../services/argon2Service';
import { KeyManager } from '../lib/crypto/KeyManager';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger';
import { SystemService } from '../services/systemService';
import { BlockchainAdminService } from '../services/blockchainAdminService';

export class AdminController {
  /**
   * Obtener todos los usuarios (solo admin)
   * GET /api/admin/users
   */
  static async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          username: true,
          email: true,
          fullName: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          twoFactorEnabled: true,
          isSuspended: true,
          suspendedAt: true,
          suspendReason: true,
          _count: {
            select: {
              documents: true,
              wallets: true,
              sessions: true
            }
          }
        },
        orderBy: [
          { role: 'desc' }, // Admins primero
          { createdAt: 'desc' }
        ]
      });

      res.status(200).json({ users });
    } catch (error: any) {
      logger.error('Error al obtener usuarios:', error);
      res.status(500).json({ error: 'Error al obtener los usuarios' });
    }
  }

  /**
   * Actualizar rol de usuario (solo admin)
   * PUT /api/admin/users/:userId/role
   * Body: { role: 'USER' | 'ADMIN' }
   */
  static async updateUserRole(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId as string;
      const { role } = req.body;

      if (!role || !['USER', 'ADMIN'].includes(role)) {
        res.status(400).json({ error: 'Rol inválido. Debe ser USER o ADMIN' });
        return;
      }

      // Verificar que el usuario existe
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }

      // Evitar que el admin se quite a sí mismo el rol de admin
      if (req.user?.userId === userId && role === 'USER') {
        res.status(400).json({ error: 'No puede quitar su propio rol de administrador' });
        return;
      }

      // Actualizar rol
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { role },
        select: {
          id: true,
          username: true,
          email: true,
          role: true
        }
      });

      logger.info(`Rol del usuario ${updatedUser.username} cambiado a ${role} por el admin ${req.user?.userId}`);

      // Sincronizar con blockchain
      try {
        const primaryWallet = await prisma.wallet.findFirst({
          where: {
            userId: updatedUser.id,
            isPrimary: true
          }
        });

        if (primaryWallet) {
          if (role === 'ADMIN') {
            // Otorgar ADMIN_ROLE
            logger.info(`Otorgando ADMIN_ROLE en blockchain a ${updatedUser.username}...`);
            const grantResult = await BlockchainAdminService.grantAdminRole(primaryWallet.walletAddress);
            if (grantResult.success) {
              logger.info(`✅ ADMIN_ROLE otorgado, tx: ${grantResult.txHash}`);
            } else {
              logger.warn(`⚠️ No se pudo otorgar ADMIN_ROLE: ${grantResult.error}`);
            }
          } else if (role === 'USER') {
            // Revocar ADMIN_ROLE
            logger.info(`Revocando ADMIN_ROLE en blockchain de ${updatedUser.username}...`);
            const revokeResult = await BlockchainAdminService.revokeAdminRole(primaryWallet.walletAddress);
            if (revokeResult.success) {
              logger.info(`✅ ADMIN_ROLE revocado, tx: ${revokeResult.txHash}`);
            } else {
              logger.warn(`⚠️ No se pudo revocar ADMIN_ROLE: ${revokeResult.error}`);
            }
          }
        }
      } catch (syncError) {
        // No fallar el cambio de rol si falla la sincronización
        logger.error('Error al sincronizar rol con blockchain:', syncError);
      }

      res.status(200).json({
        message: 'Rol de usuario actualizado correctamente',
        user: updatedUser
      });
    } catch (error: any) {
      logger.error('Error al actualizar rol de usuario:', error);
      res.status(500).json({ error: 'Error al actualizar el rol del usuario' });
    }
  }

  /**
   * Crear nuevo usuario administrador (solo admin)
   * POST /api/admin/users
   * Body: { username, email, password, fullName? }
   */
  static async createAdminUser(req: Request, res: Response): Promise<void> {
    try {
      const { username, email, password, fullName } = req.body;

      // Validar campos requeridos
      if (!username || !email || !password) {
        res.status(400).json({ error: 'El nombre de usuario, email y contraseña son obligatorios' });
        return;
      }

      if (password.length < 6) {
        res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
        return;
      }

      // Verificar que no existe
      const existing = await prisma.user.findFirst({
        where: {
          OR: [{ username }, { email }]
        }
      });

      if (existing) {
        res.status(409).json({ error: 'El nombre de usuario o email ya existe' });
        return;
      }

      // Generar claves
      const { publicKey, privateKey } = KeyManager.generateKeyPair();
      const recoveryKey = KeyManager.generateRecoveryKey();
      const recoveryKeyHash = KeyManager.hashRecoveryKey(recoveryKey);
      const encryptedPrivateKey = KeyManager.encryptPrivateKey(privateKey, password);
      const encryptedPrivateKeyRecovery = KeyManager.encryptPrivateKeyWithRecovery(privateKey, recoveryKey);
      const passwordHash = await Argon2Service.hash(password);

      // Crear usuario admin
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
        select: {
          id: true,
          username: true,
          email: true,
          fullName: true,
          role: true,
          createdAt: true
        }
      });

      // Crear estadísticas
      await prisma.userStats.create({
        data: {
          userId: newAdmin.id,
          totalDocuments: 0,
          totalSize: BigInt(0),
          totalShared: 0,
          totalDownloads: 0,
          totalSignatures: 0,
          totalTransfers: 0,
          totalRestores: 0,
          totalUnpins: 0
        }
      });

      logger.info(`Nuevo usuario admin creado: ${newAdmin.username} por ${req.user?.userId}`);

      // Sincronizar con blockchain si tiene wallet primaria
      // (Si no tiene, se sincronizará cuando conecte una wallet)
      try {
        const primaryWallet = await prisma.wallet.findFirst({
          where: {
            userId: newAdmin.id,
            isPrimary: true
          }
        });

        if (primaryWallet) {
          logger.info(`Sincronizando admin ${newAdmin.username} con blockchain...`);
          const syncResult = await BlockchainAdminService.grantAdminRole(primaryWallet.walletAddress);
          if (syncResult.success) {
            logger.info(`✅ Admin ${newAdmin.username} sincronizado con blockchain, tx: ${syncResult.txHash}`);
          } else {
            logger.warn(`⚠️ No se pudo sincronizar admin con blockchain: ${syncResult.error}`);
          }
        }
      } catch (syncError) {
        // No fallar la creación del admin si falla la sincronización
        logger.error('Error al sincronizar admin con blockchain:', syncError);
      }

      res.status(201).json({
        message: 'Usuario administrador creado correctamente',
        user: newAdmin,
        recoveryKey // Devolver recovery key SOLO aquí
      });
    } catch (error: any) {
      logger.error('Error al crear usuario admin:', error);
      res.status(500).json({ error: 'Error al crear el usuario administrador' });
    }
  }

  /**
   * Eliminar usuario (solo admin)
   * DELETE /api/admin/users/:userId
   */
  static async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId as string;

      // Verificar que el usuario existe
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }

      // Evitar que el admin se elimine a sí mismo
      if (req.user?.userId === userId) {
        res.status(400).json({ error: 'No puede eliminar su propia cuenta' });
        return;
      }

      // Si el usuario es admin, revocar rol en blockchain antes de eliminar
      if (user.role === 'ADMIN') {
        try {
          const primaryWallet = await prisma.wallet.findFirst({
            where: {
              userId: user.id,
              isPrimary: true
            }
          });

          if (primaryWallet) {
            logger.info(`Revocando ADMIN_ROLE en blockchain de ${user.username}...`);
            const revokeResult = await BlockchainAdminService.revokeAdminRole(primaryWallet.walletAddress);
            if (revokeResult.success) {
              logger.info(`✅ ADMIN_ROLE revocado de ${user.username}, tx: ${revokeResult.txHash}`);
            } else {
              logger.warn(`⚠️ No se pudo revocar ADMIN_ROLE: ${revokeResult.error}`);
            }
          }
        } catch (revokeError) {
          // No fallar la eliminación si falla la revocación
          logger.error('Error al revocar admin de blockchain:', revokeError);
        }
      }

      // Eliminar usuario (cascade eliminará todo lo relacionado)
      await prisma.user.delete({
        where: { id: userId }
      });

      logger.info(`Usuario ${user.username} eliminado por el admin ${req.user?.userId}`);

      res.status(200).json({ message: 'Usuario eliminado correctamente' });
    } catch (error: any) {
      logger.error('Error al eliminar usuario:', error);
      res.status(500).json({ error: 'Error al eliminar el usuario' });
    }
  }

  /**
   * Obtener estadísticas del sistema (solo admin)
   * GET /api/admin/stats
   */
  static async getSystemStats(req: Request, res: Response): Promise<void> {
    try {
      const [
        totalUsers,
        totalAdmins,
        totalDocuments,
        totalStorageUsed,
        recentUsers
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { role: 'ADMIN' } }),
        prisma.document.count(),
        prisma.userStats.aggregate({
          _sum: { totalSize: true }
        }),
        prisma.user.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            username: true,
            email: true,
            role: true,
            createdAt: true
          }
        })
      ]);

      res.status(200).json({
        stats: {
          totalUsers,
          totalAdmins,
          totalRegularUsers: totalUsers - totalAdmins,
          totalDocuments,
          totalStorageUsed: totalStorageUsed._sum?.totalSize?.toString() || '0',
          recentUsers
        }
      });
    } catch (error: any) {
      logger.error('Error al obtener estadísticas del sistema:', error);
      res.status(500).json({ error: 'Error al obtener las estadísticas del sistema' });
    }
  }

  /**
   * Obtener estado del sistema (pausa de emergencia)
   * GET /api/admin/system/status
   */
  static async getSystemStatus(req: Request, res: Response): Promise<void> {
    try {
      const status = await SystemService.getSystemStatus();

      res.status(200).json({
        success: true,
        status
      });
    } catch (error: any) {
      logger.error('Error al obtener estado del sistema:', error);
      res.status(500).json({ error: 'Error al obtener el estado del sistema' });
    }
  }

  /**
   * Pausar el sistema (Circuit Breaker)
   * POST /api/admin/system/pause
   * Body: { reason: string }
   */
  static async pauseSystem(req: Request, res: Response): Promise<void> {
    try {
      const { reason } = req.body;

      if (!reason || reason.trim().length === 0) {
        res.status(400).json({ error: 'Debe proporcionar una razón para pausar el sistema' });
        return;
      }

      const userId = req.user?.userId as string;

      logger.warn(`[ADMIN] Usuario ${userId} está pausando el sistema, razón: ${reason}`);

      const status = await SystemService.pauseSystem({
        userId,
        reason: reason.trim()
      });

      res.status(200).json({
        success: true,
        message: 'Sistema pausado correctamente',
        status
      });
    } catch (error: any) {
      logger.error('Error al pausar el sistema:', error);
      res.status(500).json({ error: 'Error al pausar el sistema: ' + error.message });
    }
  }

  /**
   * Despausar el sistema
   * POST /api/admin/system/unpause
   */
  static async unpauseSystem(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId as string;

      logger.info(`[ADMIN] Usuario ${userId} está despausando el sistema`);

      const status = await SystemService.unpauseSystem(userId);

      res.status(200).json({
        success: true,
        message: 'Sistema despausado correctamente',
        status
      });
    } catch (error: any) {
      logger.error('Error al despausar el sistema:', error);
      res.status(500).json({ error: 'Error al despausar el sistema: ' + error.message });
    }
  }

  /**
   * Sincronizar todos los administradores con blockchain
   * POST /api/admin/sync/admins
   */
  static async syncAdminsToBlockchain(req: Request, res: Response): Promise<void> {
    try {
      logger.info(`[ADMIN] Usuario ${req.user?.userId} solicitó sincronizar administradores con blockchain`);

      const results = await BlockchainAdminService.syncAllAdmins();

      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;

      res.status(200).json({
        success: true,
        message: `Sincronización completada: ${successful} exitosas, ${failed} fallidas`,
        results
      });
    } catch (error: any) {
      logger.error('Error al sincronizar administradores:', error);
      res.status(500).json({ error: 'Error al sincronizar administradores: ' + error.message });
    }
  }
}
