import { beforeEach, describe, expect, it, jest } from '@jest/globals';

jest.mock('../../src/config/database', () => ({
  __esModule: true,
  default: {
    document: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    wallet: {
      findFirst: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    event: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock('../../src/services/documentPermissionService', () => ({
  DocumentPermissionService: {
    getDocumentUsersWithRoles: jest.fn(),
  },
  DocumentRole: {
    NONE: 0,
    VIEWER: 1,
    EDITOR: 2,
    OWNER: 3,
  },
}));

jest.mock('../../src/services/notificationService', () => ({
  __esModule: true,
  default: {
    createNotification: jest.fn(),
  },
  NotificationType: {
    FILE_SHARED: 'FILE_SHARED',
    SHARE_REVOKED: 'SHARE_REVOKED',
  },
}));

jest.mock('../../src/lib/encryption', () => ({
  encryptSymmetricKey: jest.fn(),
}));

jest.mock('../../src/utils/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

import prisma from '../../src/config/database';
import { DocumentPermissionService } from '../../src/services/documentPermissionService';
import notificationService from '../../src/services/notificationService';
import { ShareService } from '../../src/services/shareService';

const mockPrisma = prisma as any;
const mockPermissions = DocumentPermissionService as jest.Mocked<typeof DocumentPermissionService>;
const mockNotifications = notificationService as jest.Mocked<typeof notificationService>;

describe('ShareService revocation flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('filters revoked shares out of the document share list fallback', async () => {
    mockPrisma.document.findFirst.mockResolvedValue({
      id: 'doc-1',
      ownerId: 'owner-1',
      blockchainId: 'chain-doc-1',
      creatorWalletId: 'wallet-1',
      createdAt: new Date('2026-04-05T12:00:00Z'),
    });
    mockPermissions.getDocumentUsersWithRoles.mockResolvedValue([]);
    mockPrisma.event.findMany.mockResolvedValue([
      {
        id: 'event-revoke',
        eventType: 'SHARE_REVOKED',
        documentId: 'doc-1',
        createdAt: new Date('2026-04-05T12:10:00Z'),
        metadata: {
          shareId: 'share-1',
          recipientId: 'recipient-1',
        },
      },
      {
        id: 'event-confirm',
        eventType: 'SHARE_CONFIRMED',
        documentId: 'doc-1',
        createdAt: new Date('2026-04-05T12:00:00Z'),
        metadata: {
          shareId: 'share-1',
          recipientId: 'recipient-1',
          role: 'SHARED_READ',
        },
      },
    ]);

    const shares = await ShareService.getDocumentShares('doc-1', 'owner-1');

    expect(shares).toEqual([]);
  });

  it('confirms a revocation by persisting the event and notifying the recipient', async () => {
    mockPrisma.event.findMany.mockResolvedValue([
      {
        id: 'prepared-1',
        eventType: 'SHARE_REVOKE_PREPARED',
        documentId: 'doc-1',
        metadata: {
          shareId: 'share-1',
          recipientId: 'recipient-1',
        },
      },
    ]);
    mockPrisma.document.findUnique.mockResolvedValue({
      id: 'doc-1',
      ownerId: 'owner-1',
      name: 'Contrato.pdf',
      owner: {
        username: 'owner-user',
      },
    });

    await ShareService.confirmRevokeShare('share-1', '0xtxhash');

    expect(mockNotifications.createNotification).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'recipient-1',
      type: 'SHARE_REVOKED',
      title: 'Acceso revocado',
    }));
    expect(mockPrisma.event.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        eventType: 'SHARE_REVOKED',
        transactionHash: '0xtxhash',
        documentId: 'doc-1',
      }),
    }));
  });
});