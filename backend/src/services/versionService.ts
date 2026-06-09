/**
 * Version Service - Refactored for Backend Encryption
 * 
 * This service implements the prepare/confirm pattern:
 * 1. prepareVersion: Receives UNENCRYPTED file, encrypts it, uploads to IPFS, creates DB record
 * 2. confirmVersion: Updates DB record after frontend signs blockchain transaction
 */

import { v4 as uuidv4 } from 'uuid';
import prisma from '../config/database';
import { uploadToIPFS, deleteFromIPFS, downloadFromIPFS } from '../config/ipfs';
import { BlockchainStatus } from '@prisma/client';
import logger from '../utils/logger';
import * as Encryption from '../lib/encryption';
import { DocumentPermissionService } from './documentPermissionService';
import { provider, getContracts } from '../config/blockchain';
import { BlockchainCacheService } from './blockchainCacheService';
import { userHasAccess } from '../utils/accessControl';
import { validateWalletBelongsToUser, getUserWithPublicKey } from '../utils/walletHelper';
import {
  assertOperationalVersionChangedReceipt,
  assertVersionCreatedReceipt,
  assertVersionRestoredReceipt,
} from './blockchainReceiptService';
import { ethers } from 'ethers';

// ============================================
// Types
// ============================================

/**
 * Información de una versión de documento.
 * @property id - Identificador de la versión
 * @property documentId - ID del documento padre
 * @property userId - ID del usuario creador
 * @property versionNumber - Número secuencial de versión
 * @property ipfsCid - CID de IPFS del contenido cifrado
 * @property comment - Comentario descriptivo
 * @property isEncrypted - Indica si el contenido está cifrado
 * @property blockchainStatus - Estado de sincronización en blockchain
 * @property blockchainTxHash - Hash de la transacción
 * @property isOperational - Indica si es la versión activa actualmente
 * @property createdAt - Fecha de creación
 */
export interface VersionInfo {
  id: string;
  documentId: string;
  userId: string;
  versionNumber: number;
  ipfsCid: string | null;
  comment: string | null;
  isEncrypted: boolean;
  blockchainStatus: BlockchainStatus;
  blockchainTxHash: string | null;
  isOperational: boolean;
  createdAt: Date;
}

/**
 * Datos de entrada para preparar una nueva versión.
 * @property documentId - ID del documento
 * @property fileBuffer - Archivo sin cifrar recibido del frontend
 * @property comment - Comentario descriptivo (opcional)
 * @property userId - ID del usuario creador
 * @property walletId - Wallet utilizada para la operación
 */
export interface PrepareVersionInput {
  documentId: string;
  fileBuffer: Buffer;  // UNENCRYPTED file from frontend
  comment?: string;
  userId: string;
  walletId: string;
}

/**
 * Resultado de la preparación de una versión.
 * @property versionId - ID de la versión creada en base de datos
 * @property ipfsCid - CID del archivo subido a IPFS
 * @property blockchainId - ID para la transacción en blockchain
 * @property versionNumber - Número asignado a la versión
 */
export interface PrepareVersionResult {
  versionId: string;
  ipfsCid: string;
  blockchainId: string;
  versionNumber: number;
  encryptedKeyHash: string;
}

/**
 * Datos de entrada para confirmar una versión.
 * @property versionId - ID de la versión en base de datos
 * @property txHash - Hash de la transacción blockchain
 * @property blockchainVersionNumber - Número de versión en blockchain
 */
export interface ConfirmVersionInput {
  versionId: string;
  txHash: string;
  blockchainVersionNumber: number;
  confirmerUserId: string;
}

/**
 * Datos de entrada para preparar el cambio de versión operacional.
 * @property documentId - ID del documento
 * @property versionNumber - Versión a activar
 * @property userId - ID del solicitante
 */
export interface PrepareSetOperationalInput {
  documentId: string;
  versionNumber: number;
  userId: string;
}

/**
 * Resultado de la preparación del cambio de versión operacional.
 * @property blockchainId - ID del documento en blockchain
 * @property versionNumber - Versión a activar
 * @property documentName - Nombre del documento
 */
export interface PrepareSetOperationalResult {
  blockchainId: string;
  versionNumber: number;
  documentName: string;
}

