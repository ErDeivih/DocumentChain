import { z } from 'zod';

const loginIdentifierSchema = z.string().trim().min(3).max(255).superRefine((value, ctx) => {
  if (value.includes('@')) {
    const parsedEmail = z.string().email('Formato de email inválido').safeParse(value);
    if (!parsedEmail.success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Formato de email inválido',
      });
    }
    return;
  }

  if (value.length > 50) {
    ctx.addIssue({
      code: z.ZodIssueCode.too_big,
      type: 'string',
      maximum: 50,
      inclusive: true,
      message: 'El nombre de usuario debe tener como máximo 50 caracteres',
    });
  }
});

/**
 * Schema para login
 */
export const loginSchema = z.object({
  username: loginIdentifierSchema.optional(),
  email: z.string().email('Formato de email inválido').max(255).toLowerCase().trim().optional(),
  identifier: loginIdentifierSchema.optional(),
  password: z.string().min(8).max(128)
}).refine((data) => Boolean(data.username || data.email || data.identifier), {
  message: 'El identificador de acceso es obligatorio',
  path: ['username'],
});

/**
 * Schema para registro
 */
export const registerSchema = z.object({
  username: z.string()
    .min(3, 'El nombre de usuario debe tener al menos 3 caracteres')
    .max(50, 'El nombre de usuario debe tener como máximo 50 caracteres')
    .regex(/^[a-zA-Z0-9_-]+$/, 'El nombre de usuario solo puede contener letras, números, guiones bajos y guiones')
    .trim(),
  email: z.string()
    .email('Formato de email inválido')
    .max(255)
    .toLowerCase()
    .trim(),
  password: z.string().min(6).max(128),
  fullName: z.string().max(255).trim().optional(),
  adminSecret: z.string().optional() // Secret para crear admin (solo funciona si coincide con ADMIN_REGISTRATION_SECRET)
});

/**
 * Schema para cambio de contraseña
 */
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(128)
    .regex(/[A-Z]/, 'La contraseña debe contener al menos una letra mayúscula')
    .regex(/[a-z]/, 'La contraseña debe contener al menos una letra minúscula')
    .regex(/[0-9]/, 'La contraseña debe contener al menos un número')
});
