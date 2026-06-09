import { beforeEach, describe, expect, it, jest } from '@jest/globals';

jest.mock('../../src/services/blockchainCacheService', () => ({
  __esModule: true,
  BlockchainCacheService: {
    getDocumentState: jest.fn().mockResolvedValue({ isArchived: false, isDeleted: false, owner: '0xOwner', currentVersion: 1, updatedAt: Date.now() }),
    getOperationalVersionNumber: jest.fn().mockResolvedValue(1),
    batchGetDocumentStates: jest.fn().mockResolvedValue(new Map()),
    isDocumentArchived: jest.fn().mockResolvedValue(false),
    isDocumentDeleted: jest.fn().mockResolvedValue(false),
    invalidate: jest.fn(),
    invalidateAll: jest.fn(),
  },
}));

import { BlockchainStatus } from '@prisma/client';

jest.mock('../../src/config/database', () => ({
  __esModule: true,
  default: {
    document: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    wallet: {
      findFirst: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    event: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    documentShareKey: {
      deleteMany: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

jest.mock('../../src/lib/encryption', () => ({
  encryptSymmetricKey: jest.fn(),
}));

jest.mock('../../src/services/documentPermissionService', () => ({
  DocumentPermissionService: {
    isOwner: jest.fn(),
    validateOwnership: jest.fn().mockImplementation(async (doc: any, userId: string) => {
      if (doc.ownerId !== userId) throw new Error('No eres el propietario del documento');
      return { wallet: { walletAddress: '0xMock' }, isOwner: true as const };
    }),
  },
}));

jest.mock('ethers', () => ({
  id: jest.fn(() => '0xmockedDocId'),
  isAddress: jest.fn((addr: string) => addr.startsWith('0x') && addr.length === 42),
  getAddress: jest.fn((addr: string) => addr.toLowerCase()),
  JsonRpcProvider: jest.fn(),
}));

jest.mock('../../src/services/blockchainReceiptService', () => ({
  assertOwnershipTransferredReceipt: jest.fn().mockResolvedValue({ blockNumber: 1 }),
}));

import prisma from '../../src/config/database';
import * as Encryption from '../../src/lib/encryption';
import { TransferService } from '../../src/services/transferService';
import { DocumentPermissionService } from '../../src/services/documentPermissionService';

const mockPrisma = prisma as any;
const mockEncryptSymmetricKey = Encryption.encryptSymmetricKey as jest.Mock;
const mockPermissions = DocumentPermissionService as jest.Mocked<typeof DocumentPermissionService>;

describe('TransferService prepareTransfer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('prepares transfer for a private document with re-encryption', async () => {
    mockPrisma.document.findUnique.mockResolvedValue({
      id: 'doc-1',
      ownerId: 'user-1',
      blockchainId: '0xbcid',
      visibility: 'PRIVATE',
      encryptedSymmetricKey: 'enc-old',
      owner: { id: 'user-1', username: 'owner' },
    });
    mockPrisma.wallet.findFirst.mockResolvedValue({
      id: 'wallet-1',
      userId: 'user-1',
      walletAddress: '0xCurrentOwner',
    });
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user-2',
      username: 'newowner',
      publicKey: 'pub-key-2',
    });
    mockEncryptSymmetricKey.mockReturnValue('enc-new');
    mockPrisma.document.update.mockResolvedValue({ id: 'doc-1' });
    mockPrisma.event.create.mockResolvedValue({ id: 'event-1' });
    mockPermissions.isOwner.mockResolvedValue(true);

    const result = await TransferService.prepareTransfer({
      documentId: 'doc-1',
      currentOwnerId: 'user-1',
      newOwnerId: 'user-2',
      currentOwnerWalletId: 'wallet-1',
      newOwnerWalletAddress: '0xNewOwner',
      decryptedSymmetricKey: 'decrypted-key',
    });

    expect(mockPrisma.document.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'doc-1' },
        data: expect.objectContaining({
          blockchainStatus: BlockchainStatus.PREPARING,
        }),
      })
    );
    expect(mockPrisma.document.update).not.toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ encryptedSymmetricKey: 'enc-new' }),
      })
    );
    expect(mockPrisma.event.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          eventType: 'TRANSFER_PREPARED',
          metadata: expect.objectContaining({ pendingEncryptedSymmetricKey: 'enc-new' }),
        }),
      })
    );
    expect(result).toEqual(
      expect.objectContaining({
        documentId: 'doc-1',
        currentOwnerAddress: '0xCurrentOwner',
        newOwnerAddress: '0xNewOwner',
      })
    );
    expect(result.docId).toBe('0xbcid');
  });

  it('prepares transfer for a public document without re-encryption', async () => {
    mockPrisma.document.findUnique.mockResolvedValue({
      id: 'doc-1',
      ownerId: 'user-1',
      blockchainId: '0xbcid',
      visibility: 'PUBLIC',
      encryptedSymmetricKey: 'UNENCRYPTED',
      owner: { id: 'user-1', username: 'owner' },
    });
    mockPrisma.wallet.findFirst.mockResolvedValue({
      id: 'wallet-1',
      userId: 'user-1',
      walletAddress: '0xCurrentOwner',
    });
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user-2',
      username: 'newowner',
      publicKey: 'pub-key-2',
    });
    mockPrisma.document.update.mockResolvedValue({ id: 'doc-1' });
    mockPrisma.event.create.mockResolvedValue({ id: 'event-1' });
    mockPermissions.isOwner.mockResolvedValue(true);

    const result = await TransferService.prepareTransfer({
      documentId: 'doc-1',
      currentOwnerId: 'user-1',
      newOwnerId: 'user-2',
      currentOwnerWalletId: 'wallet-1',
      newOwnerWalletAddress: '0xNewOwner',
    });

    expect(mockEncryptSymmetricKey).not.toHaveBeenCalled();
    expect(mockPrisma.document.update).not.toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ encryptedSymmetricKey: 'UNENCRYPTED' }),
      })
    );
    expect(mockPrisma.event.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          eventType: 'TRANSFER_PREPARED',
          metadata: expect.objectContaining({ pendingEncryptedSymmetricKey: 'UNENCRYPTED' }),
        }),
      })
    );
    expect(result.newOwnerAddress).toBe('0xNewOwner');
  });

  it('throws if document not found', async () => {
    mockPrisma.document.findUnique.mockResolvedValue(null);

    await expect(
      TransferService.prepareTransfer({
        documentId: 'missing',
        currentOwnerId: 'user-1',
        newOwnerId: 'user-2',
        currentOwnerWalletId: 'wallet-1',
        newOwnerWalletAddress: '0xNewOwner',
      })
    ).rejects.toThrow('Documento no encontrado');
  });

  it('throws if user is not the owner', async () => {
    mockPrisma.document.findUnique.mockResolvedValue({
      id: 'doc-1',
      ownerId: 'user-2',
    });

    await expect(
      TransferService.prepareTransfer({
        documentId: 'doc-1',
        currentOwnerId: 'user-1',
        newOwnerId: 'user-3',
        currentOwnerWalletId: 'wallet-1',
        newOwnerWalletAddress: '0xNewOwner',
      })
    ).rejects.toThrow('No eres el propietario del documento');
  });

  it('throws if new owner has no public key', async () => {
    mockPrisma.document.findUnique.mockResolvedValue({
      id: 'doc-1',
      ownerId: 'user-1',
      blockchainId: '0xbcid',
      visibility: 'PRIVATE',
      owner: { id: 'user-1' },
    });
    mockPrisma.wallet.findFirst.mockResolvedValue({ id: 'wallet-1', userId: 'user-1' });
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user-2',
      publicKey: null,
    });
    mockPermissions.isOwner.mockResolvedValue(true);

    await expect(
      TransferService.prepareTransfer({
        documentId: 'doc-1',
        currentOwnerId: 'user-1',
        newOwnerId: 'user-2',
        currentOwnerWalletId: 'wallet-1',
        newOwnerWalletAddress: '0xNewOwner',
        decryptedSymmetricKey: 'decrypted-key',
      })
    ).rejects.toThrow('Usuario no tiene clave pública configurada');
  });

  it('throws if private document transfer lacks decrypted symmetric key', async () => {
    mockPrisma.document.findUnique.mockResolvedValue({
      id: 'doc-1',
      ownerId: 'user-1',
      blockchainId: '0xbcid',
      visibility: 'PRIVATE',
      encryptedSymmetricKey: 'enc-old',
      owner: { id: 'user-1' },
    });
    mockPrisma.wallet.findFirst.mockResolvedValue({ id: 'wallet-1', userId: 'user-1' });
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user-2',
      publicKey: 'pub-key-2',
    });
    mockPermissions.isOwner.mockResolvedValue(true);

    await expect(
      TransferService.prepareTransfer({
        documentId: 'doc-1',
        currentOwnerId: 'user-1',
        newOwnerId: 'user-2',
        currentOwnerWalletId: 'wallet-1',
        newOwnerWalletAddress: '0xNewOwner',
      })
    ).rejects.toThrow('La clave simétrica descifrada es obligatoria para documentos privados');
  });
});

