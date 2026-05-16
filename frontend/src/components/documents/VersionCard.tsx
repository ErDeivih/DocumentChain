import React from 'react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { PublicLinkActions } from '../public/PublicLinkActions';
import { CheckCircle, FileSignature, Download, ArrowRight, Loader2 } from 'lucide-react';
import { formatRelativeTime, truncateAddress } from '../../lib/utils';
import type { Version } from '../../types';

interface VersionCardProps {
  version: Version & { restoredFrom?: number | null };
  isOwner: boolean;
  isArchived: boolean;
  isPublic: boolean;
  publicId: string | null;
  changing: number | null;
  buildVersionUrl: (versionNumber: number) => string;
  onViewSignatures: (versionNumber: number) => void;
  onActivate: (versionNumber: number) => void;
  onDownloadVersion?: (versionId: string) => void;
}

export const VersionCard: React.FC<VersionCardProps> = ({
  version,
  isOwner,
  isArchived,
  isPublic,
  publicId,
  changing,
  buildVersionUrl,
  onViewSignatures,
  onActivate,
  onDownloadVersion,
}) => (
  <div
    className={`p-4 rounded-lg border transition-colors ${
      version.isOperational
        ? 'bg-green-50 border-green-200'
        : 'bg-card/90 border-white/10 hover:border-primary/30'
    }`}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {version.isOperational ? (
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-green-100">
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
        ) : (
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-secondary/70">
            <span className="text-sm font-medium text-muted-foreground">v{version.versionNumber}</span>
          </div>
        )}
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Versión {version.versionNumber}</span>
            {version.isOperational && <Badge variant="success" className="text-xs">Activa</Badge>}
            {version.restoredFrom ? <Badge variant="outline" className="text-xs">Restaurada de v{version.restoredFrom}</Badge> : null}
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <span>{formatRelativeTime(version.createdAt)}</span>
            <span>·</span>
            <span className="font-mono">{truncateAddress(version.ipfsCid || 'CID pendiente', 8, 8)}</span>
          </div>
          {version.comment && <p className="mt-1 text-xs text-muted-foreground"><span className="font-medium">Descripción:</span> {version.comment}</p>}
          {isPublic && publicId ? (
            <div className="mt-3"><PublicLinkActions url={buildVersionUrl(version.versionNumber)} title={`versión-${version.versionNumber}`} size="sm" /></div>
          ) : null}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => onViewSignatures(version.versionNumber)} data-testid={`view-signers-v${version.versionNumber}`}>
          <FileSignature className="h-4 w-4 mr-1" />Ver firmantes
        </Button>
        {onDownloadVersion && version.id && (
          <Button variant="outline" size="sm" onClick={() => onDownloadVersion(version.id)} data-testid={`download-v${version.versionNumber}`}>
            <Download className="h-4 w-4 mr-1" />Descargar
          </Button>
        )}
        {isOwner && !version.isOperational && (
          <Button variant="outline" size="sm" onClick={() => onActivate(version.versionNumber)} disabled={changing !== null || isArchived} title={isArchived ? 'No se puede cambiar la versión operacional de un documento archivado' : undefined}>
            {changing === version.versionNumber ? <Loader2 className="h-4 w-4 animate-spin" /> : <><ArrowRight className="h-4 w-4 mr-1" />Activar</>}
          </Button>
        )}
      </div>
    </div>
  </div>
);
