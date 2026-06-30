import { cn } from '../../lib/utils';

/**
 * Componente de esqueleto que muestra un placeholder animado mientras carga el contenido.
 *
 * Útil para indicar visualmente que una sección de la interfaz está en proceso de carga,
 * mejorando la percepción de rendimiento ante el usuario.
 *
 * @param props - Atributos HTML del contenedor `div`, incluyendo clases CSS opcionales.
 * @returns Elemento `div` con animación de pulso y fondo atenuado.
 */
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...props}
    />
  );
}

export { Skeleton };
