import prisma from '../config/database';
import { DocumentPermissionService, DocumentRole } from '../services/documentPermissionService';
import { BlockchainCacheService } from '../services/blockchainCacheService';
import logger from './logger';

/**
 * Verifica si un usuario tiene acceso a un documento, considerando propiedad, visibilidad y permisos blockchain.
 * @param {string} documentId - ID del documento.
 * @param {string} userId - ID del usuario.
 * @returns {Promise<boolean>} True si el usuario tiene acceso, false en caso contrario.
 */
export async function userHasAccess(
  documentId: string,
  userId: string
): Promise<boolean> {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    select: { ownerId: true, blockchainId: true, visibility: true },
  });

  if (!document) return false;
  // isDeleted check via blockchain (RPC failure returns isDeleted=false in demo mode)
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

/**
 * Resuelve el rol de un usuario para un documento consultando los permisos en blockchain.
 * @param {string} documentId - ID del documento.
 * @param {string} ownerId - ID del propietario.
 * @param {string | null} blockchainId - ID blockchain del documento, o null si no esta sincronizado.
 * @param {string} userId - ID del usuario para resolver el rol.
 * @returns {Promise<'OWNER' | 'SHARED_WRITE' | 'SHARED_READ' | null>} El rol resuelto, o null si no tiene acceso.
 */
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
          const role = await DocumentPermissionService.getUserRole(blockchainId, wallet.walletAddress);
          if (role === DocumentRole.OWNER) return 'OWNER' as const;
          if (role === DocumentRole.EDITOR) return 'SHARED_WRITE' as const;
          if (role === DocumentRole.VIEWER) return 'SHARED_READ' as const;
          return null;
        } catch (error) {
          logger.warn(`[accessControl] Role resolution failed: ${error instanceof Error ? error.message : String(error)}`);
          return null;
        }
      })
    );

    const priority = { 'OWNER': 3, 'SHARED_WRITE': 2, 'SHARED_READ': 1 } as const;
    const best = results.reduce((best, r) => {
      if (!r) return best;
      if (!best) return r;
      return (priority[r as keyof typeof priority] || 0) > (priority[best as keyof typeof priority] || 0) ? r : best;
    }, null as typeof results[number]);
    if (best) return best;
    return null;
  }

  if (ownerId === userId) return 'OWNER';
  return null;
}
