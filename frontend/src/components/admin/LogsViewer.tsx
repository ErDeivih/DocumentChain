import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  FileText,
  AlertTriangle,
  Info,
  XCircle,
  Trash2,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Database,
  Server,
  AlertCircle,
} from 'lucide-react';
import { logsApi, LogEntry, LogStats } from '../../api/logs';
import { useToast } from '../ui/Toast';
import { formatBytes } from '../../lib/utils';

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

/**
 * Componente interno que renderiza una entrada individual de log.
 *
 * @param props - Propiedades del componente.
 * @param props.log - Objeto de entrada de log a mostrar.
 * @returns Elemento JSX de la entrada de log.
 */
const LogEntryComponent: React.FC<{ log: LogEntry }> = ({ log }) => {
  const [expanded, setExpanded] = useState(false);

  const getLevelColor = (level: string) => {
    switch (level.toUpperCase()) {
      case 'ERROR':
        return 'border-[#fecaca] bg-[#fff1f2] text-[#b91c1c]';
      case 'WARN':
        return 'border-[#fcd34d] bg-[#fffbeb] text-[#92400e]';
      case 'INFO':
        return 'border-[#bae6fd] bg-[#f0f9ff] text-[#0f4c81]';
      default:
        return 'border-border bg-secondary/35 text-foreground';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level.toUpperCase()) {
      case 'ERROR':
        return <XCircle className="w-4 h-4" />;
      case 'WARN':
        return <AlertTriangle className="w-4 h-4" />;
      case 'INFO':
        return <Info className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div
      className={`border-l-4 p-3 mb-2 rounded-r-lg transition-all ${getLevelColor(
        log.level
      )} hover:shadow-md`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <div className="mt-1">{getLevelIcon(log.level)}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <Badge variant="outline" className="text-xs">
                {log.level}
              </Badge>
              <span className="font-mono text-xs text-muted-foreground">
                {formatDate(log.timestamp)}
              </span>
            </div>
            <p className="break-words text-sm font-medium text-foreground">
              {log.message}
            </p>
            {log.metadata && Object.keys(log.metadata).length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpanded(!expanded)}
                className="mt-2 h-auto p-1 text-xs"
              >
                {expanded ? (
                  <ChevronDown className="w-3 h-3 mr-1" />
                ) : (
                  <ChevronRight className="w-3 h-3 mr-1" />
                )}
                {expanded ? 'Ocultar' : 'Ver'} detalles
              </Button>
            )}
          </div>
        </div>
      </div>
      {expanded && log.metadata && (
        <div className="mt-3 pl-7">
          <div className="overflow-x-auto rounded-md border border-border bg-secondary/35 p-3 text-foreground">
            <pre className="text-xs font-mono whitespace-pre-wrap">
              {JSON.stringify(log.metadata, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Componente para visualizar y gestionar los logs del sistema.
 * Permite filtrar por tipo, ajustar líneas visibles, activar auto-refresh y limpiar logs.
 *
 * @returns Elemento JSX del visor de logs.
 */
export const LogsViewer: React.FC = () => {
  const [logType, setLogType] = useState<'combined' | 'error' | 'blockchain'>(
    'combined'
  );
  const [lines, setLines] = useState<number>(100);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Consulta de logs
  const {
    data: logsData,
    isLoading: logsLoading,
    error: logsError,
    refetch: refetchLogs,
  } = useQuery({
    queryKey: ['logs', logType, lines],
    queryFn: () => logsApi.getLogs(logType, lines),
    refetchInterval: autoRefresh ? 10000 : false, // Auto-refresh cada 10 segundos si está activado
  });

  // Consulta de estadísticas de logs
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['logStats'],
    queryFn: () => logsApi.getLogStats(),
    refetchInterval: autoRefresh ? 30000 : false, // Actualiza estadísticas cada 30 segundos si está activado
  });

  // Mutación para limpiar logs
  const clearLogsMutation = useMutation({
    mutationFn: async (type: string) => {
      return await logsApi.clearLogs(type);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['logs'] });
      queryClient.invalidateQueries({ queryKey: ['logStats'] });
      toast({
        title: 'Éxito',
        description: 'Logs eliminados correctamente',
        variant: 'success',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Error al eliminar logs',
        variant: 'destructive',
      });
    },
  });

  const handleClearLogs = () => {
    if (
      window.confirm(
        `¿Estás seguro de que quieres eliminar todos los logs de tipo "${logType}"? Esta acción no se puede deshacer.`
      )
    ) {
      clearLogsMutation.mutate(logType);
    }
  };

  const getLogTypeIcon = (type: string) => {
    switch (type) {
      case 'blockchain':
        return <Database className="w-4 h-4" />;
      case 'error':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Server className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Tarjetas de estadísticas de logs */}
      {!statsLoading && statsData && statsData.stats && statsData.stats.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {statsData.stats.map((stat: LogStats, index: number) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.file === 'combined.log' && 'Logs Combinados'}
                      {stat.file === 'error.log' && 'Logs de Errores'}
                      {stat.file === 'blockchain.log' && 'Logs Blockchain'}
                    </p>
                    <div className="mt-2 space-y-1">
                      <p className="text-2xl font-bold text-foreground">
                        {stat.lines.toLocaleString()} líneas
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Tamaño: {formatBytes(stat.size)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Modificado: {new Date(stat.modified).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Controles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Visor de Logs del Sistema
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant={autoRefresh ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`}
                />
                Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
              </Button>
              <Button variant="outline" size="sm" onClick={() => refetchLogs()}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Recargar
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Selector de tipo de log */}
            <div className="flex-1">
              <label className="mb-2 block text-sm font-medium text-foreground">
                Tipo de Log
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['combined', 'error', 'blockchain'].map((type) => (
                  <Button
                    key={type}
                    variant={logType === type ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setLogType(type as any)}
                    className="justify-start"
                  >
                    {getLogTypeIcon(type)}
                    <span className="ml-2 capitalize">{type}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Selector de líneas */}
            <div className="w-full sm:w-48">
              <label className="mb-2 block text-sm font-medium text-foreground">
                Número de Líneas
              </label>
              <select
                value={lines}
                onChange={(e) => setLines(Number(e.target.value))}
                className="w-full rounded-md border border-input bg-white px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value={50}>50 líneas</option>
                <option value={100}>100 líneas</option>
                <option value={500}>500 líneas</option>
                <option value={1000}>1000 líneas</option>
              </select>
            </div>

            {/* Botón de limpiar logs */}
            <div className="flex items-end">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleClearLogs}
                disabled={clearLogsMutation.isPending}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Limpiar Logs
              </Button>
            </div>
          </div>

          {/* Visualización de logs */}
          <div className="space-y-2">
            {logsLoading && (
              <div className="flex justify-center items-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            )}

            {logsError && (
              <div className="rounded-lg border border-[#fecaca] bg-[#fff5f5] p-4">
                <p className="text-sm text-[#b91c1c]">
                  Error al cargar los logs. Por favor, intenta de nuevo.
                </p>
              </div>
            )}

            {!logsLoading && !logsError && logsData && (
              <>
                {!logsData.logs || logsData.logs.length === 0 ? (
                  <div className="rounded-lg border border-border bg-secondary/35 py-12 text-center">
                    <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      No hay logs disponibles para el tipo seleccionado.
                    </p>
                  </div>
                ) : (
                  <div className="max-h-[600px] overflow-y-auto rounded-lg border border-border bg-secondary/35 p-4">
                    <div className="space-y-2">
                      {logsData.logs.map((log: LogEntry, index: number) => (
                        <LogEntryComponent key={index} log={log} />
                      ))}
                    </div>
                  </div>
                )}
                <div className="mt-4 text-center text-sm text-muted-foreground">
                  Mostrando {logsData.logs?.length || 0} de {lines} líneas solicitadas
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
