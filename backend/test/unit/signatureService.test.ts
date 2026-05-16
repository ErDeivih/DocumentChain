import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { BlockchainStatus } from '@prisma/client';

jest.mock('../../src/config/database', () => ({
  __esModule: true,
  default: {
    wallet: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    document: {
      findUnique: jest.fn(),
    },
    version: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
    },
    documentSignature: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
    event: {
      create: jest.fn(),
    },
    notification: {
      findFirst: jest.fn(),
    },
  },
}));

jest.mock('../../src/config/blockchain', () => ({
  provider: {
    getTransactionReceipt: jest.fn(),
  },
}));

jest.mock('../../src/services/documentPermissionService', () => ({
  DocumentPermissionService: {
    canView: jest.fn(),
  },
}));

jest.mock('../../src/lib/blockchain/queries', () => ({
  BlockchainQueries: {
    getUserDocuments: jest.fn(),
  },
}));

jest.mock('../../src/services/notificationService', () => ({
  __esModule: true,
  default: {
    createNotification: jest.fn(),
  },
  NotificationType: {
    FILE_SIGNED: 'FILE_SIGNED',
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

jest.mock('../../src/services/documentService', () => ({
  DocumentService: {
    userHasAccess: jest.fn(),
  },
}));

import prisma from '../../src/config/database';
import { provider } from '../../src/config/blockchain';
import { BlockchainQueries } from '../../src/lib/blockchain/queries';
import { DocumentPermissionService } from '../../src/services/documentPermissionService';
import { DocumentService } from '../../src/services/documentService';
import { SignatureService } from '../../src/services/signatureService';
import notificationService from '../../src/services/notificationService';

const mockPrisma = prisma as any;
const mockProvider = provider as any;
const mockBlockchainQueries = BlockchainQueries as jest.Mocked<typeof BlockchainQueries>;
const mockPermissionService = DocumentPermissionService as jest.Mocked<typeof DocumentPermissionService>;
const mockDocumentService = DocumentService as jest.Mocked<typeof DocumentService>;
const mockNotifications = notificationService as jest.Mocked<typeof notificationService>;

describe('SignatureService signer profile support', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('stores signer snapshots when preparing a signature', async () => {
    mockPrisma.wallet.findFirst.mockResolvedValue({
      id: 'wallet-1',
      walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
      user: {
        username: 'mprieto',
        fullName: 'Marina Prieto',
      },
    });
    mockPrisma.document.findUnique.mockResolvedValue({
      id: 'doc-1',
      ownerId: 'user-1',
      blockchainId: 'chain-doc-1',
      contentHash: 'hash-doc-1',
    });
    mockPrisma.version.findFirst.mockResolvedValue({
      id: 'version-1',
      versionNumber: 3,
    });
    mockPrisma.documentSignature.findFirst.mockResolvedValue(null);
    mockPrisma.documentSignature.create.mockResolvedValue({
      id: 'signature-1',
      documentId: 'doc-1',
      versionId: 'version-1',
      signerWalletId: 'wallet-1',
      blockchainStatus: BlockchainStatus.PREPARING,
    });
    mockPermissionService.canView.mockResolvedValue(true);

    const result = await SignatureService.prepareSignature({
      documentId: 'doc-1',
      versionNumber: 3,
      signerUserId: 'user-1',
      signerWalletId: 'wallet-1',
    });

    expect(mockPrisma.documentSignature.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        signerUsernameSnapshot: 'mprieto',
        signerFullNameSnapshot: 'Marina Prieto',
        signerWalletAddressSnapshot: '0x1234567890abcdef1234567890abcdef12345678',
      }),
    }));
    expect(result).toEqual(expect.objectContaining({
      signatureId: 'signature-1',
      versionId: 3,
      contentHash: 'hash-doc-1',
    }));
    expect(mockBlockchainQueries.getUserDocuments).not.toHaveBeenCalled();
    expect(mockPermissionService.canView).toHaveBeenCalledWith('chain-doc-1', '0x1234567890abcdef1234567890abcdef12345678');
  });

  it('returns signer snapshots when the original account is no longer available', async () => {
    mockPrisma.version.findUnique.mockResolvedValue({
      id: 'version-1',
      documentId: 'doc-1',
    });
    mockDocumentService.userHasAccess.mockResolvedValue(true);
    mockPrisma.documentSignature.findMany.mockResolvedValue([
      {
        id: 'signature-1',
        documentId: 'doc-1',
        versionId: 'version-1',
        version: {
          versionNumber: 1,
        },
        userId: null,
        signerWalletId: null,
        signedAt: new Date('2026-04-05T10:15:00Z'),
        blockchainStatus: BlockchainStatus.SYNCED,
        blockchainTxHash: '0xtxhash',
        user: null,
        signerWallet: null,
        signerUsernameSnapshot: 'mprieto',
        signerFullNameSnapshot: 'Marina Prieto',
        signerWalletAddressSnapshot: '0x1234567890abcdef1234567890abcdef12345678',
      },
    ]);

    const signatures = await SignatureService.getVersionSignatures('version-1', 'viewer-1');

    expect(mockDocumentService.userHasAccess).toHaveBeenCalledWith('doc-1', 'viewer-1');
    expect(signatures).toEqual([
      expect.objectContaining({
        id: 'signature-1',
        versionNumber: 1,
        signer: {
          userId: null,
          username: 'mprieto',
          fullName: 'Marina Prieto',
          walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
          source: 'snapshot',
          avatarUrl: null,
        },
      }),
    ]);
  });

  it('rejects confirming a signature that is no longer in PREPARING state', async () => {
    mockPrisma.documentSignature.findUnique.mockResolvedValue({
      id: 'signature-1',
      documentId: 'doc-1',
      versionId: 'version-1',
      userId: 'user-1',
      signerWalletId: 'wallet-1',
      signerUsernameSnapshot: 'mprieto',
      blockchainStatus: BlockchainStatus.SYNCED,
      document: {
        id: 'doc-1',
        name: 'Contrato.pdf',
        ownerId: 'owner-1',
      },
      user: {
        username: 'mprieto',
      },
    });
    mockProvider.getTransactionReceipt.mockResolvedValue({ status: 1 });

    await expect(
      SignatureService.confirmSignature({
        signatureId: 'signature-1',
        txHash: '0xtxhash',
        ecdsaSignature: '0xsig',
        confirmerUserId: 'user-1',
      })
    ).rejects.toThrow('La firma no puede confirmarse en estado SYNCED');

    expect(mockPrisma.documentSignature.update).not.toHaveBeenCalled();
  });
});

