import React, { useState, useEffect } from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { FolderPath, Folder } from '../../types';
import { getFolderPath } from '../../api/folders';

interface FolderBreadcrumbProps {
    folderId?: string | null;
    currentFolder?: Folder | null;
    onNavigate?: (folderId: string | null) => void;
}

/**
 * Breadcrumb de navegación de carpetas.
 * Muestra la ruta jerárquica desde la raíz hasta la carpeta actual.
 */
export const FolderBreadcrumb: React.FC<FolderBreadcrumbProps> = ({
  folderId,
  currentFolder,
  onNavigate,
}) => {
  const [path, setPath] = useState<FolderPath[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Usar folderId de las props o currentFolder.id
  const activeFolderId = folderId || currentFolder?.id;

  useEffect(() => {
    let cancelled = false;
    const loadPath = async () => {
      try {
        setLoading(true);
        const data = await getFolderPath(activeFolderId!);
        if (cancelled) return;
        setPath(data.path);
      } catch (err) {
        if (cancelled) return;
        console.warn('Error al cargar la ruta de la carpeta:', err);
        setPath([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    if (activeFolderId) {
      loadPath();
    } else {
      setPath([]);
    }
    return () => { cancelled = true; };
  }, [activeFolderId]);

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
