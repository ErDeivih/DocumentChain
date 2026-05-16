/**
 * Tests for TokenService - JWT token generation, refresh, and revocation.
 * Note: These test the service logic with mocked JWT and Prisma.
 * Due to the complexity of mocking jsonwebtoken and JWT_SECRET imports,
 * these are partial unit tests focusing on DB interaction paths.
 */

jest.mock('../../src/config/database', () => ({
  __esModule: true,
  default: {
    session: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
}));

jest.mock('../../src/config/jwt', () => ({
  JWT_SECRET: 'test-jwt-secret',
}));

jest.mock('../../src/utils/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn(),
}));

import { TokenService } from '../../src/services/tokenService';
import prisma from '../../src/config/database';
import jwt from 'jsonwebtoken';

describe('TokenService', () => {
  const mockUserId = 'user-123';
  const mockUsername = 'testuser';
  const mockRole = 'USER';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateTokenPair()', () => {
    it('should generate access and refresh tokens and persist session', async () => {
      (jwt.sign as jest.Mock)
        .mockReturnValueOnce('access-token-jwt')
        .mockReturnValueOnce('refresh-token-jwt');
      (prisma.session.create as jest.Mock).mockResolvedValue({});

      const result = await TokenService.generateTokenPair(mockUserId, mockUsername, mockRole);

      expect(result.accessToken).toBe('access-token-jwt');
      expect(result.refreshToken).toBe('refresh-token-jwt');
      expect(result.expiresIn).toBe(900);

      expect(jwt.sign).toHaveBeenCalledTimes(2);
      expect(prisma.session.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: mockUserId,
            accessToken: 'access-token-jwt',
            refreshToken: 'refresh-token-jwt',
          }),
        })
      );
    });
  });

  describe('refreshAccessToken()', () => {
    it('should issue new access token for valid refresh token', async () => {
      (jwt.verify as jest.Mock).mockReturnValue({ userId: mockUserId, sessionId: 'session-1' });
      (prisma.session.findFirst as jest.Mock).mockResolvedValue({
        id: 'session-1',
        userId: mockUserId,
        user: { username: mockUsername, role: mockRole },
      });
      (jwt.sign as jest.Mock).mockReturnValue('new-access-token');
      (prisma.session.update as jest.Mock).mockResolvedValue({});

      const result = await TokenService.refreshAccessToken('valid-refresh-token');

      expect(result.accessToken).toBe('new-access-token');
      expect(result.expiresIn).toBe(900);
      expect(prisma.session.update).toHaveBeenCalled();
    });

    it('should throw when session not found', async () => {
      (jwt.verify as jest.Mock).mockReturnValue({ userId: mockUserId, sessionId: 'session-1' });
      (prisma.session.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(
        TokenService.refreshAccessToken('unknown-refresh-token')
      ).rejects.toThrow('Refresh token inválido');
    });

    it('should throw on JWT verification failure', async () => {
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('invalid token');
      });

      await expect(
        TokenService.refreshAccessToken('bad-token')
      ).rejects.toThrow('Refresh token inválido');
    });
  });

  describe('revokeRefreshToken()', () => {
    it('should delete sessions matching refresh token', async () => {
      (prisma.session.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });

      await TokenService.revokeRefreshToken('refresh-token');

      expect(prisma.session.deleteMany).toHaveBeenCalledWith({
        where: { refreshToken: 'refresh-token' },
      });
    });
  });

  describe('revokeAccessToken()', () => {
    it('should delete sessions matching access token', async () => {
      (prisma.session.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });

      await TokenService.revokeAccessToken('access-token');

      expect(prisma.session.deleteMany).toHaveBeenCalledWith({
        where: { accessToken: 'access-token' },
      });
    });
  });

  describe('cleanupExpiredTokens()', () => {
    it('should delete sessions with expired refresh tokens', async () => {
      (prisma.session.deleteMany as jest.Mock).mockResolvedValue({ count: 5 });

      const result = await TokenService.cleanupExpiredTokens();

      expect(result).toBe(5);
    });
  });

  describe('revokeAllUserSessions()', () => {
    it('should delete all sessions for a user', async () => {
      (prisma.session.deleteMany as jest.Mock).mockResolvedValue({ count: 3 });

      const result = await TokenService.revokeAllUserSessions(mockUserId);

      expect(result).toBe(3);
      expect(prisma.session.deleteMany).toHaveBeenCalledWith({
        where: { userId: mockUserId },
      });
    });
  });
});
