/**
 * Signature Service - Refactored for Frontend Wallet Signatures
 * 
 * This service implements the prepare/confirm pattern:
 * 1. prepareSignature: Creates DB record with PREPARING status
 * 2. confirmSignature: Updates DB record after frontend signs blockchain transaction
 * 
 * The backend NO LONGER:
 * - Handles passwords
 * - Signs blockchain transactions (user's wallet does this)
 */

import { v4 as uuidv4 } from 'uuid';
import prisma from '../config/database';
import { BlockchainStatus } from '@prisma/client';
import logger from '../utils/logger';
import { provider } from '../config/blockchain';
import { DocumentPermissionService } from './documentPermissionService';
import { BlockchainQueries } from '../lib/blockchain/queries';
import notificationService, { NotificationType } from './notificationService';

// ============================================
// Types
// ============================================

export interface SignatureInfo {
  id: string;
  documentId: string;
  versionId: string | null;
  signerWalletId: string;
  blockchainStatus: BlockchainStatus;
}

export interface SignerSummary {
  userId: string | null;
  username: string | null;
  fullName: string | null;
  walletAddress: string;
  source: 'live' | 'snapshot';
  avatarUrl: string | null;
}

export interface SignatureView {
  id: string;
  documentId: string;
  versionId: string;
  versionNumber: number;
  userId: string | null;
  signerWalletId: string | null;
  signedAt: Date;
  blockchainStatus: BlockchainStatus;
  blockchainTxHash: string | null;
  signer: SignerSummary;
}

export interface PrepareSignatureInput {
  documentId: string;
  versionNumber: number;
  signerUserId: string;
  signerWalletId: string;
}

export interface PrepareSignatureResult {
  blockchainId: string;
  versionId: number;
  contentHash: string;    // Hash of document content
  messageToSign: string;  // Same as contentHash — alias for frontend SigningService
  signatureId: string;
}

export interface ConfirmSignatureInput {
  signatureId: string;
  txHash: string;
  ecdsaSignature: string;  // Signature of the contentHash
  confirmerUserId: string;
}

// ============================================
// Signature Service Class
// ============================================

export class SignatureService {
  /**
   * Prepare a signature for creation
   * - Validates access
   * - Creates DB record with PREPARING status
   * - Returns data needed for frontend to sign blockchain transaction
   */
  static async prepareSignature(input: PrepareSignatureInput): Promise<PrepareSignatureResult> {
    const {
      documentId,
      versionNumber,
      signerUserId,
      signerWalletId,
    } = input;

    // 1. Validate signer's wallet
    const signerWallet = await prisma.wallet.findFirst({
      where: {
        id: signerWalletId,
        userId: signerUserId,
      },
      include: {
        user: {
          select: {
            username: true,
            fullName: true,
          },
        },
      },
    });

    if (!signerWallet) {
      throw new Error('Wallet no encontrada o no pertenece al usuario');
    }

    // 2. Check document access
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new Error('Documento no encontrado');
    }

    if (!document.blockchainId) {
      throw new Error('El documento no tiene ID de blockchain aún');
    }

    if (document.isArchived) {
      throw new Error('No se pueden firmar documentos archivados');
    }

    // Check if user has access (owner or shared) using the same wallet-aware
    // strategy as the shared document detail flow.
    let hasAccess = document.ownerId === signerUserId;

    if (!hasAccess) {
      const blockchainDocuments = await BlockchainQueries.getUserDocuments(signerWallet.walletAddress);
      hasAccess = blockchainDocuments.includes(document.blockchainId);
    }

    if (!hasAccess) {
      const { ShareService } = await import('./shareService');
      const fallbackShares = await ShareService.getSharedWithUser(signerUserId);
      hasAccess = fallbackShares.some((share) => share.documentId === documentId);
    }

    if (!hasAccess) {
      hasAccess = await DocumentPermissionService.canView(
        document.blockchainId,
        signerWallet.walletAddress
      );
    }

    if (!hasAccess) {
      throw new Error('No tienes acceso a este documento');
    }

