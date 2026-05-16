import { PrismaClient } from '@prisma/client';

/**
 * Cliente Prisma con extensión para transformar valores `BigInt` a `string`.
 * Resuelve el problema de serialización JSON de tipos `BigInt`.
 *
 * IMPORTANTE: Esta extensión únicamente añade transformaciones, no reemplaza los modelos.
 * Todos los modelos de Prisma siguen disponibles (`User`, `Document`, `Notification`, etc.).
 */
const prismaBase = new PrismaClient();

/**
 * Extensión del cliente Prisma que transforma el campo `size` del modelo `document`
 * de `BigInt` a `string` para facilitar su serialización.
 */
export const prisma = prismaBase.$extends({
  result: {
    document: {
      size: {
        needs: { size: true },
        compute(document) {
          return document.size ? document.size.toString() : '0';
        }
      }
    }
  }
});

/**
 * Tipo que representa el cliente Prisma extendido, incluyendo todos sus modelos.
 */
export type ExtendedPrismaClient = typeof prisma;

export default prisma;
