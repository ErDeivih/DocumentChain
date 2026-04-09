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

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

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

const LogEntryComponent: React.FC<{ log: LogEntry }> = ({ log }) => {
  const [expanded, setExpanded] = useState(false);

  const getLevelColor = (level: string) => {
    switch (level.toUpperCase()) {
      case 'ERROR':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'WARN':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'INFO':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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
              <span className="text-xs text-gray-500 font-mono">
                {formatDate(log.timestamp)}
              </span>
            </div>
            <p className="text-sm font-medium text-gray-900 break-words">
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
          <div className="bg-gray-900 text-gray-100 p-3 rounded-md overflow-x-auto">
            <pre className="text-xs font-mono whitespace-pre-wrap">
              {JSON.stringify(log.metadata, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export const LogsViewer: React.FC = () => {
  const [logType, setLogType] = useState<'combined' | 'error' | 'blockchain'>(
    'combined'
  );
  const [lines, setLines] = useState<number>(100);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch logs
  const {
    data: logsData,
    isLoading: logsLoading,
    error: logsError,
    refetch: refetchLogs,
  } = useQuery({
    queryKey: ['logs', logType, lines],
    queryFn: () => logsApi.getLogs(logType, lines),
    refetchInterval: autoRefresh ? 10000 : false, // Auto-refresh every 10 seconds if enabled
  });

  // Fetch log stats
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['logStats'],
    queryFn: () => logsApi.getLogStats(),
    refetchInterval: autoRefresh ? 30000 : false, // Refresh stats every 30 seconds if enabled
  });

  // Clear logs mutation
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
      {/* Log Stats Cards */}
      {!statsLoading && statsData && statsData.stats && statsData.stats.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {statsData.stats.map((stat: LogStats, index: number) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {stat.file === 'combined.log' && 'Logs Combinados'}
                      {stat.file === 'error.log' && 'Logs de Errores'}
                      {stat.file === 'blockchain.log' && 'Logs Blockchain'}
                    </p>
                    <div className="mt-2 space-y-1">
                      <p className="text-2xl font-bold text-gray-900">
                        {stat.lines.toLocaleString()} líneas
                      </p>
                      <p className="text-xs text-gray-500">
                        Tamaño: {formatBytes(stat.size)}
                      </p>
                      <p className="text-xs text-gray-400">
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

      {/* Controls */}
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
            {/* Log Type Selector */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
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

            {/* Lines Selector */}
            <div className="w-full sm:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Líneas
              </label>
              <select
                value={lines}
                onChange={(e) => setLines(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={50}>50 líneas</option>
                <option value={100}>100 líneas</option>
                <option value={500}>500 líneas</option>
                <option value={1000}>1000 líneas</option>
              </select>
            </div>

            {/* Clear Logs Button */}
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

          {/* Logs Display */}
          <div className="space-y-2">
            {logsLoading && (
              <div className="flex justify-center items-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            )}

            {logsError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  Error al cargar los logs. Por favor, intenta de nuevo.
                </p>
              </div>
            )}

            {!logsLoading && !logsError && logsData && (
              <>
                {!logsData.logs || logsData.logs.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      No hay logs disponibles para el tipo seleccionado.
                    </p>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-4 rounded-lg max-h-[600px] overflow-y-auto">
                    <div className="space-y-2">
                      {logsData.logs.map((log: LogEntry, index: number) => (
                        <LogEntryComponent key={index} log={log} />
                      ))}
                    </div>
                  </div>
                )}
                <div className="mt-4 text-sm text-gray-500 text-center">
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
