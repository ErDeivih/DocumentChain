import prisma from '../config/database';
import { BlockchainQueries } from '../lib/blockchain/queries';
import { DocumentPermissionService } from './documentPermissionService';
import logger from '../utils/logger';

export interface UserStats {
  userId: string;
  documentsOwned: number;
  documentsShared: number;
  totalVersions: number;
  totalSignatures: number;
  storageUsed: number; // bytes
}

export interface SystemStats {
  totalUsers: number;
  totalDocuments: number;
  totalVersions: number;
  totalSignatures: number;
  totalStorageUsed: number; // bytes
  activeUsers: number; // users active in last 30 days
}

export interface DocumentStats {
  documentId: string;
  totalVersions: number;
  totalSignatures: number;
  totalShares: number;
  size: number;
}

export class StatsService {
  /**
   * Get statistics for a user
   */
  static async getUserStats(userId: string): Promise<UserStats> {
    const [
      documentsOwned,
      ownedDocs,
      signatures,
      userWallets,
    ] = await Promise.all([
      // Count documents owned
      prisma.document.count({
        where: {
          ownerId: userId
          // ❌ NO filtrar por isDeleted (solo en blockchain)
        }
      }),

      // Get all owned documents for version count and storage
      prisma.document.findMany({
        where: {
          ownerId: userId
        },
        include: {
          versions: true  // ✅ Include para poder contar
        }
      }),

      // Count signatures made by user
      prisma.documentSignature.count({
        where: { userId }
      }),

      // Get user's wallets to query blockchain
      prisma.wallet.findMany({
        where: { userId },
        select: { walletAddress: true },
      }),
    ]);

    // Count documents shared with user via blockchain (user has access but doesn't own)
    let documentsShared = 0;
    try {
      if (userWallets.length > 0) {
        const ownedBlockchainIds = new Set(
          ownedDocs.map(d => d.blockchainId).filter(Boolean) as string[]
        );
        const blockchainDocIds = new Set<string>();
        for (const w of userWallets) {
          const docs = await BlockchainQueries.getUserDocuments(w.walletAddress);
          docs.forEach(id => blockchainDocIds.add(id));
        }
        // Shared = docs on blockchain user can access but doesn't own
        documentsShared = [...blockchainDocIds].filter(id => !ownedBlockchainIds.has(id)).length;
      }
    } catch (err) {
      logger.warn('[StatsService] Could not fetch blockchain docs for user:', err);
    }

    // Calculate total versions and storage
    let totalVersions = 0;
    let storageUsed = 0;

    for (const doc of ownedDocs) {
      totalVersions += doc.versions.length;
      storageUsed += Number(doc.size);
    }

    return {
      userId,
      documentsOwned,
      documentsShared,
      totalVersions,
      totalSignatures: signatures,
      storageUsed
    };
  }

