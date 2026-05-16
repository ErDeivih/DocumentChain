import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-[0.08em] transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-primary/25 bg-primary/10 text-cyan-800 hover:bg-primary/15',
        secondary:
          'border-slate-200 bg-[#f8fafc] text-slate-700 hover:bg-[#f1f5f9]',
        destructive:
          'border-error-200 bg-error-50 text-error-700 hover:bg-error-100',
        outline: 'border-border bg-white text-foreground',
        success:
          'border-success-200 bg-success-50 text-success-700 hover:bg-success-100',
        warning:
          'border-warning-200 bg-warning-50 text-warning-700 hover:bg-warning-100',
        info:
          'border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

/**
 * Props del componente Badge.
 * @property variant - Variante visual del badge.
 * @property className - Clases CSS adicionales.
 */
export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

/**
 * Componente que muestra una insignia o etiqueta con variantes de estilo.
 * @param props - Props del componente Badge.
 */
function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
