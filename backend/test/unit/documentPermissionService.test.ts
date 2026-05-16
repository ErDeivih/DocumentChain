// Remove ethers mock - will use real ethers.isAddress for integration testing

// Mock blockchain config - MUST be before imports
jest.mock('../../src/config/blockchain', () => ({
  __esModule: true,
  getDocumentRegistryContract: jest.fn(),
  getContracts: jest.fn(),
}));

// Mock Prisma client used by DocumentPermissionService soft-delete check
const mockPrisma = {
  document: {
    findFirst: jest.fn().mockResolvedValue(null),
  },
  $extends: jest.fn().mockReturnThis(),
  wallet: {
    findFirst: jest.fn(),
  },
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma),
}));

jest.mock('../../src/lib/blockchain/queries', () => ({
  BlockchainQueries: {
    getUserRole: jest.fn(),
    canRead: jest.fn(),
    canWrite: jest.fn(),
    isOwner: jest.fn(),
    getUserDocuments: jest.fn().mockResolvedValue([]),
  },
}));

// Now safe to import
import { DocumentPermissionService, DocumentRole } from '../../src/services/documentPermissionService';
import { BlockchainQueries } from '../../src/lib/blockchain/queries';
import { getDocumentRegistryContract } from '../../src/config/blockchain';
import * as ethers from 'ethers';

// Valid Ethereum addresses for testing (42 characters: 0x + 40 hex chars)
const VALID_ADDRESS_1 = '0x1234567890123456789012345678901234567890';
const VALID_ADDRESS_2 = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';
const VALID_ADDRESS_OWNER = '0x9999999999999999999999999999999999999999';
const INVALID_ADDRESS = 'invalid'; // Will fail ethers.isAddress() check

