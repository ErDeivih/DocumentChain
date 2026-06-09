import fs from 'fs';
import nodemailer from 'nodemailer';

const sendMailMock = jest.fn();

jest.mock('fs', () => ({
  existsSync: jest.fn(() => true),
  readFileSync: jest.fn((filePath: string) => `<a href="{{verificationUrl}}{{resetUrl}}{{documentUrl}}{{securityUrl}}{{loginUrl}}{{settingsUrl}}{{homeUrl}}"></a>{{username}}{{recipientUsername}}{{sharedByUsername}}{{documentTitle}}{{alertType}}{{ipAddress}}{{userAgent}}{{timestamp}}{{supportUrl}}{{appUrl}}{{subject}}{{message}}`),
}));

jest.mock('nodemailer', () => ({
  __esModule: true,
  default: {
    createTransport: jest.fn(() => ({
      sendMail: sendMailMock,
      verify: jest.fn(),
    })),
  },
}));

describe('EmailService send methods', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    sendMailMock.mockResolvedValue({ messageId: '<message-id>' });
    process.env.EMAIL_FROM = 'noreply@test.local';
    process.env.EMAIL_FROM_NAME = 'DocumentChain Test';
    process.env.FRONTEND_URL = 'http://localhost:5173';
    process.env.SMTP_HOST = 'localhost';
    process.env.SMTP_PORT = '1587';
    process.env.SMTP_SECURE = 'false';
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  async function createService() {
    const module = await import('../../src/services/emailService');
    return new module.EmailService();
  }

  it('sends verification email with public verify-email link', async () => {
    const service = await createService();

    await service.sendVerificationEmail('user@example.com', 'alice', 'verify-token');

    expect(sendMailMock).toHaveBeenCalledWith(expect.objectContaining({
      to: 'user@example.com',
      subject: 'Verifica tu cuenta en DocumentChain',
    }));
    expect(sendMailMock.mock.calls[0][0].html).toContain('http://localhost:5173/verify-email?token');
    expect(sendMailMock.mock.calls[0][0].html).toContain('verify-token');
  });

  it('sends password reset email with reset link', async () => {
    const service = await createService();

    await service.sendPasswordResetEmail('user@example.com', 'alice', 'reset-token');

    expect(sendMailMock).toHaveBeenCalledWith(expect.objectContaining({
      subject: 'Restablecer contraseña - DocumentChain',
    }));
    expect(sendMailMock.mock.calls[0][0].html).toContain('http://localhost:5173/reset-password?token');
    expect(sendMailMock.mock.calls[0][0].html).toContain('reset-token');
  });

  it('sends password changed notification', async () => {
    const service = await createService();

    await service.sendPasswordChangedNotification('user@example.com', 'alice', '127.0.0.1', 'Chrome');

    expect(sendMailMock).toHaveBeenCalledWith(expect.objectContaining({
      subject: 'Tu contraseña ha sido cambiada - DocumentChain',
      html: expect.stringContaining('http://localhost:5173/app/settings'),
    }));
  });

  it('sends shared document notification with app document link', async () => {
    const service = await createService();

    await service.sendDocumentSharedNotification('user@example.com', 'bob', 'Contrato.pdf', 'alice', 'doc-123', ['read']);

    expect(sendMailMock).toHaveBeenCalledWith(expect.objectContaining({
      subject: 'alice compartió un documento contigo - DocumentChain',
      html: expect.stringContaining('http://localhost:5173/app/documents/doc-123'),
    }));
  });

  it('skips standalone security alert email sending', async () => {
    const service = await createService();

    await service.sendSecurityAlert('user@example.com', 'alice', 'new_device', {
      ipAddress: '127.0.0.1',
      userAgent: 'Chrome',
      location: 'Salamanca',
      timestamp: new Date('2026-04-05T10:00:00Z'),
    });

    expect(sendMailMock).toHaveBeenCalled();
  });

  it('sends welcome email with login link', async () => {
    const service = await createService();

    await service.sendWelcomeEmail('user@example.com', 'alice');

    expect(sendMailMock).toHaveBeenCalledWith(expect.objectContaining({
      subject: 'Bienvenido a DocumentChain',
      html: expect.stringContaining('http://localhost:5173/login'),
    }));
  });
});