// Mock blockchain config BEFORE imports
jest.mock('../../src/config/blockchain', () => ({
  __esModule: true,
  getContracts: jest.fn(),
  getDocumentRegistryContract: jest.fn(),
}));

import { BlockchainQueries } from '../../src/lib/blockchain/queries';
import { getContracts } from '../../src/config/blockchain';
import { ethers } from 'ethers';
import { NotFoundError, BlockchainError } from '../../src/utils/errors';

describe('BlockchainQueries', () => {
  let mockContracts: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock contracts - consolidated DocumentRegistry only
    mockContracts = {
      documentRegistry: {
        getDocument: jest.fn(),
        getVersion: jest.fn(),
        getVersionSignatures: jest.fn(),
        getUserPermission: jest.fn(),
        canView: jest.fn(),
        canEdit: jest.fn(),
        isOwner: jest.fn(),
        getUserDocuments: jest.fn(),
      },
      documentVersioning: {
        getVersion: jest.fn(),
      },
      documentSigning: {
        getVersionSignatures: jest.fn(),
      },
      documentAccessControl: {
        getUserPermission: jest.fn(),
      },
    };

    (getContracts as jest.Mock).mockReturnValue(mockContracts);
  });

  describe('getDocument', () => {
    it('should return document data from blockchain using getDocument()', async () => {
      const mockDoc = {
        owner: '0xOwner123',
        docId: '0xDoc123',
        latestVersion: BigInt(3),
        isArchived: false,
        isDeleted: false,
        createdAt: BigInt(1700000000),
        updatedAt: BigInt(1700000100),
      };

      mockContracts.documentRegistry.getDocument.mockResolvedValue(mockDoc);

      const result = await BlockchainQueries.getDocument('0xDoc123');

      expect(result).toEqual({
        owner: '0xOwner123',
        docId: '0xDoc123',
        latestVersion: BigInt(3),
        isArchived: false,
        isDeleted: false,
        createdAt: new Date(1700000000 * 1000),
        updatedAt: new Date(1700000100 * 1000),
      });
      expect(mockContracts.documentRegistry.getDocument).toHaveBeenCalledWith('0xDoc123');
    });

    it('should throw NotFoundError if document does not exist', async () => {
      mockContracts.documentRegistry.getDocument.mockResolvedValue({
        owner: ethers.ZeroAddress,
      });

      await expect(
        BlockchainQueries.getDocument('0xNonExistent')
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw BlockchainError on contract error', async () => {
      mockContracts.documentRegistry.getDocument.mockRejectedValue(new Error('Network error'));

      await expect(
        BlockchainQueries.getDocument('0xDoc123')
      ).rejects.toThrow(BlockchainError);
    });
  });

  describe('getAllVersions', () => {
    it('should return all versions for a document using getVersion loop', async () => {
      const mockDoc = {
        owner: '0xOwner',
        latestVersion: BigInt(2),
      };

      const mockVersions = [
        {
          versionNumber: BigInt(1),
          ipfsCid: 'Qm1',
          createdBy: '0xUser1',
          createdAt: BigInt(1700000000),
          isOperational: false,
          restoredFrom: BigInt(0),
        },
        {
          versionNumber: BigInt(2),
          ipfsCid: 'Qm2',
          createdBy: '0xUser2',
          createdAt: BigInt(1700000100),
          isOperational: true,
          restoredFrom: BigInt(0),
        },
      ];

      mockContracts.documentRegistry.getDocument.mockResolvedValue(mockDoc);
      mockContracts.documentRegistry.getVersion
        .mockResolvedValueOnce(mockVersions[0])
        .mockResolvedValueOnce(mockVersions[1]);

      const result = await BlockchainQueries.getAllVersions('0xDoc123');

      expect(result).toHaveLength(2);
      expect(result[0].versionNumber).toBe(1);
      expect(result[1].versionNumber).toBe(2);
      expect(result[1].isOperational).toBe(true);
    });

    it('should throw NotFoundError if document does not exist', async () => {
      mockContracts.documentRegistry.getDocument.mockResolvedValue({
        owner: ethers.ZeroAddress,
      });

      await expect(
        BlockchainQueries.getAllVersions('0xNonExistent')
      ).rejects.toThrow(NotFoundError);
    });

    it('should handle documents with no versions', async () => {
      const mockDoc = {
        owner: '0xOwner',
        latestVersion: BigInt(0),
      };

      mockContracts.documentRegistry.getDocument.mockResolvedValue(mockDoc);

      const result = await BlockchainQueries.getAllVersions('0xDoc123');

      expect(result).toEqual([]);
    });

    it('should continue on individual version errors', async () => {
      const mockDoc = {
        owner: '0xOwner',
        latestVersion: BigInt(2),
      };

      const mockVersion1 = {
        versionNumber: BigInt(1),
        ipfsCid: 'Qm1',
        createdBy: '0xUser1',
        createdAt: BigInt(1700000000),
        isOperational: true,
        restoredFrom: BigInt(0),
      };

      mockContracts.documentRegistry.getDocument.mockResolvedValue(mockDoc);
      mockContracts.documentRegistry.getVersion
        .mockResolvedValueOnce(mockVersion1)
        .mockRejectedValueOnce(new Error('Version 2 not found'));

      const result = await BlockchainQueries.getAllVersions('0xDoc123');

      expect(result).toHaveLength(1);
      expect(result[0].versionNumber).toBe(1);
    });
  });

  describe('getVersion', () => {
    it('should return specific version data using getVersion()', async () => {
      const mockVersion = {
        versionNumber: BigInt(2),
        ipfsCid: 'Qm2',
        createdBy: '0xUser1',
        createdAt: BigInt(1700000100),
        isOperational: true,
        restoredFrom: BigInt(0),
      };

      mockContracts.documentRegistry.getVersion.mockResolvedValue(mockVersion);

      const result = await BlockchainQueries.getVersion('0xDoc123', 2);

      expect(result).toEqual({
        docId: '0xDoc123',
        versionNumber: 2,
        ipfsCid: 'Qm2',
        createdBy: '0xUser1',
        createdAt: new Date(1700000100 * 1000),
        isOperational: true,
        restoredFrom: 0,
      });
      expect(mockContracts.documentRegistry.getVersion).toHaveBeenCalledWith('0xDoc123', 2);
    });

    it('should throw NotFoundError if version does not exist', async () => {
      mockContracts.documentRegistry.getVersion.mockResolvedValue({
        createdBy: ethers.ZeroAddress,
      });

      await expect(
        BlockchainQueries.getVersion('0xDoc123', 5)
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw BlockchainError on contract error', async () => {
      mockContracts.documentRegistry.getVersion.mockRejectedValue(
        new Error('Contract error')
      );

      await expect(
        BlockchainQueries.getVersion('0xDoc123', 1)
      ).rejects.toThrow(BlockchainError);
    });
  });

  describe('getOperationalVersion', () => {
    it('should return operational version', async () => {
      const mockDoc = {
        owner: '0xOwner',
        latestVersion: BigInt(3),
      };

      const mockVersions = [
        {
          versionNumber: BigInt(1),
          ipfsCid: 'Qm1',
          createdBy: '0xUser1',
          createdAt: BigInt(1700000000),
          isOperational: false,
          restoredFrom: BigInt(0),
        },
        {
          versionNumber: BigInt(2),
          ipfsCid: 'Qm2',
          createdBy: '0xUser2',
          createdAt: BigInt(1700000100),
          isOperational: true,
          restoredFrom: BigInt(0),
        },
      ];

      mockContracts.documentRegistry.getDocument.mockResolvedValue(mockDoc);
      mockContracts.documentRegistry.getVersion
        .mockResolvedValueOnce(mockVersions[0])
        .mockResolvedValueOnce(mockVersions[1]);

      const result = await BlockchainQueries.getOperationalVersion('0xDoc123');

      expect(result).not.toBeNull();
      expect(result?.versionNumber).toBe(2);
      expect(result?.isOperational).toBe(true);
    });

    it('should return null if no operational version exists', async () => {
      const mockDoc = {
        owner: '0xOwner',
        latestVersion: BigInt(2),
      };

      const mockVersions = [
        {
          versionNumber: BigInt(1),
          ipfsCid: 'Qm1',
          createdBy: '0xUser1',
          createdAt: BigInt(1700000000),
          isOperational: false,
          restoredFrom: BigInt(0),
        },
        {
          versionNumber: BigInt(2),
          ipfsCid: 'Qm2',
          createdBy: '0xUser2',
          createdAt: BigInt(1700000100),
          isOperational: false,
          restoredFrom: BigInt(0),
        },
      ];

      mockContracts.documentRegistry.getDocument.mockResolvedValue(mockDoc);
      mockContracts.documentRegistry.getVersion
        .mockResolvedValueOnce(mockVersions[0])
        .mockResolvedValueOnce(mockVersions[1]);

      const result = await BlockchainQueries.getOperationalVersion('0xDoc123');

      expect(result).toBeNull();
    });
  });

  describe('getVersionSignatures', () => {
    it('should return all signatures for a version using documentRegistry', async () => {
      const mockSignatures = [
        {
          signer: '0xSigner1',
          signature: new Uint8Array([1, 2, 3]),
          message: 'Approved',
          comment: 'Looks good',
          timestamp: BigInt(1700000000),
        },
        {
          signer: '0xSigner2',
          signature: new Uint8Array([4, 5, 6]),
          message: 'Approved',
          comment: 'LGTM',
          timestamp: BigInt(1700000100),
        },
      ];

      mockContracts.documentRegistry.getVersionSignatures.mockResolvedValue(mockSignatures);

      const result = await BlockchainQueries.getVersionSignatures('0xDoc123', 1);

      expect(result).toHaveLength(2);
      expect(result[0].signer).toBe('0xSigner1');
      expect(result[1].signer).toBe('0xSigner2');
      expect(result[0].timestamp).toEqual(new Date(1700000000 * 1000));
      expect(mockContracts.documentRegistry.getVersionSignatures).toHaveBeenCalledWith('0xDoc123', 1);
    });

    it('should return empty array if no signatures', async () => {
      mockContracts.documentRegistry.getVersionSignatures.mockResolvedValue([]);

      const result = await BlockchainQueries.getVersionSignatures('0xDoc123', 1);

      expect(result).toEqual([]);
    });

    it('should throw BlockchainError on contract error', async () => {
      mockContracts.documentRegistry.getVersionSignatures.mockRejectedValue(
        new Error('Contract error')
      );

      await expect(
        BlockchainQueries.getVersionSignatures('0xDoc123', 1)
      ).rejects.toThrow(BlockchainError);
    });
  });

  describe('getSignature', () => {
    it('should return specific signature', async () => {
      const mockSignatures = [
        {
          signer: '0xSigner1',
          signature: new Uint8Array([1, 2, 3]),
          message: 'Approved',
          comment: 'Good',
          timestamp: BigInt(1700000000),
        },
      ];

      mockContracts.documentRegistry.getVersionSignatures.mockResolvedValue(mockSignatures);

      const result = await BlockchainQueries.getSignature('0xDoc123', 1, '0xSigner1');

      expect(result.signer).toBe('0xSigner1');
      expect(result.message).toBe('Approved');
    });

    it('should handle case-insensitive address matching', async () => {
      const mockSignatures = [
        {
          signer: '0xSIGNER1',
          signature: new Uint8Array([1, 2, 3]),
          message: 'Approved',
          comment: 'Good',
          timestamp: BigInt(1700000000),
        },
      ];

      mockContracts.documentRegistry.getVersionSignatures.mockResolvedValue(mockSignatures);

      const result = await BlockchainQueries.getSignature('0xDoc123', 1, '0xsigner1');

      expect(result.signer).toBe('0xSIGNER1');
    });

    it('should throw NotFoundError if signature not found', async () => {
      mockContracts.documentRegistry.getVersionSignatures.mockResolvedValue([]);

      await expect(
        BlockchainQueries.getSignature('0xDoc123', 1, '0xNonExistent')
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('hasUserSigned', () => {
    it('should return true if user has signed', async () => {
      const mockSignatures = [
        {
          signer: '0xSigner1',
          signature: new Uint8Array([1, 2, 3]),
          message: 'Approved',
          comment: 'Looks good',
          timestamp: BigInt(1700000000),
        },
      ];

      mockContracts.documentRegistry.getVersionSignatures.mockResolvedValue(mockSignatures);

      const result = await BlockchainQueries.hasUserSigned('0xDoc123', 1, '0xSigner1');

      expect(result).toBe(true);
    });

    it('should return false if user has not signed', async () => {
      mockContracts.documentRegistry.getVersionSignatures.mockResolvedValue([]);

      const result = await BlockchainQueries.hasUserSigned('0xDoc123', 1, '0xSigner1');

      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      mockContracts.documentRegistry.getVersionSignatures.mockRejectedValue(new Error('Error'));

      const result = await BlockchainQueries.hasUserSigned('0xDoc123', 1, '0xSigner1');

      expect(result).toBe(false);
    });
  });

  describe('getUserRole', () => {
    it('should return DOCUMENT_OWNER role', async () => {
      // getUserPermission returns DocumentRole enum: 3=OWNER
      mockContracts.documentRegistry.getUserPermission.mockResolvedValue(3);

      const result = await BlockchainQueries.getUserRole('0xDoc123', '0xOwner');

      expect(result).toBe('DOCUMENT_OWNER');
    });

    it('should return DOCUMENT_SHARED_WRITE role', async () => {
      // getUserPermission returns 2=EDITOR
      mockContracts.documentRegistry.getUserPermission.mockResolvedValue(2);

      const result = await BlockchainQueries.getUserRole('0xDoc123', '0xEditor');

      expect(result).toBe('DOCUMENT_SHARED_WRITE');
    });

    it('should return DOCUMENT_SHARED_READ role', async () => {
      // getUserPermission returns 1=VIEWER
      mockContracts.documentRegistry.getUserPermission.mockResolvedValue(1);

      const result = await BlockchainQueries.getUserRole('0xDoc123', '0xViewer');

      expect(result).toBe('DOCUMENT_SHARED_READ');
    });

    it('should return null if user has no role', async () => {
      // getUserPermission returns 0=NONE
      mockContracts.documentRegistry.getUserPermission.mockResolvedValue(0);

      const result = await BlockchainQueries.getUserRole('0xDoc123', '0xNoAccess');

      expect(result).toBeNull();
    });

    it('should return null on error', async () => {
      mockContracts.documentRegistry.getUserPermission.mockRejectedValue(new Error('Error'));

      const result = await BlockchainQueries.getUserRole('0xDoc123', '0xUser');

      expect(result).toBeNull();
    });
  });

  describe('canRead', () => {
    it('should return true if user can read', async () => {
      mockContracts.documentRegistry.canView.mockResolvedValue(true);

      const result = await BlockchainQueries.canRead('0xDoc123', '0xUser1');

      expect(result).toBe(true);
    });

    it('should return false if user cannot read', async () => {
      mockContracts.documentRegistry.canView.mockResolvedValue(false);

      const result = await BlockchainQueries.canRead('0xDoc123', '0xUser1');

      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      mockContracts.documentRegistry.canView.mockRejectedValue(new Error('Error'));

      const result = await BlockchainQueries.canRead('0xDoc123', '0xUser1');

      expect(result).toBe(false);
    });
  });

  describe('canWrite', () => {
    it('should return true if user can write', async () => {
      mockContracts.documentRegistry.canEdit.mockResolvedValue(true);

      const result = await BlockchainQueries.canWrite('0xDoc123', '0xEditor');

      expect(result).toBe(true);
    });

    it('should return false if user cannot write', async () => {
      mockContracts.documentRegistry.canEdit.mockResolvedValue(false);

      const result = await BlockchainQueries.canWrite('0xDoc123', '0xViewer');

      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      mockContracts.documentRegistry.canEdit.mockRejectedValue(new Error('Error'));

      const result = await BlockchainQueries.canWrite('0xDoc123', '0xUser1');

      expect(result).toBe(false);
    });
  });

  describe('canSign', () => {
    it('should return true if user can sign (has read access)', async () => {
      mockContracts.documentRegistry.canView.mockResolvedValue(true);

      const result = await BlockchainQueries.canSign('0xDoc123', '0xSigner');

      expect(result).toBe(true);
    });

    it('should return false if user cannot sign', async () => {
      mockContracts.documentRegistry.canView.mockResolvedValue(false);

      const result = await BlockchainQueries.canSign('0xDoc123', '0xNoAccess');

      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      mockContracts.documentRegistry.canView.mockRejectedValue(new Error('Error'));

      const result = await BlockchainQueries.canSign('0xDoc123', '0xUser1');

      expect(result).toBe(false);
    });
  });

  describe('isOwner', () => {
    it('should return true if user is owner', async () => {
      mockContracts.documentRegistry.isOwner.mockResolvedValue(true);

      const result = await BlockchainQueries.isOwner('0xDoc123', '0xOwner');

      expect(result).toBe(true);
    });

    it('should return false if user is not owner', async () => {
      mockContracts.documentRegistry.isOwner.mockResolvedValue(false);

      const result = await BlockchainQueries.isOwner('0xDoc123', '0xUser1');

      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      mockContracts.documentRegistry.isOwner.mockRejectedValue(new Error('Error'));

      const result = await BlockchainQueries.isOwner('0xDoc123', '0xUser1');

      expect(result).toBe(false);
    });
  });

  describe('canShare', () => {
    it('should return true if user is owner (can share)', async () => {
      mockContracts.documentRegistry.isOwner.mockResolvedValue(true);

      const result = await BlockchainQueries.canShare('0xDoc123', '0xOwner');

      expect(result).toBe(true);
    });

    it('should return false if user is not owner (cannot share)', async () => {
      mockContracts.documentRegistry.isOwner.mockResolvedValue(false);

      const result = await BlockchainQueries.canShare('0xDoc123', '0xUser1');

      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      mockContracts.documentRegistry.isOwner.mockRejectedValue(new Error('Error'));

      const result = await BlockchainQueries.canShare('0xDoc123', '0xUser1');

      expect(result).toBe(false);
    });
  });

  describe('getUserDocuments', () => {
    it('should return array of document IDs', async () => {
      const mockDocs = ['0xDoc1', '0xDoc2', '0xDoc3'];
      mockContracts.documentRegistry.getUserDocuments.mockResolvedValue(mockDocs);
      mockContracts.documentRegistry.canView.mockResolvedValue(true);

      const result = await BlockchainQueries.getUserDocuments('0xUser1');

      expect(result).toEqual(mockDocs);
      expect(mockContracts.documentRegistry.getUserDocuments).toHaveBeenCalledWith('0xUser1');
      expect(mockContracts.documentRegistry.canView).toHaveBeenCalledTimes(mockDocs.length);
    });

    it('should return empty array if user has no documents', async () => {
      mockContracts.documentRegistry.getUserDocuments.mockResolvedValue([]);

      const result = await BlockchainQueries.getUserDocuments('0xUser1');

      expect(result).toEqual([]);
    });

    it('should return empty array on error', async () => {
      mockContracts.documentRegistry.getUserDocuments.mockRejectedValue(new Error('Error'));

      const result = await BlockchainQueries.getUserDocuments('0xUser1');

      expect(result).toEqual([]);
    });
  });
});
