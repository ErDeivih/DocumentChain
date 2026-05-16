/**
 * Unit tests for useSigner hook.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSigner } from '../hooks/useSigner';

// Mock blockchain provider
vi.mock('../lib/blockchain/provider', () => ({
  blockchainProvider: {
    getSigner: vi.fn(),
  },
}));

// Mock DocumentRegistryContract
vi.mock('../lib/blockchain/contracts', () => ({
  DocumentRegistryContract: vi.fn(),
}));

import { blockchainProvider } from '../lib/blockchain/provider';

describe('useSigner', () => {
  const mockAddress = '0x1234567890123456789012345678901234567890';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getVerifiedSigner', () => {
    it('throws if no signer available', async () => {
      (blockchainProvider.getSigner as any).mockReturnValue(null);
      const { result } = renderHook(() => useSigner());
      
      await expect(result.current.getVerifiedSigner(mockAddress)).rejects.toThrow('No signer available');
    });

    it('throws if connected wallet does not match', async () => {
      const mockSigner = {
        getAddress: vi.fn().mockResolvedValue('0xdifferent'),
      };
      (blockchainProvider.getSigner as any).mockReturnValue(mockSigner);
      const { result } = renderHook(() => useSigner());
      
      await expect(result.current.getVerifiedSigner(mockAddress)).rejects.toThrow('does not match');
    });

    it('returns signer when address matches', async () => {
      const mockSigner = {
        getAddress: vi.fn().mockResolvedValue(mockAddress),
      };
      (blockchainProvider.getSigner as any).mockReturnValue(mockSigner);
      const { result } = renderHook(() => useSigner());
      
      const signer = await result.current.getVerifiedSigner(mockAddress);
      expect(signer).toBe(mockSigner);
    });

    it('is case-insensitive for address matching', async () => {
      const mockSigner = {
        getAddress: vi.fn().mockResolvedValue(mockAddress.toUpperCase()),
      };
      (blockchainProvider.getSigner as any).mockReturnValue(mockSigner);
      const { result } = renderHook(() => useSigner());
      
      const signer = await result.current.getVerifiedSigner(mockAddress.toLowerCase());
      expect(signer).toBe(mockSigner);
    });
  });
});
