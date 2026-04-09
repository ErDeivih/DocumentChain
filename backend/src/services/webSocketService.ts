import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';
import { JWT_SECRET } from '../config/jwt';

/**
 * WebSocketService - Comunicación en tiempo real
 * 
 * Características:
 * - Autenticación mediante JWT
 * - Rooms por usuario (user:userId)
 * - Tracking de conexiones múltiples por usuario
 * - Envío de notificaciones push instantáneas
 * - Broadcast a todos los usuarios
 * 
 * Arquitectura:
 * - Cliente se conecta con token JWT
 * - Server valida token y registra socket
 * - Server puede enviar mensajes a usuario específico o broadcast
 * 
 * ⚠️ IMPORTANTE: WebSocket para datos en TIEMPO REAL
 * NO sustituye a la BD (notificaciones se guardan siempre en BD)
 */
class WebSocketService {
  private io: SocketIOServer | null = null;
  private userSockets: Map<string, Set<string>>; // userId → Set<socketId>
  
  constructor() {
    this.userSockets = new Map();
  }
  
  /**
   * Inicializar WebSocket server
   * 
   * @param httpServer - HTTP server de Express
   * 
   * @example
   * const server = http.createServer(app);
   * WebSocketService.initialize(server);
   */
  initialize(httpServer: HttpServer): void {
    if (this.io) {
      logger.warn('WebSocketService ya inicializado');
      return;
    }
    
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || 'https://localhost:5173',
        credentials: true,
      },
      path: '/socket.io',
      transports: ['websocket', 'polling'],
    });
    
    this.io.on('connection', (socket: Socket) => {
      logger.info('Cliente WebSocket conectado', { socketId: socket.id });
      
      // Autenticación
      socket.on('authenticate', async (token: string) => {
        await this.handleAuthentication(socket, token);
      });
      
      // Desconexión
      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });
      
      // Ping-pong para keep-alive
      socket.on('ping', () => {
        socket.emit('pong');
      });
    });
    
    logger.info('✅ Servicio WebSocket inicializado');
  }
  
  /**
   * Manejar autenticación de cliente
   * 
   * @param socket - Socket del cliente
   * @param token - JWT token
   */
  private async handleAuthentication(socket: Socket, token: string): Promise<void> {
    try {
      // Verificar JWT
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const userId = decoded.userId;
      
      if (!userId) {
        throw new Error('Token inválido: falta userId');
      }
      
      // Registrar socket para usuario
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)!.add(socket.id);
      
      // Guardar userId en socket data
      socket.data.userId = userId;
      
      // Unirse a room de usuario
      socket.join(`user:${userId}`);
      
      logger.info('Cliente WebSocket autenticado', {
        socketId: socket.id,
        userId,
        totalConnections: this.userSockets.get(userId)!.size,
      });
      
      // Confirmar autenticación al cliente
      socket.emit('authenticated', {
        success: true,
        userId,
        timestamp: new Date().toISOString(),
      });
      
    } catch (error) {
      logger.error('Error de autenticación WebSocket', {
        socketId: socket.id,
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
      
      socket.emit('authenticated', {
        success: false,
        error: 'Error de autenticación',
      });
      
      socket.disconnect();
    }
  }
  
  /**
   * Manejar desconexión de cliente
   * 
   * @param socket - Socket del cliente
   */
  private handleDisconnect(socket: Socket): void {
    const userId = socket.data.userId;
    
    if (userId && this.userSockets.has(userId)) {
      this.userSockets.get(userId)!.delete(socket.id);
      
      // Eliminar entrada si no quedan conexiones
      if (this.userSockets.get(userId)!.size === 0) {
        this.userSockets.delete(userId);
      }
    }
    
    logger.info('Cliente WebSocket desconectado', {
      socketId: socket.id,
      userId: userId || 'sin autenticar',
    });
  }
  
  /**
   * Enviar mensaje a usuario específico
   * Envía a TODAS las conexiones del usuario (múltiples dispositivos)
   * 
   * @param userId - ID del usuario
   * @param event - Nombre del evento
   * @param data - Datos a enviar
   * 
   * @example
   * WebSocketService.sendToUser('user-uuid', 'notification', {
   *   title: 'Nuevo archivo',
   *   message: 'Alice compartió un archivo contigo',
   *   type: 'FILE_SHARED'
   * });
   */
  sendToUser(userId: string, event: string, data: any): void {
    if (!this.io) {
      logger.warn('WebSocket no inicializado, no se puede enviar mensaje');
      return;
    }
    
    this.io.to(`user:${userId}`).emit(event, data);
    
    logger.debug('Mensaje WebSocket enviado a usuario', {
      userId,
      event,
      connections: this.getUserConnectionCount(userId),
    });
  }
  
  /**
   * Broadcast mensaje a TODOS los usuarios conectados
   * 
   * @param event - Nombre del evento
   * @param data - Datos a enviar
   * 
   * @example
   * WebSocketService.broadcast('system-announcement', {
   *   title: 'Mantenimiento programado',
   *   message: 'El sistema estará en mantenimiento a las 2am',
   *   severity: 'warning'
   * });
   */
  broadcast(event: string, data: any): void {
    if (!this.io) {
      logger.warn('WebSocket no inicializado, no se puede hacer broadcast');
      return;
    }
    
    this.io.emit(event, data);
    
    logger.info('Broadcast WebSocket enviado', {
      event,
      totalUsers: this.userSockets.size,
    });
  }
  
  /**
   * Verificar si usuario está conectado
   * 
   * @param userId - ID del usuario
   * @returns true si tiene al menos una conexión activa
   */
  isUserConnected(userId: string): boolean {
    return this.userSockets.has(userId) && this.userSockets.get(userId)!.size > 0;
  }
  
  /**
   * Obtener número de conexiones activas de un usuario
   * 
   * @param userId - ID del usuario
   * @returns Cantidad de conexiones (0 si no está conectado)
   */
  getUserConnectionCount(userId: string): number {
    return this.userSockets.get(userId)?.size || 0;
  }
  
  /**
   * Obtener estadísticas del servicio
   * 
   * @returns Estadísticas de conexiones
   */
  getStats(): {
    totalConnectedUsers: number;
    totalConnections: number;
    usersWithMultipleConnections: number;
  } {
    const totalConnectedUsers = this.userSockets.size;
    let totalConnections = 0;
    let usersWithMultipleConnections = 0;
    
    for (const connections of this.userSockets.values()) {
      totalConnections += connections.size;
      if (connections.size > 1) {
        usersWithMultipleConnections++;
      }
    }
    
    return {
      totalConnectedUsers,
      totalConnections,
      usersWithMultipleConnections,
    };
  }
  
  /**
   * Cerrar WebSocket server
   */
  close(): void {
    if (this.io) {
      this.io.close();
      this.io = null;
      this.userSockets.clear();
      logger.info('Servicio WebSocket cerrado');
    }
  }
}

export default new WebSocketService();
