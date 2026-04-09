import React from 'react';
import { Tag, X } from 'lucide-react';
import { Category } from '../../types';

interface CategoryBadgeProps {
  category: Category;
  size?: 'sm' | 'md' | 'lg';
  removable?: boolean;
  onRemove?: () => void;
  onClick?: () => void;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  category,
  size = 'md',
  removable = false,
  onRemove,
  onClick,
}) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove();
    }
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-md font-medium
        ${sizeClasses[size]}
        ${onClick ? 'cursor-pointer hover:opacity-80' : ''}
        transition-opacity
      `}
      style={{
        backgroundColor: category.color || '#6B7280',
        color: '#FFFFFF',
      }}
      onClick={handleClick}
    >
      <Tag className={iconSizes[size]} />
      <span>{category.name}</span>
      {removable && (
        <button
          onClick={handleRemove}
          className="ml-1 hover:bg-black/10 rounded-full p-0.5 transition-colors"
          title="Eliminar categoría"
        >
          <X className={iconSizes[size]} />
        </button>
      )}
    </span>
  );
};

interface CategoryBadgeListProps {
  categories: Category[];
  size?: 'sm' | 'md' | 'lg';
  removable?: boolean;
  onRemove?: (categoryId: string) => void;
  onClick?: (category: Category) => void;
  maxDisplay?: number;
}

export const CategoryBadgeList: React.FC<CategoryBadgeListProps> = ({
  categories,
  size = 'md',
  removable = false,
  onRemove,
  onClick,
  maxDisplay,
}) => {
  const displayCategories = maxDisplay 
    ? categories.slice(0, maxDisplay)
    : categories;
  const remainingCount = maxDisplay && categories.length > maxDisplay
    ? categories.length - maxDisplay
    : 0;

  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {displayCategories.map((category) => (
        <CategoryBadge
          key={category.id}
          category={category}
          size={size}
          removable={removable}
          onRemove={onRemove ? () => onRemove(category.id) : undefined}
          onClick={onClick ? () => onClick(category) : undefined}
        />
      ))}
      {remainingCount > 0 && (
        <span className="text-sm text-gray-500">
          +{remainingCount} más
        </span>
      )}
    </div>
  );
};
