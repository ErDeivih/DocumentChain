import React from 'react';
import { cn } from '../../lib/utils';

/**
 * Props del componente Input.
 * @property label - Etiqueta que se muestra encima del campo.
 * @property helperText - Texto de ayuda que se muestra debajo del campo.
 * @property className - Clases CSS adicionales.
 */
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
}

/**
 * Componente de entrada de texto con soporte para etiqueta y texto de ayuda.
 * @param props - Props del componente Input.
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, helperText, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="mb-1.5 block text-sm font-medium uppercase tracking-[0.08em] text-muted-foreground">
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            'flex h-11 w-full rounded-xl border border-input bg-background/75 px-3 py-2 text-sm text-foreground ring-offset-background backdrop-blur-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            className
          )}
          ref={ref}
          {...props}
        />
        {helperText && (
          <p className="mt-1.5 text-sm text-muted-foreground">{helperText}</p>
        )}
    </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
