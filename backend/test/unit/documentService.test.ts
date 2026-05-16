/**
 * Tests for DocumentService - Additional coverage beyond the co-located suite.
 * Covers: listDocuments, getDocumentById, getDocumentsByWallet,
 * markDocumentFailed, markDocumentSynced, rollbackDocument,
 * getPublicDocumentByPublicId, downloadPublicDocumentByPublicId.
 */

jest.mock('../../src/config/database', () => ({
  __esModule: true,
  default: {
    $transaction: jest.fn(),
    wallet: { findFirst: jest.fn(), findMany: jest.fn() },
    user: { findUnique: jest.fn() },
    document: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
    },
    version: { findFirst: jest.fn(), create: jest.fn(), updateMany: jest.fn() },
    documentStats: { update: jest.fn().mockRejectedValue(new Error('no stats')) },
    event: { create: jest.fn(), findFirst: jest.fn() },
    documentShareKey: { findUnique: jest.fn() },
  },
}));

jest.mock('../../src/config/ipfs', () => ({
  __esModule: true,
  uploadToIPFS: jest.fn().mockResolvedValue('QmTest'),
  downloadFromIPFS: jest.fn().mockResolvedValue(Buffer.from('encrypted')),
  deleteFromIPFS: jest.fn().mockResolvedValue(undefined),
  unpinFromIPFS: jest.fn().mockResolvedValue(undefined),
  ipfsClient: {
    add: jest.fn(),
    cat: jest.fn(),
    pin: jest.fn(),
    unpin: jest.fn(),
    getPinStatus: jest.fn(),
  },
  ipfsNodeClient: {
    add: jest.fn(),
    cat: jest.fn(),
    pin: jest.fn(),
    unpin: jest.fn(),
    getPinStatus: jest.fn(),
  },
  IPFSAdapter: jest.fn(),
  SelfHostedIPFSClient: jest.fn(),
}));

jest.mock('../../src/config/blockchain', () => ({
  __esModule: true,
  provider: { getTransactionReceipt: jest.fn(), getBlock: jest.fn() },
}));

jest.mock('../../src/services/documentPermissionService', () => ({
  DocumentPermissionService: {
    canView: jest.fn().mockResolvedValue(false),
    isOwner: jest.fn().mockResolvedValue(false),
    getUserRole: jest.fn().mockResolvedValue(0),
  },
  DocumentRole: { VIEWER: 1, EDITOR: 2, OWNER: 3 },
}));

import { DocumentService } from '../../src/services/documentService';
import prisma from '../../src/config/database';
import { uploadToIPFS, downloadFromIPFS, deleteFromIPFS } from '../../src/config/ipfs';
import { BlockchainStatus, DocumentVisibility } from '@prisma/client';

