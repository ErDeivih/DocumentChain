/**
 * Router de gestión de firmas digitales.
 * Expone endpoints para preparar, confirmar y consultar firmas sobre versiones de documentos.
 * Permite preparar, confirmar y revertir firmas sobre versiones de documentos.
 */

import { Router } from 'express';
import { SignatureController } from '../controllers/signatureController';
import { authenticate } from '../middleware/auth';
import { generalLimiter, blockchainLimiter, confirmLimiter } from '../middleware/rateLimiter';
import { z } from 'zod';
import { validateBody, validateParams } from '../middleware/validator';

const signatureIdSchema = z.object({ signatureId: z.string().min(1) });

const prepareSignatureSchema = z.object({
  documentId: z.string(),
  versionNumber: z.number().int().positive().optional(),
  walletId: z.string().optional(),
  signerWalletId: z.string().optional(),
  comment: z.string().optional(),
});

const confirmSignatureSchema = z.object({
  signatureId: z.string(),
  txHash: z.string(),
  ecdsaSignature: z.string(),
});

const router = Router();

// ============================================
// Endpoints del patrón Preparar/Confirmar
// ============================================

/**
 * POST /api/signatures/prepare
 * Prepara una firma para su creación
 * - Crea el registro en BD con blockchainTxHash = null
 * - Devuelve los datos para que el frontend firme la transacción
 */
router.post('/prepare', 
  authenticate, 
  blockchainLimiter,
  validateBody(prepareSignatureSchema),
  SignatureController.prepareSignature
);

/**
 * POST /api/signatures/confirm
 * Confirma una firma tras la transacción en blockchain
 * - Actualiza el registro en BD con blockchainTxHash
 * - Actualiza el registro con TX_SUBMITTED; la sincronización final ocurre via receipt
 */
router.post('/confirm', 
  authenticate, 
  confirmLimiter,
  validateBody(confirmSignatureSchema),
  SignatureController.confirmSignature
);

// NOTA: removeSignature (DELETE /:signatureId) se ha eliminado intencionadamente.
// Las firmas son inmutables — una vez registradas en blockchain no pueden ser revocadas.
// Eliminarlas de la BD mientras el registro on-chain persiste crea inconsistencia.

// Revierte una preparación de firma (solo cuando falla la tx blockchain, blockchainTxHash es null)
router.post('/:signatureId/rollback', authenticate, generalLimiter, validateParams(signatureIdSchema), SignatureController.rollbackSignature);

export default router;
