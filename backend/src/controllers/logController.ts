import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger';

function parseLogLine(line: string) {
  try {
    const parsed = JSON.parse(line) as Record<string, unknown>;

    if (parsed && typeof parsed === 'object') {
      const { timestamp, level, message, ...metadata } = parsed;

      return {
        timestamp: typeof timestamp === 'string' ? timestamp : '',
        level: typeof level === 'string' ? level.toUpperCase() : 'INFO',
        message: typeof message === 'string' ? message : line,
        metadata: Object.keys(metadata).length > 0 ? metadata : null,
      };
    }
  } catch {
    // Fallback to legacy text parsing below.
  }

  const legacyMatch = line.match(/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) \[(\w+)\]: (.+)$/);

  if (legacyMatch) {
    const [, timestamp, level, rest] = legacyMatch;
    const jsonMatch = rest.match(/^(.+?)(\{.+\})$/);

    if (jsonMatch) {
      const [, message, jsonStr] = jsonMatch;

      try {
        const metadata = JSON.parse(jsonStr);
        return {
          timestamp,
          level,
          message: message.trim(),
          metadata,
        };
      } catch {
        return { timestamp, level, message: rest, metadata: null };
      }
    }

    return { timestamp, level, message: rest, metadata: null };
  }

  return { timestamp: '', level: 'UNKNOWN', message: line, metadata: null };
}

/**
 * Obtener logs recientes
 */
export async function getLogs(req: Request, res: Response): Promise<void> {
  try {
    const { type = 'combined', lines = 100 } = req.query;
    
    const validTypes = ['combined', 'error', 'blockchain'];
    const logType = validTypes.includes(type as string) ? type : 'combined';
    
    const logFile = path.join(__dirname, `../../logs/${logType}.log`);
    
    if (!fs.existsSync(logFile)) {
      res.json({ logs: [], count: 0 });
      return;
    }
    
    // Leer archivo
    const content = fs.readFileSync(logFile, 'utf-8');
    const allLines = content.split('\n').filter(line => line.trim());
    
    // Tomar últimas N líneas
    const maxLines = Math.min(parseInt(lines as string) || 100, 1000);
    const recentLines = allLines.slice(-maxLines);
    
    const parsedLogs = recentLines.map(parseLogLine);
    
    res.json({
      logs: parsedLogs,
      count: parsedLogs.length,
      type: logType
    });
  } catch (error: any) {
    logger.error('Error al leer logs', { error: error.message });
    res.status(500).json({ error: 'Error al leer logs' });
  }
}

/**
 * Obtener estadísticas de logs
 */
export async function getLogStats(req: Request, res: Response): Promise<void> {
  try {
    const logsDir = path.join(__dirname, '../../logs');
    const files = fs.readdirSync(logsDir).filter(f => f.endsWith('.log'));
    
    const stats = files.map(file => {
      const filePath = path.join(logsDir, file);
      const stat = fs.statSync(filePath);
      const lines = fs.readFileSync(filePath, 'utf-8').split('\n').length;
      
      return {
        file,
        size: stat.size,
        lines,
        modified: stat.mtime
      };
    });
    
    res.json({ stats });
  } catch (error: any) {
    logger.error('Error al obtener estadísticas de logs', { error: error.message });
    res.status(500).json({ error: 'Error al obtener estadísticas de logs' });
  }
}

/**
 * Limpiar logs (solo admin)
 */
export async function clearLogs(req: Request, res: Response): Promise<void> {
  try {
    const { type } = req.body;
    
    if (!type || !['combined', 'error', 'blockchain', 'all'].includes(type)) {
      res.status(400).json({ error: 'Tipo de log inválido' });
      return;
    }
    
    const logsDir = path.join(__dirname, '../../logs');
    
    if (type === 'all') {
      // Limpiar todos los archivos de log
      const files = fs.readdirSync(logsDir).filter(f => f.endsWith('.log'));
      files.forEach(file => {
        fs.writeFileSync(path.join(logsDir, file), '');
      });
      
      logger.info('Todos los logs limpiados', { userId: (req as any).user?.id });
      res.json({ message: 'Todos los logs limpiados' });
    } else {
      // Limpiar log específico
      const logFile = path.join(logsDir, `${type}.log`);
      
      if (fs.existsSync(logFile)) {
        fs.writeFileSync(logFile, '');
        logger.info(`Logs de ${type} limpiados`, { userId: (req as any).user?.id });
        res.json({ message: `Logs de ${type} limpiados` });
      } else {
        res.status(404).json({ error: 'Archivo de log no encontrado' });
      }
    }
  } catch (error: any) {
    logger.error('Error al limpiar logs', { error: error.message });
    res.status(500).json({ error: 'Error al limpiar logs' });
  }
}

/**
 * Registrar error del cliente (desde frontend)
 */
export async function logClientError(req: Request, res: Response): Promise<void> {
  try {
    const { error, message, stack, context } = req.body;
    
    logger.error('[ERROR CLIENTE]', {
      error: error || message,
      stack,
      context,
      userId: (req as any).user?.id,
      userAgent: req.headers['user-agent'],
      category: 'client-error'
    });
    
    res.json({ success: true });
  } catch (error: any) {
    logger.error('Error al registrar error del cliente', { error: error.message });
    res.status(500).json({ error: 'Error al registrar error del cliente' });
  }
}
