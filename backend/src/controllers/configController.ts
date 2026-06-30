import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import { resolveDocumentRegistryAddress } from '../config/contractAddress';
import { env } from '../config/env';

const DocumentRegistry = require('../../../smart-contracts/artifacts/contracts/DocumentRegistry.sol/DocumentRegistry.json');
const REGISTRY_ABI = DocumentRegistry.abi;

/**
 * Controlador de configuración. Expone la configuración del contrato y la red blockchain al frontend.
 */
export class ConfigController {
  /**
   * Retorna la configuración de contratos blockchain (direcciones y chain).
   * Endpoint: GET /api/config/contracts
   * @param {Request} req - Solicitud HTTP
   * @param {Response} res - Respuesta HTTP
   * @returns {Promise<void>}
   */
  static async getContractsConfig(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const registryAddress = resolveDocumentRegistryAddress() || null;
      if (!registryAddress) {
        res.status(503).json({ error: 'Contract address not configured' });
        return;
      }
      res.json({
        chainId: env.BLOCKCHAIN_CHAIN_ID,
        rpcUrl: env.BLOCKCHAIN_RPC_URL,
        blockExplorer: env.BLOCK_EXPLORER_URL || null,
        contracts: {
          documentRegistry: registryAddress,
          documentVersioning: registryAddress,
          documentSigning: registryAddress,
          documentAccessControl: registryAddress,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
