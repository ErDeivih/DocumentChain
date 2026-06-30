import { z } from 'zod';

const isUuidOrCuid = (value: string) => {
  return z.string().uuid().safeParse(value).success || z.string().cuid().safeParse(value).success;
};

const isCuidOrEthereumAddress = (value: string) => {
  return z.string().cuid().safeParse(value).success || /^0x[a-fA-F0-9]{40}$/.test(value);
};

const documentIdParamSchema = z.string().refine(isUuidOrCuid, 'ID de documento inválido');

/**
 * Schema para ID de documento
 */
export const documentIdSchema = z.object({
  documentId: documentIdParamSchema
});

/**
 * Schema para rutas que requieren documentId y userId en params
 */
export const documentUserParamsSchema = z.object({
  documentId: documentIdParamSchema,
  userId: z.string().refine(isCuidOrEthereumAddress, 'ID de usuario o wallet inválido'),
});

/**
 * Schema para rutas que requieren documentId y versionNumber en params
 */
export const documentVersionNumberParamsSchema = z.object({
  documentId: documentIdParamSchema,
  versionNumber: z.string().regex(/^\d+$/, 'Número de versión inválido'),
});

export const prepareSetOperationalSchema = z.object({
  versionNumber: z.number().int().positive('Número de versión inválido'),
});

export const confirmSetOperationalSchema = z.object({
  versionNumber: z.number().int().positive('Número de versión inválido'),
  txHash: z.string().min(66, 'Hash de transacción inválido'),
});

/**
 * Schema para actualización de metadatos de documento
 */
export const updateDocumentSchema = z.object({
  name: z.string()
    .min(1, 'Se requiere nombre del documento')
    .max(255, 'El nombre del documento es demasiado largo')
    .trim()
    .optional(),
  description: z.string()
    .max(2000, 'La descripción es demasiado larga')
    .trim()
    .optional(),
  folderId: z.string()
    .uuid('ID de carpeta inválido')
    .optional(),
  tags: z.array(z.string().max(50).trim())
    .max(20, 'Máximo 20 etiquetas permitidas')
    .optional(),
});
export const confirmArchiveSchema = z.object({ txHash: z.string() });

export const confirmDeleteSchema = z.object({ txHash: z.string() });

export const confirmDocumentSchema = z.object({
  documentId: z.string().refine(isUuidOrCuid, 'ID de documento inválido'),
  txHash: z.string().min(66, 'Hash de transacción inválido'),
  blockchainId: z.string().min(1, 'El ID de blockchain es obligatorio'),
});

export const prepareTransferDocumentSchema = z.object({
  newOwnerId: z.string().refine(isUuidOrCuid, 'ID de propietario inválido'),
  walletId: z.string().min(1, 'El ID de la wallet es obligatorio'),
  newOwnerWalletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Direccion Ethereum invalida'),
  reEncryptedSymmetricKey: z.string().optional(),
});

export const confirmTransferDocumentSchema = z.object({
  txHash: z.string().min(66, 'Hash de transacción inválido'),
  transferId: z.string().min(1, 'El ID de transferencia es obligatorio'),
  signature: z.string().optional(),
});

export const prepareShareSchema = z.object({
  sharedWithUserId: z.string().min(1, 'El ID del usuario destinatario es obligatorio'),
  role: z.enum(['SHARED_READ', 'SHARED_WRITE']),
  walletId: z.string().min(1, 'El ID de la wallet es obligatorio'),
  // NOTA: reEncryptedSymmetricKey ya viene re-cifrada por el frontend (RSA-OAEP con clave pública del destinatario).
  // El backend almacena la clave tal cual, sin tocarla.
  reEncryptedSymmetricKey: z.string().min(1, 'La clave simétrica re-cifrada es obligatoria'),
  sharedToWalletAddress: z.string().optional(),
});

export const confirmShareSchema = z.object({
  shareId: z.string().min(1, 'El ID del share es obligatorio'),
  txHash: z.string().min(66, 'Hash de transacción inválido'),
});

export const prepareRevokeShareSchema = z.object({
  sharerWalletId: z.string().min(1, 'El ID de la wallet es obligatorio'),
});

export const confirmRevokeShareSchema = z.object({
  txHash: z.string().min(66, 'Hash de transacción inválido'),
  shareId: z.string().optional(),
});

export const confirmVersionSchema = z.object({
  versionId: z.string().min(1, 'El ID de la versión es obligatorio'),
  txHash: z.string().min(66, 'Hash de transacción inválido'),
  blockchainVersionNumber: z.number().int().positive('Número de versión de blockchain inválido').optional(),
});

export const prepareRestoreVersionSchema = z.object({
  versionNumber: z.number().int().positive('Número de versión inválido'),
  walletId: z.string().optional(),
});


