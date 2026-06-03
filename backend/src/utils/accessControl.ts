import prisma from '../config/database';
import { DocumentPermissionService, DocumentRole } from '../services/documentPermissionService';

export async function userHasAccess(documentId: string, userId: string): Promise<boolean> {
  const document = await prisma.document.findUnique({ where: { id: documentId }, select: { ownerId: true, blockchainId: true, visibility: true, isDeleted: true } });
  if (!document || document.isDeleted) return false;
  if (document.ownerId === userId || document.visibility === 'PUBLIC') return true;
  if (document.blockchainId) {
    const wallets = await prisma.wallet.findMany({ where: { userId }, select: { walletAddress: true } });
    const results = await Promise.all(wallets.map(w => DocumentPermissionService.canView(document.blockchainId!, w.walletAddress).catch(() => false)));
    return results.some(Boolean);
  }
  return false;
}

export async function resolveUserRole(documentId: string, ownerId: string, blockchainId: string | null, userId: string): Promise<'OWNER' | 'SHARED_WRITE' | 'SHARED_READ' | null> {
  if (blockchainId) {
    const wallets = await prisma.wallet.findMany({ where: { userId }, select: { walletAddress: true } });
    const results = await Promise.all(wallets.map(async (wallet) => {
      try {
        if (await DocumentPermissionService.isOwner(blockchainId, wallet.walletAddress)) return 'OWNER' as const;
        const role = await DocumentPermissionService.getUserRole(blockchainId, wallet.walletAddress);
        if (role === DocumentRole.EDITOR) return 'SHARED_WRITE' as const;
        if (role === DocumentRole.VIEWER) return 'SHARED_READ' as const;
        return null;
      } catch { return null; }
    }));
    return results.find(r => r !== null) || null;
  }
  return ownerId === userId ? 'OWNER' : null;
}
