import express, { Express, Request, Response } from 'express';
import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import logger from './utils/logger';
import { swaggerSpec } from './config/swagger';
import { disconnectDatabase } from './config/database';
import './workers/blockchainSync'; // Start blockchain sync worker

// Import middleware
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { generalLimiter, authLimiter, uploadLimiter, auditLimiter } from './middleware/rateLimiter';

// Import routes
import authRoutes from './routes/auth';
import passwordResetRoutes from './routes/passwordReset';
import emailRoutes from './routes/email';
import userRoutes from './routes/users';
import walletRoutes from './routes/wallets';
import documentRoutes from './routes/documents';
import publicDocumentRoutes from './routes/publicDocuments';
import versionRoutes from './routes/versions';
import signatureRoutes from './routes/signatures';
import shareRoutes from './routes/shares';
import folderRoutes from './routes/folderRoutes';
import verificationRoutes from './routes/verificationRoutes';
import logRoutes from './routes/logRoutes';
import auditRoutes from './routes/audit'; // Auditoría pública (sin autenticación)
import healthRoutes from './routes/health.routes';
import adminRoutes from './routes/admin'; // Admin panel routes
import timelineRoutes from './routes/timeline'; // Timeline routes
import configRoutes from './routes/config'; // Blockchain config routes
import transferRoutes from './routes/transferRoutes'; // Transfer ownership routes
import notificationRoutes from './routes/notifications';

// Import services
import webSocketService from './services/webSocketService';
import eventListenerService from './services/eventListenerService';

// Cargar variables de entorno
dotenv.config();

/**
 * Instancia principal de la aplicación Express.
 */
const app: Express = express();

// The app is served behind nginx in Docker and demo environments.
// Trust the first proxy so req.ip and rate limiting work with X-Forwarded-* headers.
app.set('trust proxy', 1);

// CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim()) || [];
const isLoopbackOrigin = (origin: string) => /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sin origin (curl, Postman, mobile apps, proxy interno de Vite)
    if (!origin) return callback(null, true);

    // Permitir siempre orígenes loopback para desarrollo local y suites E2E contra Docker.
    if (isLoopbackOrigin(origin)) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    callback(new Error(`CORS: origin '${origin}' not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: [
    'Content-Disposition',
    'X-Mime-Type',
    'X-Is-Encrypted',
    'X-Encrypted-Symmetric-Key',
    'X-Encryption-IV',
    'X-Encryption-Auth-Tag',
  ],
}));

// Middleware
app.use(express.json({ limit: '250mb' }));
app.use(express.urlencoded({ extended: true, limit: '250mb' }));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'DocumentChain API Documentation'
}));
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Rate limiting global
app.use('/api/', generalLimiter);

// API Routes con rate limiters específicos
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/auth', passwordResetRoutes); // Password reset routes
app.use('/api/email', emailRoutes); // Email verification and password reset
app.use('/api/users', userRoutes);
app.use('/api/wallets', walletRoutes);
app.use('/api/public-documents', publicDocumentRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/versions', versionRoutes);
app.use('/api/signatures', signatureRoutes);
app.use('/api/shares', shareRoutes);
app.use('/api/folders', folderRoutes);
app.use('/api/verify', verificationRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/audit', auditLimiter, auditRoutes); // Auditoría pública (SIN autenticación requerida)
app.use('/api/health', healthRoutes); // Health check endpoints
app.use('/api/admin', adminRoutes); // Admin panel (requires admin role)
app.use('/api/timeline', timelineRoutes); // Document timeline
app.use('/api/config', configRoutes); // Blockchain config (contracts, ABIs)
app.use('/api/transfers', transferRoutes); // Transfer ownership
app.use('/api/notifications', notificationRoutes);

// Rutas de prueba
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'DocumentChain API',
    version: '1.0.0',
    https: true,
    docs: '/api-docs'
  });
});

app.use('/health', healthRoutes);

// 404 handler (must be after all routes)
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

// Puerto
const PORT = process.env.PORT || 3000;
const HTTP_PORT = 3080;
const USE_HTTPS = process.env.USE_HTTPS === 'true';
let mainServer: http.Server | https.Server | null = null;
let redirectServer: http.Server | null = null;
let isShuttingDown = false;

/**
 * Cierra de forma controlada un servidor HTTP o HTTPS.
 *
 * @param server - Instancia del servidor a cerrar, o `null`.
 * @param name - Nombre descriptivo del servidor (para logging).
 * @returns Promesa que se resuelve cuando el servidor ha cerrado.
 */
const closeServer = (server: http.Server | https.Server | null, name: string): Promise<void> => {
  if (!server) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        logger.error(`Error al cerrar servidor ${name}`, { error });
        reject(error);
        return;
      }

      logger.info(`Servidor ${name} cerrado`);
      resolve();
    });
  });
};

/**
 * Inicia el apagado ordenado de la aplicación ante una señal del sistema.
 * Cierra WebSockets, servidores, listeners de eventos y la conexión a base de datos.
 *
 * @param signal - Nombre de la señal recibida (por ejemplo, `SIGINT` o `SIGTERM`).
 */
const shutdown = async (signal: string): Promise<void> => {
  if (isShuttingDown) {
    logger.warn(`Apagado ya en curso, señal ignorada: ${signal}`);
    return;
  }

  isShuttingDown = true;
  logger.info(`Iniciando apagado ordenado por señal ${signal}`);

  try {
    webSocketService.close();

    await Promise.allSettled([
      eventListenerService.shutdown(),
      closeServer(mainServer, 'principal'),
      closeServer(redirectServer, 'redireccion HTTP'),
      disconnectDatabase(),
    ]);

    logger.info('Apagado ordenado completado');
    process.exit(0);
  } catch (error) {
    logger.error('Error durante el apagado ordenado', { error });
    process.exit(1);
  }
};

process.once('SIGINT', () => {
  void shutdown('SIGINT');
});

process.once('SIGTERM', () => {
  void shutdown('SIGTERM');
});

/**
 * Crea e inicia el servidor HTTP con los tiempos de espera configurados
 * para soportar subidas grandes, e inicializa los servicios de WebSocket y blockchain.
 */
const startHttpServer = () => {
  const httpServer = http.createServer(app);
  mainServer = httpServer;

  // Configurar timeouts para uploads grandes
  httpServer.timeout = 300000; // 5 minutos
  httpServer.keepAliveTimeout = 65000;
  httpServer.headersTimeout = 66000;

  // Inicializar WebSocket
  webSocketService.initialize(httpServer);

  httpServer.listen(PORT, async () => {
    logger.info(`Servidor HTTP ejecutándose en puerto ${PORT}`);
    logger.info(`HTTP: http://localhost:${PORT}`);

    try {
      await eventListenerService.start();
      logger.info('Event listeners de blockchain iniciados');
    } catch (error) {
      logger.error('Error al iniciar event listeners de blockchain', { error });
    }
  });
};

