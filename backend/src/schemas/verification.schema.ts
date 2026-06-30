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
      /^(Qm[1-9A-HJ-NP-Za-km-z]{44}|baf[a-z2-7]{56,})$/,
      'Formato de hash IPFS inválido (debe ser CIDv0 comenzando con Qm o CIDv1)'
    )
});


