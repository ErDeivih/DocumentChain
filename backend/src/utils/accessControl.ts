import prisma from '../config/database';
import { DocumentPermissionService, DocumentRole } from '../services/documentPermissionService';
import { BlockchainCacheService } from '../services/blockchainCacheService';

export async function userHasAccess(
  documentId: string,
  userId: string
): Promise<boolean> {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    select: { ownerId: true, blockchainId: true, visibility: true },
  });

  if (!document) return false;
  if (document.blockchainId && await BlockchainCacheService.isDocumentDeleted(document.blockchainId)) return false;
  if (document.ownerId === userId) return true;

  if (document.visibility === 'PUBLIC') {
    return true;
  }

  if (document.blockchainId) {
    const wallets = await prisma.wallet.findMany({
      where: { userId },
      select: { walletAddress: true },
    });

    const results = await Promise.all(
      wallets.map((wallet) =>
        DocumentPermissionService.canView(document.blockchainId!, wallet.walletAddress).catch(() => false)
      )
    );

    return results.some(Boolean);
  }

  return false;
}

export async function resolveUserRole(
  documentId: string,
  ownerId: string,
  blockchainId: string | null,
  userId: string
): Promise<'OWNER' | 'SHARED_WRITE' | 'SHARED_READ' | null> {
  if (blockchainId) {
    const wallets = await prisma.wallet.findMany({
      where: { userId },
      select: { walletAddress: true },
    });

    const results = await Promise.all(
      wallets.map(async (wallet) => {
        try {
          const isOwner = await DocumentPermissionService.isOwner(blockchainId, wallet.walletAddress);
          if (isOwner) return 'OWNER' as const;

          const role = await DocumentPermissionService.getUserRole(blockchainId, wallet.walletAddress);
          if (role === DocumentRole.EDITOR) return 'SHARED_WRITE' as const;
          if (role === DocumentRole.VIEWER) return 'SHARED_READ' as const;
          return null;
        } catch {
          return null;
        }
      })
    );

    const found = results.find((r) => r !== null);
    if (found) return found;
    return null;
  }

  if (ownerId === userId) return 'OWNER';
  return null;
}
