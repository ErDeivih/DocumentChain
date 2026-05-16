import { beforeEach, describe, expect, it, jest } from '@jest/globals';

jest.mock('../../src/config/database', () => ({
  __esModule: true,
  default: {
    document: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
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
    documentShareKey: {
      upsert: jest.fn(),
      findUnique: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
}));

jest.mock('../../src/services/documentPermissionService', () => ({
  DocumentPermissionService: {
    getDocumentUsersWithRoles: jest.fn(),
    isOwner: jest.fn(),
    validateOwnership: jest.fn(),
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

import prisma from '../../src/config/database';
import { DocumentPermissionService } from '../../src/services/documentPermissionService';
import notificationService from '../../src/services/notificationService';
import { ShareService } from '../../src/services/shareService';
import * as Encryption from '../../src/lib/encryption';

const mockPrisma = prisma as any;
const mockPermissions = DocumentPermissionService as jest.Mocked<typeof DocumentPermissionService>;
const mockNotifications = notificationService as jest.Mocked<typeof notificationService>;
const mockEncryptSymmetricKey = Encryption.encryptSymmetricKey as jest.Mock;

describe('ShareService prepareShare', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('prepares share with re-encrypted key for recipient', async () => {
    mockPrisma.document.findUnique.mockResolvedValue({
      id: 'doc-1',
      ownerId: 'user-1',
      blockchainId: '0xbcid',
      isArchived: false,
    });
    mockPrisma.wallet.findFirst.mockResolvedValue({
      id: 'wallet-1',
      userId: 'user-1',
      walletAddress: '0xSharer',
    });
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user-2',
      username: 'recipient',
      fullName: 'Recipient User',
      email: 'rec@example.com',
      publicKey: 'pub-key-2',
      wallets: [{ isPrimary: true, walletAddress: '0xRecipient' }],
    });
    mockEncryptSymmetricKey.mockReturnValue('re-enc-key');
    mockPrisma.event.create.mockResolvedValue({ id: 'event-1' });
    mockPermissions.isOwner.mockResolvedValue(true);
    mockPrisma.documentShareKey.upsert.mockResolvedValue({ id: 'share-key-1' });

    const result = await ShareService.prepareShare({
      documentId: 'doc-1',
      sharedWithUserId: 'user-2',
      role: 'SHARED_READ',
      sharerUserId: 'user-1',
      sharerWalletId: 'wallet-1',
      decryptedSymmetricKey: 'decrypted-key',
    });

    expect(mockEncryptSymmetricKey).toHaveBeenCalledWith('decrypted-key', 'pub-key-2');
    expect(result).toEqual(expect.objectContaining({
      blockchainId: '0xbcid',
      sharedWithAddress: '0xRecipient',
    }));
    expect(mockPrisma.event.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          eventType: 'SHARE_PREPARED',
          documentId: 'doc-1',
        }),
      })
    );
  });

  it('prepares share for public document without re-encryption', async () => {
    mockPrisma.document.findUnique.mockResolvedValue({
      id: 'doc-1',
      ownerId: 'user-1',
      blockchainId: '0xbcid',
      isArchived: false,
      visibility: 'PUBLIC',
    });
    mockPrisma.wallet.findFirst.mockResolvedValue({
      id: 'wallet-1',
      userId: 'user-1',
    });
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user-2',
      username: 'recipient',
      publicKey: 'pub-key-2',
      wallets: [{ walletAddress: '0xRecipient' }],
    });
    mockPrisma.event.create.mockResolvedValue({ id: 'event-1' });
    mockPermissions.isOwner.mockResolvedValue(true);
    mockPrisma.documentShareKey.upsert.mockResolvedValue({ id: 'share-key-1' });

    await ShareService.prepareShare({
      documentId: 'doc-1',
      sharedWithUserId: 'user-2',
      role: 'SHARED_READ',
      sharerUserId: 'user-1',
      sharerWalletId: 'wallet-1',
      decryptedSymmetricKey: 'decrypted-key',
    });

    expect(mockEncryptSymmetricKey).toHaveBeenCalled();
  });

  it('throws if document not found or user is not owner', async () => {
    mockPrisma.document.findUnique.mockResolvedValue(null);

    await expect(
      ShareService.prepareShare({
        documentId: 'doc-1',
        sharedWithUserId: 'user-2',
        role: 'SHARED_READ',
        sharerUserId: 'user-1',
        sharerWalletId: 'wallet-1',
        decryptedSymmetricKey: 'key',
      })
    ).rejects.toThrow('Documento no encontrado');
  });

  it('throws if document has no blockchainId', async () => {
    mockPrisma.document.findUnique.mockResolvedValue({
      id: 'doc-1',
      ownerId: 'user-1',
      blockchainId: null,
      isArchived: false,
    });

    await expect(
      ShareService.prepareShare({
        documentId: 'doc-1',
        sharedWithUserId: 'user-2',
        role: 'SHARED_READ',
        sharerUserId: 'user-1',
        sharerWalletId: 'wallet-1',
        decryptedSymmetricKey: 'key',
      })
    ).rejects.toThrow('El documento no tiene ID de blockchain aún');
  });

  it('throws if recipient has no public key', async () => {
    mockPrisma.document.findUnique.mockResolvedValue({
      id: 'doc-1',
      ownerId: 'user-1',
      blockchainId: '0xbcid',
      isArchived: false,
    });
    mockPrisma.wallet.findFirst.mockResolvedValue({ id: 'wallet-1', userId: 'user-1' });
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user-2',
      publicKey: null,
      wallets: [{ walletAddress: '0xRecipient' }],
    });
    mockPermissions.isOwner.mockResolvedValue(true);

    await expect(
      ShareService.prepareShare({
        documentId: 'doc-1',
        sharedWithUserId: 'user-2',
        role: 'SHARED_READ',
        sharerUserId: 'user-1',
        sharerWalletId: 'wallet-1',
        decryptedSymmetricKey: 'key',
      })
    ).rejects.toThrow('El destinatario no tiene clave pública configurada');
  });

  it('throws if recipient has no wallet', async () => {
    mockPrisma.document.findUnique.mockResolvedValue({
      id: 'doc-1',
      ownerId: 'user-1',
      blockchainId: '0xbcid',
      isArchived: false,
    });
    mockPrisma.wallet.findFirst.mockResolvedValue({ id: 'wallet-1', userId: 'user-1' });
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user-2',
      publicKey: 'pub-key-2',
      wallets: [],
    });
    mockPermissions.isOwner.mockResolvedValue(true);

    await expect(
      ShareService.prepareShare({
        documentId: 'doc-1',
        sharedWithUserId: 'user-2',
        role: 'SHARED_READ',
        sharerUserId: 'user-1',
        sharerWalletId: 'wallet-1',
        decryptedSymmetricKey: 'key',
      })
    ).rejects.toThrow('El destinatario no tiene wallet configurada');
  });
});

