import React from 'react';
import { cn } from '../../lib/utils';

/**
 * Props del componente Progress.
 * @property value - Valor actual del progreso.
 * @property max - Valor máximo del progreso.
 * @property className - Clases CSS adicionales.
 */
interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
}

/**
 * Componente que muestra una barra de progreso con valor animado.
 * @param props - Props del componente Progress.
 */
const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        className={cn(
          'relative h-4 w-full overflow-hidden rounded-full bg-secondary',
          className
        )}
        {...props}
      >
        <div
          className="h-full w-full flex-1 bg-[linear-gradient(90deg,#2dd4bf_0%,#0ea5e9_100%)] shadow-[0_0_18px_rgba(14,165,233,0.28)] transition-all duration-300 ease-in-out"
          style={{ transform: `translateX(-${100 - percentage}%)` }}
        />
      </div>
    );
  }
);

Progress.displayName = 'Progress';

export { Progress };
