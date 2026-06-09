jest.mock('../../src/config/database', () => ({
  __esModule: true,
  default: {
    document: { findUnique: jest.fn() },
    event: { create: jest.fn() },
    $transaction: jest.fn((fn: any) => fn({
      event: { create: jest.fn() },
    })),
  },
}));

jest.mock('../../src/services/blockchainCacheService', () => ({
  __esModule: true,
  BlockchainCacheService: {
    isDocumentArchived: jest.fn(),
    isDocumentDeleted: jest.fn(),
    invalidate: jest.fn(),
  },
}));

jest.mock('../../src/services/documentPermissionService', () => ({
  __esModule: true,
  DocumentPermissionService: {
    validateOwnership: jest.fn().mockResolvedValue({ wallet: { walletAddress: '0xTest' } }),
  },
}));

jest.mock('../../src/services/blockchainReceiptService', () => ({
  __esModule: true,
  assertDocumentDeletedReceipt: jest.fn().mockResolvedValue(undefined),
  assertDocumentArchivedReceipt: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../src/config/ipfs', () => ({
  __esModule: true,
  deleteFromIPFS: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../src/utils/logger', () => ({
  logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
}));

import prisma from '../../src/config/database';
import { BlockchainCacheService } from '../../src/services/blockchainCacheService';
import { DocumentLifecycleService } from '../../src/services/documentLifecycleService';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockCache = BlockchainCacheService as jest.Mocked<typeof BlockchainCacheService>;

describe('DocumentLifecycleService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('archiveDocument', () => {
    it('should throw if document not found', async () => {
      (mockPrisma.document.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(DocumentLifecycleService.archiveDocument('doc-1', 'user-1', '0xhash'))
        .rejects.toThrow('Documento no encontrado');
    });

    it('should throw if already archived', async () => {
      (mockPrisma.document.findUnique as jest.Mock).mockResolvedValue({ id: 'doc-1', blockchainId: 'bc-1' });
      (mockCache.isDocumentArchived as jest.Mock).mockResolvedValue(true);
      await expect(DocumentLifecycleService.archiveDocument('doc-1', 'user-1', '0xhash'))
        .rejects.toThrow('El documento ya está archivado');
    });
  });

  describe('unarchiveDocument', () => {
    it('should throw if document not found', async () => {
      (mockPrisma.document.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(DocumentLifecycleService.unarchiveDocument('doc-1', 'user-1', '0xhash'))
        .rejects.toThrow('Documento no encontrado');
    });

    it('should throw if not archived', async () => {
      (mockPrisma.document.findUnique as jest.Mock).mockResolvedValue({ id: 'doc-1', blockchainId: 'bc-1' });
      (mockCache.isDocumentArchived as jest.Mock).mockResolvedValue(false);
      await expect(DocumentLifecycleService.unarchiveDocument('doc-1', 'user-1', '0xhash'))
        .rejects.toThrow('El documento no está archivado');
    });
  });

  describe('softDeleteDocument', () => {
    it('should throw if document not found', async () => {
      (mockPrisma.document.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(DocumentLifecycleService.softDeleteDocument('doc-1', 'user-1', '0xhash'))
        .rejects.toThrow('Documento no encontrado');
    });

    it('should throw if already deleted', async () => {
      (mockPrisma.document.findUnique as jest.Mock).mockResolvedValue({
        id: 'doc-1', blockchainId: 'bc-1', versions: [],
      });
      (mockCache.isDocumentDeleted as jest.Mock).mockResolvedValue(true);
      await expect(DocumentLifecycleService.softDeleteDocument('doc-1', 'user-1', '0xhash'))
        .rejects.toThrow('El documento ya ha sido eliminado');
    });
  });
});
