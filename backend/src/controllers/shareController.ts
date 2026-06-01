import { Request, Response } from 'express';
import { ShareService } from '../services/shareService';
import { normalizeFileExtensionFilter } from '../utils/fileValidation';
import { DocumentRole, DocumentPermissionService } from '../services/documentPermissionService';
import logger from '../utils/logger';
import prisma from '../config/database';
import { isNonEmptyString, isValidTxHash } from '../utils/validation';

const VALID_SHARE_ROLES = ['SHARED_READ', 'SHARED_WRITE'] as const;

/**
 * Controlador de compartidos.
 * Gestiona la preparación, confirmación, revocación y consulta de permisos
 * de acceso compartido sobre documentos entre usuarios.
 */
export class ShareController {
  // ============================================
  // Endpoints del patrón Preparar/Confirmar
  // ============================================

  /**
   * Prepara un compartido para su creación.
   * El frontend envía la clave simétrica descifrada por HTTPS;
   * el backend la recifra para el destinatario y crea el registro PREPARING.
   * Endpoint: POST /api/documents/:documentId/share/prepare
   *
   * @param req - Objeto de solicitud HTTP autenticado con los datos del destinatario y la clave.
   * @param res - Objeto de respuesta HTTP.
   * @returns Promesa que resuelve con el resultado de la preparación del compartido.
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
   * Confirma un compartido tras la transacción en blockchain.
   * Endpoint: POST /api/documents/:documentId/share/confirm
   *
   * @param req - Objeto de solicitud HTTP autenticado con { shareId, txHash }.
   * @param res - Objeto de respuesta HTTP.
   * @returns Promesa que resuelve con el compartido confirmado.
   */
  static async confirmShare(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const documentId = req.params.documentId as string;
      const { shareId, txHash } = req.body;

      if (!isNonEmptyString(shareId)) {
        res.status(400).json({ error: 'El ID del share es obligatorio' });
        return;
      }

      if (!isValidTxHash(txHash)) {
        res.status(400).json({ error: 'Hash de transacción inválido' });
        return;
      }

      const share = await ShareService.confirmShare({
        shareId,
        txHash,
        documentId,
        recipientId: req.body.recipientId,
        role: req.body.role,
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
   * Prepara la revocación de un compartido (fase de preparación).
   * Endpoint: POST /api/documents/:documentId/share/:userId/revoke/prepare
   *
   * @param req - Objeto de solicitud HTTP autenticado con { sharerWalletId }.
   * @param res - Objeto de respuesta HTTP.
   * @returns Promesa que resuelve con los datos necesarios para la transacción en blockchain.
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
   * Confirma la revocación de un compartido tras la transacción en blockchain.
   * Endpoint: POST /api/documents/:documentId/share/:userId/revoke/confirm
   *
   * @param req - Objeto de solicitud HTTP autenticado con { txHash, shareId }.
   * @param res - Objeto de respuesta HTTP.
   * @returns Promesa que resuelve con la confirmación de revocación.
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

      if (!isValidTxHash(txHash)) {
        res.status(400).json({ error: 'Hash de transacción inválido' });
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
   * Obtiene la lista de compartidos de un documento específico.
   * Endpoint: GET /api/documents/:documentId/shares
   *
   * @param req - Objeto de solicitud HTTP autenticado. Los parámetros deben incluir el ID del documento.
   * @param res - Objeto de respuesta HTTP.
   * @returns Promesa que resuelve con la lista de compartidos.
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
      if (error.message?.includes('no encontrado')) {
        res.status(404).json({ error: error.message });
        return;
      }
      if (error.message?.includes('acceso denegado')) {
        res.status(403).json({ error: error.message });
        return;
      }
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Obtiene los documentos que han sido compartidos con el usuario autenticado.
   * Endpoint: GET /api/shares/with-me
   *
   * @param req - Objeto de solicitud HTTP autenticado con filtros de paginación y búsqueda.
   * @param res - Objeto de respuesta HTTP.
   * @returns Promesa que resuelve con los documentos compartidos paginados.
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
      const sharedBy = req.query.sharedBy as string | undefined;

      // 1. Get all user wallets
      const wallets = await prisma.wallet.findMany({
        where: { userId: req.user.userId },
      });

      if (wallets.length === 0) {
        res.status(200).json({
          documents: [],
          total: 0,
          page,
          totalPages: 0,
        });
        return;
      }

      // 2. For each wallet, get all accessible blockchainIds on-chain
      const blockchainIdSets = await Promise.all(
        wallets.map((wallet) => DocumentPermissionService.getUserDocuments(wallet.walletAddress))
      );
      const allBlockchainIds = Array.from(new Set(blockchainIdSets.flat()));

      if (allBlockchainIds.length === 0) {
        res.status(200).json({
          documents: [],
          total: 0,
          page,
          totalPages: 0,
        });
        return;
      }

      // 3. Find documents in PostgreSQL by blockchainIds
      const whereClause: any = {
        blockchainId: { in: allBlockchainIds },
      };

      if (search) {
        whereClause.name = {
          contains: search,
          mode: 'insensitive',
        };
      }

      if (fileType) {
        whereClause.fileExtension = fileType;
      }

      if (sharedBy) {
        whereClause.owner = {
          username: sharedBy,
        };
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

      // 4. Exclude documents owned by the user (verify on-chain with isOwner)
      const sharedDocuments: typeof candidateDocuments = [];

      for (const document of candidateDocuments) {
        if (!document.blockchainId) {
          continue;
        }

        let isOwned = false;
        for (const wallet of wallets) {
          if (await DocumentPermissionService.isOwner(document.blockchainId, wallet.walletAddress)) {
            isOwned = true;
            break;
          }
        }

        if (!isOwned) {
          sharedDocuments.push(document);
        }
      }

      // 5. Apply pagination
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
   * Obtiene el rol del usuario autenticado sobre un documento específico.
   * Endpoint: GET /api/documents/:documentId/my-role
   *
   * @param req - Objeto de solicitud HTTP autenticado. Los parámetros deben incluir el ID del documento.
   * @param res - Objeto de respuesta HTTP.
   * @returns Promesa que resuelve con el rol del usuario (OWNER, SHARED_WRITE, SHARED_READ o null).
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

      const wallet = await prisma.wallet.findFirst({
        where: { userId: req.user.userId, isPrimary: true },
      }) ?? await prisma.wallet.findFirst({ where: { userId: req.user.userId } });

      if (document.blockchainId && wallet) {
        const isOwnerOnChain = await DocumentPermissionService.isOwner(document.blockchainId, wallet.walletAddress);
        if (isOwnerOnChain) {
          res.status(200).json({ role: 'OWNER' });
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
        return;
      }

      // Fallback for documents without blockchainId
      if (document.ownerId === req.user.userId) {
        res.status(200).json({ role: 'OWNER' });
        return;
      }

      res.status(200).json({ role: null });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Verifica si el usuario tiene un permiso específico sobre un documento.
   * Endpoint: GET /api/documents/:documentId/permissions/check
   *
   * @param req - Objeto de solicitud HTTP autenticado con el rol a verificar en la query string.
   * @param res - Objeto de respuesta HTTP.
   * @returns Promesa que resuelve con un indicador booleano de permiso.
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

      const wallet = await prisma.wallet.findFirst({
        where: { userId: req.user.userId, isPrimary: true },
      }) ?? await prisma.wallet.findFirst({ where: { userId: req.user.userId } });

      if (document.blockchainId && wallet) {
        const isOwnerOnChain = await DocumentPermissionService.isOwner(document.blockchainId, wallet.walletAddress);
        if (isOwnerOnChain) {
          res.status(200).json({ hasPermission: true });
          return;
        }

        const userRole = await DocumentPermissionService.getUserRole(document.blockchainId, wallet.walletAddress);
        const hasPermission = userRole >= requestedRole && userRole !== DocumentRole.NONE;

        res.status(200).json({ hasPermission });
        return;
      }

      // Fallback for documents without blockchainId
      if (document.ownerId === req.user.userId) {
        res.status(200).json({ hasPermission: true });
        return;
      }

      res.status(200).json({ hasPermission: false });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
