jest.mock('../../src/config/database', () => ({
  __esModule: true,
  default: {
    document: { findUnique: jest.fn(), update: jest.fn() },
    event: { create: jest.fn(), findFirst: jest.fn() },
    version: { findFirst: jest.fn(), update: jest.fn(), create: jest.fn() },
    wallet: { findFirst: jest.fn() },
    user: { update: jest.fn() },
    notification: { findFirst: jest.fn() },
    documentSignature: { updateMany: jest.fn() },
    $transaction: jest.fn((fn: any) => fn({
      version: { update: jest.fn(), create: jest.fn() },
      event: { create: jest.fn() },
    })),
  },
}));

jest.mock('../../src/services/notificationService', () => ({
  __esModule: true,
  default: { createNotification: jest.fn().mockResolvedValue(undefined) },
  NotificationType: {
    BLOCKCHAIN_CONFIRMED: 'BLOCKCHAIN_CONFIRMED',
    NEW_VERSION: 'NEW_VERSION',
    FILE_SIGNED: 'FILE_SIGNED',
    FILE_DELETED: 'FILE_DELETED',
    FILE_ARCHIVED: 'FILE_ARCHIVED',
    FILE_UPDATED: 'FILE_UPDATED',
    FILE_SHARED: 'FILE_SHARED',
    SHARE_REVOKED: 'SHARE_REVOKED',
    SYSTEM: 'SYSTEM',
  },
}));

jest.mock('../../src/services/webSocketService', () => ({
  __esModule: true,
  default: { sendToUser: jest.fn() },
}));

jest.mock('../../src/services/blockchainCacheService', () => ({
  __esModule: true,
  BlockchainCacheService: { invalidate: jest.fn() },
}));

jest.mock('../../src/utils/logger', () => ({
  logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
}));

jest.mock('../../src/utils/ethereum', () => ({
  normalizeEthereumAddress: jest.fn((addr: string) => addr?.toLowerCase()),
}));

jest.mock('../../src/utils/walletHelper', () => ({
  findUserByWalletAddress: jest.fn(),
}));

import prisma from '../../src/config/database';
import {
  handleDocumentCreated,
  handleDocumentArchived,
  handleDocumentDeleted,
  handleOwnershipTransferred,
  handleVersionCreated,
  handleOperationalVersionChanged,
} from '../../src/services/eventHandlers';
import { findUserByWalletAddress } from '../../src/utils/walletHelper';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockFindUser = findUserByWalletAddress as jest.Mock;

const baseEvent = { blockNumber: 100, transactionHash: '0xabc' };

describe('EventHandlers', () => {
  beforeEach(() => jest.clearAllMocks());

  it('handleDocumentCreated sets SYNCED', async () => {
    (mockPrisma.document.update as jest.Mock).mockResolvedValue({
      id: 'doc-1', ownerId: 'user-1', name: 'Test',
    });
    await handleDocumentCreated({ docId: 'bc-1' }, baseEvent);
    expect(mockPrisma.document.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ blockchainStatus: 'SYNCED' }) })
    );
  });

  it('handleDocumentArchived creates event', async () => {
    (mockPrisma.document.findUnique as jest.Mock).mockResolvedValue({
      id: 'doc-1', ownerId: 'user-1', name: 'Test', blockchainId: 'bc-1',
    });
    await handleDocumentArchived({ docId: 'bc-1', archived: true, by: '0x1', timestamp: '1700000000' }, baseEvent);
    expect(mockPrisma.event.create).toHaveBeenCalled();
  });

  it('handleDocumentDeleted creates notification and invalidates cache', async () => {
    (mockPrisma.document.findUnique as jest.Mock).mockResolvedValue({
      id: 'doc-1', ownerId: 'user-1', name: 'Test', blockchainId: 'bc-1',
    });
    await handleDocumentDeleted({ docId: 'bc-1' }, baseEvent);
    const { BlockchainCacheService } = require('../../src/services/blockchainCacheService');
    expect(BlockchainCacheService.invalidate).toHaveBeenCalledWith('bc-1');
  });

  it('handleOwnershipTransferred updates owner', async () => {
    (mockPrisma.document.findUnique as jest.Mock).mockResolvedValue({
      id: 'doc-1', ownerId: 'user-1', name: 'Test', blockchainId: 'bc-1',
    });
    mockFindUser.mockResolvedValue({ id: 'user-2', username: 'newowner' });
    (mockPrisma.event.findFirst as jest.Mock).mockResolvedValue({
      metadata: { pendingEncryptedSymmetricKey: 'newkey' },
    });
    await handleOwnershipTransferred(
      { docId: 'bc-1', from: '0x1', to: '0x2', timestamp: '1700000000' }, baseEvent
    );
    expect(mockPrisma.event.create).toHaveBeenCalled();
  });

  it('handleVersionCreated processes version', async () => {
    (mockPrisma.document.findUnique as jest.Mock).mockResolvedValue({
      id: 'doc-1', ownerId: 'user-1', name: 'Test', encryptedSymmetricKey: 'key',
    });
    (mockPrisma.wallet.findFirst as jest.Mock).mockResolvedValue(null);
    (mockPrisma.version.findFirst as jest.Mock).mockResolvedValue(null);
    await handleVersionCreated(
      { docId: 'bc-1', versionNumber: '2', ipfsCid: 'QmNew', createdBy: '0x1' }, baseEvent
    );
    expect(mockPrisma.$transaction).toHaveBeenCalled();
  });

  it('handleOperationalVersionChanged creates event', async () => {
    (mockPrisma.document.findUnique as jest.Mock).mockResolvedValue({
      id: 'doc-1', ownerId: 'user-1', name: 'Test', blockchainId: 'bc-1',
    });
    await handleOperationalVersionChanged(
      { docId: 'bc-1', oldVersion: '1', newVersion: '2', by: '0x1', timestamp: '1700000000' }, baseEvent
    );
    expect(mockPrisma.$transaction).toHaveBeenCalled();
  });
});
