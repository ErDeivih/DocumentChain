/**
 * Servicio de Línea Temporal de Documentos
 * Agrega eventos persistidos en base de datos para mostrar el historial completo
 */

import prisma from '../config/database';
import { BlockchainQueries } from '../lib/blockchain/queries';

/**
 * Evento individual dentro de la línea temporal de un documento.
 * @property id - Identificador del evento
 * @property type - Tipo de evento (versión, firma, compartición, etc.)
 * @property timestamp - Fecha y hora del evento
 * @property actor - Usuario o sistema que ejecutó la acción
 * @property details - Información adicional específica del evento
 * @property blockchainTx - Hash de la transacción en blockchain (opcional)
 */
export interface TimelineEvent {
  id: string;
  type: 'version_created' | 'document_signed' | 'document_shared' | 'permission_revoked' | 'ownership_transferred' | 'operational_changed';
  timestamp: Date;
  actor: {
    id: string;
    username: string;
    fullName: string | null;
    walletAddress?: string;
  };
  details: Record<string, any>;
  blockchainTx?: string;
}

/**
 * Línea temporal completa de un documento.
 * @property documentId - ID interno del documento
 * @property blockchainId - ID del documento en blockchain
 * @property events - Lista cronológica de eventos
 */
export interface DocumentTimeline {
  documentId: string;
  blockchainId: string;
  events: TimelineEvent[];
}

type TimelineActor = TimelineEvent['actor'];

type TimelineUser = {
  id: string;
  username: string;
  fullName: string | null;
};

type TimelineSignatureActor = {
  user?: TimelineUser | null;
  userId?: string | null;
  signerUsernameSnapshot?: string | null;
  signerFullNameSnapshot?: string | null;
  signerWalletAddressSnapshot?: string | null;
};

/**
 * Servicio de construcción de líneas temporales de documentos.
 * Agrega eventos persistidos en la base de datos y los presenta en orden cronológico.
 */
