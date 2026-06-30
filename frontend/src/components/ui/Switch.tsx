import React from 'react';
import { cn } from '../../lib/utils';

/**
 * Props del componente Switch.
 * @property checked - Estado activado o desactivado del interruptor.
 * @property onCheckedChange - Función que se ejecuta cuando cambia el estado.
 * @property className - Clases CSS adicionales.
 */
interface SwitchProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

/**
 * Componente de interruptor de palanca con estilos personalizados.
 * @param props - Props del componente Switch.
 */
const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className, checked = false, onCheckedChange, disabled, ...props }, ref) => {
    const handleClick = () => {
      if (!disabled && onCheckedChange) {
        onCheckedChange(!checked);
      }
    };

    return (
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        ref={ref}
        disabled={disabled}
        onClick={handleClick}
        className={cn(
          'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50',
          checked ? 'border-primary/30 bg-primary shadow-[0_0_14px_rgba(45,212,191,0.28)]' : 'border-white/10 bg-secondary/70',
          className
        )}
        {...props}
      >
        <span
          className={cn(
            'pointer-events-none block h-5 w-5 rounded-full bg-foreground shadow-lg ring-0 transition-transform',
            checked ? 'translate-x-5' : 'translate-x-0'
          )}
        />
      </button>
    );
  }
);

Switch.displayName = 'Switch';

export { Switch };
