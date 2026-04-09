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

// ============================================
// Interfaces
// ============================================

export interface PrepareTransferInput {
  documentId: string;
  currentOwnerId: string;
  newOwnerId: string;
  currentOwnerWalletId: string;
  newOwnerWalletAddress: string;
  decryptedSymmetricKey?: string; // Base64-encoded symmetric key (decrypted in frontend)
}

export interface PrepareTransferResult {
  transferId: string;
  documentId: string;
  docId: string; // bytes32 for blockchain
  currentOwnerAddress: string;
  newOwnerAddress: string;
  message: string; // Para firmar en frontend
  nonce: number;
}

export interface ConfirmTransferInput {
  transferId: string;
  txHash: string;
  signature: string;
}

// ============================================
// Transfer Service Class
// ============================================

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

    if (document.ownerId !== currentOwnerId) {
      throw new Error('No eres el propietario del documento');
    }

    // Soft-delete check: cannot transfer deleted documents
    if (document.isDeleted) {
      throw new Error('No se pueden transferir documentos eliminados');
    }

    // 2. Validate current owner's wallet
    const currentWallet = await prisma.wallet.findFirst({
      where: {
        id: currentOwnerWalletId,
        userId: currentOwnerId,
      },
    });

    if (!currentWallet) {
      throw new Error('Wallet del propietario actual no encontrada');
    }

    // 3. Validate new owner exists and get their public key
    const newOwner = await prisma.user.findUnique({
      where: { id: newOwnerId },
      select: {
        id: true,
        username: true,
        publicKey: true,
      },
    });

    if (!newOwner) {
      throw new Error('Usuario destino no encontrado');
    }

    if (!newOwner.publicKey) {
      throw new Error('El nuevo propietario no tiene clave pública configurada');
    }

    const isPublicDocument = document.visibility === 'PUBLIC' || document.encryptedSymmetricKey === 'UNENCRYPTED';

    const reEncryptedKey = isPublicDocument
      ? 'UNENCRYPTED'
      : (() => {
          if (!decryptedSymmetricKey) {
            throw new Error('La clave simétrica descifrada es obligatoria para documentos privados');
          }

          logger.info(`[PREPARE] Clave simétrica re-encriptada para nuevo propietario ${newOwnerId}`);
          return Encryption.encryptSymmetricKey(decryptedSymmetricKey, newOwner.publicKey);
        })();

    // 5. Generate blockchain docId (bytes32)
    const docId = document.blockchainId || ethers.id(`${documentId}-${Date.now()}`);

    // 6. Update document with new encrypted key (ownership will be updated after blockchain confirmation)
    await prisma.document.update({
      where: { id: documentId },
      data: {
        blockchainId: docId,
        blockchainStatus: BlockchainStatus.PREPARING,
        encryptedSymmetricKey: reEncryptedKey, // Store re-encrypted key for new owner
        // Note: ownerId will be updated in confirmTransfer after blockchain confirmation
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
    const { transferId, txHash, signature } = input;

    logger.info(`[CONFIRM] Confirmando transferencia ${transferId} con tx ${txHash}`);

    // 1. Find the transfer event
    const transferEvent = await prisma.event.findFirst({
      where: {
        eventType: 'TRANSFER_PREPARED',
        metadata: {
          path: ['transferId'],
          equals: transferId,
        },
      },
    });

    if (!transferEvent) {
      throw new Error('Transfer event not found');
    }

    const metadata = transferEvent.metadata as any;
    const documentId = transferEvent.documentId;
    const newOwnerId = metadata.newOwner;

    if (!documentId) {
      throw new Error('Document ID not found in transfer event');
    }

    // 2. Update document ownership and status
    await prisma.document.update({
      where: { id: documentId },
      data: {
        ownerId: newOwnerId,
        blockchainStatus: BlockchainStatus.TX_SUBMITTED,
        blockchainTxHash: txHash,
      },
    });

    // Los shares están en blockchain - se revocan automáticamente mediante eventos

    // 4. Log the confirmed transfer
    await prisma.event.create({
      data: {
        id: uuidv4(),
        eventType: 'TRANSFER_CONFIRMED',
        userId: newOwnerId,
        documentId,
        transactionHash: txHash,
        metadata: {
          docId: metadata.docId,
          previousOwner: metadata.currentOwner,
          newOwner: newOwnerId,
          newOwnerAddress: metadata.newOwnerAddress,
          signature,
        },
      },
    });

    logger.info(`[CONFIRM] Transferencia confirmada: ${documentId} -> ${newOwnerId}`);
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
