/**
 * Unit tests for avatar upload/remove flow
 */

// Set env vars before any imports (jest hoists mocks but not env vars)
process.env.JWT_SECRET = 'test-jwt-secret-key-for-unit-tests-32+chars';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key-for-unit-tests-32+chars';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.BLOCKCHAIN_RPC_URL = 'http://localhost:8545';
process.env.BLOCKCHAIN_PRIVATE_KEY = '0x0000000000000000000000000000000000000000000000000000000000000001';

jest.mock('../../src/services/userService', () => ({
  UserService: {
    uploadAvatar: jest.fn(),
    removeAvatarWithFile: jest.fn(),
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
    file: undefined,
    headers: {
      authorization: 'Bearer token-123',
    },
    ...overrides,
  } as unknown as Request;
}

describe('UserController avatar flow', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('updateAvatar()', () => {
    it('returns 400 when no file is provided', async () => {
      const req = mockReq();
      const res = mockRes();

      await UserController.updateAvatar(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'No se ha proporcionado ninguna imagen' })
      );
    });

    it('uploads avatar and returns user with avatarUrl', async () => {
      const req = mockReq({
        file: {
          originalname: 'avatar.png',
          buffer: Buffer.from('fake-image'),
        },
      });
      const res = mockRes();

      (mockUserService.uploadAvatar as jest.Mock).mockResolvedValue({
        id: 'user-123',
        username: 'testuser',
        avatarUrl: '/uploads/avatars/user-123-1234567890.png',
      });

      await UserController.updateAvatar(req, res);

      expect(mockUserService.uploadAvatar).toHaveBeenCalledWith(
        'user-123',
        Buffer.from('fake-image'),
        'avatar.png'
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          user: expect.objectContaining({ avatarUrl: expect.stringContaining('/uploads/avatars/') }),
        })
      );
    });

    it('handles upload error gracefully', async () => {
      const req = mockReq({
        file: {
          originalname: 'avatar.jpg',
          buffer: Buffer.from('fake-image'),
        },
      });
      const res = mockRes();

      (mockUserService.uploadAvatar as jest.Mock).mockRejectedValue(new Error('Upload failed'));

      await UserController.updateAvatar(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Upload failed' })
      );
    });
  });

  describe('removeAvatar()', () => {
    it('removes avatar file and returns user without avatarUrl', async () => {
      const req = mockReq();
      const res = mockRes();

      (mockUserService.removeAvatarWithFile as jest.Mock).mockResolvedValue({
        id: 'user-123',
        username: 'testuser',
        avatarUrl: null,
      });

      await UserController.removeAvatar(req, res);

      expect(mockUserService.removeAvatarWithFile).toHaveBeenCalledWith('user-123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          user: expect.objectContaining({ avatarUrl: null }),
        })
      );
    });

    it('returns 401 when not authenticated', async () => {
      const req = mockReq({ user: undefined });
      const res = mockRes();

      await UserController.removeAvatar(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
    });
  });
});
