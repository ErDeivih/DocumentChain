/**
 * Unit tests for delete account (self-service) flow
 */

jest.mock('../../src/utils/logger', () => ({
  __esModule: true,
  default: { info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() },
  logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() },
}));

jest.mock('../../src/services/userService', () => ({
  UserService: {
    getUserById: jest.fn(),
    deleteUser: jest.fn(),
  },
}));

jest.mock('../../src/config/database', () => ({
  __esModule: true,
  default: {
    wallet: {
      findFirst: jest.fn(),
    },
    document: {
      findMany: jest.fn(),
    },
    user: {
      delete: jest.fn(),
    },
  },
}));

jest.mock('../../src/services/ipfsService', () => ({
  ipfsService: {
    unpinFile: jest.fn(),
  },
}));

jest.mock('../../src/config/blockchain', () => ({
  provider: {
    getTransactionReceipt: jest.fn(),
    getTransaction: jest.fn(),
    getBlock: jest.fn(),
  },
  DOCUMENT_REGISTRY_ADDRESS: '0xRegistryAddress',
  documentRegistryInterface: {
    parseTransaction: jest.fn(),
  },
}));

import { Request, Response } from 'express';
import { UserController } from '../../src/controllers/userController';
import { UserService } from '../../src/services/userService';
import prisma from '../../src/config/database';
import { provider, documentRegistryInterface } from '../../src/config/blockchain';
import fs from 'fs';

const mockUserService = UserService as jest.Mocked<typeof UserService>;
const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockProvider = provider as any;
const mockInterface = documentRegistryInterface as any;

function mockRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as Response;
}

function mockReq(overrides: Record<string, unknown> = {}): Request {
  return {
    user: { userId: 'user-123', role: 'USER', username: 'testuser' },
    body: {},
    params: {},
    headers: {
      authorization: 'Bearer token-123',
    },
    ...overrides,
  } as unknown as Request;
}

describe('UserController deleteMyAccount', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 400 when txHash is missing', async () => {
    const req = mockReq({ body: {} });
    const res = mockRes();

    await UserController.deleteMyAccount(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Se requiere txHash de la transacción suspendMyself' })
    );
  });

  it('returns 404 when user not found', async () => {
    const req = mockReq({ body: { txHash: '0x' + 'a'.repeat(64) } });
    const res = mockRes();

    (mockUserService.getUserById as jest.Mock).mockResolvedValue(null);

    await UserController.deleteMyAccount(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns 409 when user has no primary wallet', async () => {
    const req = mockReq({ body: { txHash: '0x' + 'a'.repeat(64) } });
    const res = mockRes();

    (mockUserService.getUserById as jest.Mock).mockResolvedValue({ id: 'user-123' });
    (mockPrisma.wallet.findFirst as jest.Mock).mockResolvedValue(null);

    await UserController.deleteMyAccount(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Debes configurar una wallet principal antes de eliminar la cuenta' })
    );
  });

  it('returns 400 when transaction is not confirmed', async () => {
    const req = mockReq({ body: { txHash: '0x' + 'a'.repeat(64) } });
    const res = mockRes();

    (mockUserService.getUserById as jest.Mock).mockResolvedValue({ id: 'user-123', username: 'testuser' });
    (mockPrisma.wallet.findFirst as jest.Mock).mockResolvedValue({ walletAddress: '0xABC' });
    mockProvider.getTransactionReceipt.mockResolvedValue(null);

    await UserController.deleteMyAccount(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'La transacción todavía no está confirmada' })
    );
  });

  it('returns 400 when transaction failed on-chain', async () => {
    const req = mockReq({ body: { txHash: '0x' + 'a'.repeat(64) } });
    const res = mockRes();

    (mockUserService.getUserById as jest.Mock).mockResolvedValue({ id: 'user-123', username: 'testuser' });
    (mockPrisma.wallet.findFirst as jest.Mock).mockResolvedValue({ walletAddress: '0xABC' });
    mockProvider.getTransactionReceipt.mockResolvedValue({ status: 0 });

    await UserController.deleteMyAccount(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'La transacción ha fallado en blockchain' })
    );
  });

  it('returns 200 and deletes user when txHash is valid suspendMyself', async () => {
    const txHash = '0x' + 'a'.repeat(64);
    const req = mockReq({ body: { txHash } });
    const res = mockRes();

    (mockUserService.getUserById as jest.Mock).mockResolvedValue({
      id: 'user-123',
      username: 'testuser',
      avatarUrl: '/uploads/avatars/user-123.png',
    });
    (mockPrisma.wallet.findFirst as jest.Mock).mockResolvedValue({
      walletAddress: '0xABC123',
    });
    mockProvider.getTransactionReceipt.mockResolvedValue({
      status: 1,
      blockNumber: 100,
    });
    mockProvider.getTransaction.mockResolvedValue({
      hash: txHash,
      from: '0xABC123',
      to: '0xRegistryAddress',
      data: '0xsuspendMyselfData',
    });
    mockInterface.parseTransaction.mockReturnValue({
      name: 'suspendMyself',
    } as any);
    (mockPrisma.document.findMany as jest.Mock).mockResolvedValue([]);
    jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    jest.spyOn(fs, 'unlinkSync').mockImplementation(() => {});
    (mockPrisma.user.delete as jest.Mock).mockResolvedValue({ id: 'user-123' });

    await UserController.deleteMyAccount(req, res);

    expect(fs.unlinkSync).toHaveBeenCalledWith(
      expect.stringContaining('user-123.png')
    );
    expect(mockPrisma.user.delete).toHaveBeenCalledWith({ where: { id: 'user-123' } });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Cuenta eliminada permanentemente' })
    );

    jest.restoreAllMocks();
  });
});
