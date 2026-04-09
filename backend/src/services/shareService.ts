/**
 * Share Service - Backend Encryption Architecture
 * 
 * This service implements the prepare/confirm pattern with backend encryption:
 * 1. prepareShare: 
 *    - Frontend decrypts symmetric key locally
 *    - Sends decrypted key to backend (over HTTPS)
 *    - Backend re-encrypts with recipient's public key
 *    - Creates DB record with PREPARING status
 * 2. confirmShare: Updates DB record after frontend signs blockchain transaction
 * 
 * The backend:
 * - Re-encrypts symmetric keys for shared users
 * - Creates blockchain records
 * - Does NOT handle passwords or private keys
 * - Does NOT sign blockchain transactions (user's wallet does this)
 */

import { v4 as uuidv4 } from 'uuid';
import prisma from '../config/database';
import { DocumentPermissionService, DocumentRole } from './documentPermissionService';
import { BlockchainStatus } from '@prisma/client';
import logger from '../utils/logger';
import * as Encryption from '../lib/encryption';
import notificationService, { NotificationType } from './notificationService';
import { normalizeEthereumAddress } from '../utils/ethereum';

// ============================================
// Types
// ============================================

export interface ShareInfo {
  id: string;
  documentId: string;
  userId: string;
  role: 'SHARED_READ' | 'SHARED_WRITE' | 'OWNER';
  sharerWalletId: string | null;
  blockchainStatus: BlockchainStatus;
  createdAt: string;
  user?: {
    username: string;
    fullName: string | null;
    email: string;
  };
}

export interface PrepareShareInput {
  documentId: string;
  sharedWithUserId: string;
  role: 'SHARED_READ' | 'SHARED_WRITE';
  sharerUserId: string;
  sharerWalletId: string;
  decryptedSymmetricKey: string;  // Base64-encoded symmetric key (decrypted in frontend)
  sharedToWalletAddress?: string;
}

export interface PrepareShareResult {
  blockchainId: string;
  sharedWithAddress: string;
  shareId: string;
}

export interface ConfirmShareInput {
  shareId: string;
  txHash: string;
}

export interface PrepareRevokeShareResult {
  blockchainId: string;
  shareId: string;
  sharedWithAddress: string;
}

// ============================================
// Share Service Class
// ============================================