    // 3. Get the exact version to sign (query by versionNumber, not array index)
    const version = await prisma.version.findFirst({
      where: { documentId, versionNumber },
    }) || await prisma.version.findFirst({
      where: { documentId },
      orderBy: { versionNumber: 'desc' },
    });

    if (!version) {
      throw new Error('Versión no encontrada');
    }

    // 4. Check if already signed this specific version
    const existingSignature = await prisma.documentSignature.findFirst({
      where: {
        versionId: version.id,
        userId: signerUserId,
      },
    });

    if (existingSignature) {
      throw new Error('Ya has firmado esta versión del documento');
    }

    // 5. Create signature in DB with PREPARING status
    const signature = await prisma.documentSignature.create({
      data: {
        id: uuidv4(),
        documentId,
        versionId: version.id,
        userId: signerUserId,
        signerWalletId,
        signerUsernameSnapshot: signerWallet.user.username,
        signerFullNameSnapshot: signerWallet.user.fullName,
        signerWalletAddressSnapshot: signerWallet.walletAddress,
        blockchainStatus: BlockchainStatus.PREPARING,
      },
    });

    logger.info(`[PREPARE] Signature creada en DB: ${signature.id}, estado: PREPARING`);

    // 6. Log the preparation
    await prisma.event.create({
      data: {
        id: uuidv4(),
        eventType: 'SIGNATURE_PREPARED',
        userId: signerUserId,
        documentId: document.id,
        metadata: {
          signatureId: signature.id,
          blockchainId: document.blockchainId,
          versionId: version.id,
          contentHash: document.contentHash,
        },
      },
    });

    // Generar mensaje legible para el usuario (se muestra en MetaMask)
    const messageToSign = `DocumentChain - Firma Digital
Documento: "${document.name}"
Version: ${version.versionNumber}
Fecha: ${new Date().toISOString()}
Wallet: ${signerWallet.walletAddress}
ContentHash: ${document.contentHash}`;

