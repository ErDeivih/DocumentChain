import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listDocuments } from '../api/documents';
import { type Folder } from '../api/folders';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Loading } from '../components/ui/Loading';
import AlertMessage from '../components/ui/AlertMessage';
import { DocumentList } from '../components/documents/DocumentList';
import { UploadModal } from '../components/documents/UploadModal';
import { CreateFolderModal } from '../components/folders/CreateFolderModal';
import { FolderBreadcrumb } from '../components/folders/FolderBreadcrumb';
import { Upload, FileText, FolderPlus, Search, Filter } from 'lucide-react';

type ViewTab = 'active' | 'archived';

export const Documents: React.FC = () => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [parentFolderForCreate, setParentFolderForCreate] = useState<Folder | null>(null);
  const [activeTab, setActiveTab] = useState<ViewTab>('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [fileTypeFilter, setFileTypeFilter] = useState<string>('');

  // Escuchar evento de selección de carpeta desde el Sidebar
  useEffect(() => {
    const handleFolderSelected = (event: CustomEvent<string | null>) => {
      const folderId = event.detail;
      setSelectedFolder(folderId ? { id: folderId } as Folder : null);
      setCurrentPage(1);
    };

    window.addEventListener('folderSelected', handleFolderSelected as EventListener);
    return () => {
      window.removeEventListener('folderSelected', handleFolderSelected as EventListener);
    };
  }, []);

  const {
    data: documentsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['documents', currentPage, selectedFolder?.id, activeTab, searchTerm, fileTypeFilter],
    queryFn: () => listDocuments({ 
      page: currentPage, 
      limit: 10,
      folderId: selectedFolder?.id,
      onlyArchived: activeTab === 'archived',
      includeArchived: false,
      search: searchTerm || undefined,
      fileType: fileTypeFilter || undefined,
    }),
  });

  const handleUploadSuccess = () => {
    setIsUploadModalOpen(false);
    refetch();
  };

  const handleCreateFolder = () => {
    setParentFolderForCreate(selectedFolder);
    setIsCreateFolderModalOpen(true);
  };

  const handleCloseFolderModal = () => {
    setIsCreateFolderModalOpen(false);
    setParentFolderForCreate(null);
  };

  if (isLoading && !documentsData) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loading size="lg" text="Cargando..." />
      </div>
    );
  }

  if (error) {
    return (
      <AlertMessage
        type="error"
        message={error instanceof Error ? error.message : 'Error al cargar los documentos'}
      />
    );
  }

  const hasDocuments = documentsData && documentsData.documents && documentsData.documents.length > 0;
  const pagination = {
    page: documentsData?.page || 1,
    limit: 10,
    total: documentsData?.total || 0,
    totalPages: documentsData?.totalPages || 1,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Mis Documentos</h1>
          {selectedFolder && (
            <FolderBreadcrumb
              currentFolder={selectedFolder}
              onNavigate={(folderId) => {
                setSelectedFolder(folderId ? { id: folderId } as Folder : null);
              }}
            />
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCreateFolder}>
            <FolderPlus className="w-4 h-4 mr-2" />
            Nueva Carpeta
          </Button>
          <Button variant="primary" onClick={() => setIsUploadModalOpen(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Subir Documento
          </Button>
        </div>
      </div>

        {/* Tabs */}
        <div className="flex space-x-1 border-b">
          <button
            onClick={() => {
              setActiveTab('active');
              setCurrentPage(1);
            }}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'active'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Activos
          </button>
          <button
            onClick={() => {
              setActiveTab('archived');
              setCurrentPage(1);
            }}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'archived'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Archivados
          </button>
        </div>

        {activeTab === 'archived' && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
            Los documentos archivados permanecen visibles para quienes tienen acceso, pero no se pueden modificar ni crear nuevas versiones hasta que se desarchiven.
          </div>
        )}

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4 items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar por nombre..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:border-transparent focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select
                  value={fileTypeFilter}
                  onChange={(e) => {
                    setFileTypeFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:border-transparent focus:ring-2 focus:ring-primary"
                >
                  <option value="">Todos los tipos</option>
                  <option value="pdf">PDF</option>
                  <option value="doc">DOC</option>
                  <option value="docx">DOCX</option>
                  <option value="txt">TXT</option>
                  <option value="jpg">JPG</option>
                  <option value="png">PNG</option>
                  <option value="zip">ZIP</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {!hasDocuments ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                {activeTab === 'archived' 
                  ? 'No hay documentos archivados'
                  : selectedFolder 
                    ? 'No hay documentos en esta carpeta' 
                    : 'No hay documentos todavía'
                }
              </h3>
              <p className="mb-6 text-muted-foreground">
                {activeTab === 'archived'
                  ? 'Los documentos archivados aparecerán aquí'
                  : selectedFolder 
                    ? 'Suba un documento a esta carpeta para comenzar'
                    : 'Suba su primer documento para comenzar con el almacenamiento seguro en blockchain'
                }
              </p>
              {activeTab !== 'archived' && (
                <Button variant="primary" onClick={() => setIsUploadModalOpen(true)}>
                  <Upload className="w-4 h-4 mr-2" />
                  Subir Documento
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <DocumentList
            documents={documentsData?.documents || []}
            pagination={pagination}
            onPageChange={setCurrentPage}
            onRefresh={refetch}
          />
        )}

      {/* Modales */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={handleUploadSuccess}
        defaultFolderId={selectedFolder?.id}
      />

      <CreateFolderModal
        isOpen={isCreateFolderModalOpen}
        onClose={handleCloseFolderModal}
        parentFolder={parentFolderForCreate}
      />
    </div>
  );
};
