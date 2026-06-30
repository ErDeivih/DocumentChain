/**
 * Servicio de versionado de documentos.
 * Gestiona la creación, consulta, descarga, restauración y cambio de versión operativa
 * de documentos. El contenido se almacena en IPFS.
 */

import { v4 as uuidv4 } from 'uuid';
import prisma from '../config/database';
import { uploadToIPFS, deleteFromIPFS, downloadFromIPFS } from '../config/ipfs';
import logger from '../utils/logger';
import { NotFoundError, ValidationError, UnauthorizedError } from '../utils/errors';
import * as Encryption from '../lib/encryption';
import { DocumentPermissionService } from './documentPermissionService';
import notificationService, { NotificationType } from './notificationService';
import { provider } from '../config/blockchain';
import { BlockchainCacheService } from './blockchainCacheService';
import { assertDocumentActive, assertDocument } from '../utils/blockchainGuard';
import { userHasAccess } from '../utils/accessControl';
import { validateWalletBelongsToUser } from '../utils/walletHelper';
import {
  assertOperationalVersionChangedReceipt,
  assertVersionCreatedReceipt,
  assertVersionRestoredReceipt,
} from './blockchainReceiptService';
import { ethers } from 'ethers';
import WebSocketService from './webSocketService';

// ============================================
// Tipos
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
  blockchainTxHash: string | null;
  isOperational: boolean;
  createdAt: Date;
}

/**
 * Datos de entrada para preparar una nueva versión.
 * @property documentId - ID del documento
 * @property fileBuffer - Archivo YA CIFRADO por el frontend (o raw si documento público)
 * @property comment - Comentario descriptivo (opcional)
 * @property userId - ID del usuario creador
 * @property walletId - Wallet utilizada para la operación
 */
export interface PrepareVersionInput {
  documentId: string;
  fileBuffer: Buffer;  // Archivo YA CIFRADO por el frontend (o raw si documento público)
  comment?: string;
  userId: string;
  walletId: string;
  encryptedSymmetricKey?: string;
  contentHash?: string;
  encryptionIV?: string;
  encryptionAuthTag?: string;
  shareKeys?: Array<{ userId: string; reEncryptedKey: string }>;
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
  contentHash: string;
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
 * Gestiona la creación, restauración, consulta, descarga y cambio de versión operativa,
 * almacenando el contenido en IPFS.
 */
export class VersionService {
  /**
   * Prepara una versión para su creación
   * - Valida el archivo (tamaño, tipo MIME)
   * - El archivo ya viene cifrado del frontend (AES-256-GCM + RSA-OAEP)
   * - Sube el archivo cifrado a IPFS
   * - Crea el registro en BD (blockchainTxHash permanece null hasta la confirmación)
   * - Devuelve los datos necesarios para que el frontend firme la transacción blockchain
   *
   * @param input - Datos del archivo, documento, usuario y wallet
   * @returns Resultado con versionId, ipfsCid, blockchainId y versionNumber
   * @throws {NotFoundError} Si el documento no existe
   * @throws {ValidationError} Si el documento está eliminado o archivado, o el archivo excede 100MB
   * @throws {Error} Si el usuario no tiene permisos de escritura
   */
  static async prepareVersion(input: PrepareVersionInput): Promise<PrepareVersionResult> {
    const {
      documentId,
      fileBuffer,
      comment,
      userId,
      walletId,
      encryptedSymmetricKey: inputEncryptedSymmetricKey,
      contentHash: inputContentHash,
      encryptionIV: inputEncryptionIV,
      encryptionAuthTag: inputEncryptionAuthTag,
      shareKeys: inputShareKeys,
    } = input;

    let ipfsCid: string = '';

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
        throw new NotFoundError('Documento no encontrado');
      }

      await assertDocumentActive(document.blockchainId, 'crear versiones en');

      // Verificar acceso de escritura EN LA CADENA (única fuente de verdad)
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
        // Respaldo para documentos no registrados aún en la cadena
        hasWriteAccess = true;
      }

      if (!hasWriteAccess) {
        throw new Error('No tienes permisos para crear versiones de este documento');
      }

