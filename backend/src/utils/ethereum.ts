import { ethers } from 'ethers';

/**
 * Normaliza una dirección Ethereum comprobando su validez y aplicando el checksum EIP-55.
 *
 * @param address - Dirección Ethereum a normalizar.
 * @returns Dirección normalizada con checksum, o `null` si no es válida.
 */
export function normalizeEthereumAddress(address: string | null | undefined): string | null {
  if (!address || !ethers.isAddress(address)) {
    return null;
  }

  return ethers.getAddress(address);
}