import { Router, Request, Response } from 'express';
import { AuditService } from '../services/auditService';
import logger from '../utils/logger';

/**
 * Router de auditoría pública.
 * Expone endpoints de transparencia sin autenticación para consultar trazas de auditoría,
 * verificar integridad, propiedad, metadatos públicos, estadísticas y detalles de transacciones.
 */

const router = Router();

function isNotFoundError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  return error.message.includes('not found') || error.message.includes('no encontrado');
}

/**
 * GET /audit/trail/:blockchainId
 * Obtener historial completo de auditoría de un documento
 * 
 * @public - No requiere autenticación
 * @param blockchainId - ID del documento en blockchain (bytes32 hex)
 * @returns Array de eventos cronológicos
 */
router.get('/trail/:blockchainId', async (req: Request, res: Response) => {
  try {
    const { blockchainId } = req.params;

    // Asegurar que es string
    if (typeof blockchainId !== 'string' || blockchainId.length !== 66 || !blockchainId.startsWith('0x')) {
      return res.status(400).json({
        error: 'Formato de blockchainId inválido. Se esperaba una cadena hexadecimal de 32 bytes con prefijo 0x.'
      });
    }

    logger.info(`[PUBLIC] Audit trail requested for: ${blockchainId}`);

    const auditTrail = await AuditService.getFileAuditTrail(blockchainId);

    res.json({
      success: true,
      blockchainId,
      totalEvents: auditTrail.length,
      events: auditTrail
    });

  } catch (error) {
    logger.error('Error en endpoint de historial de auditoría:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Error al recuperar historial de auditoría'
    });
  }
});

/**
 * GET /audit/integrity/:fileId
 * Verificar integridad de un documento
 * Compara blockchain (source of truth) vs database (cache)
 * 
 * @public - No requiere autenticación
 * @param fileId - ID del documento en base de datos (UUID)
 * @returns Resultado de verificación de integridad
 */
router.get('/integrity/:fileId', async (req: Request, res: Response) => {
  try {
    const { fileId } = req.params;

    if (typeof fileId !== 'string' || !fileId) {
      return res.status(400).json({
        error: 'El fileId es obligatorio'
      });
    }

    logger.info(`[PUBLIC] Integrity check requested for: ${fileId}`);

    const integrityCheck = await AuditService.verifyFileIntegrity(fileId);

    res.json({
      success: true,
      integrity: integrityCheck
    });

  } catch (error) {
    logger.error('Error en endpoint de verificación de integridad:', error);
    
    if (isNotFoundError(error)) {
      return res.status(404).json({
        error: error instanceof Error ? error.message : 'Recurso no encontrado'
      });
    }

    res.status(500).json({
      error: error instanceof Error ? error.message : 'Error al verificar integridad'
    });
  }
});

/**
 * GET /audit/ownership/:blockchainId/:walletAddress
 * Verificar propiedad criptográfica de un documento
 * 
 * @public - No requiere autenticación
 * @param blockchainId - ID del documento en blockchain
 * @param walletAddress - Dirección de wallet que afirma ser dueña
 * @returns Prueba criptográfica de propiedad
 */
router.get('/ownership/:blockchainId/:walletAddress', async (req: Request, res: Response) => {
  try {
    const { blockchainId, walletAddress } = req.params;

    if (typeof blockchainId !== 'string' || blockchainId.length !== 66 || !blockchainId.startsWith('0x')) {
      return res.status(400).json({
        error: 'Formato de blockchainId inválido. Se esperaba una cadena hexadecimal de 32 bytes con prefijo 0x.'
      });
    }

    if (typeof walletAddress !== 'string' || walletAddress.length !== 42 || !walletAddress.startsWith('0x')) {
      return res.status(400).json({
        error: 'Formato de walletAddress inválido. Se esperaba una cadena hexadecimal de 20 bytes con prefijo 0x.'
      });
    }

    logger.info(`[PUBLIC] Ownership verification requested: ${walletAddress} -> ${blockchainId}`);

    const ownershipProof = await AuditService.verifyOwnership(blockchainId, walletAddress);

    res.json({
      success: true,
      ownership: ownershipProof
    });

  } catch (error) {
    logger.error('Error en endpoint de verificación de propiedad:', error);
    
    if (isNotFoundError(error)) {
      return res.status(404).json({
        error: error instanceof Error ? error.message : 'Recurso no encontrado'
      });
    }

    res.status(500).json({
      error: error instanceof Error ? error.message : 'Error al verificar propiedad'
    });
  }
});

/**
 * GET /audit/metadata/:blockchainId
 * Obtener metadata PÚBLICA de un documento
 * Cualquiera puede ver datos almacenados en blockchain
 * 
 * @public - No requiere autenticación
 * @param blockchainId - ID del documento en blockchain
 * @returns Metadata pública del documento
 */