describe('SignatureService confirmSignature', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('confirms a signature successfully when receipt is valid', async () => {
    mockPrisma.documentSignature.findUnique.mockResolvedValue({
      id: 'signature-1',
      documentId: 'doc-1',
      versionId: 'version-1',
      userId: 'user-1',
      signerWalletId: 'wallet-1',
      signerUsernameSnapshot: 'mprieto',
      blockchainStatus: BlockchainStatus.PREPARING,
      document: {
        id: 'doc-1',
        name: 'Contrato.pdf',
        ownerId: 'owner-1',
      },
      user: {
        username: 'mprieto',
      },
    });
    mockProvider.getTransactionReceipt.mockResolvedValue({ status: 1 });
    mockPrisma.documentSignature.update.mockResolvedValue({
      id: 'signature-1',
      blockchainStatus: BlockchainStatus.SYNCED,
      blockchainTxHash: '0xtxhash',
    });
    mockPrisma.notification.findFirst.mockResolvedValue(null);
    mockPrisma.event.create.mockResolvedValue({ id: 'event-1' });

    const result = await SignatureService.confirmSignature({
      signatureId: 'signature-1',
      txHash: '0xtxhash',
      ecdsaSignature: '0xsig',
      confirmerUserId: 'user-1',
    });

    expect(mockPrisma.documentSignature.update).toHaveBeenCalledWith({
      where: { id: 'signature-1' },
      data: {
        blockchainStatus: BlockchainStatus.SYNCED,
        blockchainTxHash: '0xtxhash',
        blockchainError: null,
      },
    });
    expect(mockNotifications.createNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'owner-1',
        type: 'FILE_SIGNED',
        title: 'Documento firmado',
      })
    );
    expect(mockPrisma.event.create).toHaveBeenCalled();
    expect(result.blockchainStatus).toBe(BlockchainStatus.SYNCED);
  });

  it('throws if signature is not found', async () => {
    mockPrisma.documentSignature.findUnique.mockResolvedValue(null);

    await expect(
      SignatureService.confirmSignature({
        signatureId: 'missing-sig',
        txHash: '0xtxhash',
        ecdsaSignature: '0xsig',
        confirmerUserId: 'user-1',
      })
    ).rejects.toThrow('Signature no encontrada');
  });

  it('throws if confirmer is not the signer', async () => {
    mockPrisma.documentSignature.findUnique.mockResolvedValue({
      id: 'signature-1',
      documentId: 'doc-1',
      versionId: 'version-1',
      userId: 'user-1',
      blockchainStatus: BlockchainStatus.PREPARING,
      document: { id: 'doc-1', name: 'Contrato.pdf', ownerId: 'owner-1' },
      user: { username: 'mprieto' },
    });
    mockProvider.getTransactionReceipt.mockResolvedValue({ status: 1 });

    await expect(
      SignatureService.confirmSignature({
        signatureId: 'signature-1',
        txHash: '0xtxhash',
        ecdsaSignature: '0xsig',
        confirmerUserId: 'user-2',
      })
    ).rejects.toThrow('No puedes confirmar una firma creada por otro usuario');
  });

  it('throws if transaction is not found on chain', async () => {
    mockPrisma.documentSignature.findUnique.mockResolvedValue({
      id: 'signature-1',
      documentId: 'doc-1',
      versionId: 'version-1',
      userId: 'user-1',
      blockchainStatus: BlockchainStatus.PREPARING,
      document: { id: 'doc-1', name: 'Contrato.pdf', ownerId: 'owner-1' },
      user: { username: 'mprieto' },
    });
    mockProvider.getTransactionReceipt.mockResolvedValue(null);

    await expect(
      SignatureService.confirmSignature({
        signatureId: 'signature-1',
        txHash: '0xtxhash',
        ecdsaSignature: '0xsig',
        confirmerUserId: 'user-1',
      })
    ).rejects.toThrow('No se encontró la transacción de firma en blockchain');
  });

  it('throws if transaction reverted on chain', async () => {
    mockPrisma.documentSignature.findUnique.mockResolvedValue({
      id: 'signature-1',
      documentId: 'doc-1',
      versionId: 'version-1',
      userId: 'user-1',
      blockchainStatus: BlockchainStatus.PREPARING,
      document: { id: 'doc-1', name: 'Contrato.pdf', ownerId: 'owner-1' },
      user: { username: 'mprieto' },
    });
    mockProvider.getTransactionReceipt.mockResolvedValue({ status: 0 });

    await expect(
      SignatureService.confirmSignature({
        signatureId: 'signature-1',
        txHash: '0xtxhash',
        ecdsaSignature: '0xsig',
        confirmerUserId: 'user-1',
      })
    ).rejects.toThrow('La transacción de firma revirtió en blockchain');
  });
});