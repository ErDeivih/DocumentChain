import prisma from '../config/database';

export async function userHasAccess(
  documentId: string,
  userId: string
): Promise<boolean> {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    select: { ownerId: true, blockchainId: true, visibility: true, isDeleted: true },
  });

  if (!document) return false;
  if (document.isDeleted) return false;
  if (document.ownerId === userId) return true;

  if (document.visibility === 'PUBLIC') {
    return true;
  }

  if (document.blockchainId) {
    const permModule = await import('../services/documentPermissionService');
    const DocumentPermissionService = permModule.DocumentPermissionService;
    const wallets = await prisma.wallet.findMany({
      where: { userId },
      select: { walletAddress: true },
    });

    for (const wallet of wallets) {
      if (
        await DocumentPermissionService.canView(
          document.blockchainId,
          wallet.walletAddress
        )
      ) {
        return true;
      }
    }
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
    const permModule = await import('../services/documentPermissionService');
    const DocumentPermissionService = permModule.DocumentPermissionService;
    const DocRole = permModule.DocumentRole;
    const wallets = await prisma.wallet.findMany({
      where: { userId },
      select: { walletAddress: true },
    });

    for (const wallet of wallets) {
      const isOwner = await DocumentPermissionService.isOwner(
        blockchainId,
        wallet.walletAddress
      );
      if (isOwner) return 'OWNER';

      const role = await DocumentPermissionService.getUserRole(
        blockchainId,
        wallet.walletAddress
      );
      if (role === DocRole.EDITOR) return 'SHARED_WRITE';
      if (role === DocRole.VIEWER) return 'SHARED_READ';
    }

    return null;
  }

  if (ownerId === userId) return 'OWNER';
  return null;
}
