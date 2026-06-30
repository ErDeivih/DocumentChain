import { getContracts, provider, documentRegistryInterface } from '../config/blockchain';
import prisma from '../config/database';
import { BlockchainQueries } from '../lib/blockchain/queries';

import logger from '../utils/logger';
import { NotFoundError, ServiceUnavailableError, ValidationError } from '../utils/errors';
import { ethers } from 'ethers';

/**
 * AuditService - Servicio de auditoría PÚBLICO (sin autenticación)
 * 
 * Permite a cualquiera verificar:
 * - Integridad de archivos
 * - Propiedad criptográfica
 * - Historial completo (audit trail)
 * - Transparencia total de metadata
 * 
 * ⚠️ IMPORTANTE: Este servicio NO requiere autenticación
 * para maximizar la transparencia y permitir auditorías externas.
 */

/**
 * Evento de auditoría extraído de blockchain o base de datos.
 * @property id - Identificador único del evento
 * @property eventType - Tipo de evento (ej. DocumentCreated)
 * @property blockchainId - ID del documento en blockchain
 * @property actor - Dirección o identificador del actor que generó el evento
 * @property timestamp - Fecha y hora del evento
 * @property blockNumber - Número de bloque en blockchain
 * @property transactionHash - Hash de la transacción
 * @property details - Metadatos adicionales del evento
 */
export interface AuditEvent {
  id: string;
  eventType: string;
  blockchainId: string;
  actor: string;
  timestamp: Date;
  blockNumber: number;
  transactionHash: string;
  details: Record<string, any>;
}

/**
 * Resultado de la verificación de integridad de un documento.
 * @property valid - Indica si el documento es íntegro
 * @property blockchainData - Estado del documento en blockchain
 * @property databaseData - Estado del documento en base de datos
 * @property match - Coincidencias entre blockchain y base de datos
 */
export interface IntegrityCheck {
  valid: boolean;
  blockchainData: {
    exists: boolean;
    owner: string;
    fileHash: string;
    isDeleted: boolean;
  };
  databaseData: {
    exists: boolean;
    name: string | null;
    contentHash: string | null;
  };
  match: {
    contentHash: boolean;
    owner: boolean;
  };
}

/**
 * Prueba criptográfica de propiedad de un documento.
 * @property isOwner - Indica si la wallet es propietaria
 * @property blockchainId - ID del documento en blockchain
 * @property walletAddress - Dirección de la wallet verificada
 * @property documentInfo - Información pública del documento
 */
export interface OwnershipProof {
  isOwner: boolean;
  blockchainId: string;
  walletAddress: string;
  documentInfo: {
    owner: string;
    fileHash: string;
    createdAt: string;
  };
}

/**
 * Metadatos públicos de un documento consultados desde blockchain.
 * @property blockchainId - ID del documento en blockchain
 * @property documentId - ID interno en base de datos
 * @property publicId - Identificador público opcional
 * @property visibility - Visibilidad del documento
 * @property fileHash - Hash del contenido del archivo
 * @property owner - Dirección del propietario
 * @property createdAt - Fecha de creación en blockchain
 * @property contentCid - CID de IPFS del contenido
 * @property fileSize - Tamaño del archivo en bytes
 * @property currentVersion - Versión operacional actual
 * @property lastUpdated - Fecha de última actualización
 */
export interface PublicDocumentMetadata {
  blockchainId: string;
  documentId?: string;
  publicId?: string | null;
  visibility?: string;
  fileHash: string;
  owner: string;
  createdAt: Date;
  contentCid: string;
  fileSize: number;
  currentVersion: number;
  lastUpdated: Date;
}

/**
 * Servicio de auditoría pública para verificación de integridad, propiedad y transparencia de documentos.
 * No requiere autenticación para maximizar la transparencia y permitir auditorías externas.
 */
export class AuditService {
  private static async getDocumentDatabaseContextByBlockchainId(blockchainId: string) {
    return prisma.document.findUnique({
      where: { blockchainId },
      include: {
        owner: {
          select: {
            wallets: {
              orderBy: {
                isPrimary: 'desc',
              },
              select: {
                walletAddress: true,
                isPrimary: true,
              },
            },
          },
        },
        versions: {
          orderBy: {
            versionNumber: 'desc',
          },
          take: 1,
          select: {
            ipfsCid: true,
            versionNumber: true,
          },
        },
      },
    });
  }

