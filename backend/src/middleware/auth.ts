import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../config/jwt';
import prisma from '../config/database';
import { BlockchainQueries } from '../lib/blockchain/queries';
import logger from '../utils/logger';
import { isAdmin } from './isAdmin';

/**
 * Middleware para verificar token JWT y adjuntar usuario a la petición
 */
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No se ha proporcionado token' });
      return;
    }

    const accessToken = authHeader.substring(7); // Eliminar prefijo 'Bearer '

    // Verificar token
    const payload = verifyToken(accessToken);

    // Verificar si la sesión existe y es válida
    const session = await prisma.session.findUnique({
      where: { accessToken }
    });

    if (!session || session.accessTokenExpiresAt < new Date()) {
      res.status(401).json({ error: 'Sesión inválida o expirada' });
      return;
    }

    // Adjuntar usuario a la petición
    req.user = payload;

    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
}

/**
 * Middleware para verificar si el usuario tiene rol de administrador
 */
export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({ error: 'Se requiere autenticación' });
    return;
  }

  isAdmin(req, res, next).catch(() => {
    res.status(500).json({ error: 'Error al verificar estado de administrador' });
  });
}

/**
 * Autenticación opcional - no falla si no se proporciona token
 * Útil para endpoints que funcionan diferente para usuarios autenticados
 */
export async function optionalAuthenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const accessToken = authHeader.substring(7);
      const payload = verifyToken(accessToken);

      const session = await prisma.session.findUnique({
        where: { accessToken }
      });

      if (session && session.accessTokenExpiresAt >= new Date()) {
        req.user = payload;
      }
    }

    next();
  } catch {
    // Ignorar errores, continuar sin autenticación
    next();
  }
}

/**
 * Middleware para verificar permiso de lectura en blockchain
 * Requiere que el documento tenga blockchainId en req.params o req.body
 */
export async function requireBlockchainRead(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Se requiere autenticación' });
      return;
    }

    const blockchainId = req.params.blockchainId || req.params.id || req.body.blockchainId;
    if (!blockchainId) {
      res.status(400).json({ error: 'ID de documento blockchain requerido' });
      return;
    }

    // Obtener wallet address del usuario
    const wallet = await prisma.wallet.findFirst({
      where: { userId: req.user.userId, isConnected: true }
    });

    if (!wallet) {
      res.status(403).json({ error: 'Wallet no conectada' });
      return;
    }

    const canRead = await BlockchainQueries.canRead(blockchainId, wallet.walletAddress);
    
    if (!canRead) {
      logger.warn('Acceso de lectura denegado por blockchain', {
        blockchainId,
        userId: req.user.userId,
        walletAddress: wallet.walletAddress
      });
      res.status(403).json({ error: 'No tienes permiso para acceder a este documento' });
      return;
    }

    next();
  } catch (error) {
    logger.error('Error en middleware requireBlockchainRead', {
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
    res.status(500).json({ error: 'Error al verificar permisos en blockchain' });
  }
}

/**
 * Middleware para verificar permiso de escritura en blockchain
 */
export async function requireBlockchainWrite(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Se requiere autenticación' });
      return;
    }

    const blockchainId = req.params.blockchainId || req.params.id || req.body.blockchainId;
    if (!blockchainId) {
      res.status(400).json({ error: 'ID de documento blockchain requerido' });
      return;
    }

    const wallet = await prisma.wallet.findFirst({
      where: { userId: req.user.userId, isConnected: true }
    });

    if (!wallet) {
      res.status(403).json({ error: 'Wallet no conectada' });
      return;
    }

    const canWrite = await BlockchainQueries.canWrite(blockchainId, wallet.walletAddress);
    
    if (!canWrite) {
      logger.warn('Acceso de escritura denegado por blockchain', {
        blockchainId,
        userId: req.user.userId,
        walletAddress: wallet.walletAddress
      });
      res.status(403).json({ error: 'No tienes permiso para modificar este documento' });
      return;
    }

    next();
  } catch (error) {
    logger.error('Error en middleware requireBlockchainWrite', {
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
    res.status(500).json({ error: 'Error al verificar permisos en blockchain' });
  }
}

/**
 * Middleware para verificar propiedad de documento en blockchain
 */
export async function requireBlockchainOwner(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Se requiere autenticación' });
      return;
    }

    const blockchainId = req.params.blockchainId || req.params.id || req.body.blockchainId;
    if (!blockchainId) {
      res.status(400).json({ error: 'ID de documento blockchain requerido' });
      return;
    }

    const wallet = await prisma.wallet.findFirst({
      where: { userId: req.user.userId, isConnected: true }
    });

    if (!wallet) {
      res.status(403).json({ error: 'Wallet no conectada' });
      return;
    }

    const isOwner = await BlockchainQueries.isOwner(blockchainId, wallet.walletAddress);
    
    if (!isOwner) {
      logger.warn('Acceso de propietario denegado por blockchain', {
        blockchainId,
        userId: req.user.userId,
        walletAddress: wallet.walletAddress
      });
      res.status(403).json({ error: 'Solo el propietario puede realizar esta acción' });
      return;
    }

    next();
  } catch (error) {
    logger.error('Error en middleware requireBlockchainOwner', {
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
    res.status(500).json({ error: 'Error al verificar propiedad en blockchain' });
  }
}

/**
 * Middleware para verificar permiso de firma en blockchain
 */
export async function requireBlockchainSign(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Se requiere autenticación' });
      return;
    }

    const blockchainId = req.params.blockchainId || req.params.id || req.body.blockchainId;
    if (!blockchainId) {
      res.status(400).json({ error: 'ID de documento blockchain requerido' });
      return;
    }

    const wallet = await prisma.wallet.findFirst({
      where: { userId: req.user.userId, isConnected: true }
    });

    if (!wallet) {
      res.status(403).json({ error: 'Wallet no conectada' });
      return;
    }

    const canSign = await BlockchainQueries.canSign(blockchainId, wallet.walletAddress);
    
    if (!canSign) {
      logger.warn('Acceso de firma denegado por blockchain', {
        blockchainId,
        userId: req.user.userId,
        walletAddress: wallet.walletAddress
      });
      res.status(403).json({ error: 'No tienes permiso para firmar este documento' });
      return;
    }

    next();
  } catch (error) {
    logger.error('Error en middleware requireBlockchainSign', {
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
    res.status(500).json({ error: 'Error al verificar permisos de firma en blockchain' });
  }
}
