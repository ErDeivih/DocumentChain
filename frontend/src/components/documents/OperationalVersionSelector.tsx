/**
 * Componente selector de versión operacional.
 * Permite al propietario cambiar la versión activa de un documento
 * y visualizar los firmantes de cada versión.
 */

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Skeleton } from '../ui/Skeleton';
import { VersionCard } from './VersionCard';
import { SignaturesViewer } from './SignaturesViewer';
import { getErrorMessage } from '../../lib/api';
import { signaturesApi } from '../../api/signatures';
import { versionService } from '../../services/blockchain/VersionService';
import { WalletSelectorModal } from '../wallets/WalletSelectorModal';
import type { Signature, Version } from '../../types';
import type { SavedWallet } from '../../contexts/WalletManagerContext';
import { useSigner } from '../../hooks/useSigner';
import {
  GitBranch,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

/**
 * Versión extendida con información de restauración.
 */
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
    operationalVersionNumber?: number | null;
    onVersionChange?: (versionNumber: number) => void;
    onDownloadVersion?: (versionId: string) => void;
}

/**
 * Selector de versión operacional de un documento.
 * Permite cambiar la versión activa y visualizar firmantes asociados a cada versión.
 */
export const OperationalVersionSelector: React.FC<OperationalVersionSelectorProps> = ({
  documentId,
  isOwner,
  isArchived = false,
  versions: providedVersions,
  isPublic = false,
  publicId = null,
  isLoading = false,
  operationalVersionNumber: propOperationalVersionNumber = null,
  onVersionChange,
  onDownloadVersion
}) => {
  const [versions, setVersions] = useState<OperationalVersion[]>(providedVersions);
  const [operationalVersionNumber, setOperationalVersionNumber] = useState<number | null>(
    () => propOperationalVersionNumber ?? null
  );
  const [changing, setChanging] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [signaturesByVersion, setSignaturesByVersion] = useState<Record<number, Signature[]>>({});
  const [selectedVersionNumber, setSelectedVersionNumber] = useState<number | null>(null);
  const [loadingSignaturesForVersion, setLoadingSignaturesForVersion] = useState<number | null>(null);
  const [signaturesError, setSignaturesError] = useState<string | null>(null);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [pendingVersionNumber, setPendingVersionNumber] = useState<number | null>(null);
  const [pendingAction, setPendingAction] = useState<'operational' | 'restore' | null>(null);
  const { getRegistryContract } = useSigner();

  useEffect(() => {
    setVersions(providedVersions);
    const opVersion = propOperationalVersionNumber;
    if (opVersion != null) {
      setOperationalVersionNumber(opVersion);
    }
  }, [providedVersions]);

  const handleStartSetOperational = (versionNumber: number) => {
    setPendingVersionNumber(versionNumber);
    setPendingAction('operational');
    setShowWalletModal(true);
  };

  const handleStartRestore = (versionNumber: number) => {
    setPendingVersionNumber(versionNumber);
    setPendingAction('restore');
    setShowWalletModal(true);
  };

  const handleWalletSelected = async (wallet: SavedWallet | null, connectedAddress: string) => {
    setShowWalletModal(false);
    if (!wallet || !pendingVersionNumber) return;

    setChanging(pendingVersionNumber);
    setError(null);
    setSuccess(null);

    try {
      const registry = await getRegistryContract(connectedAddress);
      if (pendingAction === 'restore') {
        await versionService.restoreVersion({
          registryContract: registry,
          documentId,
          versionNumber: pendingVersionNumber,
        });
        setSuccess(`Transacción enviada. Se ha creado una nueva versión restaurando la v${pendingVersionNumber}.`);
        onVersionChange?.(pendingVersionNumber);
      } else {
        await versionService.setOperational({
          registryContract: registry,
          documentId,
          versionNumber: pendingVersionNumber,
        });
        setOperationalVersionNumber(pendingVersionNumber);
        setSuccess(`Transacción enviada. La versión ${pendingVersionNumber} se sincronizará con la blockchain en breve.`);
        onVersionChange?.(pendingVersionNumber);
      }
    } catch (err: any) {
      if (process.env.NODE_ENV === "development") { console.error('Error al cambiar versión operacional:', err); }
      setError(getErrorMessage(err));
    } finally {
      setChanging(null);
      setPendingVersionNumber(null);
      setPendingAction(null);
    }
  };

  const buildVersionUrl = (versionNumber: number) => {
    if (!publicId) {
      return '';
    }

    return `${window.location.origin}/public/d/${publicId}/v/${versionNumber}`;
  };

  const closeSignaturesModal = () => {
    setSelectedVersionNumber(null);
    setSignaturesError(null);
    setLoadingSignaturesForVersion(null);
  };

  const openSignaturesModal = async (versionNumber: number) => {
    try {
      setSelectedVersionNumber(versionNumber);
      setSignaturesError(null);
      setLoadingSignaturesForVersion(versionNumber);

      const { signatures } = await signaturesApi.listByVersion(documentId, versionNumber);

      setSignaturesByVersion((prev) => ({
        ...prev,
        [versionNumber]: signatures,
      }));
    } catch (err: any) {
      if (process.env.NODE_ENV === "development") { console.error('Error al cargar firmantes de la versión:', err); }
      setSignaturesError(getErrorMessage(err));
    } finally {
      setLoadingSignaturesForVersion(null);
    }
  };

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
            <VersionCard
              key={version.versionNumber}
              version={version}
              isOwner={isOwner}
              isArchived={isArchived}
              isPublic={isPublic}
              publicId={publicId || null}
              changing={changing}
              operationalVersionNumber={operationalVersionNumber ?? undefined}
              buildVersionUrl={buildVersionUrl}
              onViewSignatures={openSignaturesModal}
              onActivate={handleStartSetOperational}
              onRestore={isOwner && !isArchived ? handleStartRestore : undefined}
              onDownloadVersion={onDownloadVersion}
            />
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

      <SignaturesViewer
        isOpen={selectedVersionNumber !== null}
        onClose={closeSignaturesModal}
        versionNumber={selectedVersionNumber}
        signatures={selectedVersionNumber ? signaturesByVersion[selectedVersionNumber] || [] : []}
        isLoading={loadingSignaturesForVersion !== null}
        error={signaturesError}
      />

      <WalletSelectorModal
        isOpen={showWalletModal}
        onClose={() => {
          setShowWalletModal(false);
          setPendingVersionNumber(null);
          setPendingAction(null);
        }}
        onSelect={handleWalletSelected}
        title={pendingAction === 'restore' ? 'Firmar restauración de versión' : 'Firmar cambio de versión operacional'}
        description={pendingAction === 'restore'
          ? `Vas a restaurar la versión ${pendingVersionNumber} como nueva versión operativa.`
          : 'Selecciona la wallet con la que firmarás la transacción en la blockchain para cambiar la versión operacional.'}
      />
    </Card>
  );
};

export default OperationalVersionSelector;