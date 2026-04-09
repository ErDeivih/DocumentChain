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
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border-b">
        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <nav className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b overflow-x-auto">
      {/* Inicio / Raíz */}
      <button
        onClick={() => handleClick(null)}
        className={`
          flex items-center gap-1 px-2 py-1 rounded
          transition-colors text-sm
          ${
            !folderId
              ? 'bg-blue-100 text-blue-700 font-semibold'
              : 'text-gray-600 hover:bg-gray-200'
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
            <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <button
              onClick={() => handleClick(folder.id)}
              className={`
                px-2 py-1 rounded transition-colors text-sm whitespace-nowrap
                ${
                  isLast
                    ? 'bg-blue-100 text-blue-700 font-semibold'
                    : 'text-gray-600 hover:bg-gray-200'
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
