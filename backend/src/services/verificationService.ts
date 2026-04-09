import { ethers } from 'ethers';
import prisma from '../config/database';
import { getContracts } from '../config/blockchain';
import { FileCrypto } from '../lib/crypto/FileCrypto';
import { BlockchainQueries } from '../lib/blockchain/queries';
import { DocumentPermissionService, DocumentRole } from './documentPermissionService';
import { logBlockchainError } from '../utils/logger';
import { normalizeEthereumAddress } from '../utils/ethereum';

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
    isArchived: boolean;
  };
  versions?: Array<{
    createdAt: Date;
    createdBy?: string;
    comment?: string;
  }>;
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

export class VerificationService {
  /**
   * Verificar si un archivo existe en la blockchain mediante su hash
   */
  static async verifyFileByHash(fileBuffer: Buffer): Promise<VerificationResult> {
    // Calcular el hash del archivo
    const contentHash = FileCrypto.hashFile(fileBuffer);
    
    // Buscar en la base de datos por contentHash
    const document = await prisma.document.findFirst({
      where: { contentHash },
      include: {
        owner: {
          select: {
            username: true,
          },
        },
        versions: {
          include: {
            user: {
              select: {
                username: true,
              },
            },
          }
        },
        // shares comentado: documentShare ya no existe
        // shares: {
        //   include: {
        //     user: {
        //       select: {
        //         username: true,
        //       },
        //     },
        //   },
        // },
        signatures: {
          include: {
            user: {
              select: {
                username: true,
              },
            },
            signerWallet: {
              select: {
                walletAddress: true,
              },
            },
          }
        },
      },
    });

    if (!document) {
      return { exists: false };
    }

    // Obtener información de la blockchain
    let blockchainInfo;
    let blockchainDoc;
    try {
      if (document.blockchainId) {
        blockchainDoc = await BlockchainQueries.getDocument(document.blockchainId);
        const contracts = getContracts();
        const docData = await contracts.documentRegistry.getDocument(document.blockchainId);
        
        blockchainInfo = {
          documentId: document.blockchainId,
          ipfsHash: docData.ipfsHash,
          metadataHash: docData.metadataHash,
          owner: docData.owner,
          isDeleted: docData.isDeleted,
          blockNumber: docData.createdBlock.toNumber(),
          transactionHash: docData.txHash || '',
        };
      }
    } catch (error) {
      logBlockchainError('Fetch blockchain data', error as Error);
    }

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
        isArchived: blockchainDoc?.isArchived || false,
      },
      versions: document.versions.map(v => ({
        createdAt: new Date(),
        createdBy: v.user.username,
        comment: v.comment || undefined,
      })),
      // shares comentado: obtener desde blockchain
      shares: await VerificationService.getSharesForDocument(document.blockchainId),
      signatures: document.signatures.map((sig: any) => ({
        signedBy: sig.userId,
        signedByUsername: sig.user.username,
        walletAddress: sig.signerWallet?.walletAddress || '',
        signedAt: sig.signedAt || new Date(),
        comment: undefined
      })),
      blockchain: blockchainInfo,
    };
  }

  /**
   * Verificar documento por IPFS hash
   * Busca el CID en las versiones de documentos almacenados en DB,
   * y delega al método por blockchainId si se encuentra.
   */
  static async verifyByIPFSHash(ipfsHash: string): Promise<VerificationResult> {
    if (!ipfsHash || typeof ipfsHash !== 'string') {
      return { exists: false };
    }

    // Look up version by ipfsCid stored in DB
    const version = await prisma.version.findFirst({
      where: { ipfsCid: ipfsHash.trim() },
      include: { document: true },
    });

    if (version?.document?.blockchainId) {
      // Delegate to the working blockchain verification
      return VerificationService.verifyByBlockchainId(version.document.blockchainId);
    }

    // Not found in DB — return not exists
    return { exists: false };
  }

  /**
   * Verificar documento por ID de blockchain
   */
  static async verifyByBlockchainId(blockchainId: string): Promise<VerificationResult> {
    const document = await prisma.document.findFirst({
      where: { blockchainId },
      include: {
        owner: {
          select: {
            username: true,
          },
        },
        versions: {
          include: {
            user: {
              select: {
                username: true,
              },
            },
          }
        },
        // shares comentado: documentShare ya no existe
        // shares: {
        //   include: {
        //     user: {
        //       select: {
        //         username: true,
        //       },
        //     },
        //   },
        // },
        signatures: {
          include: {
            user: {
              select: {
                username: true,
              },
            },
            signerWallet: {
              select: {
                walletAddress: true,
              },
            },
          }
        },
      },
    });

    if (!document) {
      // Intentar buscar solo en blockchain
      try {
        const contracts = getContracts();
        const docData = await contracts.documentRegistry.getDocument(blockchainId);
        
        return {
          exists: true,
          blockchain: {
            documentId: blockchainId,
            ipfsHash: docData.ipfsHash,
            metadataHash: docData.metadataHash,
            owner: docData.owner,
            isDeleted: docData.isDeleted,
            blockNumber: docData.createdBlock.toNumber(),
            transactionHash: docData.txHash || '',
          },
        };
      } catch (error) {
        return { exists: false };
      }
    }

    // Obtener información de la blockchain
    let blockchainInfo;
    let blockchainDoc;
    try {
      blockchainDoc = await BlockchainQueries.getDocument(blockchainId);
      const contracts = getContracts();
      const docData = await contracts.documentRegistry.getDocument(blockchainId);
      
      blockchainInfo = {
        documentId: blockchainId,
        ipfsHash: docData.ipfsHash,
        metadataHash: docData.metadataHash,
        owner: docData.owner,
        isDeleted: docData.isDeleted,
        blockNumber: docData.createdBlock.toNumber(),
        transactionHash: docData.txHash || '',
      };
    } catch (error) {
      logBlockchainError('Fetch blockchain data', error as Error);
    }

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
        isArchived: blockchainDoc?.isArchived || false,
      },
      versions: document.versions.map(v => ({
        createdAt: new Date(),
        createdBy: v.user.username,
        comment: v.comment || undefined,
      })),
      // shares comentado: obtener desde blockchain
      shares: await VerificationService.getSharesForDocument(blockchainId),
      signatures: document.signatures.map((sig: any) => ({
        signedBy: sig.userId,
        signedByUsername: sig.user.username,
        walletAddress: sig.signerWallet?.walletAddress || '',
        signedAt: sig.signedAt || new Date(),
        comment: undefined
      })),
      blockchain: blockchainInfo,
    };
  }

  /**
   * Fetch shares for a document from blockchain and enrich with DB usernames.
   * Returns empty array if blockchainId is falsy or blockchain call fails.
   */
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
