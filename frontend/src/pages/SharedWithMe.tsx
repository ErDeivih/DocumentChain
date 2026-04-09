import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSharedWithMe } from '../api/shares';
import { useActiveWallet } from '../contexts/ActiveWalletContext';
import { Card, CardContent } from '../components/ui/Card';
import { Loading } from '../components/ui/Loading';
import AlertMessage from '../components/ui/AlertMessage';
import { Badge } from '../components/ui/Badge';
import { DocumentTypeIcon, getDocumentTypeVisual } from '../components/documents/DocumentTypeIcon';
import { Link } from 'react-router-dom';
import { FileText, User, Search, Filter, Wallet as WalletIcon } from 'lucide-react';

export const SharedWithMe: React.FC = () => {
  const { activeWallet } = useActiveWallet();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [fileTypeFilter, setFileTypeFilter] = useState<string>('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['sharedWithMe', activeWallet?.id, currentPage, searchTerm, fileTypeFilter],
    queryFn: () => getSharedWithMe({
      page: currentPage,
      limit: 10,
      search: searchTerm || undefined,
      fileType: fileTypeFilter || undefined,
      walletId: activeWallet?.id, // Use active wallet instead of primary
    }),
    enabled: !!activeWallet, // Only fetch when we have an active wallet
  });

  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loading size="lg" text="Cargando documentos compartidos..." />
      </div>
    );
  }

  if (error) {
    return (
      <AlertMessage
        type="error"
        message={error instanceof Error ? error.message : 'Error al cargar documentos compartidos'}
      />
    );
  }

  const hasShares = data && data.documents && data.documents.length > 0;
  const pagination = {
    page: data?.page || 1,
    limit: 10,
    total: data?.total || 0,
    totalPages: data?.totalPages || 1,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Compartidos Conmigo</h1>
        
        {/* Active Wallet Indicator */}
        {activeWallet && (
          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <WalletIcon className="w-4 h-4" />
            <span>
              Mostrando documentos compartidos con:{' '}
              <span className="font-medium text-foreground">
                {activeWallet.label || 'Wallet sin nombre'}
              </span>{' '}
              ({activeWallet.walletAddress.slice(0, 6)}...{activeWallet.walletAddress.slice(-4)})
            </span>
          </div>
        )}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={fileTypeFilter}
                onChange={(e) => {
                  setFileTypeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
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

      {!hasShares ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No hay documentos compartidos
            </h3>
            <p className="text-gray-600">
              {searchTerm || fileTypeFilter
                ? 'No se encontraron documentos con esos filtros'
                : 'Los documentos compartidos con usted aparecerán aquí'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.documents.map((doc: any) => (
              <Link key={doc.id} to={`/app/documents/${doc.id}`}>
                {(() => {
                  const typeVisual = getDocumentTypeVisual(doc.fileExtension, doc.mimeType);
                  return (
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`${typeVisual.backgroundClassName} p-2 rounded-lg flex-shrink-0`}>
                          <DocumentTypeIcon
                            fileExtension={doc.fileExtension}
                            mimeType={doc.mimeType}
                            className="w-6 h-6"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {doc.name || 'Documento Compartido'}
                          </h3>
                          {doc.fileExtension && (
                            <p className="text-xs text-gray-500 uppercase">
                              {doc.fileExtension}
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge variant="secondary">
                        Compartido
                      </Badge>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>Por: {doc.owner?.username || 'Desconocido'}</span>
                      </div>
                      {doc.category && (
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {doc.category.name}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
                  );
                })()}
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Anterior
              </button>
              <span className="text-gray-600">
                Página {pagination.page} de {pagination.totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === pagination.totalPages}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
