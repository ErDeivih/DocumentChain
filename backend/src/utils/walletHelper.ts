import prisma from '../config/database';
import { normalizeEthereumAddress } from './ethereum';

/**
 * Verifica que una wallet existe y pertenece al usuario dado.
 * @param walletId - Identificador unico de la wallet.
 * @param userId - Identificador unico del usuario.
 * @returns El registro de la wallet.
 * @throws Si la wallet no existe o no pertenece al usuario.
 */
export async function validateWalletBelongsToUser(
  walletId: string,
  userId: string
): Promise<{ id: string; walletAddress: string; isPrimary: boolean; nickname: string | null }> {
  const wallet = await prisma.wallet.findFirst({
    where: { id: walletId, userId },
  });

  if (!wallet) {
    throw new Error('Wallet no encontrada o no pertenece al usuario');
  }

  return wallet;
}

/**
 * Construye un filtro Prisma `OR` para coincidencia insensible a mayusculas de las direcciones dadas.
 * @param addresses - Array de direcciones de wallet a incluir en el filtro.
 * @returns Un objeto de filtro compatible con Prisma.
 */
export function buildInsensitiveWalletFilter(addresses: string[]) {
  return {
    OR: addresses.map((address) => ({
      walletAddress: {
        equals: address,
        mode: 'insensitive' as const,
      },
    })),
  };
}