    return {
      blockchainId: document.blockchainId,
      versionId: version.versionNumber,
      contentHash: document.contentHash,
      messageToSign, // Mensaje legible que se muestra en MetaMask
      signatureId: signature.id,
    };
  }

  /**
   * Confirm a signature after blockchain transaction
   * - Updates DB record with TX_SUBMITTED status
   * - Event listener will update to SYNCED when confirmed
   */
  static async confirmSignature(input: ConfirmSignatureInput): Promise<SignatureInfo> {
    const { signatureId, txHash, ecdsaSignature, confirmerUserId } = input;

    // 1. Find the signature
    const signature = await prisma.documentSignature.findUnique({
      where: { id: signatureId },
      include: {
        document: {
          select: {
            id: true,
            name: true,
            ownerId: true,
          },
        },
        user: {
          select: {
            username: true,
          },
        },
      },
    });

    if (!signature) {
      throw new Error('Signature no encontrada');
    }

    if (!signature.userId || signature.userId !== confirmerUserId) {
      throw new Error('No puedes confirmar una firma creada por otro usuario');
    }

    const receipt = await provider.getTransactionReceipt(txHash);
    if (!receipt) {
      throw new Error('No se encontró la transacción de firma en blockchain');
    }

    if (receipt.status !== 1) {
      throw new Error('La transacción de firma revirtió en blockchain');
    }

    // 2. Validate current status
    if (signature.blockchainStatus !== BlockchainStatus.PREPARING) {
      logger.warn(`[CONFIRM] Signature ${signatureId} no está en estado PREPARING (actual: ${signature.blockchainStatus})`);
      throw new Error(`La firma no puede confirmarse en estado ${signature.blockchainStatus}`);
    }

    // 3. Update signature with transaction info
    const updated = await prisma.documentSignature.update({
      where: { id: signatureId },
      data: {
        blockchainStatus: BlockchainStatus.SYNCED,
        blockchainTxHash: txHash,
        blockchainError: null,
      },
    });

    logger.info(`[CONFIRM] Signature ${signatureId} actualizada a SYNCED`);

    const notificationMessage = `${signature.user?.username || signature.signerUsernameSnapshot || 'Un usuario'} firmó "${signature.document.name}"`;
    const existingNotification = await prisma.notification.findFirst({
      where: {
        userId: signature.document.ownerId,
        type: NotificationType.FILE_SIGNED,
        message: notificationMessage,
        createdAt: {
          gte: new Date(Date.now() - 10 * 60 * 1000),
        },
      },
    });

    if (!existingNotification) {
      await notificationService.createNotification({
        userId: signature.document.ownerId,
        type: NotificationType.FILE_SIGNED,
        title: 'Documento firmado',
        message: notificationMessage,
        link: `/app/documents/${signature.document.id}`,
        data: {
          documentId: signature.document.id,
          versionId: signature.versionId,
          signerWalletId: signature.signerWalletId,
          txHash,
        },
      });
    }

    // 4. Log the confirmation
    await prisma.event.create({
      data: {
        id: uuidv4(),
        eventType: 'SIGNATURE_TX_SUBMITTED',
        userId: confirmerUserId,
        documentId: signature.documentId,
        transactionHash: txHash,
        metadata: {
          signatureId: signature.id,
          ecdsaSignature,
          previousStatus: signature.blockchainStatus,
        },
      },
    });

    return this.toSignatureInfo(updated);
  }

  /**
   * Get signatures for a document
   */
  static async getDocumentSignatures(documentId: string, requesterUserId: string): Promise<SignatureView[]> {
    await this.assertUserCanAccessDocument(documentId, requesterUserId);

    const signatures = await prisma.documentSignature.findMany({
      where: { documentId },
      orderBy: [
        { signedAt: 'desc' },
        { id: 'desc' },
      ],
      include: {
        version: {
          select: {
            versionNumber: true,
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true,
          },
        },
        signerWallet: {
          select: {
            walletAddress: true,
          },
        },
      },
    });

    return signatures.map((signature) => this.toSignatureView(signature));
  }

  /**
   * Get signatures by wallet
   */
  static async getSignaturesByWallet(walletId: string): Promise<SignatureInfo[]> {
    const signatures = await prisma.documentSignature.findMany({
      where: { signerWalletId: walletId },
    });

    return signatures.map(s => this.toSignatureInfo(s));
  }

  /**
   * Get signatures for a version
   */
  static async getVersionSignatures(versionId: string, requesterUserId: string): Promise<SignatureView[]> {
    const version = await prisma.version.findUnique({
      where: { id: versionId },
      select: {
        id: true,
        documentId: true,
      },
    });

    if (!version) {
      throw new Error('Versión no encontrada');
    }

    await this.assertUserCanAccessDocument(version.documentId, requesterUserId);

    const signatures = await prisma.documentSignature.findMany({
      where: { versionId },
      orderBy: [
        { signedAt: 'desc' },
        { id: 'desc' },
      ],
      include: {
        version: {
          select: {
            versionNumber: true,
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true,
          },
        },
        signerWallet: {
          select: {
            walletAddress: true,
          },
        },
      },
    });

    return signatures.map((signature) => this.toSignatureView(signature));
  }

  /**
   * Check if a user has signed a version (via any of their wallets)
   */
  static async checkSignature(versionId: string, userId: string): Promise<boolean> {
    const wallets = await prisma.wallet.findMany({
      where: { userId },
      select: { id: true },
    });

    const walletIds = wallets.map(w => w.id);

    if (walletIds.length === 0) return false;

    const signature = await prisma.documentSignature.findFirst({
      where: {
        versionId,
        signerWalletId: { in: walletIds },
      },
    });

    return signature !== null;
  }

  /**
   * Get the user's own signature for a version
   */
  static async getMySignature(versionId: string, userId: string): Promise<SignatureInfo | null> {
    const version = await prisma.version.findUnique({
      where: { id: versionId },
      select: {
        documentId: true,
      },
    });

    if (!version) {
      return null;
    }

    await this.assertUserCanAccessDocument(version.documentId, userId);

    const wallets = await prisma.wallet.findMany({
      where: { userId },
      select: { id: true },
    });

    const walletIds = wallets.map(w => w.id);

    if (walletIds.length === 0) return null;

    const signature = await prisma.documentSignature.findFirst({
      where: {
        versionId,
        signerWalletId: { in: walletIds },
      },
    });

    return signature ? this.toSignatureInfo(signature) : null;
  }

  // NOTE: removeSignature() has been intentionally removed.
  // Signatures are immutable once confirmed on the blockchain.
  // Deleting the DB record while the on-chain record persists creates an inconsistency.
  // For failed-transaction cleanup use rollbackSignature() (PREPARING status only).

  /**
   * Mark signature as failed
   */
  static async markSignatureFailed(signatureId: string, error: string): Promise<void> {
    await prisma.documentSignature.update({
      where: { id: signatureId },
      data: {
        blockchainStatus: BlockchainStatus.FAILED,
        blockchainError: error,
      },
    });

    logger.error(`[SIGNATURE] Signature ${signatureId} marked as FAILED: ${error}`);
  }

  /**
   * Update signature status to SYNCED
   */
  static async markSignatureSynced(signatureId: string): Promise<void> {
    await prisma.documentSignature.update({
      where: { id: signatureId },
      data: {
        blockchainStatus: BlockchainStatus.SYNCED,
      },
    });

    logger.info(`[SIGNATURE] Signature ${signatureId} marked as SYNCED`);
  }

  /**
   * Convert Prisma signature to SignatureInfo
   */
  private static toSignatureInfo(signature: any): SignatureInfo {
    return {
      id: signature.id,
      documentId: signature.documentId,
      versionId: signature.versionId,
      signerWalletId: signature.signerWalletId,
      blockchainStatus: signature.blockchainStatus,
    };
  }

  private static toSignatureView(signature: any): SignatureView {
    return {
      id: signature.id,
      documentId: signature.documentId,
      versionId: signature.versionId,
      versionNumber: signature.version.versionNumber,
      userId: signature.userId ?? null,
      signerWalletId: signature.signerWalletId ?? null,
      signedAt: signature.signedAt,
      blockchainStatus: signature.blockchainStatus,
      blockchainTxHash: signature.blockchainTxHash ?? null,
      signer: {
        userId: signature.user?.id ?? signature.userId ?? null,
        username: signature.user?.username ?? signature.signerUsernameSnapshot ?? null,
        fullName: signature.user?.fullName ?? signature.signerFullNameSnapshot ?? null,
        walletAddress: signature.signerWallet?.walletAddress ?? signature.signerWalletAddressSnapshot ?? '',
        source: signature.user ? 'live' : 'snapshot',
        avatarUrl: signature.user?.avatarUrl ?? null,
      },
    };
  }

  private static async assertUserCanAccessDocument(documentId: string, requesterUserId: string): Promise<void> {
    const { DocumentService } = await import('./documentService');
    const hasAccess = await DocumentService.userHasAccess(documentId, requesterUserId);

    if (!hasAccess) {
      throw new Error('No tienes acceso a este documento');
    }
  }

  /**
   * Rollback a signature that is still in PREPARING status.
   * Deletes the DB record — used when the blockchain transaction fails.
   */
  static async rollbackSignature(signatureId: string, userId: string): Promise<void> {
    const wallets = await prisma.wallet.findMany({
      where: { userId },
      select: { id: true },
    });

    const walletIds = wallets.map(w => w.id);

    const signature = await prisma.documentSignature.findFirst({
      where: {
        id: signatureId,
        signerWalletId: { in: walletIds },
        blockchainStatus: BlockchainStatus.PREPARING,
      },
    });

    if (!signature) {
      throw new Error('Firma no encontrada, no tienes permiso, o no está en estado PREPARING');
    }

    await prisma.documentSignature.delete({
      where: { id: signatureId },
    });

    logger.info(`[ROLLBACK] Firma ${signatureId} revertida por usuario ${userId}`);
  }
}

export default SignatureService;