export class DocumentTimelineService {
  /**
   * Obtener la línea temporal completa de un documento
   */
  static async getDocumentTimeline(
    documentId: string,
    userId: string
  ): Promise<DocumentTimeline> {
    // Verificar acceso al documento
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      select: {
        id: true,
        blockchainId: true,
        ownerId: true
      }
    });

    if (!document) {
      throw new Error('Documento no encontrado');
    }

    // Verificar permiso de lectura usando blockchain
    const wallet = await prisma.wallet.findFirst({
      where: { userId, isPrimary: true }
    });

    if (!wallet) {
      throw new Error('Wallet primaria no encontrada');
    }

    // El propietario en base de datos siempre tiene acceso, independientemente del estado on-chain
    let canRead = document.ownerId === userId;

    // Si no es propietario en BD, verificar permisos on-chain
    if (!canRead && document.blockchainId && wallet) {
      canRead = await BlockchainQueries.isOwner(document.blockchainId, wallet.walletAddress) ||
                await BlockchainQueries.canRead(document.blockchainId, wallet.walletAddress);
    }

    if (!canRead) {
      throw new Error('No tienes permiso para ver este documento');
    }

    // Obtener eventos de diferentes fuentes (skip blockchain events if not yet on chain)
    const [versions, signatures, shares, events] = await Promise.all([
      this.getVersionEvents(documentId),
      this.getSignatureEvents(documentId),
      this.getShareEvents(documentId),
      this.getBlockchainEvents(documentId)
    ]);

    // Combinar y ordenar todos los eventos por timestamp
    const allEvents = [...versions, ...signatures, ...shares, ...events];
    allEvents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return {
      documentId: document.id,
      blockchainId: document.blockchainId || '',
      events: allEvents
    };
  }

  /**
   * Obtener eventos de versiones
   */
  private static async getVersionEvents(documentId: string): Promise<TimelineEvent[]> {
    const versions = await prisma.version.findMany({
      where: { documentId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true
          }
        }
      }
    });

    return versions.map((version) => ({
      id: `version-${version.id}`,
      type: 'version_created',
      timestamp: version.createdAt,
      actor: this.toActor(version.user),
      details: {
        versionNumber: version.versionNumber,
        comment: version.comment,
      },
      blockchainTx: version.blockchainTxHash || undefined,
    }));
  }

  /**
   * Obtener eventos de firmas
   */
  private static async getSignatureEvents(documentId: string): Promise<TimelineEvent[]> {
    const signatures = await prisma.documentSignature.findMany({
      where: { documentId },
      orderBy: { signedAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true
          }
        },
        signerWallet: {
          select: {
            walletAddress: true
          }
        },
        version: {
          select: {
            versionNumber: true,
          },
        }
      }
    });

    return signatures.map((signature) => ({
      id: `signature-${signature.id}`,
      type: 'document_signed',
      timestamp: signature.signedAt,
      actor: this.toSignatureActor({
        user: signature.user,
        userId: signature.userId,
        signerUsernameSnapshot: signature.signerUsernameSnapshot,
        signerFullNameSnapshot: signature.signerFullNameSnapshot,
        signerWalletAddressSnapshot: signature.signerWalletAddressSnapshot,
      }, signature.signerWallet?.walletAddress),
      details: {
        versionNumber: signature.version.versionNumber,
      },
      blockchainTx: signature.blockchainTxHash || undefined,
    }));
  }

  /**
   * Obtener eventos de comparticiones
   */
  private static async getShareEvents(documentId: string): Promise<TimelineEvent[]> {
    const shareEvents = await prisma.event.findMany({
      where: {
        documentId,
        eventType: {
          in: ['SHARE_CONFIRMED', 'SHARE_REVOKED'],
        },
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const recipientIds = [...new Set(
      shareEvents
        .map((event) => this.getStringMetadata(event.metadata, 'recipientId'))
        .filter((recipientId): recipientId is string => Boolean(recipientId))
    )];

    const recipients = recipientIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: recipientIds } },
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        })
      : [];

    const recipientsById = new Map(recipients.map((recipient) => [recipient.id, recipient]));

    return shareEvents.map((event) => {
      const recipientId = this.getStringMetadata(event.metadata, 'recipientId');
      const role = this.getStringMetadata(event.metadata, 'role');
      const recipient = recipientId ? recipientsById.get(recipientId) : undefined;

      return {
        id: `share-${event.id}`,
        type: event.eventType === 'SHARE_REVOKED' ? 'permission_revoked' : 'document_shared',
        timestamp: this.getEventTimestamp(event.createdAt, event.blockTimestamp),
        actor: this.toActor(event.user),
        details: {
          ...(event.eventType === 'SHARE_REVOKED'
            ? { revokedFrom: recipient?.fullName || recipient?.username || recipientId || 'usuario' }
            : {
                sharedWith: recipient?.fullName || recipient?.username || recipientId || 'usuario',
                role: role || 'SHARED_READ',
              }),
        },
        blockchainTx: event.transactionHash || undefined,
      };
    });
  }

  /**
   * Obtener eventos persistidos relacionados con blockchain
   */
  private static async getBlockchainEvents(documentId: string): Promise<TimelineEvent[]> {
    const events = await prisma.event.findMany({
      where: {
        documentId,
        eventType: {
          in: ['TRANSFER_CONFIRMED', 'DocumentTransferred', 'OperationalVersionChanged'],
        },
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const relatedUserIds = [...new Set(
      events.flatMap((event) => {
        const metadata = this.toMetadata(event.metadata);
        return [
          this.asString(metadata.previousOwner),
          this.asString(metadata.previousOwnerId),
          this.asString(metadata.newOwner),
          this.asString(metadata.newOwnerId),
        ].filter((userId): userId is string => Boolean(userId));
      })
    )];

    const relatedUsers = relatedUserIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: relatedUserIds } },
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        })
      : [];

    const usersById = new Map(relatedUsers.map((user) => [user.id, user]));

    return events.reduce<TimelineEvent[]>((accumulator, event) => {
      const metadata = this.toMetadata(event.metadata);
      const eventTimestamp = this.getEventTimestamp(event.createdAt, event.blockTimestamp);

      if (event.eventType === 'OperationalVersionChanged') {
        accumulator.push({
          id: `operational-${event.id}`,
          type: 'operational_changed' as const,
          timestamp: eventTimestamp,
          actor: this.toActor(event.user),
          details: {
            oldVersion: this.asNumber(metadata.oldVersion),
            newVersion: this.asNumber(metadata.newVersion),
          },
          blockchainTx: event.transactionHash || undefined,
        });

        return accumulator;
      }

      if (event.eventType === 'TRANSFER_CONFIRMED' || event.eventType === 'DocumentTransferred') {
        const previousOwnerId = this.asString(metadata.previousOwner) || this.asString(metadata.previousOwnerId);
        const newOwnerId = this.asString(metadata.newOwner) || this.asString(metadata.newOwnerId);
        const previousOwner = previousOwnerId ? usersById.get(previousOwnerId) : undefined;
        const newOwner = newOwnerId ? usersById.get(newOwnerId) : undefined;

        accumulator.push({
          id: `transfer-${event.id}`,
          type: 'ownership_transferred' as const,
          timestamp: eventTimestamp,
          actor: this.toActor(previousOwner || event.user),
          details: {
            fromOwner: previousOwner?.fullName || previousOwner?.username || previousOwnerId || 'propietario anterior',
            toOwner: newOwner?.fullName || newOwner?.username || newOwnerId || 'nuevo propietario',
          },
          blockchainTx: event.transactionHash || undefined,
        });

        return accumulator;
      }

      return accumulator;
    }, []);
  }

  private static toMetadata(metadata: unknown): Record<string, unknown> {
    if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
      return {};
    }

    return metadata as Record<string, unknown>;
  }

  private static asString(value: unknown): string | undefined {
    return typeof value === 'string' ? value : undefined;
  }

  private static asNumber(value: unknown): number | undefined {
    return typeof value === 'number' ? value : undefined;
  }

  private static getStringMetadata(metadata: unknown, key: string): string | undefined {
    return this.asString(this.toMetadata(metadata)[key]);
  }

  private static getEventTimestamp(createdAt: Date, blockTimestamp?: Date | null): Date {
    return blockTimestamp ?? createdAt;
  }

  private static toActor(user?: TimelineUser | null, walletAddress?: string): TimelineActor {
    if (!user) {
      return {
        id: 'system',
        username: 'system',
        fullName: 'Sistema',
        ...(walletAddress ? { walletAddress } : {}),
      };
    }

    return {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      ...(walletAddress ? { walletAddress } : {}),
    };
  }

  private static toSignatureActor(signature: TimelineSignatureActor, walletAddress?: string): TimelineActor {
    if (signature.user) {
      return this.toActor(signature.user, walletAddress || signature.signerWalletAddressSnapshot || undefined);
    }

    return {
      id: signature.userId || 'deleted-signer',
      username: signature.signerUsernameSnapshot || 'firmante',
      fullName: signature.signerFullNameSnapshot || 'Firmante histórico',
      ...(walletAddress || signature.signerWalletAddressSnapshot
        ? { walletAddress: walletAddress || signature.signerWalletAddressSnapshot || undefined }
        : {}),
    };
  }
}
