/**
 * Componente de línea temporal de documentos.
 * Muestra el historial completo de eventos asociados a un documento.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Skeleton } from '../ui/Skeleton';
import { getErrorMessage } from '../../lib/api';
import { timelineApi } from '../../api/timeline';
import { formatRelativeTime } from '../../lib/utils';
import {
  FileText,
  FileSignature,
  Share2,
  ArrowRightLeft,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

interface TimelineEvent {
    id: string;
    type: 'version_created' | 'document_signed' | 'document_shared' | 'permission_revoked' | 'ownership_transferred' | 'operational_changed';
    timestamp: string;
    actor: {
    id: string;
    username: string;
    fullName: string | null;
    walletAddress?: string;
  };
    details: Record<string, any>;
    blockchainTx?: string;
}

interface DocumentTimelineProps {
    documentId: string;
}

const eventTypeConfig = {
  version_created: {
    label: 'Nueva versión',
    icon: FileText,
    color: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  document_signed: {
    label: 'Documento firmado',
    icon: FileSignature,
    color: 'bg-green-100 text-green-800 border-green-200'
  },
  document_shared: {
    label: 'Documento compartido',
    icon: Share2,
    color: 'bg-cyan-100 text-cyan-800 border-cyan-200'
  },
  permission_revoked: {
    label: 'Permiso revocado',
    icon: XCircle,
    color: 'bg-red-100 text-red-800 border-red-200'
  },
  ownership_transferred: {
    label: 'Propiedad transferida',
    icon: ArrowRightLeft,
    color: 'bg-amber-100 text-amber-800 border-amber-200'
  },
  operational_changed: {
    label: 'Versión operacional cambiada',
    icon: CheckCircle,
    color: 'bg-purple-100 text-purple-800 border-purple-200'
  }
};

/**
 * Línea temporal de eventos de un documento.
 * Obtiene y visualiza el historial completo de acciones realizadas sobre un documento.
 */
export const DocumentTimeline: React.FC<DocumentTimelineProps> = ({ documentId }) => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchTimeline = async () => {
      try {
        setLoading(true);
        const response = await timelineApi.getDocumentTimeline(documentId);
        if (cancelled) return;
        setEvents(response.events || response.data?.events || []);
        setError(null);
      } catch (err: any) {
        if (cancelled) return;
        if (process.env.NODE_ENV === "development") { console.error('Error al obtener línea temporal:', err); }
        setError(getErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchTimeline();
    return () => { cancelled = true; };
  }, [documentId]);

  const getEventDetails = (event: TimelineEvent): string => {
    const { type, details, actor } = event;
    
    switch (type) {
      case 'version_created':
        return `Versión ${details.versionNumber} creada por ${actor.username}`;
      case 'document_signed':
        return `Firmado por ${actor.username}${details.versionNumber ? ` (versión ${details.versionNumber})` : ''}`;
      case 'document_shared':
        return `Compartido con ${details.sharedWith || 'usuario'}${details.role ? ` (${details.role})` : ''}`;
      case 'permission_revoked':
        return `Acceso revocado a ${details.revokedFrom || 'usuario'}`;
      case 'ownership_transferred':
        return `Transferido de ${details.fromOwner || 'propietario anterior'} a ${details.toOwner || 'nuevo propietario'}`;
      case 'operational_changed':
        return `Versión operacional cambiada a ${details.newVersion || 'nueva versión'}`;
      default:
        return `Acción realizada por ${actor.username}`;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center">
            <Skeleton className="h-8 w-48" />
          </div>
          <div className="mt-4 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-16 flex-1" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-red-600 text-center">{error}</div>
        </CardContent>
      </Card>
    );
  }

  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            No hay eventos en el historial de este documento
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Historial del Documento
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Línea vertical */}
          <div className="absolute bottom-0 left-5 top-0 w-0.5 bg-border" />
          
          <div className="space-y-6">
            {events.map((event) => {
              const config = eventTypeConfig[event.type];
              const IconComponent = config.icon;
              
              return (
                <div key={event.id} className="relative flex gap-4">
                  {/* Icono */}
                  <div className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 bg-white ${config.color}`}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  
                  {/* Contenido */}
                  <div className="flex-1 rounded-lg border border-border bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                         <div className="flex items-center gap-2 mb-1">
                           <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.color}`}>
                             {config.label}
                           </span>
                         </div>
                        
                        <p className="text-sm text-foreground">
                          {getEventDetails(event)}
                        </p>
                        
                        {event.actor.fullName && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            Por: {event.actor.fullName} (@{event.actor.username})
                          </p>
                        )}
                      </div>
                      
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          {formatRelativeTime(event.timestamp)}
                        </p>
                        
                         {event.blockchainTx && (
                           <p className="mt-1 text-xs font-mono text-muted-foreground break-all">
                             TX: {event.blockchainTx}
                           </p>
                         )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentTimeline;
