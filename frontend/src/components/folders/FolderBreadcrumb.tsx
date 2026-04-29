import React, { useState, useEffect } from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { FolderPath, Folder } from '../../types';
import { getFolderPath } from '../../api/folders';

interface FolderBreadcrumbProps {
  folderId?: string | null;
  currentFolder?: Folder | null;
  onNavigate?: (folderId: string | null) => void;
}

export const FolderBreadcrumb: React.FC<FolderBreadcrumbProps> = ({
  folderId,
  currentFolder,
  onNavigate,
}) => {
  const [path, setPath] = useState<FolderPath[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Use either folderId prop or currentFolder.id
  const activeFolderId = folderId || currentFolder?.id;

  useEffect(() => {
    if (activeFolderId) {
      loadPath();
    } else {
      setPath([]);
    }
  }, [activeFolderId]);

  const loadPath = async () => {
    if (!activeFolderId) return;
    
    try {
      setLoading(true);
      const { path: folderPath } = await getFolderPath(activeFolderId);
      setPath(folderPath);
    } catch (err) {
      console.error('Error al cargar la ruta de la carpeta:', err);
      setPath([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = (targetFolderId: string | null) => {
    if (onNavigate) {
      onNavigate(targetFolderId);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 border-b border-border bg-secondary/35 px-4 py-2">
        <div className="h-4 w-32 animate-pulse rounded bg-secondary" />
      </div>
    );
  }

  return (
    <nav className="flex items-center gap-2 overflow-x-auto border-b border-border bg-secondary/35 px-4 py-3">
      {/* Inicio / Raíz */}
      <button
        onClick={() => handleClick(null)}
        className={`
          flex items-center gap-1 px-2 py-1 rounded
          transition-colors text-sm
          ${
            !folderId
              ? 'bg-primary/10 font-semibold text-primary'
              : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
          }
        `}
      >
        <Home className="w-4 h-4" />
        <span>Todos los Documentos</span>
      </button>

      {/* Ruta de navegación */}
      {path.map((folder, index) => {
        const isLast = index === path.length - 1;
        return (
          <React.Fragment key={folder.id}>
            <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
            <button
              onClick={() => handleClick(folder.id)}
              className={`
                px-2 py-1 rounded transition-colors text-sm whitespace-nowrap
                ${
                  isLast
                    ? 'bg-primary/10 font-semibold text-primary'
                    : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
                }
              `}
            >
              {folder.name}
            </button>
          </React.Fragment>
        );
      })}
    </nav>
  );
};
