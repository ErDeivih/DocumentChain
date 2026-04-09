import React, { useState, useEffect } from 'react';
import { Search, Filter, X, FileType } from 'lucide-react';
import { Input } from '../ui/Input';
import { FolderSelector } from '../folders/FolderSelector';
import { CategorySelector } from '../categories/CategorySelector';
import { DocumentFilters as Filters } from '../../types';

interface DocumentFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  onClearFilters: () => void;
}

const FILE_EXTENSIONS = [
  { value: 'pdf', label: 'PDF' },
  { value: 'doc', label: 'Word (DOC)' },
  { value: 'docx', label: 'Word (DOCX)' },
  { value: 'xls', label: 'Excel (XLS)' },
  { value: 'xlsx', label: 'Excel (XLSX)' },
  { value: 'ppt', label: 'PowerPoint (PPT)' },
  { value: 'pptx', label: 'PowerPoint (PPTX)' },
  { value: 'txt', label: 'Texto' },
  { value: 'csv', label: 'CSV' },
  { value: 'jpg', label: 'JPEG' },
  { value: 'png', label: 'PNG' },
  { value: 'gif', label: 'GIF' },
  { value: 'zip', label: 'ZIP' },
  { value: 'rar', label: 'RAR' },
];

export const DocumentFilters: React.FC<DocumentFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localFilters, setLocalFilters] = useState<Filters>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const updateFilter = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleClearAll = () => {
    setLocalFilters({});
    onClearFilters();
  };

  const hasActiveFilters = Object.keys(localFilters).some(
    (key) => {
      const value = localFilters[key as keyof Filters];
      return value !== undefined && value !== null && value !== '';
    }
  );

  const activeFilterCount = Object.keys(localFilters).filter((key) => {
    const value = localFilters[key as keyof Filters];
    return value !== undefined && value !== null && value !== '';
  }).length;

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      {/* Encabezado */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-800">Filtros</h3>
          {activeFilterCount > 0 && (
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={handleClearAll}
              className="text-sm text-red-600 hover:underline"
            >
              Limpiar todo
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-blue-600 hover:underline"
          >
            {isExpanded ? 'Ocultar' : 'Mostrar'} filtros
          </button>
        </div>
      </div>

      {/* Controles de Filtro */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Buscar por nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Search className="w-4 h-4 inline mr-1" />
              Buscar por nombre
            </label>
            <Input
              value={localFilters.search || ''}
              onChange={(e) => updateFilter('search', e.target.value)}
              placeholder="Ingrese nombre del documento..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Filtro de carpeta */}
            <FolderSelector
              value={localFilters.folderId || null}
              onChange={(folderId) => updateFilter('folderId', folderId || undefined)}
              placeholder="Todas las carpetas"
            />

            {/* Filtro de categoría */}
            <CategorySelector
              value={localFilters.categoryId || null}
              onChange={(categoryId) => updateFilter('categoryId', categoryId || undefined)}
              placeholder="Todas las categorías"
            />
          </div>

          {/* Filtro de extensión de archivo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FileType className="w-4 h-4 inline mr-1" />
              Tipo de Archivo
            </label>
            <select
              value={localFilters.fileExtension || ''}
              onChange={(e) => updateFilter('fileExtension', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los tipos de archivo</option>
              {FILE_EXTENSIONS.map((ext) => (
                <option key={ext.value} value={ext.value}>
                  {ext.label} (.{ext.value})
                </option>
              ))}
            </select>
          </div>

          {/* Filtro de etiquetas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Etiquetas (separadas por comas)
            </label>
            <Input
              value={localFilters.tags?.join(', ') || ''}
              onChange={(e) => {
                const tagsArray = e.target.value
                  .split(',')
                  .map(tag => tag.trim())
                  .filter(tag => tag.length > 0);
                updateFilter('tags', tagsArray.length > 0 ? tagsArray : undefined);
              }}
              placeholder="etiqueta1, etiqueta2, etiqueta3..."
            />
            {localFilters.tags && localFilters.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {localFilters.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Resumen de filtros activos */}
          {hasActiveFilters && (
            <div className="pt-4 border-t">
              <p className="text-sm font-medium text-gray-700 mb-2">Filtros Activos:</p>
              <div className="flex flex-wrap gap-2">
                {localFilters.search && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md">
                    Búsqueda: "{localFilters.search}"
                    <button onClick={() => updateFilter('search', undefined)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {localFilters.folderId && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md">
                    Carpeta seleccionada
                    <button onClick={() => updateFilter('folderId', undefined)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {localFilters.categoryId && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md">
                    Categoría seleccionada
                    <button onClick={() => updateFilter('categoryId', undefined)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {localFilters.fileExtension && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md">
                    Tipo: .{localFilters.fileExtension}
                    <button onClick={() => updateFilter('fileExtension', undefined)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
