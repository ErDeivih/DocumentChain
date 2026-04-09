import React, { useState, useEffect } from 'react';
import { Tag, ChevronDown } from 'lucide-react';
import { Category } from '../../types';
import { getCategories } from '../../api/categories';

interface CategorySelectorProps {
  value: string | null;
  onChange: (categoryId: string | null) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  showPredefinedOnly?: boolean;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  value,
  onChange,
  label = 'Categoría',
  placeholder = 'Seleccione una categoría',
  disabled = false,
  showPredefinedOnly = false,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, [showPredefinedOnly]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await getCategories();
      const filtered = showPredefinedOnly 
        ? data.categories.filter(c => c.isPredefined)
        : data.categories;
      setCategories(filtered.filter(c => c.isActive));
    } catch (err) {
      console.error('Error al cargar categorías:', err);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = categories.find((c) => c.id === value);

  // Group categories
  const predefinedCategories = categories.filter((c) => c.isPredefined);
  const customCategories = categories.filter((c) => !c.isPredefined);

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
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
            border border-gray-300 rounded-lg 
            focus:outline-none focus:ring-2 focus:ring-blue-500
            appearance-none bg-white
            ${disabled || loading ? 'bg-gray-100 cursor-not-allowed' : ''}
          `}
        >
          <option value="">
            {loading ? 'Cargando categorías...' : placeholder}
          </option>
          
          {predefinedCategories.length > 0 && (
            <optgroup label="Categorías del Sistema">
              {predefinedCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </optgroup>
          )}
          
          {customCategories.length > 0 && (
            <optgroup label="Categorías Personalizadas">
              {customCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </optgroup>
          )}
        </select>

        {/* Icono de etiqueta */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <Tag 
            className="w-5 h-5" 
            style={{ color: selectedCategory?.color || '#6B7280' }}
          />
        </div>

        {/* Icono de desplegable */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      {selectedCategory && (
        <div className="flex items-center gap-2 mt-1">
          <div
            className="px-2 py-1 rounded-md text-xs font-medium text-white"
            style={{ backgroundColor: selectedCategory.color || '#6B7280' }}
          >
            {selectedCategory.name}
          </div>
          {selectedCategory.description && (
            <span className="text-xs text-gray-500">
              {selectedCategory.description}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
