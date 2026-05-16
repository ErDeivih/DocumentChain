import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { UserAvatar } from '../ui/UserAvatar';
import { Separator } from '../ui/Separator';
import {
  Menu,
  X,
  LogOut,
  Settings,
  Bell,
  Lock,
  LogIn,
  UserPlus,
} from 'lucide-react';

/**
 * Props del componente Header.
 */
interface HeaderProps {
  /** Callback para alternar la visibilidad del menú en dispositivos móviles. */
  onMenuToggle?: () => void;
}

/**
 * Encabezado principal de la aplicación.
 * Muestra el logo, la información del usuario autenticado, notificaciones,
 * accesos rápidos a ajustes y cierre de sesión, así como el menú de navegación móvil.
 */
export const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/90 bg-white/96 text-foreground shadow-[0_18px_38px_-28px_rgba(15,23,42,0.16)] supports-[backdrop-filter]:bg-white/92">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[linear-gradient(135deg,#2dd4bf_0%,#0ea5e9_100%)] p-2 shadow-[0_0_22px_rgba(45,212,191,0.28)]">
              <Lock className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">DocumentChain</h1>
              <p className="hidden text-xs font-medium text-muted-foreground sm:block">
                Gestión de Documentos Blockchain
              </p>
            </div>
          </div>

          {/* Menú de Usuario */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <div className="hidden md:flex items-center gap-3">
                  <UserAvatar name={user?.username} avatarUrl={user?.avatarUrl} />
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">{user?.username}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  {user?.isAdmin && (
                    <Badge variant="default">
                      Admin
                    </Badge>
                  )}
                </div>

                {/* Menú Escritorio */}
                <div className="hidden md:flex items-center gap-2">
                  <Link to="/app/notifications">
                    <Button variant="ghost" size="sm" aria-label="Notificaciones" data-testid="header-notifications-btn">
                      <Bell className="w-4 h-4" />
                    </Button>
                  </Link>

                  {/* Ajustes */}
                  <Link to="/app/settings">
                    <Button variant="ghost" size="sm" data-testid="header-settings-btn">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </Link>

                  {/* Cerrar Sesión */}
                  <Button variant="ghost" size="sm" onClick={handleLogout}>
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </>
            ) : (
              /* Menú Público */
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    <LogIn className="w-4 h-4 mr-2" />
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Registrarse
                  </Button>
                </Link>
              </div>
            )}

            {/* Botón Menú Móvil */}
            {isAuthenticated ? (
              <button
                className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:hidden"
                onClick={() => onMenuToggle?.()}
                aria-label="Abrir menú de navegación"
              >
                <Menu className="w-6 h-6" />
              </button>
            ) : (
              <button
                className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            )}
          </div>
        </div>

        {/* Menú Móvil */}
        {isMenuOpen && (
          <div className="md:hidden py-4">
            <Separator className="mb-4" />
            <div className="space-y-3">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white/82 px-3 py-2 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.16)]">
                    <UserAvatar name={user?.username} avatarUrl={user?.avatarUrl} />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">{user?.username}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                    {user?.isAdmin && (
                      <Badge variant="default">
                        Admin
                      </Badge>
                    )}
                  </div>

                  {/* Ajustes Móvil */}
                  <Link to="/app/settings" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      <Settings className="w-4 h-4 mr-2" />
                      Ajustes
                    </Button>
                  </Link>

                  {/* Cerrar Sesión Móvil */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Cerrar Sesión
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      <LogIn className="w-4 h-4 mr-2" />
                      Iniciar Sesión
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                    <Button size="sm" className="w-full justify-start">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Registrarse
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
