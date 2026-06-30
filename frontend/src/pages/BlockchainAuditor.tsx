import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import AlertMessage from '../components/ui/AlertMessage';
import { copyToClipboard, formatDate } from '../lib/utils';
import { TransactionDetailModal } from '../components/audit/TransactionDetailModal';
import { auditApi } from '../api/audit';
import {
  Search,
  Filter,
  Hash,
  User,
  FileText,
  ChevronDown,
  ChevronUp,
  Clock,
  Shield,
  RefreshCw,
  X,
  Copy,
  ExternalLink,
} from 'lucide-react';

/**
 * Evento registrado en la blockchain proveniente del sistema de auditoría.
 */
interface BlockchainEvent {
    id: string;
    eventType: string;
    userId: string | null;
    documentId: string | null;
    metadata: Record<string, unknown> | null;
    transactionHash: string | null;
    blockNumber: number | null;
    blockTimestamp: string | null;
    createdAt: string;
    user: {
        id: string;
        username: string;
        email: string;
  } | null;
    document: {
        id: string;
        name: string;
        blockchainId: string;
        owner: {
            id: string;
            username: string;
    };
  } | null;
}

const EVENT_TYPES = [
  { value: 'DocumentCreated', label: 'Documento Creado', color: 'bg-green-500' },
  { value: 'VersionCreated', label: 'Nueva Versión', color: 'bg-blue-500' },
  { value: 'VersionRestored', label: 'Versión Restaurada', color: 'bg-purple-500' },
  { value: 'DocumentShared', label: 'Compartido', color: 'bg-blue-400' },
  { value: 'PermissionRevoked', label: 'Permiso Revocado', color: 'bg-orange-500' },
  { value: 'DocumentSigned', label: 'Firmado', color: 'bg-indigo-500' },
  { value: 'DocumentDeleted', label: 'Eliminado', color: 'bg-red-500' },
  { value: 'DocumentArchived', label: 'Archivado', color: 'bg-yellow-500' },
  { value: 'DocumentUnarchived', label: 'Desarchivado', color: 'bg-green-400' },
  { value: 'OwnershipTransferred', label: 'Propiedad Transferida', color: 'bg-cyan-500' },
  { value: 'OperationalVersionChanged', label: 'Versión Operacional', color: 'bg-teal-500' },
  { value: 'DocumentTransferred', label: 'Transferencia', color: 'bg-pink-500' },
  { value: 'AdminRoleRevoked', label: 'Admin Revocado', color: 'bg-gray-500' },
];

/**
 * Página de auditoría técnica blockchain.
 *
 * Explorador avanzado de eventos on-chain que permite filtrar por tipo,
 * dirección de wallet, hash de transacción, rango de bloques y fechas.
 * Soporta visualización de detalles de transacciones.
 *
 * @returns JSX.Element con el explorador de eventos blockchain.
 */
