import React, { useState, useEffect } from 'react';
import { Folder, ChevronRight, ChevronDown, FolderOpen, Plus } from 'lucide-react';
import { Folder as FolderType } from '../../types';
import { getFolders } from '../../api/folders';

interface FolderTreeProps {
  onFolderSelect?: (folderId: string | null) => void;
  selectedFolderId?: string | null;
  onCreateFolder?: (parentId: string | null) => void;
  onCreateSubfolder?: (parentFolder: FolderType) => void;
  onDeleteFolder?: (folder: FolderType) => void;
  showCreateButton?: boolean;
}

interface FolderNode extends FolderType {
  children: FolderNode[];
  level: number;
  documentCount?: number;
}

export const FolderTree: React.FC<FolderTreeProps> = ({
  onFolderSelect,
  selectedFolderId,
  onCreateFolder,
  onCreateSubfolder: _onCreateSubfolder,
  onDeleteFolder: _onDeleteFolder,
  showCreateButton = false,
}) => {
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFolders();
  }, []);

  useEffect(() => {
    const handleFoldersChanged = () => {
      loadFolders();
    };

    window.addEventListener('foldersChanged', handleFoldersChanged);

    return () => {
      window.removeEventListener('foldersChanged', handleFoldersChanged);
    };
  }, []);

  const loadFolders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getFolders();
      setFolders(data.folders);
    } catch (err) {
      setError('Error al cargar carpetas');
      console.error('Error al cargar carpetas:', err);
    } finally {
      setLoading(false);
    }
  };

  // Build hierarchical tree structure
  const buildTree = (folders: FolderType[]): FolderNode[] => {
    const folderMap = new Map<string, FolderNode>();
    const rootFolders: FolderNode[] = [];

    // Initialize all folders as nodes
    folders.forEach((folder) => {
      folderMap.set(folder.id, { ...folder, children: [], level: 0 });
    });

    // Build parent-child relationships
    folders.forEach((folder) => {
      const node = folderMap.get(folder.id)!;
      if (folder.parentId && folderMap.has(folder.parentId)) {
        const parent = folderMap.get(folder.parentId)!;
        node.level = parent.level + 1;
        parent.children.push(node);
      } else {
        rootFolders.push(node);
      }
    });

    // Sort folders alphabetically
    const sortFolders = (nodes: FolderNode[]) => {
      nodes.sort((a, b) => a.name.localeCompare(b.name));
      nodes.forEach((node) => sortFolders(node.children));
    };
    sortFolders(rootFolders);

    return rootFolders;
  };

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const handleFolderClick = (folderId: string) => {
    toggleFolder(folderId);
    if (onFolderSelect) {
      onFolderSelect(folderId);
    }
  };

  const renderFolder = (node: FolderNode) => {
    const isExpanded = expandedFolders.has(node.id);
    const isSelected = selectedFolderId === node.id;
    const hasChildren = node.children.length > 0;
    // Aumentado el indentado para mejor visualización: 24px por nivel
    const paddingLeft = `${node.level * 24 + 12}px`;

    return (
      <div key={node.id} className="relative">
        <div
          className={`
            flex items-center gap-2 px-3 py-2.5 cursor-pointer
            hover:bg-gray-100 transition-colors
            ${isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''}
          `}
          style={{ paddingLeft }}
          onClick={() => handleFolderClick(node.id)}
          title={node.parentId ? `Subcarpeta de ${folders.find(f => f.id === node.parentId)?.name || 'padre'}` : 'Carpeta raíz'}
        >
          {/* Línea vertical de conexión para mostrar jerarquía */}
          {node.level > 0 && (
            <div
              className="absolute left-0 top-0 bottom-0 w-px bg-gray-300"
              style={{ left: `${node.level * 24}px` }}
            />
          )}

          {/* Línea horizontal de conexión */}
          {node.level > 0 && (
            <div
              className="absolute top-1/2 w-2 h-px bg-gray-300"
              style={{ left: `${node.level * 24}px` }}
            />
          )}

          {/* Icono de Expandir/Colapsar */}
          <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className="w-5 h-5 text-gray-600" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-600" />
              )
            ) : (
              <div className="w-5 h-5" /> // Espaciador para alineación
            )}
          </div>

          {/* Icono de Carpeta */}
          {isExpanded && hasChildren ? (
            <FolderOpen className="w-5 h-5 flex-shrink-0" style={{ color: node.color || '#3B82F6' }} />
          ) : (
            <Folder className="w-5 h-5 flex-shrink-0" style={{ color: node.color || '#3B82F6' }} />
          )}

          {/* Nombre de Carpeta con indicador de nivel */}
          <span className={`flex-1 text-sm ${isSelected ? 'font-semibold text-blue-700' : 'text-gray-700'}`}>
            {node.name}
            {node.level > 0 && (
              <span className="ml-2 text-xs text-gray-400">
                (Nivel {node.level})
              </span>
            )}
          </span>

          {/* Badge de contador de documentos */}
          {node.documentCount != null && node.documentCount > 0 && (
            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
              {node.documentCount}
            </span>
          )}

          {/* Botón de Crear Subcarpeta */}
          {showCreateButton && isSelected && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onCreateFolder) {
                  onCreateFolder(node.id);
                }
              }}
              className="p-1 rounded hover:bg-gray-200 transition-colors flex-shrink-0"
              title={`Crear subcarpeta dentro de "${node.name}"`}
            >
              <Plus className="w-4 h-4 text-gray-600" />
            </button>
          )}
        </div>

        {/* Renderizar hijos si está expandido */}
        {isExpanded && hasChildren && (
          <div className="relative">
            {node.children.map((child, index) => (
              <div key={child.id} className="relative">
                {/* Linea vertical que conecta con hermanos */}
                {index < node.children.length - 1 && (
                  <div
                    className="absolute left-0 top-0 bottom-0 w-px bg-gray-300"
                    style={{ left: `${(node.level + 1) * 24}px` }}
                  />
                )}
                {renderFolder(child)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="text-red-600 text-sm">{error}</div>
        <button
          onClick={loadFolders}
          className="mt-2 text-sm text-blue-600 hover:underline"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const tree = buildTree(folders);

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Opción de carpeta raíz */}
      <div
        className={`
          flex items-center gap-2 px-3 py-2 cursor-pointer
          hover:bg-gray-100 transition-colors
          ${selectedFolderId === null ? 'bg-blue-50 border-l-4 border-blue-500' : ''}
        `}
        onClick={() => onFolderSelect && onFolderSelect(null)}
      >
        <div className="w-4 h-4" /> {/* Espaciador */}
        <Folder className="w-5 h-5 text-gray-500" />
        <span className={`flex-1 text-sm ${selectedFolderId === null ? 'font-semibold text-blue-700' : 'text-gray-700'}`}>
          Todos los Documentos
        </span>
        {showCreateButton && selectedFolderId === null && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onCreateFolder) {
                onCreateFolder(null);
              }
            }}
            className="p-1 rounded hover:bg-gray-200 transition-colors"
            title="Crear carpeta"
          >
            <Plus className="w-4 h-4 text-gray-600" />
          </button>
        )}
      </div>

      {/* Renderizar árbol de carpetas */}
      {tree.length === 0 ? (
        <div className="px-3 py-8 text-center text-sm text-gray-500">
          Aún no hay carpetas
          {showCreateButton && (
            <button
              onClick={() => onCreateFolder && onCreateFolder(null)}
              className="block mt-2 mx-auto text-blue-600 hover:underline"
            >
              Crear su primera carpeta
            </button>
          )}
        </div>
      ) : (
        <div>{tree.map((node) => renderFolder(node))}</div>
      )}
    </div>
  );
};
