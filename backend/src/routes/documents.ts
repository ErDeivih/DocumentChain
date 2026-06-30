/**
 * Router de gestión de documentos.
 * Expone endpoints para crear, consultar, descargar, archivar, transferir, eliminar y compartir documentos,
 * así como gestionar versiones y firmas asociadas.
 */

import { Router } from 'express';
import { DocumentController } from '../controllers/documentController';
import { VersionController } from '../controllers/versionController';
import { SignatureController } from '../controllers/signatureController';
import { ShareController } from '../controllers/shareController';
import { authenticate } from '../middleware/auth';
import { paginationMiddleware } from '../middleware/pagination';
import { uploadEncrypted } from '../middleware/upload';
import { uploadLimiter, generalLimiter, shareLimiter, blockchainLimiter, prepareLimiter, confirmLimiter } from '../middleware/rateLimiter';
import { z } from 'zod';
import { validateBody, validateParams } from '../middleware/validator';
import { 
  documentIdSchema,
  documentUserParamsSchema,
  documentVersionNumberParamsSchema,
  prepareSetOperationalSchema,
  confirmSetOperationalSchema,
  updateDocumentSchema,
  confirmArchiveSchema,
  confirmDeleteSchema,
  confirmDocumentSchema,
  prepareTransferDocumentSchema,
  confirmTransferDocumentSchema,
  prepareShareSchema,
  confirmShareSchema,
  prepareRevokeShareSchema,
  confirmRevokeShareSchema,
  confirmVersionSchema,
  prepareRestoreVersionSchema,
} from '../schemas/document.schema';

const router = Router();

const prepareDocumentSchema = z.object({
  name: z.string().min(1),
  visibility: z.enum(['PRIVATE', 'PUBLIC']).optional(),
  walletId: z.string().min(1, 'El ID de la wallet es obligatorio'),
  folderId: z.string().optional(),
  description: z.string().optional(),
  tags: z.string().optional().transform((val, ctx) => {
    if (!val || val === 'undefined') return undefined;
    try { return JSON.parse(val); }
    catch { ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'tags debe ser JSON válido' }); return z.NEVER; }
  }).pipe(z.array(z.string()).optional()),
  encryptedSymmetricKey: z.string().optional(),
  contentHash: z.string().optional(),
  encryptionIV: z.string().optional(),
  encryptionAuthTag: z.string().optional(),
});

const prepareVersionSchema = z.object({
  comment: z.string().optional(),
  walletId: z.string().min(1, 'El ID de la wallet es obligatorio'),
  encryptedSymmetricKey: z.string().optional(),
  contentHash: z.string().optional(),
  encryptionIV: z.string().optional(),
  encryptionAuthTag: z.string().optional(),
  shareKeys: z.string().optional().transform((val, ctx) => {
    if (!val || val === 'undefined') return undefined;
    try { return JSON.parse(val); }
    catch { ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'shareKeys debe ser JSON válido' }); return z.NEVER; }
  }).pipe(z.array(z.object({
    userId: z.string(),
    reEncryptedKey: z.string(),
  })).optional()),
});

// ============================================
// NEW: Prepare/Confirm Pattern Endpoints
// ============================================

/**
 * POST /api/documents/prepare
 * Prepara un documento para su creación
 * - Sube el archivo cifrado a IPFS
 * - Crea el registro en BD con blockchainTxHash = null
 * - Devuelve los datos para que el frontend firme la transacción blockchain
 */
router.post('/prepare', 
  authenticate, 
  prepareLimiter, 
  uploadEncrypted,
  validateBody(prepareDocumentSchema),
  DocumentController.prepareDocument
);

/**
 * POST /api/documents/confirm
 * Confirm a document after blockchain transaction
 * - Actualiza el registro en BD con blockchainTxHash y blockchainId
 * - La sincronización final ocurre via receipt
 */
router.post('/confirm', 
  authenticate, 
  confirmLimiter, 
  validateBody(confirmDocumentSchema),
  DocumentController.confirmDocument
);

/**
 * POST /api/documents/:documentId/rollback
 * Revierte la creación de un documento (borra documento + versiones + IPFS)
 * Se usa cuando la transacción blockchain falla tras la preparación
 */
router.post('/:documentId/rollback',
  authenticate,
  generalLimiter,
  validateParams(documentIdSchema),
  DocumentController.rollbackDocument
);

// ============================================
// Existing Endpoints (Updated)
// ============================================

 // Listar documentos - puede filtrarse por walletId
router.get('/', authenticate, generalLimiter, paginationMiddleware, DocumentController.listDocuments);

// Obtener documento por ID
router.get('/:documentId', authenticate, validateParams(documentIdSchema), DocumentController.getDocument);

 // Descargar documento (devuelve archivo cifrado)
router.get('/:documentId/download', authenticate, validateParams(documentIdSchema), DocumentController.downloadDocument);

