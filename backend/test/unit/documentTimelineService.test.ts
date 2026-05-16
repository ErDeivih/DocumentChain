jest.mock('../../src/config/database', () => ({
  __esModule: true,
  default: {
    document: {
      findUnique: jest.fn(),
    },
    wallet: {
      findFirst: jest.fn(),
    },
    version: {
      findMany: jest.fn(),
    },
    documentSignature: {
      findMany: jest.fn(),
    },
    event: {
      findMany: jest.fn(),
    },
    user: {
      findMany: jest.fn(),
    },
  },
}));

jest.mock('../../src/lib/blockchain/queries', () => ({
  BlockchainQueries: {
    canRead: jest.fn(),
    isOwner: jest.fn(),
  },
}));

import prisma from '../../src/config/database';
import { BlockchainQueries } from '../../src/lib/blockchain/queries';
import { DocumentTimelineService } from '../../src/services/documentTimelineService';

const mockPrisma = prisma as any;
const mockBlockchainQueries = BlockchainQueries as jest.Mocked<typeof BlockchainQueries>;

describe('DocumentTimelineService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('builds a timeline from persisted document, signature, share and transfer events', async () => {
    mockPrisma.document.findUnique.mockResolvedValue({
      id: 'doc-1',
      blockchainId: 'chain-doc-1',
      ownerId: 'owner-1',
    } as any);
    mockPrisma.wallet.findFirst.mockResolvedValue({
      walletAddress: '0xabc',
    } as any);
    mockBlockchainQueries.isOwner.mockResolvedValue(true);
    mockPrisma.version.findMany.mockResolvedValue([
      {
        id: 'version-1',
        versionNumber: 2,
        comment: 'Nueva revisión',
        isOperational: false,
        createdAt: new Date('2026-04-05T10:05:00Z'),
        blockchainTxHash: '0xversion',
        user: {
          id: 'owner-1',
          username: 'owner',
          fullName: 'Owner User',
        },
      },
    ] as any);
    mockPrisma.documentSignature.findMany.mockResolvedValue([
      {
        id: 'signature-1',
        signedAt: new Date('2026-04-05T10:06:00Z'),
        blockchainTxHash: '0xsignature',
        user: {
          id: 'owner-1',
          username: 'owner',
          fullName: 'Owner User',
        },
        signerWallet: {
          walletAddress: '0xabc',
        },
        version: {
          versionNumber: 2,
        },
      },
    ] as any);
    mockPrisma.event.findMany
      .mockResolvedValueOnce([
        {
          id: 'event-share',
          eventType: 'SHARE_CONFIRMED',
          createdAt: new Date('2026-04-05T10:07:00Z'),
          blockTimestamp: null,
          transactionHash: '0xshare',
          metadata: {
            recipientId: 'recipient-1',
            role: 'SHARED_WRITE',
          },
          user: {
            id: 'owner-1',
            username: 'owner',
            fullName: 'Owner User',
          },
        },
      ] as any)
      .mockResolvedValueOnce([
        {
          id: 'event-transfer',
          eventType: 'TRANSFER_CONFIRMED',
          createdAt: new Date('2026-04-05T10:08:00Z'),
          blockTimestamp: null,
          transactionHash: '0xtransfer',
          metadata: {
            previousOwner: 'owner-1',
            newOwner: 'recipient-1',
          },
          user: {
            id: 'recipient-1',
            username: 'recipient',
            fullName: 'Recipient User',
          },
        },
        {
          id: 'event-operational',
          eventType: 'OperationalVersionChanged',
          createdAt: new Date('2026-04-05T10:09:00Z'),
          blockTimestamp: null,
          transactionHash: '0xoperational',
          metadata: {
            oldVersion: 1,
            newVersion: 2,
          },
          user: {
            id: 'owner-1',
            username: 'owner',
            fullName: 'Owner User',
          },
        },
      ] as any);
    mockPrisma.user.findMany
      .mockResolvedValueOnce([
        {
          id: 'recipient-1',
          username: 'recipient',
          fullName: 'Recipient User',
        },
      ] as any)
      .mockResolvedValueOnce([
        {
          id: 'owner-1',
          username: 'owner',
          fullName: 'Owner User',
        },
        {
          id: 'recipient-1',
          username: 'recipient',
          fullName: 'Recipient User',
        },
      ] as any);

    const timeline = await DocumentTimelineService.getDocumentTimeline('doc-1', 'owner-1');

    expect(timeline.events.map((event) => event.type)).toEqual([
      'operational_changed',
      'ownership_transferred',
      'document_shared',
      'document_signed',
      'version_created',
    ]);
    expect(timeline.events[1].details).toMatchObject({
      fromOwner: 'Owner User',
      toOwner: 'Recipient User',
    });
    expect(timeline.events[2].details).toMatchObject({
      sharedWith: 'Recipient User',
      role: 'SHARED_WRITE',
    });
  });

  it('checks blockchain permissions for non-owners', async () => {
    mockPrisma.document.findUnique.mockResolvedValue({
      id: 'doc-1',
      blockchainId: 'chain-doc-1',
      ownerId: 'owner-1',
    } as any);
    mockPrisma.wallet.findFirst.mockResolvedValue({
      walletAddress: '0xrecipient',
    } as any);
    mockBlockchainQueries.isOwner.mockResolvedValue(false);
    mockBlockchainQueries.canRead.mockResolvedValue(true);
    mockPrisma.version.findMany.mockResolvedValue([] as any);
    mockPrisma.documentSignature.findMany.mockResolvedValue([] as any);
    mockPrisma.event.findMany.mockResolvedValue([] as any);
    mockPrisma.user.findMany.mockResolvedValue([] as any);

    await DocumentTimelineService.getDocumentTimeline('doc-1', 'recipient-1');

    expect(mockBlockchainQueries.canRead).toHaveBeenCalledWith('chain-doc-1', '0xrecipient');
  });
});