import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Header } from '../components/layout/Header';
import AlertMessage from '../components/ui/AlertMessage';
import { Badge } from '../components/ui/Badge';
import { verifyByFile, verifyByIPFS, verifyByBlockchain } from '../api/verification';
import { VerificationResult } from '../types';
import { formatBytes, formatRelativeTime } from '../lib/utils';
import {
  Upload,
  Search,
  FileCheck,
  User,
  Calendar,
  HardDrive,
  Hash,
  GitBranch,
  Share2,
  FileSignature,
  CheckCircle,
  XCircle,
} from 'lucide-react';

/**
 * Métodos de verificación de documento disponibles en la página pública.
 */
type VerificationMethod = 'file' | 'ipfs' | 'blockchain';

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
  const [result, setResult] = useState<VerificationResult | null>(null);
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

    try {
      let verificationResult: VerificationResult;

      switch (method) {
        case 'file':
          if (!file) {
            setError('Por favor seleccione un archivo para verificar');
            setIsLoading(false);
            return;
          }
          verificationResult = await verifyByFile(file);
          break;

        case 'ipfs':
          if (!ipfsHash.trim()) {
            setError('Por favor introduzca un hash IPFS');
            setIsLoading(false);
            return;
          }
          verificationResult = await verifyByIPFS(ipfsHash.trim());
          break;

        case 'blockchain':
          if (!blockchainId.trim()) {
            setError('Por favor introduzca un ID de blockchain');
            setIsLoading(false);
            return;
          }
          verificationResult = await verifyByBlockchain(blockchainId.trim());
          break;
      }

      setResult(verificationResult);
    } catch (err: any) {
      setError(err.message || 'Verificación fallida');
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setMethod('file')}
              className={`p-4 border-2 rounded-lg transition-colors ${
                method === 'file'
                  ? 'border-primary bg-primary/10 shadow-sm'
                  : 'border-border bg-white hover:border-primary/40 hover:bg-primary/5'
              }`}
            >
              <Upload className="mx-auto mb-2 h-8 w-8 text-primary" />
              <h3 className="font-semibold text-foreground">Subir Archivo</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Verificar subiendo el archivo original
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
              <Hash className="mx-auto mb-2 h-8 w-8 text-primary" />
              <h3 className="font-semibold text-foreground">Hash IPFS</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Verificar usando el hash de contenido IPFS
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
              <FileCheck className="mx-auto mb-2 h-8 w-8 text-primary" />
              <h3 className="font-semibold text-foreground">ID Blockchain</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Verificar usando el ID de documento blockchain
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

            <Button
              variant="primary"
              onClick={handleVerify}
              isLoading={isLoading}
              disabled={
                (method === 'file' && !file) ||
                (method === 'ipfs' && !ipfsHash.trim()) ||
                (method === 'blockchain' && !blockchainId.trim())
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
                    Document Verified ✓
                  </h2>
                  <p className="text-muted-foreground">
                    This document exists in the blockchain and is authentic
                  </p>
                </>
              ) : (
                <>
                  <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
                  <h2 className="mb-2 text-2xl font-bold text-foreground">
                    Document Not Found
                  </h2>
                  <p className="text-muted-foreground">
                    This document does not exist in the blockchain records
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
                              Compartido {formatRelativeTime(share.sharedAt)}
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
                      <p className="mb-1 text-sm text-muted-foreground">Hash de Metadatos</p>
                      <p className="break-all rounded-lg border border-border bg-secondary/35 p-2 font-mono text-sm text-foreground">
                        {result.blockchain.metadataHash}
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
