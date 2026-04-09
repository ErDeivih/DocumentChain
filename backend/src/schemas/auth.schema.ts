import { z } from 'zod';

/**
 * Schema para login
 */
export const loginSchema = z.object({
  username: z.string().min(3).max(50).trim(),
  password: z.string().min(8).max(128)
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
