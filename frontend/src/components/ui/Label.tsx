import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

/**
 * Variantes de estilo para el componente Label, generadas mediante `class-variance-authority`.
 * Aplica tipografía, color de texto y estados de accesibilidad para elementos asociados.
 */
const labelVariants = cva(
  'text-sm font-medium leading-none text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
);

/**
 * Componente de etiqueta para formularios.
 * @param props - Props del componente Label.
 */
const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement> & VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
));

Label.displayName = 'Label';

export { Label };
