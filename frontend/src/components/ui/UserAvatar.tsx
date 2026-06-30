import React from 'react';
import { Avatar, AvatarFallback } from './Avatar';
import { cn } from '../../lib/utils';

/**
 * Propiedades del componente UserAvatar.
 * @property name - Nombre del usuario del que extraer las iniciales.
 * @property size - Tamaño del avatar (xs, sm, md, lg, xl).
 * @property className - Clases CSS adicionales.
 */
interface UserAvatarProps {
    name?: string | null;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | string;
    className?: string;
}

const sizeMap: Record<string, { avatar: string; text: string }> = {
  xs: { avatar: 'h-6 w-6', text: 'text-[10px]' },
  sm: { avatar: 'h-8 w-8', text: 'text-[10px]' },
  md: { avatar: 'h-10 w-10', text: 'text-sm' },
  lg: { avatar: 'h-16 w-16', text: 'text-base' },
  xl: { avatar: 'h-24 w-24', text: 'text-lg font-semibold' },
};

const FALLBACK_GRADIENT = 'bg-[linear-gradient(135deg,#2dd4bf_0%,#0ea5e9_100%)]';
const FALLBACK_TEXT = 'text-slate-950';

/**
 * Componente que muestra un avatar circular con las iniciales del usuario.
 *
 * Utiliza un degradado corporativo como fondo y extrae las dos primeras
 * letras del nombre proporcionado. Admite varios tamaños predefinidos.
 *
 * @returns JSX.Element con el avatar del usuario.
 */
export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  size = 'md',
  className,
}) => {
  const s = sizeMap[size] || sizeMap.md;
  const initials = (name || 'U').slice(0, 2).toUpperCase();

  return (
    <Avatar className={cn(s.avatar, className)}>
      <AvatarFallback className={cn(FALLBACK_GRADIENT, FALLBACK_TEXT, s.text)}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
};
