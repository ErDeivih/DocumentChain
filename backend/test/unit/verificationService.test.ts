/**
 * Tests for VerificationService - Public document verification.
 * Covers: verifyFileByHash, verifyByIPFSHash, verifyByBlockchainId.
 */

jest.mock('../../src/config/database', () => ({
  __esModule: true,
  default: {
    document: { findFirst: jest.fn() },
    version: { findFirst: jest.fn() },
    wallet: { findFirst: jest.fn() },
  },
}));

jest.mock('../../src/config/blockchain', () => ({
  getContracts: jest.fn().mockReturnValue({
    documentRegistry: {
      getDocument: jest.fn(),
    },
  }),
}));

jest.mock('../../src/lib/blockchain/queries', () => ({
  BlockchainQueries: {
    getDocument: jest.fn().mockResolvedValue(null),
  },
}));

jest.mock('../../src/services/documentPermissionService', () => ({
  DocumentPermissionService: {
    getDocumentUsersWithRoles: jest.fn().mockResolvedValue([]),
  },
  DocumentRole: { VIEWER: 1, EDITOR: 2, OWNER: 3 },
}));

jest.mock('../../src/utils/ethereum', () => ({
  __esModule: true,
  normalizeEthereumAddress: jest.fn((addr: string) => addr.toLowerCase()),
}));

const mockCalculateHash = jest.fn().mockReturnValue('hash-abcd');
jest.mock('../../src/lib/encryption', () => ({
  __esModule: true,
  calculateHash: mockCalculateHash,
}));

import { VerificationService } from '../../src/services/verificationService';
import prisma from '../../src/config/database';
import { getContracts } from '../../src/config/blockchain';

