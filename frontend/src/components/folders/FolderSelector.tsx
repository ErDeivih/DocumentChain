import React, { useState, useEffect } from 'react';
import { Folder, ChevronDown } from 'lucide-react';
import { Folder as FolderType } from '../../types';
import { getFolders } from '../../api/folders';

/**
 * Props del componente FolderSelector.
 */
interface FolderSelectorProps {
  /** Identificador de la carpeta seleccionada. */
  value: string | null;
  /** Callback al cambiar la carpeta seleccionada. */
  onChange: (folderId: string | null) => void;
  /** Etiqueta del campo. */
  label?: string;
  /** Texto del placeholder. */
  placeholder?: string;
  /** Indica si el selector está deshabilitado. */
  disabled?: boolean;
  /** Identificadores de carpetas a excluir del selector. */
  excludeFolderIds?: string[];
}

/**
 * Selector desplegable de carpetas con visualización jerárquica.
 * Muestra las carpetas disponibles incluyendo su ruta completa.
 */
export const FolderSelector: React.FC<FolderSelectorProps> = ({
  value,
  onChange,
  label = 'Carpeta',
  placeholder = 'Seleccione una carpeta',
  disabled = false,
  excludeFolderIds = [],
}) => {
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFolders();
  }, []);

  const loadFolders = async () => {
    try {
      setLoading(true);
      const data = await getFolders();
      setFolders(data.folders);
    } catch (err) {
      console.error('Error al cargar carpetas:', err);
      setFolders([]);
    } finally {
      setLoading(false);
    }
  };

  // Build hierarchical display names
  const getFolderDisplayName = (folder: FolderType, allFolders: FolderType[]): string => {
    const path: string[] = [folder.name];
    let currentFolder = folder;

    while (currentFolder.parentId) {
      const parent = allFolders.find((f) => f.id === currentFolder.parentId);
      if (!parent) break;
      path.unshift(parent.name);
      currentFolder = parent;
    }

    return path.join(' / ');
  };

  // Filter and sort folders
  const availableFolders = folders
    .filter((folder) => !excludeFolderIds.includes(folder.id))
    .map((folder) => ({
      ...folder,
      displayName: getFolderDisplayName(folder, folders),
    }))
    .sort((a, b) => a.displayName.localeCompare(b.displayName));

  const selectedFolder = folders.find((f) => f.id === value);

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium uppercase tracking-[0.08em] text-muted-foreground">
          {label}
        </label>
      )}
      
      <div className="relative">
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value || null)}
          disabled={disabled || loading}
          className={`
            w-full px-3 py-2 pl-10 pr-8 
            border border-input rounded-xl 
            focus:outline-none focus:ring-2 focus:ring-primary/60
            appearance-none bg-background/75 text-foreground backdrop-blur-sm
            ${disabled || loading ? 'bg-secondary/50 cursor-not-allowed' : ''}
          `}
        >
          <option value="">
            {loading ? 'Cargando carpetas...' : placeholder}
          </option>
          {availableFolders.map((folder) => (
            <option key={folder.id} value={folder.id}>
              {folder.displayName}
            </option>
          ))}
        </select>

        {/* Icono de carpeta */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <Folder 
            className="w-5 h-5" 
            style={{ color: selectedFolder?.color || '#6B7280' }}
          />
        </div>

        {/* Icono de desplegable */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>

      {selectedFolder && (
        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <Folder className="w-3 h-3" style={{ color: selectedFolder.color || '#6B7280' }} />
          {getFolderDisplayName(selectedFolder, folders)}
        </p>
      )}
    </div>
  );
};
