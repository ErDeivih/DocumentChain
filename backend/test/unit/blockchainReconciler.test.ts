jest.mock('../../src/config/database', () => ({
  __esModule: true,
  default: {
    document: { findMany: jest.fn(), update: jest.fn() },
    event: { create: jest.fn() },
    wallet: { findFirst: jest.fn() },
  },
}));

jest.mock('../../src/services/blockchainCacheService', () => ({
  __esModule: true,
  BlockchainCacheService: {
    batchGetDocumentStates: jest.fn(),
    invalidateAll: jest.fn(),
  },
}));

import prisma from '../../src/config/database';
import { BlockchainReconciler } from '../../src/workers/blockchainReconciler';
import { BlockchainCacheService } from '../../src/services/blockchainCacheService';
import { ethers } from 'ethers';

describe('BlockchainReconciler', () => {
  let mockFindMany: jest.Mock;
  let mockUpdate: jest.Mock;
  let mockCreate: jest.Mock;
  let mockFindFirst: jest.Mock;
  let mockBatchGetDocumentStates: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    BlockchainReconciler.stop();

    mockFindMany = prisma.document.findMany as jest.Mock;
    mockUpdate = prisma.document.update as jest.Mock;
    mockCreate = prisma.event.create as jest.Mock;
    mockFindFirst = prisma.wallet.findFirst as jest.Mock;
    mockBatchGetDocumentStates = BlockchainCacheService.batchGetDocumentStates as jest.Mock;
  });

  it('should be defined', () => {
    expect(BlockchainReconciler).toBeDefined();
  });

  describe('start / stop', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should start without throwing', () => {
      expect(() => BlockchainReconciler.start()).not.toThrow();
    });

    it('should stop without throwing when started', () => {
      BlockchainReconciler.start();
      expect(() => BlockchainReconciler.stop()).not.toThrow();
    });

    it('should stop cleanly when already stopped', () => {
      expect(() => BlockchainReconciler.stop()).not.toThrow();
      expect(() => BlockchainReconciler.stop()).not.toThrow();
    });
  });

  describe('reconcile', () => {
    it('should skip when no synced documents exist', async () => {
      mockFindMany.mockResolvedValue([]);

      await (BlockchainReconciler as any).reconcile();

      expect(mockFindMany).toHaveBeenCalledWith({
        where: { blockchainStatus: 'SYNCED', blockchainId: { not: null } },
        select: { id: true, blockchainId: true, ownerId: true },
      });
      expect(mockBatchGetDocumentStates).not.toHaveBeenCalled();
      expect(mockUpdate).not.toHaveBeenCalled();
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it('should process documents with matching owners and make no corrections', async () => {
      mockFindMany.mockResolvedValue([
        { id: 'doc-1', blockchainId: '0xBlockchain1', ownerId: 'user-1' },
      ]);

      mockBatchGetDocumentStates.mockResolvedValue(
        new Map([
          ['0xBlockchain1', { owner: '0xOwner1', isArchived: false, isDeleted: false, currentVersion: 3, updatedAt: 1000 }],
        ])
      );

      mockFindFirst.mockResolvedValue({ userId: 'user-1' });

      await (BlockchainReconciler as any).reconcile();

      expect(mockUpdate).not.toHaveBeenCalled();
      expect(mockCreate).not.toHaveBeenCalled();
      expect(BlockchainCacheService.invalidateAll).toHaveBeenCalledTimes(1);
    });

    it('should correct owner when chain owner differs from DB ownerId', async () => {
      mockFindMany.mockResolvedValue([
        { id: 'doc-1', blockchainId: '0xBlockchain1', ownerId: 'user-old' },
      ]);

      mockBatchGetDocumentStates.mockResolvedValue(
        new Map([
          ['0xBlockchain1', { owner: '0xNewOwner', isArchived: false, isDeleted: false, currentVersion: 3, updatedAt: 1000 }],
        ])
      );

      mockFindFirst.mockResolvedValue({ userId: 'user-new' });

      await (BlockchainReconciler as any).reconcile();

      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: 'doc-1' },
        data: { ownerId: 'user-new' },
      });
      expect(mockCreate).toHaveBeenCalledTimes(1);
      expect(mockCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          eventType: 'OWNER_RECONCILED',
          documentId: 'doc-1',
          metadata: {
            previousOwnerId: 'user-old',
            newOwnerId: 'user-new',
            onChainOwner: '0xNewOwner',
          },
        }),
      });
      expect(BlockchainCacheService.invalidateAll).toHaveBeenCalled();
    });

    it('should not update if the on-chain owner wallet is not found in DB', async () => {
      mockFindMany.mockResolvedValue([
        { id: 'doc-1', blockchainId: '0xBlockchain1', ownerId: 'user-old' },
      ]);

      mockBatchGetDocumentStates.mockResolvedValue(
        new Map([
          ['0xBlockchain1', { owner: '0xUnknown', isArchived: false, isDeleted: false, currentVersion: 3, updatedAt: 1000 }],
        ])
      );

      mockFindFirst.mockResolvedValue(null);

      await (BlockchainReconciler as any).reconcile();

      expect(mockUpdate).not.toHaveBeenCalled();
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it('should skip documents with ZeroAddress owner', async () => {
      mockFindMany.mockResolvedValue([
        { id: 'doc-1', blockchainId: '0xBlockchain1', ownerId: 'user-old' },
      ]);

      mockBatchGetDocumentStates.mockResolvedValue(
        new Map([
          ['0xBlockchain1', { owner: ethers.ZeroAddress, isArchived: false, isDeleted: false, currentVersion: 0, updatedAt: 0 }],
        ])
      );

      await (BlockchainReconciler as any).reconcile();

      expect(mockFindFirst).not.toHaveBeenCalled();
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('should skip documents missing from blockchain state', async () => {
      mockFindMany.mockResolvedValue([
        { id: 'doc-1', blockchainId: '0xNotFound', ownerId: 'user-1' },
      ]);

      mockBatchGetDocumentStates.mockResolvedValue(new Map());

      await (BlockchainReconciler as any).reconcile();

      expect(mockFindFirst).not.toHaveBeenCalled();
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('should handle multiple documents in a single reconcile cycle', async () => {
      mockFindMany.mockResolvedValue([
        { id: 'doc-1', blockchainId: '0xB1', ownerId: 'user-1' },
        { id: 'doc-2', blockchainId: '0xB2', ownerId: 'user-2' },
        { id: 'doc-3', blockchainId: '0xB3', ownerId: 'user-old' },
      ]);

      mockBatchGetDocumentStates.mockResolvedValue(
        new Map([
          ['0xB1', { owner: '0xOwner1', isArchived: false, isDeleted: false, currentVersion: 1, updatedAt: 1000 }],
          ['0xB2', { owner: '0xOwner2', isArchived: false, isDeleted: false, currentVersion: 1, updatedAt: 1000 }],
          ['0xB3', { owner: '0xOwner3', isArchived: false, isDeleted: false, currentVersion: 1, updatedAt: 1000 }],
        ])
      );

      mockFindFirst
        .mockResolvedValueOnce({ userId: 'user-1' }) // doc-1: match
        .mockResolvedValueOnce({ userId: 'user-2' }) // doc-2: match
        .mockResolvedValueOnce({ userId: 'user-new' }); // doc-3: mismatch

      await (BlockchainReconciler as any).reconcile();

      expect(mockUpdate).toHaveBeenCalledTimes(1);
      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: 'doc-3' },
        data: { ownerId: 'user-new' },
      });
      expect(mockCreate).toHaveBeenCalledTimes(1);
    });

    it('should handle errors gracefully and log them', async () => {
      mockFindMany.mockRejectedValue(new Error('Database connection error'));

      await expect(
        (BlockchainReconciler as any).reconcile()
      ).resolves.toBeUndefined();

      expect(BlockchainCacheService.invalidateAll).not.toHaveBeenCalled();
    });
  });
});
