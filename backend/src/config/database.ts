import { prisma as prismaExtended } from './prismaExtension';

/**
 * Instancia extendida de Prisma con transformación de BigInt (singleton).
 */
export default prismaExtended;

/**
 * Cierra la conexión con la base de datos.
 * Debe invocarse durante el apagado de la aplicación.
 */
export async function disconnectDatabase(): Promise<void> {
  await prismaExtended.$disconnect();
}