router.get('/metadata/:blockchainId', async (req: Request, res: Response) => {
  try {
    const { blockchainId } = req.params;

    if (typeof blockchainId !== 'string' || blockchainId.length !== 66 || !blockchainId.startsWith('0x')) {
      return res.status(400).json({
        error: 'Formato de blockchainId inválido. Se esperaba una cadena hexadecimal de 32 bytes con prefijo 0x.'
      });
    }

    logger.info(`[PUBLIC] Public metadata requested for: ${blockchainId}`);

    const metadata = await AuditService.getPublicMetadata(blockchainId);

    res.json({
      success: true,
      metadata
    });

  } catch (error) {
    logger.error('Error en endpoint de metadatos públicos:', error);
    
    if (isNotFoundError(error)) {
      return res.status(404).json({
        error: error instanceof Error ? error.message : 'Recurso no encontrado'
      });
    }

    res.status(500).json({
      error: error instanceof Error ? error.message : 'Error al obtener metadatos públicos'
    });
  }
});

/**
 * GET /audit/stats
 * Obtener estadísticas públicas de documentos
 * Útil para dashboards públicos y análisis de transparencia
 * 
 * @public - No requiere autenticación
 * @returns Estadísticas agregadas del sistema
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    logger.info('[PUBLIC] Public stats requested');

    const stats = await AuditService.getPublicStats();

    res.json({
      success: true,
      stats
    });

  } catch (error) {
    logger.error('Error en endpoint de estadísticas públicas:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Error al obtener estadísticas públicas'
    });
  }
});

/**
 * GET /audit/health
 * Health check para servicio de auditoría
 * 
 * @public - No requiere autenticación
 * @returns Estado del servicio
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    // Verificar conexión a blockchain
    const { provider } = await import('../config/blockchain');
    const blockNumber = await provider.getBlockNumber();

    res.json({
      success: true,
      service: 'audit',
      status: 'operational',
      blockchain: {
        connected: true,
        latestBlock: blockNumber
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error en verificación de salud del servicio de auditoría:', error);
    res.status(503).json({
      success: false,
      service: 'audit',
      status: 'degraded',
      error: error instanceof Error ? error.message : 'Error desconocido',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /audit/transaction/:txHash
 * Obtener detalles de una transacción por su hash
 * Decodifica eventos del contrato DocumentRegistry
 * 
 * @public - No requiere autenticación
 * @param txHash - Hash de la transacción (0x...)
 * @returns Detalles de la transacción y eventos decodificados
 */
router.get('/transaction/:txHash', async (req: Request, res: Response) => {
  try {
    const { txHash } = req.params;

    if (typeof txHash !== 'string' || !txHash.startsWith('0x') || txHash.length !== 66) {
      return res.status(400).json({
        error: 'Formato de txHash inválido. Se esperaba una cadena hexadecimal de 32 bytes con prefijo 0x.'
      });
    }

    logger.info(`[PUBLIC] Transaction details requested for: ${txHash}`);

    const details = await AuditService.getTransactionDetails(txHash);

    res.json({
      success: true,
      ...details
    });

  } catch (error) {
    logger.error('Error en endpoint de detalles de transacción:', error);

    if (error instanceof Error && error.message.includes('no encontrada')) {
      return res.status(404).json({
        error: error.message
      });
    }

    res.status(500).json({
      error: error instanceof Error ? error.message : 'Error al obtener detalles de transacción'
    });
  }
});

/**
 * GET /audit/events
 * Consultar eventos de blockchain con filtros avanzados
 * Permite auditoría completa del sistema
 * 
 * @public - No requiere autenticación
 * @query eventTypes - Tipos de eventos (comma-separated)
 * @query userId - ID del usuario
 * @query walletAddress - Dirección de wallet
 * @query documentId - ID del documento
 * @query txHash - Hash de transacción
 * @query fromBlock - Bloque inicial
 * @query toBlock - Bloque final
 * @query startDate - Fecha inicial (ISO)
 * @query endDate - Fecha final (ISO)
 * @query limit - Límite de resultados (default: 50)
 * @query offset - Offset para paginación (default: 0)
 * @returns Lista de eventos filtrados
 */
router.get('/events', async (req: Request, res: Response) => {
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
      offset
    } = req.query;

    logger.info('[PUBLIC] Blockchain events query requested', {
      eventTypes,
      userId,
      walletAddress,
      documentId,
      limit: limit || 50
    });

    // Parsear filtros
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
      filters: filters
    });

  } catch (error) {
    logger.error('Error en endpoint de consulta de eventos:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Error al consultar eventos'
    });
  }
});

export default router;
