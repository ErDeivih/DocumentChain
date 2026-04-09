/**
 * Unit tests for AuthService - suspend-related login flows and core auth
 */

// ─── Mocks (MUST be before imports) ─────────────────────────────────────────

jest.mock('../../src/config/database', () => ({
  __esModule: true,
  default: {
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    session: {
      create: jest.fn(),
      deleteMany: jest.fn(),
    },
    wallet: {
      findFirst: jest.fn(),
    },
  },
}));

jest.mock('../../src/utils/logger', () => ({
  __esModule: true,
  default: { info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() },
}));

jest.mock('../../src/services/tokenService', () => ({
  TokenService: {
    generateTokenPair: jest.fn(),
    verifyRefreshToken: jest.fn(),
  },
}));

jest.mock('../../src/services/argon2Service', () => ({
  Argon2Service: {
    verify: jest.fn(),
    hash: jest.fn(),
    detectHashType: jest.fn().mockReturnValue('argon2id'),
    needsRehash: jest.fn().mockResolvedValue(false),
  },
}));

jest.mock('../../src/lib/crypto/KeyManager', () => ({
  KeyManager: {
    generateKeyPair: jest.fn(),
  },
}));

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

jest.mock('../../src/services/emailService', () => ({
  emailService: {
    sendWelcomeEmail: jest.fn(),
  },
}));

// Mock ethers to avoid real ECDSA verification in unit tests
jest.mock('ethers', () => {
  const actual = jest.requireActual<typeof import('ethers')>('ethers');
  return {
    ...actual,
    verifyMessage: jest.fn(),
  };
});
// ─── Imports ─────────────────────────────────────────────────────────────────

import prisma from '../../src/config/database';
import { TokenService } from '../../src/services/tokenService';
import { Argon2Service } from '../../src/services/argon2Service';
import { AuthService } from '../../src/services/authService';
import bcrypt from 'bcrypt';
import * as ethers from 'ethers';

const TEST_WALLET_ADDRESS = '0x1234567890123456789012345678901234567890';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

function makeUser(overrides: Record<string, unknown> = {}) {
  return {
    id: 'user-123',
    username: 'testuser',
    email: 'test@example.com',
    passwordHash: '$hashed$',
    role: 'USER',
    fullName: 'Test User',
    publicKey: 'pk-test',
    encryptedPrivateKey: 'epk-test',
    keySalt: 'salt',
    twoFactorEnabled: false,
    twoFactorSecret: null,
    isSuspended: false,
    suspendedAt: null,
    suspendReason: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLogin: null,
    avatarUrl: null,
    recoveryKeyHash: null,
    encryptedPrivateKeyRecovery: null,
    ...overrides,
  };
}

function makeSession() {
  return {
    accessToken: 'access-token-abc',
    refreshToken: 'refresh-token-abc',
    expiresIn: 3600,
    user: {
      id: 'user-123',
      username: 'testuser',
      email: 'test@example.com',
      fullName: 'Test User',
      role: 'USER',
      publicKey: 'pk-test',
    },
  };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('AuthService - login()', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects login with wrong password', async () => {
    (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(makeUser());
    (Argon2Service.verify as jest.Mock).mockResolvedValue(false);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(
      AuthService.login({ identifier: 'testuser', password: 'wrongpass' })
    ).rejects.toThrow('Nombre de usuario o contraseña inválidos');
  });

  it('rejects login for unknown user', async () => {
    (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(
      AuthService.login({ identifier: 'noone', password: 'pass' })
    ).rejects.toThrow('Nombre de usuario o contraseña inválidos');
  });

  it('allows login for active user with valid password', async () => {
    const user = makeUser();
    (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(user);
    (Argon2Service.verify as jest.Mock).mockResolvedValue(true);
    (TokenService.generateTokenPair as jest.Mock).mockResolvedValue(makeSession());
    (mockPrisma.user.update as jest.Mock).mockResolvedValue(user);

    const result = await AuthService.login({ identifier: 'testuser', password: 'correctpass' });

    expect(result.accessToken).toBe('access-token-abc');
    expect(result.user.username).toBe('testuser');
  });

  it('allows login even when account is suspended (user needs token to unsuspend)', async () => {
    const suspendedUser = makeUser({
      isSuspended: true,
      suspendReason: 'Testing self-suspension',
    });
    (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(suspendedUser);
    (Argon2Service.verify as jest.Mock).mockResolvedValue(true);
    (TokenService.generateTokenPair as jest.Mock).mockResolvedValue(makeSession());
    (mockPrisma.user.update as jest.Mock).mockResolvedValue(suspendedUser);

    // Login must succeed so user can call /users/me/unsuspend
    const result = await AuthService.login({ identifier: 'testuser', password: 'correctpass' });
    expect(result.accessToken).toBeTruthy();
  });
});

describe('AuthService - loginWithWallet()', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default: verifyMessage returns the test wallet address
    (ethers.verifyMessage as jest.Mock).mockReturnValue(TEST_WALLET_ADDRESS);
  });

  it('rejects wallet login for unknown wallet', async () => {
    (mockPrisma.wallet.findFirst as jest.Mock).mockResolvedValue(null);

    await expect(
      AuthService.loginWithWallet({
        walletAddress: TEST_WALLET_ADDRESS,
        signature: '0xsig',
        message: 'challenge',
      })
    ).rejects.toThrow('Wallet no registrada');
  });

  it('allows wallet login for active user', async () => {
    const user = makeUser();
    (mockPrisma.wallet.findFirst as jest.Mock).mockResolvedValue({
      walletAddress: TEST_WALLET_ADDRESS,
      user,
    });
    (TokenService.generateTokenPair as jest.Mock).mockResolvedValue(makeSession());
    (mockPrisma.user.update as jest.Mock).mockResolvedValue(user);

    const validChallenge = `Sign this message to authenticate: user-123:${Date.now()}:aabbccddeeff`;
    const result = await AuthService.loginWithWallet({
      walletAddress: TEST_WALLET_ADDRESS,
      signature: '0xsig',
      message: validChallenge,
    });

    expect(result.accessToken).toBeTruthy();
  });

  it('allows wallet login even when account is suspended (user needs token to unsuspend)', async () => {
    const suspendedUser = makeUser({ isSuspended: true, suspendReason: 'Manual suspension' });
    (mockPrisma.wallet.findFirst as jest.Mock).mockResolvedValue({
      walletAddress: TEST_WALLET_ADDRESS,
      user: suspendedUser,
    });
    (TokenService.generateTokenPair as jest.Mock).mockResolvedValue(makeSession());
    (mockPrisma.user.update as jest.Mock).mockResolvedValue(suspendedUser);

    const validChallenge = `Sign this message to authenticate: user-123:${Date.now()}:aabbccddeeff`;
    // Must succeed so suspended user can reach /users/me/unsuspend
    const result = await AuthService.loginWithWallet({
      walletAddress: TEST_WALLET_ADDRESS,
      signature: '0xsig',
      message: validChallenge,
    });

    expect(result.accessToken).toBeTruthy();
  });
});
