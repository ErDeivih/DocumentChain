/**
 * Servicio de comparticion de documentos.
 * 
 * Gestiona la comparticion y revocacion de acceso a documentos mediante
 * re-cifrado de claves simetricas.
 * 
 * Flujo de preparacion:
 * 1. prepareShare: 
 *    - El frontend descifra la clave simetrica localmente
 *    - El frontend re-cifra la clave con la clave publica del destinatario
 *    - El backend almacena la clave ya re-cifrada (sin re-cifrar del lado del servidor)
 *    - Registra evento SHARE_PREPARED para auditoria
 * 2. confirmShare: Valida on-chain y registra evento SHARE_CONFIRMED tras la firma blockchain
 * 
 * El backend:
 * - Re-cifra claves simetricas para usuarios compartidos
 * - Crea registros en blockchain
 * - NO gestiona contrasenas ni claves privadas
 * - NO firma transacciones blockchain (lo hace la wallet del usuario)
 * 
 * IMPORTANTE: Los permisos son responsabilidad EXCLUSIVA del contrato inteligente.
 * PostgreSQL NUNCA se usa como fuente de verdad para autorizacion.
 * La tabla Event se usa SOLO para logs de auditoria y visualizacion del timeline.
 */

import { v4 as uuidv4 } from 'uuid';
import prisma from '../config/database';
import { DocumentPermissionService, DocumentRole } from './documentPermissionService';
import logger from '../utils/logger';
import { NotFoundError, ValidationError } from '../utils/errors';
import { BlockchainCacheService } from './blockchainCacheService';
import { assertDocumentActive, assertDocument } from '../utils/blockchainGuard';
import notificationService, { NotificationType } from './notificationService';
import { normalizeEthereumAddress } from '../utils/ethereum';
import { normalizeFileExtensionFilter } from '../utils/fileValidation';
import { buildInsensitiveWalletFilter, validateWalletBelongsToUser } from '../utils/walletHelper';
import {
  assertDocumentSharedReceipt,
  assertPermissionRevokedReceipt,
} from './blockchainReceiptService';
import WebSocketService from './webSocketService';

// ============================================
// Tipos
// ============================================

/**
 * Informaci├│n de una compartici├│n de documento.
 * @property id - Identificador del share
 * @property documentId - ID del documento compartido
 * @property userId - ID del usuario destinatario
 * @property role - Rol asignado (lectura, escritura o propietario)
 * @property sharerWalletId - Wallet que realiz├│ la compartici├│n
 * @property createdAt - Fecha de creaci├│n en formato ISO
 * @property user - Datos b├ísicos del destinatario
 */
export interface ShareInfo {
  id: string;
  documentId: string;
  userId: string;
  role: 'SHARED_READ' | 'SHARED_WRITE' | 'OWNER';
  sharerWalletId: string | null;
  createdAt: string;
  user?: {
    username: string;
    fullName: string | null;
    email: string;
  };
}

/**
 * Datos de entrada para preparar una compartici├│n.
 * @property documentId - ID del documento a compartir
 * @property sharedWithUserId - ID del usuario destinatario
 * @property role - Rol a asignar
 * @property sharerUserId - ID del usuario que comparte
 * @property sharerWalletId - Wallet del usuario que comparte
 * @property reEncryptedSymmetricKey - Clave sim├®trica descifrada (Base64)
 * @property sharedToWalletAddress - Direcci├│n destino (opcional)
 */
export interface PrepareShareInput {
  documentId: string;
  sharedWithUserId: string;
  role: 'SHARED_READ' | 'SHARED_WRITE';
  sharerUserId: string;
  sharerWalletId: string;
  reEncryptedSymmetricKey: string;
  sharedToWalletAddress?: string;
}

/**
 * Resultado de la preparaci├│n de una compartici├│n.
 * @property blockchainId - ID del documento en blockchain
 * @property sharedWithAddress - Direcci├│n del destinatario
 * @property shareId - Identificador del share
 */
export interface PrepareShareResult {
  blockchainId: string;
  sharedWithAddress: string;
  shareId: string;
}

