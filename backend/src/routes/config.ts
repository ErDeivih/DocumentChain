import logger from '../utils/logger';
import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { resolveDocumentRegistryAddress } from '../config/contractAddress';

/**
 * Router de configuración de contratos y blockchain.
 * Devuelve direcciones de contratos desplegados, ABIs y parámetros de conexión a la red.
 */
const router = Router();

const DocumentRegistry = require('../../../smart-contracts/artifacts/contracts/DocumentRegistry.sol/DocumentRegistry.json');

/**
 * ABI del contrato DocumentRegistry importado de los artefactos de compilación.
 */
const REGISTRY_ABI = DocumentRegistry.abi;

/**
 * GET /contracts
 * Devuelve las direcciones de los contratos desplegados y la configuración de conexión a la red blockchain.
 */
router.get('/contracts', authenticate, async (req: Request, res: Response) => {
  try {
    const registryAddress = resolveDocumentRegistryAddress() || null;
    if (!registryAddress) {
      return res.status(503).json({ error: 'Contract address not configured' });
    }
    res.json({
      chainId: parseInt(process.env.BLOCKCHAIN_CHAIN_ID || '31337'),
      rpcUrl: process.env.BLOCKCHAIN_RPC_URL || 'http://localhost:8545',
      blockExplorer: process.env.BLOCK_EXPLORER_URL || null,
      contracts: {
        documentRegistry: registryAddress,
        documentVersioning: registryAddress,
        documentSigning: registryAddress,
        documentAccessControl: registryAddress
      }
    });
  } catch (error) {
    logger.error('Error getting contract config:', error);
    res.status(500).json({ error: 'Failed to get contract configuration' });
  }
});

/**
 * GET /abis
 * Devuelve los ABIs de los contratos inteligentes utilizados por la aplicación.
 */
router.get('/abis', authenticate, async (req: Request, res: Response) => {
  try {
    res.json({
      documentRegistry: REGISTRY_ABI,
      documentVersioning: REGISTRY_ABI,
      documentSigning: REGISTRY_ABI,
      documentAccessControl: REGISTRY_ABI
    });
  } catch (error) {
    logger.error('Error getting contract ABIs:', error);
    res.status(500).json({ error: 'Failed to get contract ABIs' });
  }
});

/**
 * GET /blockchain
 * Devuelve la configuración completa de blockchain, incluyendo ABIs y direcciones de contratos.
 */
router.get('/blockchain', authenticate, async (req: Request, res: Response) => {
  try {
    const registryAddress = resolveDocumentRegistryAddress() || null;
    res.json({
      chainId: parseInt(process.env.BLOCKCHAIN_CHAIN_ID || '31337'),
      rpcUrl: process.env.BLOCKCHAIN_RPC_URL || 'http://localhost:8545',
      blockExplorer: process.env.BLOCK_EXPLORER_URL || null,
      contracts: {
        documentRegistry: { address: registryAddress, abi: REGISTRY_ABI },
        documentVersioning: { address: registryAddress, abi: REGISTRY_ABI },
        documentSigning: { address: registryAddress, abi: REGISTRY_ABI },
        documentAccessControl: { address: registryAddress, abi: REGISTRY_ABI }
      }
    });
  } catch (error) {
    logger.error('Error getting blockchain config:', error);
    res.status(500).json({ error: 'Failed to get blockchain configuration' });
  }
});

export default router;
