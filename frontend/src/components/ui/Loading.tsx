import React from 'react';
import { cn } from '../../lib/utils';

/**
 * Props del componente Loading.
 * @property size - Tamaño del indicador de carga: sm, md, lg o xl.
 * @property text - Texto opcional que se muestra debajo del spinner.
 * @property fullScreen - Si se debe mostrar en pantalla completa con fondo oscuro.
 */
export interface LoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  fullScreen?: boolean;
}

/**
 * Componente que muestra un indicador de carga animado.
 * @param props - Props del componente Loading.
 */
export const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  text,
  fullScreen = false,
}) => {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <svg
        className={cn('animate-spin text-primary', sizes[size])}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      {text && <p className="text-muted-foreground text-sm">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md">
        {spinner}
      </div>
    );
  }

  return spinner;
};

/**
 * Componente que muestra una superposición de carga sobre su contenedor padre.
 * @param props - Props del componente LoadingOverlay.
 */
export const LoadingOverlay: React.FC<{ show: boolean; text?: string }> = ({ show, text }) => {
  if (!show) return null;

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-slate-950/60 backdrop-blur-sm">
      <Loading size="lg" text={text} />
    </div>
  );
};