/**
 * Datos de entrada para confirmar una compartici├│n.
 * @property shareId - Identificador del share
 * @property txHash - Hash de la transacci├│n blockchain
 * @property documentId - ID del documento (opcional)
 * @property recipientId - ID del destinatario (opcional)
 * @property role - Rol confirmado (opcional)
 */
export interface ConfirmShareInput {
  shareId: string;
  txHash: string;
  documentId: string;
  recipientId?: string;
  role?: 'SHARED_READ' | 'SHARED_WRITE';
  skipOnChainValidation?: boolean;
}

/**
 * Resultado de la preparaci├│n de revocaci├│n de acceso.
 * @property blockchainId - ID del documento en blockchain
 * @property shareId - Identificador del share
 * @property sharedWithAddress - Direcci├│n del usuario afectado
 */
export interface PrepareRevokeShareResult {
  blockchainId: string;
  shareId: string;
  sharedWithAddress: string;
}

// ============================================
// Clase del Servicio de Comparticion
// ============================================

/**
 * Servicio de gestion de comparticiones de documentos.
 * Gestiona la comparticion y revocacion de acceso a documentos mediante
 * re-cifrado de claves simetricas. La autorizacion es responsabilidad
 * exclusiva del contrato inteligente.
 */
export class ShareService {
  /**
   * Prepara una comparticion para su creacion
   * - Validates ownership ON-CHAIN (sole source of truth)
   * - Almacena la clave ya re-cifrada por el frontend (sin re-cifrar server-side)
   * - Returns data needed for frontend to sign blockchain transaction
   *
   * @param input - Datos con documentId, destinatario, rol, wallet del sharer y clave descifrada
   * @returns Datos necesarios para la transacci├│n blockchain
   * @throws {NotFoundError} Si el documento, el destinatario o la wallet no existen
   * @throws {ValidationError} Si el documento no tiene blockchainId, est├í archivado/eliminado, o el destinatario no tiene wallet
   * @throws {Error} Si el usuario no es el propietario on-chain
   */
  static async prepareShare(input: PrepareShareInput): Promise<PrepareShareResult> {
    const {
      documentId,
      sharedWithUserId,
      role,
      sharerUserId,
      sharerWalletId,
      reEncryptedSymmetricKey,
      sharedToWalletAddress,
    } = input;

    // Bloquear auto-comparticion
    if (sharedWithUserId === sharerUserId) {
      throw new ValidationError('No puedes compartir un documento contigo mismo');
    }

    // 1. Buscar documento y validar blockchainId
    const document = await assertDocument(documentId);

    if (!document.blockchainId) {
      throw new ValidationError('El documento no tiene ID de blockchain a├║n');
    }

    await assertDocumentActive(document.blockchainId, 'compartir');

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

    // 4. Get recipient's info
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
      throw new NotFoundError('Usuario destinatario no encontrado');
    }

    // 5. Get recipient's wallet address (use provided or first wallet)
    const primaryRecipientWallet = recipient.wallets.find((wallet) => wallet.isPrimary) || recipient.wallets[0];
    const recipientWalletAddress = sharedToWalletAddress || primaryRecipientWallet?.walletAddress || null;

    if (!recipientWalletAddress) {
      throw new ValidationError('El destinatario no tiene wallet configurada');
    }

    // 6. Almacenar clave simetrica re-cifrada (el frontend ya la cifro con la clave publica del destinatario)'s public key)
    const reEncryptedKey = reEncryptedSymmetricKey;
    logger.info(`[PREPARE] Clave sim├®trica re-cifrada por frontend para usuario ${sharedWithUserId}`);

    // 7. Usar el blockchainId real del documento para la concesion de permisos on-chain
    const blockchainId = document.blockchainId;

    const share = { id: uuidv4() };

