import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/Dialog';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Copy, ExternalLink, FileText, User, Hash, Clock, Fuel, Activity, Loader2 } from 'lucide-react';
import { copyToClipboard, formatDate, truncateAddress } from '../../lib/utils';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { auditApi } from '../../api/audit';

interface TransactionDetailModalProps {
  open: boolean;
  onClose: () => void;
  details?: {
    transaction: {
      hash: string;
      from: string;
      to: string | null;
      value: string;
      gasPrice: string | null;
      gasUsed: string | null;
      status: number | null;
      blockNumber: number | null;
      timestamp: string | null;
    };
    events: Array<{
      name: string;
      args: Record<string, any>;
      blockchainId: string;
      document?: {
        id: string;
        name: string;
        publicId: string | null;
        visibility: string;
        ownerUsername: string;
      } | null;
    }>;
  } | null;
  isLoading?: boolean;
  txHash?: string;
}

const EVENT_COLORS: Record<string, string> = {
  DocumentCreated: 'bg-green-100 text-green-800',
  VersionCreated: 'bg-blue-100 text-blue-800',
  DocumentShared: 'bg-indigo-100 text-indigo-800',
  PermissionRevoked: 'bg-orange-100 text-orange-800',
  DocumentSigned: 'bg-purple-100 text-purple-800',
  DocumentDeleted: 'bg-red-100 text-red-800',
  DocumentArchived: 'bg-yellow-100 text-yellow-800',
  DocumentUnarchived: 'bg-emerald-100 text-emerald-800',
  OwnershipTransferred: 'bg-cyan-100 text-cyan-800',
};

/**
 * Modal que muestra el detalle completo de una transacción blockchain,
 * incluyendo información general y eventos decodificados del contrato.
 *
 * @param props - Propiedades del componente.
 * @returns Elemento JSX del modal de detalle de transacción.
 */
export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  open,
  onClose,
  details: externalDetails,
  isLoading: externalLoading,
  txHash,
}) => {
  const { user } = useAuth();
  const [fetchedDetails, setFetchedDetails] = useState<any>(null);
  const [internalLoading, setInternalLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (open && txHash && !externalDetails) {
      setInternalLoading(true);
      (async () => {
        try {
          const data = await auditApi.getTransactionByHash(txHash);
          if (!cancelled) setFetchedDetails(data);
        } catch {
          if (!cancelled) setFetchedDetails(null);
        } finally {
          if (!cancelled) setInternalLoading(false);
        }
      })();
    }
    return () => { cancelled = true; };
  }, [open, txHash, externalDetails]);

  const details = externalDetails || fetchedDetails;
  const isLoading = externalLoading || internalLoading;

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Hash className="w-5 h-5" />
            Detalles de Transacción
          </DialogTitle>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        )}

        {!isLoading && !details && (
          <div className="text-center py-8 text-muted-foreground">
            No se encontró información para esta transacción.
          </div>
        )}

        {!isLoading && details && (
          <div className="space-y-6">
            {/* Información de la transacción */}
            <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Información de Transacción
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="space-y-1">
                  <span className="text-muted-foreground">Hash</span>
                  <div className="flex items-center gap-2">
                    <code className="bg-muted px-2 py-1 rounded text-xs">{truncateAddress(details.transaction.hash, 20, 20)}</code>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => copyToClipboard(details.transaction.hash)}>
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">Estado</span>
                  <div>
                    {details.transaction.status === 1 ? (
                      <Badge variant="success">Éxito</Badge>
                    ) : details.transaction.status === 0 ? (
                      <Badge variant="destructive">Fallido</Badge>
                    ) : (
                      <Badge variant="outline">Pendiente</Badge>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">Bloque</span>
                  <p className="font-medium">{details.transaction.blockNumber ?? '-'}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">Fecha</span>
                  <p className="font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {details.transaction.timestamp ? formatDate(details.transaction.timestamp) : '-'}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">From</span>
                  <code className="text-xs bg-muted px-2 py-1 rounded">{truncateAddress(details.transaction.from, 14, 14)}</code>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">To</span>
                  <code className="text-xs bg-muted px-2 py-1 rounded">{details.transaction.to ? truncateAddress(details.transaction.to, 14, 14) : '-'}</code>
                </div>
                {details.transaction.gasUsed && (
                  <div className="space-y-1">
                    <span className="text-muted-foreground">Gas Usado</span>
                    <p className="font-medium flex items-center gap-1">
                      <Fuel className="w-3 h-3" />
                      {details.transaction.gasUsed}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Eventos */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Eventos Decodificados ({details.events.length})
              </h3>

              {details.events.length === 0 && (
                <p className="text-sm text-muted-foreground">No hay eventos del contrato DocumentRegistry en esta transacción.</p>
              )}

              {details.events.map((event: any, idx: number) => (
                <div key={idx} className="rounded-lg border p-4 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <Badge className={EVENT_COLORS[event.name] || 'bg-gray-100 text-gray-800'}>
                      {event.name}
                    </Badge>
                    {event.document && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <User className="w-3 h-3" />
                        Owner: {event.document.ownerUsername}
                      </div>
                    )}
                  </div>

                  {/* Enlace al documento */}
                  {event.document && (
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{event.document.name}</span>
                      {event.document.visibility === 'PUBLIC' && event.document.publicId ? (
                        <Link
                          to={`/public/d/${event.document.publicId}`}
                          target="_blank"
                          className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Ver público
                        </Link>
                      ) : user ? (
                        <Link
                          to={`/app/documents/${event.document.id}`}
                          target="_blank"
                          className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Ver documento
                        </Link>
                      ) : (
                        <span className="text-xs text-muted-foreground">Inicia sesión para acceder</span>
                      )}
                    </div>
                  )}

                  {/* Args */}
                  <div className="bg-muted/40 rounded p-3 space-y-1 text-xs font-mono">
                    {Object.entries(event.args).map(([key, value]) => (
                      <div key={key} className="flex justify-between gap-4">
                        <span className="text-muted-foreground">{key}:</span>
                        <span className="text-right break-all max-w-[60%]">
                          {typeof value === 'string' && value.startsWith('0x') && value.length > 20
                            ? truncateAddress(value, 14, 14)
                            : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TransactionDetailModal;
