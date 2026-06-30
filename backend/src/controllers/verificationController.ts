import { Request, Response, NextFunction } from 'express';
import { VerificationService } from '../services/verificationService';


/**
 * Controlador de verificación de documentos.
 * Permite verificar la autenticidad e integridad de documentos mediante
 * archivos, hashes IPFS o identificadores de blockchain.
 */

/**
 * Verifica un documento subiendo su archivo para comparar el hash.
 * Endpoint: POST /api/verify/file
 *
 * @param req - Objeto de solicitud HTTP con el archivo en multipart/form-data.
 * @param res - Objeto de respuesta HTTP.
 * @returns Promesa que resuelve con el resultado de la verificación.
 */
export async function verifyByFile(req: Request, res: Response, next: NextFunction) {
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
  } catch (error) {
    next(error);
  }
}

/**
 * Verifica un documento a partir de su hash IPFS.
 * Endpoint: POST /api/verify/ipfs
 *
 * @param req - Objeto de solicitud HTTP con { ipfsHash } en el cuerpo.
 * @param res - Objeto de respuesta HTTP.
 * @returns Promesa que resuelve con el resultado de la verificación.
 */
export async function verifyByIPFS(req: Request, res: Response, next: NextFunction) {
  try {
    const { ipfsHash } = req.body;
    const result = await VerificationService.verifyByIPFSHash(ipfsHash);
    
    res.json({
      success: true,
      result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Verifica un documento a partir de su identificador en blockchain.
 * Endpoint: POST /api/verify/blockchain
 *
 * @param req - Objeto de solicitud HTTP con { blockchainId } en el cuerpo.
 * @param res - Objeto de respuesta HTTP.
 * @returns Promesa que resuelve con el resultado de la verificación.
 */
export async function verifyByBlockchain(req: Request, res: Response, next: NextFunction) {
  try {
    const { blockchainId } = req.body;
    const result = await VerificationService.verifyByBlockchainId(blockchainId);
    
    res.json({
      success: true,
      result,
    });
  } catch (error) {
    next(error);
  }
}
