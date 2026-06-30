/**
 * Servicio de firmas digitales.
 *
 * Gestiona la preparacion, confirmacion y consulta de firmas sobre versiones de documentos.
 * 1. prepareSignature: Crea registro en BD (blockchainTxHash = null).
 * 2. confirmSignature: Establece blockchainTxHash en el registro tras la firma blockchain del usuario.
 */

import { v4 as uuidv4 } from 'uuid';
import prisma from '../config/database';
import { getContracts } from '../config/blockchain';
import logger from '../utils/logger';
import { DocumentPermissionService } from './documentPermissionService';
import notificationService, { NotificationType } from './notificationService';
import { userHasAccess } from '../utils/accessControl';
import { assertDocumentSignedReceipt } from './blockchainReceiptService';
import { assertDocumentActive } from '../utils/blockchainGuard';
import { BlockchainError, ConflictError, NotFoundError, UnauthorizedError, ValidationError } from '../utils/errors';
import { normalizeEthereumAddress } from '../utils/ethereum';

// ============================================
// Tipos
// ============================================

/**
 * Información básica de una firma digital.
 * @property id - Identificador de la firma
 * @property documentId - ID del documento firmado
 * @property versionId - ID de la versión firmada
 * @property signerWalletId - Wallet utilizada para firmar
 */
export interface SignatureInfo {
  id: string;
  documentId: string;
  versionId: string | null;
  signerWalletId: string;
}

/**
 * Resumen del firmante de un documento.
 * @property userId - ID del usuario firmante
 * @property username - Nombre de usuario
 * @property fullName - Nombre completo
 * @property walletAddress - Dirección de la wallet firmante
 * @property source - Origen de los datos (live o snapshot histórico)
 */
export interface SignerSummary {
  userId: string | null;
  username: string | null;
  fullName: string | null;
  walletAddress: string;
  source: 'live' | 'snapshot';
}

/**
 * Vista completa de una firma digital.
 * @property id - Identificador de la firma
 * @property documentId - ID del documento
 * @property versionId - ID de la versión
 * @property versionNumber - Número de versión
 * @property userId - ID del usuario
 * @property signerWalletId - Wallet del firmante
 * @property signedAt - Fecha de firma
 * @property blockchainTxHash - Hash de la transacción
 * @property signer - Datos del firmante
 */
export interface SignatureView {
  id: string;
  documentId: string;
  versionId: string;
  versionNumber: number;
  userId: string | null;
  signerWalletId: string | null;
  signedAt: Date;
  blockchainTxHash: string | null;
  signer: SignerSummary;
}

/**
 * Datos de entrada para preparar una firma.
 * @property documentId - ID del documento a firmar
 * @property versionNumber - Número de versión objetivo
 * @property signerUserId - ID del usuario firmante
 * @property signerWalletId - Wallet del firmante
 */
export interface PrepareSignatureInput {
  documentId: string;
  versionNumber: number;
  signerUserId: string;
  signerWalletId: string;
  comment?: string;
}

/**
 * Resultado de la preparación de una firma.
 * @property blockchainId - ID del documento en blockchain
 * @property versionId - Número de versión
 * @property contentHash - Hash del contenido del documento
 * @property messageToSign - Mensaje legible para firmar en MetaMask
 * @property signatureId - ID de la firma creada en base de datos
 */
export interface PrepareSignatureResult {
  blockchainId: string;
  versionId: number;
  contentHash: string;    // Hash del contenido del documento
  messageToSign: string;  // Igual que contentHash — alias para SigningService del frontend
  signatureId: string;
}

/**
 * Datos de entrada para confirmar una firma.
 * @property signatureId - ID de la firma en base de datos
 * @property txHash - Hash de la transacción blockchain
 * @property ecdsaSignature - Firma ECDSA del contentHash
 * @property confirmerUserId - ID del usuario que confirma
 */
export interface ConfirmSignatureInput {
  signatureId: string;
  txHash: string;
  ecdsaSignature: string;  // Firma del contentHash
  confirmerUserId: string;
}

// ============================================
// Clase del Servicio de Firmas
// ============================================

/**
 * Servicio de gestion de firmas digitales sobre documentos.
  * Prepara el registro en BD y permite al frontend firmar la transacción en blockchain.
 */