  private static resolveOwnerWalletAddress(wallets: Array<{ walletAddress: string; isPrimary: boolean }>): string {
    return wallets.find((wallet) => wallet.isPrimary)?.walletAddress || wallets[0]?.walletAddress || '';
  }

  private static buildAuditEvent(input: {
    id: string;
    blockchainId: string;
    eventType: string;
    actor?: string | null;
    timestamp: Date;
    blockNumber?: number | null;
    transactionHash?: string | null;
    details?: Record<string, any> | null;
  }): AuditEvent {
    return {
      id: input.id,
      blockchainId: input.blockchainId,
      eventType: input.eventType,
      actor: input.actor || '',
      timestamp: input.timestamp,
      blockNumber: input.blockNumber ?? 0,
      transactionHash: input.transactionHash || '',
      details: input.details || {},
    };
  }

  private static normalizeDatabaseEventType(eventType: string, metadata: Record<string, any>): string {
    switch (eventType) {
      case 'DOCUMENT_CREATED':
        return 'DocumentCreated';
      case 'DOCUMENT_VERSION_CREATED':
      case 'VERSION_CREATED':
        return 'DocumentVersioned';
      case 'SHARE_CONFIRMED':
        return 'DocumentShared';
      case 'DOCUMENT_ARCHIVED':
        return metadata.archived === false ? 'DocumentUnarchived' : 'DocumentArchived';
      case 'DOCUMENT_DELETED':
        return 'DocumentDeleted';
      case 'TRANSFER_CONFIRMED':
        return 'DocumentTransferred';
      default:
        return eventType;
    }
  }

  private static resolveDatabaseEventActor(metadata: Record<string, any>): string {
    const candidateKeys = [
      'owner',
      'createdBy',
      'by',
      'from',
      'signerWallet',
      'newOwnerAddress',
      'recipientWalletAddress',
      'recipient',
      'to',
    ];

    for (const key of candidateKeys) {
      const value = metadata[key];
      if (typeof value === 'string' && value.trim().length > 0) {
        return value;
      }
    }

    return '';
  }

  private static async getPersistedAuditTrail(blockchainId: string): Promise<AuditEvent[]> {
    const document = await prisma.document.findUnique({
      where: { blockchainId },
      select: { id: true },
    });

    if (!document) {
      return [];
    }

    const persistedEvents = await prisma.event.findMany({
      where: {
        documentId: document.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        eventType: true,
        metadata: true,
        transactionHash: true,
        blockNumber: true,
        blockTimestamp: true,
        createdAt: true,
      },
    });

    return persistedEvents.map((event) => {
      const metadata = (event.metadata as Record<string, any> | null) || {};

      return this.buildAuditEvent({
        id: event.id,
        blockchainId,
        eventType: this.normalizeDatabaseEventType(event.eventType, metadata),
        actor: this.resolveDatabaseEventActor(metadata),
        timestamp: event.blockTimestamp || event.createdAt,
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        details: metadata,
      });
    });
  }