/**
 * Datos de entrada para confirmar el cambio de versión operacional.
 * @property documentId - ID del documento
 * @property versionNumber - Versión activada
 * @property txHash - Hash de la transacción
 * @property userId - ID del usuario confirmante
 */
export interface ConfirmSetOperationalInput {
  documentId: string;
  versionNumber: number;
  txHash: string;
  userId: string;
}

/**
 * Servicio de gestión de versiones de documentos.
 * Implementa el patrón prepare/confirm para crear, restaurar y cambiar versiones operacionales,
 * incluyendo cifrado backend y almacenamiento descentralizado en IPFS.
 */
export class VersionService {
  /**
   * Prepare a version for creation
   * - Validates file (size, MIME type)
   * - Encrypts file with AES-256-GCM
   * - Uploads encrypted file to IPFS
   * - Creates DB record with PREPARING status
   * - Returns data needed for frontend to sign blockchain transaction
   */
  static async prepareVersion(input: PrepareVersionInput): Promise<PrepareVersionResult> {
    const {
      documentId,
      fileBuffer,
      comment,
      userId,
      walletId,
    } = input;

    let ipfsCid: string | null = null;

    try {
      // 1. Validate wallet belongs to user
      const wallet = await validateWalletBelongsToUser(walletId, userId);

      // 2. Check document access
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      select: {
        id: true,
        ownerId: true,
        blockchainId: true,
        name: true,
        visibility: true,
      },
    });

      if (!document) {
        throw new Error('Documento no encontrado');
      }

      // Soft-delete check: cannot create versions on deleted documents
      if (document.blockchainId && await BlockchainCacheService.isDocumentDeleted(document.blockchainId)) {
        throw new Error('No se pueden crear versiones en documentos eliminados');
      }

      if (document.blockchainId && await BlockchainCacheService.isDocumentArchived(document.blockchainId)) {
        throw new Error('No se pueden crear versiones en documentos archivados');
      }

      // Verify write access ON-CHAIN (sole source of truth)
      let hasWriteAccess = false;
      if (document.blockchainId) {
        const isOwnerOnChain = await DocumentPermissionService.isOwner(
          document.blockchainId,
          wallet.walletAddress
        );
        if (isOwnerOnChain) {
          hasWriteAccess = true;
        } else {
          hasWriteAccess = await DocumentPermissionService.canEdit(
            document.blockchainId,
            wallet.walletAddress
          );
        }
      } else if (document.ownerId === userId) {
        // Fallback for documents not yet on chain
        hasWriteAccess = true;
      }

      if (!hasWriteAccess) {
        throw new Error('No tienes permisos para crear versiones de este documento');
      }

      // 3. Get user's public key for encryption
      const { publicKey: userPublicKey } = await getUserWithPublicKey(userId);

      const isPublicDocument = document.visibility === 'PUBLIC';

      // 4. Validate and encrypt file
      Encryption.validateFileSize(fileBuffer.length, 100); // Max 100MB

      const encryptionResult = isPublicDocument ? null : Encryption.encryptFile(fileBuffer);
      const encryptedSymmetricKey = encryptionResult
        ? Encryption.encryptSymmetricKey(encryptionResult.symmetricKey, userPublicKey)
        : 'UNENCRYPTED';

      ipfsCid = await uploadToIPFS(encryptionResult ? encryptionResult.encryptedData : fileBuffer);
      logger.info(`[PREPARE] Versión subida a IPFS: ${ipfsCid}`);

      // 7. Generate blockchain ID
      const blockchainId = `version-${documentId}-${Date.now()}`;

      // 8. Compute and create the next version in one transaction. The unique
      // constraint on (documentId, versionNumber) remains the final safeguard.
      const version = await prisma.$transaction(async (tx) => {
        const latestVersion = await tx.version.aggregate({
          where: { documentId },
          _max: { versionNumber: true },
        });
        const nextVersionNumber = (latestVersion._max.versionNumber ?? 0) + 1;

        const createdVersion = await tx.version.create({
          data: {
            id: uuidv4(),
            documentId,
            userId,
            versionNumber: nextVersionNumber,
            encryptedSymmetricKey,
            ipfsCid,
            comment: comment || null,
            blockchainStatus: BlockchainStatus.PREPARING,
            encryptionIV: encryptionResult?.iv ?? null,
            encryptionAuthTag: encryptionResult?.authTag ?? null,
          },
        });

        await tx.event.create({
          data: {
            id: uuidv4(),
            eventType: 'VERSION_PREPARED',
            userId,
            documentId: document.id,
            metadata: {
              versionId: createdVersion.id,
              blockchainId,
              ipfsCid,
              walletId,
            },
          },
        });

        return createdVersion;
      });

