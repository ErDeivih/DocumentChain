import React from 'react';
import { cn } from '../../lib/utils';
import { ChevronDown } from 'lucide-react';

/**
 * Props del componente Select.
 * @property children - Opciones del selector.
 * @property className - Clases CSS adicionales.
 */
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
}

/**
 * Componente de selector desplegable con estilos personalizados.
 * @param props - Props del componente Select.
 */
const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            'flex h-11 w-full items-center justify-between rounded-xl border border-input bg-background/75 px-3 py-2 pr-8 text-sm text-foreground ring-offset-background backdrop-blur-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/60 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none',
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-muted-foreground" />
      </div>
    );
  }
);

Select.displayName = 'Select';

/**
 * Opción individual dentro del componente Select.
 * @param props - Props del componente SelectItem.
 */
const SelectItem = React.forwardRef<
  HTMLOptionElement,
  React.OptionHTMLAttributes<HTMLOptionElement>
>(({ className, ...props }, ref) => (
  <option
    ref={ref}
    className={cn('relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none', className)}
    {...props}
  />
));

SelectItem.displayName = 'SelectItem';

export { Select, SelectItem };
