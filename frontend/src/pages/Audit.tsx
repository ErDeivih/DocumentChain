import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import AlertMessage from '../components/ui/AlertMessage';
import { auditApi, AuditEvent, PublicStats, AuditHealth } from '../api/audit';
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
} from 'lucide-react';

type SearchType = 'blockchainId' | 'walletAddress' | 'fileId';

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
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-600" />
            Auditoría Blockchain
          </h1>
          <p className="text-gray-600 mt-2">
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
                <p className="text-sm text-gray-500">Documentos</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Key className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stats.totalSignatures}</p>
                <p className="text-sm text-gray-500">Firmas</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Eye className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{stats.totalShares}</p>
                <p className="text-sm text-gray-500">Compartidos</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{stats.totalVersions}</p>
                <p className="text-sm text-gray-500">Versiones</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Box className="w-8 h-8 text-indigo-600" />
              <div>
                <p className="text-2xl font-bold">{stats.lastBlockSynced}</p>
                <p className="text-sm text-gray-500">Último Bloque</p>
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
                <p className="text-sm text-gray-500">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <button
              onClick={() => { setSearchType('blockchainId'); clearResults(); }}
              className={`p-4 border-2 rounded-lg transition-colors ${
                searchType === 'blockchainId'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Hash className="w-6 h-6 mx-auto mb-2 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Por ID Blockchain</h3>
              <p className="text-xs text-gray-600 mt-1">
                Ver historial completo de eventos
              </p>
            </button>

            <button
              onClick={() => { setSearchType('walletAddress'); clearResults(); }}
              className={`p-4 border-2 rounded-lg transition-colors ${
                searchType === 'walletAddress'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <User className="w-6 h-6 mx-auto mb-2 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Verificar Propiedad</h3>
              <p className="text-xs text-gray-600 mt-1">
                Comprobar si una wallet es propietaria
              </p>
            </button>

            <button
              onClick={() => { setSearchType('fileId'); clearResults(); }}
              className={`p-4 border-2 rounded-lg transition-colors ${
                searchType === 'fileId'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Database className="w-6 h-6 mx-auto mb-2 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Verificar Integridad</h3>
              <p className="text-xs text-gray-600 mt-1">
                Comprobar integridad blockchain vs BD
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
                <p className="text-sm text-gray-500">Propietario</p>
                <p className="font-mono text-sm">{formatAddress(metadataResult.owner)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Hash del Archivo</p>
                <p className="font-mono text-sm truncate">{metadataResult.fileHash?.substring(0, 20)}...</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">CID IPFS</p>
                <p className="font-mono text-sm truncate">{metadataResult.contentCid?.substring(0, 20)}...</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Creado</p>
                <p className="font-semibold">{formatDate(metadataResult.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Versión Actual</p>
                <p className="font-semibold">v{metadataResult.currentVersion}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Estado</p>
                <Badge variant={metadataResult.isDeleted ? 'destructive' : 'success'}>
                  {metadataResult.isDeleted ? 'Eliminado' : 'Activo'}
                </Badge>
              </div>
            </div>
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
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={getEventTypeColor(event.eventType)}>
                          {getEventTypeLabel(event.eventType)}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          Bloque #{event.blockNumber}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Actor:</span>{' '}
                          <span className="font-mono">{formatAddress(event.actor)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Fecha:</span>{' '}
                          <span>{formatDate(event.timestamp)}</span>
                        </div>
                      </div>
                      {event.transactionHash && (
                        <div className="mt-2 text-sm">
                          <span className="text-gray-500">TX:</span>{' '}
                          <span className="font-mono text-xs break-all">
                            {event.transactionHash}
                          </span>
                        </div>
                      )}
                      {event.details && Object.keys(event.details).length > 0 && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                          <pre className="whitespace-pre-wrap">
                            {JSON.stringify(event.details, null, 2)}
                          </pre>
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
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Propiedad Verificada
                </h2>
                <p className="text-gray-600 mb-4">
                  La wallet <span className="font-mono">{formatAddress(ownershipResult.walletAddress)}</span> ES propietaria de este documento
                </p>
              </>
            ) : (
              <>
                <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Propiedad No Verificada
                </h2>
                <p className="text-gray-600 mb-4">
                  La wallet <span className="font-mono">{formatAddress(ownershipResult.walletAddress)}</span> NO es propietaria de este documento
                </p>
              </>
            )}
            {ownershipResult.documentInfo && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg text-left max-w-md mx-auto">
                <p className="text-sm text-gray-500 mb-1">Propietario Real:</p>
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
                    <span className="text-gray-500">Existe:</span>
                    <Badge variant={integrityResult.blockchainData?.exists ? 'success' : 'destructive'}>
                      {integrityResult.blockchainData?.exists ? 'Sí' : 'No'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Propietario:</span>
                    <span className="font-mono text-xs">
                      {formatAddress(integrityResult.blockchainData?.owner || '')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Eliminado:</span>
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
                    <span className="text-gray-500">Existe:</span>
                    <Badge variant={integrityResult.databaseData?.exists ? 'success' : 'destructive'}>
                      {integrityResult.databaseData?.exists ? 'Sí' : 'No'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Nombre:</span>
                    <span>{integrityResult.databaseData?.name || '-'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Match Results */}
            {integrityResult.match && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
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

      {/* Info Section */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="py-4">
          <h3 className="font-semibold text-blue-800 mb-2">¿Qué es la Auditoría Blockchain?</h3>
          <p className="text-sm text-blue-700 mb-3">
            Esta página permite a cualquier persona consultar información pública almacenada en la blockchain,
            similar a como Etherscan permite explorar transacciones de Ethereum.
          </p>
          <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
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