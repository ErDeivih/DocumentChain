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
 * 
 * IMPORTANT: Permissions are the SOLE responsibility of the smart contract.
 * PostgreSQL is NEVER used as a source of truth for authorization.
 * The Event table is used ONLY for audit logs and timeline visualization.
 */

import { v4 as uuidv4 } from 'uuid';
import prisma from '../config/database';
import { DocumentPermissionService, DocumentRole } from './documentPermissionService';
import { BlockchainStatus } from '@prisma/client';
import logger from '../utils/logger';
import * as Encryption from '../lib/encryption';
import notificationService, { NotificationType } from './notificationService';
import { normalizeEthereumAddress } from '../utils/ethereum';
import { buildInsensitiveWalletFilter, validateWalletBelongsToUser, getUserWithPublicKey } from '../utils/walletHelper';
import {
  assertDocumentSharedReceipt,
  assertPermissionRevokedReceipt,
} from './blockchainReceiptService';

// ============================================
// Types
// ============================================

/**
 * Información de una compartición de documento.
 * @property id - Identificador del share
 * @property documentId - ID del documento compartido
 * @property userId - ID del usuario destinatario
 * @property role - Rol asignado (lectura, escritura o propietario)
 * @property sharerWalletId - Wallet que realizó la compartición
 * @property blockchainStatus - Estado de sincronización en blockchain
 * @property createdAt - Fecha de creación en formato ISO
 * @property user - Datos básicos del destinatario
 */
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
    avatarUrl: string | null;
  };
}

/**
 * Datos de entrada para preparar una compartición.
 * @property documentId - ID del documento a compartir
 * @property sharedWithUserId - ID del usuario destinatario
 * @property role - Rol a asignar
 * @property sharerUserId - ID del usuario que comparte
 * @property sharerWalletId - Wallet del usuario que comparte
 * @property decryptedSymmetricKey - Clave simétrica descifrada (Base64)
 * @property sharedToWalletAddress - Dirección destino (opcional)
 */
export interface PrepareShareInput {
  documentId: string;
  sharedWithUserId: string;
  role: 'SHARED_READ' | 'SHARED_WRITE';
  sharerUserId: string;
  sharerWalletId: string;
  decryptedSymmetricKey: string;  // Base64-encoded symmetric key (decrypted in frontend)
  sharedToWalletAddress?: string;
}

/**
 * Resultado de la preparación de una compartición.
 * @property blockchainId - ID del documento en blockchain
 * @property sharedWithAddress - Dirección del destinatario
 * @property shareId - Identificador del share
 */
export interface PrepareShareResult {
  blockchainId: string;
  sharedWithAddress: string;
  shareId: string;
}

/**
 * Datos de entrada para confirmar una compartición.
 * @property shareId - Identificador del share
 * @property txHash - Hash de la transacción blockchain
 * @property documentId - ID del documento (opcional)
 * @property recipientId - ID del destinatario (opcional)
 * @property role - Rol confirmado (opcional)
 */
export interface ConfirmShareInput {
  shareId: string;
  txHash: string;
  documentId?: string;
  recipientId?: string;
  role?: 'SHARED_READ' | 'SHARED_WRITE';
}

/**
 * Resultado de la preparación de revocación de acceso.
 * @property blockchainId - ID del documento en blockchain
 * @property shareId - Identificador del share
 * @property sharedWithAddress - Dirección del usuario afectado
 */
export interface PrepareRevokeShareResult {
  blockchainId: string;
  shareId: string;
  sharedWithAddress: string;
}

// ============================================
// Share Service Class
// ============================================

/**
 * Servicio de gestión de comparticiones de documentos.
 * Implementa el patrón prepare/confirm con re-encriptación de claves simétricas en backend.
 * La autorización es responsabilidad exclusiva del contrato inteligente.
 */
