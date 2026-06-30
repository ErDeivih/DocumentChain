/**
 * Patrón prepare/confirm para operaciones con blockchain:
 *
 * Fase 1 — prepare: el frontend cifra el documento (AES-256-GCM + RSA-OAEP), lo sube a IPFS
 *   y obtiene un CID. El backend recibe el CID, validación y metadatos, crea el registro en
 *   PostgreSQL con `blockchainTxHash = null` y devuelve los parámetros de la transacción
 *   (payload ABI-encoded) para que el frontend la firme con la wallet del usuario.
 *
 * Fase 2 — confirm: el frontend envía el hash de la transacción ya firmada. El backend
 *   verifica el receipt on-chain, extrae el `documentId` emitido por el evento del contrato,
 *   actualiza el registro en PostgreSQL con `blockchainTxHash` y `blockchainId`, crea la
 *   versión inicial y emite el evento `DOCUMENT_CREATED`.
 *
 * Este patrón desacopla la firma (que requiere la clave privada en el navegador) de la
 *   persistencia (que reside en el servidor), sin que la clave privada salga del cliente.
 */

import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import prisma from '../config/database';
import { provider } from '../config/blockchain';
import { uploadToIPFS, downloadFromIPFS, deleteFromIPFS } from '../config/ipfs';
import logger from '../utils/logger';
import { ethers } from 'ethers';
import { DocumentVisibility } from '@prisma/client';
import * as Encryption from '../lib/encryption';
import { normalizeFileExtensionFilter } from '../utils/fileValidation';
import { validateWalletBelongsToUser } from '../utils/walletHelper';
import { userHasAccess, resolveUserRole } from '../utils/accessControl';
import { NotFoundError, ValidationError, UnauthorizedError } from '../utils/errors';
import { assertDocument } from '../utils/blockchainGuard';
import { assertDocumentCreatedReceipt } from './blockchainReceiptService';
import { BlockchainCacheService } from './blockchainCacheService';
import { DocumentPermissionService } from './documentPermissionService';
import notificationService, { NotificationType } from './notificationService';

function deriveFileExtension(fileName: string, explicitExtension?: string): string | null {
  const normalizedExplicit = normalizeFileExtensionFilter(explicitExtension);
  if (normalizedExplicit) {
    return normalizedExplicit;
  }

  const derived = path.extname(fileName || '').trim().toLowerCase();
  return derived || null;
}

function generatePublicId(): string {
  return uuidv4().replace(/-/g, '').slice(0, 16);
}

// ============================================
// Tipos
// ============================================

/**
 * Información completa de un documento para la API pública.
 */
export interface DocumentInfo {
  id: string;
  blockchainId: string | null;
  blockchainTxHash: string | null;
  publicId: string | null;
  name: string;
  description: string | null;
  mimeType: string;
  size: number;
  fileExtension?: string | null;
  folderId?: string | null;
  tags?: string[];
  contentHash: string;
  metadataHash: string;
  ownerId: string;
  creatorWalletId: string;
  visibility: 'PRIVATE' | 'PUBLIC';
  isEncrypted: boolean;
  encryptedSymmetricKey?: string | null;
  encryptionIV?: string | null;
  encryptionAuthTag?: string | null;
  role?: 'OWNER' | 'SHARED_WRITE' | 'SHARED_READ' | null;
  createdAt: Date;
  updatedAt: Date;
  owner?: {
    id: string;
    username: string;
    fullName: string | null;
  } | null;
  isArchived?: boolean;
  operationalVersionNumber?: number;
}

/**
 * Datos de entrada para la preparación de un documento.
 */
export interface PrepareDocumentInput {
  name: string;
  description?: string;
  mimeType: string;
  fileBuffer: Buffer;  // Archivo YA CIFRADO por el frontend (o raw si PUBLIC)
  ownerId: string;
  walletId: string;
  visibility?: 'PRIVATE' | 'PUBLIC';
  folderId?: string;
  tags?: string[];
  fileExtension?: string;
  encryptedSymmetricKey?: string;   // RSA-OAEP cifrado por frontend (no para PUBLIC)
  contentHash?: string;              // SHA-256 hex del archivo original
  encryptionIV?: string;             // Base64 (no para PUBLIC)
  encryptionAuthTag?: string;        // Base64 (no para PUBLIC)
}

/**
 * Resultado de la preparación de un documento.
 */
export interface PrepareDocumentResult {
  docId: string;
  ipfsCid: string;
  documentId: string;
  publicId: string | null;
  encryptedKeyHash: string;
  contentHash: string;
}

/**
 * Respuesta paginada de documentos.
 */
export interface PaginatedDocumentInfo {
  documents: DocumentInfo[];
  total: number;
  page: number;
  totalPages: number;
}

/**
 * Información pública de una versión de documento.
 */
export interface PublicDocumentVersionInfo {
  id: string;
  versionNumber: number;
  comment: string | null;
  createdAt: Date;
  ipfsCid: string | null;
}

