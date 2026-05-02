/**
 * Unit tests for avatar upload/remove flow
 */

jest.mock('../../src/utils/logger', () => ({
  __esModule: true,
  default: { info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() },
  logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() },
}));

jest.mock('../../src/services/userService', () => ({
  UserService: {
    getUserById: jest.fn(),
    updateAvatar: jest.fn(),
    removeAvatar: jest.fn(),
  },
}));

import { Request, Response } from 'express';
import { UserController } from '../../src/controllers/userController';
import { UserService } from '../../src/services/userService';
import fs from 'fs';

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

      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
      (mockUserService.getUserById as jest.Mock).mockResolvedValue({
        id: 'user-123',
        avatarUrl: null,
      });
      (mockUserService.updateAvatar as jest.Mock).mockResolvedValue({
        id: 'user-123',
        username: 'testuser',
        avatarUrl: '/uploads/avatars/user-123-1234567890.png',
      });

      await UserController.updateAvatar(req, res);

      expect(fs.writeFileSync).toHaveBeenCalled();
      expect(mockUserService.updateAvatar).toHaveBeenCalledWith(
        'user-123',
        expect.stringContaining('/uploads/avatars/user-123-')
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          user: expect.objectContaining({ avatarUrl: expect.stringContaining('/uploads/avatars/') }),
        })
      );

      jest.restoreAllMocks();
    });

    it('removes old avatar before uploading new one', async () => {
      const req = mockReq({
        file: {
          originalname: 'avatar.jpg',
          buffer: Buffer.from('fake-image'),
        },
      });
      const res = mockRes();

      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      jest.spyOn(fs, 'unlinkSync').mockImplementation(() => {});
      jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
      (mockUserService.getUserById as jest.Mock).mockResolvedValue({
        id: 'user-123',
        avatarUrl: '/uploads/avatars/old-avatar.png',
      });
      (mockUserService.updateAvatar as jest.Mock).mockResolvedValue({
        id: 'user-123',
        username: 'testuser',
        avatarUrl: '/uploads/avatars/user-123-1234567890.jpg',
      });

      await UserController.updateAvatar(req, res);

      expect(fs.unlinkSync).toHaveBeenCalledWith(
        expect.stringContaining('old-avatar.png')
      );

      jest.restoreAllMocks();
    });
  });

  describe('removeAvatar()', () => {
    it('removes avatar file and returns user without avatarUrl', async () => {
      const req = mockReq();
      const res = mockRes();

      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      jest.spyOn(fs, 'unlinkSync').mockImplementation(() => {});
      (mockUserService.getUserById as jest.Mock).mockResolvedValue({
        id: 'user-123',
        avatarUrl: '/uploads/avatars/user-123.png',
      });
      (mockUserService.removeAvatar as jest.Mock).mockResolvedValue({
        id: 'user-123',
        username: 'testuser',
        avatarUrl: null,
      });

      await UserController.removeAvatar(req, res);

      expect(fs.unlinkSync).toHaveBeenCalledWith(
        expect.stringContaining('user-123.png')
      );
      expect(mockUserService.removeAvatar).toHaveBeenCalledWith('user-123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          user: expect.objectContaining({ avatarUrl: null }),
        })
      );

      jest.restoreAllMocks();
    });

    it('returns 401 when not authenticated', async () => {
      const req = mockReq({ user: undefined });
      const res = mockRes();

      await UserController.removeAvatar(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
    });
  });
});
