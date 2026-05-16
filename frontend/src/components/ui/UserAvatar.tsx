import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from './Avatar';
import { cn } from '../../lib/utils';

/**
 * Props del componente UserAvatar.
 */
interface UserAvatarProps {
  /** Nombre para generar las iniciales. */
  name?: string | null;
  /** URL del avatar (si existe). */
  avatarUrl?: string | null;
  /** Tamaño del avatar (clases Tailwind). Por defecto: 'h-10 w-10'. */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | string;
  /** Clases adicionales. */
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

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  avatarUrl,
  size = 'md',
  className,
}) => {
  const s = sizeMap[size] || sizeMap.md;
  const initials = (name || 'U').slice(0, 2).toUpperCase();

  return (
    <Avatar className={cn(s.avatar, className)}>
      {avatarUrl ? <AvatarImage src={avatarUrl} alt={name || ''} /> : null}
      <AvatarFallback className={cn(FALLBACK_GRADIENT, FALLBACK_TEXT, s.text)}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
};
