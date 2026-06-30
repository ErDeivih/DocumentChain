/**
 * Servicio de transferencia de propiedad de documentos
 * 
 * Implementa la transferencia de propiedad con re-cifrado en el frontend:
 * - El frontend descifra la clave simétrica localmente, luego la re-cifra con la clave pública del nuevo propietario
 * - Envía la clave re-cifrada al backend
 * - El backend la almacena tal cual (sin cifrado del lado del servidor)
 * - Actualiza la propiedad del documento tras confirmación en blockchain
 */

import { v4 as uuidv4 } from 'uuid';
import prisma from '../config/database';
import logger from '../utils/logger';
import { ethers } from 'ethers';
import { DocumentPermissionService } from './documentPermissionService';
import { validateWalletBelongsToUser } from '../utils/walletHelper';
import { normalizeEthereumAddress } from '../utils/ethereum';
import { BlockchainCacheService } from './blockchainCacheService';
import { assertDocumentActive } from '../utils/blockchainGuard';
import { assertOwnershipTransferredReceipt } from './blockchainReceiptService';
import WebSocketService from './webSocketService';
import notificationService, { NotificationType } from './notificationService';
import { ConflictError, NotFoundError, UnauthorizedError, ValidationError } from '../utils/errors';

// ============================================
// Interfaces
// ============================================

/**
 * Datos de entrada para preparar una transferencia de propiedad.
 * @property documentId - ID del documento a transferir
 * @property currentOwnerId - ID del propietario actual
 * @property newOwnerId - ID del nuevo propietario
 * @property currentOwnerWalletId - Wallet del propietario actual
 * @property newOwnerWalletAddress - Dirección del nuevo propietario
 * @property reEncryptedSymmetricKey - Clave simétrica descifrada (Base64, opcional)
 */
export interface PrepareTransferInput {
  documentId: string;
  currentOwnerId: string;
  newOwnerId: string;
  currentOwnerWalletId: string;
  newOwnerWalletAddress: string;
  reEncryptedSymmetricKey?: string; // Clave simétrica codificada en Base64 (descifrada en el frontend)
}

/**
 * Resultado de la preparación de una transferencia.
 * @property transferId - Identificador de la transferencia
 * @property documentId - ID del documento
 * @property docId - bytes32 para blockchain
 * @property currentOwnerAddress - Dirección del propietario actual
 * @property newOwnerAddress - Dirección del nuevo propietario
 * @property message - Mensaje a firmar en frontend
 * @property nonce - Nonce para evitar replay
 */
export interface PrepareTransferResult {
  transferId: string;
  documentId: string;
  docId: string; // bytes32 for blockchain
  currentOwnerAddress: string;
  newOwnerAddress: string;
  message: string; // Para firmar en frontend
  nonce: number;
}

/**
 * Datos de entrada para confirmar una transferencia.
 * @property transferId - Identificador de la transferencia
 * @property txHash - Hash de la transacción blockchain
 * @property signature - Firma de la transacción
 * @property documentId - ID del documento (opcional)
 * @property newOwnerId - ID del nuevo propietario (opcional)
 */
export interface ConfirmTransferInput {
  transferId: string;
  txHash: string;
  signature: string;
  documentId?: string;
  newOwnerId?: string;
  confirmerUserId: string;
  skipOnChainValidation?: boolean;
}

/**
 * Servicio de transferencia de propiedad de documentos.
 * Gestiona la cesion de propiedad entre usuarios mediante re-cifrado de claves simetricas.
 */
