import { Request, Response } from 'express';
import prisma from '../config/database';
import { Argon2Service } from '../services/argon2Service';
import { KeyManager } from '../lib/crypto/KeyManager';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger';
import { BlockchainAdminService } from '../services/blockchainAdminService';

/**
 * Controlador de administración.
 * Gestiona las operaciones exclusivas de los administradores del sistema,
 * incluyendo la gestión de usuarios, estadísticas y sincronización con blockchain.
 */
export class AdminController {
  /**
   * Obtiene todos los usuarios registrados en el sistema.
   * Endpoint: GET /api/admin/users
   *
   * @param req - Objeto de solicitud HTTP autenticado como administrador.
   * @param res - Objeto de respuesta HTTP.
   * @returns Promesa que resuelve con la lista de usuarios y sus metadatos.
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
   * Actualiza el rol de un usuario específico.
   * Endpoint: PUT /api/admin/users/:userId/role
   *
   * @param req - Objeto de solicitud HTTP. El cuerpo debe contener { role: 'USER' | 'ADMIN' }.
   * @param res - Objeto de respuesta HTTP.
   * @returns Promesa que resuelve con el usuario actualizado.
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
   * Crea un nuevo usuario con rol de administrador.
   * Endpoint: POST /api/admin/users
   *
   * @param req - Objeto de solicitud HTTP. El cuerpo debe contener { username, email, password, fullName? }.
   * @param res - Objeto de respuesta HTTP.
   * @returns Promesa que resuelve con el administrador creado y su clave de recuperación.
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

      // Estadísticas de usuario se calculan dinámicamente desde blockchain

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
   * Elimina un usuario del sistema de forma permanente.
   * Endpoint: DELETE /api/admin/users/:userId
   *
   * @param req - Objeto de solicitud HTTP. Los parámetros deben incluir el ID del usuario.
   * @param res - Objeto de respuesta HTTP.
   * @returns Promesa que resuelve con la confirmación de eliminación.
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
   * Obtiene estadísticas generales del sistema.
   * Endpoint: GET /api/admin/stats
   *
   * @param req - Objeto de solicitud HTTP autenticado como administrador.
   * @param res - Objeto de respuesta HTTP.
   * @returns Promesa que resuelve con el resumen estadístico del sistema.
   */
  static async getSystemStats(req: Request, res: Response): Promise<void> {
    try {
      const [
        totalUsers,
        totalAdmins,
        totalDocuments,
        recentUsers
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { role: 'ADMIN' } }),
        prisma.document.count(),
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
          recentUsers
        }
      });
    } catch (error: any) {
      logger.error('Error al obtener estadísticas del sistema:', error);
      res.status(500).json({ error: 'Error al obtener las estadísticas del sistema' });
    }
  }
}