export class SignatureService {
  /**
   * Prepara una firma para su creación
   * - Valida el acceso
   * - Crea el registro en BD (blockchainTxHash permanece null hasta la confirmacion)
   * - Devuelve los datos necesarios para que el frontend firme la transacción blockchain
   *
   * @param input - Datos con documentId, versionNumber, signerUserId y signerWalletId
   * @returns Resultado con blockchainId, versionId, contentHash, messageToSign y signatureId
   * @throws {NotFoundError} Si la versión no existe
   * @throws {Error} Si la wallet no pertenece al usuario, el documento no existe, no tiene blockchainId, está archivado/eliminado, o el usuario no tiene acceso
   */
  static async prepareSignature(input: PrepareSignatureInput): Promise<PrepareSignatureResult> {
    const {
      documentId,
      versionNumber,
      signerUserId,
      signerWalletId,
      comment,
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
      throw new NotFoundError('Wallet no encontrada o no pertenece al usuario');
    }

    // 2. Check document access
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundError('Documento no encontrado');
    }

    if (!document.blockchainId) {
      throw new ValidationError('El documento no tiene ID de blockchain aún');
    }

    await assertDocumentActive(document.blockchainId, 'firmar');

    // Verificar acceso: si existe blockchainId, consultar el contrato inteligente PRIMERO (única fuente de verdad).
    // Usar ownerId de PostgreSQL como respaldo solo para documentos no registrados aun en la cadena.
    let hasAccess: boolean;

    if (document.blockchainId) {
      hasAccess = await DocumentPermissionService.canView(
        document.blockchainId,
        signerWallet.walletAddress
      );
    } else {
      hasAccess = document.ownerId === signerUserId;
    }

    if (!hasAccess) {
      throw new UnauthorizedError('No tienes acceso a este documento');
    }

    // 3. Obtener la version exacta a firmar
    const version = await prisma.version.findFirst({
      where: { documentId, versionNumber },
    });

    if (!version) {
      throw new NotFoundError('Versión no encontrada');
    }

    // 4. Verificar si ya se ha firmado esta versión específica
    const existingSignature = await prisma.documentSignature.findFirst({
      where: {
        versionId: version.id,
        userId: signerUserId,
      },
    });

    if (existingSignature) {
      throw new ConflictError('Ya has firmado esta versión del documento');
    }

    // 5. Crear firma en BD con blockchainTxHash = null + registrar evento atómicamente
    const signature = await prisma.$transaction(async (tx) => {
      const sig = await tx.documentSignature.create({
        data: {
          id: uuidv4(),
          documentId,
          versionId: version.id,
          userId: signerUserId,
          signerWalletId,
          signerUsernameSnapshot: signerWallet.user.username,
          signerFullNameSnapshot: signerWallet.user.fullName,
          signerWalletAddressSnapshot: signerWallet.walletAddress,
        },
      });

      await tx.event.create({
        data: {
          id: uuidv4(),
          eventType: 'SIGNATURE_PREPARED',
          userId: signerUserId,
          documentId: document.id,
          metadata: {
            signatureId: sig.id,
            blockchainId: document.blockchainId,
            versionId: version.id,
            contentHash: version.contentHash,
            comment: comment || null,
          },
        },
      });

      return sig;
    });

    logger.info(`[PREPARE] Signature creada en DB: ${signature.id}, estado: PREPARING`);

    // Generar mensaje legible para el usuario (se muestra en MetaMask)
    const messageToSign = `DocumentChain - Firma Digital
Documento: "${document.name}"
Version: ${version.versionNumber}
Fecha: ${new Date().toISOString()}
Wallet: ${signerWallet.walletAddress}
ContentHash: ${version.contentHash}`;

