import React from 'react';
import { Link } from 'react-router-dom';
import { Document, PaginationInfo } from '../../types';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Skeleton } from '../ui/Skeleton';
import { DocumentTypeIcon, getDocumentTypeVisual } from './DocumentTypeIcon';
import { formatBytes } from '../../lib/utils';
import {
  ChevronLeft,
  ChevronRight,
  Tag,
} from 'lucide-react';

/**
 * Props del componente DocumentList.
 */
interface DocumentListProps {
  /** Lista de documentos a mostrar. */
  documents: Document[];
  /** Información de paginación actual. */
  pagination: PaginationInfo;
  /** Callback que se ejecuta al cambiar de página. */
  onPageChange: (page: number) => void;
  /** Callback para refrescar la lista de documentos. */
  onRefresh: () => void;
  /** Indica si se está cargando la lista de documentos. */
  isLoading?: boolean;
}

/**
 * Lista de documentos en formato de cuadrícula con paginación.
 * Renderiza tarjetas para cada documento, incluyendo estado de carga
 * y controles de paginación.
 */
export const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  pagination,
  onPageChange,
  isLoading = false,
}) => {
  return (
    <div className="space-y-4">
      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, idx) => (
            <Card key={idx}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-3 w-full mb-2" />
                <Skeleton className="h-3 w-2/3" />
              </CardContent>
            </Card>
          ))
        ) : (
          documents.map((doc) => {
            const isPreparing = doc.blockchainStatus === 'PREPARING';
            const typeVisual = getDocumentTypeVisual(doc.fileExtension, doc.mimeType);
            const CardWrapper = isPreparing ? 'div' : Link;
            const wrapperProps = isPreparing 
              ? { className: "block" } 
              : { to: `/app/documents/${doc.id}` };
            
            return (
              <CardWrapper key={doc.id} {...wrapperProps as any}>
                <Card className={`${isPreparing ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-lg cursor-pointer'} transition-shadow h-full`}>
                  <CardContent className="p-4">
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
                          <h3 className="font-semibold text-foreground truncate">
                            {doc.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {formatBytes(Number(doc.size))} {doc.fileExtension && `• ${doc.fileExtension.toUpperCase()}`}
                          </p>
                        </div>
                      </div>
                      {/* Only show badge for non-SYNCED statuses */}
                      {doc.blockchainStatus !== 'SYNCED' && (
                        <Badge variant={doc.blockchainStatus === 'FAILED' ? 'destructive' : 'warning'}>
                          {doc.blockchainStatus}
                        </Badge>
                      )}
                    </div>

                    {isPreparing && (
                      <div className="mb-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-xs text-yellow-800 dark:text-yellow-200">
                        Documento en preparación. Espere a que se complete la transacción blockchain.
                      </div>
                    )}

                    {doc.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {doc.description}
                      </p>
                    )}

                    {doc.tags && doc.tags.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <Tag className="w-3 h-3 text-muted-foreground" />
                        {doc.tags.slice(0, 3).map((tag, idx) => (
                          <Badge key={idx} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                        {doc.tags.length > 3 && (
                          <span className="text-xs text-muted-foreground">+{doc.tags.length - 3}</span>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </CardWrapper>
            );
          })
        )}
      </div>

      {/* Paginación */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t pt-4">
          <div className="text-sm text-muted-foreground">
            Mostrando {(pagination.page - 1) * pagination.limit + 1} a{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
            {pagination.total} documentos
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter(
                  (page) =>
                    page === 1 ||
                    page === pagination.totalPages ||
                    Math.abs(page - pagination.page) <= 1
                )
                .map((page, idx, arr) => (
                  <React.Fragment key={page}>
                    {idx > 0 && arr[idx - 1] !== page - 1 && (
                      <span className="px-2 text-muted-foreground">...</span>
                    )}
                    <Button
                      variant={page === pagination.page ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => onPageChange(page)}
                    >
                      {page}
                    </Button>
                  </React.Fragment>
                ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
