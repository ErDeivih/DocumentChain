import './config/loadEnv';
import express, { Express, Request, Response } from 'express';
import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import logger from './utils/logger';
import { swaggerSpec } from './config/swagger';
import { disconnectDatabase } from './config/database';
import cron from 'node-cron';
import { TokenService } from './services/tokenService';
import prisma from './config/database';
import helmet from 'helmet';

// Import middleware
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { generalLimiter, auditLimiter } from './middleware/rateLimiter';

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
import auditRoutes from './routes/audit'; // Auditoría pública (sin autenticación)
import healthRoutes from './routes/health.routes';
import adminRoutes from './routes/admin'; // Admin panel routes
import timelineRoutes from './routes/timeline'; // Timeline routes
import configRoutes from './routes/config'; // Blockchain config routes
import notificationRoutes from './routes/notifications';

// Import services
import webSocketService from './services/webSocketService';

/**
 * Instancia principal de la aplicación Express.
 */
const app: Express = express();

// La aplicacion se sirve detras de nginx en Docker y entornos de demostracion.
// Confiar en el primer proxy para que req.ip y el rate limiting funcionen con cabeceras X-Forwarded-*.
app.set('trust proxy', 1);

// CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim()) || [];
const isLoopbackOrigin = (origin: string) => /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// Deshabilitar ETag para evitar respuestas 304 en endpoints de descarga de archivos
app.set('etag', false);

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
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
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

// API Routes (authLimiter applied inside routes/auth.ts per-endpoint)
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
app.use('/api/audit', auditLimiter, auditRoutes); // Auditoría pública (SIN autenticación requerida)
app.use('/api/health', healthRoutes); // Health check endpoints

app.use('/api/admin', adminRoutes);
app.use('/api/timeline', timelineRoutes);
app.use('/api/config', configRoutes);
app.use('/api/notifications', notificationRoutes);

// Manejador 404 (debe ir despues de todas las rutas)
app.use(notFoundHandler);

// Manejador de errores (debe ser el ultimo)
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

// Limpieza diaria de tokens de sesión expirados (3 AM)
cron.schedule('0 3 * * *', async () => {
  try {
    const deleted = await TokenService.cleanupExpiredTokens();
    if (deleted > 0) {
      logger.info(`Limpieza de sesiones: ${deleted} tokens expirados eliminados`);
    }
  } catch (error) {
    logger.error('Error al limpiar tokens expirados', {
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// Limpieza de notificaciones antiguas (4 AM — más de 90 días)
cron.schedule('0 4 * * *', async () => {
  try {
    const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const result = await prisma.notification.deleteMany({
      where: { createdAt: { lt: cutoff } },
    });
    if (result.count > 0) {
      logger.info(`Limpieza de notificaciones: ${result.count} notificaciones antiguas eliminadas`);
    }
  } catch (error) {
    logger.error('Error al limpiar notificaciones antiguas', {
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

/**
 * Exportación por defecto de la instancia de Express para pruebas y uso externo.
 */
export default app;
