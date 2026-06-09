import { BlockchainStatus, UserRole } from '@prisma/client';
import { logger } from '../utils/logger';
import prisma from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import notificationService, { NotificationType } from './notificationService';
import WebSocketService from './webSocketService';
import { normalizeEthereumAddress } from '../utils/ethereum';
import { findUserByWalletAddress } from '../utils/walletHelper';
import { BlockchainCacheService } from './blockchainCacheService';

export type EventHandlerArgs = Record<string, any>;
export type BlockchainEvent = {
  blockNumber?: number;
  transactionHash?: string;
};
export type EventHandlerFn = (args: EventHandlerArgs, event: BlockchainEvent) => Promise<void>;

function normalizeEventArgs(args: unknown): EventHandlerArgs {
  if (!args) {
    return {};
  }

  if (typeof args === 'object' && !Array.isArray(args)) {
    return args as EventHandlerArgs;
  }

  return {};
}


// ---- Document Created ----
export async function handleDocumentCreated(args: unknown, event: BlockchainEvent): Promise<void> {
  try {
    const eventArgs = normalizeEventArgs(args);
    const document = await prisma.document.update({
      where: { blockchainId: eventArgs.docId },
      data: { blockchainStatus: BlockchainStatus.SYNCED },
      include: { owner: true },
    });

    WebSocketService.sendToUser(document.ownerId, 'document:updated', {
      type: 'CREATED',
      documentId: document.id,
    });

    await notificationService.createNotification({
      userId: document.ownerId,
      type: NotificationType.BLOCKCHAIN_CONFIRMED,
      title: 'Documento confirmado en blockchain',
      message: `Tu archivo "${document.name}" ha sido registrado en blockchain`,
      link: `/files/${document.id}`,
      data: { documentId: document.id, blockNumber: event.blockNumber, transactionHash: event.transactionHash },
    });
  } catch (error) {
    logger.error('Error handling DocumentCreated event', { error });
  }
}

// ---- Version Created ----
export async function handleVersionCreated(args: unknown, event: BlockchainEvent): Promise<void> {
  try {
    const eventArgs = normalizeEventArgs(args);
    const document = await prisma.document.findUnique({ where: { blockchainId: eventArgs.docId }, include: { owner: true } });
    if (!document) return;

    const creatorWallet = await prisma.wallet.findFirst({
      where: { walletAddress: { equals: eventArgs.createdBy, mode: 'insensitive' } },
      include: { user: { select: { username: true, fullName: true } } },
    });

    const existingVersion = await prisma.version.findFirst({
      where: { documentId: document.id, versionNumber: Number(eventArgs.versionNumber) },
    });

    await prisma.$transaction(async (tx) => {

      if (existingVersion) {
        await tx.version.update({
          where: { id: existingVersion.id },
          data: { blockchainStatus: BlockchainStatus.SYNCED, ipfsCid: eventArgs.ipfsCid },
        });
      } else {
        await tx.version.create({
          data: {
            id: uuidv4(), documentId: document.id,
            userId: creatorWallet?.userId || document.ownerId,
            versionNumber: Number(eventArgs.versionNumber),
            ipfsCid: eventArgs.ipfsCid,
            encryptedSymmetricKey: document.encryptedSymmetricKey,
            blockchainStatus: BlockchainStatus.SYNCED,
            blockchainTxHash: event.transactionHash,
          },
        });
      }
    });

    const actorName = creatorWallet?.user?.fullName?.trim() || creatorWallet?.user?.username || 'otro usuario con permisos de edición';
    const editedBySharedUser = creatorWallet?.userId && creatorWallet.userId !== document.ownerId;

    WebSocketService.sendToUser(document.ownerId, 'document:updated', { type: 'VERSION_CREATED', documentId: document.id, versionNumber: Number(eventArgs.versionNumber) });
    if (creatorWallet?.userId && creatorWallet.userId !== document.ownerId) {
      WebSocketService.sendToUser(creatorWallet.userId, 'document:updated', { type: 'VERSION_CREATED', documentId: document.id, versionNumber: Number(eventArgs.versionNumber) });
    }

    await notificationService.createNotification({
      userId: document.ownerId,
      type: NotificationType.NEW_VERSION,
      title: editedBySharedUser ? 'Nueva versión creada por un editor' : 'Nueva versión confirmada',
      message: editedBySharedUser
        ? `${actorName} ha creado la versión ${Number(eventArgs.versionNumber)} de "${document.name}".`
        : `La versión ${Number(eventArgs.versionNumber)} de "${document.name}" ha sido registrada correctamente.`,
      link: `/files/${document.id}/versions`,
      data: { documentId: document.id, versionNumber: Number(eventArgs.versionNumber), blockNumber: event.blockNumber },
    });
  } catch (error) {
    logger.error('Error handling VersionCreated event', { error });
  }
}

