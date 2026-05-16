import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { timelineApi, TimelineEvent } from '../api/timeline';
import { formatRelativeTime } from '../lib/utils';
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

/**
 * Mapeo de tipos de eventos a sus respectivos iconos visuales.
 */
const eventIcons: Record<string, React.ElementType> = {
  version_created: GitBranch,
  document_signed: FileSignature,
  document_shared: Share2,
  permission_revoked: UserX,
  ownership_transferred: ArrowRightLeft,
  operational_changed: RefreshCw,
};

/**
 * Mapeo de tipos de eventos a variantes de color de Badge.
 */
const eventColors: Record<string, 'default' | 'success' | 'warning' | 'destructive'> = {
  version_created: 'default',
  document_signed: 'success',
  document_shared: 'default',
  permission_revoked: 'warning',
  ownership_transferred: 'warning',
  operational_changed: 'default',
};

/**
 * Etiquetas legibles en español para cada tipo de evento de línea temporal.
 */
const eventLabels: Record<string, string> = {
  version_created: 'Nueva Versión',
  document_signed: 'Documento Firmado',
  document_shared: 'Documento Compartido',
  permission_revoked: 'Permiso Revocado',
  ownership_transferred: 'Propiedad Transferida',
  operational_changed: 'Versión Operacional Cambiada',
};

/**
 * Página de línea temporal de un documento.
 *
 * Muestra el historial cronológico de eventos asociados a un documento,
 * incluyendo versiones, firmas, compartidos y transferencias de propiedad.
 *
 * @returns JSX.Element con la línea temporal del documento.
 */
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
          <h1 className="text-3xl font-bold text-foreground">Línea Temporal del Documento</h1>
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
          <h1 className="text-3xl font-bold text-foreground">Línea Temporal del Documento</h1>
          <p className="mt-1 text-muted-foreground">Historial completo de eventos y cambios</p>
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
                <p className="text-sm text-muted-foreground">Total de Eventos</p>
                <p className="text-2xl font-bold text-foreground">{data.events.length}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Primer Evento</p>
                <p className="text-sm font-medium text-foreground">
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
                <p className="text-sm text-muted-foreground">Último Evento</p>
                <p className="text-sm font-medium text-foreground">
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
        <div className="absolute bottom-0 left-6 top-0 w-0.5 bg-border" />

        {data.events.map((event: TimelineEvent) => {
          const Icon = eventIcons[event.type] || Clock;
          const color = eventColors[event.type] || 'default';
          const label = eventLabels[event.type] || event.type;

          return (
            <Card key={event.id} className="relative ml-14 hover:shadow-md transition-shadow">
              {/* Timeline dot */}
              <div className="absolute -left-[3.25rem] top-6 z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 border-border bg-white">
                <Icon className="h-6 w-6 text-muted-foreground" />
              </div>

              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Badge variant={color} className="text-sm">
                      {label}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {formatRelativeTime(event.timestamp)}
                    </span>
                  </div>
                </div>

                {/* Actor */}
                <div className="flex items-center gap-2 mb-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">
                    <span className="font-medium">
                      {event.actor.fullName || event.actor.username}
                    </span>
                  </span>
                </div>

                {/* Details */}
                {event.details && Object.keys(event.details).length > 0 && (
                  <div className="mb-3 rounded-lg border border-border bg-secondary/35 p-3">
                    <p className="mb-2 text-xs font-medium text-muted-foreground">Detalles:</p>
                    {Object.entries(event.details).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between py-1">
                        <span className="text-sm capitalize text-muted-foreground">
                          {key.replace(/_/g, ' ')}:
                        </span>
                        <span className="text-sm font-medium text-foreground">
                          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Blockchain TX */}
                {event.blockchainTx && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
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
