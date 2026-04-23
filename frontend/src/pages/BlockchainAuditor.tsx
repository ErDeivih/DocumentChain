import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import AlertMessage from '../components/ui/AlertMessage';
import { formatDate } from '../lib/utils';
import {
  Search,
  Filter,
  Download,
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
} from 'lucide-react';

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
  { value: 'DocumentCreated', label: 'Documento Creado', icon: '📄', color: 'bg-green-500' },
  { value: 'VersionCreated', label: 'Nueva Versión', icon: '📝', color: 'bg-blue-500' },
  { value: 'VersionRestored', label: 'Versión Restaurada', icon: '⏮️', color: 'bg-purple-500' },
  { value: 'DocumentShared', label: 'Compartido', icon: '🔗', color: 'bg-blue-400' },
  { value: 'PermissionRevoked', label: 'Permiso Revocado', icon: '🚫', color: 'bg-orange-500' },
  { value: 'DocumentSigned', label: 'Firmado', icon: '✍️', color: 'bg-indigo-500' },
  { value: 'DocumentDeleted', label: 'Eliminado', icon: '🗑️', color: 'bg-red-500' },
  { value: 'DocumentArchived', label: 'Archivado', icon: '📦', color: 'bg-yellow-500' },
  { value: 'DocumentUnarchived', label: 'Desarchivado', icon: '📤', color: 'bg-green-400' },
  { value: 'OwnershipTransferred', label: 'Propiedad Transferida', icon: '🔄', color: 'bg-cyan-500' },
  { value: 'OperationalVersionChanged', label: 'Versión Operacional', icon: '🔀', color: 'bg-teal-500' },
  { value: 'DocumentTransferred', label: 'Transferencia', icon: '➡️', color: 'bg-pink-500' },
  { value: 'SystemPaused', label: 'Sistema Pausado', icon: '⏸️', color: 'bg-red-600' },
  { value: 'SystemUnpaused', label: 'Sistema Reanudado', icon: '▶️', color: 'bg-green-600' },
  { value: 'AdminRoleRevoked', label: 'Admin Revocado', icon: '🔓', color: 'bg-gray-500' },
];


export const BlockchainAuditor: React.FC = () => {
  const [events, setEvents] = useState<BlockchainEvent[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

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

  const activeTypesCount = selectedTypes.length || EVENT_TYPES.length;

  const statsInline = useMemo(() => ({
    total,
    shown: events.length,
    activeTypes: activeTypesCount,
  }), [total, events.length, activeTypesCount]);

  useEffect(() => {
    fetchEvents();
  }, [selectedTypes, offset]);

  const fetchEvents = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const filters: Record<string, string> = {
        limit: String(limit),
        offset: String(offset),
      };

      if (selectedTypes.length > 0) filters.eventTypes = selectedTypes.join(',');
      if (walletAddress.trim()) filters.walletAddress = walletAddress.trim();
      if (txHash.trim()) filters.txHash = txHash.trim();
      if (fromBlock.trim()) filters.fromBlock = fromBlock.trim();
      if (toBlock.trim()) filters.toBlock = toBlock.trim();
      if (startDate) filters.startDate = new Date(startDate).toISOString();
      if (endDate) filters.endDate = new Date(endDate).toISOString();

      const response = await fetch(`/api/audit/events?${new URLSearchParams(filters)}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
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

  const handleSearch = () => {
    setOffset(0);
    fetchEvents();
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
      icon: '📋',
      color: 'bg-gray-500'
    };
  };

  const copyText = async (text: string) => {
    await navigator.clipboard.writeText(text);
  };

  const exportToCSV = () => {
    const csv = [
      ['Tipo', 'Usuario', 'Documento', 'Tx Hash', 'Bloque', 'Fecha'].join(','),
      ...events.map(e => [
        e.eventType,
        e.user?.username || e.userId || '-',
        e.document?.name || e.documentId || '-',
        e.transactionHash || '-',
        e.blockNumber || '-',
        formatDate(e.blockTimestamp ?? e.createdAt)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `blockchain-events-${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-7 h-7 text-blue-600" />
            Auditoría Blockchain
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Explorador técnico de transacciones y eventos on-chain.
          </p>
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
          <Button
            variant="outline"
            onClick={exportToCSV}
            disabled={events.length === 0}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            CSV
          </Button>
          <Button onClick={fetchEvents} className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </Button>
        </div>
      </div>

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
                    <span className="mr-2">{type.icon}</span>
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

      <Card>
        <CardHeader>
          <CardTitle>Eventos ({total.toLocaleString()})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400" />
              <p className="text-gray-600 mt-2">Cargando eventos...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No se encontraron eventos con los filtros actuales</div>
          ) : (
            <div className="space-y-2">
              {events.map((event) => {
                const config = getEventTypeConfig(event.eventType);
                const isExpanded = expandedEvent === event.id;

                return (
                  <div key={event.id} className="border rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span>{config.icon}</span>
                          <Badge className={`${config.color} text-white`}>{config.label}</Badge>
                          {event.blockNumber !== null && (
                            <Badge variant="outline">Bloque #{event.blockNumber.toLocaleString()}</Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-1 text-xs text-gray-600">
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
                            <span className="truncate">{event.transactionHash || '-'}</span>
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
                          <div className="p-2 bg-gray-100 rounded">
                            <p className="font-semibold mb-1">Transacción</p>
                            <p><strong>Hash:</strong> {event.transactionHash || '-'}</p>
                            <p><strong>Bloque:</strong> {event.blockNumber ?? '-'}</p>
                            <p><strong>Timestamp:</strong> {formatDate(event.blockTimestamp ?? event.createdAt)}</p>
                          </div>
                          <div className="p-2 bg-gray-100 rounded">
                            <p className="font-semibold mb-1">Entidades</p>
                            <p><strong>Usuario:</strong> {event.user?.username || event.userId || 'Sistema'}</p>
                            <p><strong>Documento:</strong> {event.document?.name || event.documentId || '-'}</p>
                            <p><strong>BlockchainId:</strong> {event.document?.blockchainId || '-'}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {event.transactionHash && (
                            <Button variant="outline" size="sm" onClick={() => copyText(event.transactionHash!)}>
                              <Copy className="w-3 h-3 mr-1" /> Copiar Tx Hash
                            </Button>
                          )}
                          <Button variant="outline" size="sm" onClick={() => copyText(JSON.stringify(event.metadata || {}, null, 2))}>
                            <Copy className="w-3 h-3 mr-1" /> Copiar Metadata
                          </Button>
                        </div>
                        <pre className="bg-gray-100 p-2 rounded text-[11px] overflow-auto max-h-48">
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
              <span className="text-sm text-gray-600">
                Mostrando {offset + 1} - {offset + events.length} de {total}
              </span>
              <Button variant="outline" onClick={() => setOffset(offset + limit)} disabled={!hasMore}>
                Siguiente
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BlockchainAuditor;
