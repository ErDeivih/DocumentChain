/**
 * Servicio de documentos — refactorizado para cifrado en el backend.
 *
 * Este servicio implementa el patrón prepare/confirm:
 * 1. `prepareDocument`: recibe el archivo SIN CIFRAR, lo cifra, lo sube a IPFS y crea un registro en BD con estado PREPARING.
 * 2. `confirmDocument`: actualiza el registro en BD tras la firma de la transacción blockchain por parte del frontend.
 *
 * Responsabilidades del backend:
 * - Cifrado de archivos (AES-256-GCM).
 * - Validación de archivos (tamaño, tipo MIME).
 * - Subida a IPFS.
 *
 * El backend NO firma transacciones blockchain; la wallet del usuario lo hace a través del frontend.
 */

import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import prisma from '../config/database';
import { provider } from '../config/blockchain';
import { uploadToIPFS, downloadFromIPFS, deleteFromIPFS } from '../config/ipfs';
import logger from '../utils/logger';
import { ethers } from 'ethers';
import { BlockchainStatus, Document, DocumentVisibility } from '@prisma/client';
import * as Encryption from '../lib/encryption';
import { BlockchainQueries } from '../lib/blockchain/queries';
import { DocumentPermissionService, DocumentRole as PermissionRole } from './documentPermissionService';

function normalizeFileExtensionFilter(fileType?: string): string | undefined {
  if (!fileType) {
    return undefined;
  }

  const trimmed = fileType.trim().toLowerCase();
  if (!trimmed) {
    return undefined;
  }

  return trimmed.startsWith('.') ? trimmed : `.${trimmed}`;
}

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
  ipfsCid: string | null;
  blockchainStatus: BlockchainStatus;
  isArchived: boolean;
  archivedAt: Date | null;
  role?: 'OWNER' | 'SHARED_WRITE' | 'SHARED_READ' | null;
  createdAt: Date;
  updatedAt: Date;
  owner?: {
    id: string;
    username: string;
    fullName: string | null;
    avatarUrl: string | null;
  } | null;
}

/**
 * Datos de entrada para la preparación de un documento.
 */
export interface PrepareDocumentInput {
  name: string;
  description?: string;
  mimeType: string;
  fileBuffer: Buffer;  // Archivo SIN CIFRAR proveniente del frontend
  ownerId: string;
  walletId: string;
  visibility?: 'PRIVATE' | 'PUBLIC';
  folderId?: string;
  tags?: string[];
  fileExtension?: string;
}

/**
 * Resultado de la preparación de un documento.
 */
