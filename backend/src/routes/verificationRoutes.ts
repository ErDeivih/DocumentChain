import { Router } from 'express';
import multer from 'multer';
import * as verificationController from '../controllers/verificationController';
import { validateBody } from '../middleware/validator';
import { 
  verifyByBlockchainSchema, 
  verifyByIPFSSchema 
} from '../schemas/verification.schema';

/**
 * Router de verificación de autenticidad de documentos.
 * Permite verificar documentos por archivo, hash IPFS o identificador de blockchain.
 */
const router = Router();

/**
 * Instancia de multer configurada para almacenar archivos en memoria con un límite de 100 MB.
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
});

/**
 * POST /file
 * Verifica la autenticidad de un documento subiendo el archivo directamente.
 */
router.post('/file', upload.single('file'), verificationController.verifyByFile);

/**
 * POST /ipfs
 * Verifica la autenticidad de un documento a partir de su hash IPFS.
 */
router.post('/ipfs', validateBody(verifyByIPFSSchema), verificationController.verifyByIPFS);

/**
 * POST /blockchain
 * Verifica la autenticidad de un documento mediante su identificador en blockchain.
 */
router.post('/blockchain', validateBody(verifyByBlockchainSchema), verificationController.verifyByBlockchain);

export default router;