export class ShareService {
  /**
   * Prepare a share for creation
   * - Validates ownership ON-CHAIN (sole source of truth)
   * - Re-encrypts symmetric key with recipient's public key
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

    // 1. Find document and validate blockchainId
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new Error('Documento no encontrado');
    }

    if (!document.blockchainId) {
      throw new Error('El documento no tiene ID de blockchain aún');
    }

    // 2. Validate sharer's wallet
    const sharerWallet = await validateWalletBelongsToUser(sharerWalletId, sharerUserId);

    // 3. Validate ownership ON-CHAIN (sole source of truth)
    const isOwnerOnChain = await DocumentPermissionService.isOwner(
      document.blockchainId,
      sharerWallet.walletAddress
    );

    if (!isOwnerOnChain) {
      throw new Error('No eres el propietario del documento');
    }

    // 4. Get recipient's info including public key
    const { publicKey: recipientPublicKey } = await getUserWithPublicKey(sharedWithUserId);
    const recipient = await prisma.user.findUnique({
      where: { id: sharedWithUserId },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        wallets: true,
      },
    });

    if (!recipient) {
      throw new Error('Usuario destinatario no encontrado');
    }

    // 5. Get recipient's wallet address (use provided or first wallet)
    const primaryRecipientWallet = recipient.wallets.find((wallet) => wallet.isPrimary) || recipient.wallets[0];
    const recipientWalletAddress = sharedToWalletAddress || primaryRecipientWallet?.walletAddress || null;

    if (!recipientWalletAddress) {
      throw new Error('El destinatario no tiene wallet configurada');
    }

    // 6. Re-encrypt symmetric key with recipient's public key
    const reEncryptedKey = Encryption.encryptSymmetricKey(
      decryptedSymmetricKey,
      recipientPublicKey
    );
    logger.info(`[PREPARE] Clave simétrica re-encriptada para usuario ${sharedWithUserId}`);

    // 7. Use the real document blockchain ID for the on-chain permission grant
    const blockchainId = document.blockchainId;

    // 8. Persist the re-encrypted key for the recipient in DocumentShareKey
    await prisma.documentShareKey.upsert({
      where: {
        documentId_userId: {
          documentId,
          userId: sharedWithUserId,
        },
      },
      create: {
        documentId,
        userId: sharedWithUserId,
        encryptedSymmetricKey: reEncryptedKey,
      },
      update: {
        encryptedSymmetricKey: reEncryptedKey,
      },
    });

    const share = { id: uuidv4() };

    logger.info(`[PREPARE] Share preparado: ${share.id}`);

    // 9. Log the preparation (audit log only - not used for authorization)
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
          sharerWalletAddress: sharerWallet.walletAddress,
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
   * Logs the event for timeline/audit - permissions are managed exclusively on blockchain
   */
  static async confirmShare(input: ConfirmShareInput): Promise<ShareInfo> {
    const { shareId, txHash, documentId: inputDocumentId, recipientId: inputRecipientId, role: inputRole } = input;

    // Try to recover metadata from the prepared event for convenience,
    // but do NOT depend on it for authorization.
    let resolvedDocumentId = inputDocumentId || null;
    let resolvedRecipientId = inputRecipientId || null;
    let resolvedRole: 'SHARED_READ' | 'SHARED_WRITE' = inputRole || 'SHARED_READ';
    let preparedEventMetadata: {
      recipientId?: unknown;
      recipientWalletAddress?: unknown;
      role?: unknown;
      sharerWalletAddress?: unknown;
    } | null = null;

    const preparedEvents = await prisma.event.findMany({
      where: { eventType: 'SHARE_PREPARED' },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    const preparedEvent = preparedEvents.find((event) => {
      const metadata = event.metadata as { shareId?: unknown } | null;
      return metadata?.shareId === shareId;
    });

    if (preparedEvent?.metadata) {
      preparedEventMetadata = preparedEvent.metadata as unknown as typeof preparedEventMetadata;
    }

    if (!resolvedDocumentId || !resolvedRecipientId) {
      if (preparedEvent?.documentId) {
        resolvedDocumentId = resolvedDocumentId || preparedEvent.documentId;
        const metadata = (preparedEvent.metadata as {
          recipientId?: unknown;
          recipientWalletAddress?: unknown;
          role?: unknown;
          sharerWalletAddress?: unknown;
        } | null) ?? null;
        preparedEventMetadata = metadata;
        resolvedRecipientId = resolvedRecipientId || (typeof metadata?.recipientId === 'string' ? metadata.recipientId : null);
        resolvedRole = inputRole || (metadata?.role === 'SHARED_WRITE' ? 'SHARED_WRITE' : 'SHARED_READ');
      }
    }

    if (!resolvedDocumentId) {
      throw new Error('No se encontró la preparación del share');
    }

    const document = await prisma.document.findUnique({
      where: { id: resolvedDocumentId },
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

    // Validate on-chain that the share actually exists (recipient has access)
    if (document.blockchainId && resolvedRecipientId) {
        const recipient = await prisma.user.findUnique({
          where: { id: resolvedRecipientId },
          select: { wallets: { select: { walletAddress: true } } },
        });
      if (recipient?.wallets[0]) {
        const ownerWalletAddress = typeof preparedEventMetadata?.sharerWalletAddress === 'string'
          ? preparedEventMetadata.sharerWalletAddress
          : null;
        const recipientWalletAddress = typeof preparedEventMetadata?.recipientWalletAddress === 'string'
          ? preparedEventMetadata.recipientWalletAddress
          : recipient.wallets[0].walletAddress;

        if (!ownerWalletAddress) {
          throw new Error('No se encontró la wallet del propietario para validar el share');
        }

        await assertDocumentSharedReceipt({
          txHash,
          docId: document.blockchainId,
          fromAddress: ownerWalletAddress,
          toAddress: recipientWalletAddress,
          role: resolvedRole === 'SHARED_WRITE' ? DocumentRole.EDITOR : DocumentRole.VIEWER,
        });

        const onChainRole = await DocumentPermissionService.getUserRole(
          document.blockchainId,
          recipientWalletAddress
        );
        if (onChainRole === DocumentRole.NONE || onChainRole === DocumentRole.OWNER) {
          throw new Error('La compartición no existe on-chain para el destinatario');
        } else {
          resolvedRole = onChainRole === DocumentRole.EDITOR ? 'SHARED_WRITE' : 'SHARED_READ';
        }
      }
    }

    if (resolvedRecipientId) {
      await notificationService.createNotification({
        userId: resolvedRecipientId,
        type: NotificationType.FILE_SHARED,
        title: 'Documento compartido',
        message: `${document.owner.username} compartió "${document.name}" contigo`,
        link: `/app/documents/${document.id}`,
        data: {
          documentId: document.id,
          shareId,
          txHash,
          role: resolvedRole,
        },
      });
    }

    // Audit log only - not used for authorization
    await prisma.event.create({
      data: {
        id: uuidv4(),
        eventType: 'SHARE_CONFIRMED',
        userId: document.ownerId,
        documentId: document.id,
        transactionHash: txHash,
        metadata: {
          shareId,
          recipientId: resolvedRecipientId,
          role: resolvedRole,
        },
      },
    });

    logger.info(`[CONFIRM] Share ${shareId} confirmado con txHash: ${txHash}`);

    return {
      id: shareId,
      documentId: document.id,
      userId: resolvedRecipientId || '',
      role: resolvedRole,
      sharerWalletId: document.creatorWalletId,
      blockchainStatus: BlockchainStatus.SYNCED,
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Get shares for a document
   * Queries the smart contract exclusively - no fallback to PostgreSQL events
   */
  static async getDocumentShares(documentId: string, userId: string): Promise<ShareInfo[]> {
    // Find document
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new Error('Documento no encontrado');
    }

    if (!document.blockchainId) {
      return [];
    }

    // Validate ownership ON-CHAIN
    const userWallet = await prisma.wallet.findFirst({
      where: { userId },
    });

    if (!userWallet) {
      throw new Error('Wallet no encontrada');
    }

    const isOwnerOnChain = await DocumentPermissionService.isOwner(
      document.blockchainId,
      userWallet.walletAddress
    );

    // Si es propietario en BD pero no on-chain (documento no registrado en el contrato),
    // devolver lista vacía en lugar de error
    if (!isOwnerOnChain) {
      if (document.ownerId === userId) {
        return [];
      }
      throw new Error('Documento no encontrado o acceso denegado');
    }

    // Query blockchain for users with access
    const usersWithRoles = await DocumentPermissionService.getDocumentUsersWithRoles(document.blockchainId);
    const sharedUsers = usersWithRoles.filter(
      (entry) => entry.role !== DocumentRole.OWNER && entry.role !== DocumentRole.NONE
    );

    if (sharedUsers.length === 0) {
      return [];
    }

    const walletAddresses = sharedUsers
      .map((entry) => normalizeEthereumAddress(entry.address))
      .filter((address): address is string => Boolean(address));

    const wallets = await prisma.wallet.findMany({
      where: buildInsensitiveWalletFilter(walletAddresses),
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            email: true,
            avatarUrl: true,
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
              avatarUrl: wallet.user.avatarUrl ?? null,
            }
          : {
              username: entry.address,
              fullName: null,
              email: '',
              avatarUrl: null,
            },
      };
    });
  }

  /**
   * Get documents shared with a user
   * Queries the smart contract exclusively - no fallback to PostgreSQL events
   */
  static async getSharedWithUser(userId: string): Promise<ShareInfo[]> {
    // Get user's wallets
    const userWallets = await prisma.wallet.findMany({
      where: { userId },
      select: { walletAddress: true },
    });

    if (userWallets.length === 0) {
      return [];
    }

    // Collect all blockchain document IDs the user has access to
    const accessibleBlockchainIds = new Set<string>();
    for (const wallet of userWallets) {
      try {
        const docs = await DocumentPermissionService.getUserDocuments(wallet.walletAddress);
        docs.forEach((id) => accessibleBlockchainIds.add(id));
      } catch {
        // Continue with other wallets
      }
    }

    if (accessibleBlockchainIds.size === 0) {
      return [];
    }

    // Find documents in PostgreSQL by blockchainId
    const documents = await prisma.document.findMany({
      where: {
        blockchainId: { in: Array.from(accessibleBlockchainIds) },
      },
      select: {
        id: true,
        blockchainId: true,
        creatorWalletId: true,
        ownerId: true,
      },
    });

    // Filter out documents the user owns (only return shared ones)
    const ownedDocumentIds = new Set(
      documents.filter((d) => d.ownerId === userId).map((d) => d.id)
    );

    const shares: ShareInfo[] = [];

    for (const document of documents) {
      if (ownedDocumentIds.has(document.id)) {
        continue;
      }

      // Determine role for each wallet
      let role: 'SHARED_READ' | 'SHARED_WRITE' = 'SHARED_READ';
      for (const wallet of userWallets) {
        if (!document.blockchainId) continue;
        try {
          const userRole = await DocumentPermissionService.getUserRole(document.blockchainId, wallet.walletAddress);
          if (userRole === DocumentRole.EDITOR) {
            role = 'SHARED_WRITE';
            break;
          }
        } catch {
          // Continue
        }
      }

      shares.push({
        id: `${document.id}:${userId}`,
        documentId: document.id,
        userId,
        role,
        sharerWalletId: document.creatorWalletId,
        blockchainStatus: BlockchainStatus.SYNCED,
        createdAt: new Date().toISOString(),
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
    recipientIdentifier: string,
    ownerId: string,
    sharerWalletId: string
  ): Promise<PrepareRevokeShareResult> {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new Error('Documento no encontrado');
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

    // Validate ownership ON-CHAIN
    const isOwnerOnChain = await DocumentPermissionService.isOwner(
      document.blockchainId,
      sharerWallet.walletAddress
    );

    if (!isOwnerOnChain) {
      throw new Error('No eres el propietario del documento');
    }

    const normalizedRecipientAddress = normalizeEthereumAddress(recipientIdentifier);

    const recipientWalletRecord = normalizedRecipientAddress
      ? await prisma.wallet.findFirst({
          where: {
            walletAddress: {
              equals: normalizedRecipientAddress,
              mode: 'insensitive',
            },
          },
          select: {
            walletAddress: true,
            userId: true,
            isPrimary: true,
          },
        })
      : null;

    const resolvedRecipientId = recipientWalletRecord?.userId || (!normalizedRecipientAddress ? recipientIdentifier : null);

    const recipient = resolvedRecipientId
      ? await prisma.user.findUnique({
          where: { id: resolvedRecipientId },
          select: {
            id: true,
            wallets: {
              select: {
                walletAddress: true,
                isPrimary: true,
              },
            },
          },
        })
      : null;

    const recipientWallet = normalizedRecipientAddress
      ? {
          walletAddress: normalizedRecipientAddress,
          isPrimary: recipientWalletRecord?.isPrimary ?? true,
        }
      : recipient?.wallets.find((wallet) => wallet.isPrimary) || recipient?.wallets[0];

    if (!recipientWallet?.walletAddress) {
      throw new Error('El destinatario no tiene wallet configurada');
    }

    // Verify the user actually has on-chain access
    const onChainUsers = await DocumentPermissionService.getDocumentUsersWithRoles(document.blockchainId);
    const hasOnChainAccess = onChainUsers.some(
      (entry) =>
        entry.address.toLowerCase() === recipientWallet.walletAddress.toLowerCase() &&
        entry.role !== DocumentRole.NONE &&
        entry.role !== DocumentRole.OWNER
    );

    if (!hasOnChainAccess) {
      throw new Error('El usuario no tiene acceso activo a este documento');
    }

    const shareId = `${documentId}:${resolvedRecipientId || recipientWallet.walletAddress}`;

    // Audit log only
    await prisma.event.create({
      data: {
        id: uuidv4(),
        eventType: 'SHARE_REVOKE_PREPARED',
        userId: ownerId,
        documentId: document.id,
        metadata: {
          shareId,
          recipientId: resolvedRecipientId,
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

    const recipientWalletAddress = typeof (preparedEvent.metadata as { recipientWalletAddress?: unknown } | null)?.recipientWalletAddress === 'string'
      ? String((preparedEvent.metadata as { recipientWalletAddress: string }).recipientWalletAddress)
      : null;

    if (!document.blockchainId || !recipientWalletAddress) {
      throw new Error('No se encontró la información blockchain de la revocación');
    }

    const ownerWallet = await prisma.wallet.findFirst({
      where: { userId: document.ownerId },
      orderBy: [{ isPrimary: 'desc' }, { addedAt: 'asc' }],
    });

    await assertPermissionRevokedReceipt({
      txHash,
      docId: document.blockchainId,
      userAddress: recipientWalletAddress,
      byAddress: ownerWallet?.walletAddress,
    });

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

    // Audit log only
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

}

export default ShareService;
