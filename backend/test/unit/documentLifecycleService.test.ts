import { beforeEach, describe, expect, it, jest } from '@jest/globals';

jest.mock('../../src/config/database', () => ({
  __esModule: true,
  default: {
    $transaction: jest.fn((cb: any) => cb(prisma)),
    document: { findUnique: jest.fn(), update: jest.fn() },
    event: { create: jest.fn() },
    version: { findMany: jest.fn() },
    user: { findUnique: jest.fn() },
  },
}));

jest.mock('../../src/config/ipfs', () => ({ deleteFromIPFS: jest.fn() }));

jest.mock('../../src/services/documentPermissionService', () => ({
  DocumentPermissionService: { validateOwnership: jest.fn().mockResolvedValue({ wallet: { walletAddress: '0xOwner' } }) },
}));

jest.mock('../../src/services/blockchainReceiptService', () => ({
  assertDocumentDeletedReceipt: jest.fn().mockResolvedValue(true),
  assertDocumentArchivedReceipt: jest.fn().mockResolvedValue(true),
}));

jest.mock('../../src/utils/logger', () => ({
  __esModule: true, logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
}));

import prisma from '../../src/config/database';
import { DocumentLifecycleService } from '../../src/services/documentLifecycleService';

const mockPrisma = prisma as any;

describe('DocumentLifecycleService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('softDeleteDocument', () => {
    it('should throw if document not found', async () => {
      mockPrisma.document.findUnique.mockResolvedValue(null);
      await expect(DocumentLifecycleService.softDeleteDocument('doc-1', 'user-1', '0xtx')).rejects.toThrow('Documento no encontrado');
    });

    it('should throw if document is already deleted', async () => {
      mockPrisma.document.findUnique.mockResolvedValue({ id: 'doc-1', isDeleted: true, versions: [] });
      await expect(DocumentLifecycleService.softDeleteDocument('doc-1', 'user-1', '0xtx')).rejects.toThrow('ya ha sido eliminado');
    });

    it('should throw if document has no blockchainId', async () => {
      mockPrisma.document.findUnique.mockResolvedValue({ id: 'doc-1', isDeleted: false, blockchainId: null, versions: [] });
      await expect(DocumentLifecycleService.softDeleteDocument('doc-1', 'user-1', '0xtx')).rejects.toThrow('no tiene ID de blockchain');
    });
  });

  describe('archiveDocument', () => {
    it('should throw if document not found', async () => {
      mockPrisma.document.findUnique.mockResolvedValue(null);
      await expect(DocumentLifecycleService.archiveDocument('doc-1', 'user-1', '0xtx')).rejects.toThrow('Documento no encontrado');
    });

    it('should throw if document is already archived', async () => {
      mockPrisma.document.findUnique.mockResolvedValue({ id: 'doc-1', isArchived: true, blockchainId: null });
      await expect(DocumentLifecycleService.archiveDocument('doc-1', 'user-1', '0xtx')).rejects.toThrow('ya está archivado');
    });
  });

  describe('unarchiveDocument', () => {
    it('should throw if document not found', async () => {
      mockPrisma.document.findUnique.mockResolvedValue(null);
      await expect(DocumentLifecycleService.unarchiveDocument('doc-1', 'user-1', '0xtx')).rejects.toThrow('Documento no encontrado');
    });

    it('should throw if document is not archived', async () => {
      mockPrisma.document.findUnique.mockResolvedValue({ id: 'doc-1', isArchived: false, blockchainId: null });
      await expect(DocumentLifecycleService.unarchiveDocument('doc-1', 'user-1', '0xtx')).rejects.toThrow('no está archivado');
    });
  });
});
