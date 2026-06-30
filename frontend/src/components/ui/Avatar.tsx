import React from 'react';
import { cn } from '../../lib/utils';

/**
 * Props del componente Avatar.
 * @property className - Clases CSS adicionales.
 */
interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Contenedor de imagen de avatar con forma circular.
 * @param props - Props del componente Avatar.
 */
const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full',
        className
      )}
      {...props}
    />
  )
);
Avatar.displayName = 'Avatar';

/**
 * Props del componente AvatarImage.
 * @property className - Clases CSS adicionales.
 */
interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

/**
 * Imagen dentro del componente Avatar.
 * @param props - Props del componente AvatarImage.
 */
const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ className, ...props }, ref) => (
    <img
      ref={ref}
      className={cn('aspect-square h-full w-full', className)}
      {...props}
    />
  )
);
AvatarImage.displayName = 'AvatarImage';

/**
 * Props del componente AvatarFallback.
 * @property className - Clases CSS adicionales.
 */
interface AvatarFallbackProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Contenido alternativo que se muestra cuando la imagen del avatar no está disponible.
 * @param props - Props del componente AvatarFallback.
 */
const AvatarFallback = React.forwardRef<HTMLDivElement, AvatarFallbackProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex h-full w-full items-center justify-center rounded-full bg-muted text-sm font-medium',
        className
      )}
      {...props}
    />
  )
);
AvatarFallback.displayName = 'AvatarFallback';

export { Avatar, AvatarImage, AvatarFallback };
