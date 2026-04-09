/**
 * Document Service - Refactored for Backend Encryption
 * 
 * This service implements the prepare/confirm pattern:
 * 1. prepareDocument: Receives UNENCRYPTED file, encrypts it, uploads to IPFS, creates DB record with PREPARING status
 * 2. confirmDocument: Updates DB record after frontend signs blockchain transaction
 * 
 * Backend NOW HANDLES:
 * - File encryption (AES-256-GCM)
 * - File validation (size, MIME type)
 * - IPFS upload
 * 
 * Backend DOES NOT:
 * - Sign blockchain transactions (user's wallet does this via frontend)
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
// Types
// ============================================

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
  categoryId?: string | null;
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
}

export interface PrepareDocumentInput {
  name: string;
  description?: string;
  mimeType: string;
  fileBuffer: Buffer;  // UNENCRYPTED file from frontend
  ownerId: string;
  walletId: string;
  visibility?: 'PRIVATE' | 'PUBLIC';
  folderId?: string;
  categoryId?: string;
  tags?: string[];
  fileExtension?: string;
}

export interface PrepareDocumentResult {
  docId: string;           // bytes32 for blockchain
  ipfsCid: string;         // CID of the encrypted file
  documentId: string;      // UUID of the document in DB
  publicId: string | null;
}

export interface PaginatedDocumentInfo {
  documents: DocumentInfo[];
  total: number;
  page: number;
  totalPages: number;
}

export interface PublicDocumentVersionInfo {
  id: string;
  versionNumber: number;
  comment: string | null;
  createdAt: Date;
  isOperational: boolean;
  ipfsCid: string | null;
  blockchainStatus: BlockchainStatus;
}

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

export interface ConfirmDocumentInput {
  documentId: string;
  txHash: string;
  blockchainId: string;
}

// ============================================
// Document Service Class
// ============================================

export class DocumentService {
  /**
   * Prepare a document for creation
   * - Validates file (size, MIME type)
   * - Encrypts file with AES-256-GCM
   * - Uploads encrypted file to IPFS
   * - Creates DB record with PREPARING status
   * - Returns data needed for frontend to sign blockchain transaction
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
      categoryId,
      tags,
      fileExtension,
    } = input;

    let ipfsCid: string | null = null;

    try {
      // 1. Validate wallet belongs to user
      const wallet = await prisma.wallet.findFirst({
        where: {
          id: walletId,
          userId: ownerId,
        },
      });

      if (!wallet) {
        throw new Error('Wallet no encontrada o no pertenece al usuario');
      }

      // 2. Get user's public key for encryption
      const user = await prisma.user.findUnique({
        where: { id: ownerId },
        select: { publicKey: true },
      });

      if (!user || !user.publicKey) {
        throw new Error('Usuario no tiene clave pública configurada');
      }

      // 3. Validate file
      Encryption.validateFileSize(fileBuffer.length, 100); // Max 100MB
      // MIME type validation is optional - can add whitelist here if needed
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

      // 7. Generate docId (bytes32 for blockchain)
      const docId = ethers.id(`${ownerId}-${walletId}-${ipfsCid}-${Date.now()}`);

      // 8. Calculate metadata hash
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

      // 9. Create document in DB with PREPARING status
      const document = await prisma.document.create({
        data: {
          id: uuidv4(),
          blockchainId: undefined, // Will be set after blockchain confirmation
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
          categoryId: categoryId || null,
          tags: tags || [],
          // Store encryption metadata
          encryptionIV: encryptionResult?.iv ?? null,
          encryptionAuthTag: encryptionResult?.authTag ?? null,
        },
      });

      logger.info(`[PREPARE] Documento creado en DB: ${document.id}, estado: PREPARING`);

      // 5. Log the preparation
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

      // Cleanup IPFS if upload succeeded but DB failed
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
   * Confirm a document after blockchain transaction
   * - Updates DB record with TX_SUBMITTED status
   * - Event listener will update to SYNCED when confirmed
   */
  static async confirmDocument(input: ConfirmDocumentInput): Promise<DocumentInfo> {
    const { documentId, txHash, blockchainId } = input;

    // 1. Find the document
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

    // 2. Validate current status
    if (document.blockchainStatus !== BlockchainStatus.PREPARING) {
      logger.warn(`[CONFIRM] Documento ${documentId} no está en estado PREPARING (actual: ${document.blockchainStatus})`);
      // Still proceed but log the warning
    }

    // 3. Update document with transaction info
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
   * Get document by ID
   */
  static async getDocumentById(documentId: string, userId: string): Promise<DocumentInfo | null> {
    // Check if user has access
    const hasAccess = await this.userHasAccess(documentId, userId);
    if (!hasAccess) {
      return null;
    }

    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document || document.isDeleted) return null;

    const role = await this.resolveUserRole(document, userId);

    return this.toDocumentInfo(document, role);
  }

  /**
   * List documents for a user
   * Can filter by wallet, folder, category, and archived status
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
      categoryId?: string;
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
      categoryId,
      search,
      fileType,
    } = options || {};
    const normalizedFileType = normalizeFileExtensionFilter(fileType);

    const where: any = {
      ownerId: userId,
      isDeleted: false,
    };

    // Archive filtering
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

    if (categoryId) {
      where.categoryId = categoryId;
    }

    // Search by name
    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive',
      };
    }

    // Filter by file type
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
   * Download document (returns encrypted file from IPFS)
   * Decryption happens in frontend
   */
  static async downloadDocument(documentId: string, userId: string): Promise<{
    encryptedFile: Buffer;
    encryptedSymmetricKey: string;
    encryptionIV: string | null;
    encryptionAuthTag: string | null;
    name: string;
    mimeType: string;
  }> {
    // Check access
    const hasAccess = await this.userHasAccess(documentId, userId);
    if (!hasAccess) {
      throw new Error('Acceso denegado');
    }

    // Get document
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

    // Download from IPFS
    const encryptedFile = await downloadFromIPFS(operationalVersion.ipfsCid);

    // Log download
    await prisma.event.create({
      data: {
        id: uuidv4(),
        eventType: 'DOCUMENT_DOWNLOADED',
        userId,
        documentId: document.id,
      },
    });

    // Update stats
    await prisma.documentStats.update({
      where: { documentId: document.id },
      data: {
        totalDownloads: { increment: 1 },
        lastActivityAt: new Date(),
      },
    }).catch(() => {
      // Stats might not exist, ignore
    });

    return {
      encryptedFile,
      encryptedSymmetricKey: operationalVersion.encryptedSymmetricKey || document.encryptedSymmetricKey || 'UNENCRYPTED',
      encryptionIV: operationalVersion.encryptionIV || document.encryptionIV || null,
      encryptionAuthTag: operationalVersion.encryptionAuthTag || document.encryptionAuthTag || null,

      name: document.name,
      mimeType: document.mimeType,
    };
  }

  /**
   * Check if user has access to a document
   */
  static async userHasAccess(documentId: string, userId: string): Promise<boolean> {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      select: { ownerId: true, blockchainId: true, visibility: true, isDeleted: true },
    });

    if (!document) return false;

    if (document.isDeleted) return false;

    // Owner has access
    if (document.ownerId === userId) return true;

    if (document.visibility === DocumentVisibility.PUBLIC) {
      return true;
    }

    // Check if any linked wallet has access on chain.
    if (document.blockchainId) {
      const wallets = await prisma.wallet.findMany({
        where: { userId },
        select: { walletAddress: true },
      });

      if (wallets.length > 0) {
        for (const wallet of wallets) {
          try {
            const documents = await BlockchainQueries.getUserDocuments(wallet.walletAddress);
            if (documents.includes(document.blockchainId)) {
              return true;
            }
          } catch {
            // Fall through to the confirmed-share fallback below.
          }
        }
      }
    }

    // Fallback for contract revisions that do not expose the same permission getters.
    const { ShareService } = await import('./shareService');
    const fallbackShares = await ShareService.getSharedWithUser(userId);
    if (fallbackShares.some((share) => share.documentId === documentId)) {
      return true;
    }

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
   * Get documents by wallet
   */
  static async getDocumentsByWallet(userId: string, walletId: string): Promise<DocumentInfo[]> {
    // Verify wallet belongs to user
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
    });

    return documents.map(d => this.toDocumentInfo(d));
  }

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
   * Mark document as failed
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
   * Update document status to SYNCED
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
   * Convert Prisma document to DocumentInfo
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
      categoryId: document.categoryId ?? null,
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
    };
  }

  private static async resolveUserRole(document: Pick<Document, 'id' | 'ownerId' | 'blockchainId'>, userId: string): Promise<DocumentInfo['role']> {
    if (document.ownerId === userId) {
      return 'OWNER';
    }

    if (document.blockchainId) {
      const wallets = await prisma.wallet.findMany({
        where: { userId },
        select: { walletAddress: true },
      });

      for (const wallet of wallets) {
        const role = await DocumentPermissionService.getUserRole(document.blockchainId, wallet.walletAddress);

        if (role === PermissionRole.EDITOR) {
          return 'SHARED_WRITE';
        }

        if (role === PermissionRole.VIEWER) {
          return 'SHARED_READ';
        }
      }
    }

    const { ShareService } = await import('./shareService');
    const shares = await ShareService.getSharedWithUser(userId);
    const matchingShare = shares.find((share) => share.documentId === document.id);

    return matchingShare?.role ?? null;
  }

  /**
   * Rollback document creation
   * - Deletes document and all versions from DB
   * - Unpins all IPFS CIDs
   * - Used when blockchain transaction fails after prepare
   */
  static async rollbackDocument(documentId: string, userId: string): Promise<void> {
    try {
      // Get document with versions
      const document = await prisma.document.findUnique({
        where: { id: documentId },
        include: { versions: true },
      });

      if (!document) {
        throw new Error('Document not found');
      }

      // Verify ownership
      if (document.ownerId !== userId) {
        throw new Error('No tienes permiso para eliminar este documento');
      }

      // Collect all IPFS CIDs to unpin (from versions only)
      const cidsToUnpin: string[] = [];
      document.versions.forEach(v => {
        if (v.ipfsCid) {
          cidsToUnpin.push(v.ipfsCid);
        }
      });

      // Delete from database (cascade delete will handle versions, shares, etc.)
      await prisma.document.delete({
        where: { id: documentId },
      });

      // Unpin from IPFS
      for (const cid of cidsToUnpin) {
        try {
          await deleteFromIPFS(cid);
          logger.info(`[ROLLBACK] Unpinned CID: ${cid}`);
        } catch (error) {
          logger.error(`[ROLLBACK] Failed to unpin CID ${cid}:`, error);
        }
      }

      // Log event
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
