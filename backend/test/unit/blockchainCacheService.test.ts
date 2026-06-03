jest.mock('../../src/config/blockchain', () => ({
  __esModule: true,
  getContracts: jest.fn(),
}));

import { BlockchainCacheService } from '../../src/services/blockchainCacheService';
import { getContracts } from '../../src/config/blockchain';
import { ethers } from 'ethers';

describe('BlockchainCacheService', () => {
  let mockGetDocument: jest.Mock;

  const defaultDoc = {
    owner: '0xUser1',
    isArchived: false,
    isDeleted: false,
    latestVersion: 3n,
    updatedAt: 1000n,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    BlockchainCacheService.invalidateAll();

    mockGetDocument = jest.fn().mockResolvedValue(defaultDoc);
    (getContracts as jest.Mock).mockReturnValue({
      documentRegistry: { getDocument: mockGetDocument },
    });
  });

  describe('getDocumentState', () => {
    it('should return document state from blockchain on first call', async () => {
      const state = await BlockchainCacheService.getDocumentState('0xDoc1');

      expect(state.isArchived).toBe(false);
      expect(state.isDeleted).toBe(false);
      expect(state.currentVersion).toBe(3);
      expect(state.owner).toBe('0xUser1');
      expect(state.updatedAt).toBe(1000);
      expect(mockGetDocument).toHaveBeenCalledWith('0xDoc1');
    });

    it('should cache results within TTL and avoid redundant blockchain calls', async () => {
      await BlockchainCacheService.getDocumentState('0xDoc1');
      await BlockchainCacheService.getDocumentState('0xDoc1');
      await BlockchainCacheService.getDocumentState('0xDoc1');

      expect(mockGetDocument).toHaveBeenCalledTimes(1);
    });

    it('should cache different documents independently', async () => {
      mockGetDocument
        .mockResolvedValueOnce(defaultDoc)
        .mockResolvedValueOnce({
          owner: '0xUser2',
          isArchived: true,
          isDeleted: false,
          latestVersion: 1n,
          updatedAt: 2000n,
        });

      await BlockchainCacheService.getDocumentState('0xDoc1');
      await BlockchainCacheService.getDocumentState('0xDoc2');
      await BlockchainCacheService.getDocumentState('0xDoc1'); // should be cached

      expect(mockGetDocument).toHaveBeenCalledTimes(2);
    });

    it('should return deleted=true and zeroed fields when owner is ZeroAddress', async () => {
      mockGetDocument.mockResolvedValueOnce({
        owner: ethers.ZeroAddress,
        isArchived: false,
        isDeleted: false,
        latestVersion: 0n,
        updatedAt: 0n,
      });

      const state = await BlockchainCacheService.getDocumentState('0xDeleted');

      expect(state.isDeleted).toBe(true);
      expect(state.isArchived).toBe(false);
      expect(state.owner).toBe(ethers.ZeroAddress);
      expect(state.currentVersion).toBe(0);
      expect(state.updatedAt).toBe(0);
    });

    it('should return archived=true when document is archived on chain', async () => {
      mockGetDocument.mockResolvedValueOnce({
        ...defaultDoc,
        isArchived: true,
        latestVersion: 5n,
      });

      const state = await BlockchainCacheService.getDocumentState('0xArchived');

      expect(state.isArchived).toBe(true);
      expect(state.isDeleted).toBe(false);
      expect(state.currentVersion).toBe(5);
    });

    it('should convert BigInt fields to Number', async () => {
      mockGetDocument.mockResolvedValueOnce({
        ...defaultDoc,
        latestVersion: 123456789n,
        updatedAt: 9876543210n,
      });

      const state = await BlockchainCacheService.getDocumentState('0xLarge');

      expect(typeof state.currentVersion).toBe('number');
      expect(state.currentVersion).toBe(123456789);
      expect(typeof state.updatedAt).toBe('number');
      expect(state.updatedAt).toBe(9876543210);
    });
  });

  describe('getOperationalVersionNumber', () => {
    it('should return currentVersion from the resolved document state', async () => {
      const version = await BlockchainCacheService.getOperationalVersionNumber('0xDoc1');
      expect(version).toBe(3);
    });

    it('should return 0 when latestVersion is 0', async () => {
      mockGetDocument.mockResolvedValueOnce({
        ...defaultDoc,
        latestVersion: 0n,
      });

      const version = await BlockchainCacheService.getOperationalVersionNumber('0xNew');
      expect(version).toBe(0);
    });

    it('should use cache when called multiple times', async () => {
      await BlockchainCacheService.getOperationalVersionNumber('0xDoc1');
      await BlockchainCacheService.getOperationalVersionNumber('0xDoc1');

      expect(mockGetDocument).toHaveBeenCalledTimes(1);
    });
  });

  describe('batchGetDocumentStates', () => {
    it('should return states for multiple documents', async () => {
      mockGetDocument
        .mockResolvedValueOnce(defaultDoc)
        .mockResolvedValueOnce({
          owner: '0xUser2',
          isArchived: true,
          isDeleted: false,
          latestVersion: 1n,
          updatedAt: 2000n,
        });

      const states = await BlockchainCacheService.batchGetDocumentStates(['0xDoc1', '0xDoc2']);

      expect(states.size).toBe(2);
      expect(states.get('0xDoc1')?.currentVersion).toBe(3);
      expect(states.get('0xDoc2')?.currentVersion).toBe(1);
      expect(states.get('0xDoc2')?.isArchived).toBe(true);
    });

    it('should handle empty array', async () => {
      const states = await BlockchainCacheService.batchGetDocumentStates([]);

      expect(states.size).toBe(0);
      expect(mockGetDocument).not.toHaveBeenCalled();
    });

    it('should use cache for already-fetched documents', async () => {
      await BlockchainCacheService.getDocumentState('0xDoc1');

      // Reset call history before batch operation to isolate batch calls
      mockGetDocument.mockClear();

      mockGetDocument.mockResolvedValueOnce({
        owner: '0xUser2',
        isArchived: false,
        isDeleted: false,
        latestVersion: 1n,
        updatedAt: 2000n,
      });

      const states = await BlockchainCacheService.batchGetDocumentStates(['0xDoc1', '0xDoc2']);

      // 0xDoc1 should come from cache, only 0xDoc2 triggers a fresh fetch
      expect(mockGetDocument).toHaveBeenCalledTimes(1);
      expect(mockGetDocument).toHaveBeenCalledWith('0xDoc2');
      expect(states.size).toBe(2);
    });

    it('should continue on individual fetch errors without failing', async () => {
      mockGetDocument
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          owner: '0xUser2',
          isArchived: false,
          isDeleted: false,
          latestVersion: 1n,
          updatedAt: 2000n,
        });

      const states = await BlockchainCacheService.batchGetDocumentStates(['0xBad', '0xGood']);

      expect(states.size).toBe(1);
      expect(states.get('0xGood')?.currentVersion).toBe(1);
      expect(states.has('0xBad')).toBe(false);
    });

    it('should return empty map when all fetches fail', async () => {
      mockGetDocument
        .mockRejectedValueOnce(new Error('Error 1'))
        .mockRejectedValueOnce(new Error('Error 2'));

      const states = await BlockchainCacheService.batchGetDocumentStates(['0xBad1', '0xBad2']);

      expect(states.size).toBe(0);
    });
  });

  describe('isDocumentArchived / isDocumentDeleted', () => {
    it('should return false for an active document', async () => {
      expect(await BlockchainCacheService.isDocumentArchived('0xDoc1')).toBe(false);
      expect(await BlockchainCacheService.isDocumentDeleted('0xDoc1')).toBe(false);
    });

    it('should return true when document is flagged archived on chain', async () => {
      mockGetDocument.mockResolvedValueOnce({ ...defaultDoc, isArchived: true });

      expect(await BlockchainCacheService.isDocumentArchived('0xArchived')).toBe(true);
      expect(await BlockchainCacheService.isDocumentDeleted('0xArchived')).toBe(false);
    });

    it('should return true when document is flagged deleted on chain', async () => {
      mockGetDocument.mockResolvedValueOnce({ ...defaultDoc, isDeleted: true });

      expect(await BlockchainCacheService.isDocumentDeleted('0xDeletedOnChain')).toBe(true);
      expect(await BlockchainCacheService.isDocumentArchived('0xDeletedOnChain')).toBe(false);
    });

    it('should return true for isDocumentDeleted when owner is ZeroAddress', async () => {
      mockGetDocument.mockResolvedValueOnce({
        owner: ethers.ZeroAddress,
        isArchived: false,
        isDeleted: false,
        latestVersion: 0n,
        updatedAt: 0n,
      });

      expect(await BlockchainCacheService.isDocumentDeleted('0xZeroAddr')).toBe(true);
    });
  });

  describe('invalidate / invalidateAll', () => {
    it('should remove a specific entry causing a refetch on next access', async () => {
      await BlockchainCacheService.getDocumentState('0xDoc1');
      expect(mockGetDocument).toHaveBeenCalledTimes(1);

      BlockchainCacheService.invalidate('0xDoc1');

      await BlockchainCacheService.getDocumentState('0xDoc1');
      expect(mockGetDocument).toHaveBeenCalledTimes(2);
    });

    it('should not affect other entries when invalidating a single key', async () => {
      mockGetDocument
        .mockResolvedValueOnce(defaultDoc)
        .mockResolvedValueOnce({ ...defaultDoc, owner: '0xUser2' });

      await BlockchainCacheService.getDocumentState('0xDoc1');
      await BlockchainCacheService.getDocumentState('0xDoc2');
      expect(mockGetDocument).toHaveBeenCalledTimes(2);

      BlockchainCacheService.invalidate('0xDoc1');

      await BlockchainCacheService.getDocumentState('0xDoc1'); // should refetch
      await BlockchainCacheService.getDocumentState('0xDoc2'); // should be cached
      expect(mockGetDocument).toHaveBeenCalledTimes(3);
    });

    it('should clear all cache entries', async () => {
      await BlockchainCacheService.getDocumentState('0xDoc1');
      await BlockchainCacheService.getDocumentState('0xDoc2');
      expect(mockGetDocument).toHaveBeenCalledTimes(2);

      BlockchainCacheService.invalidateAll();

      await BlockchainCacheService.getDocumentState('0xDoc1');
      await BlockchainCacheService.getDocumentState('0xDoc2');
      expect(mockGetDocument).toHaveBeenCalledTimes(4);
    });
  });
});
