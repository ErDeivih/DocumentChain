import { beforeEach, describe, expect, it, jest } from '@jest/globals';
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
  },
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

jest.mock('../../src/lib/encryption', () => ({
  encryptSymmetricKey: jest.fn(),
}));

jest.mock('../../src/services/documentPermissionService', () => ({
  DocumentPermissionService: {
    isOwner: jest.fn(),
  },
}));

jest.mock('ethers', () => ({
  id: jest.fn(() => '0xmockedDocId'),
  isAddress: jest.fn((addr: string) => addr.startsWith('0x') && addr.length === 42),
  getAddress: jest.fn((addr: string) => addr.toLowerCase()),
  JsonRpcProvider: jest.fn(),
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
      isDeleted: false,
      isArchived: false,
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
          encryptedSymmetricKey: 'enc-new',
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
      isDeleted: false,
      isArchived: false,
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
    expect(mockPrisma.document.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          encryptedSymmetricKey: 'UNENCRYPTED',
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
      isDeleted: false,
      isArchived: false,
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

  it('throws if document is archived', async () => {
    mockPrisma.document.findUnique.mockResolvedValue({
      id: 'doc-1',
      ownerId: 'user-1',
      isDeleted: false,
      isArchived: true,
    });

    await expect(
      TransferService.prepareTransfer({
        documentId: 'doc-1',
        currentOwnerId: 'user-1',
        newOwnerId: 'user-2',
        currentOwnerWalletId: 'wallet-1',
        newOwnerWalletAddress: '0xNewOwner',
      })
    ).rejects.toThrow('No se pueden transferir documentos archivados');
  });

  it('throws if new owner has no public key', async () => {
    mockPrisma.document.findUnique.mockResolvedValue({
      id: 'doc-1',
      ownerId: 'user-1',
      blockchainId: '0xbcid',
      visibility: 'PRIVATE',
      isDeleted: false,
      isArchived: false,
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
    ).rejects.toThrow('El nuevo propietario no tiene clave pública configurada');
  });

  it('throws if private document transfer lacks decrypted symmetric key', async () => {
    mockPrisma.document.findUnique.mockResolvedValue({
      id: 'doc-1',
      ownerId: 'user-1',
      blockchainId: '0xbcid',
      visibility: 'PRIVATE',
      encryptedSymmetricKey: 'enc-old',
      isDeleted: false,
      isArchived: false,
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
        docId: '0xbcid',
      },
    });
    mockPrisma.document.update.mockResolvedValue({ id: 'doc-1', ownerId: 'user-2' });
    mockPrisma.event.create.mockResolvedValue({ id: 'event-confirmed' });

    await TransferService.confirmTransfer({
      transferId: 'transfer-1',
      txHash: '0xtxhash',
      signature: '0xsig',
    });

    expect(mockPrisma.document.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'doc-1' },
        data: expect.objectContaining({
          ownerId: 'user-2',
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
      })
    ).rejects.toThrow('Document ID not found in transfer event');
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
      })
    ).rejects.toThrow('Document ID not found in transfer event');
  });
});
