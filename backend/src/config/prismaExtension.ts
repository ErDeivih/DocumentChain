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
 * de `BigInt` a `number` para facilitar su serialización.
 * El límite de subida es 100 MB, por lo que no hay riesgo de pérdida de precisión.
 */
export const prisma = prismaBase.$extends({
  result: {
    document: {
      size: {
        needs: { size: true },
        compute(document) {
          return document.size ? Number(document.size) : 0;
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
