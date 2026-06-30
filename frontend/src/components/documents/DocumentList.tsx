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
  CheckSquare,
  Square,
} from 'lucide-react';

interface DocumentListProps {
    documents: Document[];
    pagination: PaginationInfo;
    onPageChange: (page: number) => void;
    onRefresh: () => void;
    isLoading?: boolean;
    selectable?: boolean;
    selectedIds?: Set<string>;
    onSelectionChange?: (ids: Set<string>) => void;
    onTagClick?: (tag: string) => void;
}

export const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  pagination,
  onPageChange,
  isLoading = false,
  selectable = false,
  selectedIds,
  onSelectionChange,
  onTagClick,
}) => {
  const isSelected = (id: string) => selectedIds?.has(id) ?? false;

  const toggleSelection = (id: string) => {
    if (!onSelectionChange) return;
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelectionChange(next);
  };

  const toggleAll = () => {
    if (!onSelectionChange) return;
    const allIds = new Set(documents.map(d => d.id));
    const allSelected = documents.every(d => isSelected(d.id));
    if (allSelected) onSelectionChange(new Set());
    else onSelectionChange(allIds);
  };

  const allSelected = documents.length > 0 && documents.every(d => isSelected(d.id));

  return (
    <div className="space-y-4">
      {selectable && selectedIds && selectedIds.size > 0 && (
        <div className="flex items-center gap-3 px-2">
          <button onClick={toggleAll} className="text-sm text-primary hover:underline">
            {allSelected ? 'Deseleccionar todo' : 'Seleccionar todo'}
          </button>
          <span className="text-sm text-muted-foreground">
            {selectedIds.size} seleccionado{selectedIds.size !== 1 ? 's' : ''}
          </span>
        </div>
      )}

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
            const isPending = !doc.blockchainTxHash;
            const typeVisual = getDocumentTypeVisual(doc.fileExtension, doc.mimeType);
            const selected = isSelected(doc.id);
            const inner = (
              <Card className={`${isPending ? 'opacity-60 cursor-not-allowed' : selected ? 'ring-2 ring-primary shadow-md' : 'hover:shadow-lg'} transition-shadow h-full`}>
                <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {selectable && (
                          <div className="flex-shrink-0 pt-0.5" onClick={(e) => { e.stopPropagation(); toggleSelection(doc.id); }}>
                            {selected ? <CheckSquare className="w-5 h-5 text-primary" /> : <Square className="w-5 h-5 text-muted-foreground" />}
                          </div>
                        )}
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
                      {isPending && (
                        <Badge variant="warning">
                          Pendiente
                        </Badge>
                      )}
                    </div>

                    {isPending && (
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
                      <div className="flex items-center gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
                        <Tag className="w-3 h-3 text-muted-foreground" />
                        {doc.tags.slice(0, 3).map((tag, idx) => (
                          onTagClick ? (
                            <button key={idx} onClick={(e) => { e.preventDefault(); onTagClick(tag); }} className="focus:outline-none">
                              <Badge variant="secondary" className="cursor-pointer hover:bg-primary/20 transition-colors">
                                {tag}
                              </Badge>
                            </button>
                          ) : (
                            <Badge key={idx} variant="secondary">
                              {tag}
                            </Badge>
                          )
                        ))}
                        {doc.tags.length > 3 && (
                          <span className="text-xs text-muted-foreground">+{doc.tags.length - 3}</span>
                        )}
                      </div>
                    )}
                  </CardContent>
              </Card>
            );

            if (isPending) {
              return <div key={doc.id} className="block">{inner}</div>;
            }
            return <Link key={doc.id} to={`/app/documents/${doc.id}`}>{inner}</Link>;
          })
        )}
        {!isLoading && documents.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-muted-foreground">
            <p className="text-lg font-medium">No se encontraron documentos</p>
          </div>
        )}
      </div>

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
              aria-label="Página anterior"
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
              aria-label="Página siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