describe('VerificationService', () => {
  const mockBlockchainId = '0x' + 'a'.repeat(64);
  const mockIpfsHash = 'QmTest123abc';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('verifyFileByHash()', () => {
    it('should return exists=false when no document matches contentHash', async () => {
      (prisma.document.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await VerificationService.verifyFileByHash(
        Buffer.from('test content')
      );

      expect(result.exists).toBe(false);
      expect(mockCalculateHash).toHaveBeenCalled();
    });

    it('should return exists=true with document info when found', async () => {
      const mockDoc = {
        id: 'doc-1',
        blockchainId: mockBlockchainId,
        name: 'Test Doc',
        ownerId: 'owner-1',
        size: BigInt(1024),
        owner: { username: 'user1' },
        versions: [{ versionNumber: 1, comment: null, user: { username: 'user1' } }],
        signatures: [],
      };

      (prisma.document.findFirst as jest.Mock).mockResolvedValue(mockDoc);

      const mockDocData = {
        ipfsHash: mockIpfsHash,
        metadataHash: 'metadata-hash',
        owner: '0xowner',
        createdBlock: { toNumber: () => 100 },
        txHash: '0xtx',
      };

      const mockRegistry = {
        getDocument: jest.fn().mockResolvedValue(mockDocData),
      };

      (getContracts as jest.Mock).mockReturnValue({
        documentRegistry: mockRegistry,
      });

      const result = await VerificationService.verifyFileByHash(
        Buffer.from('test content')
      );

      expect(result.exists).toBe(true);
      expect(result.document).toBeDefined();
      expect(result.document!.name).toBe('Test Doc');
    });

    it('should handle blockchain fetch errors gracefully', async () => {
      const mockDoc = {
        id: 'doc-2',
        blockchainId: mockBlockchainId,
        name: 'Doc With Bad BC',
        ownerId: 'owner-1',
        size: BigInt(500),
        owner: { username: 'user1' },
        versions: [{ versionNumber: 1, comment: null, user: { username: 'user1' } }],
        signatures: [],
      };

      (prisma.document.findFirst as jest.Mock).mockResolvedValue(mockDoc);

      (getContracts as jest.Mock).mockReturnValue({
        documentRegistry: {
          getDocument: jest.fn().mockRejectedValue(new Error('Chain error')),
        },
      });

      const result = await VerificationService.verifyFileByHash(
        Buffer.from('test content')
      );

      expect(result.exists).toBe(true);
      expect(result.blockchain).toBeUndefined();
    });
  });

  describe('verifyByIPFSHash()', () => {
    it('should return exists=false for empty hash', async () => {
      const result = await VerificationService.verifyByIPFSHash('');

      expect(result.exists).toBe(false);
    });

    it('should return exists=false for non-string input', async () => {
      const result = await VerificationService.verifyByIPFSHash(null as unknown as string);

      expect(result.exists).toBe(false);
    });

    it('should return exists=false when IPFS hash not found in any version', async () => {
      (prisma.version.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await VerificationService.verifyByIPFSHash(mockIpfsHash);

      expect(result.exists).toBe(false);
    });

    it('should delegate to verifyByBlockchainId when IPFS hash matches a version', async () => {
      const mockVersion = {
        versionNumber: 2,
        document: { blockchainId: mockBlockchainId },
      };

      (prisma.version.findFirst as jest.Mock).mockResolvedValue(mockVersion);

      const mockDoc = {
        id: 'doc-3',
        blockchainId: mockBlockchainId,
        name: 'Test',
        ownerId: 'owner-1',
        size: BigInt(500),
        owner: { username: 'user1' },
        versions: [
          { versionNumber: 1, comment: null, user: { username: 'user1' } },
          { versionNumber: 2, comment: null, user: { username: 'user1' } },
        ],
        signatures: [],
      };

      (prisma.document.findFirst as jest.Mock).mockResolvedValue(mockDoc);

      (getContracts as jest.Mock).mockReturnValue({
        documentRegistry: {
          getDocument: jest.fn().mockResolvedValue({
            ipfsHash: mockIpfsHash,
            metadataHash: 'metadata-hash',
            owner: '0xowner',
            createdBlock: { toNumber: () => 100 },
            txHash: '0xtx',
          }),
        },
      });

      const result = await VerificationService.verifyByIPFSHash(mockIpfsHash);

      expect(result.exists).toBe(true);
      expect(result.matchedVersion).toBe(2);
    });
  });

  describe('verifyByBlockchainId()', () => {
    it('should return document when found in DB', async () => {
      const mockDoc = {
        id: 'doc-4',
        blockchainId: mockBlockchainId,
        name: 'Blockchain Doc',
        ownerId: 'owner-1',
        size: BigInt(300),
        owner: { username: 'user1' },
        versions: [
          { versionNumber: 1, comment: null, user: { username: 'user1' } },
        ],
        signatures: [],
      };

      (prisma.document.findFirst as jest.Mock).mockResolvedValue(mockDoc);

      (getContracts as jest.Mock).mockReturnValue({
        documentRegistry: {
          getDocument: jest.fn().mockResolvedValue({
            ipfsHash: mockIpfsHash,
            metadataHash: 'metadata-hash',
            owner: '0xowner',
            createdBlock: { toNumber: () => 200 },
            txHash: '0xtx',
          }),
        },
      });

      const result = await VerificationService.verifyByBlockchainId(mockBlockchainId);

      expect(result.exists).toBe(true);
      expect(result.document!.name).toBe('Blockchain Doc');
    });

    it('should try blockchain-only lookup when document not in DB', async () => {
      (prisma.document.findFirst as jest.Mock).mockResolvedValue(null);

      (getContracts as jest.Mock).mockReturnValue({
        documentRegistry: {
          getDocument: jest.fn().mockResolvedValue({
            ipfsHash: mockIpfsHash,
            metadataHash: 'metadata-hash',
            owner: '0xowner',
            createdBlock: { toNumber: () => 300 },
            txHash: '0xtx',
          }),
        },
      });

      const result = await VerificationService.verifyByBlockchainId(mockBlockchainId);

      expect(result.exists).toBe(true);
      expect(result.document).toBeUndefined();
      expect(result.blockchain).toBeDefined();
      expect(result.blockchain!.owner).toBe('0xowner');
    });

    it('should return exists=false when not found on chain either', async () => {
      (prisma.document.findFirst as jest.Mock).mockResolvedValue(null);

      (getContracts as jest.Mock).mockReturnValue({
        documentRegistry: {
          getDocument: jest.fn().mockRejectedValue(new Error('Not found')),
        },
      });

      const result = await VerificationService.verifyByBlockchainId(mockBlockchainId);

      expect(result.exists).toBe(false);
    });

    it('should use matchedVersionHint when provided', async () => {
      const mockDoc = {
        id: 'doc-5',
        blockchainId: mockBlockchainId,
        name: 'Version Hint Doc',
        ownerId: 'owner-1',
        size: BigInt(100),
        owner: { username: 'user1' },
        versions: [
          { versionNumber: 1, comment: null, user: { username: 'user1' } },
          { versionNumber: 3, comment: null, user: { username: 'user1' } },
        ],
        signatures: [],
      };

      (prisma.document.findFirst as jest.Mock).mockResolvedValue(mockDoc);

      (getContracts as jest.Mock).mockReturnValue({
        documentRegistry: {
          getDocument: jest.fn().mockResolvedValue({
            ipfsHash: mockIpfsHash,
            metadataHash: 'metadata-hash',
            owner: '0xowner',
            createdBlock: { toNumber: () => 100 },
            txHash: '0xtx',
          }),
        },
      });

      const result = await VerificationService.verifyByBlockchainId(mockBlockchainId, 1);

      expect(result.exists).toBe(true);
      expect(result.matchedVersion).toBe(1);
    });
  });
});
