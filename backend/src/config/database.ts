import { PrismaClient } from '@prisma/client';
import { prisma as prismaExtended } from './prismaExtension';

// Exportar la instancia extendida con transformación de BigInt (singleton)
export default prismaExtended;

/**
 * Disconnect from database
 * Should be called on application shutdown
 */
export async function disconnectDatabase(): Promise<void> {
  await prismaExtended.$disconnect();
}
