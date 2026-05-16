import React from 'react';
import { cn } from '../../lib/utils';

/**
 * Props del componente Separator.
 * @property orientation - Orientación del separador: horizontal o vertical.
 * @property decorative - Indica si el separador es decorativo o semántico.
 * @property className - Clases CSS adicionales.
 */
interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  decorative?: boolean;
}

/**
 * Componente que renderiza una línea divisoria horizontal o vertical.
 * @param props - Props del componente Separator.
 */
const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  ({ className, orientation = 'horizontal', decorative = true, ...props }, ref) => (
    <div
      ref={ref}
      role={decorative ? 'none' : 'separator'}
      aria-orientation={orientation}
      className={cn(
        'shrink-0 bg-border',
        orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
        className
      )}
      {...props}
    />
  )
);

Separator.displayName = 'Separator';

export { Separator };