describe('DocumentPermissionService', () => {
  // Create mock contract ONCE - reused across all tests
  const mockContract = {
    getUserPermission: jest.fn(),
    canView: jest.fn(),
    canEdit: jest.fn(),
    isOwner: jest.fn(),
    getDocumentUsers: jest.fn(),
    getUserDocuments: jest.fn(),
    getUserDocumentCount: jest.fn(),
    shareDocument: jest.fn(),
    revokePermission: jest.fn(),
  };

  // Configure getDocumentRegistryContract ONCE to return mockContract
  (getDocumentRegistryContract as jest.Mock).mockReturnValue(mockContract);

  beforeEach(() => {
    // Clear only call history, not mock implementations
    mockContract.getUserPermission.mockClear();
    mockContract.canView.mockClear();
    mockContract.canEdit.mockClear();
    mockContract.isOwner.mockClear();
    mockContract.getDocumentUsers.mockClear();
    mockContract.getUserDocuments.mockClear();
    mockContract.getUserDocumentCount.mockClear();
    mockContract.shareDocument.mockClear();
    mockContract.revokePermission.mockClear();

    // Sync BlockchainQueries.getUserDocuments with mockContract
    (BlockchainQueries.getUserDocuments as jest.Mock).mockImplementation(
      (addr: string) => mockContract.getUserDocuments(addr)
    );
    (BlockchainQueries.isOwner as jest.Mock).mockImplementation(
      (docId: string, addr: string) => mockContract.isOwner(docId, addr)
    );
    (BlockchainQueries.canRead as jest.Mock).mockImplementation(
      (docId: string, addr: string) => mockContract.canView(docId, addr)
    );
    (BlockchainQueries.canWrite as jest.Mock).mockImplementation(
      (docId: string, addr: string) => mockContract.canEdit(docId, addr)
    );
    (BlockchainQueries.getUserRole as jest.Mock).mockImplementation(
      (docId: string, addr: string) => mockContract.getUserPermission(docId, addr).then((r: any) => {
        const roleNum = Number(r);
        switch (roleNum) { case 3: return 'DOCUMENT_OWNER'; case 2: return 'DOCUMENT_SHARED_WRITE'; case 1: return 'DOCUMENT_SHARED_READ'; default: return null; }
      })
    );

    // Reset to default values
    mockContract.getUserPermission.mockResolvedValue(BigInt(0));
    mockContract.canView.mockResolvedValue(false);
    mockContract.canEdit.mockResolvedValue(false);
    mockContract.isOwner.mockResolvedValue(false);
    mockContract.getDocumentUsers.mockResolvedValue([]);
    mockContract.getUserDocuments.mockResolvedValue([]);
    mockContract.getUserDocumentCount.mockResolvedValue(BigInt(0));
    mockContract.shareDocument.mockResolvedValue({ wait: jest.fn().mockResolvedValue({ hash: '0xTxHash' }) });
    mockContract.revokePermission.mockResolvedValue({ wait: jest.fn().mockResolvedValue({ hash: '0xTxHash' }) });
    mockPrisma.document.findFirst.mockResolvedValue(null);

  });

  describe('getUserRole', () => {
    it('should return user role from blockchain', async () => {
      const docId = '0x123';
      const userAddress = VALID_ADDRESS_1;
      mockContract.getUserPermission.mockResolvedValue(BigInt(DocumentRole.EDITOR));

      const result = await DocumentPermissionService.getUserRole(docId, userAddress);

      expect(result).toBe(DocumentRole.EDITOR);
      expect(mockContract.getUserPermission).toHaveBeenCalledWith(docId, userAddress);
    });

    it('should return NONE for invalid address', async () => {
      const result = await DocumentPermissionService.getUserRole('0x123', 'invalid');

      expect(result).toBe(DocumentRole.NONE);
      expect(mockContract.getUserPermission).not.toHaveBeenCalled();
    });

    it('should return NONE on blockchain error', async () => {
      mockContract.getUserPermission.mockRejectedValue(new Error('Blockchain error'));

      const result = await DocumentPermissionService.getUserRole('0x123', VALID_ADDRESS_1);

      expect(result).toBe(DocumentRole.NONE);
    });

    it('should convert BigInt role to DocumentRole enum', async () => {
      mockContract.getUserPermission.mockResolvedValue(BigInt(2)); // EDITOR

      const result = await DocumentPermissionService.getUserRole('0x123', VALID_ADDRESS_1);

      expect(result).toBe(DocumentRole.EDITOR);
    });
  });

  describe('getUserPermission', () => {
    it('should return full permission object', async () => {
      const docId = '0x123';
      const userAddress = VALID_ADDRESS_1;

      mockContract.getUserPermission.mockResolvedValue(BigInt(DocumentRole.VIEWER));
      mockContract.canView.mockResolvedValue(true);
      mockContract.canEdit.mockResolvedValue(false);
      mockContract.isOwner.mockResolvedValue(false);

      const result = await DocumentPermissionService.getUserPermission(docId, userAddress);

      expect(result).toEqual({
        docId,
        userAddress,
        role: DocumentRole.VIEWER,
        canView: true,
        canEdit: false,
        isOwner: false,
      });
    });

    it('should return NONE permission for invalid address', async () => {
      const result = await DocumentPermissionService.getUserPermission('0x123', 'invalid');

      expect(result.role).toBe(DocumentRole.NONE);
      expect(result.canView).toBe(false);
      expect(result.canEdit).toBe(false);
      expect(result.isOwner).toBe(false);
    });

    it('should handle blockchain errors gracefully', async () => {
      mockContract.getUserPermission.mockRejectedValue(new Error('Network error'));

      const result = await DocumentPermissionService.getUserPermission('0x123', VALID_ADDRESS_1);

      expect(result.role).toBe(DocumentRole.NONE);
      expect(result.canView).toBe(false);
    });
  });

  describe('canView', () => {
    it('should return true when user can view', async () => {
      mockContract.canView.mockResolvedValue(true);

      const result = await DocumentPermissionService.canView('0x123', VALID_ADDRESS_1);

      expect(result).toBe(true);
      expect(mockContract.canView).toHaveBeenCalledWith('0x123', VALID_ADDRESS_1);
    });

    it('should return false when user cannot view', async () => {
      mockContract.canView.mockResolvedValue(false);

      const result = await DocumentPermissionService.canView('0x123', VALID_ADDRESS_1);

      expect(result).toBe(false);
    });

    it('should return false for invalid address', async () => {
      const result = await DocumentPermissionService.canView('0x123', 'invalid');

      expect(result).toBe(false);
      expect(mockContract.canView).not.toHaveBeenCalled();
    });

    it('should return false on error', async () => {
      mockContract.canView.mockRejectedValue(new Error('Blockchain error'));

      const result = await DocumentPermissionService.canView('0x123', VALID_ADDRESS_1);

      expect(result).toBe(false);
    });
  });

  describe('canEdit', () => {
    it('should return true when user can edit', async () => {
      mockContract.canEdit.mockResolvedValue(true);

      const result = await DocumentPermissionService.canEdit('0x123', VALID_ADDRESS_OWNER);

      expect(result).toBe(true);
      expect(mockContract.canEdit).toHaveBeenCalledWith('0x123', VALID_ADDRESS_OWNER);
    });

    it('should return false when user cannot edit', async () => {
      mockContract.canEdit.mockResolvedValue(false);

      const result = await DocumentPermissionService.canEdit('0x123', '0xViewer');

      expect(result).toBe(false);
    });

    it('should return false for invalid address', async () => {
      const result = await DocumentPermissionService.canEdit('0x123', 'invalid');

      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      mockContract.canEdit.mockRejectedValue(new Error('Error'));

      const result = await DocumentPermissionService.canEdit('0x123', VALID_ADDRESS_1);

      expect(result).toBe(false);
    });
  });

  describe('isOwner', () => {
    it('should return true when user is owner', async () => {
      mockContract.isOwner.mockResolvedValue(true);

      const result = await DocumentPermissionService.isOwner('0x123', VALID_ADDRESS_OWNER);

      expect(result).toBe(true);
    });

    it('should return false when user is not owner', async () => {
      mockContract.isOwner.mockResolvedValue(false);

      const result = await DocumentPermissionService.isOwner('0x123', VALID_ADDRESS_1);

      expect(result).toBe(false);
    });

    it('should return false for invalid address', async () => {
      const result = await DocumentPermissionService.isOwner('0x123', 'invalid');

      expect(result).toBe(false);
    });
  });

  describe('getDocumentUsers', () => {
    it('should return array of user addresses', async () => {
      const users = [VALID_ADDRESS_1, VALID_ADDRESS_2, '0xUser3'];
      mockContract.getDocumentUsers.mockResolvedValue(users);

      const result = await DocumentPermissionService.getDocumentUsers('0x123');

      expect(result).toEqual(users);
      expect(mockContract.getDocumentUsers).toHaveBeenCalledWith('0x123');
    });

    it('should return empty array on error', async () => {
      mockContract.getDocumentUsers.mockRejectedValue(new Error('Error'));

      const result = await DocumentPermissionService.getDocumentUsers('0x123');

      expect(result).toEqual([]);
    });

    it('should handle empty user list', async () => {
      mockContract.getDocumentUsers.mockResolvedValue([]);

      const result = await DocumentPermissionService.getDocumentUsers('0x123');

      expect(result).toEqual([]);
    });
  });

  describe('getDocumentUsersWithRoles', () => {
    it('should return users with their roles', async () => {
      const users = [VALID_ADDRESS_OWNER, VALID_ADDRESS_1, VALID_ADDRESS_2];
      mockContract.getDocumentUsers.mockResolvedValue(users);
      mockContract.getUserPermission
        .mockResolvedValueOnce(DocumentRole.OWNER)
        .mockResolvedValueOnce(DocumentRole.EDITOR)
        .mockResolvedValueOnce(DocumentRole.VIEWER);

      const result = await DocumentPermissionService.getDocumentUsersWithRoles('0x123');

      expect(result).toEqual([
        { address: VALID_ADDRESS_OWNER, role: DocumentRole.OWNER },
        { address: VALID_ADDRESS_1, role: DocumentRole.EDITOR },
        { address: VALID_ADDRESS_2, role: DocumentRole.VIEWER },
      ]);
    });

    it('should return empty array when no users', async () => {
      mockContract.getDocumentUsers.mockResolvedValue([]);

      const result = await DocumentPermissionService.getDocumentUsersWithRoles('0x123');

      expect(result).toEqual([]);
      expect(mockContract.getUserPermission).not.toHaveBeenCalled();
    });

    it('should return empty array on error', async () => {
      mockContract.getDocumentUsers.mockRejectedValue(new Error('Error'));

      const result = await DocumentPermissionService.getDocumentUsersWithRoles('0x123');

      expect(result).toEqual([]);
    });
  });

  describe('getUserDocuments', () => {
    it('should return array of document IDs', async () => {
      const docs = ['0xDoc1', '0xDoc2', '0xDoc3'];
      mockContract.getUserDocuments.mockResolvedValue(docs);
      mockContract.canView.mockResolvedValue(true);

      const result = await DocumentPermissionService.getUserDocuments(VALID_ADDRESS_1);

      expect(result).toEqual(docs);
      expect(mockContract.getUserDocuments).toHaveBeenCalledWith(VALID_ADDRESS_1);
      expect(mockContract.canView).toHaveBeenCalledTimes(docs.length);
    });

    it('should return empty array for invalid address', async () => {
      const result = await DocumentPermissionService.getUserDocuments('invalid');

      expect(result).toEqual([]);
      expect(mockContract.getUserDocuments).not.toHaveBeenCalled();
    });

    it('should return empty array on error', async () => {
      mockContract.getUserDocuments.mockRejectedValue(new Error('Error'));

      const result = await DocumentPermissionService.getUserDocuments(VALID_ADDRESS_1);

      expect(result).toEqual([]);
    });

    it('should handle user with no documents', async () => {
      mockContract.getUserDocuments.mockResolvedValue([]);

      const result = await DocumentPermissionService.getUserDocuments(VALID_ADDRESS_1);

      expect(result).toEqual([]);
    });
  });

  describe('getUserDocumentCount', () => {
    it('should return number of documents', async () => {
      mockContract.getUserDocuments.mockResolvedValue(['0xDoc1', '0xDoc2', '0xDoc3', '0xDoc4', '0xDoc5']);
      mockContract.canView.mockResolvedValue(true);

      const result = await DocumentPermissionService.getUserDocumentCount(VALID_ADDRESS_1);

      expect(result).toBe(5);
    });

    it('should return 0 for invalid address', async () => {
      const result = await DocumentPermissionService.getUserDocumentCount('invalid');

      expect(result).toBe(0);
    });

    it('should return 0 on error', async () => {
      mockContract.getUserDocuments.mockRejectedValue(new Error('Error'));

      const result = await DocumentPermissionService.getUserDocumentCount(VALID_ADDRESS_1);

      expect(result).toBe(0);
    });

    it('should convert BigInt to number', async () => {
      const docs = Array.from({ length: 999 }, (_, index) => `0xDoc${index + 1}`);
      mockContract.getUserDocuments.mockResolvedValue(docs);
      mockContract.canView.mockResolvedValue(true);

      const result = await DocumentPermissionService.getUserDocumentCount(VALID_ADDRESS_1);

      expect(typeof result).toBe('number');
      expect(result).toBe(999);
    });
  });

  describe('shareDocument', () => {
    it('should share document with VIEWER role', async () => {
      const txHash = '0xTxHash123';
      mockContract.shareDocument.mockResolvedValue({
        wait: jest.fn().mockResolvedValue({ hash: txHash }),
      });

      const result = await DocumentPermissionService.shareDocument(
        '0x123',
        VALID_ADDRESS_1,
        DocumentRole.VIEWER
      );

      expect(result).toBe(txHash);
      expect(mockContract.shareDocument).toHaveBeenCalledWith('0x123', VALID_ADDRESS_1, DocumentRole.VIEWER);
    });

    it('should share document with EDITOR role', async () => {
      const txHash = '0xTxHash456';
      mockContract.shareDocument.mockResolvedValue({
        wait: jest.fn().mockResolvedValue({ hash: txHash }),
      });

      const result = await DocumentPermissionService.shareDocument(
        '0x123',
        VALID_ADDRESS_1,
        DocumentRole.EDITOR
      );

      expect(result).toBe(txHash);
      expect(mockContract.shareDocument).toHaveBeenCalledWith('0x123', VALID_ADDRESS_1, DocumentRole.EDITOR);
    });

    it('should throw error for invalid address', async () => {
      await expect(
        DocumentPermissionService.shareDocument('0x123', 'invalid', DocumentRole.VIEWER)
      ).rejects.toThrow('Dirección de usuario inválida');
    });

    it('should throw error for invalid role (OWNER)', async () => {
      await expect(
        DocumentPermissionService.shareDocument('0x123', VALID_ADDRESS_1, DocumentRole.OWNER as any)
      ).rejects.toThrow('Rol inválido');
    });

    it('should throw error for invalid role (NONE)', async () => {
      await expect(
        DocumentPermissionService.shareDocument('0x123', VALID_ADDRESS_1, DocumentRole.NONE as any)
      ).rejects.toThrow('Rol inválido');
    });

    it('should propagate blockchain errors', async () => {
      mockContract.shareDocument.mockRejectedValue(new Error('Gas estimation failed'));

      await expect(
        DocumentPermissionService.shareDocument('0x123', VALID_ADDRESS_1, DocumentRole.VIEWER)
      ).rejects.toThrow('Gas estimation failed');
    });
  });

  describe('revokePermission', () => {
    it('should revoke user permissions', async () => {
      const txHash = '0xRevokeTx';
      mockContract.revokePermission.mockResolvedValue({
        wait: jest.fn().mockResolvedValue({ hash: txHash }),
      });

      const result = await DocumentPermissionService.revokePermission('0x123', VALID_ADDRESS_1);

      expect(result).toBe(txHash);
      expect(mockContract.revokePermission).toHaveBeenCalledWith('0x123', VALID_ADDRESS_1);
    });

    it('should throw error for invalid address', async () => {
      await expect(
        DocumentPermissionService.revokePermission('0x123', 'invalid')
      ).rejects.toThrow('Dirección de usuario inválida');
    });

    it('should propagate blockchain errors', async () => {
      mockContract.revokePermission.mockRejectedValue(new Error('Transaction reverted'));

      await expect(
        DocumentPermissionService.revokePermission('0x123', VALID_ADDRESS_1)
      ).rejects.toThrow('Transaction reverted');
    });

    it('should wait for transaction confirmation', async () => {
      const waitMock = jest.fn().mockResolvedValue({ hash: '0xHash' });
      mockContract.revokePermission.mockResolvedValue({ wait: waitMock });

      await DocumentPermissionService.revokePermission('0x123', VALID_ADDRESS_1);

      expect(waitMock).toHaveBeenCalled();
    });
  });
});