// Los nombres actuales pueden confundirse con operaciones CRUD simples.
// Archive prepare/confirm
router.post('/:documentId/archive/prepare', authenticate, generalLimiter, validateParams(documentIdSchema), DocumentController.prepareArchiveDocument);
router.post('/:documentId/archive/confirm', authenticate, generalLimiter, validateParams(documentIdSchema), validateBody(confirmArchiveSchema), DocumentController.confirmArchiveDocument);

// Transferencia (prepare/confirm)
router.post('/:documentId/transfer/prepare', authenticate, generalLimiter, validateParams(documentIdSchema), validateBody(prepareTransferDocumentSchema), DocumentController.prepareTransferDocument);
router.post('/:documentId/transfer/confirm', authenticate, generalLimiter, validateParams(documentIdSchema), validateBody(confirmTransferDocumentSchema), DocumentController.confirmTransferDocument);
router.post('/:documentId/transfer/rollback', authenticate, generalLimiter, validateParams(documentIdSchema), DocumentController.rollbackTransfer);

// Borrado prepare/confirm
router.post('/:documentId/delete/prepare', authenticate, generalLimiter, validateParams(documentIdSchema), DocumentController.prepareDeleteDocument);
router.post('/:documentId/delete/confirm', authenticate, generalLimiter, validateParams(documentIdSchema), validateBody(confirmDeleteSchema), DocumentController.confirmDeleteDocument);

// Unarchive prepare/confirm
router.post('/:documentId/unarchive/prepare', authenticate, generalLimiter, validateParams(documentIdSchema), DocumentController.prepareUnarchiveDocument);
router.post('/:documentId/unarchive/confirm', authenticate, generalLimiter, validateParams(documentIdSchema), validateBody(confirmArchiveSchema), DocumentController.confirmUnarchiveDocument);

 // Actualizar metadatos (directo - sin operación blockchain)
router.put('/:documentId', authenticate, generalLimiter, validateParams(documentIdSchema), validateBody(updateDocumentSchema), DocumentController.updateDocument);

// ============================================
// Document Sharing (NEW: prepare/confirm pattern)
// ============================================

/**
 * POST /api/documents/:documentId/share/prepare
 * Prepara una compartición para su creación
 */
router.post('/:documentId/share/prepare', 
  authenticate, 
  shareLimiter, 
  validateParams(documentIdSchema), 
  validateBody(prepareShareSchema),
  ShareController.prepareShare
);

/**
 * POST /api/documents/:documentId/share/:userId/revoke/prepare
 * Prepara una revocación de compartición
 */
router.post('/:documentId/share/:userId/revoke/prepare', 
  authenticate, 
  shareLimiter, 
  validateParams(documentUserParamsSchema), 
  validateBody(prepareRevokeShareSchema),
  ShareController.prepareRevokeShare
);

router.get('/:documentId/shares', authenticate, validateParams(documentIdSchema), ShareController.getDocumentShares);
router.get('/:documentId/my-role', authenticate, blockchainLimiter, validateParams(documentIdSchema), ShareController.getMyRole);

// ============================================
// Version Routes
// ============================================
router.get('/:documentId/versions', authenticate, validateParams(documentIdSchema), VersionController.getVersions);
// Patrón prepare/confirm para versión operativa (on-chain)
router.post('/:documentId/operational-version/prepare', authenticate, generalLimiter, validateParams(documentIdSchema), validateBody(prepareSetOperationalSchema), VersionController.prepareSetOperational);
router.post('/:documentId/operational-version/confirm', authenticate, generalLimiter, validateParams(documentIdSchema), validateBody(confirmSetOperationalSchema), VersionController.confirmSetOperational);
router.post('/:documentId/operational-version/rollback', authenticate, generalLimiter, validateParams(documentIdSchema), VersionController.rollbackSetOperational);
// Patrón prepare/confirm para versiones
router.post('/:documentId/versions/prepare', authenticate, uploadLimiter, uploadEncrypted, validateParams(documentIdSchema), validateBody(prepareVersionSchema), VersionController.prepareVersion);
router.post('/:documentId/versions/confirm', authenticate, generalLimiter, validateParams(documentIdSchema), validateBody(confirmVersionSchema), VersionController.confirmVersion);
// NEW: restore prepare/confirm
router.post('/:documentId/versions/restore/prepare', authenticate, generalLimiter, validateParams(documentIdSchema), validateBody(prepareRestoreVersionSchema), VersionController.prepareRestoreVersion);
// Firmas para un número de versión específico (para frontend listByVersion)
router.get('/:documentId/versions/:versionNumber/signatures', authenticate, validateParams(documentVersionNumberParamsSchema), SignatureController.getVersionSignaturesByNumber);

/**
 * GET /api/documents/:documentId/share-keys
 * Devuelve las claves públicas de los usuarios con los que se ha compartido el documento.
 * Necesario para re-cifrar claves AES al crear nuevas versiones.
 */
router.get('/:documentId/share-keys', authenticate, generalLimiter, validateParams(documentIdSchema), DocumentController.getShareKeys);

export default router;