/**
 * Información pública de una firma sobre una versión.
 */
export interface PublicDocumentSignatureInfo {
  id: string;
  versionId: string;
  versionNumber: number;
  signedAt: Date;
  signer: {
    username: string;
    fullName: string | null;
  } | null;
}

/**
 * Información pública de un documento.
 */
export interface PublicDocumentInfo {
  id: string;
  publicId: string;
  blockchainId: string | null;
  name: string;
  description: string | null;
  mimeType: string;
  size: number;
  fileExtension?: string | null;
  contentHash: string;
  metadataHash: string;
  visibility: 'PUBLIC';
  createdAt: Date;
  owner: {
    id: string;
    username: string;
    fullName: string | null;
  };
  versions: PublicDocumentVersionInfo[];
  signatures: PublicDocumentSignatureInfo[];
}

/**
 * Datos de entrada para confirmar un documento en blockchain.
 */
export interface ConfirmDocumentInput {
  documentId: string;
  txHash: string;
  blockchainId: string;
  confirmerUserId: string;
}

// ============================================
// Clase DocumentService
// ============================================

/**
 * Servicio principal para la gestión del ciclo de vida de los documentos.
 * Incluye preparación, confirmación, descarga, listado y rollback.
 */
export class DocumentService {
  /**
   * Prepara un documento para su creación en blockchain.
   * Flujo:
   * 1. Valida la wallet y obtiene la clave pública del usuario.
   * 2. Valida el archivo (tamaño máximo 100 MB).
   * 3. Valida los campos de cifrado enviados por el frontend (el archivo ya viene cifrado).
   * 4. Sube el archivo a IPFS.
   * 5. Crea el registro en BD con estado `PREPARING`.
   * 6. Devuelve los datos necesarios para que el frontend firme la transacción blockchain.
   * @param input - Datos de entrada para la preparación.
   * @returns Resultado de la preparación con `docId`, `ipfsCid`, `documentId` y `publicId`.
   * @throws Error si la validación falla o ocurre un problema durante la preparación.
   */
  static async prepareDocument(input: PrepareDocumentInput): Promise<PrepareDocumentResult> {
    const {
      name,
      description,
      mimeType,
      fileBuffer,
      ownerId,
      walletId,
      visibility = 'PRIVATE',
      folderId,
      tags,
      fileExtension,
      encryptedSymmetricKey: inputEncryptedSymmetricKey,
      contentHash: inputContentHash,
      encryptionIV: inputEncryptionIV,
      encryptionAuthTag: inputEncryptionAuthTag,
    } = input;

    let ipfsCid: string | null = null;

    try {
      // 1. Validar que la wallet pertenece al usuario
      const wallet = await validateWalletBelongsToUser(walletId, ownerId);

      // 2. Validar archivo
      Encryption.validateFileSize(fileBuffer.length, 100);

      const documentVisibility = visibility === 'PUBLIC'
        ? DocumentVisibility.PUBLIC
        : DocumentVisibility.PRIVATE;

      // 3. Para privados: validar que el frontend envió los campos de cifrado
      if (documentVisibility === DocumentVisibility.PRIVATE) {
        if (!inputEncryptedSymmetricKey) {
          throw new ValidationError('encryptedSymmetricKey requerido: el frontend debe cifrar antes de enviar');
        }
        if (!inputContentHash) {
          throw new ValidationError('contentHash requerido: el frontend debe calcular SHA-256 del original');
        }
        if (!inputEncryptionIV) {
          throw new ValidationError('encryptionIV requerido para documentos privados');
        }
        if (!inputEncryptionAuthTag) {
          throw new ValidationError('encryptionAuthTag requerido para documentos privados');
        }
      }

      const encryptedSymmetricKey = documentVisibility === DocumentVisibility.PRIVATE
        ? inputEncryptedSymmetricKey!
        : 'UNENCRYPTED';

      const contentHash = documentVisibility === DocumentVisibility.PRIVATE
        ? inputContentHash!
        : Encryption.calculateHash(fileBuffer);

      logger.info(`[PREPARE] Documento ${documentVisibility === 'PUBLIC' ? 'público' : 'privado (pre-cifrado por frontend)'}`);

      // 4. Subir archivo a IPFS (ya viene cifrado desde frontend si es PRIVATE)
      ipfsCid = await uploadToIPFS(fileBuffer);
      logger.info(`[PREPARE] Archivo subido a IPFS: ${ipfsCid}`);

      // 5. Generar docId (bytes32 para blockchain)
      const docId = ethers.id(`${ownerId}-${walletId}-${ipfsCid}-${Date.now()}`);

      // 6. Calcular hash de metadatos
      const metadata = JSON.stringify({
        name,
        description,
        mimeType,
        size: fileBuffer.length,
        visibility: documentVisibility,
        iv: inputEncryptionIV ?? null,
        authTag: inputEncryptionAuthTag ?? null,
      });
      const metadataHash = Encryption.calculateHash(Buffer.from(metadata));

      // 7. Crear documento en BD con estado PREPARING
      const document = await prisma.$transaction(async (tx) => {
        const doc = await tx.document.create({
          data: {
            id: uuidv4(),
            blockchainId: undefined,
            name,
            description: description || null,
            mimeType,
            size: BigInt(fileBuffer.length),
            contentHash,
            metadataHash,
            ownerId,
            creatorWalletId: walletId,
            publicId: documentVisibility === DocumentVisibility.PUBLIC ? generatePublicId() : null,
            visibility: documentVisibility,
            encryptedSymmetricKey,
            fileExtension: deriveFileExtension(name, fileExtension) ?? 'bin',
            folderId: folderId || null,
            tags: tags || [],
            encryptionIV: inputEncryptionIV ?? null,
            encryptionAuthTag: inputEncryptionAuthTag ?? null,
          },
        });

        await tx.event.create({
          data: {
            id: uuidv4(),
            eventType: 'DOCUMENT_PREPARED',
            userId: ownerId,
            documentId: doc.id,
            metadata: {
              docId,
              ipfsCid,
              walletId,
              walletAddress: wallet.walletAddress,
              visibility: documentVisibility,
              publicId: doc.publicId,
            },
          },
        });

        return doc;
      });

      logger.info(`[PREPARE] Documento creado en DB: ${document.id}, estado: PREPARING`);

      const encryptedKeyHash = ethers.id(encryptedSymmetricKey);

      return {
        docId,
        ipfsCid,
        documentId: document.id,
        publicId: document.publicId,
        encryptedKeyHash,
        contentHash: contentHash.startsWith('0x') ? contentHash : `0x${contentHash}`,
      };

    } catch (error) {
      logger.error('[PREPARE] Error al preparar documento:', error);

      if (ipfsCid) {
        try {
          await deleteFromIPFS(ipfsCid);
          logger.info(`[PREPARE] IPFS cleanup: ${ipfsCid}`);
        } catch (cleanupError) {
          logger.error('[PREPARE] Error al limpiar IPFS:', cleanupError);
        }
      }

      throw error;
    }
  }

