/**
 * Componente Selector de Versión Operacional
 * Permite al propietario cambiar la versión activa de un documento
 */

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Skeleton } from '../ui/Skeleton';
import { Modal } from '../ui/Modal';
import { api, getErrorMessage } from '../../lib/api';
import { signaturesApi } from '../../api/signatures';
import { PublicLinkActions } from '../public/PublicLinkActions';
import type { Signature, Version } from '../../types';
import {
  GitBranch,
  CheckCircle,
  Loader2,
  AlertCircle,
  ArrowRight,
  FileSignature,
  ShieldCheck,
  Wallet
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/Avatar';

type OperationalVersion = Version & {
  restoredFrom?: number | null;
};

interface OperationalVersionSelectorProps {
  documentId: string;
  isOwner: boolean;
  isArchived?: boolean;
  versions: Version[];
  isPublic?: boolean;
  publicId?: string | null;
  isLoading?: boolean;
  onVersionChange?: (versionNumber: number) => void;
}

export const OperationalVersionSelector: React.FC<OperationalVersionSelectorProps> = ({
  documentId,
  isOwner,
  isArchived = false,
  versions: providedVersions,
  isPublic = false,
  publicId = null,
  isLoading = false,
  onVersionChange
}) => {
  const [versions, setVersions] = useState<OperationalVersion[]>(providedVersions);
  const [changing, setChanging] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [signaturesByVersion, setSignaturesByVersion] = useState<Record<number, Signature[]>>({});
  const [selectedVersionNumber, setSelectedVersionNumber] = useState<number | null>(null);
  const [selectedSignatureId, setSelectedSignatureId] = useState<string | null>(null);
  const [loadingSignaturesForVersion, setLoadingSignaturesForVersion] = useState<number | null>(null);
  const [signaturesError, setSignaturesError] = useState<string | null>(null);

  useEffect(() => {
    setVersions(providedVersions);
  }, [providedVersions]);

  const setOperationalVersion = async (versionNumber: number) => {
    try {
      setChanging(versionNumber);
      setError(null);
      setSuccess(null);

      await api.put(`/documents/${documentId}/operational-version`, {
        versionNumber
      });

      // Actualizar estado local
      setVersions(prev => prev.map(v => ({
        ...v,
        isOperational: v.versionNumber === versionNumber
      })));

      setSuccess(`Versión ${versionNumber} establecida como operacional`);
      onVersionChange?.(versionNumber);
    } catch (err: any) {
      console.error('Error al cambiar versión operacional:', err);
      setError(getErrorMessage(err));
    } finally {
      setChanging(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const truncateCid = (cid: string) => {
    if (cid.length <= 16) return cid;
    return `${cid.slice(0, 8)}...${cid.slice(-8)}`;
  };

  const buildVersionUrl = (versionNumber: number) => {
    if (!publicId) {
      return '';
    }

    return `${window.location.origin}/public/d/${publicId}/v/${versionNumber}`;
  };

  const getSignerDisplayName = (signature: Signature) => {
    return signature.signer?.fullName || signature.signer?.username || signature.user?.fullName || signature.user?.username || 'Firmante registrado';
  };

  const getSignerUsername = (signature: Signature) => {
    return signature.signer?.username || signature.user?.username || null;
  };

  const getSignerWalletAddress = (signature: Signature) => {
    return signature.signer?.walletAddress || signature.walletAddress || 'Wallet no disponible';
  };

  const getStatusLabel = (status: Signature['blockchainStatus']) => {
    switch (status) {
      case 'SYNCED':
        return 'Registrada';
      case 'TX_SUBMITTED':
        return 'Pendiente de sincronización';
      case 'PREPARING':
        return 'Preparando';
      case 'FAILED':
        return 'Fallida';
      default:
        return status;
    }
  };

  const getStatusVariant = (status: Signature['blockchainStatus']): 'success' | 'warning' | 'destructive' => {
    switch (status) {
      case 'SYNCED':
        return 'success';
      case 'FAILED':
        return 'destructive';
      default:
        return 'warning';
    }
  };

  const truncateWalletAddress = (walletAddress: string) => {
    if (walletAddress.length <= 18) {
      return walletAddress;
    }

    return `${walletAddress.slice(0, 10)}...${walletAddress.slice(-6)}`;
  };

  const closeSignaturesModal = () => {
    setSelectedVersionNumber(null);
    setSelectedSignatureId(null);
    setSignaturesError(null);
    setLoadingSignaturesForVersion(null);
  };

  const openSignaturesModal = async (versionNumber: number) => {
    try {
      setSelectedVersionNumber(versionNumber);
      setSelectedSignatureId(null);
      setSignaturesError(null);
      setLoadingSignaturesForVersion(versionNumber);

      const { signatures } = await signaturesApi.listByVersion(documentId, versionNumber);

      setSignaturesByVersion((prev) => ({
        ...prev,
        [versionNumber]: signatures,
      }));
      setSelectedSignatureId(signatures[0]?.id ?? null);
    } catch (err: any) {
      console.error('Error al cargar firmantes de la versión:', err);
      setSignaturesError(getErrorMessage(err));
    } finally {
      setLoadingSignaturesForVersion(null);
    }
  };

  const selectedVersionSignatures = selectedVersionNumber ? signaturesByVersion[selectedVersionNumber] || [] : [];
  const selectedSignature = selectedVersionSignatures.find((signature) => signature.id === selectedSignatureId) || selectedVersionSignatures[0] || null;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Versiones del Documento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
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
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (versions.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            No hay versiones disponibles
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="h-5 w-5" />
          Versiones del Documento
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Mensajes de estado */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">{success}</span>
          </div>
        )}

        {/* Lista de versiones */}
        <div className="space-y-3">
          {versions.map((version) => (
            <div
              key={version.versionNumber}
              className={`p-4 rounded-lg border transition-colors ${
                version.isOperational
                  ? 'bg-green-50 border-green-200'
                  : 'bg-card/90 border-white/10 hover:border-primary/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Indicador de versión activa */}
                  {version.isOperational ? (
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-green-100">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-secondary/70">
                      <span className="text-sm font-medium text-muted-foreground">
                        v{version.versionNumber}
                      </span>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        Versión {version.versionNumber}
                      </span>
                      {version.isOperational && (
                        <Badge variant="success" className="text-xs">
                          Activa
                        </Badge>
                      )}
                      {version.restoredFrom ? (
                        <Badge variant="outline" className="text-xs">
                          Restaurada de v{version.restoredFrom}
                        </Badge>
                      ) : null}
                    </div>
                    
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatDate(version.createdAt)}</span>
                      <span>·</span>
                      <span className="font-mono">{truncateCid(version.ipfsCid || 'CID pendiente')}</span>
                    </div>
                    
                    {version.comment && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {version.comment}
                      </p>
                    )}

                    {isPublic && publicId ? (
                      <div className="mt-3">
                        <PublicLinkActions
                          url={buildVersionUrl(version.versionNumber)}
                          title={`versión-${version.versionNumber}`}
                          size="sm"
                        />
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Botón para cambiar versión */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openSignaturesModal(version.versionNumber)}
                    data-testid={`view-signers-v${version.versionNumber}`}
                  >
                    <FileSignature className="h-4 w-4 mr-1" />
                    Ver firmantes
                  </Button>

                  {isOwner && !version.isOperational && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setOperationalVersion(version.versionNumber)}
                      disabled={changing !== null || isArchived}
                      title={isArchived ? 'No se puede cambiar la versión operacional de un documento archivado' : undefined}
                    >
                      {changing === version.versionNumber ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <ArrowRight className="h-4 w-4 mr-1" />
                          Activar
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Información adicional */}
        {isArchived && (
          <p className="mt-4 text-center text-xs text-amber-600">
            Documento archivado: no se pueden cambiar las versiones operacionales
          </p>
        )}
        {!isOwner && (
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Solo el propietario puede cambiar la versión operacional
          </p>
        )}
      </CardContent>

      <Modal
        isOpen={selectedVersionNumber !== null}
        onClose={closeSignaturesModal}
        title={selectedVersionNumber !== null ? `Firmantes de la versión ${selectedVersionNumber}` : 'Firmantes'}
        size="xl"
        footer={
          <Button variant="outline" onClick={closeSignaturesModal}>
            Cerrar
          </Button>
        }
      >
        {loadingSignaturesForVersion !== null ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Cargando firmantes...
          </div>
        ) : signaturesError ? (
          <div className="rounded-lg border border-error-700/35 bg-error-900/20 p-4 text-sm text-error-100">
            {signaturesError}
          </div>
        ) : selectedVersionSignatures.length === 0 ? (
          <div className="rounded-lg border border-dashed border-white/10 bg-secondary/35 p-6 text-center text-sm text-muted-foreground">
            Esta versión todavía no tiene firmas registradas.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-[minmax(0,280px)_1fr]">
            <div className="space-y-3">
              {selectedVersionSignatures.map((signature) => {
                const walletAddress = getSignerWalletAddress(signature);
                const signerName = getSignerDisplayName(signature);
                const signerUsername = getSignerUsername(signature);

                return (
                  <button
                    key={signature.id}
                    type="button"
                    onClick={() => setSelectedSignatureId(signature.id)}
                    className={`w-full rounded-lg border p-3 text-left transition-colors ${
                      selectedSignature?.id === signature.id
                        ? 'border-primary/40 bg-primary/10'
                        : 'border-white/10 bg-card/90 hover:border-primary/25'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          {signature.signer?.avatarUrl ? (
                            <AvatarImage src={signature.signer.avatarUrl} alt={signerName} />
                          ) : null}
                          <AvatarFallback className="bg-[linear-gradient(135deg,#2dd4bf_0%,#0ea5e9_100%)] text-[10px] text-slate-950">
                            {signerName.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">{signerName}</p>
                          {signerUsername ? (
                            <p className="mt-0.5 text-xs text-muted-foreground">@{signerUsername}</p>
                          ) : null}
                        </div>
                      </div>
                      <Badge variant={getStatusVariant(signature.blockchainStatus)} className="shrink-0">
                        {getStatusLabel(signature.blockchainStatus)}
                      </Badge>
                    </div>
                    <p className="mt-3 font-mono text-xs text-muted-foreground">{truncateWalletAddress(walletAddress)}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {signature.signedAt ? formatDate(signature.signedAt) : 'Fecha pendiente'}
                    </p>
                  </button>
                );
              })}
            </div>

            {selectedSignature ? (
              <div className="rounded-xl border border-white/10 bg-secondary/35 p-5" data-testid="signer-profile-panel">
                <div className="flex flex-wrap items-center gap-3">
                  <Avatar className="h-10 w-10">
                    {selectedSignature.signer?.avatarUrl ? (
                      <AvatarImage src={selectedSignature.signer.avatarUrl} alt={getSignerDisplayName(selectedSignature)} />
                    ) : null}
                    <AvatarFallback className="bg-[linear-gradient(135deg,#2dd4bf_0%,#0ea5e9_100%)] text-sm text-slate-950">
                      {getSignerDisplayName(selectedSignature).slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-lg font-semibold text-foreground">Perfil del firmante</h3>
                  <Badge variant={getStatusVariant(selectedSignature.blockchainStatus)}>
                    {getStatusLabel(selectedSignature.blockchainStatus)}
                  </Badge>
                  {selectedSignature.signer?.source === 'snapshot' ? (
                    <Badge variant="outline">Histórico</Badge>
                  ) : (
                    <Badge variant="info">Cuenta actual</Badge>
                  )}
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border border-white/10 bg-card/90 p-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <ShieldCheck className="h-4 w-4" />
                      Identidad mostrada
                    </div>
                    <p className="mt-3 text-base font-semibold text-foreground">{getSignerDisplayName(selectedSignature)}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {getSignerUsername(selectedSignature) ? `@${getSignerUsername(selectedSignature)}` : 'Sin alias disponible'}
                    </p>
                  </div>

                  <div className="rounded-lg border border-white/10 bg-card/90 p-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Wallet className="h-4 w-4" />
                      Wallet empleada en la firma
                    </div>
                    <p className="mt-3 break-all font-mono text-sm text-foreground">{getSignerWalletAddress(selectedSignature)}</p>
                  </div>

                  <div className="rounded-lg border border-white/10 bg-card/90 p-4">
                    <p className="text-sm font-medium text-foreground">Fecha de registro</p>
                    <p className="mt-3 text-sm text-foreground">
                      {selectedSignature.signedAt
                        ? new Date(selectedSignature.signedAt).toLocaleString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Pendiente de confirmación'}
                    </p>
                  </div>

                  <div className="rounded-lg border border-white/10 bg-card/90 p-4">
                    <p className="text-sm font-medium text-foreground">Versión firmada</p>
                    <p className="mt-3 text-sm text-foreground">Versión {selectedSignature.versionNumber ?? selectedVersionNumber}</p>
                    {selectedSignature.blockchainTxHash ? (
                      <p className="mt-2 break-all font-mono text-xs text-muted-foreground">TX: {selectedSignature.blockchainTxHash}</p>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </Modal>
    </Card>
  );
};

export default OperationalVersionSelector;