describe('ShareService confirmShare', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('confirms share and sends notification', async () => {
    mockPrisma.event.findMany.mockResolvedValue([
      {
        id: 'event-1',
        eventType: 'SHARE_PREPARED',
        documentId: 'doc-1',
        metadata: {
          shareId: 'share-1',
          recipientId: 'user-2',
          role: 'SHARED_WRITE',
        },
      },
    ]);
    mockPrisma.document.findUnique.mockResolvedValue({
      id: 'doc-1',
      ownerId: 'user-1',
      name: 'Contrato.pdf',
      owner: {
        id: 'user-1',
        username: 'owner-user',
        fullName: 'Owner',
        email: 'owner@example.com',
      },
    });
    mockPrisma.event.create.mockResolvedValue({ id: 'event-confirmed' });

    const result = await ShareService.confirmShare({
      shareId: 'share-1',
      txHash: '0xtxhash',
    });

    expect(mockNotifications.createNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-2',
        type: 'FILE_SHARED',
        title: 'Documento compartido',
      })
    );
    expect(mockPrisma.event.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          eventType: 'SHARE_CONFIRMED',
          transactionHash: '0xtxhash',
        }),
      })
    );
    expect(result.role).toBe('SHARED_WRITE');
  });

  it('throws if prepared share event not found', async () => {
    mockPrisma.event.findMany.mockResolvedValue([]);

    await expect(
      ShareService.confirmShare({
        shareId: 'missing',
        txHash: '0xtxhash',
      })
    ).rejects.toThrow('No se encontró la preparación del share');
  });

  it('throws if document not found', async () => {
    mockPrisma.event.findMany.mockResolvedValue([
      {
        id: 'event-1',
        eventType: 'SHARE_PREPARED',
        documentId: 'doc-1',
        metadata: { shareId: 'share-1', recipientId: 'user-2' },
      },
    ]);
    mockPrisma.document.findUnique.mockResolvedValue(null);

    await expect(
      ShareService.confirmShare({
        shareId: 'share-1',
        txHash: '0xtxhash',
      })
    ).rejects.toThrow('Documento no encontrado para confirmar el share');
  });
});

describe('ShareService revocation flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('filters revoked shares out of the document share list fallback', async () => {
    mockPrisma.document.findUnique.mockResolvedValue({
      id: 'doc-1',
      ownerId: 'owner-1',
      blockchainId: 'chain-doc-1',
      creatorWalletId: 'wallet-1',
      createdAt: new Date('2026-04-05T12:00:00Z'),
    });
    mockPrisma.wallet.findFirst.mockResolvedValue({ id: 'wallet-1', userId: 'owner-1', walletAddress: '0xOwner' });
    mockPermissions.isOwner.mockResolvedValue(true);
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