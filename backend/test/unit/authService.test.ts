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
    emailVerified: true,
    passwordHash: '$hashed$',
    role: 'USER',
    fullName: 'Test User',
    publicKey: 'pk-test',
    encryptedPrivateKey: 'epk-test',
    keySalt: 'salt',
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

  it('rejects login when email is not verified', async () => {
    const user = makeUser({ emailVerified: false });
    (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(user);
    (Argon2Service.verify as jest.Mock).mockResolvedValue(true);

    await expect(
      AuthService.login({ identifier: 'testuser', password: 'correctpass' })
    ).rejects.toThrow('Debes verificar tu email');
  });

  it('rejects login for wallet-only user (no passwordHash)', async () => {
    const user = makeUser({ passwordHash: null });
    (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(user);

    await expect(
      AuthService.login({ identifier: 'testuser', password: 'pass' })
    ).rejects.toThrow('requiere autenticación con wallet');
  });

  it('allows login by email as identifier', async () => {
    const user = makeUser();
    (mockPrisma.user.findUnique as jest.Mock)
      .mockResolvedValueOnce(null)  // username lookup fails
      .mockResolvedValueOnce(user); // email lookup succeeds
    (Argon2Service.verify as jest.Mock).mockResolvedValue(true);
    (TokenService.generateTokenPair as jest.Mock).mockResolvedValue(makeSession());

    const result = await AuthService.login({ identifier: 'test@example.com', password: 'correctpass' });
    expect(result.user.email).toBe('test@example.com');
  });

  it('migrates bcrypt password to argon2id on login', async () => {
    const user = makeUser();
    (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(user);
    (Argon2Service.detectHashType as jest.Mock).mockReturnValue('bcrypt');
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (Argon2Service.hash as jest.Mock).mockResolvedValue('$argon2id$newhash');
    (TokenService.generateTokenPair as jest.Mock).mockResolvedValue(makeSession());
    (mockPrisma.user.update as jest.Mock).mockResolvedValue(user);

    const result = await AuthService.login({ identifier: 'testuser', password: 'correctpass' });

    expect(Argon2Service.hash).toHaveBeenCalledWith('correctpass');
    expect(mockPrisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'user-123' },
      data: { passwordHash: '$argon2id$newhash' }
    }));
    expect(result.accessToken).toBe('access-token-abc');
  });
});

describe('AuthService - register()', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.ADMIN_REGISTRATION_SECRET = '';
  });

  it('rejects register with duplicate username', async () => {
    (mockPrisma.user.findFirst as jest.Mock).mockResolvedValue(makeUser({ username: 'testuser' }));

    await expect(
      AuthService.register({ username: 'testuser', email: 'new@test.com', password: 'Str0ng!Pass1' })
    ).rejects.toThrow('El nombre de usuario ya existe');
  });

  it('rejects register with duplicate email', async () => {
    (mockPrisma.user.findFirst as jest.Mock).mockResolvedValue(makeUser({ email: 'existing@test.com' }));

    await expect(
      AuthService.register({ username: 'newuser', email: 'existing@test.com', password: 'Str0ng!Pass1' })
    ).rejects.toThrow('El email ya existe');
  });

  it('rejects register with weak password', async () => {
    await expect(
      AuthService.register({ username: 'newuser', email: 'new@test.com', password: '123' })
    ).rejects.toThrow('Validación de contraseña fallida');
  });

  it('rejects register with short username', async () => {
    await expect(
      AuthService.register({ username: 'ab', email: 'new@test.com', password: 'Str0ng!Pass1' })
    ).rejects.toThrow('al menos 3 caracteres');
  });
});

describe('AuthService - logout()', () => {
  it('calls TokenService.revokeRefreshToken', async () => {
    const { TokenService: ts } = require('../../src/services/tokenService');
    (ts.revokeRefreshToken as jest.Mock).mockResolvedValue(undefined);

    await AuthService.logout('refresh-token-xyz');
    expect(ts.revokeRefreshToken).toHaveBeenCalledWith('refresh-token-xyz');
  });
});


