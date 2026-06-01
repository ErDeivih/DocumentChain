jest.mock('../../src/services/userService', () => ({
  UserService: {
    getUserById: jest.fn(),
  },
}));

jest.mock('../../src/config/database', () => ({
  __esModule: true,
  default: {
    document: {
      findMany: jest.fn(),
    },
    user: {
      delete: jest.fn(),
    },
  },
}));

jest.mock('../../src/config/ipfs', () => ({
  unpinFromIPFS: jest.fn(),
}));

import { Request, Response } from 'express';
import fs from 'fs';
import prisma from '../../src/config/database';
import { UserController } from '../../src/controllers/userController';
import { UserService } from '../../src/services/userService';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockUserService = UserService as jest.Mocked<typeof UserService>;

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

  it('returns 404 when user not found', async () => {
    const req = mockReq();
    const res = mockRes();

    (mockUserService.getUserById as jest.Mock).mockResolvedValue(null);

    await UserController.deleteMyAccount(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns 200 and deletes user directly', async () => {
    const req = mockReq();
    const res = mockRes();

    (mockUserService.getUserById as jest.Mock).mockResolvedValue({
      id: 'user-123',
      username: 'testuser',
      avatarUrl: '/uploads/avatars/user-123.png',
    } as any);

    (mockPrisma.document.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.user.delete as jest.Mock).mockResolvedValue({ id: 'user-123' });

    jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    jest.spyOn(fs, 'unlinkSync').mockImplementation(() => undefined as any);

    await UserController.deleteMyAccount(req, res);

    expect(mockPrisma.user.delete).toHaveBeenCalledWith({ where: { id: 'user-123' } });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Cuenta eliminada permanentemente' })
    );

    jest.restoreAllMocks();
  });

  it('returns 401 when user is not authenticated', async () => {
    const req = mockReq({ user: undefined });
    const res = mockRes();

    await UserController.deleteMyAccount(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.stringContaining('autentic') })
    );
  });

  it('cleans up avatar file when user has one', async () => {
    const req = mockReq();
    const res = mockRes();

    (mockUserService.getUserById as jest.Mock).mockResolvedValue({
      id: 'user-123',
      username: 'testuser',
      avatarUrl: '/uploads/avatars/user-123.png',
    } as any);

    (mockPrisma.document.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.user.delete as jest.Mock).mockResolvedValue({ id: 'user-123' });

    const existsSyncSpy = jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    const unlinkSyncSpy = jest.spyOn(fs, 'unlinkSync').mockImplementation(() => undefined as any);

    await UserController.deleteMyAccount(req, res);

    expect(existsSyncSpy).toHaveBeenCalled();
    expect(unlinkSyncSpy).toHaveBeenCalled();

    jest.restoreAllMocks();
  });

  it('handles deletion with associated documents gracefully', async () => {
    const req = mockReq();
    const res = mockRes();

    (mockUserService.getUserById as jest.Mock).mockResolvedValue({
      id: 'user-123',
      username: 'testuser',
      avatarUrl: null,
    } as any);

    (mockPrisma.document.findMany as jest.Mock).mockResolvedValue([
      { id: 'doc-1', ipfsCid: 'QmDoc1' },
      { id: 'doc-2', ipfsCid: 'QmDoc2' },
    ]);
    (mockPrisma.user.delete as jest.Mock).mockResolvedValue({ id: 'user-123' });

    jest.spyOn(fs, 'existsSync').mockReturnValue(false);

    await UserController.deleteMyAccount(req, res);

    expect(mockPrisma.document.findMany).toHaveBeenCalled();
    expect(mockPrisma.user.delete).toHaveBeenCalledWith({ where: { id: 'user-123' } });
    expect(res.status).toHaveBeenCalledWith(200);

    jest.restoreAllMocks();
  });
});