      const isPublicDocument = document.visibility === 'PUBLIC';

      // 3. Validar los campos de cifrado del frontend para documentos privados
      if (!isPublicDocument) {
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

      Encryption.validateFileSize(fileBuffer.length, 100);

      const encryptedSymmetricKey = isPublicDocument
        ? 'UNENCRYPTED'
        : inputEncryptedSymmetricKey!;

      const contentHashVal = isPublicDocument
        ? Encryption.calculateHash(fileBuffer)
        : inputContentHash!;

      // 4. Upload to IPFS (file already encrypted by frontend if private)
      ipfsCid = await uploadToIPFS(fileBuffer);
      logger.info(`[PREPARE] Versión subida a IPFS: ${ipfsCid}`);

      // 5. Generate blockchain ID
      const blockchainId = `version-${documentId}-${Date.now()}`;

      // 6. Crear versión en BD
      const previousShareKeys = await prisma.documentShareKey.findMany({
        where: { documentId },
        select: { userId: true, encryptedSymmetricKey: true },
      });

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
            encryptionIV: inputEncryptionIV ?? null,
            encryptionAuthTag: inputEncryptionAuthTag ?? null,
            contentHash: contentHashVal,
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
              previousShareKeys: previousShareKeys.map(sk => ({ userId: sk.userId, encryptedSymmetricKey: sk.encryptedSymmetricKey })),
            },
          },
        });

        // 7. Actualizar share keys con claves re-cifradas del frontend (sin cifrado del lado del servidor)
        if (!isPublicDocument && inputShareKeys && inputShareKeys.length > 0) {
          for (const sk of inputShareKeys) {
            await tx.documentShareKey.updateMany({
              where: { documentId, userId: sk.userId },
              data: { encryptedSymmetricKey: sk.reEncryptedKey },
            });
          }
        } else if (!isPublicDocument) {
          // Mantener claves de compartición existentes — NO restablecer a UNENCRYPTED
        }

        return createdVersion;
      });

      logger.info(`[PREPARE] Versión creada en DB: ${version.id}, estado: PREPARING`);

      const encryptedKeyHash = ethers.id(encryptedSymmetricKey);

      const ch = contentHashVal.startsWith('0x') ? contentHashVal : `0x${contentHashVal}`;
      return {
        versionId: version.id,
        ipfsCid,
        blockchainId,
        versionNumber: version.versionNumber,
        encryptedKeyHash,
        contentHash: ch,
      };

    } catch (error) {
      logger.error('[PREPARE] Error al preparar versión:', error);

      // Limpiar IPFS si la subida tuvo exito pero la BD fallo
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
    * Confirma una versión tras la transacción blockchain
     * - Establece `blockchainTxHash` en el registro de BD; opcionalmente obtiene
     *   el receipt de inmediato (Hardhat mina instantaneamente).
    *
    * @param input - Datos de confirmación con versionId, txHash y blockchainVersionNumber
    * @returns Información de la versión confirmada
    * @throws {NotFoundError} Si la versión no existe
    * @throws {ValidationError} Si la versión ya tiene blockchainTxHash asignado (ya fue confirmada)
    * @throws {Error} Si el usuario no tiene acceso o faltan datos blockchain
   */
  static async confirmVersion(input: ConfirmVersionInput): Promise<VersionInfo> {
    const { versionId, txHash, blockchainVersionNumber, confirmerUserId } = input;

    // 1. Buscar la versión
    const version = await prisma.version.findUnique({
      where: { id: versionId },
      include: { document: true },
    });

    if (!version) {
      throw new NotFoundError('Versión no encontrada');
    }

    if (version.blockchainTxHash) {
      throw new ValidationError('La versión ya fue confirmada o procesada previamente');
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

    // 3. Actualizar versión con info de transacción + registrar evento atómicamente
    let updated = await prisma.$transaction(async (tx) => {
      const v = await tx.version.update({
        where: { id: versionId },
        data: {
          blockchainTxHash: txHash,
        },
      });

      await tx.event.create({
        data: {
          id: uuidv4(),
          eventType: 'VERSION_TX_SUBMITTED',
          userId: version.userId,
          documentId: version.documentId,
          transactionHash: txHash,
          metadata: {
            versionId: version.id,
            blockchainVersionNumber,
            previousStatus: version.blockchainTxHash ? 'submitted' : 'pending',
          },
        },
      });

      return v;
    });

    logger.info(`[CONFIRM] Versión ${versionId} actualizada a TX_SUBMITTED`);

    // 4. Try to get receipt immediately (Hardhat mines instantly)
    let isNowOperational = false;
    try {
      if (txHash && provider) {
        const receipt = await provider.getTransactionReceipt(txHash);
        if (receipt && receipt.status === 1) {
          isNowOperational = true;
          logger.info(`[CONFIRM] Versión ${versionId} sincronizada inmediatamente`);
        } else if (receipt && receipt.status === 0) {
          const failedVersion = await prisma.version.findFirst({ where: { blockchainTxHash: txHash } });
          if (failedVersion?.ipfsCid) {
            try { await deleteFromIPFS(failedVersion.ipfsCid); } catch (e) { logger.warn(`Error al desanclar version fallida ${failedVersion.ipfsCid}`); }
          }
          throw new Error(`La transacción ${txHash} fue revertida (receipt status = 0)`);
        }
      }
    } catch (syncErr: any) {
      logger.warn(`[CONFIRM] No se pudo sincronizar versión ${versionId} inmediatamente: ${syncErr.message}`);
    }

    if (version.document?.blockchainId) BlockchainCacheService.invalidate(version.document.blockchainId);

    // Crear notificación NEW_VERSION
    try {
      await notificationService.createNotification({
        userId: version.document.ownerId,
        type: NotificationType.NEW_VERSION,
        title: 'Nueva versión creada',
        message: `Se ha creado la versión ${version.versionNumber} del documento.`,
        link: `/app/documents/${version.documentId}`,
        data: { documentId: version.documentId, versionId, versionNumber: version.versionNumber }
      });
    } catch (notifErr) {
      logger.warn('No se pudo crear notificación de nueva versión', { versionId, error: notifErr instanceof Error ? notifErr.message : 'Error desconocido' });
    }

    await VersionService.notifyDocumentUpdate(version.documentId, version.document.blockchainId!, 'NEW_VERSION');

    return this.toVersionInfo(updated, isNowOperational);
  }

  /**
   * Obtiene las versiones de un documento
   *
   * @param documentId - ID del documento
   * @param userId - ID del usuario solicitante
   * @returns Lista de versiones del documento
   * @throws {NotFoundError} Si el documento no existe o el usuario no tiene acceso
   */
  static async getDocumentVersions(documentId: string, userId: string): Promise<VersionInfo[]> {
    const document = await assertDocument(documentId);

    const hasAccess = await userHasAccess(documentId, userId);

    if (!hasAccess) {
      throw new NotFoundError('No tienes acceso a este documento');
    }

    const versions = await prisma.version.findMany({
      where: { documentId },
      orderBy: { versionNumber: 'desc' },
    });

    // Consultar on-chain cuál es la versión operacional actual (fuente de verdad)
    let currentOnchainVersion = 0;
    try {
      if (document.blockchainId) {
        currentOnchainVersion = await BlockchainCacheService.getOperationalVersionNumber(document.blockchainId);
      }
    } catch (chainErr: any) {
      logger.warn(`[GET_VERSIONS] Error consultando versión operacional on-chain: ${chainErr.message}`);
    }

    return versions.map(v => this.toVersionInfo(v, v.versionNumber === currentOnchainVersion));
  }

  /**
   * Obtiene una versión específica
   *
   * @param versionId - ID de la versión
   * @param userId - ID del usuario solicitante
   * @returns Información de la versión o null si no existe o no tiene acceso
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
    * Prepara el cambio de versión operativa (fase de preparación on-chain)
   *
   * @param input - Datos con documentId, versionNumber y userId
   * @returns Datos necesarios para la transacción blockchain
   * @throws {NotFoundError} Si el documento no existe o no se encuentra la wallet
   * @throws {ValidationError} Si el documento está eliminado, archivado o no registrado en blockchain
   * @throws {Error} Si el usuario no es el propietario
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
      throw new NotFoundError('Documento no encontrado');
    }

     // Validar propiedad en blockchain si existe blockchainId
    if (document.blockchainId) {
      const wallet = await prisma.wallet.findFirst({ where: { userId } });
      if (!wallet) throw new NotFoundError('Wallet no encontrada');
      const isOwnerOnChain = await DocumentPermissionService.isOwner(document.blockchainId, wallet.walletAddress);
      if (!isOwnerOnChain) {
        throw new Error('Solo el propietario puede cambiar la versión operacional');
      }
    } else if (document.ownerId !== userId) {
      throw new Error('Solo el propietario puede cambiar la versión operacional');
    }

    await assertDocumentActive(document.blockchainId, 'cambiar versiones en');

    if (!document.blockchainId) {
      throw new ValidationError('El documento no está registrado en blockchain');
    }

    const targetVersion = await prisma.version.findFirst({
      where: { documentId, versionNumber },
    });

    if (!targetVersion) {
      throw new NotFoundError(`Versión ${versionNumber} no encontrada`);
    }

    if (!targetVersion.blockchainTxHash) {
      throw new ValidationError('Solo se puede activar una versión enviada a blockchain');
    }

    const operationalVersion = await BlockchainCacheService.getOperationalVersionNumber(document.blockchainId);
    if (targetVersion.versionNumber === operationalVersion) {
      throw new ValidationError('Esta versión ya es la operacional');
    }

    return {
      blockchainId: document.blockchainId,
      versionNumber,
      documentName: document.name,
    };
  }

  /**
    * Confirma el cambio de versión operativa (fase de confirmación on-chain)
   *
   * @param input - Datos con documentId, versionNumber, txHash y userId
   * @throws {NotFoundError} Si el documento o la versión no existen
   * @throws {ValidationError} Si el documento está eliminado, archivado o no registrado en blockchain
   * @throws {Error} Si el usuario no es el propietario
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
      throw new NotFoundError('Documento no encontrado');
    }

    // Validar propiedad (on-chain o BD como respaldo)
    await DocumentPermissionService.validateOwnership(document, userId, {
      errorMessage: 'Solo el propietario puede cambiar la versión operacional',
    });

    await assertDocumentActive(document.blockchainId, 'cambiar versiones en');

    const targetVersion = await prisma.version.findFirst({
      where: { documentId, versionNumber },
    });

    if (!targetVersion) {
      throw new NotFoundError(`Versión ${versionNumber} no encontrada`);
    }

    if (!document.blockchainId) {
      throw new ValidationError('El documento no está registrado en blockchain');
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

    if (document?.blockchainId) BlockchainCacheService.invalidate(document.blockchainId);

    await VersionService.notifyDocumentUpdate(documentId, document.blockchainId!, 'OPERATIONAL_CHANGED');
  }

  /**
   * Descarga versión (devuelve archivo cifrado desde IPFS)
   *
   * @param versionId - ID de la versión a descargar
   * @param userId - ID del usuario solicitante
   * @returns Archivo cifrado y metadatos asociados
   * @throws {NotFoundError} Si la versión no existe o el usuario no tiene acceso
   * @throws {ValidationError} Si la versión no tiene archivo en IPFS
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
      throw new NotFoundError('Versión no encontrada');
    }

    const hasAccess = await userHasAccess(version.document.id, userId);

    if (!hasAccess) {
      throw new NotFoundError('No tienes acceso a esta versión');
    }

    if (!version.ipfsCid) {
      throw new ValidationError('Versión no tiene archivo en IPFS');
    }

    // Descargar desde IPFS
    const encryptedFile = await downloadFromIPFS(version.ipfsCid);

    // Si el usuario no es propietario, verificar DocumentShareKey
    let versionEncryptedSymmetricKey: string;
    if (userId !== version.document.ownerId) {
      const shareKey = await prisma.documentShareKey.findUnique({
        where: { documentId_userId: { documentId: version.documentId, userId } }
      });
      if (!shareKey) throw new UnauthorizedError('No tienes acceso de descarga a esta versión');
      versionEncryptedSymmetricKey = shareKey.encryptedSymmetricKey;
    } else {
      versionEncryptedSymmetricKey = version.encryptedSymmetricKey || version.document.encryptedSymmetricKey || 'UNENCRYPTED';
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
   * Convierte versión de Prisma a VersionInfo
   *
   * @param version - Registro de versión desde Prisma
   * @param isOperational - Indica si la versión es la operacional actual
   * @returns Objeto VersionInfo tipado
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
      blockchainTxHash: version.blockchainTxHash,
      isOperational,
      createdAt: version.createdAt,
    };
  }

  /**
   * Revierte la creación de una versión
   * - Elimina la versión de la BD
   * - Desancla el CID de IPFS
   * - Se usa cuando la transacción blockchain falla tras la preparación
   *
   * @param versionId - ID de la versión a revertir
   * @param userId - ID del usuario solicitante
   * @throws {NotFoundError} Si la versión no existe
   * @throws {Error} Si el usuario no es el propietario del documento
   */
  static async rollbackVersion(versionId: string, userId: string): Promise<void> {
    try {
      // Obtener version con documento
      const version = await prisma.version.findUnique({
        where: { id: versionId },
        include: {
          document: {
            select: { ownerId: true, blockchainId: true },
          },
        },
      });

      if (!version) {
        throw new NotFoundError('Versión no encontrada');
      }

      // Validar propiedad (on-chain o BD como respaldo)
      await DocumentPermissionService.validateOwnership(version.document, userId, {
        errorMessage: 'No tienes permiso para eliminar esta versión',
      });

      const ipfsCid = version.ipfsCid;

      const preparedEvent = await prisma.event.findFirst({
        where: { eventType: 'VERSION_PREPARED', documentId: version.documentId, metadata: { path: ['versionId'], equals: versionId } },
      });
      const previousShareKeys: Array<{ userId: string; encryptedSymmetricKey: string }> = ((preparedEvent?.metadata ?? {}) as { previousShareKeys?: Array<{ userId: string; encryptedSymmetricKey: string }> }).previousShareKeys ?? [];

      await prisma.$transaction(async (tx) => {
        await tx.version.delete({
          where: { id: versionId },
        });

        for (const sk of previousShareKeys) {
          await tx.documentShareKey.updateMany({
            where: { documentId: version.documentId, userId: sk.userId },
            data: { encryptedSymmetricKey: sk.encryptedSymmetricKey },
          });
        }

        await tx.event.create({
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
      });

      if (ipfsCid) {
        try {
          await deleteFromIPFS(ipfsCid);
          logger.info(`[VERSION_ROLLBACK] Unpinned CID: ${ipfsCid}`);
        } catch (error) {
          logger.warn(`[VERSION_ROLLBACK] Error al desanclar CID ${ipfsCid}:`, error);
        }
      }

      logger.info(`[VERSION_ROLLBACK] Version ${versionId} rolled back successfully`);
    } catch (error) {
      logger.error(`[VERSION_ROLLBACK] Error al revertir version ${versionId}:`, error);
      throw error;
    }
  }

  /**
   * Revierte la restauración de una versión.
   * - Elimina la versión de la BD
   * - NO desancla de IPFS (el CID pertenece a la versión original)
   * - Se usa cuando la transacción blockchain falla tras la preparación de restauración
   *
   * @param versionId - ID de la versión a revertir
   * @param userId - ID del usuario solicitante
   * @throws {NotFoundError} Si la versión no existe
   * @throws {Error} Si el usuario no es el propietario del documento
   */
  static async rollbackVersionRestore(versionId: string, userId: string): Promise<void> {
    try {
      // Obtener version con documento
      const version = await prisma.version.findUnique({
        where: { id: versionId },
        include: {
          document: {
            select: { ownerId: true, blockchainId: true },
          },
        },
      });

      if (!version) {
        throw new NotFoundError('Versión no encontrada');
      }

      // Verificar propiedad (on-chain o BD como respaldo)
      await DocumentPermissionService.validateOwnership(version.document, userId, {
        errorMessage: 'No tienes permiso para eliminar esta versión',
      });

      // Eliminar de la base de datos (NO desanclar de IPFS)
      const restored = await prisma.$transaction(async (tx) => {
        const deleted = await tx.version.delete({
          where: { id: versionId },
        });

        // Log event
        await tx.event.create({
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

        return deleted;
      });

      logger.info(`[VERSION_RESTORE_ROLLBACK] Version ${versionId} restore rolled back (IPFS preserved)`);
    } catch (error) {
      logger.error(`[VERSION_RESTORE_ROLLBACK] Error al revertir version restore ${versionId}:`, error);
      throw error;
    }
  }

  /**
   * Rollback de cambio de versión operativa tras fallo de transacción blockchain.
   * Busca el evento OPERATIONAL_VERSION_TX_SUBMITTED mas reciente y lo elimina.
   */
  static async rollbackSetOperational(documentId: string, userId: string): Promise<void> {
    const preparedEvent = await prisma.event.findFirst({
      where: {
        eventType: 'OPERATIONAL_VERSION_TX_SUBMITTED',
        documentId,
      },
      orderBy: { createdAt: 'desc' },
    });
    if (!preparedEvent) throw new Error('No hay cambio de version operativa pendiente');

    await prisma.event.create({
      data: {
        id: uuidv4(),
        eventType: 'OPERATIONAL_VERSION_ROLLBACK',
        userId,
        documentId,
        metadata: { rolledBackEventId: preparedEvent.id },
      },
    });

    await prisma.event.delete({ where: { id: preparedEvent.id } });
    logger.info(`Rollback de version operativa para documento ${documentId}`);
  }

  /**
    * Prepara la restauración de una versión (crea una nueva versión apuntando al mismo CID de IPFS que una versión anterior).
   * No requiere subida de archivo — se reutiliza el contenido cifrado.
   *
   * @param documentId - ID del documento
   * @param versionNumber - Número de la versión origen a restaurar
   * @param userId - ID del usuario solicitante
   * @param walletId - ID de la wallet del usuario (opcional)
   * @returns Identificadores de la nueva versión y del documento en blockchain
   * @throws {NotFoundError} Si el documento o la versión origen no existen
   * @throws {ValidationError} Si el documento está eliminado, archivado, o la versión no tiene IPFS
   * @throws {Error} Si la wallet no pertenece al usuario o no es el propietario
   */
  static async prepareRestoreVersion(
    documentId: string,
    versionNumber: number,
    userId: string,
    walletId?: string,
  ): Promise<{ versionId: string; blockchainId: string }> {
    // 1. Validar opcionalmente que la wallet pertenece al usuario (el frontend puede no enviar walletId)
    if (walletId) {
      const wallet = await prisma.wallet.findFirst({
        where: { id: walletId, userId },
      });
      if (!wallet) {
        throw new Error('Wallet no encontrada o no pertenece al usuario');
      }
    }

    // 2. Buscar documento y verificar propiedad/permiso
    const document = await assertDocument(documentId);
    // Verificar propiedad (on-chain o BD como respaldo)
    await DocumentPermissionService.validateOwnership(document, userId, {
      errorMessage: 'Solo el propietario puede restaurar versiones',
    });

    await assertDocumentActive(document.blockchainId, 'restaurar versiones en');

    // 3. Buscar la version origen a restaurar
    const sourceVersion = await prisma.version.findFirst({
      where: { documentId, versionNumber },
    });
    if (!sourceVersion) {
      throw new NotFoundError(`Versión ${versionNumber} no encontrada`);
    }
    if (!sourceVersion.ipfsCid) {
      throw new ValidationError('La versión no tiene contenido en IPFS');
    }

    // 4. Contar versiones existentes para asignar el siguiente numero de version
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
          contentHash: sourceVersion.contentHash || '',
          comment: `Restaurada desde versión ${versionNumber}`,
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

    logger.info(`[RESTORE PREPARE] Restauracion de version preparada: ${restoredVersion.id} (desde v${versionNumber})`);

    return { versionId: restoredVersion.id, blockchainId };
  }

  /**
    * Confirma la restauración de una versión tras la transacción blockchain.
   *
   * @param versionId - ID de la versión restaurada
   * @param txHash - Hash de la transacción blockchain
   * @param confirmerUserId - ID del usuario que confirma
   * @returns Información de la versión restaurada
   * @throws {NotFoundError} Si la versión no existe
    * @throws {ValidationError} Si la version ya tiene blockchainTxHash (confirmada previamente), el usuario no coincide, o el documento no esta en blockchain
   * @throws {Error} Si no se encuentra la preparación de restauración
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
      throw new NotFoundError('Versión no encontrada');
    }
    if (version.blockchainTxHash) {
      throw new ValidationError('La versión ya fue confirmada o procesada previamente');
    }

    if (version.userId !== confirmerUserId) {
      throw new ValidationError('No puedes confirmar una restauración preparada por otro usuario');
    }

    if (!version.document.blockchainId) {
      throw new ValidationError('El documento no está registrado en blockchain');
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
        blockchainTxHash: txHash,
      },
    });

    logger.info(`[RESTORE CONFIRM] Version ${versionId} restore confirmed with tx ${txHash}`);

    if (version.document?.blockchainId) BlockchainCacheService.invalidate(version.document.blockchainId);

    await VersionService.notifyDocumentUpdate(version.documentId, version.document.blockchainId!, 'VERSION_RESTORED');

    return {
      id: updated.id,
      documentId: updated.documentId,
      userId: updated.userId ?? '',
      versionNumber: updated.versionNumber,
      ipfsCid: updated.ipfsCid ?? '',
      comment: updated.comment,
      isEncrypted: updated.encryptedSymmetricKey !== 'UNENCRYPTED',
      blockchainTxHash: updated.blockchainTxHash,
      isOperational: false,
      createdAt: updated.createdAt,
    };
  }

  /**
   * Emite document:updated vía WebSocket al propietario y usuarios con acceso compartido.
   *
   * Tipos de evento emitidos por este helper:
   *   - NEW_VERSION: nueva versión subida y confirmada on-chain
   *   - OPERATIONAL_CHANGED: cambio de versión operativa activa
   *   - VERSION_RESTORED: restauración desde una versión anterior
   *
   * Otros servicios emiten sus propios eventos en el mismo canal document:updated:
   *   shareService.ts — SHARED, SHARE_REVOKED
   *   transferService.ts — OWNERSHIP_TRANSFERRED
   *   documentLifecycleService.ts — ARCHIVED, UNARCHIVED, DELETED
   *
   * Disparar y olvidar: no bloquea la respuesta HTTP si la emisión falla.
   */
  private static async notifyDocumentUpdate(
    documentId: string,
    blockchainId: string,
    type: string
  ): Promise<void> {
    try {
      const doc = await prisma.document.findUnique({
        where: { id: documentId },
        select: { ownerId: true },
      });
      if (doc?.ownerId) {
        WebSocketService.sendToUser(doc.ownerId, 'document:updated', { type, documentId });
      }

      const { DocumentPermissionService, DocumentRole } = await import('./documentPermissionService');
      const users = await DocumentPermissionService.getDocumentUsersWithRoles(blockchainId);
      const sharedAddresses = users
        .filter(({ role }) => role !== DocumentRole.OWNER)
        .map(({ address }) => address.toLowerCase());

      if (sharedAddresses.length > 0) {
        const wallets = await prisma.wallet.findMany({
          where: { walletAddress: { in: sharedAddresses, mode: 'insensitive' } },
          select: { userId: true },
        });
        const userIds = [...new Set(wallets.map(w => w.userId))];
        for (const uid of userIds) {
          WebSocketService.sendToUser(uid, 'document:updated', { type, documentId });
        }
      }
    } catch (err) {
      // Disparar y olvidar — no bloquea la respuesta HTTP
    }
  }
}

export default VersionService;
