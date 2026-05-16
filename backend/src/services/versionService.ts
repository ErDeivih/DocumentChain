/**
 * Version Service - Refactored for Backend Encryption
 * 
 * This service implements the prepare/confirm pattern:
 * 1. prepareVersion: Receives UNENCRYPTED file, encrypts it, uploads to IPFS, creates DB record
 * 2. confirmVersion: Updates DB record after frontend signs blockchain transaction
 */

import { v4 as uuidv4 } from 'uuid';
import prisma from '../config/database';
import { uploadToIPFS, deleteFromIPFS } from '../config/ipfs';
import { BlockchainStatus } from '@prisma/client';
import logger from '../utils/logger';
import * as Encryption from '../lib/encryption';
import { DocumentPermissionService } from './documentPermissionService';
import { provider, getContracts } from '../config/blockchain';

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
  private static async userHasAccessToDocument(
    document: {
      id: string;
      ownerId: string;
      blockchainId: string | null;
      visibility?: string | null;
      isDeleted?: boolean | null;
    },
    userId: string
  ): Promise<boolean> {
    if (document.isDeleted) {
      return false;
    }

    // Validate ownership ON-CHAIN if blockchainId exists
    if (document.blockchainId) {
      const wallet = await prisma.wallet.findFirst({ where: { userId } });
      if (!wallet) return false;
      const isOwnerOnChain = await DocumentPermissionService.isOwner(document.blockchainId, wallet.walletAddress);
      if (isOwnerOnChain) {
        return true;
      }
    } else if (document.ownerId === userId) {
      return true;
    }

    if (document.visibility === 'PUBLIC') {
      return true;
    }

    // Verify access exclusively against the smart contract (single source of truth).
    if (document.blockchainId) {
      const wallets = await prisma.wallet.findMany({
        where: { userId },
        select: { walletAddress: true },
      });

      for (const wallet of wallets) {
        if (await DocumentPermissionService.canView(document.blockchainId, wallet.walletAddress)) {
          return true;
        }
      }
    }

    return false;
  }

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
      const wallet = await prisma.wallet.findFirst({
        where: {
          id: walletId,
          userId,
        },
      });

      if (!wallet) {
        throw new Error('Wallet no encontrada o no pertenece al usuario');
      }

      // 2. Check document access
      const document = await prisma.document.findUnique({
        where: { id: documentId },
      });

      if (!document) {
        throw new Error('Documento no encontrado');
      }

      // Soft-delete check: cannot create versions on deleted documents
      if (document.isDeleted) {
        throw new Error('No se pueden crear versiones en documentos eliminados');
      }

      if (document.isArchived) {
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
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { publicKey: true },
      });

      if (!user || !user.publicKey) {
        throw new Error('Usuario no tiene clave pública configurada');
      }

      const isPublicDocument = document.visibility === 'PUBLIC';

      // 4. Validate and encrypt file
      Encryption.validateFileSize(fileBuffer.length, 100); // Max 100MB

      const encryptionResult = isPublicDocument ? null : Encryption.encryptFile(fileBuffer);
      const encryptedSymmetricKey = encryptionResult
        ? Encryption.encryptSymmetricKey(encryptionResult.symmetricKey, user.publicKey)
        : 'UNENCRYPTED';

      ipfsCid = await uploadToIPFS(encryptionResult ? encryptionResult.encryptedData : fileBuffer);
      logger.info(`[PREPARE] Versión subida a IPFS: ${ipfsCid}`);

      // 7. Generate blockchain ID
      const blockchainId = `version-${documentId}-${Date.now()}`;

      // 8. Compute next version number based on existing versions
      const existingVersionCount = await prisma.version.count({
        where: { documentId },
      });
      const nextVersionNumber = existingVersionCount + 1;

      // 9. Create version in DB with PREPARING status and encryption metadata
      const version = await prisma.version.create({
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

      logger.info(`[PREPARE] Versión creada en DB: ${version.id}, estado: PREPARING`);

      // 9. Log the preparation
      await prisma.event.create({
        data: {
          id: uuidv4(),
          eventType: 'VERSION_PREPARED',
          userId,
          documentId: document.id,
          metadata: {
            versionId: version.id,
            blockchainId,
            ipfsCid,
            walletId,
          },
        },
      });

      return {
        versionId: version.id,
        ipfsCid,
        blockchainId,
        versionNumber: version.versionNumber,
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
    const { versionId, txHash, blockchainVersionNumber } = input;

    // 1. Find the version
    const version = await prisma.version.findUnique({
      where: { id: versionId },
    });

    if (!version) {
      throw new Error('Versión no encontrada');
    }

    // 2. Validate current status
    if (version.blockchainStatus !== BlockchainStatus.PREPARING) {
      logger.warn(`[CONFIRM] Versión ${versionId} no está en estado PREPARING (actual: ${version.blockchainStatus})`);
    }

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
    try {
      if (txHash && provider) {
        const receipt = await provider.getTransactionReceipt(txHash);
        if (receipt && receipt.status === 1) {
          updated = await prisma.$transaction(async (tx) => {
            // Demote all previous versions
            await tx.version.updateMany({
              where: { documentId: version.documentId },
              data: { isOperational: false },
            });
            // Promote this version to SYNCED and operational
            const synced = await tx.version.update({
              where: { id: versionId },
              data: {
                blockchainStatus: BlockchainStatus.SYNCED,
                isOperational: true,
              },
            });
            return synced;
          });
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

    return this.toVersionInfo(updated);
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

    const { DocumentService } = await import('./documentService');
    const hasAccess = await DocumentService.userHasAccess(documentId, userId);

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

    return versions.map(v => this.toVersionInfo({
      ...v,
      isOperational: v.versionNumber === currentOnchainVersion,
    }));
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

    const { DocumentService } = await import('./documentService');
    const hasAccess = await DocumentService.userHasAccess(version.document.id, userId);

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
        isDeleted: true,
        isArchived: true,
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

    if (document.isDeleted) {
      throw new Error('No se pueden cambiar versiones en documentos eliminados');
    }

    if (document.isArchived) {
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

    if (targetVersion.isOperational) {
      return this.toVersionInfo(targetVersion);
    }

    const updatedVersion = await prisma.$transaction(async (tx) => {
      await tx.version.updateMany({
        where: { documentId, isOperational: true },
        data: { isOperational: false },
      });

      const updated = await tx.version.update({
        where: { id: targetVersion.id },
        data: { isOperational: true },
      });

      await tx.event.create({
        data: {
          id: uuidv4(),
          eventType: 'OperationalVersionChanged',
          userId,
          documentId,
          metadata: {
            versionId: updated.id,
            versionNumber,
          },
        },
      });

      return updated;
    });

    logger.info(`[VERSION] Documento ${documentId} cambió la versión operacional a v${versionNumber}`);

    return this.toVersionInfo(updatedVersion);
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
        isDeleted: true,
        isArchived: true,
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

    if (document.isDeleted) {
      throw new Error('No se pueden cambiar versiones en documentos eliminados');
    }

    if (document.isArchived) {
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

    if (targetVersion.isOperational) {
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
        isDeleted: true,
        isArchived: true,
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

    if (document.isDeleted || document.isArchived) {
      throw new Error('No se pueden cambiar versiones en documentos eliminados o archivados');
    }

    const targetVersion = await prisma.version.findFirst({
      where: { documentId, versionNumber },
    });

    if (!targetVersion) {
      throw new Error(`Versión ${versionNumber} no encontrada`);
    }

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
            isDeleted: true,
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

    const hasAccess = await this.userHasAccessToDocument(version.document, userId);

    if (!hasAccess) {
      throw new Error('No tienes acceso a esta versión');
    }

    if (!version.ipfsCid) {
      throw new Error('Versión no tiene archivo en IPFS');
    }

    // Download from IPFS
    const { downloadFromIPFS } = await import('../config/ipfs');
    const encryptedFile = await downloadFromIPFS(version.ipfsCid);

    return {
      encryptedFile,
      ipfsCid: version.ipfsCid,
      encryptedSymmetricKey: version.encryptedSymmetricKey || version.document.encryptedSymmetricKey || 'UNENCRYPTED',
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
  private static toVersionInfo(version: any): VersionInfo {
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
      isOperational: version.isOperational,
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
        throw new Error('Version not found');
      }

      // Verify ownership
      // Validate ownership ON-CHAIN if blockchainId exists
      if (version.document.blockchainId) {
        const wallet = await prisma.wallet.findFirst({ where: { userId } });
        if (!wallet) throw new Error('Wallet no encontrada');
        const isOwnerOnChain = await DocumentPermissionService.isOwner(version.document.blockchainId, wallet.walletAddress);
        if (!isOwnerOnChain) {
          throw new Error('No tienes permiso para eliminar esta versión');
        }
      } else if (version.document.ownerId !== userId) {
        throw new Error('No tienes permiso para eliminar esta versión');
      }

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
        throw new Error('Version not found');
      }

      // Verify ownership
      // Validate ownership ON-CHAIN if blockchainId exists
      if (version.document.blockchainId) {
        const wallet = await prisma.wallet.findFirst({ where: { userId } });
        if (!wallet) throw new Error('Wallet no encontrada');
        const isOwnerOnChain = await DocumentPermissionService.isOwner(version.document.blockchainId, wallet.walletAddress);
        if (!isOwnerOnChain) {
          throw new Error('No tienes permiso para eliminar esta versión');
        }
      } else if (version.document.ownerId !== userId) {
        throw new Error('No tienes permiso para eliminar esta versión');
      }

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
    // Validate ownership ON-CHAIN if blockchainId exists
    if (document.blockchainId) {
      const wallet = await prisma.wallet.findFirst({ where: { userId } });
      if (!wallet) throw new Error('Wallet no encontrada');
      const isOwnerOnChain = await DocumentPermissionService.isOwner(document.blockchainId, wallet.walletAddress);
      if (!isOwnerOnChain) {
        throw new Error('Solo el propietario puede restaurar versiones');
      }
    } else if (document.ownerId !== userId) {
      throw new Error('Solo el propietario puede restaurar versiones');
    }
    if (document.isDeleted) {
      throw new Error('No se pueden restaurar versiones en documentos eliminados');
    }

    if (document.isArchived) {
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
    const existingCount = await prisma.version.count({ where: { documentId } });
    const nextVersionNumber = existingCount + 1;

    // 5. Create a new version record reusing the old IPFS CID and encryption metadata
    const blockchainId = `version-restore-${documentId}-${Date.now()}`;
    const restoredVersion = await prisma.version.create({
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

    // 6. Log event
    await prisma.event.create({
      data: {
        id: uuidv4(),
        eventType: 'VERSION_RESTORE_PREPARED',
        userId,
        documentId,
        metadata: {
          newVersionId: restoredVersion.id,
          sourceVersionId: sourceVersion.id,
          sourceVersionNumber: versionNumber,
          blockchainId,
        },
      },
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
  ): Promise<VersionInfo> {
    const version = await prisma.version.findUnique({
      where: { id: versionId },
    });
    if (!version) {
      throw new Error('Versión no encontrada');
    }
    if (version.blockchainStatus !== BlockchainStatus.PREPARING) {
      throw new Error('La versión no está en estado PREPARING');
    }

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
      isOperational: updated.isOperational,
      createdAt: updated.createdAt,
    };
  }
}

export default VersionService;
