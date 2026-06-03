jest.mock('../../src/services/userService', () => ({
  UserService: {
    deleteMyAccount: jest.fn(),
  },
}));

import { Request, Response } from 'express';
import { UserController } from '../../src/controllers/userController';
import { UserService } from '../../src/services/userService';

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

    (mockUserService.deleteMyAccount as jest.Mock).mockRejectedValue(new Error('Usuario no encontrado'));

    await UserController.deleteMyAccount(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns 200 on successful deletion', async () => {
    const req = mockReq();
    const res = mockRes();

    (mockUserService.deleteMyAccount as jest.Mock).mockResolvedValue(undefined);

    await UserController.deleteMyAccount(req, res);

    expect(mockUserService.deleteMyAccount).toHaveBeenCalledWith('user-123');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Cuenta eliminada permanentemente' })
    );
  });

  it('returns 401 when user is not authenticated', async () => {
    const req = mockReq({ user: undefined });
    const res = mockRes();

    await UserController.deleteMyAccount(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 500 on unexpected deletion error', async () => {
    const req = mockReq();
    const res = mockRes();

    (mockUserService.deleteMyAccount as jest.Mock).mockRejectedValue(new Error('Database connection lost'));

    await UserController.deleteMyAccount(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
