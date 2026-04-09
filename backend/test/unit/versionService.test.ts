import prisma from '../../src/config/database';
import { VersionService } from '../../src/services/versionService';

jest.mock('../../src/config/database', () => ({
  __esModule: true,
  default: {
    document: {
      findUnique: jest.fn(),
    },
    version: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    wallet: {
      findFirst: jest.fn(),
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
  },
}));

jest.mock('../../src/utils/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
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