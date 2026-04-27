import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-[0.08em] transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-primary/20 bg-primary/15 text-primary-300 hover:bg-primary/25',
        secondary:
          'border-white/10 bg-secondary/60 text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-error-700/30 bg-error-900/20 text-error-200 hover:bg-error-900/30',
        outline: 'border-white/15 bg-transparent text-foreground',
        success:
          'border-success-700/30 bg-success-900/20 text-success-200 hover:bg-success-900/30',
        warning:
          'border-warning-700/30 bg-warning-900/20 text-warning-200 hover:bg-warning-900/30',
        info:
          'border-blockchain-700/30 bg-blockchain-900/20 text-blockchain-200 hover:bg-blockchain-900/30',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
