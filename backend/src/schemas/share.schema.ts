import { z } from 'zod';

/**
 * Schema de validación para el identificador de un documento en los parámetros de ruta.
 * Acepta valores UUID o CUID.
 */
const documentIdParamSchema = z.string().refine(
  (value) => z.string().uuid().safeParse(value).success || z.string().cuid().safeParse(value).success,
  'ID de documento inválido'
);

/**
 * Schema para validar documentId en params
 */
export const documentIdSchema = z.object({
  documentId: documentIdParamSchema
});
