import prisma from '../config/database';
import { getContracts } from '../config/blockchain';
import { calculateHash } from '../lib/encryption';
import { BlockchainQueries } from '../lib/blockchain/queries';
import { DocumentPermissionService, DocumentRole } from './documentPermissionService';
import { ethers } from 'ethers';
import logger, { logBlockchainError } from '../utils/logger';
import { normalizeEthereumAddress } from '../utils/ethereum';
import { BlockchainCacheService } from './blockchainCacheService';

/**
 * Resultado de una operación de verificación de documento.
 * @property exists - Indica si el documento fue encontrado
 * @property document - Información básica del documento
 * @property versions - Lista de versiones
 * @property matchedVersion - Versión que coincide con la búsqueda
 * @property shares - Comparticiones activas
 * @property signatures - Firmas registradas
 * @property blockchain - Datos on-chain del documento
 */
export interface VerificationResult {
  exists: boolean;
  document?: {
    id: string;
    name: string;
    owner: string;
    ownerUsername?: string;
    uploadedAt: Date;
    fileSize: number;
    ipfsHash: string;
    currentVersion: number;
  };
  versions?: Array<{
    versionNumber: number;
    createdAt: Date;
    createdBy?: string;
    comment?: string;
  }>;
  matchedVersion?: number;
  contentHashVerified?: boolean;
  shares?: Array<{
    sharedWith: string;
    sharedWithUsername?: string;
    role: string;
    sharedAt: Date;
  }>;
  signatures?: Array<{
    signedBy: string;
    signedByUsername?: string;
    walletAddress: string;
    signedAt: Date;
    comment?: string;
    versionNumber: number;
  }>;
  blockchain?: {
    documentId: string;
    ipfsHash: string;
    metadataHash: string;
    owner: string;
    isDeleted: boolean;
    blockNumber: number;
    transactionHash: string;
  };
}

/**
 * Servicio de verificación de autenticidad e integridad de documentos.
 * Permite verificar la existencia y propiedades de un documento mediante hash, CID o blockchainId.
 */
export class VerificationService {
  /**
   * Verificar si un archivo existe en la blockchain mediante su hash
   *
   * @param fileBuffer - Buffer del archivo a verificar
   * @returns Resultado de verificación con datos del documento, versiones, firmas y blockchain
   */
  static async verifyFileByHash(fileBuffer: Buffer): Promise<VerificationResult> {
    // El seed y el frontend almacenan contentHash con prefijo '0x': '0x' + sha256hex.
    // calculateHash() devuelve solo el hex sin prefijo → no coincide con lo almacenado en BD.
    // Fix: añadir '0x' para que la búsqueda WHERE contentHash = ... encuentre el documento.
    const contentHash = '0x' + calculateHash(fileBuffer);
    
    const document = await prisma.document.findFirst({
      where: { contentHash },
      include: {
        owner: { select: { username: true } },
        versions: { include: { user: { select: { username: true } } } },
        signatures: {
          include: {
            user: { select: { username: true } },
            signerWallet: { select: { walletAddress: true } },
          }
        },
      },
    });

    if (!document) {
      return { exists: false };
    }

    return this.buildVerificationResult(document);
  }

  /**
   * Verificar documento por IPFS hash
   * Busca el CID en las versiones de documentos almacenados en DB,
   * y delega al método por blockchainId si se encuentra.
   *
   * @param ipfsHash - CID de IPFS a buscar
   * @returns Resultado de verificación o { exists: false } si no se encuentra
   */
  static async verifyByIPFSHash(ipfsHash: string): Promise<VerificationResult> {
    if (!ipfsHash || typeof ipfsHash !== 'string') {
      return { exists: false };
    }

    // Buscar version por ipfsCid almacenado en BD
    const version = await prisma.version.findFirst({
      where: { ipfsCid: ipfsHash.trim() },
      include: { document: true },
    });

    if (version?.document?.blockchainId) {
      // Delegar a la verificación blockchain funcional
      return VerificationService.verifyByBlockchainId(version.document.blockchainId, version.versionNumber);
    }

    // No encontrado en BD — return not exists
    return { exists: false };
  }

  /**
   * Verificar documento por ID de blockchain
   *
   * @param blockchainId - ID del documento en blockchain (bytes32)
   * @param matchedVersionHint - Número de versión sugerida como coincidencia (opcional)
   * @returns Resultado de verificación con datos del documento, versiones, firmas y blockchain
   */
  static async verifyByBlockchainId(blockchainId: string, matchedVersionHint?: number): Promise<VerificationResult> {
    try {
      const contracts = getContracts();
      const docData = await contracts.documentRegistry.getDocument(blockchainId);

      const document = await prisma.document.findFirst({
        where: { blockchainId },
        include: {
          owner: { select: { username: true } },
          versions: { include: { user: { select: { username: true } } } },
          signatures: {
            include: {
              user: { select: { username: true } },
              signerWallet: { select: { walletAddress: true } },
            }
          },
        },
      });

      if (document) {
        return this.buildVerificationResult(document, matchedVersionHint);
      }

      return {
        exists: docData.owner !== ethers.ZeroAddress,
        blockchain: {
          documentId: blockchainId,
          ipfsHash: '',
          metadataHash: '',
          owner: docData.owner,
          isDeleted: Boolean(docData.isDeleted),
          blockNumber: 0,
          transactionHash: '',
        },
      };
    } catch (error) {
      const document = await prisma.document.findFirst({
        where: { blockchainId },
        include: {
          owner: { select: { username: true } },
          versions: { include: { user: { select: { username: true } } } },
          signatures: {
            include: {
              user: { select: { username: true } },
              signerWallet: { select: { walletAddress: true } },
            }
          },
        },
      });

      if (!document) {
        return { exists: false };
      }

      return this.buildVerificationResult(document, matchedVersionHint);
    }
  }

