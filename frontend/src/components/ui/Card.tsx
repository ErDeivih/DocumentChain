import React from 'react';
import { cn } from '../../lib/utils';

/**
 * Componente contenedor de tarjeta con estilos de borde y sombra.
 * @param props - Props del componente Card.
 */
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-2xl border border-border/80 bg-white text-foreground shadow-[0_18px_45px_-30px_rgba(15,23,42,0.16)]',
      className
    )}
    {...props}
  />
));
Card.displayName = 'Card';

/**
 * Encabezado del componente Card.
 * @param props - Props del componente CardHeader.
 */
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

/**
 * Título del componente Card.
 * @param props - Props del componente CardTitle.
 */
const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-2xl font-semibold leading-none tracking-tight text-foreground',
      className
    )}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

/**
 * Descripción del componente Card.
 * @param props - Props del componente CardDescription.
 */
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

/**
 * Contenido principal del componente Card.
 * @param props - Props del componente CardContent.
 */
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

/**
 * Pie del componente Card.
 * @param props - Props del componente CardFooter.
 */
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
