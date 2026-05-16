import React, { useEffect } from 'react';
import { cn } from '../../lib/utils';
import { X } from 'lucide-react';

/**
 * Props del componente Modal.
 * @property isOpen - Controla si el modal está visible.
 * @property onClose - Función que se ejecuta al cerrar el modal.
 * @property title - Título opcional del modal.
 * @property children - Contenido del modal.
 * @property size - Tamaño del modal: sm, md, lg o xl.
 * @property showCloseButton - Indica si se muestra el botón de cerrar.
 * @property footer - Contenido opcional para el pie del modal.
 */
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
  footer?: React.ReactNode;
}

/**
 * Componente de ventana modal con soporte para cierre con tecla Escape y clic fuera.
 * @param props - Props del componente Modal.
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  footer,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={cn(
            'relative w-full rounded-2xl border border-white/10 bg-card/95 text-card-foreground shadow-[0_32px_80px_-30px_rgba(2,6,23,0.5)] backdrop-blur-xl',
            sizes[size]
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between border-b border-white/5 p-4">
              {title && (
                <h2 className="text-xl font-semibold text-foreground">{title}</h2>
              )}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  <X className="w-6 h-6" />
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div className="p-6">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="flex items-center justify-end gap-3 border-t border-white/5 p-4">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Contenedor auxiliar para el pie del modal.
 * @param props - Props del componente ModalFooter.
 */
export const ModalFooter: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>{children}</>
);
