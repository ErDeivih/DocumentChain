jest.mock('@prisma/client', () => {
  const prismaMock = {
    emailVerification: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      deleteMany: jest.fn(),
      create: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    passwordReset: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    session: {
      deleteMany: jest.fn(),
    },
    $transaction: jest.fn((callback: any) => callback(prismaMock)),
  };

  return {
    PrismaClient: jest.fn(() => prismaMock),
  };
});

jest.mock('../../src/services/emailService', () => ({
  emailService: {
    sendPasswordResetEmail: jest.fn(),
    sendPasswordChangedNotification: jest.fn(),
    sendVerificationEmail: jest.fn(),
  },
}));

jest.mock('../../src/config/database', () => ({
  __esModule: true,
  default: new (require('@prisma/client').PrismaClient)(),
}));

jest.mock('../../src/services/argon2Service', () => ({
  Argon2Service: {
    hash: jest.fn(),
  },
}));

jest.mock('../../src/lib/crypto/KeyManager', () => ({
  KeyManager: {
    hashRecoveryKey: jest.fn(() => 'recovery-hash'),
    decryptPrivateKeyWithRecovery: jest.fn(() => 'private-key'),
    encryptPrivateKey: jest.fn(() => 'encrypted-private-key-new-password'),
  },
}));

jest.mock('crypto', () => ({
  randomBytes: jest.fn(() => ({
    toString: jest.fn(() => 'fixed-token-123'),
  })),
}));

import { PrismaClient } from '@prisma/client';
import { EmailController } from '../../src/controllers/EmailController';
import { emailService } from '../../src/services/emailService';
import { Argon2Service } from '../../src/services/argon2Service';

type MockResponse = {
  status: jest.Mock;
  json: jest.Mock;
};

const prisma = new PrismaClient() as unknown as {
  emailVerification: {
    findUnique: jest.Mock;
    findFirst: jest.Mock;
    update: jest.Mock;
    deleteMany: jest.Mock;
    create: jest.Mock;
  };
  user: {
    findUnique: jest.Mock;
    update: jest.Mock;
  };
  passwordReset: {
    create: jest.Mock;
    findUnique: jest.Mock;
    update: jest.Mock;
  };
  session: {
    deleteMany: jest.Mock;
  };
};

function createResponse(): MockResponse {
  const response = {
    status: jest.fn(),
    json: jest.fn(),
  } as MockResponse;

  response.status.mockReturnValue(response);
  return response;
}

function createRequest(overrides: Record<string, unknown> = {}) {
  return {
    params: {},
    body: {},
    headers: {},
    socket: { remoteAddress: '127.0.0.1' },
    ...overrides,
  } as any;
}

describe('EmailController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('verifies a valid email token', async () => {
    const req = createRequest({ params: { token: 'verify-token' } });
    const res = createResponse();

    prisma.emailVerification.findUnique.mockResolvedValue({
      id: 'verification-1',
      userId: 'user-1',
      token: 'verify-token',
      verified: false,
      expiresAt: new Date(Date.now() + 60_000),
      user: { username: 'demo_user' },
    });

    await EmailController.verifyEmail(req, res as any);

    expect(prisma.emailVerification.update).toHaveBeenCalledWith({
      where: { id: 'verification-1' },
      data: expect.objectContaining({ verified: true }),
    });
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      username: 'demo_user',
    }));
  });

  it('returns success for unknown forgot-password email without sending email', async () => {
    const req = createRequest({ body: { email: 'missing@example.com' } });
    const res = createResponse();

    prisma.user.findUnique.mockResolvedValue(null);

    await EmailController.forgotPassword(req, res as any);

    expect(prisma.passwordReset.create).not.toHaveBeenCalled();
    expect(emailService.sendPasswordResetEmail).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it('creates a password reset request and sends email for an existing user', async () => {
    const req = createRequest({
      body: { email: 'demo@example.com' },
      headers: { 'user-agent': 'jest-agent' },
      socket: { remoteAddress: '10.0.0.5' },
    });
    const res = createResponse();

    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'demo@example.com',
      username: 'demo_user',
    });

    await EmailController.forgotPassword(req, res as any);

    expect(prisma.passwordReset.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'user-1',
        token: 'fixed-token-123',
        ipAddress: '10.0.0.5',
        userAgent: 'jest-agent',
      }),
    });
    expect(emailService.sendPasswordResetEmail).toHaveBeenCalledWith(
      'demo@example.com',
      'demo_user',
      'fixed-token-123'
    );
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it('resets the password, invalidates sessions, and sends a notification email', async () => {
    const req = createRequest({
      body: { token: 'reset-token', newPassword: 'NuevaPass123!', recoveryKey: 'recovery-key' },
      headers: { 'user-agent': 'jest-agent' },
      socket: { remoteAddress: '10.0.0.8' },
    });
    const res = createResponse();

    prisma.passwordReset.findUnique.mockResolvedValue({
      id: 'reset-1',
      userId: 'user-1',
      token: 'reset-token',
      used: false,
      expiresAt: new Date(Date.now() + 60_000),
      user: {
        email: 'demo@example.com',
        username: 'demo_user',
        recoveryKeyHash: 'recovery-hash',
        encryptedPrivateKeyRecovery: 'encrypted-with-recovery',
      },
    });
    prisma.passwordReset.updateMany.mockResolvedValue({ count: 1 });
    (Argon2Service.hash as jest.Mock).mockResolvedValue('argon2-hash');

    await EmailController.resetPassword(req, res as any);

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: {
        passwordHash: 'argon2-hash',
        encryptedPrivateKey: 'encrypted-private-key-new-password',
      },
    });
    expect(prisma.passwordReset.updateMany).toHaveBeenCalledWith({
      where: expect.objectContaining({ id: 'reset-1', used: false }),
      data: expect.objectContaining({ used: true }),
    });
    expect(prisma.session.deleteMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
    });
    expect(emailService.sendPasswordChangedNotification).toHaveBeenCalledWith(
      'demo@example.com',
      'demo_user',
      '10.0.0.8',
      'jest-agent'
    );
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it('replaces old verification tokens and sends a new verification email', async () => {
    const req = createRequest({ body: { email: 'demo@example.com' } });
    const res = createResponse();

    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'demo@example.com',
      username: 'demo_user',
    });
    prisma.emailVerification.findFirst.mockResolvedValue(null);

    await EmailController.resendVerification(req, res as any);

    expect(prisma.emailVerification.deleteMany).toHaveBeenCalledWith({
      where: { userId: 'user-1', verified: false },
    });
    expect(prisma.emailVerification.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'user-1',
        token: 'fixed-token-123',
      }),
    });
    expect(emailService.sendVerificationEmail).toHaveBeenCalledWith(
      'demo@example.com',
      'demo_user',
      'fixed-token-123'
    );
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it('handles concurrent resend requests safely', async () => {
    const req1 = createRequest({ body: { email: 'demo@example.com' } });
    const req2 = createRequest({ body: { email: 'demo@example.com' } });
    const res1 = createResponse();
    const res2 = createResponse();

    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'demo@example.com',
      username: 'demo_user',
    });
    prisma.emailVerification.findFirst.mockResolvedValue(null);

    await Promise.all([
      EmailController.resendVerification(req1, res1 as any),
      EmailController.resendVerification(req2, res2 as any),
    ]);

    expect(res1.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    expect(res2.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });
});
