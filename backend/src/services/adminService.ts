import { v4 as uuidv4 } from 'uuid';
import prisma from '../config/database';
import { Argon2Service } from './argon2Service';
import { BlockchainAdminService } from './blockchainAdminService';
import { deleteFromIPFS } from '../config/ipfs';
import logger from '../utils/logger';
import { ConflictError, NotFoundError, ValidationError, BlockchainError, ServiceUnavailableError } from '../utils/errors';
import { validatePassword } from '../validators/passwordPolicy';

/**
 * Servicio de administración. Gestión de usuarios, roles y estadísticas del sistema.
 */
export class AdminService {

  /**
   * Obtiene todos los usuarios con sus conteos de documentos, wallets y sesiones.
   * @returns {Promise<Array>} Lista de usuarios ordenados por rol (admins primero) y fecha de creación.
   */
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

  /**
   * Actualiza el rol de un usuario (USER o ADMIN) y sincroniza con blockchain si tiene wallet.
   * Primero ejecuta la transacción blockchain (si aplica) y luego actualiza la BD,
   * evitando inconsistencias si la tx on-chain falla.
   * @param {string} userId - ID del usuario cuyo rol se actualiza.
   * @param {'USER' | 'ADMIN'} role - Nuevo rol a asignar.
   * @param {string} adminUserId - ID del admin que realiza la acción.
   * @returns {Promise<Object>} El objeto de usuario actualizado.
   * @throws {Error} Si el rol no es válido, el usuario no existe, el admin intenta quitarse su propio rol o es el último admin.
   */
  static async updateUserRole(userId: string, role: 'USER' | 'ADMIN', adminUserId: string) {
    if (!role || !['USER', 'ADMIN'].includes(role)) {
      throw Object.assign(new Error('Rol inválido. Debe ser USER o ADMIN'), { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw Object.assign(new Error('Usuario no encontrado'), { status: 404 });
    }

    if (adminUserId === userId && role === 'USER') {
      throw Object.assign(new Error('No puede quitar su propio rol de administrador'), { status: 400 });
    }

    // Proteger contra lockout: no permitir degradar al último admin
    if (role === 'USER') {
      const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
      if (adminCount <= 1) {
        throw Object.assign(new Error('No se puede degradar al último administrador del sistema'), { status: 400 });
      }
    }

    // Ejecutar blockchain PRIMERO para evitar inconsistencia BD si falla
    let primaryWallet: { walletAddress: string } | null = null;
    try {
      primaryWallet = await prisma.wallet.findFirst({
        where: { userId: user.id, isPrimary: true }
      });

      if (primaryWallet) {
        if (role === 'ADMIN') {
          logger.info(`Otorgando ADMIN_ROLE en blockchain a ${user.username}...`);
          const grantResult = await BlockchainAdminService.grantAdminRole(primaryWallet.walletAddress);
          if (grantResult.success) {
            logger.info(`ADMIN_ROLE otorgado, tx: ${grantResult.txHash}`);
          } else {
            throw new BlockchainError(`No se pudo otorgar ADMIN_ROLE: ${grantResult.error}`);
          }
        } else {
          logger.info(`Revocando ADMIN_ROLE en blockchain de ${user.username}...`);
          const revokeResult = await BlockchainAdminService.revokeAdminRole(primaryWallet.walletAddress);
          if (revokeResult.success) {
            logger.info(`ADMIN_ROLE revocado, tx: ${revokeResult.txHash}`);
          } else {
            throw new BlockchainError(`No se pudo revocar ADMIN_ROLE: ${revokeResult.error}`);
          }
        }
      }
    } catch (syncError) {
      logger.error('Error al sincronizar rol con blockchain, la BD no se actualiza:', syncError);
      throw new ServiceUnavailableError('Error al sincronizar el rol con blockchain. La operación no se ha completado.');
    }

    // Solo actualizar BD si blockchain tuvo exito
    try {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { role },
        select: { id: true, username: true, email: true, role: true }
      });

      try {
        const { default: notificationService, NotificationType } = await import('./notificationService');
        await notificationService.createNotification({
          userId,
          type: NotificationType.SYSTEM,
          title: role === 'ADMIN' ? 'Rol de administrador asignado' : 'Rol de administrador revocado',
          message: `Tu rol ha sido actualizado a ${role}.`,
          data: { userId, newRole: role }
        });
      } catch (_) { logger.warn(`No se pudo crear notificación de cambio de rol para usuario ${userId}`); }

      try {
        await prisma.event.create({
          data: {
            id: uuidv4(),
            eventType: role === 'ADMIN' ? 'ADMIN_ROLE_GRANTED' : 'ADMIN_ROLE_REVOKED',
            userId,
            metadata: { newRole: role, changedBy: adminUserId }
          }
        });
      } catch (_) { logger.warn(`No se pudo registrar evento de cambio de rol para usuario ${userId}`); }

      return updatedUser;
    } catch (dbError) {
      // BD falló después de blockchain OK — intentar revertir el cambio on-chain
      logger.error('DB update failed after blockchain sync, attempting rollback:', dbError);
      if (primaryWallet) {
        try {
          if (role === 'ADMIN') {
            await BlockchainAdminService.revokeAdminRole(primaryWallet.walletAddress);
          } else {
            await BlockchainAdminService.grantAdminRole(primaryWallet.walletAddress);
          }
        } catch (rollbackError) {
          logger.error('Blockchain rollback also failed — manual reconciliation required:', rollbackError);
          // Registrar estado inconsistente para reconciliación manual
          try {
            await prisma.event.create({
              data: {
                id: uuidv4(),
                eventType: 'ADMIN_ROLE_RECONCILIATION_NEEDED',
                userId,
                metadata: {
                  previousRole: user.role,
                  targetRole: role,
                  adminUserId,
                  walletAddress: primaryWallet.walletAddress,
                  blockchainSuccess: true,
                  dbFailed: true,
                  rollbackFailed: true,
                  dbError: dbError instanceof Error ? dbError.message : String(dbError),
                  rollbackError: rollbackError instanceof Error ? rollbackError.message : String(rollbackError),
                  timestamp: new Date().toISOString(),
                },
              },
            });
          } catch (eventError) {
            logger.error('Failed to persist reconciliation event', eventError);
          }
        }
      }
      throw dbError;
    }
  }

