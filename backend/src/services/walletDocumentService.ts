/**
 * Wallet Document Service
 * 
 * Provides methods to query documents organized by wallet.
 * This is a read-only service for aggregating wallet activity.
 */

import prisma from '../config/database';
import { DocumentPermissionService } from './documentPermissionService';

// ============================================
// Types
// ============================================

/**
 * Actividad agregada de una wallet.
 * @property created - Documentos creados
 * @property shared - Documentos compartidos
 * @property signed - Documentos firmados
 * @property versions - Versiones creadas
 */
export interface WalletActivity {
  created: any[];
  shared: any[];
  signed: any[];
  versions: any[];
}

/**
 * Servicio de consulta de documentos organizados por wallet.
 * Proporciona agregaciones de actividad y resúmenes de uso por dirección.
 */
export class WalletDocumentService {
  /**
   * Obtener documentos creados con una wallet específica.
   * @param userId - ID del usuario propietario
   * @param walletId - ID de la wallet
   * @returns Lista de documentos creados por esa wallet
   */
  static async getDocumentsByWallet(userId: string, walletId: string): Promise<any[]> {
    // Verify wallet belongs to user
    const wallet = await prisma.wallet.findFirst({
      where: { id: walletId, userId },
    });

    if (!wallet) {
      throw new Error('Wallet no encontrada');
    }

    const documents = await prisma.document.findMany({
      where: {
        creatorWalletId: walletId,
      },
      orderBy: {
        id: 'desc',
      },
    });

    return documents.map(d => ({
      id: d.id,
      blockchainId: d.blockchainId,
      name: d.name,
      mimeType: d.mimeType,
      size: d.size,
      blockchainStatus: d.blockchainStatus,
    }));
  }

  /**
   * Obtener documentos compartidos con una dirección de wallet.
   * @param walletAddress - Dirección Ethereum
   * @returns Lista de documentos compartidos (excluyendo propiedad)
   */
  static async getSharedToWallet(walletAddress: string): Promise<any[]> {
    // Find wallet by address
    const wallet = await prisma.wallet.findFirst({
      where: { walletAddress },
    });

    if (!wallet) {
      return [];
    }

    // Get blockchain document IDs shared with this wallet
    const blockchainIds = await DocumentPermissionService.getUserDocuments(walletAddress);

    if (blockchainIds.length === 0) {
      return [];
    }

    const documents = await prisma.document.findMany({
      where: {
        blockchainId: { in: blockchainIds },
      },
      orderBy: { id: 'desc' },
    });

    // Filter out documents owned on-chain (or by DB fallback)
    const filteredDocuments = [];
    for (const doc of documents) {
      if (doc.blockchainId) {
        const isOwner = await DocumentPermissionService.isOwner(doc.blockchainId, wallet.walletAddress);
        if (!isOwner) {
          filteredDocuments.push(doc);
        }
      } else {
        // Fallback: exclude by DB ownerId
        if (doc.ownerId !== wallet.userId) {
          filteredDocuments.push(doc);
        }
      }
    }

    return filteredDocuments.map(d => ({
      id: d.id,
      blockchainId: d.blockchainId,
      name: d.name,
      mimeType: d.mimeType,
      size: d.size,
      blockchainStatus: d.blockchainStatus,
    }));
  }

  /**
   * Obtener documentos firmados con una wallet específica.
   * @param userId - ID del usuario propietario
   * @param walletId - ID de la wallet
   * @returns Lista de documentos firmados
   */
  static async getSignedByWallet(userId: string, walletId: string): Promise<any[]> {
    // Verify wallet belongs to user
    const wallet = await prisma.wallet.findFirst({
      where: { id: walletId, userId },
    });

    if (!wallet) {
      throw new Error('Wallet no encontrada');
    }

    const signatures = await prisma.documentSignature.findMany({
      where: {
        signerWalletId: walletId,
      },
      include: {
        document: true,
      },
      orderBy: {
        id: 'desc',
      },
    });

    return signatures.map(s => ({
      id: s.document.id,
      name: s.document.name,
      mimeType: s.document.mimeType,
      size: s.document.size,
      blockchainStatus: s.blockchainStatus,
    }));
  }

