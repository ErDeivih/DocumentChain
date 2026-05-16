import prisma from '../../src/config/database';
import { uploadToIPFS, deleteFromIPFS } from '../../src/config/ipfs';
import * as Encryption from '../../src/lib/encryption';
import { VersionService } from '../../src/services/versionService';

jest.mock('../../src/config/blockchain', () => ({
  provider: null,
  getContracts: jest.fn(),
}));

jest.mock('../../src/config/database', () => ({
  __esModule: true,
  default: {
    document: {
      findUnique: jest.fn(),
    },
    version: {
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
    },
    wallet: {
      findFirst: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    event: {
      create: jest.fn(),
    },
  },
}));

jest.mock('../../src/config/ipfs', () => ({
  downloadFromIPFS: jest.fn(),
  uploadToIPFS: jest.fn(),
  deleteFromIPFS: jest.fn(),
}));

jest.mock('../../src/services/documentPermissionService', () => ({
  DocumentPermissionService: {
    canView: jest.fn(),
    canEdit: jest.fn(),
    isOwner: jest.fn(),
  },
}));

jest.mock('../../src/lib/encryption', () => ({
  validateFileSize: jest.fn(),
  encryptFile: jest.fn(),
  encryptSymmetricKey: jest.fn(),
}));

describe('VersionService download compatibility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return version-specific encryption metadata when downloading a version', async () => {
    const { downloadFromIPFS } = require('../../src/config/ipfs');
    (prisma.document.findUnique as jest.Mock).mockResolvedValue({
      ownerId: 'user-1',
      blockchainId: null,
      visibility: 'PRIVATE',
    });
    (prisma.version.findUnique as jest.Mock).mockResolvedValue({
      id: 'version-1',
      ipfsCid: 'QmVersionCid',
      encryptedSymmetricKey: 'version-key',
      encryptionIV: 'version-iv',
      encryptionAuthTag: 'version-auth',
      document: {
        id: 'document-1',
        ownerId: 'user-1',
        blockchainId: null,
        encryptedSymmetricKey: 'document-key',
      },
    });
    (downloadFromIPFS as jest.Mock).mockResolvedValue(Buffer.from('encrypted-version'));

    const result = await VersionService.downloadVersion('version-1', 'user-1');

    expect(result.encryptedSymmetricKey).toBe('version-key');
    expect(result.encryptionIV).toBe('version-iv');
    expect(result.encryptionAuthTag).toBe('version-auth');
  });

  it('should expose legacy plain versions as unencrypted downloads', async () => {
    const { downloadFromIPFS } = require('../../src/config/ipfs');
    (prisma.document.findUnique as jest.Mock).mockResolvedValue({
      ownerId: 'user-1',
      blockchainId: null,
      visibility: 'PRIVATE',
    });
    (prisma.version.findUnique as jest.Mock).mockResolvedValue({
      id: 'version-legacy',
      ipfsCid: 'QmLegacyVersionCid',
      encryptedSymmetricKey: null,
      encryptionIV: null,
      encryptionAuthTag: null,
      document: {
        id: 'document-1',
        ownerId: 'user-1',
        blockchainId: null,
        encryptedSymmetricKey: null,
      },
    });
    (downloadFromIPFS as jest.Mock).mockResolvedValue(Buffer.from('plain-version'));

    const result = await VersionService.downloadVersion('version-legacy', 'user-1');

    expect(result.encryptedSymmetricKey).toBe('UNENCRYPTED');
    expect(result.encryptionIV).toBeNull();
    expect(result.encryptionAuthTag).toBeNull();
  });
});

describe('VersionService confirmVersion', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should persist tx hash when confirming a prepared version', async () => {
    (prisma.version.findUnique as jest.Mock).mockResolvedValue({
      id: 'version-1',
      documentId: 'document-1',
      userId: 'user-1',
      versionNumber: 2,
      ipfsCid: 'QmVersionCid',
      comment: null,
      blockchainStatus: 'PREPARING',
      blockchainTxHash: null,
      isOperational: false,
    });

    (prisma.version.update as jest.Mock).mockResolvedValue({
      id: 'version-1',
      documentId: 'document-1',
      userId: 'user-1',
      versionNumber: 2,
      ipfsCid: 'QmVersionCid',
      comment: null,
      blockchainStatus: 'TX_SUBMITTED',
      blockchainTxHash: '0xversiontx',
      isOperational: false,
    });

    const result = await VersionService.confirmVersion({
      versionId: 'version-1',
      txHash: '0xversiontx',
      blockchainVersionNumber: 2,
    });

    expect(prisma.version.update).toHaveBeenCalledWith({
      where: { id: 'version-1' },
      data: {
        blockchainStatus: 'TX_SUBMITTED',
        blockchainTxHash: '0xversiontx',
      },
    });
    expect(prisma.event.create).toHaveBeenCalled();
    expect(result.blockchainTxHash).toBe('0xversiontx');
    expect(result.blockchainStatus).toBe('TX_SUBMITTED');
  });
});