  /**
   * Obtener historial completo de auditoría de un documento
   * Consulta TODOS los eventos de blockchain relacionados con el documento
   * 
   * @param blockchainId - ID del documento en blockchain (bytes32)
   * @returns Array de eventos cronológicos
   */
  static async getFileAuditTrail(blockchainId: string): Promise<AuditEvent[]> {
    try {
      const contracts = getContracts();
      const events: AuditEvent[] = [];

      const queryAndPush = async (
        filterFn: () => any,
        eventType: string,
        idSuffix: string,
        actorKey: string,
        detailsMap: (args: any) => Record<string, any>
      ) => {
        try {
          const rawEvents = await contracts.documentRegistry.queryFilter(filterFn());
          for (const event of rawEvents) {
            const block = await event.getBlock();
            if (!('args' in event)) continue;
            events.push(this.buildAuditEvent({
              id: `${event.transactionHash}:${idSuffix}`,
              blockchainId,
              eventType,
              actor: event.args?.[actorKey],
              timestamp: new Date(block.timestamp * 1000),
              blockNumber: event.blockNumber,
              transactionHash: event.transactionHash,
              details: detailsMap(event.args),
            }));
          }
        } catch (error) {
          logger.warn(`No se pudieron obtener eventos ${eventType}`);
        }
      };

      // 1. DocumentCreated
      await queryAndPush(
        () => contracts.documentRegistry.filters.DocumentCreated(blockchainId),
        'DocumentCreated', 'DocumentCreated', 'owner',
        (args) => ({ docId: args?.docId, owner: args?.owner, ipfsCid: args?.ipfsCid, currentVersion: args?.currentVersion?.toString() })
      );

      // 2. DocumentShared
      await queryAndPush(
        () => contracts.documentRegistry.filters.DocumentShared(blockchainId),
        'DocumentShared', 'DocumentShared', 'from',
        (args) => ({ docId: args?.docId, from: args?.from, to: args?.to })
      );

      // 3. DocumentArchived
      await queryAndPush(
        () => contracts.documentRegistry.filters.DocumentArchived(blockchainId),
        'DocumentArchived', 'DocumentArchived', 'by',
        (args) => ({ docId: args?.docId, by: args?.by, archived: Boolean(args?.archived) })
      );
      // Nota: los eventos de archivado tambien emiten desarchivado — capturado mediante el booleano archived

      // 4. DocumentDeleted
      await queryAndPush(
        () => contracts.documentRegistry.filters.DocumentDeleted(blockchainId),
        'DocumentDeleted', 'DocumentDeleted', 'by',
        (args) => ({ docId: args?.docId, by: args?.by })
      );

      // 5. OwnershipTransferred
      await queryAndPush(
        () => contracts.documentRegistry.filters['OwnershipTransferred(bytes32,address,address,uint256)'](blockchainId),
        'DocumentTransferred', 'DocumentTransferred', 'from',
        (args) => ({ docId: args?.docId, from: args?.from, to: args?.to })
      );

      // 6. VersionCreated
      await queryAndPush(
        () => contracts.documentRegistry.filters.VersionCreated(blockchainId),
        'DocumentVersioned', 'DocumentVersioned', 'createdBy',
        (args) => ({ docId: args?.docId, versionNumber: args?.versionNumber?.toString(), ipfsCid: args?.ipfsCid, createdBy: args?.createdBy })
      );

      // 7. PermissionRevoked
      await queryAndPush(
        () => contracts.documentRegistry.filters.PermissionRevoked(blockchainId),
        'PermissionRevoked', 'PermissionRevoked', 'by',
        (args) => ({ docId: args?.docId, owner: args?.by, recipient: args?.user })
      );

      const persistedEvents = await this.getPersistedAuditTrail(blockchainId);
      const mergedEvents = [...events];
      const seenIds = new Set(mergedEvents.map((event) => event.id));

      for (const persistedEvent of persistedEvents) {
        if (!seenIds.has(persistedEvent.id)) {
          mergedEvents.push(persistedEvent);
        }
      }

      mergedEvents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      logger.info(`Obtenidos ${mergedEvents.length} eventos de auditoría para documento ${blockchainId}`);
      return mergedEvents;

    } catch (error) {
      logger.error('Error al obtener historial de auditoría:', error);
      throw new ServiceUnavailableError(`Error al recuperar historial de auditoría: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Verificar integridad de un documento
   * Compara datos de blockchain (fuente de verdad) vs base de datos (cache)
   * 
   * @param fileId - ID del documento en base de datos
   * @returns Resultado de verificación de integridad
   */
  static async verifyFileIntegrity(fileId: string): Promise<IntegrityCheck> {
    try {
      // 1. Obtener documento de BD
      const dbDocument = await prisma.document.findUnique({
        where: { id: fileId },
        include: {
          owner: {
            select: {
              wallets: {
                select: { walletAddress: true }
              }
            }
          }
        }
      });

      if (!dbDocument) {
        throw new NotFoundError(`Documento ${fileId} no encontrado en base de datos`);
      }

      if (!dbDocument.blockchainId) {
        throw new ValidationError(`Documento ${fileId} no tiene blockchainId asociado`);
      }

      let blockchainDoc: {
        owner: string;
        docId: string;
        isDeleted: boolean;
        latestVersion: bigint;
      } | null = null;

      try {
        const contracts = getContracts();
        const chainDoc = await contracts.documentRegistry.getDocument(dbDocument.blockchainId);

        if (chainDoc.owner !== ethers.ZeroAddress) {
          blockchainDoc = {
            owner: chainDoc.owner,
            docId: chainDoc.docId,
            isDeleted: chainDoc.isDeleted,
            latestVersion: chainDoc.latestVersion,
          };
        }
      } catch (error) {
        logger.warn('Fallo al obtener documento on-chain para integridad, usando fallback de BD', {
          fileId,
          blockchainId: dbDocument.blockchainId,
          error: error instanceof Error ? error.message : 'Error desconocido',
        });
      }

      const versionNumber = blockchainDoc ? Number(blockchainDoc.latestVersion) : 1;
      const operationalVersion = await prisma.version.findFirst({
        where: { documentId: dbDocument.id, versionNumber },
        select: { ipfsCid: true, contentHash: true },
      });
      // Comparar contentHash on-chain (VersionCreated event) contra BD
      let hashMatch = false;
      if (operationalVersion?.contentHash && dbDocument.blockchainId) {
        try {
          const chainContracts = getContracts();
          const chainVersion = await chainContracts.documentRegistry.getVersion(dbDocument.blockchainId, versionNumber);
          hashMatch = chainVersion.contentHash === operationalVersion.contentHash;
        } catch {
          // Fallback seguro: si no se puede verificar on-chain, asumir no coincidente
          hashMatch = false;
        }
      } else {
        hashMatch = false;
      }

      const ownerWallets = dbDocument.owner.wallets
        .map((wallet) => wallet.walletAddress)
        .filter(Boolean);
      const blockchainOwner = blockchainDoc?.owner || ownerWallets[0] || '';
      const ownerMatch = ownerWallets.length === 0
        ? false
        : ownerWallets.some((walletAddress) => walletAddress.toLowerCase() === blockchainOwner.toLowerCase());

      return {
        valid: hashMatch && ownerMatch,
        blockchainData: {
          exists: Boolean(dbDocument.blockchainId),
          owner: blockchainOwner,
          fileHash: dbDocument.contentHash || '',
          isDeleted: blockchainDoc?.isDeleted ?? false,
        },
        databaseData: {
          exists: true,
          name: dbDocument.name,
          contentHash: dbDocument.contentHash,
        },
        match: {
          contentHash: hashMatch,
          owner: ownerMatch,
        },
      };

    } catch (error) {
      // Re-lanzar errores conocidos sin envolver (NotFoundError → 404, ValidationError → 400)
      if (error instanceof NotFoundError || error instanceof ValidationError) {
        throw error;
      }
      logger.error('Error al verificar integridad del archivo:', error);
      throw new ServiceUnavailableError(`Error al verificar integridad: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Verificar propiedad de un documento
   * Proporciona prueba criptográfica de que una wallet es dueña de un documento
   * 
   * @param blockchainId - ID del documento en blockchain
   * @param walletAddress - Dirección de wallet que afirma ser dueña
   * @returns Prueba de propiedad
   */
  static async verifyOwnership(
    blockchainId: string,
    walletAddress: string
  ): Promise<OwnershipProof> {
    try {
      const normalizedWalletAddress = walletAddress.toLowerCase();

      try {
        const blockchainDoc = await BlockchainQueries.getDocument(blockchainId);
        const isOwner = blockchainDoc.owner.toLowerCase() === normalizedWalletAddress;

        const dbDoc = await this.getDocumentDatabaseContextByBlockchainId(blockchainId).catch(() => null);

        return {
          isOwner,
          blockchainId,
          walletAddress,
          documentInfo: {
            owner: blockchainDoc.owner,
            fileHash: dbDoc?.contentHash || '',
            createdAt: dbDoc?.createdAt?.toISOString() || blockchainDoc.createdAt.toISOString(),
          },
        };
      } catch (error) {
        logger.warn('Fallo al obtener propietario on-chain, intentando isOwner() como rescate', {
          blockchainId,
          walletAddress,
          error: error instanceof Error ? error.message : 'Error desconocido',
        });

        try {
          const isOwner = await BlockchainQueries.isOwner(blockchainId, walletAddress);
          if (isOwner) {
            const dbDoc = await this.getDocumentDatabaseContextByBlockchainId(blockchainId).catch(() => null);
            return {
              isOwner: true,
              blockchainId,
              walletAddress,
              documentInfo: {
                owner: walletAddress,
                fileHash: dbDoc?.contentHash || '',
                createdAt: dbDoc?.createdAt?.toISOString() || '',
              },
            };
          }
        } catch (rescueError) {
          logger.warn('Fallo adicional al verificar propiedad on-chain, usando fallback de BD', {
            blockchainId,
            walletAddress,
            error: rescueError instanceof Error ? rescueError.message : 'Error desconocido',
          });
        }

        const dbDoc = await this.getDocumentDatabaseContextByBlockchainId(blockchainId);

        if (!dbDoc) {
          throw new NotFoundError(`Documento ${blockchainId} no encontrado`);
        }

        const actualOwner = this.resolveOwnerWalletAddress(dbDoc.owner.wallets);
        const isOwner = actualOwner.toLowerCase() === normalizedWalletAddress;

        return {
          isOwner,
          blockchainId,
          walletAddress,
          documentInfo: {
            owner: actualOwner,
            fileHash: dbDoc.contentHash,
            createdAt: dbDoc.createdAt.toISOString(),
          },
        };
      }
    } catch (error) {
      logger.error('Error al verificar propiedad:', error);
      throw new ServiceUnavailableError(`Error al verificar propiedad: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Obtener metadata PÚBLICA de un documento
   * No requiere autenticación - cualquiera puede ver metadata almacenada en blockchain
   * 
   * @param blockchainId - ID del documento en blockchain
   * @returns Metadata pública del documento
   */
  static async getPublicMetadata(blockchainId: string): Promise<PublicDocumentMetadata> {
    try {
      try {
        const contracts = getContracts();
        const doc = await contracts.documentRegistry.getDocument(blockchainId);

        if (doc.owner === ethers.ZeroAddress) {
          throw new NotFoundError(`Documento ${blockchainId} no encontrado en blockchain`);
        }

        const currentVersion = Number(doc.currentVersion);
        const version = await contracts.documentRegistry.getVersion(blockchainId, currentVersion);

        // Buscar en BD para obtener IDs internos
        const dbDoc = await this.getDocumentDatabaseContextByBlockchainId(blockchainId).catch(() => null);

        return {
          blockchainId,
          documentId: dbDoc?.id,
          publicId: dbDoc?.publicId,
          visibility: dbDoc?.visibility,
          fileHash: dbDoc?.contentHash || '',
          owner: doc.owner,
          createdAt: new Date(Number(doc.createdAt) * 1000),
          contentCid: version.ipfsCid,
          fileSize: Number(dbDoc?.size) || 0,
          currentVersion,
          lastUpdated: new Date(Number(doc.updatedAt) * 1000)
        };
      } catch (error) {
        logger.warn('Fallo al obtener metadata on-chain, usando fallback de BD', {
          blockchainId,
          error: error instanceof Error ? error.message : 'Error desconocido',
        });

        const dbDoc = await this.getDocumentDatabaseContextByBlockchainId(blockchainId);

        if (!dbDoc) {
          throw error;
        }

        const owner = this.resolveOwnerWalletAddress(dbDoc.owner.wallets);
        const operationalVersion = dbDoc.versions[0];

        return {
          blockchainId,
          documentId: dbDoc.id,
          publicId: dbDoc.publicId,
          visibility: dbDoc.visibility,
          fileHash: dbDoc.contentHash,
          owner,
          createdAt: dbDoc.createdAt,
          contentCid: operationalVersion?.ipfsCid || '',
          fileSize: Number(dbDoc.size),
          currentVersion: operationalVersion?.versionNumber || 1,
          lastUpdated: dbDoc.updatedAt,
        };
      }

    } catch (error) {
      logger.error('Error al obtener metadatos públicos:', error);
      throw new ServiceUnavailableError(`Error al obtener metadatos públicos: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Obtener estadísticas públicas de documentos
   * Útil para dashboards públicos y análisis de transparencia
   * 
   * @returns Estadísticas agregadas
   */
  static async getPublicStats(): Promise<{
    totalDocuments: number;
    totalSignatures: number;
    totalVersions: number;
    activeUsers: number;
  }> {
    try {
      const [
        totalDocuments,
        totalVersions,
        totalSignatures,
        activeUsers,
      ] = await Promise.all([
        prisma.document.count(),
        prisma.version.count(),
        prisma.documentSignature.count(),
        prisma.user.count(),
      ]);

      return {
        totalDocuments,
        totalVersions,
        totalSignatures,
        activeUsers,
      };

    } catch (error) {
      logger.error('Error al obtener estadísticas públicas:', error);
      throw new ServiceUnavailableError(`Error al obtener estadísticas públicas: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Consultar eventos de blockchain con filtros avanzados
   * Permite auditoría completa del sistema
   * 
   * @param filters - Filtros de búsqueda
   * @returns Lista de eventos filtrados
   */
  static async queryBlockchainEvents(filters: {
    eventTypes?: string[];
    userId?: string;
    walletAddress?: string;
    documentId?: string;
    txHash?: string;
    fromBlock?: number;
    toBlock?: number;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<{
    events: any[];
    total: number;
    hasMore: boolean;
  }> {
    try {
      const {
        eventTypes,
        userId,
        walletAddress,
        documentId,
        txHash,
        fromBlock,
        toBlock,
        startDate,
        endDate,
        limit = 50,
        offset = 0
      } = filters;

      if (fromBlock !== undefined && toBlock !== undefined && fromBlock >= toBlock) {
        throw new ValidationError('fromBlock debe ser < toBlock');
      }

      if (limit > 1000) {
        throw new ValidationError('limit debe ser <= 1000');
      }

      // Construir query de Prisma
      const where: any = {};

      if (eventTypes && eventTypes.length > 0) {
        where.eventType = { in: eventTypes };
      } else {
        // Mostrar solo eventos de blockchain (excluir eventos internos de BD)
        where.eventType = {
          in: [
            'DocumentCreated', 'VersionCreated', 'VersionRestored',
            'DocumentShared', 'PermissionRevoked',
            'DocumentSigned', 'DocumentDeleted',
            'DocumentArchived', 'DocumentUnarchived',
            'OwnershipTransferred', 'OperationalVersionChanged',
            'DocumentTransferred', 'AdminRoleGranted', 'AdminRoleRevoked',
          ]
        };
      }

      if (userId) {
        where.userId = userId;
      }

      if (documentId) {
        where.documentId = documentId;
      }

      if (txHash) {
        where.transactionHash = txHash;
      }

      if (fromBlock !== undefined || toBlock !== undefined) {
        where.blockNumber = {};
        if (fromBlock !== undefined) where.blockNumber.gte = fromBlock;
        if (toBlock !== undefined) where.blockNumber.lte = toBlock;
      }

      if (startDate || endDate) {
        where.blockTimestamp = {};
        if (startDate) where.blockTimestamp.gte = startDate;
        if (endDate) where.blockTimestamp.lte = endDate;
      }

      // Si se proporciona walletAddress, buscar en metadata
      if (walletAddress) {
        where.OR = [
          { metadata: { path: ['pausedBy'], equals: walletAddress } },
          { metadata: { path: ['unpausedBy'], equals: walletAddress } },
          { metadata: { path: ['admin'], equals: walletAddress } },
          { metadata: { path: ['grantedBy'], equals: walletAddress } },
          { metadata: { path: ['revokedBy'], equals: walletAddress } },
          { metadata: { path: ['by'], equals: walletAddress } },
          { metadata: { path: ['from'], equals: walletAddress } },
          { metadata: { path: ['to'], equals: walletAddress } },
        ];
      }

      // Contar total de eventos que coinciden
      const total = await prisma.event.count({ where });

      // Consultar eventos con paginación
      const events = await prisma.event.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          document: {
            select: {
              id: true,
              name: true,
              blockchainId: true,
              owner: {
                select: {
                  id: true,
                  username: true,
                },
              },
            },
          },
        },
        orderBy: {
          blockTimestamp: 'desc',
        },
        skip: offset,
        take: limit,
      });

      return {
        events,
        total,
        hasMore: offset + events.length < total,
      };

    } catch (error) {
      logger.error('Error al consultar eventos blockchain:', error);
      throw new ServiceUnavailableError(`Error al consultar eventos: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Obtiene los detalles de una transaccion por su hash.
   * Decodifica los logs de eventos del contrato DocumentRegistry
   * y los enriquece con metadatos de documentos desde la base de datos.
   * @param txHash - Hash de la transaccion en blockchain
   * @returns Datos de la transaccion y eventos decodificados con metadata de documentos
   */
  static async getTransactionDetails(txHash: string): Promise<{
    transaction: {
      hash: string;
      from: string;
      to: string | null;
      value: string;
      gasPrice: string | null;
      gasUsed: string | null;
      status: number | null;
      blockNumber: number | null;
      timestamp: Date | null;
    };
    events: Array<{
      name: string;
      args: Record<string, any>;
      blockchainId: string;
      document?: {
        id: string;
        name: string;
        publicId: string | null;
        visibility: string;
        ownerUsername: string;
      } | null;
    }>;
  }> {
    try {
      const [tx, receipt] = await Promise.all([
        provider.getTransaction(txHash),
        provider.getTransactionReceipt(txHash),
      ]);

      if (!tx) {
        throw new NotFoundError('Transacción no encontrada');
      }

      let timestamp: Date | null = null;
      if (receipt?.blockNumber) {
        try {
          const block = await provider.getBlock(receipt.blockNumber);
          if (block?.timestamp) {
            timestamp = new Date(Number(block.timestamp) * 1000);
          }
        } catch (error) {
          logger.debug(`[auditService] Error al obtener timestamp del bloque: ${error instanceof Error ? error.message : String(error)}`);
        }
      }

      const decodedEvents: Array<{
        name: string;
        args: Record<string, any>;
        blockchainId: string;
        document?: any;
      }> = [];

      if (receipt?.logs) {
        const parsedLogs: Array<{
          name: string;
          args: Record<string, any>;
          blockchainId: string;
        }> = [];

        for (const log of receipt.logs) {
          try {
            const parsed = documentRegistryInterface.parseLog({
              topics: log.topics as string[],
              data: log.data,
            });

            if (parsed) {
              const args: Record<string, any> = {};
              parsed.fragment.inputs.forEach((input, idx) => {
                const val = parsed.args[idx];
                args[input.name] = ethers.isAddress(val)
                  ? val
                  : typeof val === 'bigint'
                    ? val.toString()
                    : val;
              });

              const blockchainId = args.docId || args._docId || '';
              parsedLogs.push({ name: parsed.name, args, blockchainId });
            }
          } catch (error) {
            logger.debug(`[auditService] Log no es un evento de DocumentRegistry: ${error instanceof Error ? error.message : String(error)}`);
          }
        }

        const blockchainIds = [...new Set(parsedLogs.map(p => p.blockchainId).filter(Boolean))];
        const dbDocs = blockchainIds.length > 0
          ? await prisma.document.findMany({
              where: { blockchainId: { in: blockchainIds } },
              select: {
                id: true,
                name: true,
                publicId: true,
                visibility: true,
                blockchainId: true,
                owner: { select: { username: true } },
              },
            })
          : [];

        const docMap = new Map(dbDocs.map(d => [d.blockchainId, d]));

        for (const parsedLog of parsedLogs) {
          let document = null;
          if (parsedLog.blockchainId) {
            const dbDoc = docMap.get(parsedLog.blockchainId);
            if (dbDoc) {
              document = {
                id: dbDoc.id,
                name: dbDoc.name,
                publicId: dbDoc.publicId,
                visibility: dbDoc.visibility,
                ownerUsername: dbDoc.owner.username,
              };
            }
          }

          decodedEvents.push({
            name: parsedLog.name,
            args: parsedLog.args,
            blockchainId: parsedLog.blockchainId,
            document,
          });
        }
      }

      return {
        transaction: {
          hash: tx.hash,
          from: tx.from,
          to: tx.to,
          value: tx.value.toString(),
          gasPrice: tx.gasPrice?.toString() || null,
          gasUsed: receipt?.gasUsed?.toString() || null,
          status: receipt?.status ?? null,
          blockNumber: receipt?.blockNumber ?? null,
          timestamp,
        },
        events: decodedEvents,
      };
    } catch (error) {
      logger.error('Error al obtener detalles de transacción:', error);
      throw new ServiceUnavailableError(`Error al obtener detalles de transacción: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }
}