// ---- Document Shared ----
export async function handleDocumentShared(args: unknown, _event: BlockchainEvent): Promise<void> {
  try {
    const eventArgs = normalizeEventArgs(args);
    const document = await prisma.document.findUnique({ where: { blockchainId: eventArgs.docId }, include: { owner: true } });
    if (!document) return;

    const recipientUser = await findUserByWalletAddress(eventArgs.to);

    if (recipientUser?.id) {
      WebSocketService.sendToUser(recipientUser.id, 'document:updated', { type: 'SHARED', documentId: document.id });
    }
    if (document.ownerId) {
      WebSocketService.sendToUser(document.ownerId, 'document:updated', { type: 'SHARE_CREATED', documentId: document.id });
    }
  } catch (error) {
    logger.error('Error handling DocumentShared event', { error });
  }
}

// ---- Permission Revoked ----
export async function handlePermissionRevoked(args: unknown, event: BlockchainEvent): Promise<void> {
  try {
    const eventArgs = normalizeEventArgs(args);
    const document = await prisma.document.findUnique({ where: { blockchainId: eventArgs.docId } });
    if (!document) return;

    const existingEvent = await prisma.event.findFirst({
      where: { documentId: document.id, eventType: 'SHARE_REVOKED', transactionHash: event.transactionHash },
    });

    const affectedUser = await findUserByWalletAddress(eventArgs.user);

    if (affectedUser?.id) {
      WebSocketService.sendToUser(affectedUser.id, 'document:updated', { type: 'PERMISSION_REVOKED', documentId: document.id });
    }
    if (document.ownerId) {
      WebSocketService.sendToUser(document.ownerId, 'document:updated', { type: 'SHARE_REVOKED', documentId: document.id });
    }

    if (!existingEvent) {
      await prisma.event.create({
        data: {
          eventType: 'SHARE_REVOKED', userId: document.ownerId, documentId: document.id,
          transactionHash: event.transactionHash, blockNumber: event.blockNumber,
          metadata: { recipientId: affectedUser?.id || null, revokedFrom: eventArgs.user, revokedBy: eventArgs.by },
          blockTimestamp: new Date(),
        },
      });
    }

    if (affectedUser && !existingEvent) {
      await notificationService.createNotification({
        userId: affectedUser.id,
        type: NotificationType.SHARE_REVOKED,
        title: 'Acceso revocado',
        message: `Ya no tienes acceso a "${document.name}"`,
        data: { documentId: document.id, blockNumber: event.blockNumber },
      });
    }
  } catch (error) {
    logger.error('Error handling PermissionRevoked event', { error });
  }
}