if (USE_HTTPS) {
  // Configuración HTTPS
  try {
    const httpsOptions = {
      key: fs.readFileSync(process.env.SSL_KEY_PATH || './ssl/private-key.pem'),
      cert: fs.readFileSync(process.env.SSL_CERT_PATH || './ssl/certificate.pem'),
      maxHeaderSize: 16384 // 16 KB for headers
    };
    const httpsServer = https.createServer(httpsOptions, app);
    mainServer = httpsServer;

    // Configurar timeouts para uploads grandes
    httpsServer.timeout = 300000; // 5 minutos
    httpsServer.keepAliveTimeout = 65000;
    httpsServer.headersTimeout = 66000;

    // Inicializar WebSocket
    webSocketService.initialize(httpsServer);

    // Iniciar servidor HTTPS
    httpsServer.listen(PORT, async () => {
      logger.info(`Servidor HTTPS ejecutándose en puerto ${PORT}`);
      logger.info(`HTTPS: https://localhost:${PORT}`);

      try {
        await eventListenerService.start();
        logger.info('Event listeners de blockchain iniciados');
      } catch (error) {
        logger.error('Error al iniciar event listeners de blockchain', { error });
      }
    });

    // Servidor HTTP (redirect a HTTPS)
    const httpApp = express();
    httpApp.use((req, res) => {
      res.redirect(`https://${req.headers.host}${req.url}`);
    });

    redirectServer = http.createServer(httpApp);

    redirectServer.listen(HTTP_PORT, () => {
      logger.info(`Servidor HTTP ejecutándose en puerto ${HTTP_PORT} (redirige a HTTPS)`);
    });
  } catch (error) {
    logger.warn('USE_HTTPS=true pero faltan certificados SSL, iniciando HTTP');
    logger.warn('Para HTTPS, configure SSL_KEY_PATH y SSL_CERT_PATH válidos');
    startHttpServer();
  }
} else {
  logger.info('USE_HTTPS=false, iniciando en modo HTTP local');
  startHttpServer();
}

/**
 * Exportación por defecto de la instancia de Express para pruebas y uso externo.
 */
export default app;