  /**
   * Get system-wide statistics (admin only)
   */
  static async getSystemStats(): Promise<SystemStats> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalUsers,
      totalDocuments,
      totalVersions,
      totalSignatures,
      allDocuments,
      activeUsers
    ] = await Promise.all([
      prisma.user.count(),
      
      prisma.document.count(),  // ❌ NO filtrar por isDeleted
      
      prisma.version.count(),
      
      prisma.documentSignature.count(),
      
      prisma.document.findMany({
        // ❌ NO filtrar por isDeleted
        select: { size: true }
      }),
      
      // Active users count removed - lastLogin field doesn't exist
      Promise.resolve(0)
    ]);

    // Calculate total storage (size is string from BigInt)
    const totalStorageUsed = allDocuments.reduce((sum, doc) => sum + Number(doc.size), 0);

    return {
      totalUsers,
      totalDocuments,
      totalVersions,
      totalSignatures,
      totalStorageUsed,
      activeUsers
    };
  }

  /**
   * Get statistics for a specific document
   */
  static async getDocumentStats(
    documentId: string,
    userId: string
  ): Promise<DocumentStats> {
    // Check access
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        // ❌ NO filtrar por isDeleted (solo en blockchain)
        // COMENTADO: shares ya no existe en DB
        /* OR: [
          { ownerId: userId },
          { shares: { some: { userId } } }
        ] */
        ownerId: userId  // Solo owner puede ver stats por ahora
      },
      include: {
        versions: {
          include: {
            signatures: true  // ✅ Include para contar
          }
        }
        // shares: true  // COMENTADO: documentShare ya no existe
      }
    });

    if (!document) {
      throw new Error('Documento no encontrado o acceso denegado');
    }

    // Count unique shares from blockchain
    let totalShares = 0;
    try {
      if (document.blockchainId) {
        const { DocumentPermissionService } = await import('./documentPermissionService');
        const users = await DocumentPermissionService.getDocumentUsers(document.blockchainId);
        // Exclude the document owner itself
        const ownerWallets = await prisma.wallet.findMany({
          where: { userId: document.ownerId },
          select: { walletAddress: true }
        });
        const ownerAddresses = new Set(ownerWallets.map(w => w.walletAddress.toLowerCase()));
        totalShares = users.filter(addr => !ownerAddresses.has(addr.toLowerCase())).length;
      }
    } catch (err) {
      logger.warn('[StatsService] Could not fetch blockchain users for doc stats:', err);
    }

    // Count total signatures across all versions
    const totalSignatures = document.versions.reduce(
      (sum, version) => sum + version.signatures.length,
      0
    );

    return {
      documentId,
      totalVersions: document.versions.length,
      totalSignatures,
      totalShares,
      size: Number(document.size)
    };
  }

  /**
   * Get top documents by various metrics (admin only)
   */
  static async getTopDocuments(
    metric: 'size' | 'versions' | 'signatures' | 'shares',
    limit: number = 10
  ): Promise<any[]> {
    if (metric === 'size') {
      return prisma.document.findMany({
        // ❌ NO filtrar por isDeleted
        select: {
          id: true,
          name: true,
          size: true,
          owner: {
            select: { username: true }
          }
        },
        orderBy: { size: 'desc' },
        take: limit
      });
    }

    if (metric === 'versions') {
      const documents = await prisma.document.findMany({
        // ❌ NO filtrar por isDeleted
        include: {  // ✅ Cambiar select a include para tener owner
          owner: {
            select: { username: true }
          },
          versions: {
            select: { id: true }
          }
        }
      });

      return documents
        .map(doc => ({
          id: doc.id,
          name: doc.name,
          owner: doc.owner,
          versionCount: doc.versions.length
        }))
        .sort((a, b) => b.versionCount - a.versionCount)
        .slice(0, limit);
    }

    if (metric === 'signatures') {
      const documents = await prisma.document.findMany({
        // ❌ NO filtrar por isDeleted
        include: {  // ✅ Cambiar select a include
          owner: {
            select: { username: true }
          },
          versions: {
            select: {
              signatures: {
                select: { id: true }
              }
            }
          }
        }
      });

      return documents
        .map(doc => ({
          id: doc.id,
          name: doc.name,
          owner: doc.owner,
          signatureCount: doc.versions.reduce(
            (sum, v) => sum + v.signatures.length,
            0
          )
        }))
        .sort((a, b) => b.signatureCount - a.signatureCount)
        .slice(0, limit);
    }

    if (metric === 'shares') {
      const documents = await prisma.document.findMany({
        // ❌ NO filtrar por isDeleted
        include: {  // ✅ Cambiar select a include
          owner: {
            select: { username: true }
          }
          // shares: { select: { userId: true } }  // COMENTADO: documentShare ya no existe
        }
      });

      const docsWithShares = await Promise.all(
        documents.map(async (doc) => {
          let shareCount = 0;
          if (doc.blockchainId) {
            try {
              const users = await DocumentPermissionService.getDocumentUsers(doc.blockchainId);
              shareCount = users.length;
            } catch {
              shareCount = 0;
            }
          }
          return {
            id: doc.id,
            name: doc.name,
            owner: doc.owner,
            shareCount,
          };
        })
      );

      return docsWithShares
        .sort((a, b) => b.shareCount - a.shareCount)
        .slice(0, limit);
    }

    return [];
  }
}