describe('VersionService prepareVersion', () => {
  const mockEncryptFile = Encryption.encryptFile as jest.Mock;
  const mockEncryptSymmetricKey = Encryption.encryptSymmetricKey as jest.Mock;
  const mockValidateFileSize = Encryption.validateFileSize as jest.Mock;
  const mockUploadToIPFS = uploadToIPFS as jest.Mock;
  const mockDeleteFromIPFS = deleteFromIPFS as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('prepares a private version, encrypts file and creates DB record in PREPARING state', async () => {
    (prisma.wallet.findFirst as jest.Mock).mockResolvedValue({
      id: 'wallet-1',
      userId: 'user-1',
      walletAddress: '0x1234',
    });
    (prisma.document.findUnique as jest.Mock).mockResolvedValue({
      id: 'doc-1',
      ownerId: 'user-1',
      visibility: 'PRIVATE',
      isDeleted: false,
      isArchived: false,
      blockchainId: '0xbcid',
    });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'user-1',
      publicKey: 'public-key-1',
    });
    mockEncryptFile.mockReturnValue({
      encryptedData: Buffer.from('encrypted'),
      symmetricKey: 'sym-key',
      iv: 'iv-1',
      authTag: 'auth-1',
    });
    mockEncryptSymmetricKey.mockReturnValue('encrypted-sym-key');
    mockUploadToIPFS.mockResolvedValue('QmVersionCid');
    (prisma.version.count as jest.Mock).mockResolvedValue(2);
    (prisma.version.create as jest.Mock).mockResolvedValue({
      id: 'version-uuid-3',
      versionNumber: 3,
    });
    (prisma.event.create as jest.Mock).mockResolvedValue({ id: 'event-1' });
    const { DocumentPermissionService } = require('../../src/services/documentPermissionService');
    (DocumentPermissionService.isOwner as jest.Mock).mockResolvedValue(true);

    const result = await VersionService.prepareVersion({
      documentId: 'doc-1',
      fileBuffer: Buffer.from('file-content'),
      comment: 'Nueva versión',
      userId: 'user-1',
      walletId: 'wallet-1',
    });

    expect(mockValidateFileSize).toHaveBeenCalledWith(12, 100);
    expect(mockEncryptFile).toHaveBeenCalled();
    expect(mockUploadToIPFS).toHaveBeenCalledWith(Buffer.from('encrypted'));
    expect(prisma.version.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          documentId: 'doc-1',
          versionNumber: 3,
          encryptedSymmetricKey: 'encrypted-sym-key',
          encryptionIV: 'iv-1',
          encryptionAuthTag: 'auth-1',
          blockchainStatus: 'PREPARING',
          comment: 'Nueva versión',
        }),
      })
    );
    expect(result).toEqual(
      expect.objectContaining({
        versionId: 'version-uuid-3',
        ipfsCid: 'QmVersionCid',
        versionNumber: 3,
      })
    );
  });

  it('prepares a public version without encryption', async () => {
    (prisma.wallet.findFirst as jest.Mock).mockResolvedValue({
      id: 'wallet-1',
      userId: 'user-1',
      walletAddress: '0x1234',
    });
    (prisma.document.findUnique as jest.Mock).mockResolvedValue({
      id: 'doc-1',
      ownerId: 'user-1',
      visibility: 'PUBLIC',
      isDeleted: false,
      isArchived: false,
      blockchainId: '0xbcid',
    });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'user-1',
      publicKey: 'public-key-1',
    });
    mockUploadToIPFS.mockResolvedValue('QmPublicVersionCid');
    (prisma.version.count as jest.Mock).mockResolvedValue(0);
    (prisma.version.create as jest.Mock).mockResolvedValue({
      id: 'version-uuid-1',
      versionNumber: 1,
    });
    (prisma.event.create as jest.Mock).mockResolvedValue({ id: 'event-1' });
    const { DocumentPermissionService } = require('../../src/services/documentPermissionService');
    (DocumentPermissionService.isOwner as jest.Mock).mockResolvedValue(true);

    const result = await VersionService.prepareVersion({
      documentId: 'doc-1',
      fileBuffer: Buffer.from('plain-content'),
      userId: 'user-1',
      walletId: 'wallet-1',
    });

    expect(mockEncryptFile).not.toHaveBeenCalled();
    expect(mockUploadToIPFS).toHaveBeenCalledWith(Buffer.from('plain-content'));
    expect(prisma.version.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          encryptedSymmetricKey: 'UNENCRYPTED',
          encryptionIV: null,
          encryptionAuthTag: null,
          blockchainStatus: 'PREPARING',
        }),
      })
    );
    expect(result.ipfsCid).toBe('QmPublicVersionCid');
  });

  it('throws if wallet does not belong to user', async () => {
    (prisma.wallet.findFirst as jest.Mock).mockResolvedValue(null);

    await expect(
      VersionService.prepareVersion({
        documentId: 'doc-1',
        fileBuffer: Buffer.from('x'),
        userId: 'user-1',
        walletId: 'wallet-1',
      })
    ).rejects.toThrow('Wallet no encontrada o no pertenece al usuario');
  });

  it('throws if document is archived', async () => {
    (prisma.wallet.findFirst as jest.Mock).mockResolvedValue({
      id: 'wallet-1',
      userId: 'user-1',
    });
    (prisma.document.findUnique as jest.Mock).mockResolvedValue({
      id: 'doc-1',
      ownerId: 'user-1',
      isArchived: true,
      isDeleted: false,
    });

    await expect(
      VersionService.prepareVersion({
        documentId: 'doc-1',
        fileBuffer: Buffer.from('x'),
        userId: 'user-1',
        walletId: 'wallet-1',
      })
    ).rejects.toThrow('No se pueden crear versiones en documentos archivados');
  });

  it('throws if user has no write permission', async () => {
    (prisma.wallet.findFirst as jest.Mock).mockResolvedValue({
      id: 'wallet-1',
      userId: 'user-1',
      walletAddress: '0x1234',
    });
    (prisma.document.findUnique as jest.Mock).mockResolvedValue({
      id: 'doc-1',
      ownerId: 'user-2',
      visibility: 'PRIVATE',
      isDeleted: false,
      isArchived: false,
      blockchainId: '0xbcid',
    });
    const { DocumentPermissionService } = require('../../src/services/documentPermissionService');
    (DocumentPermissionService.isOwner as jest.Mock).mockResolvedValue(false);
    (DocumentPermissionService.canEdit as jest.Mock).mockResolvedValue(false);

    await expect(
      VersionService.prepareVersion({
        documentId: 'doc-1',
        fileBuffer: Buffer.from('x'),
        userId: 'user-1',
        walletId: 'wallet-1',
      })
    ).rejects.toThrow('No tienes permisos para crear versiones de este documento');
  });

  it('cleans up IPFS if DB creation fails after upload', async () => {
    (prisma.wallet.findFirst as jest.Mock).mockResolvedValue({
      id: 'wallet-1',
      userId: 'user-1',
      walletAddress: '0x1234',
    });
    (prisma.document.findUnique as jest.Mock).mockResolvedValue({
      id: 'doc-1',
      ownerId: 'user-1',
      visibility: 'PRIVATE',
      isDeleted: false,
      isArchived: false,
      blockchainId: '0xbcid',
    });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'user-1',
      publicKey: 'public-key-1',
    });
    mockEncryptFile.mockReturnValue({
      encryptedData: Buffer.from('encrypted'),
      symmetricKey: 'sym-key',
      iv: 'iv-1',
      authTag: 'auth-1',
    });
    mockEncryptSymmetricKey.mockReturnValue('enc-key');
    mockUploadToIPFS.mockResolvedValue('QmCleanupCid');
    (prisma.version.count as jest.Mock).mockResolvedValue(1);
    (prisma.version.create as jest.Mock).mockRejectedValue(new Error('DB error'));
    const { DocumentPermissionService } = require('../../src/services/documentPermissionService');
    (DocumentPermissionService.isOwner as jest.Mock).mockResolvedValue(true);

    await expect(
      VersionService.prepareVersion({
        documentId: 'doc-1',
        fileBuffer: Buffer.from('x'),
        userId: 'user-1',
        walletId: 'wallet-1',
      })
    ).rejects.toThrow('DB error');

    expect(mockDeleteFromIPFS).toHaveBeenCalledWith('QmCleanupCid');
  });
});