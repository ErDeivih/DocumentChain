import prisma from '../config/database';
import { normalizeEthereumAddress } from './ethereum';

export interface WalletDTO {
  id: string;
  address: string;
  label: string | null;
  isPrimary: boolean;
}

export function toWalletDTO(wallet: {
  id: string;
  walletAddress: string;
  nickname: string | null;
  isPrimary: boolean;
}): WalletDTO {
  return {
    id: wallet.id,
    address: wallet.walletAddress,
    label: wallet.nickname,
    isPrimary: wallet.isPrimary,
  };
}

export async function findUserByWalletAddress(
  address: string
): Promise<{ id: string; username: string; fullName: string | null; role: string } | null> {
  const normalized = normalizeEthereumAddress(address);
  if (!normalized) return null;

  const wallet = await prisma.wallet.findFirst({
    where: {
      walletAddress: {
        equals: normalized,
        mode: 'insensitive',
      },
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          fullName: true,
          role: true,
        },
      },
    },
  });

  return wallet?.user ?? null;
}

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

export async function getUserWithPublicKey(
  userId: string
): Promise<{ id: string; publicKey: string }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, publicKey: true },
  });

  if (!user || !user.publicKey) {
    throw new Error('Usuario no tiene clave pública configurada');
  }

  return { id: user.id, publicKey: user.publicKey };
}

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