export interface PrepareDocumentResult {
  docId: string;           // bytes32 para blockchain
  ipfsCid: string;         // CID del archivo cifrado
  documentId: string;      // UUID del documento en BD
  publicId: string | null;
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
  isOperational: boolean;
  ipfsCid: string | null;
  blockchainStatus: BlockchainStatus;
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
  isArchived: boolean;
  isDeleted: boolean;
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
   * 3. Cifra el archivo con AES-256-GCM (solo si es privado).
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
    } = input;

    let ipfsCid: string | null = null;

    try {
      // 1. Validar que la wallet pertenece al usuario
      const wallet = await prisma.wallet.findFirst({
        where: {
          id: walletId,
          userId: ownerId,
        },
      });

      if (!wallet) {
        throw new Error('Wallet no encontrada o no pertenece al usuario');
      }

      // 2. Obtener clave pública del usuario para cifrar
      const user = await prisma.user.findUnique({
        where: { id: ownerId },
        select: { publicKey: true },
      });

      if (!user || !user.publicKey) {
        throw new Error('Usuario no tiene clave pública configurada');
      }

      // 3. Validar archivo
      Encryption.validateFileSize(fileBuffer.length, 100); // Máx. 100 MB
      // La validación de tipo MIME es opcional; se puede añadir una lista blanca aquí
      // Encryption.validateMimeType(mimeType, ['application/pdf', 'image/*', ...]);

      const documentVisibility = visibility === 'PUBLIC'
        ? DocumentVisibility.PUBLIC
        : DocumentVisibility.PRIVATE;

      const encryptionResult = documentVisibility === DocumentVisibility.PUBLIC
        ? null
        : Encryption.encryptFile(fileBuffer);

      if (encryptionResult) {
        logger.info(`[PREPARE] Archivo cifrado (${encryptionResult.encryptedData.length} bytes)`);
      } else {
        logger.info('[PREPARE] Documento público: se almacenará sin cifrar');
      }

      const encryptedSymmetricKey = encryptionResult
        ? Encryption.encryptSymmetricKey(encryptionResult.symmetricKey, user.publicKey)
        : 'UNENCRYPTED';

      ipfsCid = await uploadToIPFS(encryptionResult ? encryptionResult.encryptedData : fileBuffer);
      logger.info(`[PREPARE] Archivo subido a IPFS: ${ipfsCid}`);

      // 7. Generar docId (bytes32 para blockchain)
      const docId = ethers.id(`${ownerId}-${walletId}-${ipfsCid}-${Date.now()}`);

      // 8. Calcular hash de metadatos
      const metadata = JSON.stringify({
        name,
        description,
        mimeType,
        size: fileBuffer.length,
        visibility: documentVisibility,
        iv: encryptionResult?.iv ?? null,
        authTag: encryptionResult?.authTag ?? null,
      });
      const metadataHash = Encryption.calculateHash(Buffer.from(metadata));

      // 9. Crear documento en BD con estado PREPARING
      const document = await prisma.document.create({
        data: {
          id: uuidv4(),
          blockchainId: undefined, // Se establecerá tras la confirmación blockchain
          name,
          description: description || null,
          mimeType,
          size: BigInt(fileBuffer.length),
          contentHash: encryptionResult?.contentHash || Encryption.calculateHash(fileBuffer),
          metadataHash,
          ownerId,
          creatorWalletId: walletId,
          publicId: documentVisibility === DocumentVisibility.PUBLIC ? generatePublicId() : null,
          visibility: documentVisibility,
          encryptedSymmetricKey,
          blockchainStatus: BlockchainStatus.PREPARING,
          fileExtension: deriveFileExtension(name, fileExtension),
          folderId: folderId || null,
          tags: tags || [],
          // Almacenar metadatos de cifrado
          encryptionIV: encryptionResult?.iv ?? null,
          encryptionAuthTag: encryptionResult?.authTag ?? null,
        },
      });

      logger.info(`[PREPARE] Documento creado en DB: ${document.id}, estado: PREPARING`);

      // 5. Registrar evento de preparación
      await prisma.event.create({
        data: {
          id: uuidv4(),
          eventType: 'DOCUMENT_PREPARED',
          userId: ownerId,
          documentId: document.id,
          metadata: {
            docId,
            ipfsCid,
            walletId,
            walletAddress: wallet.walletAddress,
            visibility: documentVisibility,
            publicId: document.publicId,
          },
        },
      });

      return {
        docId,
        ipfsCid,
        documentId: document.id,
        publicId: document.publicId,
      };

    } catch (error) {
      logger.error('[PREPARE] Error al preparar documento:', error);

      // Limpieza de IPFS si la subida tuvo éxito pero falló la BD
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
   * Confirma un documento tras la firma de la transacción blockchain.
   * Actualiza el registro en BD a estado `TX_SUBMITTED` y, si es posible,
   * sincroniza inmediatamente a `SYNCED` a partir del receipt.
   * @param input - Datos de confirmación (`documentId`, `txHash`, `blockchainId`).
   * @returns Información del documento actualizado.
   * @throws Error si el documento no se encuentra o falta el CID de IPFS preparado.
   */
  static async confirmDocument(input: ConfirmDocumentInput): Promise<DocumentInfo> {
    const { documentId, txHash, blockchainId } = input;

    // 1. Buscar el documento
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new Error('Documento no encontrado');
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

    // 2. Validar estado actual
    if (document.blockchainStatus !== BlockchainStatus.PREPARING) {
      logger.warn(`[CONFIRM] Documento ${documentId} no está en estado PREPARING (actual: ${document.blockchainStatus})`);
      // Se continúa de todos modos pero se registra la advertencia
    }

    // 3. Actualizar documento con información de la transacción
    const updated = await prisma.$transaction(async (tx) => {
      const updatedDocument = await tx.document.update({
        where: { id: documentId },
        data: {
          blockchainId,
          blockchainTxHash: txHash,
          blockchainStatus: BlockchainStatus.TX_SUBMITTED,
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
            blockchainStatus: BlockchainStatus.TX_SUBMITTED,
            blockchainTxHash: txHash,
            versionNumber: 1,
            isOperational: true,
            ipfsCid: preparedIpfsCid,
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
            previousStatus: document.blockchainStatus,
          },
        },
      });

      return updatedDocument;
    });

    logger.info(`[CONFIRM] Documento ${documentId} actualizado a TX_SUBMITTED, txHash: ${txHash}`);

    await this.trySyncConfirmedDocument(documentId, txHash, blockchainId);

    const syncedDocument = await prisma.document.findUnique({
      where: { id: documentId },
    });

    return this.toDocumentInfo(syncedDocument ?? updated);
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
        await prisma.$transaction(async (tx) => {
          await tx.document.updateMany({
            where: {
              id: documentId,
              blockchainTxHash: txHash,
              blockchainStatus: BlockchainStatus.TX_SUBMITTED,
            },
            data: {
              blockchainStatus: BlockchainStatus.FAILED,
              blockchainError: 'Transaction reverted on chain',
            },
          });

          await tx.version.updateMany({
            where: {
              documentId,
              blockchainTxHash: txHash,
              blockchainStatus: BlockchainStatus.TX_SUBMITTED,
            },
            data: {
              blockchainStatus: BlockchainStatus.FAILED,
              blockchainError: 'Transaction reverted on chain',
            },
          });
        });

        logger.warn(`[CONFIRM] Documento ${documentId} marcado como FAILED por receipt revertido`);
        return;
      }

      const block = await provider.getBlock(receipt.blockNumber);
      const currentDocument = await prisma.document.findUnique({
        where: { id: documentId },
        select: {
          ownerId: true,
          blockchainId: true,
        },
      });

      await prisma.$transaction(async (tx) => {
        await tx.document.updateMany({
          where: {
            id: documentId,
            blockchainTxHash: txHash,
            blockchainStatus: BlockchainStatus.TX_SUBMITTED,
          },
          data: {
            blockchainId,
            blockchainStatus: BlockchainStatus.SYNCED,
            blockchainError: null,
          },
        });

        await tx.version.updateMany({
          where: {
            documentId,
            blockchainTxHash: txHash,
            blockchainStatus: BlockchainStatus.TX_SUBMITTED,
          },
          data: {
            blockchainStatus: BlockchainStatus.SYNCED,
            blockchainError: null,
          },
        });

        const existingCreatedEvent = await tx.event.findFirst({
          where: {
            documentId,
            eventType: 'DOCUMENT_CREATED',
            transactionHash: txHash,
          },
        });

        if (!existingCreatedEvent && currentDocument) {
          await tx.event.create({
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
      });

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
    // Verificar acceso del usuario
    const hasAccess = await this.userHasAccess(documentId, userId);
    if (!hasAccess) {
      return null;
    }

    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!document || document.isDeleted) return null;

    const role = await this.resolveUserRole(document, userId);

    return this.toDocumentInfo(document, role);
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

    const where: any = {
      ownerId: userId,
      isDeleted: false,
    };

    // Filtro de archivado
    if (onlyArchived) {
      where.isArchived = true;
    } else if (!includeArchived) {
      where.isArchived = false;
    }

    if (walletId) {
      where.creatorWalletId = walletId;
    }

    if (folderId !== undefined) {
      where.folderId = folderId;
    }

    // Búsqueda por nombre
    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive',
      };
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
              avatarUrl: true,
            },
          },
        },
      }),
    ]);

    return {
      documents: documents.map(d => this.toDocumentInfo(d)),
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
    const hasAccess = await this.userHasAccess(documentId, userId);
    if (!hasAccess) {
      throw new Error('Acceso denegado');
    }

    // Obtener documento
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        versions: {
          where: { isOperational: true },
          take: 1,
        },
      },
    });

    if (!document) {
      throw new Error('Documento no encontrado');
    }

    if (document.isDeleted) {
      throw new Error('Documento no encontrado');
    }

    const operationalVersion = document.versions[0];
    if (!operationalVersion || !operationalVersion.ipfsCid) {
      throw new Error('Documento no tiene versión operacional en IPFS');
    }

    // Determinar la clave simétrica cifrada correcta para este usuario
    let encryptedSymmetricKey: string;
    if (document.ownerId === userId) {
      encryptedSymmetricKey = operationalVersion.encryptedSymmetricKey || document.encryptedSymmetricKey || 'UNENCRYPTED';
    } else {
      const shareKey = await prisma.documentShareKey.findUnique({
        where: {
          documentId_userId: {
            documentId,
            userId,
          },
        },
      });
      encryptedSymmetricKey = shareKey?.encryptedSymmetricKey || operationalVersion.encryptedSymmetricKey || document.encryptedSymmetricKey || 'UNENCRYPTED';
    }

    // Descargar desde IPFS
    const encryptedFile = await downloadFromIPFS(operationalVersion.ipfsCid);

    // Registrar descarga
    await prisma.event.create({
      data: {
        id: uuidv4(),
        eventType: 'DOCUMENT_DOWNLOADED',
        userId,
        documentId: document.id,
      },
    });

    // Actualizar estadísticas
    await prisma.documentStats.update({
      where: { documentId: document.id },
      data: {
        totalDownloads: { increment: 1 },
        lastActivityAt: new Date(),
      },
    }).catch(() => {
      // Las estadísticas pueden no existir; se ignora el error
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
   * Verifica si un usuario tiene acceso a un documento.
   * @param documentId - UUID del documento.
   * @param userId - UUID del usuario.
   * @returns `true` si tiene acceso, `false` en caso contrario.
   */
  static async userHasAccess(documentId: string, userId: string): Promise<boolean> {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      select: { ownerId: true, blockchainId: true, visibility: true, isDeleted: true },
    });

    if (!document) return false;

    if (document.isDeleted) return false;

    // El propietario siempre tiene acceso
    if (document.ownerId === userId) return true;

    if (document.visibility === DocumentVisibility.PUBLIC) {
      return true;
    }

    // Los permisos se verifican exclusivamente on-chain; la blockchain es la única fuente de verdad.
    if (document.blockchainId) {
      const wallets = await prisma.wallet.findMany({
        where: { userId },
        select: { walletAddress: true },
      });

      if (wallets.length > 0) {
        const { DocumentPermissionService } = await import('./documentPermissionService');
        for (const wallet of wallets) {
          if (await DocumentPermissionService.canView(document.blockchainId, wallet.walletAddress)) {
            return true;
          }
        }
      }
    }

    return false;
  }

  /**
   * Obtiene los documentos creados con una wallet específica.
   * @param userId - UUID del usuario.
   * @param walletId - UUID de la wallet.
   * @returns Lista de documentos asociados a la wallet.
   * @throws Error si la wallet no pertenece al usuario.
   */
  static async getDocumentsByWallet(userId: string, walletId: string): Promise<DocumentInfo[]> {
    // Verificar que la wallet pertenece al usuario
    const wallet = await prisma.wallet.findFirst({
      where: { id: walletId, userId },
    });

    if (!wallet) {
      throw new Error('Wallet no encontrada');
    }

    const documents = await prisma.document.findMany({
      where: {
        creatorWalletId: walletId,
        isDeleted: false,
      },
      orderBy: {
        name: 'asc',
      },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true,
          },
        },
      },
    });

    return documents.map(d => this.toDocumentInfo(d));
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
        isDeleted: false,
      },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true,
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
            isOperational: true,
            ipfsCid: true,
            blockchainStatus: true,
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
      isArchived: document.isArchived,
      isDeleted: document.isDeleted,
      createdAt: document.createdAt,
      owner: document.owner,
      versions: document.versions.map((version) => ({
        id: version.id,
        versionNumber: version.versionNumber,
        comment: version.comment,
        createdAt: version.createdAt,
        isOperational: version.isOperational,
        ipfsCid: version.ipfsCid,
        blockchainStatus: version.blockchainStatus,
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
        isDeleted: false,
      },
      include: {
        versions: {
          where: versionNumber ? { versionNumber } : undefined,
          orderBy: versionNumber ? undefined : { versionNumber: 'desc' },
          take: versionNumber ? undefined : 20,
          select: {
            id: true,
            versionNumber: true,
            isOperational: true,
            ipfsCid: true,
            encryptedSymmetricKey: true,
          },
        },
      },
    });

    if (!document) {
      throw new Error('Documento público no encontrado');
    }

    const targetVersion = versionNumber
      ? document.versions.find((version) => version.versionNumber === versionNumber)
      : document.versions.find((version) => version.isOperational) || document.versions[0];

    if (!targetVersion || !targetVersion.ipfsCid) {
      throw new Error('No se encontró una versión pública descargable');
    }

    if (targetVersion.encryptedSymmetricKey !== 'UNENCRYPTED') {
      throw new Error('La versión solicitada no está publicada sin cifrado');
    }

    const file = await downloadFromIPFS(targetVersion.ipfsCid);

    return {
      file,
      name: document.name,
      mimeType: document.mimeType,
      versionNumber: targetVersion.versionNumber,
    };
  }

  /**
   * Marca un documento como fallido en blockchain.
   * @param documentId - UUID del documento.
   * @param error - Mensaje de error descriptivo.
   */
  static async markDocumentFailed(documentId: string, error: string): Promise<void> {
    await prisma.document.update({
      where: { id: documentId },
      data: {
        blockchainStatus: BlockchainStatus.FAILED,
        blockchainError: error,
      },
    });

    logger.error(`[DOCUMENT] Document ${documentId} marked as FAILED: ${error}`);
  }

  /**
   * Actualiza el estado de un documento a `SYNCED`.
   * @param documentId - UUID del documento.
   * @param blockchainId - Identificador en blockchain (bytes32).
   */
  static async markDocumentSynced(documentId: string, blockchainId: string): Promise<void> {
    await prisma.document.update({
      where: { id: documentId },
      data: {
        blockchainId,
        blockchainStatus: BlockchainStatus.SYNCED,
      },
    });

    logger.info(`[DOCUMENT] Document ${documentId} marked as SYNCED with blockchainId: ${blockchainId}`);
  }

  /**
   * Convierte un documento de Prisma al tipo `DocumentInfo`.
   * @param document - Objeto documento devuelto por Prisma.
   * @param role - Rol del usuario solicitante (opcional).
   * @returns Información normalizada del documento.
   */
  private static toDocumentInfo(document: any, role: DocumentInfo['role'] = null): DocumentInfo {
    const isEncrypted = document.encryptedSymmetricKey !== 'UNENCRYPTED';

    return {
      id: document.id,
      blockchainId: document.blockchainId,
      blockchainTxHash: document.blockchainTxHash,
      publicId: document.publicId ?? null,
      name: document.name,
      description: document.description,
      mimeType: document.mimeType,
      size: typeof document.size === 'string' ? Number(document.size) : Number(document.size),
      fileExtension: document.fileExtension ?? null,
      folderId: document.folderId ?? null,
      tags: document.tags ?? [],
      contentHash: document.contentHash,
      metadataHash: document.metadataHash,
      ownerId: document.ownerId,
      creatorWalletId: document.creatorWalletId,
      visibility: document.visibility === DocumentVisibility.PUBLIC ? 'PUBLIC' : 'PRIVATE',
      isEncrypted,
      encryptedSymmetricKey: document.encryptedSymmetricKey ?? null,
      encryptionIV: document.encryptionIV ?? null,
      encryptionAuthTag: document.encryptionAuthTag ?? null,
      ipfsCid: document.ipfsCid,
      blockchainStatus: document.blockchainStatus,
      isArchived: document.isArchived || false,
      archivedAt: document.archivedAt || null,
      role,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
      owner: document.owner
        ? {
            id: document.owner.id,
            username: document.owner.username,
            fullName: document.owner.fullName,
            avatarUrl: document.owner.avatarUrl ?? null,
          }
        : null,
    };
  }

  private static async resolveUserRole(document: Pick<Document, 'id' | 'ownerId' | 'blockchainId'>, userId: string): Promise<DocumentInfo['role']> {
    // Cuando existe blockchainId, se verifican propiedad y roles on-chain (única fuente de verdad)
    if (document.blockchainId) {
      const wallets = await prisma.wallet.findMany({
        where: { userId },
        select: { walletAddress: true },
      });

      for (const wallet of wallets) {
        const isOwner = await DocumentPermissionService.isOwner(document.blockchainId, wallet.walletAddress);
        if (isOwner) {
          return 'OWNER';
        }

        const role = await DocumentPermissionService.getUserRole(document.blockchainId, wallet.walletAddress);
        if (role === PermissionRole.EDITOR) {
          return 'SHARED_WRITE';
        }
        if (role === PermissionRole.VIEWER) {
          return 'SHARED_READ';
        }
      }

      return null;
    }

    // Fallback para documentos aún no registrados en blockchain
    if (document.ownerId === userId) {
      return 'OWNER';
    }

    return null;
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
        throw new Error('Document not found');
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

      // Eliminar de la base de datos (el borrado en cascada gestiona versiones, compartidos, etc.)
      await prisma.document.delete({
        where: { id: documentId },
      });

      // Desanclar de IPFS
      for (const cid of cidsToUnpin) {
        try {
          await deleteFromIPFS(cid);
          logger.info(`[ROLLBACK] Unpinned CID: ${cid}`);
        } catch (error) {
          logger.error(`[ROLLBACK] Failed to unpin CID ${cid}:`, error);
        }
      }

      // Registrar evento
      await prisma.event.create({
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

      logger.info(`[ROLLBACK] Document ${documentId} rolled back successfully`);
    } catch (error) {
      logger.error(`[ROLLBACK] Error rolling back document ${documentId}:`, error);
      throw error;
    }
  }
}

export default DocumentService;
