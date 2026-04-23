import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { getUnreadCount } from '../../api/notifications';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Avatar, AvatarFallback } from '../ui/Avatar';
import { Separator } from '../ui/Separator';
import {
  Menu,
  X,
  LogOut,
  Settings,
  Lock,
  Bell,
} from 'lucide-react';

export const Header: React.FC = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { data: unreadData } = useQuery({
    queryKey: ['unreadNotifications'],
    queryFn: getUnreadCount,
    enabled: !isLoading && isAuthenticated,
    retry: false,
    refetchInterval: 30000,
  });

  const unreadNotifications = unreadData?.count || 0;

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-background border-b sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-lg">
              <Lock className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">DocumentChain</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Gestión de Documentos Blockchain
              </p>
            </div>
          </div>

          {/* Menú de Usuario */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3">
              <Avatar>
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user?.username?.slice(0, 2).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">{user?.username}</p>
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
              {/* Notificaciones */}
              <Link to="/app/notifications">
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="w-4 h-4" />
                  {unreadNotifications > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                    >
                      {unreadNotifications}
                    </Badge>
                  )}
                </Button>
              </Link>

              {/* Ajustes */}
              <Link to="/app/settings">
                <Button variant="ghost" size="sm">
                  <Settings className="w-4 h-4" />
                </Button>
              </Link>
              
              {/* Cerrar Sesión */}
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>

            {/* Botón Menú Móvil */}
            <button
              className="md:hidden p-2 rounded-md text-muted-foreground hover:bg-accent"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Menú Móvil */}
        {isMenuOpen && (
          <div className="md:hidden py-4">
            <Separator className="mb-4" />
            <div className="space-y-3">
              <div className="flex items-center gap-3 px-3 py-2 bg-accent rounded-md">
                <Avatar>
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {user?.username?.slice(0, 2).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{user?.username}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                {user?.isAdmin && (
                  <Badge variant="default">
                    Admin
                  </Badge>
                )}
              </div>

              {/* Notificaciones Móvil */}
              <Link to="/app/notifications" onClick={() => setIsMenuOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full justify-start relative">
                  <Bell className="w-4 h-4 mr-2" />
                  Notificaciones
                  {unreadNotifications > 0 && (
                    <Badge variant="destructive" className="ml-auto h-5 px-2 text-xs">
                      {unreadNotifications}
                    </Badge>
                  )}
                </Button>
              </Link>

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
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
