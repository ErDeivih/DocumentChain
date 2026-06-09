import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger';

/**
 * Controlador de logs.
 * Gestiona la consulta, estadísticas, limpieza y registro de errores del cliente.
 */

/**
 * Analiza una línea de log en formato JSON o texto legado.
 *
 * @param line - Línea de texto del archivo de log.
 * @returns Objeto estructurado con timestamp, nivel, mensaje y metadatos.
 */
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
  } catch (error) {
    logger.debug(`[logController] JSON parse failed, falling back to text: ${error instanceof Error ? error.message : String(error)}`);
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
      } catch (error) {
        logger.debug(`[logController] Metadata JSON parse failed: ${error instanceof Error ? error.message : String(error)}`);
        return { timestamp, level, message: rest, metadata: null };
      }
    }

    return { timestamp, level, message: rest, metadata: null };
  }

  return { timestamp: '', level: 'UNKNOWN', message: line, metadata: null };
}

/**
 * Obtiene los registros de log recientes de un tipo determinado.
 * Endpoint: GET /api/logs
 *
 * @param req - Objeto de solicitud HTTP. La query puede incluir { type, lines }.
 * @param res - Objeto de respuesta HTTP.
 * @returns Promesa que resuelve con la lista de logs parseados.
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
 * Obtiene estadísticas de los archivos de log existentes.
 * Endpoint: GET /api/logs/stats
 *
 * @param req - Objeto de solicitud HTTP.
 * @param res - Objeto de respuesta HTTP.
 * @returns Promesa que resuelve con el tamaño, líneas y fecha de modificación de cada archivo.
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
 * Limpia los archivos de log del sistema (solo administradores).
 * Endpoint: POST /api/logs/clear
 *
 * @param req - Objeto de solicitud HTTP con { type } en el cuerpo.
 * @param res - Objeto de respuesta HTTP.
 * @returns Promesa que resuelve con la confirmación de limpieza.
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
      
      logger.info('Todos los logs limpiados', { userId: req.user?.userId });
      res.json({ message: 'Todos los logs limpiados' });
    } else {
      // Limpiar log específico
      const logFile = path.join(logsDir, `${type}.log`);
      
      if (fs.existsSync(logFile)) {
        fs.writeFileSync(logFile, '');
        logger.info(`Logs de ${type} limpiados`, { userId: req.user?.userId });
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
 * Registra un error reportado por el cliente (frontend).
 * Endpoint: POST /api/logs/client-error
 *
 * @param req - Objeto de solicitud HTTP con { error, message, stack, context } en el cuerpo.
 * @param res - Objeto de respuesta HTTP.
 * @returns Promesa que resuelve con la confirmación de registro.
 */
export async function logClientError(req: Request, res: Response): Promise<void> {
  try {
    const { error, message, stack, context } = req.body;
    
    logger.error('[ERROR CLIENTE]', {
      error: error || message,
      stack,
      context,
      userId: req.user?.userId,
      userAgent: req.headers['user-agent'],
      category: 'client-error'
    });
    
    res.json({ success: true });
  } catch (error: any) {
    logger.error('Error al registrar error del cliente', { error: error.message });
    res.status(500).json({ error: 'Error al registrar error del cliente' });
  }
}