  /**
   * Confirma un documento tras la firma de la transaccion blockchain.
   * Establece `blockchainTxHash` y `blockchainId` en el registro y, si el receipt
   * esta disponible, crea la version inicial y registra el evento DOCUMENT_CREATED.
   * @param input - Datos de confirmación (`documentId`, `txHash`, `blockchainId`).
   * @returns Información del documento actualizado.
   * @throws Error si el documento no se encuentra o falta el CID de IPFS preparado.
   */
  static async confirmDocument(input: ConfirmDocumentInput): Promise<DocumentInfo> {
    const { documentId, txHash, blockchainId, confirmerUserId } = input;

    // 1. Buscar el documento
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new Error('Documento no encontrado');
    }

    if (document.blockchainId) {
      const state = await BlockchainCacheService.getDocumentState(document.blockchainId);
      const confirmerWallet = await prisma.wallet.findFirst({
        where: { userId: confirmerUserId, isPrimary: true },
      });
      if (confirmerWallet && state.owner.toLowerCase() !== confirmerWallet.walletAddress.toLowerCase()) {
        throw new Error('No tienes permisos para confirmar este documento');
      }
    }
    // DB fallback: si no hay blockchainId o wallet, verificar por ownerId
    if (!document.blockchainId && document.ownerId !== confirmerUserId) {
      throw new Error('No tienes permisos para confirmar este documento');
    }

