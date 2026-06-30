import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-xl text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow-[0_12px_30px_-14px_rgba(45,212,191,0.85)] hover:bg-primary/90 hover:shadow-[0_18px_44px_-18px_rgba(45,212,191,0.95)]',
        primary: 'bg-primary text-primary-foreground shadow-[0_12px_30px_-14px_rgba(45,212,191,0.85)] hover:bg-primary/90 hover:shadow-[0_18px_44px_-18px_rgba(45,212,191,0.95)]',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-border/80 bg-white/78 text-foreground backdrop-blur-sm hover:border-primary/60 hover:bg-primary/5 hover:text-foreground',
        secondary: 'border border-border/80 bg-secondary/88 text-secondary-foreground shadow-[0_10px_26px_-18px_rgba(15,23,42,0.18)] hover:bg-secondary',
        ghost: 'text-muted-foreground hover:bg-secondary/45 hover:text-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

/**
 * Props del componente Button.
 * @property variant - Variante visual del botón.
 * @property size - Tamaño del botón.
 * @property asChild - Si se debe renderizar como elemento hijo.
 * @property isLoading - Indica si el botón está en estado de carga.
 * @property className - Clases CSS adicionales.
 */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

/**
 * Componente de botón con múltiples variantes, tamaños y soporte para estado de carga.
 * @param props - Props del componente Button.
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, disabled, children, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className="mr-2 h-4 w-4 animate-spin"
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
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
