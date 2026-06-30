import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Header } from '../components/layout/Header';
import AlertMessage from '../components/ui/AlertMessage';
import { Badge } from '../components/ui/Badge';
import { verifyByFile, verifyByIPFS, verifyByBlockchain } from '../api/verification';
import { auditApi, type OwnershipProof, type IntegrityCheck } from '../api/audit';
import { VerificationResult } from '../types';
import { formatBytes, formatRelativeTime, MAX_FILE_SIZE } from '../lib/utils';
import { getErrorMessage } from '../lib/api';
import {
  Search,
  Upload,
  Database,
  Shield,
  FileCheck,
  User,
  Calendar,
  HardDrive,
  GitBranch,
  Share2,
  FileSignature,
  CheckCircle,
  XCircle,
} from 'lucide-react';

/**
 * Métodos de verificación de documento disponibles en la página pública.
 */
type VerificationMethod = 'file' | 'ipfs' | 'blockchain' | 'ownership' | 'integrity';

/**
 * Página pública de verificación de autenticidad de documentos.
 *
 * Permite verificar la existencia e integridad de un documento mediante
 * tres métodos: subida de archivo, hash IPFS o identificador blockchain.
 *
 * @returns JSX.Element con la interfaz de verificación.
 */
export const Verify: React.FC = () => {
  const location = useLocation();
  const [method, setMethod] = useState<VerificationMethod>('file');
  const [file, setFile] = useState<File | null>(null);
  const [ipfsHash, setIpfsHash] = useState('');
  const [blockchainId, setBlockchainId] = useState('');
  const [ownershipBlockchainId, setOwnershipBlockchainId] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [fileId, setFileId] = useState('');
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [ownershipResult, setOwnershipResult] = useState<OwnershipProof | null>(null);
  const [integrityResult, setIntegrityResult] = useState<IntegrityCheck | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
      setError(null);
    }
  };

  const handleVerify = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setOwnershipResult(null);
    setIntegrityResult(null);

    try {
      let verificationResult: any;

      switch (method) {
        case 'file':
          if (!file) { setError('Por favor seleccione un archivo para verificar'); setIsLoading(false); return; }
          if (file.size > MAX_FILE_SIZE) { setError(`El archivo excede el tamaño máximo permitido de ${formatBytes(MAX_FILE_SIZE)}`); setIsLoading(false); return; }
          verificationResult = await verifyByFile(file);
          setResult(verificationResult);
          break;

        case 'ipfs':
          if (!ipfsHash.trim()) { setError('Por favor introduzca un hash IPFS'); setIsLoading(false); return; }
          verificationResult = await verifyByIPFS(ipfsHash.trim());
          setResult(verificationResult);
          break;

        case 'blockchain':
          if (!blockchainId.trim()) { setError('Por favor introduzca un ID de blockchain'); setIsLoading(false); return; }
          verificationResult = await verifyByBlockchain(blockchainId.trim());
          setResult(verificationResult);
          break;

        case 'ownership':
          if (!ownershipBlockchainId.trim() || !walletAddress.trim()) { setError('Introduzca el ID de blockchain y la dirección de wallet'); setIsLoading(false); return; }
          verificationResult = await auditApi.verifyOwnership(ownershipBlockchainId.trim(), walletAddress.trim());
          setOwnershipResult(verificationResult.ownership);
          break;

        case 'integrity':
          if (!fileId.trim()) { setError('Introduzca el ID del documento'); setIsLoading(false); return; }
          verificationResult = await auditApi.verifyIntegrity(fileId.trim());
          setIntegrityResult(verificationResult.integrity);
          break;
      }
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const content = (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Verificar Documento</h1>
        <p className="mt-2 text-muted-foreground">
          Verifique la autenticidad del documento usando registros blockchain
        </p>
      </div>

      {/* Verification Method Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Elegir Método de Verificación</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">

            <button
              onClick={() => setMethod('file')}
              className={`p-4 border-2 rounded-lg transition-colors ${
                method === 'file'
                  ? 'border-primary bg-primary/10 shadow-sm'
                  : 'border-border bg-white hover:border-primary/40 hover:bg-primary/5'
              }`}
            >
              <Upload className="mx-auto mb-2 h-8 w-8 text-primary" />
              <h3 className="font-semibold text-foreground">Archivo</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Subir un archivo para verificar
              </p>
            </button>

            <button
              onClick={() => setMethod('ipfs')}
              className={`p-4 border-2 rounded-lg transition-colors ${
                method === 'ipfs'
                  ? 'border-primary bg-primary/10 shadow-sm'
                  : 'border-border bg-white hover:border-primary/40 hover:bg-primary/5'
              }`}
            >
              <Database className="mx-auto mb-2 h-8 w-8 text-primary" />
              <h3 className="font-semibold text-foreground">IPFS</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Verificar mediante hash IPFS
              </p>
            </button>

            <button
              onClick={() => setMethod('blockchain')}
              className={`p-4 border-2 rounded-lg transition-colors ${
                method === 'blockchain'
                  ? 'border-primary bg-primary/10 shadow-sm'
                  : 'border-border bg-white hover:border-primary/40 hover:bg-primary/5'
              }`}
            >
              <Shield className="mx-auto mb-2 h-8 w-8 text-primary" />
              <h3 className="font-semibold text-foreground">Blockchain</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Verificar mediante ID blockchain
              </p>
            </button>

            <button
              onClick={() => setMethod('ownership')}
              className={`p-4 border-2 rounded-lg transition-colors ${
                method === 'ownership'
                  ? 'border-primary bg-primary/10 shadow-sm'
                  : 'border-border bg-white hover:border-primary/40 hover:bg-primary/5'
              }`}
            >
              <User className="mx-auto mb-2 h-8 w-8 text-primary" />
              <h3 className="font-semibold text-foreground">Propiedad</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Verificar si una wallet es propietaria
              </p>
            </button>

            <button
              onClick={() => setMethod('integrity')}
              className={`p-4 border-2 rounded-lg transition-colors ${
                method === 'integrity'
                  ? 'border-primary bg-primary/10 shadow-sm'
                  : 'border-border bg-white hover:border-primary/40 hover:bg-primary/5'
              }`}
            >
              <FileCheck className="mx-auto mb-2 h-8 w-8 text-primary" />
              <h3 className="font-semibold text-foreground">Integridad</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Comparar datos en BD vs Blockchain
              </p>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Verification Input */}
      <Card>
        <CardHeader>
          <CardTitle>Introducir Datos de Verificación</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <AlertMessage type="error" message={error} onClose={() => setError(null)} className="mb-4" />
          )}

          <div className="space-y-4">
            {method === 'file' && (
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Seleccionar Archivo a Verificar
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full rounded-xl border border-input bg-white px-3 py-2 text-sm text-foreground file:mr-3 file:rounded-md file:border file:border-border file:bg-secondary/60 file:px-3 file:py-1.5 file:text-foreground"
                />
                {file && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Seleccionado: {file.name} ({formatBytes(file.size)})
                  </p>
                )}
              </div>
            )}

            {method === 'ipfs' && (
              <Input
                label="Hash IPFS"
                type="text"
                value={ipfsHash}
                onChange={(e) => setIpfsHash(e.target.value)}
                placeholder="Qm..."
                helperText="Ingrese el identificador de contenido IPFS (CID)"
              />
            )}

            {method === 'blockchain' && (
              <Input
                label="Blockchain Document ID"
                type="text"
                value={blockchainId}
                onChange={(e) => setBlockchainId(e.target.value)}
                placeholder="0x..."
                helperText="Introduzca el identificador de documento blockchain"
                data-testid="blockchain-id-input"
              />
            )}

            {method === 'ownership' && (
              <>
                <Input
                  label="Blockchain Document ID"
                  type="text"
                  value={ownershipBlockchainId}
                  onChange={(e) => setOwnershipBlockchainId(e.target.value)}
                  placeholder="0x..."
                  helperText="ID del documento en la blockchain"
                />
                <Input
                  label="Dirección de Wallet"
                  type="text"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder="0x..."
                  helperText="Dirección Ethereum de la wallet a verificar"
                />
              </>
            )}

            {method === 'integrity' && (
              <Input
                label="ID del Documento"
                type="text"
                value={fileId}
                onChange={(e) => setFileId(e.target.value)}
                placeholder="UUID del documento"
                helperText="Identificador del documento en la base de datos"
              />
            )}

            <Button
              variant="primary"
              onClick={handleVerify}
              isLoading={isLoading}
              disabled={
                (method === 'file' && !file) ||
                (method === 'ipfs' && !ipfsHash.trim()) ||
                (method === 'blockchain' && !blockchainId.trim()) ||
                (method === 'ownership' && (!ownershipBlockchainId.trim() || !walletAddress.trim())) ||
                (method === 'integrity' && !fileId.trim())
              }
            >
              <Search className="w-4 h-4 mr-2" />
              {isLoading ? 'Verificando...' : 'Verificar Documento'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Verification Results */}
      {result && (
        <div className="space-y-6">
          {/* Status */}
          <Card>
            <CardContent className="text-center py-8">
              {result.exists ? (
                <>
                  <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <h2 className="mb-2 text-2xl font-bold text-foreground">
                    Documento Verificado ✓
                  </h2>
                  <p className="text-muted-foreground">
                    Este documento existe en la blockchain y es auténtico
                  </p>
                </>
              ) : (
                <>
                  <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
                  <h2 className="mb-2 text-2xl font-bold text-foreground">
                    Documento No Encontrado
                  </h2>
                  <p className="text-muted-foreground">
                    Este documento no existe en los registros de la blockchain
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {result.exists && result.document && (
            <>
              {/* Document Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Información del Documento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Nombre</p>
                      <p className="font-semibold">{result.document.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Propietario</p>
                      <p className="font-semibold flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {result.document.ownerUsername}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Tamaño</p>
                      <p className="font-semibold flex items-center gap-2">
                        <HardDrive className="w-4 h-4" />
                        {formatBytes(result.document.fileSize)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Subido</p>
                      <p className="font-semibold flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {formatRelativeTime(result.document.uploadedAt)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Versión Actual</p>
                      <p className="font-semibold">Versión {result.document.currentVersion}</p>
                    </div>
                  </div>
                  {result.document.ipfsHash && (
                    <div>
                      <p className="mb-1 text-sm text-muted-foreground">Hash IPFS</p>
                      <p className="break-all rounded-lg border border-border bg-secondary/35 p-2 font-mono text-sm text-foreground">
                        {result.document.ipfsHash}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Versions */}
              {result.versions && result.versions.length > 0 && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <GitBranch className="w-5 h-5" />
                        Historial de Versiones ({result.versions.length})
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {result.versions.map((version) => (
                        <div
                          key={version.versionNumber}
                          className={`flex items-center justify-between rounded-lg border p-3 ${
                            result.matchedVersion === version.versionNumber
                              ? 'border-green-400 bg-green-50'
                              : 'border-border bg-secondary/35'
                          }`}
                        >
                          <div>
                            <p className="font-semibold">
                              Versión {version.versionNumber}
                              {result.matchedVersion === version.versionNumber && (
                                <Badge variant="success" className="ml-2 text-xs">Verificada</Badge>
                              )}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {version.createdBy && `Creado por ${version.createdBy} • `}
                              {formatRelativeTime(version.createdAt)}
                            </p>
                            {version.comment && (
                              <p className="mt-1 text-sm italic text-muted-foreground">
                                "{version.comment}"
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Shares */}
              {result.shares && result.shares.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Share2 className="w-5 h-5" />
                      Compartido Con ({result.shares.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {result.shares.map((share, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between rounded-lg border border-border bg-secondary/35 p-3"
                        >
                          <div>
                            <p className="font-semibold">{share.sharedWithUsername}</p>
                            <p className="text-sm text-muted-foreground">
                              Compartido {share.sharedAt ? formatRelativeTime(share.sharedAt) : 'Fecha desconocida'}
                            </p>
                          </div>
                          <Badge variant="default">{share.role}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Signatures */}
              {result.signatures && result.signatures.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileSignature className="w-5 h-5" />
                      Firmas Digitales ({result.signatures.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {result.signatures.map((sig, idx) => (
                        <div key={idx} className="rounded-lg border border-border bg-secondary/35 p-3">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-semibold">{sig.signedByUsername}</p>
                            <Badge variant="success">Versión {sig.versionNumber}</Badge>
                          </div>
                          <p className="mb-1 text-sm text-muted-foreground">
                            Firmado {formatRelativeTime(sig.signedAt)}
                          </p>
                          <p className="break-all font-mono text-xs text-muted-foreground">
                            {sig.walletAddress}
                          </p>
                          {sig.comment && (
                            <p className="mt-2 text-sm italic text-muted-foreground">
                              "{sig.comment}"
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Blockchain Data */}
              {result.blockchain && (
                <Card>
                  <CardHeader>
                    <CardTitle>Información Blockchain</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="mb-1 text-sm text-muted-foreground">ID del Documento</p>
                      <p className="break-all rounded-lg border border-border bg-secondary/35 p-2 font-mono text-sm text-foreground">
                        {result.blockchain.documentId}
                      </p>
                    </div>
                    <div>
                      <p className="mb-1 text-sm text-muted-foreground">Dirección del Propietario</p>
                      <p className="break-all rounded-lg border border-border bg-secondary/35 p-2 font-mono text-sm text-foreground">
                        {result.blockchain.owner}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Número de Bloque</p>
                        <p className="font-semibold">#{result.blockchain.blockNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Estado</p>
                        <Badge
                          variant={result.blockchain.isDeleted ? 'destructive' : 'success'}
                        >
                          {result.blockchain.isDeleted ? 'Eliminado' : 'Activo'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      )}

      {/* Ownership Verification Results */}
      {ownershipResult && (
        <div className="space-y-6">
          <Card>
            <CardContent className="text-center py-8">
              {ownershipResult.isOwner ? (
                <>
                  <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <h2 className="mb-2 text-2xl font-bold text-foreground">Propietario Verificado ✓</h2>
                  <p className="text-muted-foreground">La dirección {ownershipResult.walletAddress} es propietaria del documento</p>
                </>
              ) : (
                <>
                  <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
                  <h2 className="mb-2 text-2xl font-bold text-foreground">No es Propietario</h2>
                  <p className="text-muted-foreground">La dirección {ownershipResult.walletAddress} NO es propietaria del documento {ownershipResult.blockchainId}</p>
                </>
              )}
            </CardContent>
          </Card>
          {ownershipResult.isOwner && (
            <Card>
              <CardHeader><CardTitle>Información del Documento</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">ID Blockchain</p>
                  <p className="break-all rounded-lg border border-border bg-secondary/35 p-2 font-mono text-sm">{ownershipResult.blockchainId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Propietario</p>
                  <p className="break-all rounded-lg border border-border bg-secondary/35 p-2 font-mono text-sm">{ownershipResult.documentInfo.owner}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Hash del Archivo</p>
                  <p className="break-all rounded-lg border border-border bg-secondary/35 p-2 font-mono text-sm">{ownershipResult.documentInfo.fileHash}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Creado</p>
                  <p className="font-semibold">{formatRelativeTime(ownershipResult.documentInfo.createdAt)}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Integrity Verification Results */}
      {integrityResult && (
        <div className="space-y-6">
          <Card>
            <CardContent className="text-center py-8">
              {integrityResult.valid ? (
                <>
                  <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <h2 className="mb-2 text-2xl font-bold text-foreground">Integridad Verificada ✓</h2>
                  <p className="text-muted-foreground">Los datos en base de datos coinciden con los registros blockchain</p>
                </>
              ) : (
                <>
                  <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
                  <h2 className="mb-2 text-2xl font-bold text-foreground">Fallo de Integridad</h2>
                  <p className="text-muted-foreground">Existen discrepancias entre la base de datos y la blockchain</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Comparación de Datos</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-border bg-secondary/35 p-3">
                  <p className="font-semibold mb-2">Base de Datos</p>
                  {integrityResult.databaseData.exists ? (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Nombre: <span className="text-foreground">{integrityResult.databaseData.name || '-'}</span></p>
                      <p className="text-sm text-muted-foreground">Content Hash: <span className="break-all font-mono text-xs">{integrityResult.databaseData.contentHash || '-'}</span></p>
                    </div>
                  ) : (
                    <p className="text-sm text-red-600">No existe en la base de datos</p>
                  )}
                </div>
                <div className="rounded-lg border border-border bg-secondary/35 p-3">
                  <p className="font-semibold mb-2">Blockchain</p>
                  {integrityResult.blockchainData.exists ? (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Propietario: <span className="break-all font-mono text-xs">{integrityResult.blockchainData.owner}</span></p>
                      <p className="text-sm text-muted-foreground">File Hash: <span className="break-all font-mono text-xs">{integrityResult.blockchainData.fileHash}</span></p>
                    </div>
                  ) : (
                    <p className="text-sm text-red-600">No existe en blockchain</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {integrityResult.match.contentHash ? <CheckCircle className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-red-600" />}
                  <span className="text-sm">Content Hash: {integrityResult.match.contentHash ? 'Coincide' : 'No coincide'}</span>
                </div>
                <div className="flex items-center gap-2">
                  {integrityResult.match.owner ? <CheckCircle className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-red-600" />}
                  <span className="text-sm">Propietario: {integrityResult.match.owner ? 'Coincide' : 'No coincide'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );

  if (location.pathname.startsWith('/app')) {
    return content;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="pt-2 sm:pt-4">
          {content}
        </div>
      </main>
    </div>
  );
};
