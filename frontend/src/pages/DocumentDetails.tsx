import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDocument, documentsApi } from '../api/documents';
import { listVersions } from '../api/versions';
import { getMyRole, listShares } from '../api/shares';
import { useAuth } from '../contexts/AuthContext';
import { downloadService } from '../services/blockchain/DownloadService';
import { archiveService } from '../services/blockchain/ArchiveService';
import { Button } from '../components/ui/Button';
import { UserAvatar } from '../components/ui/UserAvatar';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Loading } from '../components/ui/Loading';
import AlertMessage from '../components/ui/AlertMessage';
import { CopyableId } from '../components/ui/CopyableId';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/Dialog';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { ShareModal } from '../components/sharing/ShareModal';
import { ShareList } from '../components/sharing/ShareList';
import { DocumentTimeline } from '../components/documents/DocumentTimeline';
import { OperationalVersionSelector } from '../components/documents/OperationalVersionSelector';
import { UploadVersionModal } from '../components/versions/UploadVersionModal';
import { SignDocumentModal } from '../components/signatures/SignDocumentModal';
import { DocumentTransfer } from '../components/documents/DocumentTransfer';
import { PublicLinkActions } from '../components/public/PublicLinkActions';
import { DocumentTypeIcon, getDocumentTypeVisual } from '../components/documents/DocumentTypeIcon';
import { FolderSelector } from '../components/folders/FolderSelector';
import { downloadFile, formatBytes, formatDate, formatRelativeTime } from '../lib/utils';
import { DocumentRole, type Version } from '../types';
import {
  FileText,
  Download,
  Archive,
  Trash2,
  Share2,
  ArrowLeft,
  Clock,
  GitBranch,
  ArrowRightLeft,
  FileSignature,
  Pencil,
  Check,
  FolderInput,
} from 'lucide-react';
import { useSigner } from '../hooks/useSigner';
import { useActiveWallet } from '../contexts/ActiveWalletContext';

/**
 * Pestañas disponibles en la vista de detalle de un documento.
 */
type TabType = 'details' | 'timeline' | 'versions' | 'transfer';

/**
 * Página de detalle de un documento específico.
 *
 * Permite visualizar metadatos, gestionar versiones, compartir, firmar,
 * archivar, transferir propiedad y descargar el contenido del documento.
 *
 * @returns JSX.Element con la interfaz de detalle del documento.
 */