  /**
   * Crea un nuevo usuario administrador con claves criptográficas generadas por el frontend.
   * @param input - Datos del nuevo admin incluyendo claves criptográficas.
   * @returns {Promise<{user: Object}>} El usuario creado.
   * @throws {Error} Si faltan campos requeridos o la contraseña es corta.
   */
  static async createAdminUser(input: {
    username: string;
    email: string;
    password: string;
    fullName?: string;
    publicKey: string;
    encryptedPrivateKey: string;
    recoveryKeyHash: string;
    encryptedPrivateKeyRecovery: string;
    recoveryKeySalt?: string;
  }) {
    const { username, email, password, fullName, publicKey, encryptedPrivateKey, recoveryKeyHash, encryptedPrivateKeyRecovery, recoveryKeySalt } = input;

    if (!username || !email || !password) {
      throw Object.assign(new Error('El nombre de usuario, email y contraseña son obligatorios'), { status: 400 });
    }

    const pwValidation = validatePassword(password);
    if (!pwValidation.valid) {
      throw Object.assign(new Error(`Validación de contraseña fallida: ${pwValidation.errors.join(', ')}`), { status: 400 });
    }

    if (!publicKey || !encryptedPrivateKey || !recoveryKeyHash || !encryptedPrivateKeyRecovery) {
      throw Object.assign(new Error('Faltan las claves criptográficas generadas por el cliente'), { status: 400 });
    }

    const existing = await prisma.user.findFirst({ where: { OR: [{ username }, { email }] } });
    if (existing) {
      throw new ConflictError('El nombre de usuario o email ya existe');
    }

    const passwordHash = await Argon2Service.hash(password);

    const newAdmin = await prisma.user.create({
      data: {
        id: uuidv4(),
        username,
        email,
        passwordHash,
        fullName: fullName || null,
        role: 'ADMIN',
        emailVerified: true,
        publicKey,
        encryptedPrivateKey,
        recoveryKeyHash,
        encryptedPrivateKeyRecovery,
        recoveryKeySalt: recoveryKeySalt || null
      },
      select: { id: true, username: true, email: true, fullName: true, role: true, emailVerified: true, createdAt: true }
    });

    logger.info(`Nuevo usuario admin creado: ${newAdmin.username}`);

    return { user: newAdmin };
  }

  /**
   * Elimina una cuenta de usuario, revocando el rol admin en blockchain si aplica.
   * @param {string} userId - ID del usuario a eliminar.
   * @param {string} adminUserId - ID del admin que realiza la eliminación.
   * @throws {Error} Si el usuario no existe o el admin intenta eliminarse a si mismo.
   */
  static async deleteUser(userId: string, adminUserId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw Object.assign(new Error('Usuario no encontrado'), { status: 404 });
    }

    if (adminUserId === userId) {
      throw Object.assign(new Error('No puede eliminar su propia cuenta'), { status: 400 });
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

    // Recopilar CIDs de IPFS de los documentos del usuario antes de la eliminación en cascada
    let cidsToUnpin: string[] = [];
    try {
      const docs = await prisma.document.findMany({
        where: { ownerId: userId },
        include: { versions: { select: { ipfsCid: true } } },
      });
      for (const doc of docs) {
        for (const ver of doc.versions) {
          if (ver.ipfsCid) cidsToUnpin.push(ver.ipfsCid);
        }
      }
    } catch (e) { logger.warn('Error al recopilar CIDs de IPFS antes de eliminar usuario', e); }

    await prisma.$transaction(async (tx) => {
      // Eliminar documentos del usuario y sus dependencias
      const userDocs = await tx.document.findMany({ where: { ownerId: userId }, select: { id: true } });
      const docIds = userDocs.map(d => d.id);
      if (docIds.length > 0) {
        await tx.event.deleteMany({ where: { documentId: { in: docIds } } });
        await tx.documentSignature.deleteMany({ where: { documentId: { in: docIds } } });
        await tx.version.deleteMany({ where: { documentId: { in: docIds } } });
      }
      await tx.documentShareKey.deleteMany({ where: { userId } });
      await tx.document.deleteMany({ where: { ownerId: userId } });
      await tx.session.deleteMany({ where: { userId } });
      await tx.wallet.deleteMany({ where: { userId } });
      await tx.folder.deleteMany({ where: { userId } });
      await tx.notification.deleteMany({ where: { userId } });
      await tx.user.delete({ where: { id: userId } });
    });

    // Desanclar CIDs de IPFS después de la eliminación exitosa (mejor esfuerzo)
    for (const cid of cidsToUnpin) {
      try { await deleteFromIPFS(cid); } catch (e) { logger.warn(`Error al desanclar CID ${cid}`, e); }
    }

    logger.info(`Usuario ${user.username} eliminado por el admin ${adminUserId}`);
  }

  /**
   * Obtiene estadísticas del sistema: conteo de usuarios, documentos y registros recientes.
   * @returns {Promise<Object>} Objeto de estadísticas con totalUsers, totalAdmins, totalRegularUsers, totalDocuments y recentUsers.
   */
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
