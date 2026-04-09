import { Router } from 'express';
import multer from 'multer';
import * as verificationController from '../controllers/verificationController';
import { validateBody } from '../middleware/validator';
import { 
  verifyByBlockchainSchema, 
  verifyByIPFSSchema 
} from '../schemas/verification.schema';

const router = Router();

// Configurar multer para manejar uploads en memoria
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
});

// Verificar documento subiendo un archivo
router.post('/file', upload.single('file'), verificationController.verifyByFile);

// Verificar documento por hash IPFS
router.post('/ipfs', validateBody(verifyByIPFSSchema), verificationController.verifyByIPFS);

// Verificar documento por ID de blockchain
router.post('/blockchain', validateBody(verifyByBlockchainSchema), verificationController.verifyByBlockchain);

export default router;
