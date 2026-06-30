import { Request, Response, NextFunction } from 'express';
import { AuditService } from '../services/auditService';
import logger from '../utils/logger';

/**
 * Controlador de auditoría blockchain. Consulta transacciones, verifica integridad y propiedad de documentos.
 */
export class AuditController {
  /**
   * Obtiene la traza de auditoría completa de un documento por blockchainId.
   * Endpoint: GET /api/audit/trail/:blockchainId
   * @param {Request} req - Solicitud HTTP
   * @param {Response} res - Respuesta HTTP
   * @returns {Promise<void>}
   */
  static async getAuditTrail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { blockchainId } = req.params;

      if (typeof blockchainId !== 'string' || blockchainId.length !== 66 || !blockchainId.startsWith('0x')) {
        res.status(400).json({
          error: 'Formato de blockchainId inválido. Se esperaba una cadena hexadecimal de 32 bytes con prefijo 0x.',
        });
        return;
      }

      logger.info(`[PUBLIC] Audit trail requested for: ${blockchainId}`);

      const auditTrail = await AuditService.getFileAuditTrail(blockchainId);

      res.json({
        success: true,
        blockchainId,
        totalEvents: auditTrail.length,
        events: auditTrail,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verifica la integridad de un archivo comparando hash off-chain y on-chain.
   * Endpoint: GET /api/audit/verify/:fileId
   * @param {Request} req - Solicitud HTTP
   * @param {Response} res - Respuesta HTTP
   * @returns {Promise<void>}
   */
  static async verifyIntegrity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { fileId } = req.params;

      if (typeof fileId !== 'string' || !fileId) {
        res.status(400).json({ error: 'El fileId es obligatorio' });
        return;
      }

      logger.info(`[PUBLIC] Integrity check requested for: ${fileId}`);

      const integrityCheck = await AuditService.verifyFileIntegrity(fileId);

      res.json({
        success: true,
        integrity: integrityCheck,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verifica si una wallet es dueña de un documento en blockchain.
   * Endpoint: GET /api/audit/ownership/:blockchainId/:walletAddress
   * @param {Request} req - Solicitud HTTP
   * @param {Response} res - Respuesta HTTP
   * @returns {Promise<void>}
   */
  static async verifyOwnership(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { blockchainId, walletAddress } = req.params;

      if (typeof blockchainId !== 'string' || blockchainId.length !== 66 || !blockchainId.startsWith('0x')) {
        res.status(400).json({
          error: 'Formato de blockchainId inválido. Se esperaba una cadena hexadecimal de 32 bytes con prefijo 0x.',
        });
        return;
      }

      if (typeof walletAddress !== 'string' || walletAddress.length !== 42 || !walletAddress.startsWith('0x')) {
        res.status(400).json({
          error: 'Formato de walletAddress inválido. Se esperaba una cadena hexadecimal de 20 bytes con prefijo 0x.',
        });
        return;
      }

      logger.info(`[PUBLIC] Ownership verification requested: ${walletAddress} -> ${blockchainId}`);

      const ownershipProof = await AuditService.verifyOwnership(blockchainId, walletAddress);

      res.json({
        success: true,
        ownership: ownershipProof,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtiene los metadatos públicos de un documento desde blockchain.
   * Endpoint: GET /api/audit/metadata/:blockchainId
   * @param {Request} req - Solicitud HTTP
   * @param {Response} res - Respuesta HTTP
   * @returns {Promise<void>}
   */
  static async getPublicMetadata(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { blockchainId } = req.params;

      if (typeof blockchainId !== 'string' || blockchainId.length !== 66 || !blockchainId.startsWith('0x')) {
        res.status(400).json({
          error: 'Formato de blockchainId inválido. Se esperaba una cadena hexadecimal de 32 bytes con prefijo 0x.',
        });
        return;
      }

      logger.info(`[PUBLIC] Public metadata requested for: ${blockchainId}`);

      const metadata = await AuditService.getPublicMetadata(blockchainId);

      res.json({
        success: true,
        metadata,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtiene detalles de una transacción blockchain específica.
   * Endpoint: GET /api/audit/transaction/:txHash
   * @param {Request} req - Solicitud HTTP
   * @param {Response} res - Respuesta HTTP
   * @returns {Promise<void>}
   */
  static async getTransactionDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { txHash } = req.params;

      if (typeof txHash !== 'string' || !txHash.startsWith('0x') || txHash.length !== 66) {
        res.status(400).json({
          error: 'Formato de txHash inválido. Se esperaba una cadena hexadecimal de 32 bytes con prefijo 0x.',
        });
        return;
      }

      logger.info(`[PUBLIC] Transaction details requested for: ${txHash}`);

      const details = await AuditService.getTransactionDetails(txHash);

      res.json({
        success: true,
        ...details,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Consulta eventos blockchain con filtros avanzados.
   * Endpoint: GET /api/audit/events
   * @param {Request} req - Solicitud HTTP
   * @param {Response} res - Respuesta HTTP
   * @returns {Promise<void>}
   */
  static async queryBlockchainEvents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        eventTypes,
        userId,
        walletAddress,
        documentId,
        txHash,
        fromBlock,
        toBlock,
        startDate,
        endDate,
        limit,
        offset,
      } = req.query;

      logger.info('[PUBLIC] Blockchain events query requested', {
        eventTypes,
        userId,
        walletAddress,
        documentId,
        limit: limit || 50,
      });

      const filters: any = {};

      if (eventTypes && typeof eventTypes === 'string') {
        filters.eventTypes = eventTypes.split(',').map(t => t.trim());
      }

      if (userId && typeof userId === 'string') {
        filters.userId = userId;
      }

      if (walletAddress && typeof walletAddress === 'string') {
        filters.walletAddress = walletAddress;
      }

      if (documentId && typeof documentId === 'string') {
        filters.documentId = documentId;
      }

      if (txHash && typeof txHash === 'string') {
        filters.txHash = txHash;
      }

      if (fromBlock && typeof fromBlock === 'string') {
        filters.fromBlock = parseInt(fromBlock);
      }

      if (toBlock && typeof toBlock === 'string') {
        filters.toBlock = parseInt(toBlock);
      }

      if (startDate && typeof startDate === 'string') {
        filters.startDate = new Date(startDate);
      }

      if (endDate && typeof endDate === 'string') {
        filters.endDate = new Date(endDate);
      }

      if (limit && typeof limit === 'string') {
        filters.limit = parseInt(limit);
      }

      if (offset && typeof offset === 'string') {
        filters.offset = parseInt(offset);
      }

      const result = await AuditService.queryBlockchainEvents(filters);

      res.json({
        success: true,
        ...result,
        filters,
      });
    } catch (error) {
      next(error);
    }
  }
}
