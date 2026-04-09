import { Request, Response } from 'express';
import { VerificationService } from '../services/verificationService';

/**
 * POST /api/verify/file
 * Verificar documento subiendo un archivo
 */
export async function verifyByFile(req: Request, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No se proporcionó ningún archivo',
      });
    }
    
    const result = await VerificationService.verifyFileByHash(req.file.buffer);
    
    res.json({
      success: true,
      result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Error al verificar archivo',
    });
  }
}

/**
 * POST /api/verify/ipfs
 * Verificar documento por hash IPFS
 */
export async function verifyByIPFS(req: Request, res: Response) {
  try {
    const { ipfsHash } = req.body;
    
    if (!ipfsHash || typeof ipfsHash !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Se requiere el hash IPFS',
      });
    }
    
    const result = await VerificationService.verifyByIPFSHash(ipfsHash);
    
    res.json({
      success: true,
      result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Error al verificar por IPFS',
    });
  }
}

/**
 * POST /api/verify/blockchain
 * Verificar documento por ID de blockchain
 */
export async function verifyByBlockchain(req: Request, res: Response) {
  try {
    const { blockchainId } = req.body;
    
    if (!blockchainId || typeof blockchainId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Se requiere el ID de blockchain',
      });
    }
    
    const result = await VerificationService.verifyByBlockchainId(blockchainId);
    
    res.json({
      success: true,
      result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Error al verificar por blockchain',
    });
  }
}
