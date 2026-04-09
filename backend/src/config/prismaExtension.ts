import { PrismaClient } from '@prisma/client';

/**
 * Prisma Client con extensión para transformar BigInt a string
 * Esto soluciona el problema de serialización JSON de BigInt
 * 
 * IMPORTANTE: Esta extensión SOLO agrega transformaciones, NO reemplaza los modelos
 * Todos los modelos de Prisma siguen disponibles (User, Document, Notification, etc.)
 */
const prismaBase = new PrismaClient();

// Extender Prisma con transformaciones de BigInt
export const prisma = prismaBase.$extends({
  result: {
    document: {
      size: {
        needs: { size: true },
        compute(document) {
          return document.size ? document.size.toString() : '0';
        }
      }
    },
    event: {
      gasUsed: {
        needs: { gasUsed: true },
        compute(event) {
          return event.gasUsed ? event.gasUsed.toString() : null;
        }
      }
    },
    userStats: {
      totalSize: {
        needs: { totalSize: true },
        compute(stats) {
          return stats.totalSize ? stats.totalSize.toString() : '0';
        }
      }
    },
    systemStats: {
      totalStorage: {
        needs: { totalStorage: true },
        compute(stats) {
          return stats.totalStorage ? stats.totalStorage.toString() : '0';
        }
      },
      newStorage: {
        needs: { newStorage: true },
        compute(stats) {
          return stats.newStorage ? stats.newStorage.toString() : '0';
        }
      }
    }
  }
});

// Tipo del cliente extendido que incluye todos los modelos de Prisma
export type ExtendedPrismaClient = typeof prisma;

export default prisma;
