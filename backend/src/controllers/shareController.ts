import { Request, Response, NextFunction } from 'express';
import { ShareService } from '../services/shareService';
import { normalizeFileExtensionFilter } from '../utils/fileValidation';
import logger from '../utils/logger';
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
   * El frontend envía La clave simétrica re-cifrada por HTTPS;
   * el backend la recifra para el destinatario y crea el registro PREPARING.
   * Endpoint: POST /api/documents/:documentId/share/prepare
   *
   * @param req - Objeto de solicitud HTTP autenticado con los datos del destinatario y la clave.
   * @param res - Objeto de respuesta HTTP.
   * @returns Promesa que resuelve con el resultado de la preparación del compartido.
   */
  static async prepareShare(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const documentId = req.body.documentId as string || req.params.documentId as string;
      const {
        sharedWithUserId,
        role,
        walletId,
        reEncryptedSymmetricKey,
        sharedToWalletAddress,
      } = req.body;

      // Validar campos requeridos
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

      if (!reEncryptedSymmetricKey) {
        res.status(400).json({ error: 'La clave simétrica re-cifrada es obligatoria' });
        return;
      }

      // Validar rol
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
        reEncryptedSymmetricKey,
        sharedToWalletAddress,
      });

      logger.info('[PREPARE] Share preparado', {
        shareId: result.shareId,
        documentId,
        userId: req.user.userId,
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
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
  static async confirmShare(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const documentId = req.body.documentId as string || req.params.documentId as string;
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
        skipOnChainValidation: req.body.skipOnChainValidation,
      });

      logger.info('[CONFIRM] Share confirmado', {
        shareId,
        txHash,
        userId: req.user.userId,
      });

      res.status(200).json({ share });
    } catch (error) {
      next(error);
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
  static async prepareRevokeShare(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const documentId = req.body.documentId as string || req.params.documentId as string;
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
    } catch (error) {
      next(error);
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
  static async confirmRevokeShare(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const { txHash, shareId } = req.body;

      if (!isValidTxHash(txHash)) {
        res.status(400).json({ error: 'Hash de transacción inválido' });
        return;
      }

      await ShareService.confirmRevokeShare(shareId, txHash, req.body.skipOnChainValidation);

      logger.info('[CONFIRM] Share revocado', {
        shareId,
        txHash,
        userId: req.user.userId,
      });

      res.status(200).json({ message: 'Acceso revocado correctamente' });
    } catch (error) {
      next(error);
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
  static async getDocumentShares(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const documentId = req.body.documentId as string || req.params.documentId as string;

      const shares = await ShareService.getDocumentShares(
        documentId,
        req.user.userId
      );

      res.status(200).json({ shares });
    } catch (error) {
      next(error);
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
  static async getSharedWithMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

       // Parsear parámetros de consulta
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string | undefined;
      const fileType = normalizeFileExtensionFilter(req.query.fileType as string | undefined);
      const sharedBy = req.query.sharedBy as string | undefined;

      const result = await ShareService.getSharedWithMePaginated(req.user.userId, {
        page, limit, search, fileType, sharedBy,
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
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
  static async getMyRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const documentId = req.body.documentId as string || req.params.documentId as string;
      const { document, role } = await ShareService.getMyRole(documentId, req.user.userId);

      if (!document) {
        res.status(404).json({ error: 'Documento no encontrado' });
        return;
      }

      res.status(200).json({ role });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Rollback de una compartición PREPARING tras fallo de transacción blockchain.
   * Endpoint: POST /api/shares/:shareId/rollback-revoke
   */
  static async rollbackRevoke(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { shareId } = req.params;
      if (!shareId) {
        res.status(400).json({ error: 'shareId requerido' });
        return;
      }
      await ShareService.rollbackRevoke(shareId);
      res.status(200).json({ message: 'Rollback completado' });
    } catch (error) {
      next(error);
    }
  }
}
