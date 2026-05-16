import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const alertVariants = cva(
  'relative w-full rounded-xl border p-4 backdrop-blur-sm [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground',
  {
    variants: {
      variant: {
        default: 'border-border bg-white text-foreground',
        destructive:
          'border-[#fecaca] bg-[#fff1f2] text-[#881337] [&>svg]:text-[#dc2626]',
        success:
          'border-[#bbf7d0] bg-[#f0fdf4] text-[#166534] [&>svg]:text-[#16a34a]',
        warning:
          'border-[#fcd34d] bg-[#fffbeb] text-[#92400e] [&>svg]:text-[#d97706]',
        info:
          'border-[#bae6fd] bg-[#f0f9ff] text-[#0f4c81] [&>svg]:text-[#0284c7]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

/**
 * Componente de alerta que muestra un mensaje destacado con variante de estilo.
 * @param props - Propiedades del componente, incluyendo className, variant y atributos de HTMLDivElement.
 */
const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
));
Alert.displayName = 'Alert';

/**
 * Título del componente Alert.
 * @param props - Propiedades del componente, incluyendo className y atributos de HTMLHeadingElement.
 */
const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn('mb-1 font-medium leading-none tracking-tight', className)}
    {...props}
  />
));
AlertTitle.displayName = 'AlertTitle';

/**
 * Descripción del componente Alert.
 * @param props - Propiedades del componente, incluyendo className y atributos de HTMLParagraphElement.
 */
const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-sm [&_p]:leading-relaxed', className)}
    {...props}
  />
));
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertTitle, AlertDescription };
