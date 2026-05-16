import React, { useState, useEffect } from 'react';
import { Folder } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/Dialog';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Folder as FolderType } from '../../types';
import { createFolder, updateFolder, getFolders } from '../../api/folders';

/**
 * Props del componente CreateFolderModal.
 */
interface CreateFolderModalProps {
  /** Controla la visibilidad del modal. */
  isOpen: boolean;
  /** Callback para cerrar el modal. */
  onClose: () => void;
  /** Callback que se ejecuta tras crear o actualizar una carpeta exitosamente. */
  onSuccess?: (folder: FolderType) => void;
  /** Identificador de la carpeta padre. */
  parentId?: string | null;
  /** Carpeta padre seleccionada. */
  parentFolder?: FolderType | null;
  /** Carpeta en modo edición, si aplica. */
  editFolder?: FolderType | null;
}

/** Paleta de colores disponibles para las carpetas. */
const FOLDER_COLORS = [
  { value: '#3B82F6', label: 'Azul' },
  { value: '#10B981', label: 'Verde' },
  { value: '#F59E0B', label: 'Naranja' },
  { value: '#EF4444', label: 'Rojo' },
  { value: '#8B5CF6', label: 'Púrpura' },
  { value: '#EC4899', label: 'Rosa' },
  { value: '#6366F1', label: 'Índigo' },
  { value: '#14B8A6', label: 'Verde Azulado' },
  { value: '#6B7280', label: 'Gris' },
];

/**
 * Modal para crear o editar carpetas.
 * Permite definir nombre, descripción, color y carpeta padre.
 */
export const CreateFolderModal: React.FC<CreateFolderModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  parentId = null,
  parentFolder = null,
  editFolder = null,
}) => {
  const activeParentId = parentId || parentFolder?.id || null;
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(FOLDER_COLORS[0].value);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(activeParentId);
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = !!editFolder;

  useEffect(() => {
    if (isOpen) {
      loadFolders();
      if (editFolder) {
        setName(editFolder.name);
        setDescription(editFolder.description || '');
        setColor(editFolder.color || FOLDER_COLORS[0].value);
        setSelectedParentId(editFolder.parentId);
      } else {
        setName('');
        setDescription('');
        setColor(FOLDER_COLORS[0].value);
        setSelectedParentId(activeParentId);
      }
      setError(null);
    }
  }, [isOpen, editFolder, activeParentId]);

  const loadFolders = async () => {
    try {
      const data = await getFolders();
      setFolders(data.folders);
    } catch (err) {
      console.error('Error al cargar carpetas:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('El nombre de la carpeta es requerido');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let result: { folder: FolderType };
      if (isEditMode && editFolder) {
        result = await updateFolder(editFolder.id, {
          name: name.trim(),
          description: description.trim() || undefined,
          color,
          parentId: selectedParentId || undefined,
        });
      } else {
        result = await createFolder({
          name: name.trim(),
          description: description.trim() || undefined,
          color,
          parentId: selectedParentId || undefined,
        });
      }

      if (onSuccess) {
        onSuccess(result.folder);
      }

      window.dispatchEvent(new CustomEvent('foldersChanged', {
        detail: {
          action: isEditMode ? 'updated' : 'created',
          folder: result.folder,
        },
      }));

      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || `Error al ${isEditMode ? 'actualizar' : 'crear'} la carpeta`);
    } finally {
      setLoading(false);
    }
  };

  // Filter out current folder and its descendants when editing
  const getAvailableFolders = (): FolderType[] => {
    if (!isEditMode || !editFolder) {
      return folders;
    }

    const isDescendant = (folderId: string, ancestorId: string): boolean => {
      const folder = folders.find((f) => f.id === folderId);
      if (!folder) return false;
      if (folder.id === ancestorId) return true;
      if (folder.parentId) {
        return isDescendant(folder.parentId, ancestorId);
      }
      return false;
    };

    return folders.filter(
      (f) => f.id !== editFolder.id && !isDescendant(f.id, editFolder.id)
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Editar Carpeta' : 'Crear Nueva Carpeta'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <Input
          label="Nombre de Carpeta"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ingrese nombre de la carpeta"
          required
          disabled={loading}
          data-testid="folder-name-input"
        />

        <div>
          <label className="mb-1 block text-sm font-medium uppercase tracking-[0.08em] text-muted-foreground">
            Descripción (opcional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ingrese descripción de la carpeta"
            rows={3}
            disabled={loading}
            data-testid="folder-description-input"
            className="w-full rounded-xl border border-input bg-background/75 px-3 py-2 text-foreground backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium uppercase tracking-[0.08em] text-muted-foreground">
            Color
          </label>
          <div className="grid grid-cols-9 gap-2">
            {FOLDER_COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setColor(c.value)}
                disabled={loading}
                className={`
                  w-8 h-8 rounded-full border-2 transition-all
                  ${color === c.value ? 'border-foreground scale-110' : 'border-white/10'}
                `}
                style={{ backgroundColor: c.value }}
                title={c.label}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium uppercase tracking-[0.08em] text-muted-foreground">
            Carpeta Padre (opcional)
          </label>
          <select
            value={selectedParentId || ''}
            onChange={(e) => setSelectedParentId(e.target.value || null)}
            disabled={loading}
            className="w-full rounded-xl border border-input bg-background/75 px-3 py-2 text-foreground backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
          >
            <option value="">Ninguna (Nivel raíz)</option>
            {getAvailableFolders().map((folder) => (
              <option key={folder.id} value={folder.id}>
                {folder.name}
              </option>
            ))}
          </select>
        </div>

        {/* Vista previa */}
        <div className="rounded-xl border border-white/10 bg-secondary/40 p-4">
          <p className="mb-2 text-xs uppercase tracking-[0.08em] text-muted-foreground">Vista previa</p>
          <div className="flex items-center gap-2">
            <Folder className="w-5 h-5" style={{ color }} />
            <span className="font-medium text-foreground">{name || 'Carpeta Sin Título'}</span>
          </div>
          {description && (
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          )}
        </div>

        <div className="flex gap-2 justify-end pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button type="submit" isLoading={loading}>
            {isEditMode ? 'Actualizar Carpeta' : 'Crear Carpeta'}
          </Button>
        </div>
      </form>
      </DialogContent>
    </Dialog>
  );
};