export const BlockchainAuditor: React.FC = () => {
  const [events, setEvents] = useState<BlockchainEvent[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const [searchTrigger, setSearchTrigger] = useState(0);

  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [txHash, setTxHash] = useState('');
  const [fromBlock, setFromBlock] = useState('');
  const [toBlock, setToBlock] = useState('');

  const [limit] = useState(20);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const [txModalOpen, setTxModalOpen] = useState(false);
  const [txModalDetails, setTxModalDetails] = useState<any>(null);
  const [txModalLoading, setTxModalLoading] = useState(false);

  const activeTypesCount = selectedTypes.length || EVENT_TYPES.length;

  const statsInline = useMemo(() => ({
    total,
    shown: events.length,
    activeTypes: activeTypesCount,
  }), [total, events.length, activeTypesCount]);

  useEffect(() => {
    fetchEvents();
  }, [selectedTypes, offset, walletAddress, txHash, fromBlock, toBlock, startDate, endDate, limit, searchTrigger]);

  const handleSearch = () => {
    setOffset(0);
    setSearchTrigger(prev => prev + 1);
  };

  const handleClearFilters = () => {
    setSelectedTypes([]);
    setWalletAddress('');
    setTxHash('');
    setFromBlock('');
    setToBlock('');
    setStartDate('');
    setEndDate('');
    setOffset(0);
  };

  const toggleEventType = (type: string) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter(t => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  const getEventTypeConfig = (type: string) => {
    return EVENT_TYPES.find(e => e.value === type) || {
      value: type,
      label: type,
      color: 'bg-gray-500'
    };
  };

  const copyText = async (text: string) => {
    await copyToClipboard(text);
  };

  const openTxModal = async (hash: string) => {
    setTxModalOpen(true);
    setTxModalLoading(true);
    setTxModalDetails(null);
    try {
      const data = await auditApi.getTransactionByHash(hash);
      setTxModalDetails(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar detalles de la transacción');
    } finally {
      setTxModalLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const filters: Record<string, string> = {};

      if (selectedTypes.length > 0) filters.eventTypes = selectedTypes.join(',');
      if (walletAddress.trim()) filters.walletAddress = walletAddress.trim();
      if (txHash.trim()) filters.txHash = txHash.trim();
      if (fromBlock.trim()) filters.fromBlock = fromBlock.trim();
      if (toBlock.trim()) filters.toBlock = toBlock.trim();
      if (startDate) filters.startDate = new Date(startDate).toISOString();
      if (endDate) filters.endDate = new Date(endDate).toISOString();

      const data = await auditApi.queryEvents({ ...filters, offset, limit });

      if (!data.success) {
        throw new Error('No se pudieron cargar los eventos de auditoría.');
      }

      setEvents(data.events || []);
      setTotal(data.total || 0);
      setHasMore(Boolean(data.hasMore));
    } catch (err: any) {
      setError(err.message || 'No se pudieron cargar los eventos de auditoría.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4">
      {/* Encabezado y controles principales */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-7 w-7 text-primary" />
            Auditoría Blockchain
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Explorador técnico de transacciones y eventos on-chain.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Buscar por Tx Hash 0x..."
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-64"
            />
            <Button variant="outline" onClick={handleSearch} className="shrink-0">
              <Search className="w-4 h-4" />
            </Button>
            {txHash && (
              <Button variant="ghost" size="sm" onClick={() => { setTxHash(''); handleSearch(); }} className="shrink-0 px-2">
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <Badge variant="outline">Total: {statsInline.total}</Badge>
          <Badge variant="outline">Mostrados: {statsInline.shown}</Badge>
          <Badge variant="outline">Tipos: {statsInline.activeTypes}</Badge>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filtros {selectedTypes.length > 0 && `(${selectedTypes.length})`}
          </Button>
          <Button onClick={fetchEvents} className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Panel de filtros avanzados */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Filtros avanzados</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-red-600 hover:text-red-700"
              >
                <X className="w-4 h-4 mr-1" />
                Limpiar
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Tipos de eventos</label>
              <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-2">
                {EVENT_TYPES.map((type) => (
                  <Button
                    key={type.value}
                    variant={selectedTypes.includes(type.value) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleEventType(type.value)}
                    className="justify-start"
                  >
                    {type.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              <Input type="text" placeholder="Wallet 0x..." value={walletAddress} onChange={(e) => setWalletAddress(e.target.value)} />
              <Input type="text" placeholder="Tx Hash 0x..." value={txHash} onChange={(e) => setTxHash(e.target.value)} />
              <Input type="number" placeholder="Desde bloque" value={fromBlock} onChange={(e) => setFromBlock(e.target.value)} />
              <Input type="number" placeholder="Hasta bloque" value={toBlock} onChange={(e) => setToBlock(e.target.value)} />
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>

            <Button onClick={handleSearch} className="w-full">
              <Search className="w-4 h-4 mr-2" />
              Buscar eventos
            </Button>
          </CardContent>
        </Card>
      )}

      {error && <AlertMessage type="error" message={error} onClose={() => setError(null)} />}

      {/* Listado de eventos blockchain */}
      <Card>
        <CardHeader>
          <CardTitle>Eventos ({total.toLocaleString()})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <RefreshCw className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">Cargando eventos...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No se encontraron eventos con los filtros actuales</div>
          ) : (
            <div className="space-y-2">
              {events.map((event) => {
                const config = getEventTypeConfig(event.eventType);
                const isExpanded = expandedEvent === event.id;

                return (
                  <div key={event.id} className="rounded-lg border border-border bg-white px-3 py-2 transition-colors hover:bg-secondary/35">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <Badge className={`${config.color} text-white`}>{config.label}</Badge>
                          {event.blockNumber !== null && (
                            <Badge variant="outline">Bloque #{event.blockNumber.toLocaleString()}</Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-1 gap-1 text-xs text-muted-foreground md:grid-cols-2 xl:grid-cols-4">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span className="truncate">{event.user?.username || event.userId || 'Sistema'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            <span className="truncate">{event.document?.name || event.documentId || '-'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(event.blockTimestamp ?? event.createdAt)}
                          </div>
                           <div className="flex items-center gap-1 min-w-0">
                             <Hash className="w-3 h-3" />
                             {event.transactionHash ? (
                               <button
                                 className="truncate text-blue-600 hover:underline cursor-pointer bg-transparent border-none p-0 text-left flex items-center gap-1"
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   void openTxModal(event.transactionHash as string);
                                 }}
                                 title="Ver detalles de la transacción"
                               >
                                 {event.transactionHash}
                                <ExternalLink className="w-3 h-3 inline" />
                               </button>
                             ) : (
                              <span className="truncate">-</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <Button variant="ghost" size="sm" onClick={() => setExpandedEvent(isExpanded ? null : event.id)}>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </Button>
                    </div>

                    {isExpanded && (
                      <div className="mt-2 pt-2 border-t space-y-2 text-xs">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div className="rounded border border-border bg-secondary/35 p-2 text-foreground">
                            <p className="font-semibold mb-1">Transacción</p>
                            <p><strong>Hash:</strong> {event.transactionHash || '-'}</p>
                            <p><strong>Bloque:</strong> {event.blockNumber ?? '-'}</p>
                            <p><strong>Timestamp:</strong> {formatDate(event.blockTimestamp ?? event.createdAt)}</p>
                          </div>
                          <div className="rounded border border-border bg-secondary/35 p-2 text-foreground">
                            <p className="font-semibold mb-1">Entidades</p>
                            <p><strong>Usuario:</strong> {event.user?.username || event.userId || 'Sistema'}</p>
                            <p><strong>Documento:</strong> {event.document?.name || event.documentId || '-'}</p>
                            <p><strong>BlockchainId:</strong> {event.document?.blockchainId || '-'}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {event.transactionHash && (
                            <Button variant="outline" size="sm" onClick={() => copyText(event.transactionHash as string)}>
                               <Copy className="w-3 h-3 mr-1" /> Copiar Tx Hash
                            </Button>
                          )}
                          <Button variant="outline" size="sm" onClick={() => copyText(JSON.stringify(event.metadata || {}, null, 2))}>
                            <Copy className="w-3 h-3 mr-1" /> Copiar Metadata
                          </Button>
                        </div>
                        <pre className="max-h-48 overflow-auto rounded border border-border bg-secondary/35 p-2 text-[11px] text-foreground">
{JSON.stringify(event.metadata, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {!isLoading && events.length > 0 && (
            <div className="flex justify-between items-center mt-4 pt-3 border-t">
              <Button variant="outline" onClick={() => setOffset(Math.max(0, offset - limit))} disabled={offset === 0}>
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground">
                Mostrando {offset + 1} - {offset + events.length} de {total}
              </span>
              <Button variant="outline" onClick={() => setOffset(offset + limit)} disabled={!hasMore}>
                Siguiente
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <TransactionDetailModal
        open={txModalOpen}
        onClose={() => setTxModalOpen(false)}
        details={txModalDetails}
        isLoading={txModalLoading}
      />
    </div>
  );
};

export default BlockchainAuditor;