    return {
      blockchainId: document.blockchainId,
      versionId: version.versionNumber,
      contentHash: version.contentHash,
      messageToSign, // Mensaje legible que se muestra en MetaMask
      signatureId: signature.id,
    };
  }

  /**
     * Confirma una firma tras la transacción blockchain
     * - Establece blockchainTxHash en el registro de BD
    *
    * @param input - Datos con signatureId, txHash, ecdsaSignature y confirmerUserId
    * @returns Informacion de la firma confirmada
    * @throws {Error} Si la firma no existe, el usuario no coincide, ya tiene blockchainTxHash, o faltan datos blockchain
   */
  static async confirmSignature(input: ConfirmSignatureInput): Promise<SignatureInfo> {
    const { signatureId, txHash, ecdsaSignature, confirmerUserId } = input;

    // 1. Buscar la firma
    const signature = await prisma.documentSignature.findUnique({
      where: { id: signatureId },
      include: {
        document: {
          select: {
            id: true,
            name: true,
            ownerId: true,
            blockchainId: true,
          },
        },
        version: {
          select: {
            versionNumber: true,
          },
        },
        signerWallet: {
          select: {
            walletAddress: true,
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
      throw new NotFoundError('Firma no encontrada');
    }

    if (!signature.userId || signature.userId !== confirmerUserId) {
      throw new UnauthorizedError('No puedes confirmar una firma creada por otro usuario');
    }

    // 2. Validate current status
    if (signature.blockchainTxHash) {
      throw new ConflictError('La firma ya fue confirmada o procesada previamente');
    }

    if (!signature.document.blockchainId || !signature.signerWallet?.walletAddress) {
      throw new BlockchainError('No se puede validar la firma en blockchain');
    }

    const preparedEvent = await prisma.event.findFirst({
      where: {
        eventType: 'SIGNATURE_PREPARED',
        documentId: signature.documentId,
        metadata: { path: ['signatureId'], equals: signatureId },
      },
      orderBy: { createdAt: 'desc' },
    });
    const metadata = preparedEvent?.metadata as { signatureId?: unknown; contentHash?: unknown } | null;
    if (metadata?.signatureId !== signatureId || typeof metadata.contentHash !== 'string') {
      throw new NotFoundError('No se encontró la preparación de esta firma');
    }

    await assertDocumentSignedReceipt({
      txHash,
      docId: signature.document.blockchainId,
      versionNumber: signature.version.versionNumber,
      signerAddress: signature.signerWallet.walletAddress,
    });

    // 3. Update signature + log event atomically
    const updated = await prisma.$transaction(async (tx) => {
      const updatedSig = await tx.documentSignature.update({
        where: { id: signatureId },
        data: {
          blockchainTxHash: txHash,
        },
      });

      await tx.event.create({
        data: {
          id: uuidv4(),
          eventType: 'SIGNATURE_TX_SUBMITTED',
          userId: confirmerUserId,
          documentId: signature.documentId,
          transactionHash: txHash,
          metadata: {
            signatureId: signature.id,
            ecdsaSignature,
            previousStatus: signature.blockchainTxHash ? 'submitted' : 'pending',
          },
        },
      });

      return updatedSig;
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
      try {
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
      } catch (notifError) {
        logger.warn('Notificación de firma no creada (no bloqueante)', notifError);
      }
    }

    return this.toSignatureInfo(updated);
  }


  /**
   * Obtiene las firmas de una version
   *
   * @param versionId - ID de la versión
   * @param requesterUserId - ID del usuario solicitante
   * @returns Lista de firmas con datos del firmante
   * @throws {Error} Si la versión no existe o el usuario no tiene acceso
   */
  static async getVersionSignatures(versionId: string, requesterUserId: string): Promise<SignatureView[]> {
    const version = await prisma.version.findUnique({
      where: { id: versionId },
      select: {
        id: true,
        documentId: true,
        versionNumber: true,
        document: {
          select: {
            blockchainId: true,
          },
        },
      },
    });

    if (!version) {
      throw new NotFoundError('Versión no encontrada');
    }

    await this.assertUserCanAccessDocument(version.documentId, requesterUserId);

    const blockchainId = version.document.blockchainId;

    try {
      if (blockchainId) {
        const contracts = getContracts();
        const chainSigs = await contracts.documentRegistry.getVersionSignatures(blockchainId, version.versionNumber);
        if (chainSigs && chainSigs.length > 0) {
          const normalizedAddresses = chainSigs
            .map((s: any) => normalizeEthereumAddress(s.signer))
            .filter((addr: string | null): addr is string => addr !== null);

          const wallets = normalizedAddresses.length > 0
            ? await prisma.wallet.findMany({
                where: { walletAddress: { in: normalizedAddresses, mode: 'insensitive' } },
                include: { user: { select: { id: true, username: true, fullName: true } } },
              })
            : [];

          const walletByAddress = new Map<string, typeof wallets[number]>();
          for (const w of wallets) {
            walletByAddress.set(normalizeEthereumAddress(w.walletAddress) || w.walletAddress.toLowerCase(), w);
          }

          const dbSignatures = await prisma.documentSignature.findMany({
            where: { versionId },
            select: { id: true, documentId: true, signedAt: true, blockchainTxHash: true, userId: true, signerWalletId: true, signerUsernameSnapshot: true, signerFullNameSnapshot: true, signerWalletAddressSnapshot: true },
          });

          const dbSigByWalletId = new Map<string, typeof dbSignatures[number]>();
          for (const s of dbSignatures) {
            if (s.signerWalletId) dbSigByWalletId.set(s.signerWalletId, s);
          }

          return chainSigs.map((chainSig: any): SignatureView => {
            const normalizedAddress = normalizeEthereumAddress(chainSig.signer);
            const wallet = normalizedAddress ? walletByAddress.get(normalizedAddress) ?? null : null;

            const dbSig = wallet
              ? dbSigByWalletId.get(wallet.id) ?? null
              : dbSignatures.find(s => s.signerWalletAddressSnapshot === normalizedAddress) ?? null;

            const hasLiveUser = !!(wallet?.user);
            return {
              id: dbSig?.id || `${blockchainId}:${version.versionNumber}:${chainSig.signer}`,
              documentId: dbSig?.documentId || version.documentId,
              versionId: version.id,
              versionNumber: version.versionNumber,
              userId: hasLiveUser ? wallet.user.id : (dbSig?.userId ?? null),
              signerWalletId: dbSig?.signerWalletId ?? wallet?.id ?? null,
              signedAt: new Date(Number(chainSig.timestamp) * 1000),
              blockchainTxHash: dbSig?.blockchainTxHash ?? null,
              signer: {
                userId: hasLiveUser ? wallet.user.id : null,
                username: hasLiveUser ? wallet.user.username : (dbSig?.signerUsernameSnapshot ?? null),
                fullName: hasLiveUser ? wallet.user.fullName : (dbSig?.signerFullNameSnapshot ?? null),
                walletAddress: chainSig.signer,
                source: hasLiveUser ? 'live' as const : 'snapshot' as const,
              },
            };
          });
        }
      }
    } catch (error) {
      logger.warn(`Error al obtener firmas de blockchain, usando respaldo de BD: ${error instanceof Error ? error.message : String(error)}`);
    }

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


  // NOTA: removeSignature() se ha eliminado intencionadamente.
  // Las firmas son inmutables una vez confirmadas en la blockchain.
  // Eliminar el registro de BD mientras el registro on-chain persiste crea una inconsistencia.
  // Para limpieza de transacciones fallidas use rollbackSignature() (solo si blockchainTxHash es null).

  /**
   * Convierte firma de Prisma a SignatureInfo
   *
   * @param signature - Registro de firma desde Prisma
   * @returns Objeto SignatureInfo tipado
   */
  private static toSignatureInfo(signature: any): SignatureInfo {
    return {
      id: signature.id,
      documentId: signature.documentId,
      versionId: signature.versionId,
      signerWalletId: signature.signerWalletId,
    };
  }

  /**
   * Convierte un registro de firma de Prisma a SignatureView.
   *
   * @param signature - Registro de firma desde Prisma
   * @returns Vista completa de la firma con datos del firmante
   */
  private static toSignatureView(signature: any): SignatureView {
    return {
      id: signature.id,
      documentId: signature.documentId,
      versionId: signature.versionId,
      versionNumber: signature.version.versionNumber,
      userId: signature.userId ?? null,
      signerWalletId: signature.signerWalletId ?? null,
      signedAt: signature.signedAt,
      blockchainTxHash: signature.blockchainTxHash ?? null,
      signer: {
        userId: signature.user?.id ?? signature.userId ?? null,
        username: signature.user?.username ?? signature.signerUsernameSnapshot ?? null,
        fullName: signature.user?.fullName ?? signature.signerFullNameSnapshot ?? null,
        walletAddress: signature.signerWallet?.walletAddress ?? signature.signerWalletAddressSnapshot ?? '',
        source: signature.user ? 'live' : 'snapshot',
      },
    };
  }

  /**
   * Verifica que un usuario tenga acceso a un documento.
   *
   * @param documentId - ID del documento
   * @param requesterUserId - ID del usuario solicitante
   * @throws {Error} Si el usuario no tiene acceso al documento
   */
  private static async assertUserCanAccessDocument(documentId: string, requesterUserId: string): Promise<void> {
    const hasAccess = await userHasAccess(documentId, requesterUserId);

    if (!hasAccess) {
      throw new UnauthorizedError('No tienes acceso a este documento');
    }
  }

  /**
   * Revierte una firma que no ha sido confirmada en blockchain (blockchainTxHash = null).
   * Elimina el registro en BD — cuando la transacción blockchain falla.
   *
   * @param signatureId - ID de la firma a revertir
   * @param userId - ID del usuario solicitante
   * @throws {Error} Si la firma no existe, no pertenece al usuario, o ya tiene blockchainTxHash (confirmada)
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
        blockchainTxHash: null,
      },
    });

    if (!signature) {
      throw new NotFoundError('Firma no encontrada, no tienes permiso, o no está en estado PREPARING');
    }

    await prisma.documentSignature.delete({
      where: { id: signatureId },
    });

    logger.info(`[ROLLBACK] Firma ${signatureId} revertida por usuario ${userId}`);
  }

  /**
   * Obtiene las firmas de una versión por su número.
   *
   * @param documentId - ID del documento
   * @param versionNumber - Número de versión
   * @param requesterUserId - ID del usuario solicitante
   * @returns Lista de firmas con datos del firmante
   * @throws {Error} Si la versión no existe
   */
  static async getVersionSignaturesByNumber(documentId: string, versionNumber: number, requesterUserId: string): Promise<SignatureView[]> {
    const version = await prisma.version.findFirst({ where: { documentId, versionNumber } });
    if (!version) throw new NotFoundError('Versión no encontrada');
    return this.getVersionSignatures(version.id, requesterUserId);
  }
}

export default SignatureService;
