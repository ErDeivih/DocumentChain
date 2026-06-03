/**
 * Tests for DocumentService - Backend Encryption Flow
 * Tests the prepare/confirm pattern with backend encryption
 */

import { DocumentService } from '../documentService';
import prisma from '../../config/database';
import { uploadToIPFS } from '../../config/ipfs';
import crypto from 'crypto';

// Mock dependencies
jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    $transaction: jest.fn(),
    wallet: {
      findFirst: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    document: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    version: {
      findFirst: jest.fn(),
      create: jest.fn(),
      updateMany: jest.fn(),
    },
    documentStats: {
      update: jest.fn().mockRejectedValue(new Error('no stats')),
    },
    event: {
      create: jest.fn(),
      findFirst: jest.fn(),
    },
  },
}));

jest.mock('../../config/ipfs', () => ({
  uploadToIPFS: jest.fn(),
  downloadFromIPFS: jest.fn(),
  deleteFromIPFS: jest.fn(),
}));

jest.mock('../../config/blockchain', () => ({
  provider: {},
}));

// Unmock encryption to test real encryption
jest.unmock('../../lib/encryption');

jest.mock('../../utils/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('DocumentService - Backend Encryption', () => {
  const mockUserId = 'user-123';
  const mockWalletId = 'wallet-456';
  const mockWalletAddress = '0x1234567890abcdef';
  const mockPublicKey = crypto.generateKeyPairSync('rsa', {
    modulusLength: 4096,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  }).publicKey;

  beforeEach(() => {
    jest.clearAllMocks();
    (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => callback(prisma));
    (prisma.version.findFirst as jest.Mock).mockResolvedValue({ id: 'existing-version-id' });
    (prisma.event.findFirst as jest.Mock).mockResolvedValue({
      id: 'prepared-event-id',
      metadata: { ipfsCid: 'QmPreparedCID' },
    });
  });

  describe('prepareDocument()', () => {
    it('should encrypt file and upload to IPFS', async () => {
      // Mock data
      const fileBuffer = Buffer.from('Test document content for backend encryption', 'utf-8');
      const input = {
        name: 'Test Document.pdf',
        description: 'Test description',
        mimeType: 'application/pdf',
        fileBuffer,
        ownerId: mockUserId,
        walletId: mockWalletId,
        fileExtension: 'pdf',
      };

      // Mock database responses
      (prisma.wallet.findFirst as jest.Mock).mockResolvedValue({
        id: mockWalletId,
        userId: mockUserId,
        walletAddress: mockWalletAddress,
      });

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: mockUserId,
        publicKey: mockPublicKey,
      });

      (uploadToIPFS as jest.Mock).mockResolvedValue('QmTestCID123abc');

      (prisma.document.create as jest.Mock).mockImplementation((args) => {
        return Promise.resolve({
          id: 'doc-uuid-123',
          ...args.data,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      });

      (prisma.event.create as jest.Mock).mockResolvedValue({});

      // Execute
      const result = await DocumentService.prepareDocument(input);

      // Verify structure
      expect(result).toHaveProperty('docId');
      expect(result).toHaveProperty('ipfsCid');
      expect(result).toHaveProperty('documentId');

      // Verify docId is bytes32 format
      expect(result.docId).toMatch(/^0x[a-f0-9]{64}$/);

      // Verify IPFS CID returned
      expect(result.ipfsCid).toBe('QmTestCID123abc');

      // Verify wallet validation was called
      expect(prisma.wallet.findFirst).toHaveBeenCalledWith({
        where: { id: mockWalletId, userId: mockUserId },
      });

      // Verify user public key was retrieved
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUserId },
        select: { id: true, publicKey: true },
      });

      // Verify uploadToIPFS was called with encrypted data
      expect(uploadToIPFS).toHaveBeenCalledTimes(1);
      const uploadedData = (uploadToIPFS as jest.Mock).mock.calls[0][0];
      expect(uploadedData).toBeInstanceOf(Buffer);
      expect(uploadedData).not.toEqual(fileBuffer); // Should be encrypted

      // Verify document was created in DB
      expect(prisma.document.create).toHaveBeenCalledTimes(1);
      const createArgs = (prisma.document.create as jest.Mock).mock.calls[0][0];
      expect(createArgs.data).toMatchObject({
        name: input.name,
        description: input.description,
        mimeType: input.mimeType,
        ownerId: mockUserId,
        creatorWalletId: mockWalletId,
        blockchainStatus: 'PREPARING',
      });

      // Verify encryption metadata was stored
      expect(createArgs.data.encryptedSymmetricKey).toBeDefined();
      expect(createArgs.data.encryptionIV).toBeDefined();
      expect(createArgs.data.encryptionAuthTag).toBeDefined();
      expect(createArgs.data.contentHash).toBeDefined();
      expect(createArgs.data.metadataHash).toBeDefined();

      // Verify event was logged
      expect(prisma.event.create).toHaveBeenCalledTimes(1);
    });

    it('should reject if wallet does not belong to user', async () => {
      const input = {
        name: 'Test.pdf',
        mimeType: 'application/pdf',
        fileBuffer: Buffer.from('content'),
        ownerId: mockUserId,
        walletId: 'wrong-wallet-id',
      };

      (prisma.wallet.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(DocumentService.prepareDocument(input)).rejects.toThrow(
        'Wallet no encontrada o no pertenece al usuario'
      );
    });

    it('should reject if user has no public key', async () => {
      const input = {
        name: 'Test.pdf',
        mimeType: 'application/pdf',
        fileBuffer: Buffer.from('content'),
        ownerId: mockUserId,
        walletId: mockWalletId,
      };

      (prisma.wallet.findFirst as jest.Mock).mockResolvedValue({
        id: mockWalletId,
        userId: mockUserId,
      });

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: mockUserId,
        publicKey: null, // No public key
      });

      await expect(DocumentService.prepareDocument(input)).rejects.toThrow(
        'Usuario no tiene clave pública configurada'
      );
    });

    it('should reject files exceeding size limit', async () => {
      const largeFileBuffer = Buffer.alloc(150 * 1024 * 1024); // 150MB
      const input = {
        name: 'Large.pdf',
        mimeType: 'application/pdf',
        fileBuffer: largeFileBuffer,
        ownerId: mockUserId,
        walletId: mockWalletId,
      };

      (prisma.wallet.findFirst as jest.Mock).mockResolvedValue({
        id: mockWalletId,
        userId: mockUserId,
      });

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: mockUserId,
        publicKey: mockPublicKey,
      });

      await expect(DocumentService.prepareDocument(input)).rejects.toThrow('File size exceeds maximum allowed size');
    });
  });

  describe('confirmDocument()', () => {
    it('should update document status to SYNCED after blockchain confirmation', async () => {
      const input = {
        documentId: 'doc-uuid-123',
        txHash: '0xabcdef1234567890',
        blockchainId: '0x' + 'a'.repeat(64),
        confirmerUserId: mockUserId,
      };

      (prisma.document.findUnique as jest.Mock).mockResolvedValue({
        id: input.documentId,
        blockchainStatus: 'PREPARING',
        ownerId: mockUserId,
      });

      (prisma.document.update as jest.Mock).mockResolvedValue({
        id: input.documentId,
        blockchainId: input.blockchainId,
        blockchainTxHash: input.txHash,
        blockchainStatus: 'SYNCED',
      });

      (prisma.event.create as jest.Mock).mockResolvedValue({});

      await DocumentService.confirmDocument(input);

      // Verify document was updated with TX_SUBMITTED (event listener later sets SYNCED)
      expect(prisma.document.update).toHaveBeenCalledWith({
        where: { id: input.documentId },
        data: {
          blockchainId: input.blockchainId,
          blockchainTxHash: input.txHash,
          blockchainStatus: 'TX_SUBMITTED',
        },
      });

      // Verify event was logged
      expect(prisma.event.create).toHaveBeenCalledTimes(1);
    });

    it('should reject confirmation if document not found', async () => {
      const input = {
        documentId: 'non-existent-doc',
        txHash: '0xabc',
        blockchainId: '0x123',
        confirmerUserId: mockUserId,
      };

      (prisma.document.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(DocumentService.confirmDocument(input)).rejects.toThrow(
        'Documento no encontrado'
      );
    });

    it('should reject confirmation if user is not owner', async () => {
      const input = {
        documentId: 'foreign-doc',
        txHash: '0xabc',
        blockchainId: '0x123',
        confirmerUserId: mockUserId,
      };

      (prisma.document.findUnique as jest.Mock).mockResolvedValue({
        id: input.documentId,
        ownerId: 'other-user',
        blockchainStatus: 'PREPARING',
      });

      await expect(DocumentService.confirmDocument(input)).rejects.toThrow(
        'No tienes permisos para confirmar este documento'
      );
    });
  });

  describe('downloadDocument()', () => {
    it('should return encrypted file with metadata', async () => {
      const mockDocId = 'doc-123';
      const mockEncryptedData = Buffer.from('encrypted-content-from-ipfs');
      const mockEncryptedKey = 'base64-encrypted-symmetric-key';

      const mockDoc = {
        id: mockDocId,
        name: 'Document.pdf',
        mimeType: 'application/pdf',
        encryptedSymmetricKey: mockEncryptedKey,
        ownerId: mockUserId,
        blockchainId: null,
        versions: [
          { id: 'version-1', ipfsCid: 'QmTestCID', encryptedSymmetricKey: mockEncryptedKey },
        ],
      };

      // userHasAccess uses findUnique; downloadDocument uses findFirst
      (prisma.document.findUnique as jest.Mock).mockResolvedValue(mockDoc);
      (prisma.document.findFirst as jest.Mock).mockResolvedValue(mockDoc);

      const { downloadFromIPFS } = require('../../config/ipfs');
      (downloadFromIPFS as jest.Mock).mockResolvedValue(mockEncryptedData);

      const result = await DocumentService.downloadDocument(mockDocId, mockUserId);

      // Verify result structure
      expect(result).toMatchObject({
        encryptedFile: mockEncryptedData,
        encryptedSymmetricKey: mockEncryptedKey,
        name: 'Document.pdf',
        mimeType: 'application/pdf',
      });

      // Verify IPFS download was called
      expect(downloadFromIPFS).toHaveBeenCalledWith('QmTestCID');
    });

    it('should prefer operational version encryption metadata over document-level metadata', async () => {
      const mockDocId = 'doc-operational-123';
      const mockEncryptedData = Buffer.from('encrypted-operational-version');

      const mockDoc = {
        id: mockDocId,
        name: 'Operational.pdf',
        mimeType: 'application/pdf',
        encryptedSymmetricKey: 'document-level-key',
        encryptionIV: 'document-level-iv',
        encryptionAuthTag: 'document-level-auth',
        ownerId: mockUserId,
        blockchainId: null,
        versions: [
          {
            id: 'version-operational',
            ipfsCid: 'QmOperationalCID',
            encryptedSymmetricKey: 'version-level-key',
            encryptionIV: 'version-level-iv',
            encryptionAuthTag: 'version-level-auth',
          },
        ],
      };

      (prisma.document.findUnique as jest.Mock).mockResolvedValue(mockDoc);

      const { downloadFromIPFS } = require('../../config/ipfs');
      (downloadFromIPFS as jest.Mock).mockResolvedValue(mockEncryptedData);

      const result = await DocumentService.downloadDocument(mockDocId, mockUserId);

      expect(result.encryptedSymmetricKey).toBe('version-level-key');
      expect(result.encryptionIV).toBe('version-level-iv');
      expect(result.encryptionAuthTag).toBe('version-level-auth');
    });

    it('should expose legacy documents without encryption metadata as unencrypted downloads', async () => {
      const mockDocId = 'doc-legacy-123';
      const mockPlainData = Buffer.from('legacy-plain-document');

      const mockDoc = {
        id: mockDocId,
        name: 'Legacy.txt',
        mimeType: 'text/plain',
        encryptedSymmetricKey: null,
        encryptionIV: null,
        encryptionAuthTag: null,
        ownerId: mockUserId,
        blockchainId: null,
        versions: [
          {
            id: 'version-legacy',
            ipfsCid: 'QmLegacyCID',
            encryptedSymmetricKey: null,
            encryptionIV: null,
            encryptionAuthTag: null,
          },
        ],
      };

      (prisma.document.findUnique as jest.Mock).mockResolvedValue(mockDoc);

      const { downloadFromIPFS } = require('../../config/ipfs');
      (downloadFromIPFS as jest.Mock).mockResolvedValue(mockPlainData);

      const result = await DocumentService.downloadDocument(mockDocId, mockUserId);

      expect(result.encryptedSymmetricKey).toBe('UNENCRYPTED');
      expect(result.encryptionIV).toBeNull();
      expect(result.encryptionAuthTag).toBeNull();
      expect(result.encryptedFile).toEqual(mockPlainData);
    });
  });

  describe('End-to-End Flow', () => {
    it('should complete prepare → confirm → download cycle', async () => {
      const originalContent = Buffer.from('Complete flow test document', 'utf-8');
      
      // Setup mocks
      (prisma.wallet.findFirst as jest.Mock).mockResolvedValue({
        id: mockWalletId,
        userId: mockUserId,
        walletAddress: mockWalletAddress,
      });

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: mockUserId,
        publicKey: mockPublicKey,
      });

      (uploadToIPFS as jest.Mock).mockResolvedValue('QmFlowTestCID');

      let createdDocument: any;
      (prisma.document.create as jest.Mock).mockImplementation((args) => {
        createdDocument = {
          ...args.data,
          id: 'flow-doc-id',
        };
        return Promise.resolve(createdDocument);
      });

      (prisma.event.create as jest.Mock).mockResolvedValue({});

      // Step 1: Prepare
      const prepareResult = await DocumentService.prepareDocument({
        name: 'Flow Test.pdf',
        mimeType: 'application/pdf',
        fileBuffer: originalContent,
        ownerId: mockUserId,
        walletId: mockWalletId,
      });

      expect(prepareResult.documentId).toBe('flow-doc-id');
      expect(prepareResult.ipfsCid).toBe('QmFlowTestCID');

      // Step 2: Confirm (simulating frontend blockchain transaction)
      (prisma.document.findUnique as jest.Mock).mockResolvedValue(createdDocument);
      (prisma.document.update as jest.Mock).mockResolvedValue({
        ...createdDocument,
        blockchainId: '0xblockchainid',
        blockchainStatus: 'SYNCED',
      });

      await DocumentService.confirmDocument({
        documentId: prepareResult.documentId,
        txHash: '0xtxhash',
        blockchainId: '0xblockchainid',
        confirmerUserId: mockUserId,
      });

      // Verify document is now TX_SUBMITTED (SYNCED set by event listener)
      expect(prisma.document.update).toHaveBeenCalledWith({
        where: { id: 'flow-doc-id' },
        data: expect.objectContaining({
          blockchainStatus: 'TX_SUBMITTED',
        }),
      });
    });
  });
});
