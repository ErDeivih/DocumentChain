import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSharedWithMe } from '../api/shares';
import { useActiveWallet } from '../contexts/ActiveWalletContext';
import { Card, CardContent } from '../components/ui/Card';
import { Loading } from '../components/ui/Loading';
import AlertMessage from '../components/ui/AlertMessage';
import { Badge } from '../components/ui/Badge';
import { DocumentTypeIcon, getDocumentTypeVisual } from '../components/documents/DocumentTypeIcon';
import { Link } from 'react-router-dom';
import { truncateAddress } from '../lib/utils';
import { useDebounce } from '../hooks/useDebounce';
import { FileText, User, Search, Filter, Wallet as WalletIcon, Loader2 } from 'lucide-react';

/**
 * Página de documentos compartidos con el usuario actual.
 *
 * Lista los documentos a los que el usuario tiene acceso por compartición,
 * permitiendo buscar, filtrar por tipo y por usuario que compartió,
 * además de paginar los resultados.
 *
 * @returns JSX.Element con la lista de documentos compartidos.
 */
export const SharedWithMe: React.FC = () => {
  const { activeWallet } = useActiveWallet();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [fileTypeFilter, setFileTypeFilter] = useState<string>('');
  const [sharedByFilter, setSharedByFilter] = useState<string>('');
  const [pageSize, setPageSize] = useState(10);

  const debouncedSearch = useDebounce(searchInput, 300);

  useEffect(() => {
    setSearchTerm(debouncedSearch);
    setCurrentPage(1);
  }, [debouncedSearch]);

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ['sharedWithMe', activeWallet?.id, currentPage, searchTerm, fileTypeFilter, sharedByFilter, pageSize],
    queryFn: () => getSharedWithMe({
      page: currentPage,
      limit: pageSize,
      search: searchTerm || undefined,
      fileType: fileTypeFilter || undefined,
      sharedBy: sharedByFilter || undefined,
      walletId: activeWallet?.id,
    }),
    enabled: !!activeWallet,
  });

  const sharers = useMemo(() => {
    if (!data?.documents) return [];
    const map = new Map<string, string>();
    data.documents.forEach((doc: any) => {
      if (doc.owner?.username && !map.has(doc.owner.username)) {
        map.set(doc.owner.username, doc.owner.fullName || doc.owner.username);
      }
    });
    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [data?.documents]);

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
    limit: pageSize,
    total: data?.total || 0,
    totalPages: data?.totalPages || 1,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Compartidos Conmigo</h1>
          
          {/* Active Wallet Indicator */}
          {activeWallet && (
            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <WalletIcon className="w-4 h-4" />
              <span>
                Mostrando documentos compartidos con:{' '}
                <span className="font-medium text-foreground">
                  {activeWallet.label || 'Wallet sin nombre'}
                </span>{' '}
                ({truncateAddress(activeWallet.walletAddress)})
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Search and Filters - Outside document container */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full rounded-lg border border-input bg-white py-2 pl-10 pr-10 text-foreground placeholder:text-muted-foreground focus:border-transparent focus:ring-2 focus:ring-primary"
          />
          {isFetching && (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <select
              value={sharedByFilter}
              onChange={(e) => {
                setSharedByFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-lg border border-input bg-white px-4 py-2 text-foreground focus:border-transparent focus:ring-2 focus:ring-primary"
            >
              <option value="">Todos los usuarios</option>
              {sharers.map(([username, label]) => (
                <option key={username} value={username}>{label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={fileTypeFilter}
              onChange={(e) => {
                setFileTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-lg border border-input bg-white px-4 py-2 text-foreground focus:border-transparent focus:ring-2 focus:ring-primary"
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
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Mostrar:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="rounded-lg border border-input bg-white px-3 py-2 text-foreground focus:border-transparent focus:ring-2 focus:ring-primary"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {!hasShares ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold text-foreground">
              No hay documentos compartidos
            </h3>
            <p className="text-muted-foreground">
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
                          <h3 className="truncate font-semibold text-foreground">
                            {doc.name || 'Documento Compartido'}
                          </h3>
                          {doc.fileExtension && (
                            <p className="text-xs uppercase text-muted-foreground">
                              {doc.fileExtension}
                            </p>
                          )}
                        </div>
                      </div>

                    </div>

                    <div className="space-y-2 text-sm text-muted-foreground">
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
                className="rounded-lg border border-border bg-white px-4 py-2 text-foreground disabled:cursor-not-allowed disabled:opacity-50 hover:bg-secondary/35"
              >
                Anterior
              </button>
              <span className="text-muted-foreground">
                Página {pagination.page} de {pagination.totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === pagination.totalPages}
                className="rounded-lg border border-border bg-white px-4 py-2 text-foreground disabled:cursor-not-allowed disabled:opacity-50 hover:bg-secondary/35"
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
