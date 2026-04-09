import { Router } from 'express';
import { WalletController } from '../controllers/walletController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All wallet routes require authentication
router.get('/', authenticate, WalletController.getWallets);
router.get('/primary', authenticate, WalletController.getPrimaryWallet);
router.post('/', authenticate, WalletController.addWallet);
router.post('/challenge', WalletController.getChallenge); // Public endpoint
router.delete('/:walletId', authenticate, WalletController.removeWallet);
router.put('/:walletId/primary', authenticate, WalletController.setPrimaryWallet);
router.put('/:walletId/label', authenticate, WalletController.updateLabel);

export default router;