// ---- Document Signed ----
export async function handleDocumentSigned(args: unknown, event: BlockchainEvent): Promise<void> {
  try {
    const eventArgs = normalizeEventArgs(args);
    const document = await prisma.document.findUnique({ where: { blockchainId: eventArgs.docId }, include: { owner: true } });
    if (!document) return;

    const signerAddress = normalizeEthereumAddress(eventArgs.signer);
    const signerWallet = signerAddress ? await prisma.wallet.findFirst({ where: { walletAddress: signerAddress } }) : null;

    if (signerWallet) {
      await prisma.documentSignature.updateMany({
        where: { documentId: document.id, signerWalletId: signerWallet.id, blockchainStatus: BlockchainStatus.TX_SUBMITTED },
        data: { blockchainStatus: BlockchainStatus.SYNCED },
      });
    }

    const signerUser = await findUserByWalletAddress(eventArgs.signer);
    const notificationMessage = `${signerUser?.username || 'Un usuario'} firmó la versión ${Number(eventArgs.versionNumber)} de "${document.name}"`;

    const existingNotification = await prisma.notification.findFirst({
      where: { userId: document.ownerId, type: NotificationType.FILE_SIGNED, message: notificationMessage, createdAt: { gte: new Date(Date.now() - 10 * 60 * 1000) } },
    });

    if (document.ownerId) {
      WebSocketService.sendToUser(document.ownerId, 'document:updated', { type: 'SIGNED', documentId: document.id, versionNumber: Number(eventArgs.versionNumber) });
    }
    if (signerUser?.id && signerUser.id !== document.ownerId) {
      WebSocketService.sendToUser(signerUser.id, 'document:updated', { type: 'SIGNED', documentId: document.id, versionNumber: Number(eventArgs.versionNumber) });
    }

    if (!existingNotification) {
      await notificationService.createNotification({
        userId: document.ownerId, type: NotificationType.FILE_SIGNED,
        title: 'Documento firmado', message: notificationMessage,
        link: `/app/documents/${document.id}`,
        data: { documentId: document.id, versionNumber: Number(eventArgs.versionNumber), signer: eventArgs.signer, txHash: event.transactionHash },
      });
    }
  } catch (error) {
    logger.error('Error handling DocumentSigned event', { error });
  }
}

// ---- Document Deleted ----
export async function handleDocumentDeleted(args: unknown, event: BlockchainEvent): Promise<void> {
  try {
    const eventArgs = normalizeEventArgs(args);
    const document = await prisma.document.findUnique({ where: { blockchainId: eventArgs.docId }, include: { owner: true } });
    if (!document) return;

    await notificationService.createNotification({
      userId: document.ownerId, type: NotificationType.FILE_DELETED,
      title: 'Documento eliminado', message: `"${document.name}" ha sido eliminado permanentemente del blockchain`,
      data: { documentId: document.id, blockNumber: event.blockNumber },
    });

    BlockchainCacheService.invalidate(eventArgs.docId);
  } catch (error) {
    logger.error('Error handling DocumentDeleted event', { error });
  }
}

// ---- Version Restored ----
export async function handleVersionRestored(args: unknown, event: BlockchainEvent): Promise<void> {
  try {
    const eventArgs = normalizeEventArgs(args);
    const document = await prisma.document.findUnique({ where: { blockchainId: eventArgs.docId }, include: { owner: true } });
    if (!document) return;

    await prisma.event.create({
      data: {
        eventType: 'VersionRestored', userId: document.ownerId, documentId: document.id,
        metadata: { newVersionNumber: Number(eventArgs.newVersionNumber), restoredFromVersion: Number(eventArgs.restoredFromVersion), restoredBy: eventArgs.by },
        transactionHash: event.transactionHash, blockNumber: event.blockNumber,
        blockTimestamp: new Date(Number(eventArgs.timestamp) * 1000),
      },
    });

    await notificationService.createNotification({
      userId: document.ownerId, type: NotificationType.FILE_UPDATED,
      title: 'Versión restaurada',
      message: `Se restauró la versión ${Number(eventArgs.restoredFromVersion)} de "${document.name}" como versión ${Number(eventArgs.newVersionNumber)}`,
      link: `/files/${document.id}`,
      data: { documentId: document.id, newVersionNumber: Number(eventArgs.newVersionNumber), restoredFromVersion: Number(eventArgs.restoredFromVersion) },
    });
  } catch (error) {
    logger.error('Error handling VersionRestored event', { error });
  }
}

