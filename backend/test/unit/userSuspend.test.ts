/**
 * Unit tests for UserController prepare/confirm suspension flow
 */

jest.mock('../../src/utils/logger', () => ({
  __esModule: true,
  default: { info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() },
  logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() },
}));

jest.mock('../../src/services/userService', () => ({
  UserService: {
    getUserById: jest.fn(),
    updateProfile: jest.fn(),
    searchUsers: jest.fn(),
    getUserByUsername: jest.fn(),
    getAllUsers: jest.fn(),
    deleteUser: jest.fn(),
  },
}));

jest.mock('../../src/services/userSuspensionService', () => {
  class MockSuspensionFlowError extends Error {
    status: number;

    constructor(status: number, message: string) {
      super(message);
      this.status = status;
    }
  }

  return {
    SuspensionFlowError: MockSuspensionFlowError,
    UserSuspensionService: {
      prepareSuspend: jest.fn(),
      confirmSuspend: jest.fn(),
      prepareUnsuspend: jest.fn(),
      confirmUnsuspend: jest.fn(),
    },
  };
});

import { Request, Response } from 'express';
import { UserController } from '../../src/controllers/userController';
import { SuspensionFlowError, UserSuspensionService } from '../../src/services/userSuspensionService';

const mockSuspensionService = UserSuspensionService as jest.Mocked<typeof UserSuspensionService>;

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

describe('UserController suspension flow', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('prepareSuspendMe()', () => {
    it('returns preparation payload', async () => {
      (mockSuspensionService.prepareSuspend as jest.Mock).mockResolvedValue({
        action: 'suspend',
        method: 'suspendMyself',
        contractAddress: '0xregistry',
        wallet: {
          id: 'wallet-1',
          address: '0xabc',
          label: 'Principal',
        },
        currentDbSuspended: false,
        currentOnChainSuspended: false,
        reason: 'Vacaciones',
      });

      const req = mockReq({ body: { reason: 'Vacaciones' } });
      const res = mockRes();

      await UserController.prepareSuspendMe(req, res);

      expect(mockSuspensionService.prepareSuspend).toHaveBeenCalledWith('user-123', 'Vacaciones');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        action: 'suspend',
        method: 'suspendMyself',
      }));
    });

    it('returns service status errors', async () => {
      (mockSuspensionService.prepareSuspend as jest.Mock).mockRejectedValue(
        new SuspensionFlowError(409, 'Tu cuenta ya está suspendida')
      );

      const req = mockReq();
      const res = mockRes();

      await UserController.prepareSuspendMe(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ error: 'Tu cuenta ya está suspendida' });
    });
  });

  describe('confirmSuspendMe()', () => {
    it('confirms suspension and preserves current session token', async () => {
      (mockSuspensionService.confirmSuspend as jest.Mock).mockResolvedValue({
        action: 'suspend',
        txHash: '0xtx',
        user: {
          id: 'user-123',
          username: 'testuser',
          isSuspended: true,
          suspendedAt: new Date('2025-01-01T00:00:00.000Z'),
          suspendReason: 'Vacaciones',
        },
      });

      const req = mockReq({ body: { txHash: '0xtx', reason: 'Vacaciones' } });
      const res = mockRes();

      await UserController.confirmSuspendMe(req, res);

      expect(mockSuspensionService.confirmSuspend).toHaveBeenCalledWith('user-123', {
        txHash: '0xtx',
        reason: 'Vacaciones',
        currentAccessToken: 'token-123',
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        txHash: '0xtx',
      }));
    });
  });

  describe('prepareUnsuspendMe()', () => {
    it('returns unsuspension preparation payload', async () => {
      (mockSuspensionService.prepareUnsuspend as jest.Mock).mockResolvedValue({
        action: 'unsuspend',
        method: 'unsuspendMyself',
        contractAddress: '0xregistry',
        wallet: {
          id: 'wallet-1',
          address: '0xabc',
          label: 'Principal',
        },
        currentDbSuspended: true,
        currentOnChainSuspended: true,
        reason: null,
      });

      const req = mockReq();
      const res = mockRes();

      await UserController.prepareUnsuspendMe(req, res);

      expect(mockSuspensionService.prepareUnsuspend).toHaveBeenCalledWith('user-123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        action: 'unsuspend',
        method: 'unsuspendMyself',
      }));
    });
  });

  describe('confirmUnsuspendMe()', () => {
    it('confirms unsuspension', async () => {
      (mockSuspensionService.confirmUnsuspend as jest.Mock).mockResolvedValue({
        action: 'unsuspend',
        txHash: '0xtx2',
        user: {
          id: 'user-123',
          username: 'testuser',
          isSuspended: false,
          suspendedAt: null,
          suspendReason: null,
        },
      });

      const req = mockReq({ body: { txHash: '0xtx2' } });
      const res = mockRes();

      await UserController.confirmUnsuspendMe(req, res);

      expect(mockSuspensionService.confirmUnsuspend).toHaveBeenCalledWith('user-123', {
        txHash: '0xtx2',
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        txHash: '0xtx2',
      }));
    });
  });
});
