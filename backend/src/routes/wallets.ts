import { Router } from 'express';
import { WalletController } from '../controllers/walletController';
import { authenticate } from '../middleware/auth';

/**
 * Router de gestión de wallets Ethereum.
 * Expone endpoints para listar, añadir, eliminar, etiquetar y establecer wallets principales.
 */
const router = Router();

// All wallet routes require authentication

/**
 * GET /wallets
 * Devuelve todas las wallets asociadas al usuario autenticado.
 */
router.get('/', authenticate, WalletController.getWallets);

/**
 * GET /wallets/primary
 * Devuelve la wallet marcada como principal del usuario autenticado.
 */
router.get('/primary', authenticate, WalletController.getPrimaryWallet);

/**
 * POST /wallets
 * Asocia una nueva dirección Ethereum a la cuenta del usuario autenticado.
 */
router.post('/', authenticate, WalletController.addWallet);

/**
 * POST /wallets/challenge
 * Genera un reto (challenge) de nonce para la firma de una wallet (endpoint público).
 */
router.post('/challenge', WalletController.getChallenge); // Public endpoint

/**
 * DELETE /wallets/:walletId
 * Elimina una wallet asociada a la cuenta del usuario autenticado.
 */
router.delete('/:walletId', authenticate, WalletController.removeWallet);

/**
 * PUT /wallets/:walletId/primary
 * Establece una wallet existente como principal para el usuario autenticado.
 */
router.put('/:walletId/primary', authenticate, WalletController.setPrimaryWallet);

/**
 * PUT /wallets/:walletId/label
 * Actualiza la etiqueta descriptiva de una wallet específica.
 */
router.put('/:walletId/label', authenticate, WalletController.updateLabel);

export default router;
