jest.mock('@prisma/client', () => {
  const prisma = {
    notificationPreference: {
      findUnique: jest.fn(),
      create: jest.fn(),
      upsert: jest.fn(),
    },
    notification: {
      create: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  };

  return {
    PrismaClient: jest.fn(() => prisma),
  };
});

jest.mock('../../src/services/webSocketService', () => ({
  __esModule: true,
  default: {
    isUserConnected: jest.fn(() => false),
    sendToUser: jest.fn(),
  },
}));

jest.mock('../../src/services/emailService', () => ({
  emailService: {
    sendNotification: jest.fn(),
  },
}));

jest.mock('../../src/utils/logger', () => {
  class MockFlowLogger {
    start = jest.fn();
    step = jest.fn();
    warn = jest.fn();
    success = jest.fn();
    error = jest.fn();
  }

  return {
    FlowLogger: MockFlowLogger,
    FlowContext: {
      NOTIFICATION: 'NOTIFICATION',
    },
    logger: {
      debug: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
    },
  };
});

describe('NotificationService', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    process.env.FRONTEND_URL = 'http://localhost:5173';
  });

  async function loadService() {
    const prismaModule = await import('@prisma/client');
    const prisma = new prismaModule.PrismaClient() as any;
    const notificationModule = await import('../../src/services/notificationService');
    const emailModule = await import('../../src/services/emailService');

    return {
      prisma,
      emailService: emailModule.emailService,
      NotificationService: notificationModule.NotificationService,
      NotificationType: notificationModule.NotificationType,
    };
  }

  it('sends notification emails with normalized document links when preferences allow it', async () => {
    const { prisma, emailService, NotificationService, NotificationType } = await loadService();

    prisma.notificationPreference.findUnique.mockResolvedValue({
      userId: 'user-1',
      emailEnabled: true,
      pushEnabled: false,
      typePreferences: {
        FILE_SHARED: true,
      },
    });
    prisma.notification.create.mockResolvedValue({ id: 'notification-1' });
    prisma.user.findUnique.mockResolvedValue({
      email: 'recipient@example.com',
      username: 'recipient',
    });

    const service = new NotificationService();

    await service.createNotification({
      userId: 'user-1',
      type: NotificationType.FILE_SHARED,
      title: 'Documento compartido',
      message: 'Alice compartió un documento contigo',
      link: '/files/doc-123/versions',
      data: { documentId: 'doc-123' },
    });

    expect(emailService.sendNotification).toHaveBeenCalledWith(
      'recipient@example.com',
      'recipient',
      'Documento compartido',
      'Alice compartió un documento contigo',
      'http://localhost:5173/app/documents/doc-123',
      'Abrir documento compartido'
    );
  });

  it('sends signed-document emails with a document action link', async () => {
    const { prisma, emailService, NotificationService, NotificationType } = await loadService();

    prisma.notificationPreference.findUnique.mockResolvedValue({
      userId: 'user-1',
      emailEnabled: true,
      pushEnabled: false,
      typePreferences: {
        FILE_SIGNED: true,
      },
    });
    prisma.notification.create.mockResolvedValue({ id: 'notification-3' });
    prisma.user.findUnique.mockResolvedValue({
      email: 'owner@example.com',
      username: 'owner',
    });

    const service = new NotificationService();

    await service.createNotification({
      userId: 'user-1',
      type: NotificationType.FILE_SIGNED,
      title: 'Documento firmado',
      message: 'diego_ortega firmó la versión 3 de "contrato_marco.pdf"',
      data: { documentId: 'doc-signed-1', versionNumber: 3 },
    });

    expect(emailService.sendNotification).toHaveBeenCalledWith(
      'owner@example.com',
      'owner',
      'Documento firmado',
      'diego_ortega firmó la versión 3 de "contrato_marco.pdf"',
      'http://localhost:5173/app/documents/doc-signed-1',
      'Ver firma registrada'
    );
  });

  it('keeps the notification flow working even if the email send fails', async () => {
    const { prisma, emailService, NotificationService, NotificationType } = await loadService();

    prisma.notificationPreference.findUnique.mockResolvedValue({
      userId: 'user-1',
      emailEnabled: true,
      pushEnabled: false,
      typePreferences: {},
    });
    prisma.notification.create.mockResolvedValue({ id: 'notification-2' });
    prisma.user.findUnique.mockResolvedValue({
      email: 'recipient@example.com',
      username: 'recipient',
    });
    (emailService.sendNotification as jest.Mock).mockRejectedValueOnce(new Error('smtp down'));

    const service = new NotificationService();

    await expect(service.createNotification({
      userId: 'user-1',
      type: NotificationType.NEW_VERSION,
      title: 'Nueva versión',
      message: 'Se ha publicado una nueva versión',
      data: { documentId: 'doc-456' },
    })).resolves.toEqual({ id: 'notification-2' });

    expect(prisma.notification.create).toHaveBeenCalledTimes(1);
  });
});