// ---- Document Archived ----
export async function handleDocumentArchived(args: unknown, event: BlockchainEvent): Promise<void> {
  try {
    const eventArgs = normalizeEventArgs(args);
    const document = await prisma.document.findUnique({ where: { blockchainId: eventArgs.docId }, include: { owner: true } });
    if (!document) return;

    await prisma.event.create({
      data: {
        eventType: eventArgs.archived ? 'DocumentArchived' : 'DocumentUnarchived', userId: document.ownerId, documentId: document.id,
        metadata: { archived: eventArgs.archived, by: eventArgs.by },
        transactionHash: event.transactionHash, blockNumber: event.blockNumber,
        blockTimestamp: new Date(Number(eventArgs.timestamp) * 1000),
      },
    });

    await notificationService.createNotification({
      userId: document.ownerId, type: eventArgs.archived ? NotificationType.FILE_ARCHIVED : NotificationType.FILE_UPDATED,
      title: eventArgs.archived ? 'Documento archivado' : 'Documento desarchivado',
      message: `"${document.name}" ha sido ${eventArgs.archived ? 'archivado' : 'desarchivado'}`,
      link: `/files/${document.id}`,
      data: { documentId: document.id, archived: eventArgs.archived, blockNumber: event.blockNumber },
    });

    BlockchainCacheService.invalidate(eventArgs.docId);
  } catch (error) {
    logger.error('Error handling DocumentArchived event', { error });
  }
}

// ---- Ownership Transferred ----
export async function handleOwnershipTransferred(args: unknown, event: BlockchainEvent): Promise<void> {
  try {
    const eventArgs = normalizeEventArgs(args);
    const document = await prisma.document.findUnique({ where: { blockchainId: eventArgs.docId }, include: { owner: true } });
    if (!document) return;

    const newOwner = await findUserByWalletAddress(eventArgs.to);
    if (!newOwner) return;

    // Buscar evento TRANSFER_PREPARED con clave re-cifrada
    const transferEvent = await prisma.event.findFirst({
      where: { documentId: document.id, eventType: 'TRANSFER_PREPARED' },
      orderBy: { createdAt: 'desc' },
    });
    const pendingKey = transferEvent?.metadata && typeof transferEvent.metadata === 'object' && 'pendingEncryptedSymmetricKey' in transferEvent.metadata ? (transferEvent.metadata as any).pendingEncryptedSymmetricKey : null;
    if (pendingKey) {
      await prisma.document.update({ where: { blockchainId: eventArgs.docId }, data: { ownerId: newOwner.id, encryptedSymmetricKey: pendingKey } });
    } else {
      logger.warn(`Ownership transferred without re-encrypted key for doc ${eventArgs.docId}. Skipping ownerId update.`);
    }

    await prisma.event.create({
      data: {
        eventType: 'DocumentTransferred', userId: newOwner.id, documentId: document.id,
        metadata: { from: eventArgs.from, to: eventArgs.to, previousOwnerId: document.ownerId },
        transactionHash: event.transactionHash, blockNumber: event.blockNumber,
        blockTimestamp: new Date(Number(eventArgs.timestamp) * 1000),
      },
    });

    await notificationService.createNotification({
      userId: newOwner.id, type: NotificationType.FILE_SHARED,
      title: 'Propiedad transferida', message: `Ahora eres propietario de "${document.name}"`,
      link: `/files/${document.id}`, data: { documentId: document.id, previousOwner: eventArgs.from },
    });

    await notificationService.createNotification({
      userId: document.ownerId, type: NotificationType.FILE_UPDATED,
      title: 'Propiedad transferida', message: `Transferiste la propiedad de "${document.name}" a ${newOwner.username}`,
      link: `/files/${document.id}`, data: { documentId: document.id, newOwner: eventArgs.to },
    });

    BlockchainCacheService.invalidate(eventArgs.docId);
  } catch (error) {
    logger.error('Error handling OwnershipTransferred event', { error });
  }
}