  /**
   * Obtener la actividad completa de una wallet.
   * @param walletId - ID de la wallet
   * @returns Actividad agregada (creados, compartidos, firmados, versiones)
   */
  static async getWalletActivity(walletId: string): Promise<WalletActivity> {
    const wallet = await prisma.wallet.findUnique({
      where: { id: walletId },
    });

    if (!wallet) {
      throw new Error('Wallet no encontrada');
    }

    // Get created documents
    const created = await prisma.document.findMany({
      where: { creatorWalletId: walletId },
      orderBy: { id: 'desc' },
      take: 50,
    });

    // Get shared documents using DocumentPermissionService
    const sharedBlockchainIds = await DocumentPermissionService.getUserDocuments(wallet.walletAddress);
    const sharedDocs = sharedBlockchainIds.length > 0
      ? await prisma.document.findMany({
          where: {
            blockchainId: { in: sharedBlockchainIds },
            NOT: { creatorWalletId: walletId },
          },
          select: { id: true, name: true, mimeType: true },
          take: 50,
        })
      : [];
    const shared = sharedDocs.map(d => ({ id: d.id, documentName: d.name, mimeType: d.mimeType }));

    // Get signed documents
    const signed = await prisma.documentSignature.findMany({
      where: { signerWalletId: walletId },
      include: {
        document: {
          select: {
            id: true,
            name: true,
            mimeType: true,
          },
        },
      },
      orderBy: { id: 'desc' },
      take: 50,
    });

    // Get versions - Note: Version model doesn't have creatorWalletId in schema
    // We'll return empty for now
    const versions: any[] = [];

    return {
      created: created.map(d => ({
        id: d.id,
        name: d.name,
        blockchainStatus: d.blockchainStatus,
      })),
      shared: shared.map(s => ({
        id: s.id,
        documentId: s.id,
        documentName: s.documentName,
        role: null,
      })),
      signed: signed.map(s => ({
        id: s.id,
        documentId: s.documentId,
        documentName: s.document.name,
      })),
      versions: versions.map(v => ({
        id: v.id,
        documentId: v.documentId,
        documentName: v.documentName,
        comment: v.comment,
      })),
    };
  }

  /**
   * Obtener todos los documentos agrupados por wallet de un usuario.
   * @param userId - ID del usuario
   * @returns Mapa de wallet a documentos y total
   */
  static async getAllUserDocuments(userId: string): Promise<{
    byWallet: Map<string, any[]>;
    total: number;
  }> {
    // Get all user's wallets
    const wallets = await prisma.wallet.findMany({
      where: { userId },
    });

    const byWallet = new Map<string, any[]>();
    let total = 0;

    for (const wallet of wallets) {
      const docs = await prisma.document.findMany({
        where: { creatorWalletId: wallet.id },
        orderBy: { id: 'desc' },
      });

      byWallet.set(wallet.id, docs.map(d => ({
        id: d.id,
        name: d.name,
        blockchainStatus: d.blockchainStatus,
        walletAddress: wallet.walletAddress,
        walletLabel: wallet.nickname,
      })));

      total += docs.length;
    }

    return { byWallet, total };
  }

  /**
   * Obtener un resumen de wallets para el dashboard.
   * @param userId - ID del usuario
   * @returns Resumen con conteos de documentos, firmas y versiones por wallet
   */
  static async getWalletSummary(userId: string): Promise<{
    wallets: Array<{
      id: string;
      address: string;
      label: string | null;
      isPrimary: boolean;
      documentCount: number;
      signatureCount: number;
      versionCount: number;
    }>;
    totalDocuments: number;
    totalSignatures: number;
    totalVersions: number;
  }> {
    const wallets = await prisma.wallet.findMany({
      where: { userId },
    });

    const walletSummaries = await Promise.all(
      wallets.map(async (wallet) => {
        const [documentCount, signatureCount, versionCount] = await Promise.all([
          prisma.document.count({
            where: { creatorWalletId: wallet.id },
          }),
          prisma.documentSignature.count({
            where: { signerWalletId: wallet.id },
          }),
          // Version doesn't have creatorWalletId, return 0
          Promise.resolve(0),
        ]);

        return {
          id: wallet.id,
          address: wallet.walletAddress,
          label: wallet.nickname,
          isPrimary: wallet.isPrimary,
          documentCount,
          signatureCount,
          versionCount,
        };
      })
    );

    const totalDocuments = walletSummaries.reduce((sum, w) => sum + w.documentCount, 0);
    const totalSignatures = walletSummaries.reduce((sum, w) => sum + w.signatureCount, 0);
    const totalVersions = walletSummaries.reduce((sum, w) => sum + w.versionCount, 0);

    return {
      wallets: walletSummaries,
      totalDocuments,
      totalSignatures,
      totalVersions,
    };
  }
}

export default WalletDocumentService;
