import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { publicDocumentsApi } from '../api/publicDocuments';
import { auditApi } from '../api/audit';
import { useAuth } from '../contexts/AuthContext';
import { PublicDocumentPreview } from '../components/public/PublicDocumentPreview';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Loading } from '../components/ui/Loading';
import AlertMessage from '../components/ui/AlertMessage';
import { formatBytes, formatDate } from '../lib/utils';
import {
  Download,
  ExternalLink,
  FileSignature,
  GitBranch,
  History,
  Lock,
  User,
} from 'lucide-react';

export const PublicDocument: React.FC = () => {
  const navigate = useNavigate();
  const { publicId, versionNumber } = useParams<{ publicId: string; versionNumber?: string }>();
  const { user } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ['public-document', publicId],
    queryFn: () => publicDocumentsApi.get(publicId!),
    enabled: Boolean(publicId),
  });

  const document = data?.document;
  const selectedVersionNumber = versionNumber ? Number(versionNumber) : undefined;
  const selectedVersion = document?.versions.find((version) => version.versionNumber === selectedVersionNumber)
    || document?.versions.find((version) => version.isOperational)
    || document?.versions[0];

  const { data: auditTrail } = useQuery({
    queryKey: ['public-document-audit', document?.blockchainId],
    queryFn: () => auditApi.getAuditTrail(document!.blockchainId!),
    enabled: Boolean(document?.blockchainId),
  });

  if (isLoading) {
    return <Loading size="lg" text="Cargando documento público..." />;
  }

  if (error || !document || !selectedVersion) {
    return <AlertMessage type="error" message="No se pudo cargar el documento público solicitado." />;
  }

  const contentUrl = publicDocumentsApi.getContentUrl(document.publicId, selectedVersion.versionNumber);
  const downloadUrl = publicDocumentsApi.getDownloadUrl(document.publicId, selectedVersion.versionNumber);

  const openInApp = () => {
    navigate(`/app/documents/${document.id}`);
  };

  const loginForAdvancedActions = () => {
    navigate('/login', {
      state: {
        from: {
          pathname: `/app/documents/${document.id}`,
        },
      },
    });
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{document.name}</h1>
          <p className="mt-2 text-gray-600">
            Documento público publicado sin cifrado. Cualquier persona con este enlace puede visualizarlo o descargarlo.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <a href={downloadUrl}>
            <Button variant="primary">
              <Download className="mr-2 h-4 w-4" />
              Descargar
            </Button>
          </a>

          {user ? (
            <Button variant="outline" onClick={openInApp}>
              <FileSignature className="mr-2 h-4 w-4" />
              Abrir en la aplicación
            </Button>
          ) : (
            <Button variant="outline" onClick={loginForAdvancedActions}>
              <Lock className="mr-2 h-4 w-4" />
              Iniciar sesión para firmar
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-6">
          <PublicDocumentPreview contentUrl={contentUrl} mimeType={document.mimeType} fileName={document.name} />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Historial público
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(auditTrail?.events || []).map((event) => (
                  <div key={event.id} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-gray-900">{event.eventType}</p>
                      <span className="text-xs text-gray-500">{formatDate(event.timestamp)}</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">Actor: {event.actor || 'Sistema'}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500">Propietario</p>
                <p className="font-medium">{document.owner.fullName || document.owner.username}</p>
              </div>
              <div>
                <p className="text-gray-500">Tipo</p>
                <p className="font-medium">{document.mimeType}</p>
              </div>
              <div>
                <p className="text-gray-500">Tamaño</p>
                <p className="font-medium">{formatBytes(document.size)}</p>
              </div>
              <div>
                <p className="text-gray-500">Publicado el</p>
                <p className="font-medium">{formatDate(document.createdAt)}</p>
              </div>
              {document.blockchainId ? (
                <div>
                  <p className="text-gray-500">Blockchain ID</p>
                  <p className="break-all font-mono text-xs">{document.blockchainId}</p>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                Versiones públicas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {document.versions.map((version) => (
                  <button
                    key={version.id}
                    className={`w-full rounded-lg border p-3 text-left transition-colors ${
                      version.versionNumber === selectedVersion.versionNumber
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => navigate(`/public/d/${document.publicId}/v/${version.versionNumber}`)}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium">Versión {version.versionNumber}</p>
                        <p className="text-xs text-gray-500">{formatDate(version.createdAt)}</p>
                      </div>
                      {version.isOperational ? <Badge variant="success">Activa</Badge> : null}
                    </div>
                    {version.comment ? <p className="mt-2 text-sm text-gray-600">{version.comment}</p> : null}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Firmas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {document.signatures.length === 0 ? (
                  <p className="text-sm text-gray-600">Todavía no hay firmas registradas para este documento.</p>
                ) : (
                  document.signatures.map((signature) => (
                    <div key={signature.id} className="rounded-lg border p-3">
                      <p className="font-medium text-gray-900">
                        {signature.signer?.fullName || signature.signer?.username || 'Firmante registrado'}
                      </p>
                      <p className="text-xs text-gray-500">Versión {signature.versionNumber} · {formatDate(signature.signedAt)}</p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5" />
                Acciones avanzadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-gray-600">
                Si dispone de una cuenta en DocumentChain, puede abrir este documento dentro de la aplicación para firmarlo o continuar desde el entorno autenticado.
              </p>
              {user ? (
                <Button variant="outline" onClick={openInApp}>
                  Abrir documento autenticado
                </Button>
              ) : (
                <Button variant="outline" onClick={loginForAdvancedActions}>
                  Iniciar sesión y continuar
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PublicDocument;