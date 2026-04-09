/**
 * Zod Schemas para Endpoints de Verificación
 * Valida y sanitiza entradas para verificación de documentos
 */

import { z } from 'zod';

/**
 * Schema para verificar documento por ID de blockchain
 */
export const verifyByBlockchainSchema = z.object({
  blockchainId: z.string()
    .trim()
    .regex(/^0x[a-fA-F0-9]{64}$/, 'Formato de ID de blockchain inválido (debe ser 0x seguido de 64 caracteres hexadecimales)')
    .transform(val => val.toLowerCase())
});

/**
 * Schema para verificar documento por hash IPFS
 */
export const verifyByIPFSSchema = z.object({
  ipfsHash: z.string()
    .trim()
    .regex(
      /^(Qm[1-9A-HJ-NP-Za-km-z]{44}|bafy[a-zA-Z0-9]{55,})$/,
      'Formato de hash IPFS inválido (debe ser CIDv0 comenzando con Qm o CIDv1 comenzando con bafy)'
    )
});

/**
 * Schema para verificar documento por archivo
 * Nota: La validación de archivo es manejada por middleware multer
 * Este schema valida datos adicionales del formulario si es necesario
 */
export const verifyByFileSchema = z.object({
  // El archivo es manejado por multer
  // Añadir campos adicionales aquí si es necesario
  filename: z.string().optional(),
  description: z.string().max(500).optional()
});

// Exportar tipos
export type VerifyByBlockchainInput = z.infer<typeof verifyByBlockchainSchema>;
export type VerifyByIPFSInput = z.infer<typeof verifyByIPFSSchema>;
export type VerifyByFileInput = z.infer<typeof verifyByFileSchema>;
