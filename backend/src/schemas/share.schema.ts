import { z } from 'zod';

/**
 * Schema para validar documentId en params
 */
export const documentIdSchema = z.object({
  documentId: z.string().uuid('ID de documento inválido')
});
