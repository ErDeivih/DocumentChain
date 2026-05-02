import { z } from 'zod';

const isUuidOrCuid = (value: string) => {
  return z.string().uuid().safeParse(value).success || z.string().cuid().safeParse(value).success;
};

const isCuidOrEthereumAddress = (value: string) => {
  return z.string().cuid().safeParse(value).success || /^0x[a-fA-F0-9]{40}$/.test(value);
};

const documentIdParamSchema = z.string().refine(isUuidOrCuid, 'ID de documento inválido');

/**
 * Schema para creación de documento
 */
export const createDocumentSchema = z.object({
  name: z.string()
    .min(1, 'Se requiere nombre del documento')
    .max(255, 'El nombre del documento es demasiado largo')
    .trim(),
  description: z.string()
    .max(2000, 'La descripción es demasiado larga')
    .trim()
    .optional(),
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(128),
  folderId: z.string()
    .uuid('ID de carpeta inválido')
    .optional(),
  tags: z.array(z.string().max(50).trim())
    .max(20, 'Máximo 20 etiquetas permitidas')
    .optional()
});

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
 * Schema para rutas que requieren documentId y versionId en params
 */
export const documentVersionParamsSchema = z.object({
  documentId: documentIdParamSchema,
  versionId: z.string().uuid('ID de versión inválido'),
});

/**
 * Schema para rutas que requieren documentId y versionNumber en params
 */
export const documentVersionNumberParamsSchema = z.object({
  documentId: documentIdParamSchema,
  versionNumber: z.string().regex(/^\d+$/, 'Número de versión inválido'),
});

export const documentOperationalVersionSchema = z.object({
  versionNumber: z.number().int().positive('Número de versión inválido'),
});

/**
 * Schema para download de documento
 */
export const downloadDocumentSchema = z.object({
  password: z.string().min(1, 'Se requiere contraseña')
});

/**
 * Schema para transferencia de documento
 */
export const transferDocumentSchema = z.object({
  newOwnerId: z.string().uuid('ID de usuario inválido'),
  currentPassword: z.string().min(1, 'Se requiere la contraseña actual'),
  newOwnerPassword: z.string().min(8, 'La contraseña del nuevo propietario debe tener al menos 8 caracteres')
});

/**
 * Schema para query params de listado
 */
export const listDocumentsQuerySchema = z.object({
  includeArchived: z.string().optional().transform(val => val === 'true'),
  page: z.string().optional().transform(val => parseInt(val || '1')),
  limit: z.string().optional().transform(val => Math.min(parseInt(val || '50'), 100)),
  folderId: z.string().uuid().optional(),
  search: z.string().max(255).optional()
});
