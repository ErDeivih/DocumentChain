/**
 * Share Controller - Refactored for Frontend Wallet Signatures
 * 
 * Implements the prepare/confirm pattern:
 * - prepareShare: Creates DB record with PREPARING status
 * - confirmShare: Updates record after blockchain transaction
 * 
 * The backend NO LONGER:
 * - Handles passwords
 * - Signs blockchain transactions (user's wallet does this)
 */

import { Request, Response } from 'express';
import { ShareService } from '../services/shareService';
import { DocumentRole, DocumentPermissionService } from '../services/documentPermissionService';
import logger from '../utils/logger';
import prisma from '../config/database';
import { BlockchainQueries } from '../lib/blockchain/queries';

function normalizeFileExtensionFilter(fileType?: string): string | undefined {
  if (!fileType) {
    return undefined;
  }

  const trimmed = fileType.trim().toLowerCase();
  if (!trimmed) {
    return undefined;
  }

  return trimmed.startsWith('.') ? trimmed : `.${trimmed}`;
}

const VALID_SHARE_ROLES = ['SHARED_READ', 'SHARED_WRITE'] as const;

export class ShareController {
  // ============================================
  // NEW: Prepare/Confirm Pattern Endpoints
  // ============================================

  /**
   * Prepare a share for creation
   * POST /api/documents/:documentId/share/prepare
   * 
    * Frontend sends the decrypted symmetric key over HTTPS.
    * Backend re-encrypts it for the recipient and creates the PREPARING record.
   */
  static async prepareShare(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const documentId = req.params.documentId as string;
      const {
        sharedWithUserId,
        role,
        walletId,
        decryptedSymmetricKey,
        sharedToWalletAddress,
      } = req.body;

      // Validate required fields
      if (!sharedWithUserId) {
        res.status(400).json({ error: 'El ID del usuario destinatario es obligatorio' });
        return;
      }

      if (!role) {
        res.status(400).json({ error: 'El rol es obligatorio' });
        return;
      }

      if (!walletId) {
        res.status(400).json({ error: 'El ID de la wallet es obligatorio' });
        return;
      }

      if (!decryptedSymmetricKey) {
        res.status(400).json({ error: 'La clave simétrica descifrada es obligatoria' });
        return;
      }

      // Validate role
      if (!VALID_SHARE_ROLES.includes(role)) {
        res.status(400).json({ error: 'Rol inválido' });
        return;
      }

      const result = await ShareService.prepareShare({
        documentId,
        sharedWithUserId,
        role,
        sharerUserId: req.user.userId,
        sharerWalletId: walletId,
        decryptedSymmetricKey,
        sharedToWalletAddress,
      });

      logger.info('[PREPARE] Share preparado', {
        shareId: result.shareId,
        documentId,
        userId: req.user.userId,
      });

      res.status(200).json(result);
    } catch (error: any) {
      logger.error('[PREPARE] Error al preparar share', {
        error: error.message,
        userId: req.user?.userId,
      });
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Confirm a share after blockchain transaction
   * POST /api/documents/:documentId/share/confirm
   * 
   * Frontend calls this after signing and submitting the blockchain transaction.
   */
  static async confirmShare(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const documentId = req.params.documentId as string;
      const { shareId, txHash } = req.body;

      if (!shareId) {
        res.status(400).json({ error: 'El ID del share es obligatorio' });
        return;
      }

      if (!txHash) {
        res.status(400).json({ error: 'El hash de la transacción es obligatorio' });
        return;
      }

      const share = await ShareService.confirmShare({
        shareId,
        txHash,
      });

      logger.info('[CONFIRM] Share confirmado', {
        shareId,
        txHash,
        userId: req.user.userId,
      });

      res.status(200).json({ share });
    } catch (error: any) {
      logger.error('[CONFIRM] Error al confirmar share', {
        error: error.message,
        userId: req.user?.userId,
      });
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Prepare share revocation
   * POST /api/documents/:documentId/share/:userId/revoke/prepare
   */
  static async prepareRevokeShare(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const documentId = req.params.documentId as string;
      const userId = req.params.userId as string;
      const { sharerWalletId } = req.body;

      if (!sharerWalletId) {
        res.status(400).json({ error: 'El ID de la wallet es obligatorio' });
        return;
      }

      const result = await ShareService.prepareRevokeShare(
        documentId,
        userId,
        req.user.userId,
        sharerWalletId
      );

      logger.info('[PREPARE] Revocación de share preparada', {
        shareId: result.shareId,
        documentId,
        userId: req.user.userId,
      });

      res.status(200).json(result);
    } catch (error: any) {
      logger.error('[PREPARE] Error al preparar revocación', {
        error: error.message,
        userId: req.user?.userId,
      });
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Confirm share revocation
   * POST /api/documents/:documentId/share/:userId/revoke/confirm
   */
  static async confirmRevokeShare(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const documentId = req.params.documentId as string;
      const userId = req.params.userId as string;
      const { txHash, shareId } = req.body;

      if (!txHash) {
        res.status(400).json({ error: 'El hash de la transacción es obligatorio' });
        return;
      }

      await ShareService.confirmRevokeShare(shareId || `${documentId}-${userId}`, txHash);

      logger.info('[CONFIRM] Share revocado', {
        shareId,
        txHash,
        userId: req.user.userId,
      });

      res.status(200).json({ message: 'Acceso revocado correctamente' });
    } catch (error: any) {
      logger.error('[CONFIRM] Error al confirmar revocación', {
        error: error.message,
        userId: req.user?.userId,
      });
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Get document shares
   * GET /api/documents/:documentId/shares
   */
  static async getDocumentShares(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const documentId = req.params.documentId as string;

      const shares = await ShareService.getDocumentShares(
        documentId,
        req.user.userId
      );

      res.status(200).json({ shares });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Get documents shared with current user
   * GET /api/shares/with-me?page=1&limit=50&search=...&fileType=...
   */
  static async getSharedWithMe(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      // Parse query parameters
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string | undefined;
      const fileType = normalizeFileExtensionFilter(req.query.fileType as string | undefined);
      const walletId = req.query.walletId as string | undefined;

      const confirmedShares = await ShareService.getSharedWithUser(req.user.userId);
      const confirmedDocumentIds = new Set(
        confirmedShares
          .map((share) => share.documentId)
          .filter((documentId): documentId is string => Boolean(documentId))
      );

      // Get user's wallet (specific or primary)
      const wallet = walletId
        ? await prisma.wallet.findUnique({
            where: {
              id: walletId,
              userId: req.user.userId, // Ensure wallet belongs to user
            },
          })
        : await prisma.wallet.findFirst({
            where: {
              userId: req.user.userId,
              isPrimary: true,
            },
          });

      if (!wallet && confirmedDocumentIds.size === 0) {
        res.status(404).json({ error: 'Wallet no encontrada' });
        return;
      }

      const whereClause: any = {
        ownerId: { not: req.user.userId }, // Only shared documents, not owned
        blockchainId: {
          not: null,
        },
      };

      // Apply filters
      if (search) {
        whereClause.name = {
          contains: search,
          mode: 'insensitive',
        };
      }

      if (fileType) {
        whereClause.fileExtension = fileType;
      }

      const candidateDocuments = await prisma.document.findMany({
        where: whereClause,
        include: {
          owner: {
            select: {
              username: true,
              fullName: true,
              email: true,
            },
          },
          folder: true,
        },
        orderBy: {
          id: 'desc',
        },
      });

      const sharedDocuments: typeof candidateDocuments = [];

      for (const document of candidateDocuments) {
        if (confirmedDocumentIds.has(document.id)) {
          sharedDocuments.push(document);
          continue;
        }

        if (!wallet || !document.blockchainId) {
          continue;
        }

        const canView = await DocumentPermissionService.canView(document.blockchainId, wallet.walletAddress);
        if (canView) {
          sharedDocuments.push(document);
        }
      }

      const total = sharedDocuments.length;
      const documents = sharedDocuments.slice((page - 1) * limit, page * limit);

      const totalPages = Math.ceil(total / limit);

      res.status(200).json({
        documents,
        total,
        page,
        totalPages,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Get user's role for a document
   * GET /api/documents/:documentId/my-role
   */
  static async getMyRole(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const documentId = req.params.documentId as string;
      const document = await prisma.document.findUnique({
        where: { id: documentId },
        select: {
          id: true,
          ownerId: true,
          blockchainId: true,
        },
      });

      if (!document) {
        res.status(404).json({ error: 'Documento no encontrado' });
        return;
      }

      if (document.ownerId === req.user.userId) {
        res.status(200).json({ role: 'OWNER' });
        return;
      }

      const wallet = await prisma.wallet.findFirst({
        where: { userId: req.user.userId, isPrimary: true },
      }) ?? await prisma.wallet.findFirst({ where: { userId: req.user.userId } });

      if (!wallet || !document.blockchainId) {
        res.status(200).json({ role: null });
        return;
      }

      const role = await DocumentPermissionService.getUserRole(document.blockchainId, wallet.walletAddress);

      if (role === DocumentRole.EDITOR) {
        res.status(200).json({ role: 'SHARED_WRITE' });
        return;
      }

      if (role === DocumentRole.VIEWER) {
        res.status(200).json({ role: 'SHARED_READ' });
        return;
      }

      res.status(200).json({ role: null });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Check permissions
   * GET /api/documents/:documentId/permissions/check?role=OWNER
   */
  static async checkPermission(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const documentId = req.params.documentId as string;
      const { role } = req.query;

      const document = await prisma.document.findUnique({
        where: { id: documentId },
        select: {
          ownerId: true,
          blockchainId: true,
        },
      });

      if (!document) {
        res.status(404).json({ error: 'Documento no encontrado' });
        return;
      }

      if (!role || typeof role !== 'string') {
        res.status(400).json({ error: 'Se requiere el rol' });
        return;
      }

      const requestedRole = role === 'SHARED_WRITE'
        ? DocumentRole.EDITOR
        : role === 'SHARED_READ'
          ? DocumentRole.VIEWER
          : role === 'OWNER'
            ? DocumentRole.OWNER
            : null;

      if (requestedRole === null) {
        res.status(400).json({ error: 'Rol inválido' });
        return;
      }

      if (document.ownerId === req.user.userId) {
        res.status(200).json({ hasPermission: true });
        return;
      }

      const wallet = await prisma.wallet.findFirst({
        where: { userId: req.user.userId, isPrimary: true },
      }) ?? await prisma.wallet.findFirst({ where: { userId: req.user.userId } });

      if (!wallet || !document.blockchainId) {
        res.status(200).json({ hasPermission: false });
        return;
      }

      const userRole = await DocumentPermissionService.getUserRole(document.blockchainId, wallet.walletAddress);
      const hasPermission = userRole >= requestedRole && userRole !== DocumentRole.NONE;

      res.status(200).json({ hasPermission });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
