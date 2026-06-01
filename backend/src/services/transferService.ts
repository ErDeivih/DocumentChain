/**
 * Transfer Service - Backend Encryption Architecture
 * 
 * Implements ownership transfer with backend re-encryption:
 * - Frontend decrypts symmetric key locally with current owner's private key
 * - Sends decrypted key to backend (over HTTPS)
 * - Backend re-encrypts with new owner's public key
 * - Updates document ownership after blockchain confirmation
 */

import { v4 as uuidv4 } from 'uuid';
import prisma from '../config/database';
import { BlockchainStatus } from '@prisma/client';
import logger from '../utils/logger';
import { ethers } from 'ethers';
import * as Encryption from '../lib/encryption';
import { DocumentPermissionService } from './documentPermissionService';
import { validateWalletBelongsToUser, getUserWithPublicKey } from '../utils/walletHelper';
import { assertOwnershipTransferredReceipt } from './blockchainReceiptService';

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
 * @property decryptedSymmetricKey - Clave simétrica descifrada (Base64, opcional)
 */
export interface PrepareTransferInput {
  documentId: string;
  currentOwnerId: string;
  newOwnerId: string;
  currentOwnerWalletId: string;
  newOwnerWalletAddress: string;
  decryptedSymmetricKey?: string; // Base64-encoded symmetric key (decrypted in frontend)
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
}

/**
 * Servicio de transferencia de propiedad de documentos.
 * Implementa el patrón prepare/confirm con re-encriptación de claves simétricas en backend.
 */
export class TransferService {
  /**
   * Prepare transfer for blockchain signing
   * - Validates ownership and permissions
   * - Re-encrypts document key with new owner's public key
   * - Creates transfer record with PREPARING status
   * - Returns data needed for frontend to sign blockchain transaction
   */
  static async prepareTransfer(input: PrepareTransferInput): Promise<PrepareTransferResult> {
    const {
      documentId,
      currentOwnerId,
      newOwnerId,
      currentOwnerWalletId,
      newOwnerWalletAddress,
      decryptedSymmetricKey,
    } = input;

    // 1. Validate current owner
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            passwordHash: true,
          },
        },
      },
    });

    if (!document) {
      throw new Error('Documento no encontrado');
    }

    // 2. Validate current owner's wallet
    const currentWallet = await validateWalletBelongsToUser(currentOwnerWalletId, currentOwnerId);

    // Validate ownership (on-chain or DB fallback)
    await DocumentPermissionService.validateOwnership(document, currentOwnerId, {
      existingWallet: currentWallet,
      errorMessage: 'No eres el propietario del documento',
    });

    // Soft-delete check: cannot transfer deleted documents
    if (document.isDeleted) {
      throw new Error('No se pueden transferir documentos eliminados');
    }

    if (document.isArchived) {
      throw new Error('No se pueden transferir documentos archivados');
    }

    // 3. Validate new owner exists and get their public key
    const { publicKey: newOwnerPublicKey } = await getUserWithPublicKey(newOwnerId);

    const isPublicDocument = document.visibility === 'PUBLIC' || document.encryptedSymmetricKey === 'UNENCRYPTED';

    const reEncryptedKey = isPublicDocument
      ? 'UNENCRYPTED'
      : (() => {
          if (!decryptedSymmetricKey) {
            throw new Error('La clave simétrica descifrada es obligatoria para documentos privados');
          }

          logger.info(`[PREPARE] Clave simétrica re-encriptada para nuevo propietario ${newOwnerId}`);
          return Encryption.encryptSymmetricKey(decryptedSymmetricKey, newOwnerPublicKey);
        })();

    // 5. Generate blockchain docId (bytes32)
    const docId = document.blockchainId || ethers.id(`${documentId}-${Date.now()}`);

    // 6. Mark the document as preparing, but keep the current encrypted key until
    // blockchain confirmation. Otherwise a failed transaction could lock out the
    // current owner from a private document.
    await prisma.document.update({
      where: { id: documentId },
      data: {
        blockchainId: docId,
        blockchainStatus: BlockchainStatus.PREPARING,
      },
    });

    // 7. Generate message to sign
    const nonce = Date.now();
    const message = `Transfer document ${docId} to ${newOwnerWalletAddress} at ${nonce}`;

    // Generate transferId before creating the event so it can be stored for lookup in confirmTransfer
    const transferId = uuidv4();

    // 8. Create event for transfer preparation
    await prisma.event.create({
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

    logger.info(`[PREPARE] Transfer preparada: ${documentId} -> ${newOwnerId}`);

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
   * Confirm transfer after blockchain transaction
   * - Updates document owner in DB
   * - Revokes all previous shares
   * - Logs the transfer event
   */
  static async confirmTransfer(input: ConfirmTransferInput): Promise<void> {
    const { transferId, txHash, signature, documentId: inputDocumentId, newOwnerId: inputNewOwnerId, confirmerUserId } = input;

    logger.info(`[CONFIRM] Confirmando transferencia ${transferId} con tx ${txHash}`);

    // 1. Recover metadata from the prepared event for convenience,
    //    but do NOT depend on it for authorization.
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
      throw new Error('No se encontró el ID del documento en el evento de transferencia');
    }

    const confirmedNewOwnerId = newOwnerId || metadata.newOwner;
    const pendingEncryptedSymmetricKey = metadata.pendingEncryptedSymmetricKey;

    if (!confirmedNewOwnerId) {
      throw new Error('No se encontró el nuevo propietario de la transferencia');
    }

    if (!pendingEncryptedSymmetricKey) {
      throw new Error('No se encontró la clave re-cifrada pendiente de la transferencia');
    }

    // 2. Validate the transaction on-chain when possible
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new Error('Documento no encontrado para confirmar la transferencia');
    }

    if (document.ownerId !== confirmerUserId) {
      throw new Error('Solo el propietario actual puede confirmar la transferencia');
    }

    if (!document.blockchainId) {
      throw new Error('El documento no está registrado en blockchain');
    }

    const currentWallet = metadata.currentWalletId
      ? await prisma.wallet.findFirst({ where: { id: metadata.currentWalletId, userId: document.ownerId } })
      : null;

    if (!currentWallet) {
      throw new Error('No se encontró la wallet del propietario actual para validar la transferencia');
    }

    await assertOwnershipTransferredReceipt({
      txHash,
      docId: document.blockchainId,
      fromAddress: currentWallet.walletAddress,
      toAddress: metadata.newOwnerAddress,
    });

    // 3. Apply ownership, re-encrypted key and share-key cleanup atomically.
    await prisma.$transaction(async (tx) => {
      await tx.document.update({
        where: { id: documentId },
        data: {
          ownerId: confirmedNewOwnerId,
          encryptedSymmetricKey: pendingEncryptedSymmetricKey,
          blockchainStatus: BlockchainStatus.TX_SUBMITTED,
          blockchainTxHash: txHash,
        },
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
  }

  /**
   * Get transfer history for a document
   */
  static async getTransferHistory(documentId: string): Promise<any[]> {
    const transfers = await prisma.event.findMany({
      where: {
        documentId,
        eventType: {
          in: ['TRANSFER_PREPARED', 'TRANSFER_CONFIRMED'],
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return transfers;
  }
}

export default TransferService;