export class TransferService {
  /**
   * Prepara una transferencia para firma en blockchain
    * - Valida la propiedad y los permisos
   * - Almacena la clave ya re-cifrada por el frontend para el nuevo propietario
     * - Crea el evento TRANSFER_PREPARED en la tabla de auditoria
     * - Devuelve los datos necesarios para que el frontend firme la transacción blockchain
   *
   * @param input - Datos con documentId, propietario actual, nuevo propietario y wallets
   * @returns Datos preparados para la transacción blockchain
   * @throws {Error} Si el documento no existe, el usuario no es propietario, el documento está eliminado/archivado, o falta la clave simétrica para documentos privados
   */
  static async prepareTransfer(input: PrepareTransferInput): Promise<PrepareTransferResult> {
    const {
      documentId,
      currentOwnerId,
      newOwnerId,
      currentOwnerWalletId,
      newOwnerWalletAddress,
      reEncryptedSymmetricKey,
    } = input;

    // 1. Validate current owner
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    if (!document) {
      throw new NotFoundError('Documento no encontrado');
    }

    // Bloquear auto-transferencia
    if (currentOwnerId === newOwnerId) {
      throw new ValidationError('No puedes transferirte el documento a ti mismo');
    }

    // 2. Validate current owner's wallet
    const currentWallet = await validateWalletBelongsToUser(currentOwnerWalletId, currentOwnerId);

    // Validar propiedad (on-chain o BD como respaldo)
    await DocumentPermissionService.validateOwnership(document, currentOwnerId, {
      existingWallet: currentWallet,
      errorMessage: 'No eres el propietario del documento',
    });

    await assertDocumentActive(document.blockchainId, 'transferir');

    // 3. Validate new owner's wallet
    const normalizedAddress = normalizeEthereumAddress(newOwnerWalletAddress);
    if (!normalizedAddress) {
      throw new ValidationError('Direccion wallet del nuevo propietario invalida');
    }
    const newOwnerWallet = await prisma.wallet.findFirst({
      where: { walletAddress: normalizedAddress, userId: newOwnerId },
    });
    if (!newOwnerWallet) {
      throw new ValidationError('Wallet del nuevo propietario no encontrada o no pertenece al usuario');
    }

    const isPublicDocument = document.visibility === 'PUBLIC' || document.encryptedSymmetricKey === 'UNENCRYPTED';

    // El frontend ya re-cifró la clave simétrica con la clave pública del nuevo propietario.
    // El backend la almacena tal cual — sin cifrado del lado del servidor.
    const reEncryptedKey = isPublicDocument
      ? 'UNENCRYPTED'
      : (() => {
          if (!reEncryptedSymmetricKey) {
            throw new ValidationError('La clave simétrica re-cifrada es obligatoria para documentos privados');
          }
          return reEncryptedSymmetricKey;
        })();

    // 5. Generate blockchain docId (bytes32)
    const docId = document.blockchainId || ethers.id(`${documentId}-${Date.now()}`);

    // 6. Marcar el documento con el ID de blockchain pero conservar la clave cifrada actual hasta
    //    la confirmación blockchain. De lo contrario, una transacción fallida podría bloquear al
    //    propietario actual de un documento privado.

    // 7. Generate message to sign
    const nonce = Date.now();
    const message = `Transferir documento ${docId} a ${newOwnerWalletAddress} en ${nonce}`;

    // Generar transferId antes de crear el evento para que pueda almacenarse para busqueda en confirmTransfer
    const transferId = uuidv4();

    // 8. Actualizar documento y crear evento atómicamente
    await prisma.$transaction(async (tx) => {
      // Detectar transferencia pendiente previa (dentro de la transacción para atomicidad)
      const pendingTransfer = await tx.event.findFirst({
        where: {
          documentId: document.id,
          eventType: 'TRANSFER_PREPARED',
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
        orderBy: { createdAt: 'desc' },
      });
      if (pendingTransfer) {
        const confirmedExists = await tx.event.findFirst({
          where: {
            documentId: document.id,
            eventType: 'TRANSFER_CONFIRMED',
            createdAt: { gte: pendingTransfer.createdAt },
          },
        });
        if (!confirmedExists) {
          throw new ConflictError('Ya existe una transferencia pendiente para este documento');
        }
      }

      await tx.document.update({
        where: { id: documentId },
        data: {
          blockchainId: docId,
        },
      });

      await tx.event.create({
        data: {
          id: uuidv4(),
          eventType: 'TRANSFER_PREPARED',
          userId: currentOwnerId,
          documentId,
          metadata: {
            transferId,
            docId,
            currentOwner: currentOwnerId,
            newOwner: newOwnerId,
            newOwnerAddress: newOwnerWalletAddress,
            currentWalletId: currentOwnerWalletId,
            pendingEncryptedSymmetricKey: reEncryptedKey,
            message,
            nonce,
          },
        },
      });
    });

    logger.info(`[PREPARE] Transferencia preparada: ${documentId} -> ${newOwnerId}`);

    return {
      transferId,
      documentId,
      docId,
      currentOwnerAddress: currentWallet.walletAddress,
      newOwnerAddress: newOwnerWalletAddress,
      message,
      nonce,
    };
  }

  /**
   * Confirma una transferencia tras la transacción en blockchain
   * - Actualiza el propietario del documento en la BD
   * - Revoca todos los compartidos previos
   * - Registra el evento de transferencia
   *
   * @param input - Datos con transferId, txHash, signature y datos opcionales de documento y nuevo propietario
   * @throws {Error} Si no se encuentra el evento de preparación, el documento, la wallet, o falla la validación on-chain
   */
  static async confirmTransfer(input: ConfirmTransferInput): Promise<void> {
    const { transferId, txHash, signature, documentId: inputDocumentId, newOwnerId: inputNewOwnerId, confirmerUserId } = input;

    logger.info(`[CONFIRM] Confirmando transferencia ${transferId} con tx ${txHash}`);

    // 1. Recuperar metadatos del evento preparado por conveniencia,
    //    pero NO depender de ellos para la autorizacion.
    let documentId = inputDocumentId || null;
    let newOwnerId = inputNewOwnerId || null;
    let metadata: Record<string, any> = {};

    if (!documentId || !newOwnerId) {
      const transferEvent = await prisma.event.findFirst({
        where: {
          eventType: 'TRANSFER_PREPARED',
          metadata: {
            path: ['transferId'],
            equals: transferId,
          },
        },
      });

      if (transferEvent) {
        documentId = documentId || transferEvent.documentId;
        metadata = (transferEvent.metadata || {}) as Record<string, any>;
        newOwnerId = newOwnerId || metadata.newOwner;
      }
    }

    if (!documentId) {
      throw new ValidationError('No se encontró el ID del documento en el evento de transferencia');
    }

    const confirmedNewOwnerId = newOwnerId || metadata.newOwner;
    const pendingEncryptedSymmetricKey = metadata.pendingEncryptedSymmetricKey;

    if (!confirmedNewOwnerId) {
      throw new ValidationError('No se encontró el nuevo propietario de la transferencia');
    }

    if (!pendingEncryptedSymmetricKey) {
      throw new ValidationError('No se encontró la clave re-cifrada pendiente de la transferencia');
    }

    // 2. Validar la transacción on-chain cuando sea posible
    const document = await prisma.document.findUnique({ where: { id: documentId } });
    if (!document) throw new NotFoundError('Documento no encontrado');
    if (!document.blockchainId) throw new ValidationError('El documento no está registrado en blockchain');
    const previousOwnerId = document.ownerId;

    const currentWallet = metadata.currentWalletId
      ? await prisma.wallet.findFirst({ where: { id: metadata.currentWalletId, userId: document.ownerId } })
      : null;

    if (!currentWallet) throw new ValidationError('No se encontró la wallet del propietario actual para validar la transferencia');

    if (!input.skipOnChainValidation) {
      await assertOwnershipTransferredReceipt({
        txHash,
        docId: document.blockchainId,
        fromAddress: currentWallet.walletAddress,
        toAddress: metadata.newOwnerAddress,
      });
    }

    // 3. Aplicar cambio de propiedad, clave re-cifrada y limpieza de share-keys atómicamente.
    await prisma.$transaction(async (tx) => {
      const currentDoc = await tx.document.findUnique({ where: { id: documentId } });
      if (!currentDoc) throw new NotFoundError('Documento no encontrado');
      if (currentDoc.ownerId !== confirmerUserId) {
        throw new UnauthorizedError('Solo el propietario actual puede confirmar la transferencia');
      }

      await tx.document.update({
        where: { id: documentId },
        data: {
          ownerId: confirmedNewOwnerId,
          encryptedSymmetricKey: pendingEncryptedSymmetricKey,
          blockchainTxHash: txHash,
        },
      });

      await tx.version.updateMany({
        where: { documentId },
        data: { encryptedSymmetricKey: pendingEncryptedSymmetricKey },
      });

      await tx.documentShareKey.deleteMany({
        where: { documentId },
      });

      await tx.event.create({
        data: {
          id: uuidv4(),
          eventType: 'TRANSFER_CONFIRMED',
          userId: confirmedNewOwnerId,
          documentId,
          transactionHash: txHash,
          metadata: {
            docId: metadata.docId,
            previousOwner: metadata.currentOwner,
            newOwner: confirmedNewOwnerId,
            newOwnerAddress: metadata.newOwnerAddress,
            signature,
          },
        },
      });
    });

    logger.info(`[CONFIRM] Transferencia confirmada: ${documentId} -> ${confirmedNewOwnerId}`);

    if (document?.blockchainId) BlockchainCacheService.invalidate(document.blockchainId);

      // Crear evento DocumentTransferred para el timeline
      try {
        await prisma.event.create({
          data: {
            id: uuidv4(),
            eventType: 'DocumentTransferred',
            documentId: documentId,
            userId: confirmedNewOwnerId,
            metadata: { previousOwnerId: document.ownerId, newOwnerId: confirmedNewOwnerId, txHash },
            transactionHash: txHash,
          },
        });
          // Notificaciones
          if (newOwnerId) {
            try {
              await notificationService.createNotification({
            userId: confirmedNewOwnerId,
              type: NotificationType.FILE_TRANSFER,
              title: 'Documento recibido',
              message: `Has recibido la propiedad del documento "${document.name}".`,
              link: `/app/documents/${documentId}`,
              data: { documentId, txHash }
            });
          } catch (_) { logger.warn(`No se pudo crear notificación de transferencia para documento ${documentId}`); }
        }
      } catch (syncErr) {
        logger.warn('Error en sync de transferencia', { documentId, error: syncErr instanceof Error ? syncErr.message : 'Error desconocido' });
      }

    WebSocketService.sendToUser(confirmedNewOwnerId, 'document:updated', { type: 'OWNERSHIP_TRANSFERRED', documentId });
    if (previousOwnerId) {
      WebSocketService.sendToUser(previousOwnerId, 'document:updated', { type: 'OWNERSHIP_TRANSFERRED', documentId });
    }
  }

  /**
   * Rollback de transferencia preparada tras fallo de transacción blockchain.
   * Busca el evento TRANSFER_PREPARED mas reciente y lo elimina.
   */
  static async rollbackTransfer(documentId: string, userId: string, transferId?: string): Promise<void> {
    const where: any = { eventType: 'TRANSFER_PREPARED', documentId };
    if (transferId) {
      where.metadata = { path: ['transferId'], equals: transferId };
    }
    const preparedEvent = await prisma.event.findFirst({
      where,
      orderBy: { createdAt: 'desc' },
    });
    if (!preparedEvent) throw new NotFoundError('No hay transferencia pendiente para este documento');

    await prisma.event.create({
      data: {
        id: uuidv4(),
        eventType: 'TRANSFER_ROLLBACK',
        userId,
        documentId,
        metadata: { rolledBackEventId: preparedEvent.id },
      },
    });

    await prisma.event.delete({ where: { id: preparedEvent.id } });
    logger.info(`Transferencia rollback ejecutada para documento ${documentId}`);
  }
}

export default TransferService;
