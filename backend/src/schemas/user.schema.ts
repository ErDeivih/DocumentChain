import { z } from 'zod';

/**
 * Schema para actualización de perfil
 */
export const updateProfileSchema = z.object({
  fullName: z.string()
    .max(255, 'El nombre es demasiado largo')
    .trim()
    .optional(),
  email: z.string()
    .email('Formato de email inválido')
    .max(255)
    .toLowerCase()
    .trim()
    .optional()
});

/**
 * Schema para parámetro de ID de usuario
 */
export const userIdSchema = z.object({
  userId: z.string().trim().min(1, 'ID de usuario inválido').max(191, 'ID de usuario inválido')
});

/**
 * Schema para búsqueda de usuarios
 */
export const searchUsersSchema = z.object({
  q: z.string().min(1).max(100).trim().optional(),
  query: z.string().min(1).max(100).trim().optional(),
  limit: z.string().optional().transform(val => Math.min(parseInt(val || '10'), 50))
}).refine((data) => !!data.q || !!data.query, {
  message: 'Se requiere un término de búsqueda',
  path: ['q'],
});

