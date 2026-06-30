import { Router } from 'express';
import { z } from 'zod';
import { WalletController } from '../controllers/walletController';
import { authenticate } from '../middleware/auth';
import { generalLimiter, challengeLimiter, walletLimiter } from '../middleware/rateLimiter';
import { validateBody, validateParams } from '../middleware/validator';

const addWalletSchema = z.object({
  address: z.string(),
  signature: z.string().optional(),
  message: z.string().optional(),
  label: z.string().optional(),
  isPrimary: z.boolean().optional(),
});
const challengeSchema = z.object({ address: z.string() });
const updateLabelSchema = z.object({ label: z.string().min(1) });
const walletIdSchema = z.object({ walletId: z.string().min(1) });

/**
 * Router de gestión de wallets Ethereum.
 * Expone endpoints para listar, añadir, eliminar, etiquetar y establecer wallets principales.
 */
const router = Router();

// Todas las rutas de wallet requieren autenticación


/**
 * GET /wallets
 * Devuelve todas las wallets asociadas al usuario autenticado.
 */
router.get('/', authenticate, generalLimiter, WalletController.getWallets);

/**
 * POST /wallets
 * Asocia una nueva dirección Ethereum a la cuenta del usuario autenticado.
 */
router.post('/', authenticate, walletLimiter, validateBody(addWalletSchema), WalletController.addWallet);

/**
 * POST /wallets/challenge
 * Genera un reto (challenge) de nonce para la firma de una wallet (endpoint público).
 */
router.post('/challenge', challengeLimiter, validateBody(challengeSchema), WalletController.getChallenge); // Public endpoint

/**
 * DELETE /wallets/:walletId
 * Elimina una wallet asociada a la cuenta del usuario autenticado.
 */
router.delete('/:walletId', authenticate, walletLimiter, validateParams(walletIdSchema), WalletController.removeWallet);

/**
 * PUT /wallets/:walletId/primary
 * Establece una wallet existente como principal para el usuario autenticado.
 */
router.put('/:walletId/primary', authenticate, walletLimiter, validateParams(walletIdSchema), WalletController.setPrimaryWallet);

/**
 * PUT /wallets/:walletId/label
 * Actualiza la etiqueta descriptiva de una wallet específica.
 */
router.put('/:walletId/label', authenticate, walletLimiter, validateParams(walletIdSchema), validateBody(updateLabelSchema), WalletController.updateLabel);

export default router;
