import { ethers } from 'ethers';

export function normalizeEthereumAddress(address: string | null | undefined): string | null {
  if (!address || !ethers.isAddress(address)) {
    return null;
  }

  return ethers.getAddress(address);
}