export const DocumentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentUserId = user?.id || null;
  const currentUsername = user?.username || null;
  const [downloadPassword, setDownloadPassword] = useState('');
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isUploadVersionModalOpen, setIsUploadVersionModalOpen] = useState(false);
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('details');
  const [error, setError] = useState<string | null>(null);
  const [downloadingVersionId, setDownloadingVersionId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editTags, setEditTags] = useState('');
  const [showMoveToFolder, setShowMoveToFolder] = useState(false);
  const [targetFolderId, setTargetFolderId] = useState<string | null>(null);

  const { data: documentData, isLoading, refetch } = useQuery({
    queryKey: ['document', currentUserId, id],
    queryFn: () => getDocument(id!),
    enabled: !!id,
  });

  const document = documentData?.document;
  const isOwner = Boolean(
    document?.role === 'OWNER'
    || (currentUserId && (document?.ownerId === currentUserId || document?.owner?.id === currentUserId))
    || (currentUsername && document?.owner?.username === currentUsername)
  );
  const isPublicDocument = document?.visibility === 'PUBLIC';

  const { data: roleData } = useQuery({
    queryKey: ['document-role', id],
    queryFn: () => getMyRole(id!),
    enabled: !!id && !!document && !isOwner,
  });

  const effectiveRole = document?.role || roleData?.role || null;
  const canCreateVersion = isOwner || effectiveRole === DocumentRole.SHARED_WRITE;

  const { data: versions, isLoading: isLoadingVersions } = useQuery({
    queryKey: ['versions', id],
    queryFn: () => listVersions(id!),
    enabled: !!id && !!document,
  });

  // Obtener número de versión operativa desde la API de documentos
  const versionsArray: any[] = versions?.versions || [];
  const operationalVersionNumber: number = document?.operationalVersionNumber ?? versionsArray.find((v: any) => v.isOperational)?.versionNumber ?? 1;
  const operationalVersion = versionsArray.find((v: any) => v.versionNumber === operationalVersionNumber);

  const { data: shares } = useQuery({
    queryKey: ['shares', id],
    queryFn: () => listShares(id!),
    enabled: !!id && !!document,
  });

  const downloadMutation = useMutation({
    mutationFn: async (versionId?: string | null) => {
      return downloadService.download({
        documentId: id!,
        versionId: versionId ?? null,
        password: downloadPassword,
        encryptedPrivateKey: user?.encryptedPrivateKey,
        keySalt: user?.keySalt,
        contentHash: document?.contentHash,
      });
    },
    onSuccess: ({ blob, filename }) => {
      downloadFile(blob, filename);
      setIsDownloadModalOpen(false);
      setDownloadPassword('');
      setDownloadingVersionId(null);
    },
    onError: (err: any) => {
      setError(err.message || 'Error al descargar el documento');
    },
  });

  const downloadVersionMutation = useMutation({
    mutationFn: async (versionId: string) => {
      return downloadService.download({
        documentId: id!,
        versionId,
        password: downloadPassword,
        encryptedPrivateKey: user?.encryptedPrivateKey,
        keySalt: user?.keySalt,
      });
    },
    onSuccess: ({ blob, filename }) => {
      downloadFile(blob, filename);
      setIsDownloadModalOpen(false);
      setDownloadPassword('');
      setDownloadingVersionId(null);
    },
    onError: (err: any) => {
      setError(err.message || 'Error al descargar la versión');
    },
  });

  const queryClient = useQueryClient();
  const { getRegistryContract } = useSigner();
  const { activeWallet } = useActiveWallet();

  useEffect(() => {
    if (document) {
      setEditName(document.name);
      setEditDescription(document.description || '');
      setEditTags(document.tags?.join(', ') || '');
    }
  }, [document?.id]);

  const updateMutation = useMutation({
    mutationFn: (data: { name?: string; description?: string; tags?: string[]; folderId?: string | null }) =>
      documentsApi.update(id!, data),
    onSuccess: () => {
      refetch();
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      setIsEditing(false);
    },
    onError: (err: any) => {
      setError(err.message || 'Error al actualizar el documento');
    },
  });

  const archiveMutation = useMutation({
    mutationFn: async () => {
      if (!activeWallet?.walletAddress) throw new Error('No hay wallet activa');
      const registryContract = await getRegistryContract(activeWallet.walletAddress);
      return archiveService.archive({ documentId: id!, registryContract });
    },
    onSuccess: () => { refetch(); queryClient.invalidateQueries({ queryKey: ['documents'] }); },
    onError: (err: any) => {
      documentsApi.rollback?.(id!).catch(() => {});
      setError(err.message || 'Error al archivar el documento');
    },
  });

  const unarchiveMutation = useMutation({
    mutationFn: async () => {
      if (!activeWallet?.walletAddress) throw new Error('No hay wallet activa');
      const registryContract = await getRegistryContract(activeWallet.walletAddress);
      return archiveService.unarchive({ documentId: id!, registryContract });
    },
    onSuccess: () => { refetch(); queryClient.invalidateQueries({ queryKey: ['documents'] }); },
    onError: (err: any) => {
      documentsApi.rollback?.(id!).catch(() => {});
      setError(err.message || 'Error al desarchivar el documento');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!activeWallet?.walletAddress) throw new Error('No hay wallet activa');
      const registryContract = await getRegistryContract(activeWallet.walletAddress);
      return archiveService.deleteDocument({ documentId: id!, registryContract });
    },
    onSuccess: () => navigate('/app/documents'),
    onError: (err: any) => {
      documentsApi.rollback?.(id!).catch(() => {});
      setError(err.message || 'Error al eliminar el documento');
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loading size="lg" text="Cargando documento..." />
      </div>
    );
  }

  if (!document) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/app/documents')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a Mis Documentos
        </Button>
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold text-foreground">Documento no encontrado</h3>
            <p className="text-muted-foreground">
              El documento que buscas no existe o no tienes acceso a él.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const typeVisual = getDocumentTypeVisual(document.fileExtension, document.mimeType);

  const handleDownload = () => {
    setError(null);
    if (document?.isEncrypted && !downloadPassword) {
      setError('Se requiere contraseña para desencriptar el documento');
      return;
    }
    if (downloadingVersionId) {
      downloadVersionMutation.mutate(downloadingVersionId);
    } else {
      downloadMutation.mutate(undefined);
    }
  };

  const publicDocumentUrl = document?.publicId
    ? `${window.location.origin}/public/d/${document.publicId}`
    : null;

  const tabs = [
    { id: 'details' as TabType, label: 'Detalles', icon: FileText },
    { id: 'timeline' as TabType, label: 'Historial', icon: Clock },
    { id: 'versions' as TabType, label: 'Versiones', icon: GitBranch },
    ...(isOwner ? [{ id: 'transfer' as TabType, label: 'Transferir', icon: ArrowRightLeft }] : []),
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/app/documents')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
      </div>

      {error && <AlertMessage type="error" message={error} onClose={() => setError(null)} />}

      {/* Document Info */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className={`${typeVisual.backgroundClassName} p-3 rounded-lg`}>
                <DocumentTypeIcon
                  fileExtension={document.fileExtension}
                  mimeType={document.mimeType}
                  className="w-8 h-8"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="text-xl font-bold" />
                  ) : (
                    <CardTitle className="text-2xl">{document.name}</CardTitle>
                  )}
                  {isOwner && (
                    <Button variant="ghost" size="sm" onClick={() => {
                      if (isEditing) {
                        const tagsArray = editTags ? editTags.split(',').map(t => t.trim()).filter(Boolean) : undefined;
                        updateMutation.mutate({
                          name: editName !== document.name ? editName : undefined,
                          description: editDescription !== (document.description || '') ? editDescription : undefined,
                          tags: tagsArray,
                        });
                      } else {
                        setIsEditing(true);
                      }
                    }} disabled={updateMutation.isPending}>
                      {isEditing ? <Check className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
                    </Button>
                  )}
                </div>
                <p className="mt-1 text-muted-foreground">
                  {formatBytes(Number(document.size))} • {document.fileExtension}
                </p>
                {isEditing ? (
                  <div className="mt-3 space-y-2">
                    <Input label="Descripción" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} placeholder="Descripción del documento" />
                    <Input label="Etiquetas (separadas por coma)" value={editTags} onChange={(e) => setEditTags(e.target.value)} placeholder="importante, Q1, informe" />
                  </div>
                ) : (
                  <>
                    {document.description && <p className="mt-2 text-sm text-muted-foreground">{document.description}</p>}
                    {document.tags && document.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {document.tags.map(tag => <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>)}
                      </div>
                    )}
                  </>
                )}
                {document.owner && (
                  <div className="mt-2 flex items-center gap-2">
                      <UserAvatar size="xs" name={document.owner.fullName || document.owner.username} />
                    <span className="text-sm text-muted-foreground">
                      {document.owner.fullName || document.owner.username}
                    </span>
                    <span className="text-xs text-muted-foreground" title={formatDate(document.createdAt)}>
                      • {formatRelativeTime(document.createdAt)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <p className="text-sm text-muted-foreground" title="Identificador del documento en el contrato inteligente de Ethereum">ID Blockchain</p>
                  <CopyableId value={document.blockchainId || ''} truncateStart={8} truncateEnd={6} />
                </div>
            <div>
              <p className="text-sm text-muted-foreground">Versiones</p>
              <p className="font-medium">{versions?.versions.length || 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Compartidos</p>
              <p className="font-medium">{shares?.shares.length || 0}</p>
            </div>
          </div>

          {isPublicDocument ? (
            <AlertMessage
              type="info"
              message="Documento público: el contenido se almacena sin cifrar y cualquier persona con el enlace o el QR puede verlo o descargarlo."
            />
          ) : null}

          <div className="flex flex-wrap gap-3">
            <Button
              variant="primary"
              onClick={() => setIsDownloadModalOpen(true)}
            >
              <Download className="w-4 h-4 mr-2" />
              Descargar
            </Button>
            {isOwner && !isPublicDocument && (
              <Button
                variant="outline"
                onClick={() => setIsShareModalOpen(true)}
                disabled={!document.blockchainTxHash}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Compartir
              </Button>
            )}

            {isPublicDocument && publicDocumentUrl ? (
              <PublicLinkActions url={publicDocumentUrl} title={document.name} />
            ) : null}
            
            {/* La ruta de detalle ya fuerza el acceso; cualquier documento visible se puede firmar. */}
            <Button
              variant="outline"
              onClick={() => setIsSignModalOpen(true)}
              disabled={document?.blockchainTxHash ? false : true}
            >
              <FileSignature className="w-4 h-4 mr-2" />
              Firmar Documento
            </Button>

            {isOwner && (
              <Button variant="outline" onClick={() => setShowMoveToFolder(true)}>
                <FolderInput className="w-4 h-4 mr-2" />
                Mover a carpeta
              </Button>
            )}
            
            {isOwner && (
              <>
                <Button
                  variant="secondary"
                  onClick={() => document?.isArchived ? unarchiveMutation.mutate() : archiveMutation.mutate()}
                  isLoading={archiveMutation.isPending || unarchiveMutation.isPending}
                  title="Al archivar, el documento seguirá visible para quienes tienen acceso, pero no se podrá modificar"
                >
                  <Archive className="w-4 h-4 mr-2" />
                  {document?.isArchived ? 'Desarchivar' : 'Archivar'}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (confirm('¿Estás seguro de que quieres eliminar este documento?')) {
                      deleteMutation.mutate();
                    }
                  }}
                  isLoading={deleteMutation.isPending}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'details' && (
        <div className="space-y-4">
          {shares && shares.shares.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Compartido Con</CardTitle>
              </CardHeader>
              <CardContent>
                <ShareList shares={shares.shares} documentId={id!} />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                <Share2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Este documento no ha sido compartido con otros usuarios.</p>
                {isOwner && (
                  <p className="text-sm mt-1">Use el botón "Compartir" arriba para dar acceso.</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Información adicional del documento */}
          <Card>
            <CardHeader>
              <CardTitle>Información del Documento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="col-span-2">
                  <p className="text-muted-foreground" title="Identificador del documento en el contrato inteligente de Ethereum">ID Blockchain</p>
                  <CopyableId value={document.blockchainId || ''} />
                </div>
                <div>
                  <p className="text-muted-foreground">Visibilidad</p>
                  <p>{document.visibility === 'PUBLIC' ? 'Público' : 'Privado'}</p>
                </div>
                {operationalVersion?.ipfsCid && (
                  <div className="col-span-2">
                    <p className="text-muted-foreground" title="Identificador de la versión operativa en IPFS">IPFS CID</p>
                    <CopyableId value={operationalVersion.ipfsCid} />
                  </div>
                )}
                {document.publicId && (
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Enlace Público</p>
                    <p className="font-mono text-xs">{publicDocumentUrl}</p>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground">Creado</p>
                  <p title={formatDate(document.createdAt)}>{formatRelativeTime(document.createdAt)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Actualizado</p>
                  <p title={formatDate(document.updatedAt || (versionsArray.length > 0 ? versionsArray[versionsArray.length - 1].createdAt : document.createdAt))}>{formatRelativeTime(document.updatedAt || (versionsArray.length > 0 ? versionsArray[versionsArray.length - 1].createdAt : document.createdAt))}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'timeline' && (
        <DocumentTimeline documentId={id!} />
      )}

      {activeTab === 'versions' && (
        <div className="space-y-4">
          {canCreateVersion && (
            <div className="flex justify-end">
              <Button
                variant="primary"
                onClick={() => setIsUploadVersionModalOpen(true)}
                disabled={!document.blockchainTxHash}
              >
                <GitBranch className="w-4 h-4 mr-2" />
                Subir Nueva Versión
              </Button>
            </div>
          )}
          <OperationalVersionSelector
            documentId={id!}
            isOwner={isOwner}
            isArchived={!!document?.isArchived}
            versions={versionsArray}
            isPublic={isPublicDocument}
            publicId={document.publicId}
            isLoading={isLoadingVersions}
            operationalVersionNumber={operationalVersionNumber}
            onVersionChange={() => refetch()}
            onDownloadVersion={(versionId) => {
              setDownloadingVersionId(versionId);
              setError(null);
              if (document?.isEncrypted) {
                setIsDownloadModalOpen(true);
              } else {
                downloadVersionMutation.mutate(versionId);
              }
            }}
          />
        </div>
      )}

      {activeTab === 'transfer' && isOwner && (
        <DocumentTransfer
          documentId={id!}
          documentName={document.name}
          isOwner={isOwner}
          isPublic={isPublicDocument}
          onTransferComplete={() => {
            refetch();
            navigate('/app/documents');
          }}
        />
      )}

      {/* Download Password Modal */}
      <Dialog open={isDownloadModalOpen} onOpenChange={(open) => { if (!open) { setIsDownloadModalOpen(false); setDownloadingVersionId(null); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{downloadingVersionId ? 'Descargar Versión' : 'Descargar Documento'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <AlertMessage
              type="info"
              message={document?.isEncrypted
                ? 'Ingrese su contraseña de cuenta para descifrar y descargar este documento.'
                : 'Este documento es público y no está cifrado. La descarga se realizará directamente.'}
            />
            <Input
              label="Su Contraseña de Cuenta"
              type="password"
              value={downloadPassword}
              onChange={(e) => setDownloadPassword(e.target.value)}
              placeholder="Ingrese su contraseña de cuenta"
              required={Boolean(document?.isEncrypted)}
              data-testid="download-password-input"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => {
              setIsDownloadModalOpen(false);
              setDownloadingVersionId(null);
            }}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleDownload}
              isLoading={downloadMutation.isPending || downloadVersionMutation.isPending}
            >
              Descargar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        documentId={id!}
        documentName={document.name}
      />

      {/* Upload Version Modal */}
      {document && (
        <UploadVersionModal
          isOpen={isUploadVersionModalOpen}
          onClose={() => setIsUploadVersionModalOpen(false)}
          onSuccess={(newVersion: Version) => {
            setIsUploadVersionModalOpen(false);
            queryClient.setQueryData<{ versions: Version[] } | undefined>(['versions', id], (current) => {
              const previousVersions = current?.versions ?? [];
              const mergedVersions = [newVersion, ...previousVersions.filter((version) => version.id !== newVersion.id)]
                .sort((left, right) => right.versionNumber - left.versionNumber);

              return { versions: mergedVersions };
            });
            refetch();
          }}
          document={document}
        />
      )}

      {/* Sign Document Modal */}
      {document && (
        <SignDocumentModal
          isOpen={isSignModalOpen}
          onClose={() => setIsSignModalOpen(false)}
          onSuccess={() => {
            setIsSignModalOpen(false);
            refetch();
          }}
          document={document}
          operationalVersionNumber={operationalVersionNumber}
        />
      )}

      <Dialog open={showMoveToFolder} onOpenChange={setShowMoveToFolder}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mover a carpeta</DialogTitle>
          </DialogHeader>
          <FolderSelector
            value={targetFolderId}
            onChange={setTargetFolderId}
            label="Carpeta destino"
            placeholder="Raíz (sin carpeta)"
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowMoveToFolder(false)}>Cancelar</Button>
            <Button variant="primary" onClick={async () => {
              try {
                await updateMutation.mutateAsync({ folderId: targetFolderId || null });
                setShowMoveToFolder(false);
                setTargetFolderId(null);
              } catch { /* error ya mostrado por onError */ }
            }}>Mover</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentDetails;
