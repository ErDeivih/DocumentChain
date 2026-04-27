import React, { useState, useEffect } from 'react';
import { Tag } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Category } from '../../types';
import { createCategory, updateCategory } from '../../api/categories';

interface CreateCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (category: Category) => void;
  editCategory?: Category | null;
}

const CATEGORY_COLORS = [
  { value: '#DC2626', label: 'Rojo' },
  { value: '#16A34A', label: 'Verde' },
  { value: '#2563EB', label: 'Azul' },
  { value: '#7C3AED', label: 'Púrpura' },
  { value: '#0891B2', label: 'Cian' },
  { value: '#DB2777', label: 'Rosa' },
  { value: '#EA580C', label: 'Naranja' },
  { value: '#F59E0B', label: 'Ámbar' },
  { value: '#6B7280', label: 'Gris' },
  { value: '#14B8A6', label: 'Verde Azulado' },
  { value: '#8B5CF6', label: 'Violeta' },
  { value: '#EC4899', label: 'Fucsia' },
];

export const CreateCategoryModal: React.FC<CreateCategoryModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editCategory = null,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(CATEGORY_COLORS[0].value);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = !!editCategory;

  useEffect(() => {
    if (isOpen) {
      if (editCategory) {
        setName(editCategory.name);
        setDescription(editCategory.description || '');
        setColor(editCategory.color || CATEGORY_COLORS[0].value);
      } else {
        setName('');
        setDescription('');
        setColor(CATEGORY_COLORS[0].value);
      }
      setError(null);
    }
  }, [isOpen, editCategory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('El nombre de la categoría es requerido');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let result: { category: Category };
      if (isEditMode && editCategory) {
        // Can only edit custom categories
        if (editCategory.isPredefined) {
          setError('No se pueden editar las categorías del sistema');
          setLoading(false);
          return;
        }
        result = await updateCategory(editCategory.id, {
          name: name.trim(),
          description: description.trim() || undefined,
          color,
        });
      } else {
        result = await createCategory({
          name: name.trim(),
          description: description.trim() || undefined,
          color,
        });
      }

      if (onSuccess) {
        onSuccess(result.category);
      }
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || `Error al ${isEditMode ? 'actualizar' : 'crear'} la categoría`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={isEditMode ? 'Editar Categoría' : 'Crear Nueva Categoría'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {isEditMode && editCategory?.isPredefined && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm">
            Las categorías del sistema no pueden ser editadas ni eliminadas.
          </div>
        )}

        <Input
          label="Nombre de Categoría"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ingrese nombre de la categoría"
          required
          disabled={loading || (isEditMode && editCategory?.isPredefined)}
        />

        <div>
          <label className="mb-1 block text-sm font-medium uppercase tracking-[0.08em] text-muted-foreground">
            Descripción (opcional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ingrese descripción de la categoría"
            rows={3}
            disabled={loading || (isEditMode && editCategory?.isPredefined)}
            className="w-full rounded-xl border border-input bg-background/75 px-3 py-2 text-foreground backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium uppercase tracking-[0.08em] text-muted-foreground">
            Color
          </label>
          <div className="grid grid-cols-6 gap-2">
            {CATEGORY_COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setColor(c.value)}
                disabled={loading || (isEditMode && editCategory?.isPredefined)}
                className={`
                  w-full h-10 rounded-lg border-2 transition-all
                  ${color === c.value ? 'border-foreground scale-105 shadow-md' : 'border-white/10'}
                  ${loading || (isEditMode && editCategory?.isPredefined) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
                `}
                style={{ backgroundColor: c.value }}
                title={c.label}
              />
            ))}
          </div>
        </div>

        {/* Vista previa */}
        <div className="rounded-xl border border-white/10 bg-secondary/40 p-4">
          <p className="mb-2 text-xs uppercase tracking-[0.08em] text-muted-foreground">Vista previa</p>
          <div className="flex items-center gap-2">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md font-medium text-white"
              style={{ backgroundColor: color }}
            >
              <Tag className="w-4 h-4" />
              <span>{name || 'Categoría Sin Título'}</span>
            </div>
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
          <Button 
            type="submit" 
            isLoading={loading}
            disabled={isEditMode && editCategory?.isPredefined}
          >
            {isEditMode ? 'Actualizar Categoría' : 'Crear Categoría'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
