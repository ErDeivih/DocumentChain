import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import AlertMessage from '../components/ui/AlertMessage';
import { auditApi, AuditEvent, PublicStats, AuditHealth, TransactionDetails } from '../api/audit';
import { formatDate } from '../lib/utils';
import {
  Search,
  Shield,
  Activity,
  FileCheck,
  User,
  Hash,
  Box,
  CheckCircle,
  XCircle,
  RefreshCw,
  Database,
  Globe,
  Eye,
  Key,
  FileText,
} from 'lucide-react';

/**
 * Tipos de búsqueda soportados en la auditoría blockchain.
 */
type SearchType = 'blockchainId' | 'walletAddress' | 'fileId' | 'txHash';

/**
 * Página pública de auditoría blockchain.
 *
 * Permite consultar el historial de eventos de un documento, verificar propiedad,
 * integridad y explorar transacciones por hash, funcionando como un explorador
 * similar a Etherscan orientado a documentos.
 *
 * @returns JSX.Element con la interfaz de auditoría.
 */
export const Audit: React.FC = () => {
  const [searchType, setSearchType] = useState<SearchType>('blockchainId');
  const [searchValue, setSearchValue] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Results
  const [auditTrail, setAuditTrail] = useState<AuditEvent[] | null>(null);
  const [ownershipResult, setOwnershipResult] = useState<any | null>(null);
  const [integrityResult, setIntegrityResult] = useState<any | null>(null);
  const [metadataResult, setMetadataResult] = useState<any | null>(null);
  const [txDetails, setTxDetails] = useState<TransactionDetails | null>(null);
  
  // Public stats
  const [stats, setStats] = useState<PublicStats | null>(null);
  const [health, setHealth] = useState<AuditHealth | null>(null);

  // Load public stats on mount
  useEffect(() => {
    loadPublicData();
  }, []);

  const loadPublicData = async () => {
    try {
      const [statsRes, healthRes] = await Promise.all([
        auditApi.getPublicStats(),
        auditApi.getHealth(),
      ]);
      setStats(statsRes.stats);
      setHealth(healthRes);
    } catch (err) {
      console.error('Error loading public data:', err);
    }
  };

  const handleSearch = async () => {
    if (!searchValue.trim()) {
      setError('Por favor introduzca un valor de búsqueda');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);
    clearResults();

    try {
      switch (searchType) {
        case 'blockchainId':
          // Get audit trail
          const trailRes = await auditApi.getAuditTrail(searchValue.trim());
          setAuditTrail(trailRes.events);
          
          // Also get metadata
          try {
            const metaRes = await auditApi.getPublicMetadata(searchValue.trim());
            setMetadataResult(metaRes.metadata);
          } catch (e) {
            // Metadata might not exist
          }
          
          setSuccess(`Encontrados ${trailRes.totalEvents} eventos para el documento`);
          break;

        case 'walletAddress':
          if (!searchValue.trim().startsWith('0x')) {
            setError('La dirección de wallet debe comenzar con 0x');
            setIsLoading(false);
            return;
          }
          
          // For wallet address, we need a blockchainId too
          if (!walletAddress.trim()) {
            setError('Para verificar propiedad, introduzca también el ID del documento blockchain');
            setIsLoading(false);
            return;
          }
          
          const ownerRes = await auditApi.verifyOwnership(walletAddress.trim(), searchValue.trim());
          setOwnershipResult(ownerRes.ownership);
          setSuccess(ownerRes.ownership.isOwner 
            ? 'La wallet ES propietaria de este documento' 
            : 'La wallet NO es propietaria de este documento');
          break;

        case 'fileId':
          const integrityRes = await auditApi.verifyIntegrity(searchValue.trim());
          setIntegrityResult(integrityRes.integrity);
          setSuccess(integrityRes.integrity.valid 
            ? 'La integridad del documento está VERIFICADA' 
            : 'ALERTA: La integridad del documento NO coincide');
          break;

        case 'txHash':
          const txRes = await auditApi.getTransactionByHash(searchValue.trim());
          setTxDetails(txRes);
          setSuccess(`Transacción encontrada en bloque #${txRes.transaction.blockNumber ?? '?'} con ${txRes.events.length} eventos`);
          break;
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Error en la búsqueda');
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setAuditTrail(null);
    setOwnershipResult(null);
    setIntegrityResult(null);
    setMetadataResult(null);
    setTxDetails(null);
  };

  const getEventTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'DOCUMENT_CREATED': 'Documento Creado',
      'DocumentCreated': 'Documento Creado',
      'VERSION_CREATED': 'Nueva Versión',
      'DocumentVersioned': 'Nueva Versión',
      'DOCUMENT_DELETED': 'Documento Eliminado',
      'DocumentDeleted': 'Documento Eliminado',
      'PERMISSION_GRANTED': 'Permiso Concedido',
      'PermissionGranted': 'Permiso Concedido',
      'DocumentShared': 'Documento Compartido',
      'PERMISSION_REVOKED': 'Permiso Revocado',
      'PermissionRevoked': 'Permiso Revocado',
      'DOCUMENT_SIGNED': 'Documento Firmado',
      'DocumentArchived': 'Documento Archivado',
      'DocumentUnarchived': 'Documento Desarchivado',
      'DocumentTransferred': 'Documento Transferido',
    };
    return labels[type] || type;
  };

  const getEventTypeColor = (type: string) => {
    const colors: Record<string, 'success' | 'warning' | 'destructive' | 'default'> = {
      'DOCUMENT_CREATED': 'success',
      'DocumentCreated': 'success',
      'VERSION_CREATED': 'default',
      'DocumentVersioned': 'default',
      'DOCUMENT_DELETED': 'destructive',
      'DocumentDeleted': 'destructive',
      'PERMISSION_GRANTED': 'success',
      'PermissionGranted': 'success',
      'DocumentShared': 'success',
      'PERMISSION_REVOKED': 'warning',
      'PermissionRevoked': 'warning',
      'DOCUMENT_SIGNED': 'success',
      'DocumentArchived': 'warning',
      'DocumentUnarchived': 'success',
      'DocumentTransferred': 'default',
    };
    return colors[type] || 'default';
  };

  const formatAddress = (address: string) => {
    if (!address) return '-';
    return `${address.substring(0, 10)}...${address.substring(address.length - 8)}`;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold text-foreground">
            <Shield className="h-8 w-8 text-primary" />
            Auditoría Blockchain
          </h1>
          <p className="mt-2 text-muted-foreground">
            Consulta pública de eventos y transacciones en la blockchain - Similar a Etherscan
          </p>
        </div>
        <Button variant="outline" onClick={loadPublicData}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* System Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <FileCheck className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats.totalDocuments}</p>
                <p className="text-sm text-muted-foreground">Documentos</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Key className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stats.totalSignatures}</p>
                <p className="text-sm text-muted-foreground">Firmas</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Eye className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{stats.totalShares}</p>
                <p className="text-sm text-muted-foreground">Compartidos</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{stats.totalVersions}</p>
                <p className="text-sm text-muted-foreground">Versiones</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Box className="w-8 h-8 text-indigo-600" />
              <div>
                <p className="text-2xl font-bold">{stats.lastBlockSynced}</p>
                <p className="text-sm text-muted-foreground">Último Bloque</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Health Status */}
      {health && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {health.blockchain.connected ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600" />
              )}
              <div>
                <p className="font-semibold">Estado del Servicio: {health.status}</p>
                <p className="text-sm text-muted-foreground">
                  Blockchain: {health.blockchain.connected ? 'Conectado' : 'Desconectado'} - 
                  Bloque actual: #{health.blockchain.latestBlock}
                </p>
              </div>
            </div>
            <Badge variant={health.blockchain.connected ? 'success' : 'destructive'}>
              {health.blockchain.connected ? 'Operacional' : 'Degradado'}
            </Badge>
          </div>
        </Card>
      )}

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Búsqueda de Auditoría
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <AlertMessage type="error" message={error} onClose={() => setError(null)} className="mb-4" />
          )}
          {success && (
            <AlertMessage type="success" message={success} onClose={() => setSuccess(null)} className="mb-4" />
          )}

          {/* Search Type Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            <button
              onClick={() => { setSearchType('blockchainId'); clearResults(); }}
              className={`p-4 border-2 rounded-lg transition-colors ${
                searchType === 'blockchainId'
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-white hover:border-primary/40 hover:bg-primary/5'
              }`}
            >
              <Hash className="mx-auto mb-2 h-6 w-6 text-primary" />
              <h3 className="font-semibold text-foreground">Por ID Blockchain</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Ver historial completo de eventos
              </p>
            </button>

            <button
              onClick={() => { setSearchType('walletAddress'); clearResults(); }}
              className={`p-4 border-2 rounded-lg transition-colors ${
                searchType === 'walletAddress'
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-white hover:border-primary/40 hover:bg-primary/5'
              }`}
            >
              <User className="mx-auto mb-2 h-6 w-6 text-primary" />
              <h3 className="font-semibold text-foreground">Verificar Propiedad</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Comprobar si una wallet es propietaria
              </p>
            </button>

            <button
              onClick={() => { setSearchType('fileId'); clearResults(); }}
              className={`p-4 border-2 rounded-lg transition-colors ${
                searchType === 'fileId'
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-white hover:border-primary/40 hover:bg-primary/5'
              }`}
            >
              <Database className="mx-auto mb-2 h-6 w-6 text-primary" />
              <h3 className="font-semibold text-foreground">Verificar Integridad</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Comprobar integridad blockchain vs BD
              </p>
            </button>

            <button
              onClick={() => { setSearchType('txHash'); clearResults(); }}
              className={`p-4 border-2 rounded-lg transition-colors ${
                searchType === 'txHash'
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-white hover:border-primary/40 hover:bg-primary/5'
              }`}
            >
              <Activity className="mx-auto mb-2 h-6 w-6 text-primary" />
              <h3 className="font-semibold text-foreground">Por Tx Hash</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Explorar transacción y eventos decodificados
              </p>
            </button>
          </div>

          {/* Search Input */}
          <div className="space-y-4">
            {searchType === 'blockchainId' && (
              <Input
                label="ID del Documento Blockchain"
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="0x... (66 caracteres hexadecimales)"
                helperText="Introduzca el ID del documento (bytes32) para ver su historial completo"
              />
            )}

            {searchType === 'walletAddress' && (
              <>
                <Input
                  label="ID del Documento Blockchain"
                  type="text"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder="0x..."
                  helperText="ID del documento a verificar"
                />
                <Input
                  label="Dirección de Wallet"
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="0x... (42 caracteres hexadecimales)"
                  helperText="Dirección de wallet a verificar como propietaria"
                />
              </>
            )}

            {searchType === 'fileId' && (
              <Input
                label="ID del Archivo (UUID)"
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                helperText="ID del archivo en la base de datos para verificar integridad"
              />
            )}

            {searchType === 'txHash' && (
              <Input
                label="Hash de Transacción"
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="0x... (66 caracteres hexadecimales)"
                helperText="Introduzca el hash de la transacción para ver sus eventos decodificados"
              />
            )}

            <Button
              variant="primary"
              onClick={handleSearch}
              isLoading={isLoading}
              disabled={!searchValue.trim() || (searchType === 'walletAddress' && !walletAddress.trim())}
            >
              <Search className="w-4 h-4 mr-2" />
              {isLoading ? 'Buscando...' : 'Buscar en Blockchain'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      {metadataResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Metadatos Públicos del Documento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Propietario</p>
                <p className="font-mono text-sm">{formatAddress(metadataResult.owner)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Hash del Archivo</p>
                <p className="font-mono text-sm truncate">{metadataResult.fileHash?.substring(0, 20)}...</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">CID IPFS</p>
                <p className="font-mono text-sm truncate">{metadataResult.contentCid?.substring(0, 20)}...</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Creado</p>
                <p className="font-semibold">{formatDate(metadataResult.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Versión Actual</p>
                <p className="font-semibold">v{metadataResult.currentVersion}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estado</p>
                <Badge variant={metadataResult.isDeleted ? 'destructive' : 'success'}>
                  {metadataResult.isDeleted ? 'Eliminado' : 'Activo'}
                </Badge>
              </div>
            </div>
            {(metadataResult.publicId || metadataResult.documentId) && (
              <div className="mt-4 pt-4 border-t flex gap-3">
                {metadataResult.publicId && (
                  <Link 
                    to={`/public/d/${metadataResult.publicId}`}
                    className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                    target="_blank"
                  >
                    <Eye className="w-4 h-4" />
                    Ver página pública del documento
                  </Link>
                )}
                {metadataResult.documentId && (
                  <Link 
                    to={`/app/documents/${metadataResult.documentId}`}
                    className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                  >
                    <FileText className="w-4 h-4" />
                    Abrir en DocumentChain
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Audit Trail Results */}
      {auditTrail && auditTrail.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Historial de Eventos ({auditTrail.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {auditTrail.map((event, index) => (
                <div
                  key={event.id || index}
                  className="rounded-lg border border-border bg-white p-4 transition-colors hover:bg-secondary/35"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={getEventTypeColor(event.eventType)}>
                          {getEventTypeLabel(event.eventType)}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Bloque #{event.blockNumber}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Actor:</span>{' '}
                          <span className="font-mono">{formatAddress(event.actor)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Fecha:</span>{' '}
                          <span>{formatDate(event.timestamp)}</span>
                        </div>
                      </div>
                      {event.transactionHash && (
                        <div className="mt-2 text-sm">
                          <span className="text-muted-foreground">TX:</span>{' '}
                          <span className="font-mono text-xs break-all">
                            {event.transactionHash}
                          </span>
                        </div>
                      )}
                      {event.details && Object.keys(event.details).length > 0 && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          {Object.entries(event.details).map(([key, value]) => (
                            <span key={key} className="mr-3">
                              <span className="font-medium">{key}:</span> {String(value)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ownership Result */}
      {ownershipResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Verificación de Propiedad
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center py-8">
            {ownershipResult.isOwner ? (
              <>
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h2 className="mb-2 text-2xl font-bold text-foreground">
                  Propiedad Verificada
                </h2>
                <p className="mb-4 text-muted-foreground">
                  La wallet <span className="font-mono">{formatAddress(ownershipResult.walletAddress)}</span> ES propietaria de este documento
                </p>
              </>
            ) : (
              <>
                <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
                <h2 className="mb-2 text-2xl font-bold text-foreground">
                  Propiedad No Verificada
                </h2>
                <p className="mb-4 text-muted-foreground">
                  La wallet <span className="font-mono">{formatAddress(ownershipResult.walletAddress)}</span> NO es propietaria de este documento
                </p>
              </>
            )}
            {ownershipResult.documentInfo && (
              <div className="mx-auto mt-4 max-w-md rounded-lg border border-border bg-secondary/35 p-4 text-left">
                <p className="mb-1 text-sm text-muted-foreground">Propietario Real:</p>
                <p className="font-mono text-sm">{formatAddress(ownershipResult.documentInfo.owner)}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Integrity Result */}
      {integrityResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Verificación de Integridad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-center py-6 ${integrityResult.valid ? 'bg-green-50' : 'bg-red-50'} rounded-lg mb-6`}>
              {integrityResult.valid ? (
                <>
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
                  <h3 className="text-xl font-bold text-green-800">Integridad Verificada</h3>
                  <p className="text-green-600">Los datos de blockchain coinciden con la base de datos</p>
                </>
              ) : (
                <>
                  <XCircle className="w-12 h-12 text-red-600 mx-auto mb-2" />
                  <h3 className="text-xl font-bold text-red-800">Alerta de Integridad</h3>
                  <p className="text-red-600">Discrepancia detectada entre blockchain y base de datos</p>
                </>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Blockchain Data */}
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Box className="w-4 h-4" />
                  Datos Blockchain
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Existe:</span>
                    <Badge variant={integrityResult.blockchainData?.exists ? 'success' : 'destructive'}>
                      {integrityResult.blockchainData?.exists ? 'Sí' : 'No'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Propietario:</span>
                    <span className="font-mono text-xs">
                      {formatAddress(integrityResult.blockchainData?.owner || '')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Eliminado:</span>
                    <span>{integrityResult.blockchainData?.isDeleted ? 'Sí' : 'No'}</span>
                  </div>
                </div>
              </div>

              {/* Database Data */}
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  Datos Base de Datos
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Existe:</span>
                    <Badge variant={integrityResult.databaseData?.exists ? 'success' : 'destructive'}>
                      {integrityResult.databaseData?.exists ? 'Sí' : 'No'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nombre:</span>
                    <span>{integrityResult.databaseData?.name || '-'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Match Results */}
            {integrityResult.match && (
              <div className="mt-4 rounded-lg border border-border bg-secondary/35 p-4">
                <h4 className="font-semibold mb-2">Comparación</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Hash de Contenido:</span>
                    {integrityResult.match.contentHash ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Propietario:</span>
                    {integrityResult.match.owner ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Transaction Details Result */}
      {txDetails && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Detalles de Transacción
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Transaction Info */}
            <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
              <h3 className="text-sm font-semibold">Información de Transacción</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Hash:</span> <code className="text-xs bg-muted px-1 rounded">{txDetails.transaction.hash}</code></div>
                <div><span className="text-muted-foreground">Estado:</span> {txDetails.transaction.status === 1 ? <Badge variant="success">Éxito</Badge> : <Badge variant="destructive">Fallido</Badge>}</div>
                <div><span className="text-muted-foreground">Bloque:</span> {txDetails.transaction.blockNumber ?? '-'}</div>
                <div><span className="text-muted-foreground">Fecha:</span> {txDetails.transaction.timestamp ? formatDate(txDetails.transaction.timestamp) : '-'}</div>
                <div><span className="text-muted-foreground">From:</span> <code className="text-xs">{formatAddress(txDetails.transaction.from)}</code></div>
                <div><span className="text-muted-foreground">To:</span> <code className="text-xs">{txDetails.transaction.to ? formatAddress(txDetails.transaction.to) : '-'}</code></div>
                {txDetails.transaction.gasUsed && <div><span className="text-muted-foreground">Gas:</span> {txDetails.transaction.gasUsed}</div>}
              </div>
            </div>

            {/* Decoded Events */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Eventos Decodificados ({txDetails.events.length})</h3>
              {txDetails.events.length === 0 && (
                <p className="text-sm text-muted-foreground">No hay eventos del contrato DocumentRegistry en esta transacción.</p>
              )}
              {txDetails.events.map((event, idx) => (
                <div key={idx} className="rounded-lg border p-4 space-y-2">
                  <Badge variant="default">{event.name}</Badge>
                  {event.document && (
                    <div className="flex items-center gap-2 text-sm flex-wrap">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{event.document.name}</span>
                      <span className="text-xs text-muted-foreground">por {event.document.ownerUsername}</span>
                      {event.document.visibility === 'PUBLIC' && event.document.publicId ? (
                        <a href={`/public/d/${event.document.publicId}`} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">Ver público →</a>
                      ) : event.document.id ? (
                        <Link to={`/app/documents/${event.document.id}`} className="text-xs text-primary hover:underline">Ver en DocumentChain →</Link>
                      ) : (
                        <span className="text-xs text-muted-foreground">Privado</span>
                      )}
                    </div>
                  )}
                  <div className="bg-muted/40 rounded p-2 text-xs font-mono space-y-1">
                    {Object.entries(event.args).map(([key, value]) => (
                      <div key={key} className="flex justify-between gap-4">
                        <span className="text-muted-foreground">{key}:</span>
                        <span className="text-right break-all max-w-[60%]">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Section */}
      <Card className="border-[#cce4ff] bg-[#f7fbff]">
        <CardContent className="py-4">
          <h3 className="mb-2 font-semibold text-foreground">¿Qué es la Auditoría Blockchain?</h3>
          <p className="mb-3 text-sm text-muted-foreground">
            Esta página permite a cualquier persona consultar información pública almacenada en la blockchain,
            similar a como Etherscan permite explorar transacciones de Ethereum.
          </p>
          <ul className="list-inside list-disc space-y-1 text-sm text-foreground">
            <li><strong>Historial de Eventos:</strong> Ve todos los eventos relacionados con un documento</li>
            <li><strong>Verificación de Propiedad:</strong> Comprueba si una wallet es propietaria de un documento</li>
            <li><strong>Integridad:</strong> Verifica que los datos coinciden entre blockchain y base de datos</li>
            <li><strong>Transparencia:</strong> Todos los datos públicos son auditables por cualquiera</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default Audit;