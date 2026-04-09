import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { timelineApi, TimelineEvent } from '../api/timeline';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { Alert, AlertDescription } from '../components/ui/Alert';
import {
  GitBranch,
  FileSignature,
  Share2,
  UserX,
  ArrowRightLeft,
  RefreshCw,
  AlertCircle,
  ArrowLeft,
  Clock,
  User,
  Hash,
} from 'lucide-react';

const eventIcons: Record<string, React.ElementType> = {
  version_created: GitBranch,
  document_signed: FileSignature,
  document_shared: Share2,
  permission_revoked: UserX,
  ownership_transferred: ArrowRightLeft,
  operational_changed: RefreshCw,
};

const eventColors: Record<string, 'default' | 'success' | 'warning' | 'destructive'> = {
  version_created: 'default',
  document_signed: 'success',
  document_shared: 'default',
  permission_revoked: 'warning',
  ownership_transferred: 'warning',
  operational_changed: 'default',
};

const eventLabels: Record<string, string> = {
  version_created: 'Nueva Versión',
  document_signed: 'Documento Firmado',
  document_shared: 'Documento Compartido',
  permission_revoked: 'Permiso Revocado',
  ownership_transferred: 'Propiedad Transferida',
  operational_changed: 'Versión Operacional Cambiada',
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date);
};

export const DocumentTimeline: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, error } = useQuery({
    queryKey: ['timeline', id],
    queryFn: () => timelineApi.getDocumentTimeline(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 p-6">
        <Skeleton className="h-12 w-64" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error instanceof Error ? error.message : 'Error al cargar línea temporal'}
          </AlertDescription>
        </Alert>
        <Button asChild className="mt-4">
          <Link to="/app/documents">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Documentos
          </Link>
        </Button>
      </div>
    );
  }

  if (!data?.events || data.events.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Línea Temporal del Documento</h1>
          <Button asChild variant="outline">
            <Link to={`/app/documents/${id}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Link>
          </Button>
        </div>
        <Alert>
          <AlertDescription>
            No hay eventos registrados para este documento todavía.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Línea Temporal del Documento</h1>
          <p className="text-gray-500 mt-1">Historial completo de eventos y cambios</p>
        </div>
        <Button asChild variant="outline">
          <Link to={`/app/documents/${id}`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total de Eventos</p>
                <p className="text-2xl font-bold text-gray-900">{data.events.length}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Primer Evento</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(data.events[data.events.length - 1]?.timestamp).toLocaleDateString('es-ES')}
                </p>
              </div>
              <GitBranch className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Último Evento</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(data.events[0]?.timestamp).toLocaleDateString('es-ES')}
                </p>
              </div>
              <RefreshCw className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <div className="relative space-y-4">
        {/* Vertical line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

        {data.events.map((event: TimelineEvent) => {
          const Icon = eventIcons[event.type] || Clock;
          const color = eventColors[event.type] || 'default';
          const label = eventLabels[event.type] || event.type;

          return (
            <Card key={event.id} className="relative ml-14 hover:shadow-md transition-shadow">
              {/* Timeline dot */}
              <div className="absolute -left-[3.25rem] top-6 w-12 h-12 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center z-10">
                <Icon className="w-6 h-6 text-gray-600" />
              </div>

              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Badge variant={color} className="text-sm">
                      {label}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {formatDate(event.timestamp)}
                    </span>
                  </div>
                </div>

                {/* Actor */}
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700">
                    <span className="font-medium">
                      {event.actor.fullName || event.actor.username}
                    </span>
                  </span>
                </div>

                {/* Details */}
                {event.details && Object.keys(event.details).length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <p className="text-xs font-medium text-gray-500 mb-2">Detalles:</p>
                    {Object.entries(event.details).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between py-1">
                        <span className="text-sm text-gray-600 capitalize">
                          {key.replace(/_/g, ' ')}:
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Blockchain TX */}
                {event.blockchainTx && (
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Hash className="w-3 h-3" />
                    <span className="font-mono truncate">
                      TX: {event.blockchainTx}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