    // 8. Persistir la clave re-cifrada para el destinatario + registrar evento atomicamente
    await prisma.$transaction(async (tx) => {
      await tx.documentShareKey.upsert({
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

      await tx.event.create({
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
    });

    logger.info(`[PREPARE] Share preparado: ${share.id}`);

    return {
      blockchainId,
      sharedWithAddress: recipientWalletAddress,
      shareId: share.id,
    };
  }

  /**
    * Confirma una comparticion tras la transaccion blockchain
    * Registra el evento para trazabilidad y auditoria -- los permisos se gestionan exclusivamente en blockchain
   *
   * @param input - Datos con shareId, txHash, documentId y datos opcionales del destinatario y rol
   * @returns Informaci├│n del share confirmado
   * @throws {NotFoundError} Si el share o el documento no existen
   * @throws {Error} Si la compartici├│n no existe on-chain o faltan datos blockchain
   */
  static async confirmShare(input: ConfirmShareInput): Promise<ShareInfo> {
    const { shareId, txHash, documentId: inputDocumentId, recipientId: inputRecipientId, role: inputRole } = input;

    // Intentar recuperar metadatos del evento preparado por conveniencia,
    // pero NO depender de ellos para la autorizacion.
    let resolvedDocumentId = inputDocumentId || null;
    let resolvedRecipientId = inputRecipientId || null;
    let resolvedRole: 'SHARED_READ' | 'SHARED_WRITE' = inputRole || 'SHARED_READ';
    let preparedEventMetadata: {
      recipientId?: unknown;
      recipientWalletAddress?: unknown;
      role?: unknown;
      sharerWalletAddress?: unknown;
    } | null = null;

    const preparedEvent = await prisma.event.findFirst({
      where: {
        eventType: 'SHARE_PREPARED',
        documentId: input.documentId,
        metadata: { path: ['shareId'], equals: shareId },
      },
      orderBy: { createdAt: 'desc' },
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
      throw new NotFoundError('No se encontr├│ la preparaci├│n del share');
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
      throw new NotFoundError('Documento no encontrado para confirmar el share');
    }

    // Validar en la cadena que la comparticion realmente existe (el destinatario tiene acceso)
    if (!resolvedRecipientId) {
      throw new ValidationError('No se pudo resolver el ID del destinatario');
    }
    if (document.blockchainId && !input.skipOnChainValidation) {
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
          throw new Error('No se encontr├│ la wallet del propietario para validar el share');
        }

        try {
          await assertDocumentSharedReceipt({
            txHash,
            docId: document.blockchainId,
            fromAddress: ownerWalletAddress,
            toAddress: recipientWalletAddress,
            role: resolvedRole === 'SHARED_WRITE' ? DocumentRole.EDITOR : DocumentRole.VIEWER,
          });
        } catch (receiptError: any) {
          throw new ValidationError(
            receiptError?.message || 'La transacci├│n no contiene una compartici├│n v├ílida en blockchain'
          );
        }

        const onChainRole = await DocumentPermissionService.getUserRole(
          document.blockchainId,
          recipientWalletAddress
        );
        if (onChainRole === DocumentRole.NONE || onChainRole === DocumentRole.OWNER) {
          throw new Error('La compartici├│n no existe on-chain para el destinatario');
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
        message: `${document.owner.username} comparti├│ "${document.name}" contigo`,
        link: `/app/documents/${document.id}`,
        data: {
          documentId: document.id,
          shareId,
          txHash,
          role: resolvedRole,
        },
      });
    }

    // Solo registro de auditoria ÔÇö no se usa para autorizacion
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

    if (document?.blockchainId) BlockchainCacheService.invalidate(document.blockchainId);

    WebSocketService.sendToUser(resolvedRecipientId, 'document:updated', { type: 'SHARED', documentId: document.id });
    WebSocketService.sendToUser(document.ownerId, 'document:updated', { type: 'SHARED', documentId: document.id });

    return {
      id: shareId,
      documentId: document.id,
      userId: resolvedRecipientId || '',
      role: resolvedRole,
      sharerWalletId: document.creatorWalletId,
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Obtiene las comparticiones de un documento
    * Consulta exclusivamente el smart contract -- sin respaldo en eventos de PostgreSQL
   *
   * @param documentId - ID del documento
   * @param userId - ID del usuario solicitante
   * @returns Lista de comparticiones activas
   * @throws {NotFoundError} Si el documento no existe, la wallet no se encuentra, o el usuario no es propietario
   */
  static async getDocumentShares(documentId: string, userId: string): Promise<ShareInfo[]> {
    // Buscar documento
    const document = await assertDocument(documentId);

    if (!document.blockchainId) {
      return [];
    }

    // Validate ownership ON-CHAIN
    const userWallet = await prisma.wallet.findFirst({
      where: { userId },
    });

    if (!userWallet) {
      throw new NotFoundError('Wallet no encontrada');
    }

    const isOwnerOnChain = await DocumentPermissionService.isOwner(
      document.blockchainId,
      userWallet.walletAddress
    );

    // Si es propietario en BD pero no on-chain (documento no registrado en el contrato),
    // devolver lista vac├¡a en lugar de error
    if (!isOwnerOnChain) {
      if (document.ownerId === userId) {
        return [];
      }
      throw new NotFoundError('Documento no encontrado o acceso denegado');
    }

    // Consultar blockchain para obtener usuarios con acceso
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
    * Revoca una comparticion (fase de preparacion)
   * Devuelve el blockchainId para que el frontend pueda llamar a removeAccess() en el contrato inteligente
   *
   * @param documentId - ID del documento
   * @param recipientIdentifier - Direcci├│n del destinatario o userId
   * @param ownerId - ID del propietario
   * @param sharerWalletId - ID de la wallet del propietario
   * @returns Datos necesarios para la transacci├│n de revocaci├│n
   * @throws {NotFoundError} Si el documento o la wallet no existen
   * @throws {ValidationError} Si el documento no tiene blockchainId o el destinatario no tiene wallet
   * @throws {Error} Si el usuario no es propietario o el destinatario no tiene acceso activo
   */
  static async prepareRevokeShare(
    documentId: string,
    recipientIdentifier: string,
    ownerId: string,
    sharerWalletId: string
  ): Promise<PrepareRevokeShareResult> {
    const document = await assertDocument(documentId);

    if (!document.blockchainId) {
      throw new ValidationError('El documento no tiene ID de blockchain a├║n');
    }

    const sharerWallet = await prisma.wallet.findFirst({
      where: {
        id: sharerWalletId,
        userId: ownerId,
      },
    });

    if (!sharerWallet) {
      throw new NotFoundError('Wallet no encontrada o no pertenece al usuario');
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
      throw new ValidationError('El destinatario no tiene wallet configurada');
    }

    // Verificar que el usuario realmente tiene acceso on-chain
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
    * Confirma la revocacion de comparticion
   *
   * @param shareId - Identificador del share
   * @param txHash - Hash de la transacci├│n blockchain
   * @throws {NotFoundError} Si no se encuentra la preparaci├│n de la revocaci├│n o el documento
   * @throws {Error} Si faltan datos blockchain
   */
  static async confirmRevokeShare(shareId: string, txHash: string, skipOnChainValidation?: boolean): Promise<void> {
    const documentId = shareId.split(':')[0];
    const preparedEvent = await prisma.event.findFirst({
      where: {
        eventType: 'SHARE_REVOKE_PREPARED',
        documentId,
        metadata: { path: ['shareId'], equals: shareId },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!preparedEvent?.documentId) {
      throw new NotFoundError('No se encontr├│ la preparaci├│n de la revocaci├│n');
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
      throw new NotFoundError('Documento no encontrado para confirmar la revocaci├│n');
    }

    const recipientWalletAddress = typeof (preparedEvent.metadata as { recipientWalletAddress?: unknown } | null)?.recipientWalletAddress === 'string'
      ? String((preparedEvent.metadata as { recipientWalletAddress: string }).recipientWalletAddress)
      : null;

    if (!document.blockchainId || !recipientWalletAddress) {
      throw new Error('No se encontr├│ la informaci├│n blockchain de la revocaci├│n');
    }

    const ownerWallet = await prisma.wallet.findFirst({
      where: { userId: document.ownerId },
      orderBy: [{ isPrimary: 'desc' }, { addedAt: 'asc' }],
    });

    if (!skipOnChainValidation) {
      try {
        await assertPermissionRevokedReceipt({
          txHash,
          docId: document.blockchainId,
          userAddress: recipientWalletAddress,
          byAddress: ownerWallet?.walletAddress,
        });
      } catch (receiptError: any) {
        throw new ValidationError(
          receiptError?.message || 'La transacci├│n no contiene una revocaci├│n v├ílida en blockchain'
        );
      }
    }

    if (recipientId) {
      await notificationService.createNotification({
        userId: recipientId,
        type: NotificationType.SHARE_REVOKED,
        title: 'Acceso revocado',
        message: `${document.owner.username} revoc├│ tu acceso a "${document.name}"`,
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

    if (recipientId) {
      await prisma.documentShareKey.deleteMany({
        where: { documentId, userId: recipientId },
      });
    }

    logger.info(`[CONFIRM_REVOKE] Share ${shareId} revocado con txHash: ${txHash}`);

    if (document?.blockchainId) BlockchainCacheService.invalidate(document.blockchainId);

    if (recipientId) {
      WebSocketService.sendToUser(recipientId, 'document:updated', { type: 'SHARE_REVOKED', documentId: document.id });
    }
    if (document?.ownerId && document.ownerId !== recipientId) {
      WebSocketService.sendToUser(document.ownerId, 'document:updated', { type: 'SHARE_REVOKED', documentId: document.id });
    }
  }

  /**
   * Obtiene los documentos compartidos con el usuario de forma paginada.
   *
   * @param userId - ID del usuario
   * @param query - Par├ímetros de paginaci├│n, b├║squeda y filtrado
   * @param query.page - N├║mero de p├ígina
   * @param query.limit - Resultados por p├ígina
   * @param query.search - T├®rmino de b├║squeda por nombre (opcional)
   * @param query.fileType - Extensi├│n de archivo a filtrar (opcional)
   * @param query.sharedBy - Filtrar por nombre del propietario (opcional)
   * @returns Resultado paginado con documentos, total y n├║mero de p├íginas
   */
  static async getSharedWithMePaginated(userId: string, query: { page: number; limit: number; search?: string; fileType?: string; sharedBy?: string }): Promise<{ documents: any[]; total: number; page: number; totalPages: number }> {
    const { page, limit, search, fileType, sharedBy } = query;
    const normalizedFileType = normalizeFileExtensionFilter(fileType);

    const wallets = await prisma.wallet.findMany({
      where: { userId },
    });

    if (wallets.length === 0) {
      return { documents: [], total: 0, page, totalPages: 0 };
    }

    const blockchainIdSets = await Promise.all(
      wallets.map((wallet) => DocumentPermissionService.getUserDocuments(wallet.walletAddress))
    );
    const allBlockchainIds = Array.from(new Set(blockchainIdSets.flat()));

    if (allBlockchainIds.length === 0) {
      return { documents: [], total: 0, page, totalPages: 0 };
    }

    const whereClause: any = {
      blockchainId: { in: allBlockchainIds },
    };

    if (search) {
      whereClause.name = {
        contains: search,
        mode: 'insensitive',
      };
    }

    if (normalizedFileType) {
      whereClause.fileExtension = normalizedFileType;
    }

    if (sharedBy) {
      whereClause.owner = {
        username: sharedBy,
      };
    }

    const candidateDocuments = await prisma.document.findMany({
      where: whereClause,
      include: {
        owner: {
          select: {
            username: true,
            fullName: true,
            email: true,
          },
        },
        folder: true,
      },
      orderBy: {
        id: 'desc',
      },
    });

    const sharedDocuments: typeof candidateDocuments = [];
    const ownershipCache = new Map<string, boolean>();

    for (const document of candidateDocuments) {
      if (!document.blockchainId) {
        continue;
      }

      let isOwned = false;
      for (const wallet of wallets) {
        const cacheKey = `${document.blockchainId}:${wallet.walletAddress}`;
        let owned = ownershipCache.get(cacheKey);
        if (owned === undefined) {
          owned = await DocumentPermissionService.isOwner(document.blockchainId, wallet.walletAddress);
          ownershipCache.set(cacheKey, owned);
        }
        if (owned) {
          isOwned = true;
          break;
        }
      }

      if (!isOwned) {
        sharedDocuments.push(document);
      }
    }

    const total = sharedDocuments.length;
    const documents = sharedDocuments.slice((page - 1) * limit, page * limit);
    const totalPages = Math.ceil(total / limit);

    return { documents, total, page, totalPages };
  }

  /**
   * Obtiene el rol del usuario sobre un documento.
   * Realiza la consulta on-chain cuando existe un blockchainId.
   *
   * @param documentId - ID del documento
   * @param userId - ID del usuario
   * @returns Objeto con el documento y el rol (OWNER, SHARED_WRITE, SHARED_READ o null)
   */
  static async getMyRole(documentId: string, userId: string): Promise<{ document: { id: string; ownerId: string; blockchainId: string | null } | null; role: string | null }> {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      select: {
        id: true,
        ownerId: true,
        blockchainId: true,
      },
    });

    if (!document) {
      return { document: null, role: null };
    }

    const wallet = await prisma.wallet.findFirst({
      where: { userId, isPrimary: true },
    }) ?? await prisma.wallet.findFirst({ where: { userId } });

    if (document.blockchainId && wallet) {
      const isOwnerOnChain = await DocumentPermissionService.isOwner(document.blockchainId, wallet.walletAddress);
      if (isOwnerOnChain) {
        return { document, role: 'OWNER' };
      }

      const role = await DocumentPermissionService.getUserRole(document.blockchainId, wallet.walletAddress);

      if (role === DocumentRole.EDITOR) {
        return { document, role: 'SHARED_WRITE' };
      }

      if (role === DocumentRole.VIEWER) {
        return { document, role: 'SHARED_READ' };
      }

      return { document, role: null };
    }

    if (document.ownerId === userId) {
      return { document, role: 'OWNER' };
    }

    return { document, role: null };
  }

  /**
   * Verifica si el usuario tiene un permiso espec├¡fico sobre un documento.
   * Delega en getMyRole para evitar duplicaci├│n de l├│gica on-chain/off-chain.
   *
   * @param documentId - ID del documento
   * @param userId - ID del usuario
   * @param role - Rol a verificar (OWNER, SHARED_WRITE, SHARED_READ)
   * @returns Objeto con el documento y si tiene el permiso solicitado
   */
  static async checkPermission(documentId: string, userId: string, role: string): Promise<{ document: { ownerId: string; blockchainId: string | null } | null; hasPermission: boolean }> {
    const { document, role: userRole } = await this.getMyRole(documentId, userId);

    if (!document) {
      return { document: null, hasPermission: false };
    }

    const doc = { ownerId: document.ownerId, blockchainId: document.blockchainId };

    if (role === 'OWNER') {
      return { document: doc, hasPermission: userRole === 'OWNER' };
    }
    if (role === 'SHARED_WRITE') {
      return { document: doc, hasPermission: userRole === 'SHARED_WRITE' || userRole === 'OWNER' };
    }
    if (role === 'SHARED_READ') {
      return { document: doc, hasPermission: userRole !== null };
    }

    return { document: doc, hasPermission: false };
  }

  /**
   * Revierte una comparticion eliminando la DocumentShareKey de BD.
   * Se usa cuando la transaccion blockchain falla tras el prepare.
   * Busca el evento SHARE_PREPARED por metadata.shareId para recuperar
   * documentId y recipientId, ya que el shareId es un UUID.
   */
  static async rollbackRevoke(shareId: string): Promise<void> {
    try {
      // Buscar el evento preparado para recuperar documentId y recipientId
      const event = await prisma.event.findFirst({
        where: {
          eventType: 'SHARE_PREPARED',
          metadata: { path: ['shareId'], equals: shareId },
        },
        orderBy: { createdAt: 'desc' },
      });
      if (!event) return;

      const metadata = event.metadata as Record<string, unknown>;
      const documentId = event.documentId;
      const recipientId = metadata.recipientId as string;
      if (!documentId || !recipientId) return;

      await prisma.documentShareKey.deleteMany({
        where: { documentId, userId: recipientId },
      });
      logger.info(`[ROLLBACK] DocumentShareKey eliminada para share ${shareId}`);
    } catch {
      // Ignorar silenciosamente si ya fue eliminado
    }
  }

}

export default ShareService;