describe('DocumentService - Additional Methods', () => {
  const mockUserId = 'user-123';
  const mockWalletId = 'wallet-456';
  const mockDocId = 'doc-uuid-123';
  const mockBlockchainId = '0x' + 'a'.repeat(64);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('listDocuments()', () => {
    it('should list documents with pagination', async () => {
      const mockDoc = {
        id: 'doc-1',
        name: 'Test.pdf',
        description: 'desc',
        mimeType: 'application/pdf',
        size: BigInt(1024),
        contentHash: 'hash1',
        metadataHash: 'hash2',
        ownerId: mockUserId,
        creatorWalletId: mockWalletId,
        visibility: DocumentVisibility.PRIVATE,
        encryptedSymmetricKey: 'key123',
        encryptionIV: 'iv',
        encryptionAuthTag: 'tag',
        ipfsCid: 'QmTest',
        blockchainId: null,
        blockchainTxHash: null,
        publicId: null,
        blockchainStatus: BlockchainStatus.SYNCED,
        isArchived: false,
        isDeleted: false,
        archivedAt: null,
        folderId: null,
        tags: [],
        fileExtension: '.pdf',
        createdAt: new Date(),
        updatedAt: new Date(),
        owner: { id: mockUserId, username: 'testuser', fullName: 'Test User', avatarUrl: null },
      };

      (prisma.document.count as jest.Mock).mockResolvedValue(1);
      (prisma.document.findMany as jest.Mock).mockResolvedValue([mockDoc]);

      const result = await DocumentService.listDocuments(mockUserId, { page: 1, limit: 10 });

      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(1);
      expect(result.documents).toHaveLength(1);
      expect(result.documents[0].name).toBe('Test.pdf');
      expect(prisma.document.count).toHaveBeenCalled();
      expect(prisma.document.findMany).toHaveBeenCalled();
    });

    it('should apply fileType filter when provided', async () => {
      (prisma.document.count as jest.Mock).mockResolvedValue(0);
      (prisma.document.findMany as jest.Mock).mockResolvedValue([]);

      await DocumentService.listDocuments(mockUserId, { fileType: '.pdf' });

      const countWhere = (prisma.document.count as jest.Mock).mock.calls[0][0].where;
      expect(countWhere.fileExtension).toBe('.pdf');
    });

    it('should normalize fileType without dot', async () => {
      (prisma.document.count as jest.Mock).mockResolvedValue(0);
      (prisma.document.findMany as jest.Mock).mockResolvedValue([]);

      await DocumentService.listDocuments(mockUserId, { fileType: 'pdf' });

      const countWhere = (prisma.document.count as jest.Mock).mock.calls[0][0].where;
      expect(countWhere.fileExtension).toBe('.pdf');
    });

    it('should include archived documents when requested', async () => {
      (prisma.document.count as jest.Mock).mockResolvedValue(0);
      (prisma.document.findMany as jest.Mock).mockResolvedValue([]);

      await DocumentService.listDocuments(mockUserId, { includeArchived: true });

      const countWhere = (prisma.document.count as jest.Mock).mock.calls[0][0].where;
      expect(countWhere.isArchived).toBeUndefined();
    });

    it('should filter only archived when onlyArchived is set', async () => {
      (prisma.document.count as jest.Mock).mockResolvedValue(0);
      (prisma.document.findMany as jest.Mock).mockResolvedValue([]);

      await DocumentService.listDocuments(mockUserId, { onlyArchived: true });

      const countWhere = (prisma.document.count as jest.Mock).mock.calls[0][0].where;
      expect(countWhere.isArchived).toBe(true);
    });

    it('should filter by walletId', async () => {
      (prisma.document.count as jest.Mock).mockResolvedValue(0);
      (prisma.document.findMany as jest.Mock).mockResolvedValue([]);

      await DocumentService.listDocuments(mockUserId, { walletId: mockWalletId });

      const countWhere = (prisma.document.count as jest.Mock).mock.calls[0][0].where;
      expect(countWhere.creatorWalletId).toBe(mockWalletId);
    });

    it('should filter by folderId', async () => {
      (prisma.document.count as jest.Mock).mockResolvedValue(0);
      (prisma.document.findMany as jest.Mock).mockResolvedValue([]);

      await DocumentService.listDocuments(mockUserId, { folderId: 'folder-1' });

      const countWhere = (prisma.document.count as jest.Mock).mock.calls[0][0].where;
      expect(countWhere.folderId).toBe('folder-1');
    });
  });

  describe('getDocumentById()', () => {
    it('should return document for owner with OWNER role', async () => {
      const mockDoc = {
        id: mockDocId,
        name: 'Own Doc',
        description: 'desc',
        mimeType: 'text/plain',
        size: BigInt(100),
        contentHash: 'ch',
        metadataHash: 'mh',
        ownerId: mockUserId,
        creatorWalletId: mockWalletId,
        visibility: DocumentVisibility.PRIVATE,
        encryptedSymmetricKey: 'key',
        encryptionIV: 'iv',
        encryptionAuthTag: 'tag',
        ipfsCid: 'QmTest',
        blockchainId: null,
        blockchainTxHash: null,
        publicId: null,
        blockchainStatus: 'SYNCED',
        isArchived: false,
        isDeleted: false,
        archivedAt: null,
        folderId: null,
        tags: [],
        fileExtension: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        owner: { id: mockUserId, username: 'testuser', fullName: 'Test User', avatarUrl: null },
      };

      (prisma.document.findUnique as jest.Mock).mockResolvedValue(mockDoc);

      const result = await DocumentService.getDocumentById(mockDocId, mockUserId);

      expect(result).not.toBeNull();
      expect(result!.name).toBe('Own Doc');
      expect(result!.role).toBe('OWNER');
    });

    it('should return null when user has no access', async () => {
      (prisma.document.findUnique as jest.Mock).mockResolvedValue({
        id: mockDocId,
        ownerId: 'other-user',
        blockchainId: null,
        visibility: DocumentVisibility.PRIVATE,
        isDeleted: false,
      });

      (prisma.wallet.findMany as jest.Mock).mockResolvedValue([]);

      const result = await DocumentService.getDocumentById(mockDocId, mockUserId);

      expect(result).toBeNull();
    });

    it('should return null when document is deleted', async () => {
      (prisma.document.findUnique as jest.Mock).mockResolvedValue({
        id: mockDocId,
        ownerId: mockUserId,
        blockchainId: null,
        visibility: DocumentVisibility.PRIVATE,
        isDeleted: true,
      });

      const result = await DocumentService.getDocumentById(mockDocId, mockUserId);

      expect(result).toBeNull();
    });
  });

  describe('getDocumentsByWallet()', () => {
    it('should return documents for a valid wallet', async () => {
      (prisma.wallet.findFirst as jest.Mock).mockResolvedValue({
        id: mockWalletId,
        userId: mockUserId,
        walletAddress: '0xabcdef',
      });

      const mockDoc = {
        id: 'doc-wallet',
        name: 'Wallet Doc',
        description: null,
        mimeType: 'application/pdf',
        size: BigInt(500),
        contentHash: 'ch',
        metadataHash: 'mh',
        ownerId: mockUserId,
        creatorWalletId: mockWalletId,
        visibility: DocumentVisibility.PRIVATE,
        encryptedSymmetricKey: 'key',
        encryptionIV: null,
        encryptionAuthTag: null,
        ipfsCid: null,
        blockchainId: null,
        blockchainTxHash: null,
        publicId: null,
        blockchainStatus: 'SYNCED',
        isArchived: false,
        isDeleted: false,
        archivedAt: null,
        folderId: null,
        tags: [],
        fileExtension: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        owner: { id: mockUserId, username: 'testuser', fullName: 'Test User', avatarUrl: null },
      };

      (prisma.document.findMany as jest.Mock).mockResolvedValue([mockDoc]);

      const result = await DocumentService.getDocumentsByWallet(mockUserId, mockWalletId);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Wallet Doc');
    });

    it('should throw when wallet does not belong to user', async () => {
      (prisma.wallet.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(
        DocumentService.getDocumentsByWallet(mockUserId, 'wrong-wallet')
      ).rejects.toThrow('Wallet no encontrada');
    });
  });

  describe('getPublicDocumentByPublicId()', () => {
    it('should return public document info', async () => {
      const mockDoc = {
        id: 'pub-doc-1',
        publicId: 'pub123',
        blockchainId: mockBlockchainId,
        name: 'Public Doc',
        description: 'pub desc',
        mimeType: 'image/png',
        size: BigInt(2048),
        fileExtension: '.png',
        contentHash: 'ch',
        metadataHash: 'mh',
        visibility: DocumentVisibility.PUBLIC,
        isArchived: false,
        isDeleted: false,
        createdAt: new Date(),
        owner: { id: 'owner-1', username: 'owner', fullName: 'Owner', avatarUrl: null },
        versions: [
          {
            id: 'v1',
            versionNumber: 1,
            comment: 'First',
            createdAt: new Date(),
            isOperational: true,
            ipfsCid: 'QmVer',
            blockchainStatus: 'SYNCED',
          },
        ],
        signatures: [
          {
            id: 'sig1',
            versionId: 'v1',
            signedAt: new Date(),
            user: { username: 'signer1', fullName: 'Signer One' },
            version: { versionNumber: 1 },
          },
        ],
      };

      (prisma.document.findFirst as jest.Mock).mockResolvedValue(mockDoc);

      const result = await DocumentService.getPublicDocumentByPublicId('pub123');

      expect(result).not.toBeNull();
      expect(result!.name).toBe('Public Doc');
      expect(result!.versions).toHaveLength(1);
      expect(result!.signatures).toHaveLength(1);
    });

    it('should return null when not found', async () => {
      (prisma.document.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await DocumentService.getPublicDocumentByPublicId('unknown');

      expect(result).toBeNull();
    });
  });

  describe('downloadPublicDocumentByPublicId()', () => {
    it('should return file for public document with unencrypted version', async () => {
      const mockContent = Buffer.from('public content');
      const mockDoc = {
        id: 'pub-doc-2',
        name: 'Public File.txt',
        mimeType: 'text/plain',
        versions: [
          {
            id: 'v1',
            versionNumber: 1,
            isOperational: true,
            ipfsCid: 'QmPublic',
            encryptedSymmetricKey: 'UNENCRYPTED',
          },
        ],
      };

      (prisma.document.findFirst as jest.Mock).mockResolvedValue(mockDoc);
      (downloadFromIPFS as jest.Mock).mockResolvedValue(mockContent);

      const result = await DocumentService.downloadPublicDocumentByPublicId('pub123');

      expect(result.file).toEqual(mockContent);
      expect(result.name).toBe('Public File.txt');
      expect(result.mimeType).toBe('text/plain');
      expect(result.versionNumber).toBe(1);
    });

    it('should throw if version is encrypted', async () => {
      const mockDoc = {
        id: 'pub-doc-3',
        name: 'Encrypted File.txt',
        mimeType: 'text/plain',
        versions: [
          {
            id: 'v1',
            versionNumber: 1,
            isOperational: true,
            ipfsCid: 'QmEnc',
            encryptedSymmetricKey: 'key123',
          },
        ],
      };

      (prisma.document.findFirst as jest.Mock).mockResolvedValue(mockDoc);

      await expect(
        DocumentService.downloadPublicDocumentByPublicId('pub123')
      ).rejects.toThrow('no está publicada sin cifrado');
    });

    it('should throw if document not found', async () => {
      (prisma.document.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(
        DocumentService.downloadPublicDocumentByPublicId('unknown')
      ).rejects.toThrow('Documento público no encontrado');
    });
  });

  describe('markDocumentFailed()', () => {
    it('should update document status to FAILED', async () => {
      (prisma.document.update as jest.Mock).mockResolvedValue({});

      await DocumentService.markDocumentFailed(mockDocId, 'Blockchain error');

      expect(prisma.document.update).toHaveBeenCalledWith({
        where: { id: mockDocId },
        data: {
          blockchainStatus: BlockchainStatus.FAILED,
          blockchainError: 'Blockchain error',
        },
      });
    });
  });

  describe('markDocumentSynced()', () => {
    it('should update document status to SYNCED', async () => {
      (prisma.document.update as jest.Mock).mockResolvedValue({});

      await DocumentService.markDocumentSynced(mockDocId, mockBlockchainId);

      expect(prisma.document.update).toHaveBeenCalledWith({
        where: { id: mockDocId },
        data: {
          blockchainId: mockBlockchainId,
          blockchainStatus: BlockchainStatus.SYNCED,
        },
      });
    });
  });

  describe('rollbackDocument()', () => {
    it('should delete document, unpin IPFS CIDs, and log event', async () => {
      const mockDoc = {
        id: mockDocId,
        ownerId: mockUserId,
        versions: [
          { ipfsCid: 'QmVer1' },
          { ipfsCid: 'QmVer2' },
          { ipfsCid: null },
        ],
      };

      (prisma.document.findUnique as jest.Mock).mockResolvedValue(mockDoc);
      (prisma.document.delete as jest.Mock).mockResolvedValue({});
      (prisma.event.create as jest.Mock).mockResolvedValue({});
      (deleteFromIPFS as jest.Mock).mockResolvedValue(undefined);

      await DocumentService.rollbackDocument(mockDocId, mockUserId);

      expect(prisma.document.delete).toHaveBeenCalledWith({ where: { id: mockDocId } });
      expect(deleteFromIPFS).toHaveBeenCalledTimes(2);
      expect(deleteFromIPFS).toHaveBeenCalledWith('QmVer1');
      expect(deleteFromIPFS).toHaveBeenCalledWith('QmVer2');
      expect(prisma.event.create).toHaveBeenCalledTimes(1);
    });

    it('should throw if document not found', async () => {
      (prisma.document.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        DocumentService.rollbackDocument(mockDocId, mockUserId)
      ).rejects.toThrow('Document not found');
    });

    it('should throw if user is not owner', async () => {
      (prisma.document.findUnique as jest.Mock).mockResolvedValue({
        id: mockDocId,
        ownerId: 'other-user',
        versions: [],
      });

      await expect(
        DocumentService.rollbackDocument(mockDocId, mockUserId)
      ).rejects.toThrow('No tienes permiso para eliminar este documento');
    });
  });

  describe('downloadDocument() error paths', () => {
    it('should throw if user has no access', async () => {
      (prisma.document.findUnique as jest.Mock).mockResolvedValue({
        id: mockDocId,
        ownerId: 'other-user',
        blockchainId: null,
        visibility: DocumentVisibility.PRIVATE,
        isDeleted: false,
      });
      (prisma.wallet.findMany as jest.Mock).mockResolvedValue([]);

      await expect(
        DocumentService.downloadDocument(mockDocId, mockUserId)
      ).rejects.toThrow('Acceso denegado');
    });

    it('should throw if userHasAccess returns false for deleted document', async () => {
      (prisma.document.findUnique as jest.Mock).mockResolvedValue({
        id: mockDocId,
        ownerId: mockUserId,
        blockchainId: null,
        visibility: DocumentVisibility.PRIVATE,
        isDeleted: true,
      });
      (prisma.wallet.findMany as jest.Mock).mockResolvedValue([]);

      await expect(
        DocumentService.downloadDocument(mockDocId, mockUserId)
      ).rejects.toThrow('Acceso denegado');
    });
  });

  describe('userHasAccess()', () => {
    it('should return true for owner', async () => {
      (prisma.document.findUnique as jest.Mock).mockResolvedValue({
        ownerId: mockUserId,
        blockchainId: null,
        visibility: DocumentVisibility.PRIVATE,
        isDeleted: false,
      });

      const result = await DocumentService['userHasAccess'](mockDocId, mockUserId);
      expect(result).toBe(true);
    });

    it('should return true for public documents', async () => {
      (prisma.document.findUnique as jest.Mock).mockResolvedValue({
        ownerId: 'other-user',
        blockchainId: null,
        visibility: DocumentVisibility.PUBLIC,
        isDeleted: false,
      });

      const result = await DocumentService['userHasAccess'](mockDocId, mockUserId);
      expect(result).toBe(true);
    });

    it('should return false for non-owner private documents', async () => {
      (prisma.document.findUnique as jest.Mock).mockResolvedValue({
        ownerId: 'other-user',
        blockchainId: null,
        visibility: DocumentVisibility.PRIVATE,
        isDeleted: false,
      });

      const result = await DocumentService['userHasAccess'](mockDocId, mockUserId);
      expect(result).toBe(false);
    });

    it('should return false when document not found', async () => {
      (prisma.document.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await DocumentService['userHasAccess'](mockDocId, mockUserId);
      expect(result).toBe(false);
    });
  });
});