describe('TransferService confirmTransfer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('confirms transfer and updates ownership', async () => {
    mockPrisma.event.findFirst.mockResolvedValue({
      id: 'event-1',
      documentId: 'doc-1',
      metadata: {
        transferId: 'transfer-1',
        newOwner: 'user-2',
        newOwnerAddress: '0xNewOwner',
        currentWalletId: 'wallet-1',
        docId: '0xbcid',
        pendingEncryptedSymmetricKey: 'enc-new',
      },
    });
    mockPrisma.document.findUnique.mockResolvedValue({ id: 'doc-1', ownerId: 'user-1', blockchainId: '0x' + 'a'.repeat(64) });
    mockPrisma.wallet.findFirst.mockResolvedValue({ id: 'wallet-1', walletAddress: '0x1234567890abcdef1234567890abcdef12345678' });
    mockPrisma.document.update.mockResolvedValue({ id: 'doc-1', ownerId: 'user-2' });
    mockPrisma.event.create.mockResolvedValue({ id: 'event-confirmed' });
    mockPrisma.$transaction.mockImplementation(async (callback: any) => callback(mockPrisma));

    await TransferService.confirmTransfer({
      transferId: 'transfer-1',
      txHash: '0xtxhash',
      signature: '0xsig',
      confirmerUserId: 'user-1',
    });

    expect(mockPrisma.document.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'doc-1' },
        data: expect.objectContaining({
          ownerId: 'user-2',
          encryptedSymmetricKey: 'enc-new',
          blockchainStatus: BlockchainStatus.TX_SUBMITTED,
          blockchainTxHash: '0xtxhash',
        }),
      })
    );
    expect(mockPrisma.event.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          eventType: 'TRANSFER_CONFIRMED',
          documentId: 'doc-1',
          transactionHash: '0xtxhash',
        }),
      })
    );
  });

  it('throws if transfer event not found', async () => {
    mockPrisma.event.findFirst.mockResolvedValue(null);

    await expect(
      TransferService.confirmTransfer({
        transferId: 'missing',
        txHash: '0xtxhash',
        signature: '0xsig',
        confirmerUserId: 'user-1',
      })
    ).rejects.toThrow('No se encontró el ID del documento en el evento de transferencia');
  });

  it('throws if document ID is missing in transfer event', async () => {
    mockPrisma.event.findFirst.mockResolvedValue({
      id: 'event-1',
      documentId: null,
      metadata: { transferId: 'transfer-1' },
    });

    await expect(
      TransferService.confirmTransfer({
        transferId: 'transfer-1',
        txHash: '0xtxhash',
        signature: '0xsig',
        confirmerUserId: 'user-1',
      })
    ).rejects.toThrow('No se encontró el ID del documento en el evento de transferencia');
  });
});