// ---- Operational Version Changed ----
export async function handleOperationalVersionChanged(args: unknown, event: BlockchainEvent): Promise<void> {
  try {
    const eventArgs = normalizeEventArgs(args);
    const document = await prisma.document.findUnique({ where: { blockchainId: eventArgs.docId }, include: { owner: true } });
    if (!document) return;

    await prisma.$transaction(async (tx) => {

      await tx.event.create({
        data: {
          eventType: 'OperationalVersionChanged', userId: document.ownerId, documentId: document.id,
          metadata: { oldVersion: Number(eventArgs.oldVersion), newVersion: Number(eventArgs.newVersion), changedBy: eventArgs.by },
          transactionHash: event.transactionHash, blockNumber: event.blockNumber,
          blockTimestamp: new Date(Number(eventArgs.timestamp) * 1000),
        },
      });
    });

    await notificationService.createNotification({
      userId: document.ownerId, type: NotificationType.FILE_UPDATED,
      title: 'Versión operacional cambiada',
      message: `La versión operacional de "${document.name}" cambió de v${Number(eventArgs.oldVersion)} a v${Number(eventArgs.newVersion)}`,
      link: `/files/${document.id}`, data: { documentId: document.id, oldVersion: Number(eventArgs.oldVersion), newVersion: Number(eventArgs.newVersion) },
    });

    BlockchainCacheService.invalidate(eventArgs.docId);
  } catch (error) {
    logger.error('Error handling OperationalVersionChanged event', { error });
  }
}

// ---- Admin Role Granted ----
export async function handleAdminRoleGranted(args: unknown, event: BlockchainEvent): Promise<void> {
  try {
    const eventArgs = normalizeEventArgs(args);
    const adminUser = await findUserByWalletAddress(eventArgs.admin);
    const grantedByUser = await findUserByWalletAddress(eventArgs.by);

    if (adminUser) {
      await prisma.user.update({ where: { id: adminUser.id }, data: { role: UserRole.ADMIN } });

      await notificationService.createNotification({
        userId: adminUser.id, type: NotificationType.SYSTEM,
        title: 'Rol de administrador otorgado', message: 'Has sido designado como administrador del sistema',
        data: { grantedBy: eventArgs.by, blockNumber: event.blockNumber },
      });
    }

    await prisma.event.create({
      data: {
        eventType: 'AdminRoleGranted', userId: grantedByUser?.id || null,
        metadata: { admin: eventArgs.admin, adminUserId: adminUser?.id, grantedBy: eventArgs.by, grantedByUserId: grantedByUser?.id },
        transactionHash: event.transactionHash, blockNumber: event.blockNumber,
        blockTimestamp: new Date(Number(eventArgs.timestamp) * 1000),
      },
    });
  } catch (error) {
    logger.error('Error handling AdminRoleGranted event', { error });
  }
}

// ---- Admin Role Revoked ----
export async function handleAdminRoleRevoked(args: unknown, event: BlockchainEvent): Promise<void> {
  try {
    const eventArgs = normalizeEventArgs(args);
    const adminUser = await findUserByWalletAddress(eventArgs.admin);
    const revokedByUser = await findUserByWalletAddress(eventArgs.by);

    if (adminUser && adminUser.role === UserRole.ADMIN) {
      await prisma.user.update({ where: { id: adminUser.id }, data: { role: UserRole.USER } });

      await notificationService.createNotification({
        userId: adminUser.id, type: NotificationType.SYSTEM,
        title: 'Rol de administrador revocado', message: 'Tu rol de administrador ha sido revocado',
        data: { revokedBy: eventArgs.by, blockNumber: event.blockNumber },
      });
    }

    await prisma.event.create({
      data: {
        eventType: 'AdminRoleRevoked', userId: revokedByUser?.id || null,
        metadata: { admin: eventArgs.admin, adminUserId: adminUser?.id, revokedBy: eventArgs.by, revokedByUserId: revokedByUser?.id },
        transactionHash: event.transactionHash, blockNumber: event.blockNumber,
        blockTimestamp: new Date(Number(eventArgs.timestamp) * 1000),
      },
    });
  } catch (error) {
    logger.error('Error handling AdminRoleRevoked event', { error });
  }
}