  /**
   * Obtiene comparticiones de un documento desde blockchain y las enriquece con nombres de usuario de BD.
   * Devuelve array vacío si blockchainId es nulo o la llamada blockchain falla.
   *
   * @param blockchainId - ID del documento en blockchain
   * @returns Lista de comparticiones con direcciones y nombres de usuario
   */
  private static async buildVerificationResult(
    document: any,
    matchedVersionHint?: number,
  ): Promise<VerificationResult> {
    let blockchainInfo;
    let blockchainDoc;
    let contentHashVerified: boolean | undefined;
    try {
      if (document.blockchainId) {
        blockchainDoc = await BlockchainQueries.getDocument(document.blockchainId);
        const contracts = getContracts();
        const docData = await contracts.documentRegistry.getDocument(document.blockchainId);
        const currentVersion = Number(docData.currentVersion || 0);
        const versionData = currentVersion > 0
          ? await contracts.documentRegistry.getVersion(document.blockchainId, currentVersion)
          : null;
        blockchainInfo = {
          documentId: document.blockchainId,
          ipfsHash: versionData?.ipfsCid || '',
          metadataHash: versionData?.encryptedKeyHash || '',
          owner: docData.owner,
          isDeleted: Boolean(docData.isDeleted),
          blockNumber: 0,
          transactionHash: document.blockchainTxHash || '',
        };
        if (versionData?.contentHash) {
          const dbVersion = document.versions.find((v: any) => v.versionNumber === currentVersion);
          if (dbVersion?.contentHash) {
            contentHashVerified = versionData.contentHash === dbVersion.contentHash;
          }
        }
      }
    } catch (error) {
      logBlockchainError('Fetch blockchain data', error as Error);
    }

    let operationalVersionNumber = 0;
    try {
      if (document.blockchainId) {
        operationalVersionNumber = await BlockchainCacheService.getOperationalVersionNumber(document.blockchainId);
      }
    } catch (error) {
      logger.warn(`[Verification] Error al obtener version operativa: ${error instanceof Error ? error.message : String(error)}`);
    }
    const operationalVersion = document.versions.find((v: any) => v.versionNumber === operationalVersionNumber);
    const matchedVersion = matchedVersionHint || operationalVersion?.versionNumber || document.versions[0]?.versionNumber || 1;

    return {
      exists: true,
      document: {
        id: document.id,
        name: document.name,
        owner: document.ownerId,
        ownerUsername: document.owner.username,
        uploadedAt: blockchainDoc?.createdAt || new Date(),
        fileSize: Number(document.size),
        ipfsHash: blockchainInfo?.ipfsHash || '',
        currentVersion: operationalVersion?.versionNumber || document.versions.length || 1,
      },
      versions: document.versions.map((v: any) => ({
        versionNumber: v.versionNumber,
        createdAt: v.createdAt || new Date(),
        createdBy: v.user?.username || 'Desconocido',
        comment: v.comment || undefined,
      })),
      matchedVersion,
      contentHashVerified,
      shares: await VerificationService.getSharesForDocument(document.blockchainId),
      signatures: document.signatures.map((sig: any) => ({
        signedBy: sig.userId,
        signedByUsername: sig.user.username,
        walletAddress: sig.signerWallet?.walletAddress || '',
        signedAt: sig.signedAt || new Date(),
        comment: undefined,
        versionNumber: sig.version?.versionNumber || 1,
      })),
      blockchain: blockchainInfo,
    };
  }

  private static async getSharesForDocument(
    blockchainId: string | null | undefined,
  ): Promise<NonNullable<VerificationResult['shares']>> {
    if (!blockchainId) return [];
    try {
      const usersWithRoles = await DocumentPermissionService.getDocumentUsersWithRoles(blockchainId);

      return await Promise.all(
        usersWithRoles.map(async ({ address, role }) => {
          const normalizedAddress = normalizeEthereumAddress(address);
          // Try to find username via wallet address
          const wallet = normalizedAddress ? await prisma.wallet.findFirst({
            where: { walletAddress: normalizedAddress },
            include: { user: { select: { username: true } } },
          }) : null;

          return {
            sharedWith: address,
            sharedWithUsername: wallet?.user.username,
            role: DocumentRole[role] ?? String(role),
            sharedAt: new Date(0), // Timestamp not available from blockchain
          };
        }),
      );
    } catch {
      return [];
    }
  }
}
