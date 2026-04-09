import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';

const router = Router();

const DocumentRegistry = require('../../../smart-contracts/artifacts/contracts/DocumentRegistry.sol/DocumentRegistry.json');
const REGISTRY_ABI = DocumentRegistry.abi;

router.get('/contracts', authenticate, async (req: Request, res: Response) => {
  try {
    const registryAddress = process.env.CONTRACT_DOCUMENT_REGISTRY || null;
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
    console.error('Error getting contract config:', error);
    res.status(500).json({ error: 'Failed to get contract configuration' });
  }
});

router.get('/abis', authenticate, async (req: Request, res: Response) => {
  try {
    res.json({
      documentRegistry: REGISTRY_ABI,
      documentVersioning: REGISTRY_ABI,
      documentSigning: REGISTRY_ABI,
      documentAccessControl: REGISTRY_ABI
    });
  } catch (error) {
    console.error('Error getting contract ABIs:', error);
    res.status(500).json({ error: 'Failed to get contract ABIs' });
  }
});

router.get('/blockchain', authenticate, async (req: Request, res: Response) => {
  try {
    const registryAddress = process.env.CONTRACT_DOCUMENT_REGISTRY || null;
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
    console.error('Error getting blockchain config:', error);
    res.status(500).json({ error: 'Failed to get blockchain configuration' });
  }
});

export default router;