      logger.info(`[PREPARE] Versión creada en DB: ${version.id}, estado: PREPARING`);

      const shareKeys = await prisma.documentShareKey.findMany({
        where: { documentId },
        include: { user: { select: { publicKey: true } } },
      });
      for (const shareKey of shareKeys) {
        const reEncryptedKey = Encryption.encryptSymmetricKey(encryptedSymmetricKey, shareKey.user.publicKey);
        await prisma.documentShareKey.update({
          where: { id: shareKey.id },
          data: { encryptedSymmetricKey: reEncryptedKey },
        });
      }

      const encryptedKeyHash = ethers.id(encryptedSymmetricKey);

      return {
        versionId: version.id,
        ipfsCid,
        blockchainId,
        versionNumber: version.versionNumber,
        encryptedKeyHash,
      };

    } catch (error) {
      logger.error('[PREPARE] Error al preparar versión:', error);

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
   * Confirm a version after blockchain transaction
   * - Updates DB record with TX_SUBMITTED status
   * - Event listener will update to SYNCED when confirmed
   */
  static async confirmVersion(input: ConfirmVersionInput): Promise<VersionInfo> {
    const { versionId, txHash, blockchainVersionNumber, confirmerUserId } = input;

    // 1. Find the version
    const version = await prisma.version.findUnique({
      where: { id: versionId },
      include: { document: true },
    });

    if (!version) {
      throw new Error('Versión no encontrada');
    }

    if (version.blockchainStatus !== BlockchainStatus.PREPARING) {
      throw new Error(`La versión no puede confirmarse en estado ${version.blockchainStatus}`);
    }

    const hasAccess = await userHasAccess(version.documentId, confirmerUserId);
    if (!hasAccess) {
      throw new Error('No tienes permisos para confirmar esta versión');
    }

    if (!version.document.blockchainId) {
      throw new Error('El documento no tiene ID de blockchain');
    }

    if (!version.ipfsCid) {
      throw new Error('La versión no tiene CID de IPFS');
    }

    const preparedEvent = await prisma.event.findFirst({
      where: { eventType: 'VERSION_PREPARED', documentId: version.documentId },
      orderBy: { createdAt: 'desc' },
    });
    const metadata = preparedEvent?.metadata as { versionId?: unknown; walletId?: unknown } | null;
    const walletId = metadata?.versionId === versionId && typeof metadata.walletId === 'string'
      ? metadata.walletId
      : null;
    const wallet = walletId
      ? await prisma.wallet.findFirst({ where: { id: walletId, userId: confirmerUserId } })
      : null;

    await assertVersionCreatedReceipt({
      txHash,
      docId: version.document.blockchainId,
      versionNumber: blockchainVersionNumber || version.versionNumber,
      ipfsCid: version.ipfsCid,
      createdByAddress: wallet?.walletAddress,
    });

    // 3. Update version with transaction info
    let updated = await prisma.version.update({
      where: { id: versionId },
      data: {
        blockchainStatus: BlockchainStatus.TX_SUBMITTED,
        blockchainTxHash: txHash,
      },
    });

    logger.info(`[CONFIRM] Versión ${versionId} actualizada a TX_SUBMITTED`);

    // 4. Try to get receipt immediately (Hardhat mines instantly)
    let isNowOperational = false;
    try {
      if (txHash && provider) {
        const receipt = await provider.getTransactionReceipt(txHash);
        if (receipt && receipt.status === 1) {
          updated = await prisma.$transaction(async (tx) => {
            const synced = await tx.version.update({
              where: { id: versionId },
              data: {
                blockchainStatus: BlockchainStatus.SYNCED,
              },
            });
            return synced;
          });
          isNowOperational = true;
          logger.info(`[CONFIRM] Versión ${versionId} sincronizada inmediatamente a SYNCED`);
        }
      }
    } catch (syncErr: any) {
      logger.warn(`[CONFIRM] No se pudo sincronizar versión ${versionId} inmediatamente: ${syncErr.message}`);
    }

    // 5. Log the confirmation
    await prisma.event.create({
      data: {
        id: uuidv4(),
        eventType: 'VERSION_TX_SUBMITTED',
        userId: version.userId,
        documentId: version.documentId,
        transactionHash: txHash,
        metadata: {
          versionId: version.id,
          blockchainVersionNumber,
          previousStatus: version.blockchainStatus,
        },
      },
    });

    return this.toVersionInfo(updated, isNowOperational);
  }

  /**
   * Get versions for a document
   */
  static async getDocumentVersions(documentId: string, userId: string): Promise<VersionInfo[]> {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new Error('Documento no encontrado');
    }

    const hasAccess = await userHasAccess(documentId, userId);

    if (!hasAccess) {
      throw new Error('No tienes acceso a este documento');
    }

    const versions = await prisma.version.findMany({
      where: { documentId },
      orderBy: { versionNumber: 'desc' },
    });

    // Consultar on-chain cuál es la versión operacional actual (fuente de verdad)
    let currentOnchainVersion = 0;
    try {
      if (document.blockchainId) {
        const contracts = getContracts();
        const docOnchain = await contracts.documentRegistry.getDocument(document.blockchainId);
        currentOnchainVersion = Number(docOnchain.currentVersion);
      }
    } catch (chainErr: any) {
      logger.warn(`[GET_VERSIONS] Error consultando versión operacional on-chain: ${chainErr.message}`);
    }

    return versions.map(v => this.toVersionInfo(v, v.versionNumber === currentOnchainVersion));
  }

  /**
   * Get a specific version
   */
  static async getVersion(versionId: string, userId: string): Promise<VersionInfo | null> {
    const version = await prisma.version.findUnique({
      where: { id: versionId },
      include: {
        document: {
          select: { id: true },
        },
      },
    });

    if (!version) return null;

    const hasAccess = await userHasAccess(version.document.id, userId);

    if (!hasAccess) return null;

    return this.toVersionInfo(version);
  }

  /**
   * Set a document version as operational.
   */
  static async setOperationalVersion(documentId: string, versionNumber: number, userId: string): Promise<VersionInfo> {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      select: {
        id: true,
        ownerId: true,
        blockchainId: true,
        name: true,
      }
    });

    if (!document) {
      throw new Error('Documento no encontrado');
    }

    // Validate ownership (on-chain or DB fallback)
    await DocumentPermissionService.validateOwnership(document, userId, {
      errorMessage: 'Solo el propietario puede cambiar la versión operacional',
    });

    if (document.blockchainId && await BlockchainCacheService.isDocumentDeleted(document.blockchainId)) {
      throw new Error('No se pueden cambiar versiones en documentos eliminados');
    }

    if (document.blockchainId && await BlockchainCacheService.isDocumentArchived(document.blockchainId)) {
      throw new Error('No se pueden cambiar versiones en documentos archivados');
    }

    const targetVersion = await prisma.version.findFirst({
      where: { documentId, versionNumber },
    });

    if (!targetVersion) {
      throw new Error(`Versión ${versionNumber} no encontrada`);
    }

    if (
      targetVersion.blockchainStatus !== BlockchainStatus.SYNCED &&
      targetVersion.blockchainStatus !== BlockchainStatus.TX_SUBMITTED
    ) {
      throw new Error('Solo se puede activar una versión enviada a blockchain');
    }

    const currentOperational = await BlockchainCacheService.getOperationalVersionNumber(document.blockchainId!);
    if (targetVersion.versionNumber === currentOperational) {
      return this.toVersionInfo(targetVersion, true);
    }

    await prisma.$transaction(async (tx) => {

      await tx.event.create({
        data: {
          id: uuidv4(),
          eventType: 'OperationalVersionChanged',
          userId,
          documentId,
          metadata: {
            versionId: targetVersion.id,
            versionNumber,
          },
        },
      });

    });

    logger.info(`[VERSION] Documento ${documentId} cambió la versión operacional a v${versionNumber}`);

    return this.toVersionInfo(targetVersion, true);
  }

  /**
   * Prepare set operational version (on-chain prepare phase)
   */
  static async prepareSetOperational(input: PrepareSetOperationalInput): Promise<PrepareSetOperationalResult> {
    const { documentId, versionNumber, userId } = input;

    const document = await prisma.document.findUnique({
      where: { id: documentId },
      select: {
        id: true,
        ownerId: true,
        blockchainId: true,
        name: true,
      },
    });

    if (!document) {
      throw new Error('Documento no encontrado');
    }

    // Validate ownership ON-CHAIN if blockchainId exists
    if (document.blockchainId) {
      const wallet = await prisma.wallet.findFirst({ where: { userId } });
      if (!wallet) throw new Error('Wallet no encontrada');
      const isOwnerOnChain = await DocumentPermissionService.isOwner(document.blockchainId, wallet.walletAddress);
      if (!isOwnerOnChain) {
        throw new Error('Solo el propietario puede cambiar la versión operacional');
      }
    } else if (document.ownerId !== userId) {
      throw new Error('Solo el propietario puede cambiar la versión operacional');
    }

    if (document.blockchainId && await BlockchainCacheService.isDocumentDeleted(document.blockchainId)) {
      throw new Error('No se pueden cambiar versiones en documentos eliminados');
    }

    if (document.blockchainId && await BlockchainCacheService.isDocumentArchived(document.blockchainId)) {
      throw new Error('No se pueden cambiar versiones en documentos archivados');
    }

    if (!document.blockchainId) {
      throw new Error('El documento no está registrado en blockchain');
    }

    const targetVersion = await prisma.version.findFirst({
      where: { documentId, versionNumber },
    });

    if (!targetVersion) {
      throw new Error(`Versión ${versionNumber} no encontrada`);
    }

    if (
      targetVersion.blockchainStatus !== BlockchainStatus.SYNCED &&
      targetVersion.blockchainStatus !== BlockchainStatus.TX_SUBMITTED
    ) {
      throw new Error('Solo se puede activar una versión enviada a blockchain');
    }

    const operationalVersion = await BlockchainCacheService.getOperationalVersionNumber(document.blockchainId!);
    if (targetVersion.versionNumber === operationalVersion) {
      throw new Error('Esta versión ya es la operacional');
    }

    return {
      blockchainId: document.blockchainId,
      versionNumber,
      documentName: document.name,
    };
  }

  /**
   * Confirm set operational version (on-chain confirm phase)
   */
  static async confirmSetOperational(input: ConfirmSetOperationalInput): Promise<void> {
    const { documentId, versionNumber, txHash, userId } = input;

    const document = await prisma.document.findUnique({
      where: { id: documentId },
      select: {
        id: true,
        ownerId: true,
        blockchainId: true,
        name: true,
      },
    });

    if (!document) {
      throw new Error('Documento no encontrado');
    }

    // Validate ownership (on-chain or DB fallback)
    await DocumentPermissionService.validateOwnership(document, userId, {
      errorMessage: 'Solo el propietario puede cambiar la versión operacional',
    });

    if (document.blockchainId && (await BlockchainCacheService.isDocumentDeleted(document.blockchainId) || await BlockchainCacheService.isDocumentArchived(document.blockchainId))) {
      throw new Error('No se pueden cambiar versiones en documentos eliminados o archivados');
    }

    const targetVersion = await prisma.version.findFirst({
      where: { documentId, versionNumber },
    });

    if (!targetVersion) {
      throw new Error(`Versión ${versionNumber} no encontrada`);
    }

    if (!document.blockchainId) {
      throw new Error('El documento no está registrado en blockchain');
    }

    const ownership = await DocumentPermissionService.validateOwnership(document, userId, {
      errorMessage: 'Solo el propietario puede cambiar la versión operacional',
    });

    await assertOperationalVersionChangedReceipt({
      txHash,
      docId: document.blockchainId,
      newVersion: versionNumber,
      actorAddress: ownership.wallet.walletAddress,
    });

    await prisma.event.create({
      data: {
        id: uuidv4(),
        eventType: 'OPERATIONAL_VERSION_TX_SUBMITTED',
        userId,
        documentId,
        transactionHash: txHash,
        metadata: {
          versionId: targetVersion.id,
          versionNumber,
        },
      },
    });

    logger.info(`[VERSION] Confirmación de cambio de versión operacional registrada para documento ${documentId} a v${versionNumber}, txHash=${txHash}`);
  }

  /**
   * Download version (returns encrypted file from IPFS)
   */
  static async downloadVersion(versionId: string, userId: string): Promise<{
    encryptedFile: Buffer;
    ipfsCid: string;
    encryptedSymmetricKey: string;
    encryptionIV: string | null;
    encryptionAuthTag: string | null;
    documentName: string;
    versionNumber: number;
    mimeType: string;
  }> {
    const version = await prisma.version.findUnique({
      where: { id: versionId },
      include: {
        document: {
          select: {
            id: true,
            ownerId: true,
            blockchainId: true,
            visibility: true,
            encryptedSymmetricKey: true,
            name: true,
            mimeType: true,
          },
        },
      },
    });

    if (!version) {
      throw new Error('Versión no encontrada');
    }

    const hasAccess = await userHasAccess(version.document.id, userId);

    if (!hasAccess) {
      throw new Error('No tienes acceso a esta versión');
    }

    if (!version.ipfsCid) {
      throw new Error('Versión no tiene archivo en IPFS');
    }

    // Download from IPFS
    const encryptedFile = await downloadFromIPFS(version.ipfsCid);

    // If user is not owner, check for DocumentShareKey
    let versionEncryptedSymmetricKey = version.encryptedSymmetricKey || version.document.encryptedSymmetricKey || 'UNENCRYPTED';
    if (userId !== version.document.ownerId) {
      const shareKey = await prisma.documentShareKey.findUnique({
        where: { documentId_userId: { documentId: version.documentId, userId } }
      });
      if (shareKey) {
        versionEncryptedSymmetricKey = shareKey.encryptedSymmetricKey;
      }
    }

    return {
      encryptedFile,
      ipfsCid: version.ipfsCid,
      encryptedSymmetricKey: versionEncryptedSymmetricKey,
      encryptionIV: version.encryptionIV || null,
      encryptionAuthTag: version.encryptionAuthTag || null,
      documentName: version.document.name,
      versionNumber: version.versionNumber,
      mimeType: version.document.mimeType,
    };
  }

  /**
   * Mark version as failed
   */
  static async markVersionFailed(versionId: string, error: string): Promise<void> {
    await prisma.version.update({
      where: { id: versionId },
      data: {
        blockchainStatus: BlockchainStatus.FAILED,
        blockchainError: error,
      },
    });

    logger.error(`[VERSION] Version ${versionId} marked as FAILED: ${error}`);
  }

  /**
   * Update version status to SYNCED
   */
  static async markVersionSynced(versionId: string): Promise<void> {
    await prisma.version.update({
      where: { id: versionId },
      data: {
        blockchainStatus: BlockchainStatus.SYNCED,
      },
    });

    logger.info(`[VERSION] Version ${versionId} marked as SYNCED`);
  }

  /**
   * Convert Prisma version to VersionInfo
   */
  private static toVersionInfo(version: any, isOperational: boolean = false): VersionInfo {
    return {
      id: version.id,
      documentId: version.documentId,
      userId: version.userId,
      versionNumber: version.versionNumber,
      ipfsCid: version.ipfsCid,
      comment: version.comment,
      isEncrypted: version.encryptedSymmetricKey !== 'UNENCRYPTED',
      blockchainStatus: version.blockchainStatus,
      blockchainTxHash: version.blockchainTxHash,
      isOperational,
      createdAt: version.createdAt,
    };
  }

  /**
   * Rollback version creation
   * - Deletes version from DB
   * - Unpins IPFS CID
   * - Used when blockchain transaction fails after prepare
   */
  static async rollbackVersion(versionId: string, userId: string): Promise<void> {
    try {
      // Get version with document
      const version = await prisma.version.findUnique({
        where: { id: versionId },
        include: {
          document: {
            select: { ownerId: true, blockchainId: true },
          },
        },
      });

      if (!version) {
        throw new Error('Versión no encontrada');
      }

      // Verify ownership (on-chain or DB fallback)
      await DocumentPermissionService.validateOwnership(version.document, userId, {
        errorMessage: 'No tienes permiso para eliminar esta versión',
      });

      const ipfsCid = version.ipfsCid;

      // Delete from database
      await prisma.version.delete({
        where: { id: versionId },
      });

      // Unpin from IPFS
      if (ipfsCid) {
        try {
          await deleteFromIPFS(ipfsCid);
          logger.info(`[VERSION_ROLLBACK] Unpinned CID: ${ipfsCid}`);
        } catch (error) {
          logger.error(`[VERSION_ROLLBACK] Failed to unpin CID ${ipfsCid}:`, error);
        }
      }

      // Log event
      await prisma.event.create({
        data: {
          id: uuidv4(),
          eventType: 'VERSION_ROLLBACK',
          userId,
          documentId: version.documentId,
          metadata: {
            versionId,
            versionNumber: version.versionNumber,
            cidUnpinned: ipfsCid,
          },
        },
      });

      logger.info(`[VERSION_ROLLBACK] Version ${versionId} rolled back successfully`);
    } catch (error) {
      logger.error(`[VERSION_ROLLBACK] Error rolling back version ${versionId}:`, error);
      throw error;
    }
  }

  /**
   * Rollback version restore
   * - Deletes version from DB
   * - DOES NOT unpin IPFS (CID belongs to original version)
   * - Used when blockchain transaction fails after restore prepare
   */
  static async rollbackVersionRestore(versionId: string, userId: string): Promise<void> {
    try {
      // Get version with document
      const version = await prisma.version.findUnique({
        where: { id: versionId },
        include: {
          document: {
            select: { ownerId: true, blockchainId: true },
          },
        },
      });

      if (!version) {
        throw new Error('Versión no encontrada');
      }

      // Verify ownership (on-chain or DB fallback)
      await DocumentPermissionService.validateOwnership(version.document, userId, {
        errorMessage: 'No tienes permiso para eliminar esta versión',
      });

      // Delete from database (do NOT unpin IPFS - it belongs to the original version)
      await prisma.version.delete({
        where: { id: versionId },
      });

      // Log event
      await prisma.event.create({
        data: {
          id: uuidv4(),
          eventType: 'VERSION_RESTORE_ROLLBACK',
          userId,
          documentId: version.documentId,
          metadata: {
            versionId,
            versionNumber: version.versionNumber,
            ipfsCidPreserved: version.ipfsCid,
          },
        },
      });

      logger.info(`[VERSION_RESTORE_ROLLBACK] Version ${versionId} restore rolled back (IPFS preserved)`);
    } catch (error) {
      logger.error(`[VERSION_RESTORE_ROLLBACK] Error rolling back version restore ${versionId}:`, error);
      throw error;
    }
  }

  /**
   * Prepare a version restore (creates a new version pointing to same IPFS CID as an older version).
   * No file upload is required — the encrypted content is reused.
   */
  static async prepareRestoreVersion(
    documentId: string,
    versionNumber: number,
    userId: string,
    walletId?: string,
  ): Promise<{ versionId: string; blockchainId: string }> {
    // 1. Optionally validate wallet belongs to user (walletId may not be sent by frontend)
    if (walletId) {
      const wallet = await prisma.wallet.findFirst({
        where: { id: walletId, userId },
      });
      if (!wallet) {
        throw new Error('Wallet no encontrada o no pertenece al usuario');
      }
    }

    // 2. Find document and verify ownership/permission
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });
    if (!document) {
      throw new Error('Documento no encontrado');
    }
    // Validate ownership (on-chain or DB fallback)
    await DocumentPermissionService.validateOwnership(document, userId, {
      errorMessage: 'Solo el propietario puede restaurar versiones',
    });

    if (document.blockchainId && await BlockchainCacheService.isDocumentDeleted(document.blockchainId)) {
      throw new Error('No se pueden restaurar versiones en documentos eliminados');
    }

    if (document.blockchainId && await BlockchainCacheService.isDocumentArchived(document.blockchainId)) {
      throw new Error('No se pueden restaurar versiones en documentos archivados');
    }

    // 3. Find the source version to restore
    const sourceVersion = await prisma.version.findFirst({
      where: { documentId, versionNumber },
    });
    if (!sourceVersion) {
      throw new Error(`Versión ${versionNumber} no encontrada`);
    }
    if (!sourceVersion.ipfsCid) {
      throw new Error('La versión no tiene contenido en IPFS');
    }

    // 4. Count existing versions to assign the next version number
    const blockchainId = `version-restore-${documentId}-${Date.now()}`;
    const restoredVersion = await prisma.$transaction(async (tx) => {
      const latestVersion = await tx.version.aggregate({
        where: { documentId },
        _max: { versionNumber: true },
      });
      const nextVersionNumber = (latestVersion._max.versionNumber ?? 0) + 1;

      const created = await tx.version.create({
        data: {
          id: uuidv4(),
          documentId,
          userId,
          versionNumber: nextVersionNumber,
          ipfsCid: sourceVersion.ipfsCid,
          encryptedSymmetricKey: sourceVersion.encryptedSymmetricKey,
          encryptionIV: sourceVersion.encryptionIV,
          encryptionAuthTag: sourceVersion.encryptionAuthTag,
          comment: `Restaurada desde versión ${versionNumber}`,
          blockchainStatus: BlockchainStatus.PREPARING,
        },
      });

      await tx.event.create({
        data: {
          id: uuidv4(),
          eventType: 'VERSION_RESTORE_PREPARED',
          userId,
          documentId,
          metadata: {
            newVersionId: created.id,
            sourceVersionId: sourceVersion.id,
            sourceVersionNumber: versionNumber,
            blockchainId,
          },
        },
      });

      return created;
    });

    logger.info(`[RESTORE PREPARE] Version restore prepared: ${restoredVersion.id} (from v${versionNumber})`);

    return { versionId: restoredVersion.id, blockchainId };
  }

  /**
   * Confirm a version restore after blockchain transaction.
   */
  static async confirmRestoreVersion(
    versionId: string,
    txHash: string,
    confirmerUserId: string,
  ): Promise<VersionInfo> {
    const version = await prisma.version.findUnique({
      where: { id: versionId },
      include: { document: true },
    });
    if (!version) {
      throw new Error('Versión no encontrada');
    }
    if (version.blockchainStatus !== BlockchainStatus.PREPARING) {
      throw new Error('La versión no está en estado PREPARING');
    }

    if (version.userId !== confirmerUserId) {
      throw new Error('No puedes confirmar una restauración preparada por otro usuario');
    }

    if (!version.document.blockchainId) {
      throw new Error('El documento no está registrado en blockchain');
    }

    const preparedEvent = await prisma.event.findFirst({
      where: {
        eventType: 'VERSION_RESTORE_PREPARED',
        documentId: version.documentId,
      },
      orderBy: { createdAt: 'desc' },
    });
    const metadata = preparedEvent?.metadata as { newVersionId?: unknown; sourceVersionNumber?: unknown } | null;
    if (metadata?.newVersionId !== versionId) {
      throw new Error('No se encontró la preparación de restauración de esta versión');
    }

    const sourceVersionNumber = Number(metadata.sourceVersionNumber);
    if (!Number.isInteger(sourceVersionNumber) || sourceVersionNumber <= 0) {
      throw new Error('La preparación de restauración no contiene la versión origen');
    }

    await assertVersionRestoredReceipt({
      txHash,
      docId: version.document.blockchainId,
      newVersionNumber: version.versionNumber,
      restoredFromVersion: sourceVersionNumber,
    });

    const updated = await prisma.version.update({
      where: { id: versionId },
      data: {
        blockchainStatus: BlockchainStatus.TX_SUBMITTED,
        blockchainTxHash: txHash,
      },
    });

    logger.info(`[RESTORE CONFIRM] Version ${versionId} restore confirmed with tx ${txHash}`);

    return {
      id: updated.id,
      documentId: updated.documentId,
      userId: updated.userId,
      versionNumber: updated.versionNumber,
      ipfsCid: updated.ipfsCid ?? '',
      comment: updated.comment,
      isEncrypted: updated.encryptedSymmetricKey !== 'UNENCRYPTED',
      blockchainStatus: updated.blockchainStatus,
      blockchainTxHash: updated.blockchainTxHash,
      isOperational: false,
      createdAt: updated.createdAt,
    };
  }
}

export default VersionService;