    const preparedEvent = await prisma.event.findFirst({
      where: {
        eventType: 'DOCUMENT_PREPARED',
        documentId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const preparedIpfsCid = (() => {
      const metadata = preparedEvent?.metadata as { ipfsCid?: unknown } | null;
      return typeof metadata?.ipfsCid === 'string' ? metadata.ipfsCid : null;
    })();

    if (document.blockchainTxHash) {
      throw new ValidationError('El documento ya fue confirmado o procesado previamente');
    }

    const preparedDocId = (() => {
      const metadata = preparedEvent?.metadata as { docId?: unknown } | null;
      return typeof metadata?.docId === 'string' ? metadata.docId : null;
    })();

    if (!preparedDocId) {
      throw new Error('No se encontró el ID blockchain preparado del documento');
    }

    if (!preparedIpfsCid) {
      throw new Error('No se encontró el CID de IPFS del documento preparado');
    }

    if (preparedDocId.toLowerCase() !== blockchainId.toLowerCase()) {
      throw new Error('El ID blockchain confirmado no coincide con la preparación');
    }

    const creatorWallet = document.creatorWalletId
      ? await prisma.wallet.findFirst({ where: { id: document.creatorWalletId, userId: document.ownerId } })
      : null;

    if (!creatorWallet) {
      throw new Error('No se encontró la wallet creadora del documento');
    }

    await assertDocumentCreatedReceipt({
      txHash,
      docId: blockchainId,
      ownerAddress: creatorWallet.walletAddress,
      ipfsCid: preparedIpfsCid,
    });

    // 3. Actualizar documento con información de la transacción
    const updated = await prisma.$transaction(async (tx) => {
      const updatedDocument = await tx.document.update({
        where: { id: documentId },
        data: {
          blockchainId,
          blockchainTxHash: txHash,
        },
      });

      const existingVersion = await tx.version.findFirst({
        where: { documentId },
        orderBy: { versionNumber: 'asc' },
      });

      if (!existingVersion) {
        if (!preparedIpfsCid) {
          throw new Error('No se encontró el CID de IPFS del documento preparado');
        }

        await tx.version.create({
          data: {
            id: uuidv4(),
            documentId: document.id,
            userId: document.ownerId,
            encryptedSymmetricKey: document.encryptedSymmetricKey,
            encryptionIV: document.encryptionIV,
            encryptionAuthTag: document.encryptionAuthTag,
            comment: 'Versión inicial',
            blockchainTxHash: txHash,
            versionNumber: 1,
            ipfsCid: preparedIpfsCid,
            contentHash: document.contentHash,
          },
        });
      }

      await tx.event.create({
        data: {
          id: uuidv4(),
          eventType: 'DOCUMENT_TX_SUBMITTED',
          userId: document.ownerId,
          documentId: document.id,
          transactionHash: txHash,
          metadata: {
            blockchainId,
            previousStatus: document.blockchainTxHash ? 'submitted' : 'pending',
          },
        },
      });

      return updatedDocument;
    });

    logger.info(`[CONFIRM] Documento ${documentId} actualizado a TX_SUBMITTED, txHash: ${txHash}`);

    await this.trySyncConfirmedDocument(documentId, txHash, blockchainId);

    // Crear notificación BLOCKCHAIN_CONFIRMED al propietario
    try {
      await notificationService.createNotification({
        userId: document.ownerId,
        type: NotificationType.BLOCKCHAIN_CONFIRMED,
        title: 'Documento confirmado en blockchain',
        message: `El documento "${document.name}" ha sido confirmado en la blockchain.`,
        link: `/app/documents/${documentId}`,
        data: { documentId, blockchainTxHash: txHash }
      });
    } catch (notifErr) {
      logger.warn('No se pudo crear notificación de confirmación', { documentId, error: notifErr instanceof Error ? notifErr.message : 'Error desconocido' });
    }

    const syncedDocument = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (updated?.blockchainId) BlockchainCacheService.invalidate(updated.blockchainId);

    return await this.toDocumentInfo(syncedDocument ?? updated);
  }

  private static async trySyncConfirmedDocument(
    documentId: string,
    txHash: string,
    blockchainId: string,
  ): Promise<void> {
    try {
      const receipt =
        (await provider.getTransactionReceipt(txHash)) ??
        (await provider.waitForTransaction(txHash, 1, 5000));

      if (!receipt) {
        logger.info(`[CONFIRM] Receipt aún no disponible para documento ${documentId}, se mantiene en TX_SUBMITTED`);
        return;
      }

      if (receipt.status === 0) {
        throw new Error(`La transacción ${txHash} fue revertida en blockchain`);
      }

      const block = await provider.getBlock(receipt.blockNumber);
      const currentDocument = await prisma.document.findUnique({
        where: { id: documentId },
        select: {
          ownerId: true,
          blockchainId: true,
        },
      });

      if (currentDocument) {
        const existingCreatedEvent = await prisma.event.findFirst({
          where: {
            documentId,
            eventType: 'DOCUMENT_CREATED',
            transactionHash: txHash,
          },
        });

        if (!existingCreatedEvent) {
          await prisma.event.create({
            data: {
              id: uuidv4(),
              eventType: 'DOCUMENT_CREATED',
              userId: currentDocument.ownerId,
              documentId,
              transactionHash: txHash,
              blockNumber: receipt.blockNumber,
              blockTimestamp: block ? new Date(block.timestamp * 1000) : null,
              metadata: {
                blockchainId: currentDocument.blockchainId || blockchainId,
              },
            },
          });
        }

        if (currentDocument.blockchainId) {
          BlockchainCacheService.invalidate(currentDocument.blockchainId);
        }
      }

      logger.info(`[CONFIRM] Documento ${documentId} sincronizado inmediatamente desde receipt ${txHash}`);
    } catch (error) {
      logger.warn('[CONFIRM] No se pudo sincronizar inmediatamente el documento desde el receipt', {
        documentId,
        txHash,
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  }

  /**
   * Obtiene un documento por su identificador interno.
   * @param documentId - UUID del documento en BD.
   * @param userId - UUID del usuario solicitante.
   * @returns Información del documento o `null` si no existe o el usuario no tiene acceso.
   */
  static async getDocumentById(documentId: string, userId: string): Promise<DocumentInfo | null> {
    const hasAccess = await userHasAccess(documentId, userId);
    if (!hasAccess) return null;

    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        owner: { select: { id: true, username: true, fullName: true } },
        versions: { orderBy: { versionNumber: 'asc' }, select: { versionNumber: true, encryptedSymmetricKey: true, encryptionIV: true, encryptionAuthTag: true } },
      },
    });

    if (!document) return null;
    if (document.blockchainId && await BlockchainCacheService.isDocumentDeleted(document.blockchainId)) return null;

    const role = await resolveUserRole(document.id, document.ownerId, document.blockchainId, userId);

    return await this.toDocumentInfo(document, role);
  }

  /**
   * Lista los documentos accesibles para un usuario con soporte de paginación y filtros.
   * @param userId - UUID del usuario.
   * @param options - Opciones de paginación, búsqueda y filtros (wallet, carpeta, archivados, tipo de archivo, etc.).
   * @returns Documentos paginados con metadatos de paginación.
   */
  static async listDocuments(
    userId: string,
    options?: {
      page?: number;
      limit?: number;
      walletId?: string;
      includeArchived?: boolean;
      onlyArchived?: boolean;
      folderId?: string;
      search?: string;
      fileType?: string;
    }
  ): Promise<PaginatedDocumentInfo> {
    const {
      page = 1,
      limit = 10,
      walletId,
      includeArchived = false,
      onlyArchived = false,
      folderId,
      search,
      fileType,
    } = options || {};
    const normalizedFileType = normalizeFileExtensionFilter(fileType);

    // Obtener las wallets del usuario
    const userWallets = await prisma.wallet.findMany({
      where: { userId },
      select: { walletAddress: true },
    });

    // Obtener blockchainIds de documentos donde el usuario es propietario directo
    const ownedDocs = await prisma.document.findMany({
      where: { ownerId: userId },
      select: { blockchainId: true },
    });
    const ownedBlockchainIds = ownedDocs
      .filter(d => d.blockchainId !== null)
      .map(d => d.blockchainId as string);

    // Obtener blockchainIds de documentos compartidos via permisos on-chain
    const docArrays = await Promise.all(
      userWallets.map(w => DocumentPermissionService.getUserDocuments(w.walletAddress).catch(() => []))
    );
    const sharedBlockchainIds = [...new Set(docArrays.flat())];

    // Unir ambos conjuntos (sin duplicados)
    const allBlockchainIds = [...new Set([...ownedBlockchainIds, ...sharedBlockchainIds])];

    // Verificar si hay documentos sin blockchainId (seed/QA)
    const hasNullBbIdDocs = ownedDocs.some(d => d.blockchainId === null);

    if (allBlockchainIds.length === 0 && !hasNullBbIdDocs) {
      return {
        documents: [],
        total: 0,
        page: 1,
        totalPages: 1,
      };
    }

    // Pre-filtro usando blockchain como fuente de verdad para archivado/eliminado
    const states = await BlockchainCacheService.batchGetDocumentStates(allBlockchainIds);
    const visibleIds = allBlockchainIds.filter(id => {
      const state = states.get(id);
      if (!state) return true;
      if (onlyArchived) return state.isArchived && !state.isDeleted;
      if (includeArchived) return !state.isDeleted;
      return !state.isArchived && !state.isDeleted;
    });

    if (visibleIds.length === 0 && !hasNullBbIdDocs) {
      return {
        documents: [],
        total: 0,
        page: 1,
        totalPages: 1,
      };
    }

    const where: any = {
      OR: [
        { blockchainId: { in: visibleIds } },
        { blockchainId: null, ownerId: userId },
      ],
    };

    if (walletId) {
      where.creatorWalletId = walletId;
    }

    if (folderId !== undefined) {
      where.folderId = folderId;
    }

    if (search) {
      where.AND = [
        {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { tags: { has: search } },
          ],
        },
      ];
    }

    // Filtro por tipo de archivo
    if (normalizedFileType) {
      where.fileExtension = normalizedFileType;
    }

    const safePage = Math.max(1, page);
    const safeLimit = Math.min(100, Math.max(1, limit));
    const skip = (safePage - 1) * safeLimit;

    const [total, documents] = await Promise.all([
      prisma.document.count({ where }),
      prisma.document.findMany({
        where,
        orderBy: {
          name: 'asc',
        },
        skip,
        take: safeLimit,
        include: {
          owner: {
            select: {
              id: true,
              username: true,
              fullName: true,
            },
          },
        },
      }),
    ]);

    return {
      documents: await Promise.all(documents.map(d => this.toDocumentInfo(d))),
      total,
      page: safePage,
      totalPages: Math.max(1, Math.ceil(total / safeLimit)),
    };
  }

  /**
   * Descarga un documento desde IPFS.
   * El descifrado se realiza en el frontend.
   * @param documentId - UUID del documento.
   * @param userId - UUID del usuario solicitante.
   * @returns Buffer con el archivo cifrado y metadatos necesarios para el descifrado.
   * @throws Error si el usuario no tiene acceso o el documento no tiene versión operacional.
   */
  static async downloadDocument(documentId: string, userId: string): Promise<{
    encryptedFile: Buffer;
    encryptedSymmetricKey: string;
    encryptionIV: string | null;
    encryptionAuthTag: string | null;
    name: string;
    mimeType: string;
  }> {
    // Verificar acceso
    const hasAccess = await userHasAccess(documentId, userId);
    if (!hasAccess) {
      throw new Error('Acceso denegado');
    }

    // Obtener documento
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        versions: true,
      },
    });

    if (!document) {
      throw new Error('Documento no encontrado');
    }

    if (document.blockchainId && await BlockchainCacheService.isDocumentDeleted(document.blockchainId)) {
      throw new Error('Documento no encontrado');
    }

    const blockchainId = document.blockchainId;
    const operationalVersionNumber = blockchainId
      ? await BlockchainCacheService.getOperationalVersionNumber(blockchainId)
      : null;
    const operationalVersion = operationalVersionNumber
      ? document.versions.find(v => v.versionNumber === operationalVersionNumber)
      : document.versions.find(v => v.versionNumber === 1);

    if (!operationalVersion || !operationalVersion.ipfsCid) {
      throw new Error('Documento no tiene versión operacional en IPFS');
    }

    // Determinar la clave simétrica cifrada correcta para este usuario
    let encryptedSymmetricKey: string;
    if (document.ownerId === userId) {
      encryptedSymmetricKey = operationalVersion.encryptedSymmetricKey || document.encryptedSymmetricKey || 'UNENCRYPTED';
    } else {
      const shareKey = await prisma.documentShareKey.findUnique({
        where: { documentId_userId: { documentId, userId } },
      });
      if (!shareKey) throw new UnauthorizedError('No tienes acceso de descarga a este documento');
      encryptedSymmetricKey = shareKey.encryptedSymmetricKey;
    }

    // Descargar desde IPFS
    let encryptedFile: Buffer;
    try {
      encryptedFile = await downloadFromIPFS(operationalVersion.ipfsCid);
    } catch (ipfsError) {
      if (operationalVersion.ipfsCid?.startsWith('QmSynthetic')) {
        logger.warn(`[DOWNLOAD] CID sintético (${operationalVersion.ipfsCid}), devolviendo placeholder`);
        encryptedFile = Buffer.from('PLACEHOLDER_FILE_FOR_SYNTHETIC_CID');
      } else {
        throw ipfsError;
      }
    }

    // Registrar descarga
    await prisma.event.create({
      data: {
        id: uuidv4(),
        eventType: 'DOCUMENT_DOWNLOADED',
        userId,
        documentId: document.id,
      },
    });

    return {
      encryptedFile,
      encryptedSymmetricKey,
      encryptionIV: operationalVersion.encryptionIV || document.encryptionIV || null,
      encryptionAuthTag: operationalVersion.encryptionAuthTag || document.encryptionAuthTag || null,

      name: document.name,
      mimeType: document.mimeType,
    };
  }

  /**
   * Obtiene la información pública de un documento por su `publicId`.
   * @param publicId - Identificador público del documento.
   * @returns Información pública del documento o `null` si no existe.
   */
  static async getPublicDocumentByPublicId(publicId: string): Promise<PublicDocumentInfo | null> {
    const document = await prisma.document.findFirst({
      where: {
        publicId,
        visibility: DocumentVisibility.PUBLIC,
      },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
        versions: {
          orderBy: {
            versionNumber: 'desc',
          },
          select: {
            id: true,
            versionNumber: true,
            comment: true,
            createdAt: true,
            ipfsCid: true,
          },
        },
        signatures: {
          orderBy: {
            signedAt: 'desc',
          },
          select: {
            id: true,
            versionId: true,
            signedAt: true,
            user: {
              select: {
                username: true,
                fullName: true,
              },
            },
            version: {
              select: {
                versionNumber: true,
              },
            },
          },
        },
      },
    });

    if (!document) {
      return null;
    }

    // Post-filter: usar blockchain como fuente de verdad para eliminado
    if (document.blockchainId && await BlockchainCacheService.isDocumentDeleted(document.blockchainId)) {
      return null;
    }

    return {
      id: document.id,
      publicId: document.publicId || publicId,
      blockchainId: document.blockchainId,
      name: document.name,
      description: document.description,
      mimeType: document.mimeType,
      size: Number(document.size),
      fileExtension: document.fileExtension ?? null,
      contentHash: document.contentHash,
      metadataHash: document.metadataHash,
      visibility: 'PUBLIC',
      createdAt: document.createdAt,
      owner: document.owner,
      versions: document.versions.map((version) => ({
        id: version.id,
        versionNumber: version.versionNumber,
        comment: version.comment,
        createdAt: version.createdAt,
        ipfsCid: version.ipfsCid,
      })),
      signatures: document.signatures.map((signature) => ({
        id: signature.id,
        versionId: signature.versionId,
        versionNumber: signature.version.versionNumber,
        signedAt: signature.signedAt,
        signer: signature.user,
      })),
    };
  }

  /**
   * Descarga un documento público por su `publicId`.
   * @param publicId - Identificador público del documento.
   * @param versionNumber - Número de versión opcional; si no se especifica, se descarga la versión operativa.
   * @returns Archivo descargado con nombre, tipo MIME y número de versión.
   * @throws Error si el documento no es público o la versión solicitada no está disponible sin cifrado.
   */
  static async downloadPublicDocumentByPublicId(
    publicId: string,
    versionNumber?: number,
  ): Promise<{
    file: Buffer;
    name: string;
    mimeType: string;
    versionNumber: number;
  }> {
    const document = await prisma.document.findFirst({
      where: {
        publicId,
        visibility: DocumentVisibility.PUBLIC,
      },
      include: {
        versions: {
          where: versionNumber ? { versionNumber } : undefined,
          orderBy: versionNumber ? undefined : { versionNumber: 'desc' },
          take: versionNumber ? undefined : 20,
          select: {
            id: true,
            versionNumber: true,
            ipfsCid: true,
            encryptedSymmetricKey: true,
          },
        },
      },
    });

    if (!document) {
      throw new Error('Documento público no encontrado');
    }

    // Post-filter: usar blockchain como fuente de verdad para eliminado
    if (document.blockchainId && await BlockchainCacheService.isDocumentDeleted(document.blockchainId)) {
      throw new Error('Documento público no encontrado');
    }

    const operationalVersionNumber = !versionNumber && document.blockchainId
      ? await BlockchainCacheService.getOperationalVersionNumber(document.blockchainId)
      : null;

    const targetVersion = versionNumber
      ? document.versions.find((version) => version.versionNumber === versionNumber)
      : document.versions.find((version) => version.versionNumber === operationalVersionNumber)
        || document.versions.find((version) => version.versionNumber === 1)
        || document.versions[0];

    if (!targetVersion || !targetVersion.ipfsCid) {
      throw new Error('No se encontró una versión pública descargable');
    }

    if (targetVersion.encryptedSymmetricKey !== 'UNENCRYPTED') {
      throw new Error('La versión solicitada no está publicada sin cifrado');
    }

    let file: Buffer;
    try {
      file = await downloadFromIPFS(targetVersion.ipfsCid);
    } catch (ipfsError) {
      if (targetVersion.ipfsCid?.startsWith('QmSynthetic')) {
        logger.warn(`[DOWNLOAD] CID sintético (${targetVersion.ipfsCid}), devolviendo placeholder`);
        file = Buffer.from('PLACEHOLDER_FILE_FOR_SYNTHETIC_CID');
      } else {
        throw ipfsError;
      }
    }

    return {
      file,
      name: document.name,
      mimeType: document.mimeType,
      versionNumber: targetVersion.versionNumber,
    };
  }

  /**
   * Actualiza los metadatos de un documento sin operación en blockchain.
   * @param documentId - UUID del documento.
   * @param userId - UUID del usuario solicitante (debe ser el propietario).
   * @param data - Campos a actualizar (name, description, tags, folderId).
   * @returns Información del documento actualizado.
   * @throws NotFoundError si el documento no existe.
   * @throws ValidationError si el usuario no tiene permisos.
   */
  static async updateDocument(documentId: string, userId: string, data: { name?: string; description?: string; tags?: string[]; folderId?: string }): Promise<DocumentInfo> {
    const doc = await assertDocument(documentId);
    if (doc.ownerId !== userId) throw new ValidationError('No tienes permisos');
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.tags !== undefined) updateData.tags = data.tags;
    if (data.folderId !== undefined) updateData.folderId = data.folderId;
    const updated = await prisma.document.update({
      where: { id: documentId },
      data: updateData,
      include: { owner: { select: { id: true, username: true, fullName: true } }, versions: { orderBy: { versionNumber: 'asc' }, select: { versionNumber: true, encryptedSymmetricKey: true, encryptionIV: true, encryptionAuthTag: true } } },
    });
    return this.toDocumentInfo(updated);
  }

  /**
   * Convierte un documento de Prisma al tipo `DocumentInfo`.
   * @param document - Objeto documento devuelto por Prisma.
   * @param role - Rol del usuario solicitante (opcional).
   * @returns Información normalizada del documento.
   */
  private static async toDocumentInfo(document: any, role: DocumentInfo['role'] = null): Promise<DocumentInfo> {
    const isEncrypted = document.encryptedSymmetricKey !== 'UNENCRYPTED';

    let operationalVersionNumber: number | undefined;
    let encryptedSymmetricKey = document.encryptedSymmetricKey ?? null;
    let encryptionIV = document.encryptionIV ?? null;
    let encryptionAuthTag = document.encryptionAuthTag ?? null;
    let isArchived: boolean | undefined;

    if (document.blockchainId) {
      isArchived = await BlockchainCacheService.isDocumentArchived(document.blockchainId);
      operationalVersionNumber = await BlockchainCacheService.getOperationalVersionNumber(document.blockchainId).catch(() => undefined);
      if (operationalVersionNumber && document.versions) {
        const opVer = document.versions.find((v: any) => v.versionNumber === operationalVersionNumber);
        if (opVer) {
          if (opVer.encryptedSymmetricKey) encryptedSymmetricKey = opVer.encryptedSymmetricKey;
          if (opVer.encryptionIV) encryptionIV = opVer.encryptionIV;
          if (opVer.encryptionAuthTag) encryptionAuthTag = opVer.encryptionAuthTag;
        }
      }
    }

    return {
      id: document.id,
      blockchainId: document.blockchainId,
      blockchainTxHash: document.blockchainTxHash,
      publicId: document.publicId ?? null,
      name: document.name,
      description: document.description,
      mimeType: document.mimeType,
      size: Number(document.size),
      fileExtension: document.fileExtension ?? null,
      folderId: document.folderId ?? null,
      tags: document.tags ?? [],
      contentHash: document.contentHash,
      metadataHash: document.metadataHash,
      ownerId: document.ownerId,
      creatorWalletId: document.creatorWalletId,
      visibility: document.visibility === DocumentVisibility.PUBLIC ? 'PUBLIC' : 'PRIVATE',
      isEncrypted,
      encryptedSymmetricKey,
      encryptionIV,
      encryptionAuthTag,
      role,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
      owner: document.owner ? { id: document.owner.id, username: document.owner.username, fullName: document.owner.fullName } : null,
      isArchived,
      operationalVersionNumber,
    };
  }

  /**
   * Revierte la creación de un documento.
   * Elimina el documento y sus versiones de la BD, desancla los CIDs de IPFS
   * y registra el evento. Se utiliza cuando la transacción blockchain falla tras la preparación.
   * @param documentId - UUID del documento.
   * @param userId - UUID del usuario que solicita el rollback (debe ser el propietario).
   * @throws Error si el documento no existe o el usuario no es el propietario.
   */
  static async rollbackDocument(documentId: string, userId: string): Promise<void> {
    try {
      // Obtener documento con versiones
      const document = await prisma.document.findUnique({
        where: { id: documentId },
        include: { versions: true },
      });

      if (!document) {
        throw new Error('Documento no encontrado');
      }

      // Verificar propiedad
      if (document.ownerId !== userId) {
        throw new Error('No tienes permiso para eliminar este documento');
      }

      // Recopilar todos los CIDs de IPFS a desanclar (solo de versiones)
      const cidsToUnpin: string[] = [];
      document.versions.forEach(v => {
        if (v.ipfsCid) {
          cidsToUnpin.push(v.ipfsCid);
        }
      });

      await prisma.$transaction(async (tx) => {
        await tx.event.create({
          data: {
            id: uuidv4(),
            eventType: 'DOCUMENT_ROLLBACK',
            userId,
            documentId,
            metadata: {
              cidsUnpinned: cidsToUnpin,
              versionsDeleted: document.versions.length,
            },
          },
        });

        await tx.document.delete({
          where: { id: documentId },
        });
      });

      for (const cid of cidsToUnpin) {
        try {
          await deleteFromIPFS(cid);
          logger.info(`[ROLLBACK] Unpinned CID: ${cid}`);
        } catch (error) {
          logger.warn(`[ROLLBACK] Failed to unpin CID ${cid}:`, error);
        }
      }

      logger.info(`[ROLLBACK] Document ${documentId} rolled back successfully`);
    } catch (error) {
      logger.error(`[ROLLBACK] Error al revertir documento ${documentId}:`, error);
      throw error;
    }
  }

  /**
   * Obtiene las claves públicas de los usuarios con los que se ha compartido un documento.
   * Usado por el frontend para re-cifrar claves AES al crear nuevas versiones.
   *
   * @param documentId - ID del documento
   * @returns Array de { userId, publicKey }
   */
  static async getShareKeys(documentId: string): Promise<Array<{ userId: string; publicKey: string }>> {
    const shareKeys = await prisma.documentShareKey.findMany({
      where: { documentId },
      include: {
        user: { select: { id: true, publicKey: true } },
      },
    });

    return shareKeys.map(sk => ({
      userId: sk.user.id,
      publicKey: sk.user.publicKey,
    }));
  }
}

export default DocumentService;