export class ShareService {
  private static async getConfirmedShareEntries(documentId?: string, recipientUserId?: string): Promise<Array<{
    shareId: string;
    documentId: string;
    recipientId: string;
    role: 'SHARED_READ' | 'SHARED_WRITE';
    createdAt: Date;
  }>> {
    const events = await prisma.event.findMany({
      where: {
        eventType: {
          in: ['SHARE_CONFIRMED', 'SHARE_REVOKED'],
        },
        ...(documentId ? { documentId } : {}),
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: documentId ? 100 : 500,
    });

    const latestByRecipient = new Map<string, {
      shareId: string;
      documentId: string;
      recipientId: string;
      role: 'SHARED_READ' | 'SHARED_WRITE';
      createdAt: Date;
      eventType: 'SHARE_CONFIRMED' | 'SHARE_REVOKED';
    }>();

    for (const event of events) {
      if (!event.documentId) {
        continue;
      }

      const metadata = (event.metadata as {
        shareId?: unknown;
        recipientId?: unknown;
        role?: unknown;
      } | null) ?? null;

      const resolvedRecipientId = typeof metadata?.recipientId === 'string' ? metadata.recipientId : null;
      if (!resolvedRecipientId) {
        continue;
      }

      if (recipientUserId && resolvedRecipientId !== recipientUserId) {
        continue;
      }

      const stateKey = `${event.documentId}:${resolvedRecipientId}`;

      if (latestByRecipient.has(stateKey)) {
        continue;
      }

      latestByRecipient.set(stateKey, {
        shareId: typeof metadata?.shareId === 'string' ? metadata.shareId : `${event.documentId}:${resolvedRecipientId}`,
        documentId: event.documentId,
        recipientId: resolvedRecipientId,
        role: metadata?.role === 'SHARED_WRITE' ? 'SHARED_WRITE' : 'SHARED_READ',
        createdAt: event.createdAt,
        eventType: event.eventType === 'SHARE_REVOKED' ? 'SHARE_REVOKED' : 'SHARE_CONFIRMED',
      });
    }

    return Array.from(latestByRecipient.values())
      .filter((entry) => entry.eventType === 'SHARE_CONFIRMED')
      .map(({ eventType, ...entry }) => entry);
  }

  private static async buildShareInfoFromEvents(
    document: { id: string; creatorWalletId: string | null },
    entries: Array<{
      shareId: string;
      documentId: string;
      recipientId: string;
      role: 'SHARED_READ' | 'SHARED_WRITE';
      createdAt: Date;
    }>
  ): Promise<ShareInfo[]> {
    if (entries.length === 0) {
      return [];
    }

    const users = await prisma.user.findMany({
      where: {
        id: {
          in: entries.map((entry) => entry.recipientId),
        },
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
      },
    });

    const userById = new Map(users.map((user) => [user.id, user]));

    return entries.map((entry) => {
      const user = userById.get(entry.recipientId);

      return {
        id: entry.shareId,
        documentId: entry.documentId,
        userId: entry.recipientId,
        role: entry.role,
        sharerWalletId: document.creatorWalletId,
        blockchainStatus: BlockchainStatus.SYNCED,
        createdAt: entry.createdAt.toISOString(),
        user: user
          ? {
              username: user.username,
              fullName: user.fullName,
              email: user.email,
            }
          : {
              username: entry.recipientId,
              fullName: null,
              email: '',
            },
      };
    });
  }

  /**
   * Prepare a share for creation
   * - Validates permissions
   * - Re-encrypts symmetric key with recipient's public key
   * - Creates DB record with PREPARING status
   * - Returns data needed for frontend to sign blockchain transaction
   */
  static async prepareShare(input: PrepareShareInput): Promise<PrepareShareResult> {
    const {
      documentId,
      sharedWithUserId,
      role,
      sharerUserId,
      sharerWalletId,
      decryptedSymmetricKey,
      sharedToWalletAddress,
    } = input;

    // 1. Check ownership
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        ownerId: sharerUserId,
      },
    });

    if (!document) {
      throw new Error('Documento no encontrado o acceso denegado');
    }

    if (!document.blockchainId) {
      throw new Error('El documento no tiene ID de blockchain aún');
    }

    // 2. Validate sharer's wallet
    const sharerWallet = await prisma.wallet.findFirst({
      where: {
        id: sharerWalletId,
        userId: sharerUserId,
      },
    });

    if (!sharerWallet) {
      throw new Error('Wallet no encontrada o no pertenece al usuario');
    }

    // 3. Get recipient's info including public key
    const recipient = await prisma.user.findUnique({
      where: { id: sharedWithUserId },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        publicKey: true,
        wallets: true,
      },
    });

    if (!recipient) {
      throw new Error('Usuario destinatario no encontrado');
    }

    if (!recipient.publicKey) {
      throw new Error('El destinatario no tiene clave pública configurada');
    }

    // TODO: Verificar desde blockchain con DocumentPermissionService si ya está compartido

    // 5. Get recipient's wallet address (use provided or first wallet)
    const primaryRecipientWallet = recipient.wallets.find((wallet) => wallet.isPrimary) || recipient.wallets[0];
    const recipientWalletAddress = sharedToWalletAddress || primaryRecipientWallet?.walletAddress || null;

    if (!recipientWalletAddress) {
      throw new Error('El destinatario no tiene wallet configurada');
    }

    // 6. Re-encrypt symmetric key with recipient's public key
    const reEncryptedKey = Encryption.encryptSymmetricKey(
      decryptedSymmetricKey,
      recipient.publicKey
    );
    logger.info(`[PREPARE] Clave simétrica re-encriptada para usuario ${sharedWithUserId}`);

    // 7. Use the real document blockchain ID for the on-chain permission grant
    const blockchainId = document.blockchainId;

    // TODO: Implementar persistencia en DB con modelo alternativo o gestionar desde blockchain
    const share = { id: uuidv4() }; // Temporary mock

    logger.info(`[PREPARE] Share creado en DB: ${share.id}, estado: PREPARING`);

    // 9. Log the preparation
    await prisma.event.create({
      data: {
        id: uuidv4(),
        eventType: 'SHARE_PREPARED',
        userId: sharerUserId,
        documentId: document.id,
        metadata: {
          shareId: share.id,
          blockchainId,
          recipientId: sharedWithUserId,
          recipientWalletAddress,
          role,
        },
      },
    });

    return {
      blockchainId,
      sharedWithAddress: recipientWalletAddress,
      shareId: share.id,
    };
  }

  /**
   * Confirm a share after blockchain transaction
   * Logs the event - permissions are managed on blockchain
   */
  static async confirmShare(input: ConfirmShareInput): Promise<ShareInfo> {
    const { shareId, txHash } = input;

    const preparedEvents = await prisma.event.findMany({
      where: {
        eventType: 'SHARE_PREPARED',
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 100,
    });

    const preparedEvent = preparedEvents.find((event) => {
      const metadata = event.metadata as { shareId?: unknown } | null;
      return metadata?.shareId === shareId;
    });

    if (!preparedEvent?.documentId) {
      throw new Error('No se encontró la preparación del share');
    }

    const metadata = (preparedEvent.metadata as {
      recipientId?: unknown;
      role?: unknown;
    } | null) ?? null;

    const recipientId = typeof metadata?.recipientId === 'string' ? metadata.recipientId : null;
    const role = metadata?.role === 'SHARED_WRITE' ? 'SHARED_WRITE' : 'SHARED_READ';

    const document = await prisma.document.findUnique({
      where: { id: preparedEvent.documentId },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    if (!document) {
      throw new Error('Documento no encontrado para confirmar el share');
    }

    if (recipientId) {
      await notificationService.createNotification({
        userId: recipientId,
        type: NotificationType.FILE_SHARED,
        title: 'Documento compartido',
        message: `${document.owner.username} compartió "${document.name}" contigo`,
        link: `/app/documents/${document.id}`,
        data: {
          documentId: document.id,
          shareId,
          txHash,
          role,
        },
      });
    }

    await prisma.event.create({
      data: {
        id: uuidv4(),
        eventType: 'SHARE_CONFIRMED',
        userId: document.ownerId,
        documentId: document.id,
        transactionHash: txHash,
        metadata: {
          shareId,
          recipientId,
          role,
        },
      },
    });

    // Permissions are managed via blockchain - just log the event
    logger.info(`[CONFIRM] Share ${shareId} confirmado con txHash: ${txHash}`);

    return {
      id: shareId,
      documentId: document.id,
      userId: recipientId || '',
      role,
      sharerWalletId: document.creatorWalletId,
      blockchainStatus: BlockchainStatus.SYNCED,
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Get shares for a document
   */
  static async getDocumentShares(documentId: string, userId: string): Promise<ShareInfo[]> {
    // Check if user owns the document
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        ownerId: userId,
      },
    });

    if (!document) {
      throw new Error('Documento no encontrado o acceso denegado');
    }

    if (!document.blockchainId) {
      return [];
    }

    const usersWithRoles = await DocumentPermissionService.getDocumentUsersWithRoles(document.blockchainId);
    const sharedUsers = usersWithRoles.filter((entry) => entry.role !== DocumentRole.OWNER);

    if (sharedUsers.length === 0) {
      const eventEntries = await this.getConfirmedShareEntries(documentId);
      return this.buildShareInfoFromEvents(document, eventEntries);
    }

    const walletAddresses = sharedUsers
      .map((entry) => normalizeEthereumAddress(entry.address))
      .filter((address): address is string => Boolean(address));

    const wallets = await prisma.wallet.findMany({
      where: {
        walletAddress: {
          in: walletAddresses,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    const walletByAddress = new Map(
      wallets.map((wallet) => [normalizeEthereumAddress(wallet.walletAddress) || wallet.walletAddress, wallet])
    );

    return sharedUsers.map((entry) => {
      const normalizedEntryAddress = normalizeEthereumAddress(entry.address) || entry.address;
      const wallet = walletByAddress.get(normalizedEntryAddress);
      const mappedRole = entry.role === DocumentRole.EDITOR ? 'SHARED_WRITE' : 'SHARED_READ';

      return {
        id: `${documentId}:${wallet?.user.id || entry.address}`,
        documentId,
        userId: wallet?.user.id || entry.address,
        role: mappedRole,
        sharerWalletId: document.creatorWalletId,
        blockchainStatus: BlockchainStatus.SYNCED,
        createdAt: document.createdAt.toISOString(),
        user: wallet
          ? {
              username: wallet.user.username,
              fullName: wallet.user.fullName,
              email: wallet.user.email,
            }
          : {
              username: entry.address,
              fullName: null,
              email: '',
            },
      };
    });
  }

  /**
   * Get shares for a user (documents shared with them)
   */
  static async getSharedWithUser(userId: string): Promise<ShareInfo[]> {
    const eventEntries = await this.getConfirmedShareEntries(undefined, userId);

    if (eventEntries.length === 0) {
      return [];
    }

    const documents = await prisma.document.findMany({
      where: {
        id: {
          in: eventEntries.map((entry) => entry.documentId),
        },
      },
      select: {
        id: true,
        creatorWalletId: true,
      },
    });

    const documentById = new Map(documents.map((document) => [document.id, document]));

    const shares: ShareInfo[] = [];

    for (const entry of eventEntries) {
      const document = documentById.get(entry.documentId);
      if (!document) {
        continue;
      }

      shares.push({
        id: entry.shareId,
        documentId: entry.documentId,
        userId: entry.recipientId,
        role: entry.role,
        sharerWalletId: document.creatorWalletId,
        blockchainStatus: BlockchainStatus.SYNCED,
        createdAt: entry.createdAt.toISOString(),
      });
    }

    return shares;
  }

  /**
   * Revoke a share (prepare phase)
   * Returns the blockchainId so frontend can call removeAccess() on the smart contract
   */
  static async prepareRevokeShare(
    documentId: string,
    recipientUserId: string,
    ownerId: string,
    sharerWalletId: string
  ): Promise<PrepareRevokeShareResult> {
    const document = await prisma.document.findFirst({
      where: { id: documentId, ownerId },
    });

    if (!document) {
      throw new Error('Documento no encontrado o acceso denegado');
    }

    if (!document.blockchainId) {
      throw new Error('El documento no tiene ID de blockchain aún');
    }

    const sharerWallet = await prisma.wallet.findFirst({
      where: {
        id: sharerWalletId,
        userId: ownerId,
      },
    });

    if (!sharerWallet) {
      throw new Error('Wallet no encontrada o no pertenece al usuario');
    }

    const recipient = await prisma.user.findUnique({
      where: { id: recipientUserId },
      select: {
        id: true,
        wallets: {
          select: {
            walletAddress: true,
            isPrimary: true,
          },
        },
      },
    });

    if (!recipient) {
      throw new Error('Usuario destinatario no encontrado');
    }

    const recipientWallet = recipient.wallets.find((wallet) => wallet.isPrimary) || recipient.wallets[0];
    if (!recipientWallet?.walletAddress) {
      throw new Error('El destinatario no tiene wallet configurada');
    }

    const activeEventShare = (await this.getConfirmedShareEntries(documentId, recipientUserId))[0];
    const onChainUsers = await DocumentPermissionService.getDocumentUsersWithRoles(document.blockchainId);
    const hasOnChainAccess = onChainUsers.some(
      (entry) =>
        entry.address.toLowerCase() === recipientWallet.walletAddress.toLowerCase() &&
        entry.role !== DocumentRole.NONE &&
        entry.role !== DocumentRole.OWNER
    );

    if (!activeEventShare && !hasOnChainAccess) {
      throw new Error('El usuario no tiene acceso activo a este documento');
    }

    const shareId = activeEventShare?.shareId || `${documentId}:${recipientUserId}`;

    await prisma.event.create({
      data: {
        id: uuidv4(),
        eventType: 'SHARE_REVOKE_PREPARED',
        userId: ownerId,
        documentId: document.id,
        metadata: {
          shareId,
          recipientId: recipientUserId,
          recipientWalletAddress: recipientWallet.walletAddress,
        },
      },
    });

    logger.info(`[PREPARE_REVOKE] Documento ${documentId} listo para revocar acceso`);
    return {
      shareId,
      blockchainId: document.blockchainId,
      sharedWithAddress: recipientWallet.walletAddress,
    };
  }

  /**
   * Confirm share revocation
   */
  static async confirmRevokeShare(shareId: string, txHash: string): Promise<void> {
    const preparedEvents = await prisma.event.findMany({
      where: {
        eventType: 'SHARE_REVOKE_PREPARED',
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 100,
    });

    const preparedEvent = preparedEvents.find((event) => {
      const metadata = event.metadata as { shareId?: unknown } | null;
      return metadata?.shareId === shareId;
    });

    if (!preparedEvent?.documentId) {
      throw new Error('No se encontró la preparación de la revocación');
    }

    const metadata = (preparedEvent.metadata as {
      recipientId?: unknown;
    } | null) ?? null;
    const recipientId = typeof metadata?.recipientId === 'string' ? metadata.recipientId : null;

    const document = await prisma.document.findUnique({
      where: { id: preparedEvent.documentId },
      include: {
        owner: {
          select: {
            username: true,
          },
        },
      },
    });

    if (!document) {
      throw new Error('Documento no encontrado para confirmar la revocación');
    }

    if (recipientId) {
      await notificationService.createNotification({
        userId: recipientId,
        type: NotificationType.SHARE_REVOKED,
        title: 'Acceso revocado',
        message: `${document.owner.username} revocó tu acceso a "${document.name}"`,
        link: '/app/shared',
        data: {
          documentId: document.id,
          shareId,
          txHash,
        },
      });
    }

    await prisma.event.create({
      data: {
        id: uuidv4(),
        eventType: 'SHARE_REVOKED',
        userId: document.ownerId,
        documentId: document.id,
        transactionHash: txHash,
        metadata: {
          shareId,
          recipientId,
        },
      },
    });

    logger.info(`[CONFIRM_REVOKE] Share ${shareId} revocado con txHash: ${txHash}`);
  }

  /**
   * Mark share as failed
   */
  static async markShareFailed(shareId: string, error: string): Promise<void> {
    // DEPRECATED: documentShare ya no existe
    logger.warn('[DEPRECATED] markShareFailed - Los shares ya no existen en DB');
  }

  /**
   * Update share status to SYNCED
   */
  static async markShareSynced(shareId: string): Promise<void> {
    // DEPRECATED: documentShare ya no existe
    logger.warn('[DEPRECATED] markShareSynced - Los shares ya no existen en DB');
  }

  /**
   * Convert Prisma share to ShareInfo
   */
  private static toShareInfo(share: any): ShareInfo {
    return {
      id: share.id,
      documentId: share.documentId,
      userId: share.userId,
      role: share.role,
      sharerWalletId: share.sharerWalletId,
      blockchainStatus: share.blockchainStatus,
      createdAt: share.createdAt,
      user: share.user,
    };
  }
}

export default ShareService;
