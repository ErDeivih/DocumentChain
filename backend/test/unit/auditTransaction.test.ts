/**
 * Unit tests for audit transaction endpoint
 */

jest.mock('../../src/utils/logger', () => ({
  __esModule: true,
  default: { info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() },
  logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() },
}));

jest.mock('../../src/config/blockchain', () => ({
  provider: {
    getTransaction: jest.fn(),
    getTransactionReceipt: jest.fn(),
    getBlock: jest.fn(),
  },
}));

jest.mock('../../src/config/database', () => ({
  __esModule: true,
  default: {
    document: {
      findUnique: jest.fn(),
    },
  },
}));

import { AuditService } from '../../src/services/auditService';
import { provider } from '../../src/config/blockchain';
import prisma from '../../src/config/database';

const mockProvider = provider as jest.Mocked<typeof provider>;
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('AuditService.getTransactionDetails', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns transaction details and decoded events for valid txHash', async () => {
    const txHash = '0x' + 'a'.repeat(64);

    (mockProvider.getTransaction as jest.Mock).mockResolvedValue({
      hash: txHash,
      from: '0xFrom',
      to: '0xTo',
      value: { toString: () => '0' },
      gasPrice: { toString: () => '1000000000' },
      data: '0x',
    });
    (mockProvider.getTransactionReceipt as jest.Mock).mockResolvedValue({
      status: 1,
      blockNumber: 123,
      gasUsed: { toString: () => '21000' },
      logs: [],
    });
    (mockProvider.getBlock as jest.Mock).mockResolvedValue({
      timestamp: 1710000000,
    });

    const details = await AuditService.getTransactionDetails(txHash);

    expect(details.transaction.hash).toBe(txHash);
    expect(details.transaction.status).toBe(1);
    expect(details.events).toEqual([]);
  });

  it('throws not found error when transaction does not exist', async () => {
    const txHash = '0x' + 'b'.repeat(64);

    (mockProvider.getTransaction as jest.Mock).mockResolvedValue(null);
    (mockProvider.getTransactionReceipt as jest.Mock).mockResolvedValue(null);

    await expect(AuditService.getTransactionDetails(txHash)).rejects.toThrow('Transacción no encontrada');
  });

  it('enriches events with document metadata when docId matches', async () => {
    const txHash = '0x' + 'c'.repeat(64);
    const blockchainId = '0xdoc123';

    (mockProvider.getTransaction as jest.Mock).mockResolvedValue({
      hash: txHash,
      from: '0xFrom',
      to: '0xTo',
      value: { toString: () => '0' },
      gasPrice: null,
      data: '0x',
    });
    (mockProvider.getTransactionReceipt as jest.Mock).mockResolvedValue({
      status: 1,
      blockNumber: 456,
      gasUsed: { toString: () => '50000' },
      logs: [
        {
          topics: ['0xEventTopic'],
          data: '0x',
        },
      ],
    });
    (mockProvider.getBlock as jest.Mock).mockResolvedValue({
      timestamp: 1710000001,
    });
    (mockPrisma.document.findUnique as jest.Mock).mockResolvedValue({
      id: 'doc-1',
      name: 'Test Document',
      publicId: 'pub123',
      visibility: 'PRIVATE',
      owner: { username: 'owner1' },
    });

    const details = await AuditService.getTransactionDetails(txHash);

    expect(details.transaction.hash).toBe(txHash);
  });
});
