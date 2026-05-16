import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { Separator } from '../ui/Separator';
import { useAuth } from '../../contexts/AuthContext';
import { FolderTree } from '../folders/FolderTree';
import { WalletSidebar } from '../wallets/WalletSidebar';
import {
  FileText,
  Share2,
  ShieldCheck,
  LayoutDashboard,
  Folder as FolderIcon,
  Search,
} from 'lucide-react';

/**
 * Props para un elemento de navegación individual.
 */
interface NavItemProps {
  /** Ruta a la que redirige el enlace de navegación. */
  to: string;
  /** Icono que se muestra junto a la etiqueta. */
  icon: React.ReactNode;
  /** Texto descriptivo del enlace. */
  label: string;
}

/**
 * Elemento de navegación individual de la barra lateral.
 * Renderiza un enlace con estilos activos e icono asociado.
 */
const NavItem: React.FC<NavItemProps> = ({ to, icon, label }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200',
          isActive
            ? 'border border-primary/40 bg-[linear-gradient(90deg,rgba(45,212,191,0.24),rgba(14,165,233,0.16))] font-semibold text-foreground shadow-[0_12px_30px_-18px_rgba(14,165,233,0.22)]'
            : 'text-muted-foreground hover:bg-sky-50 hover:text-foreground'
        )
      }
    >
      <span className="flex-shrink-0">{icon}</span>
      <span>{label}</span>
    </NavLink>
  );
};

/**
 * Props del componente Sidebar.
 */
interface SidebarProps {
  /** Indica si la barra lateral está visible en dispositivos móviles. */
  isOpen?: boolean;
  /** Callback para cerrar la barra lateral. */
  onClose?: () => void;
}

/**
 * Barra lateral de navegación principal.
 * Incluye el menú principal de la aplicación, el árbol de carpetas
 * y el selector de wallets.
 */
export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const showFolders = location.pathname === '/app/documents' || location.pathname.startsWith('/app/documents/');

  const handleFolderSelect = (folderId: string | null) => {
    setSelectedFolder(folderId);
    window.dispatchEvent(new CustomEvent('folderSelected', { detail: folderId }));
    if (onClose) onClose();
  };

  return (
    <aside className={`scrollbar-thin fixed inset-y-0 left-0 z-30 w-64 overflow-y-auto border-r border-border/90 bg-white/96 p-4 text-foreground shadow-[18px_0_40px_-34px_rgba(15,23,42,0.14)] transition-transform duration-300 ease-in-out md:sticky md:top-0 md:h-screen md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <nav className="space-y-1">
        <div className="mb-4">
          <p className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Principal
          </p>
          {user?.isAdmin && (
            <NavItem
              to="/app/dashboard"
              icon={<LayoutDashboard className="w-5 h-5" />}
              label="Panel"
            />
          )}
          <NavItem
            to="/app/documents"
            icon={<FileText className="w-5 h-5" />}
            label="Mis Documentos"
          />
          <NavItem
            to="/app/shared"
            icon={<Share2 className="w-5 h-5" />}
            label="Compartidos Conmigo"
          />
          <NavItem
            to="/app/verify"
            icon={<ShieldCheck className="w-5 h-5" />}
            label="Verificar Documento"
          />
          <NavItem
            to="/app/blockchain"
            icon={<Search className="w-5 h-5" />}
            label="Explorador Blockchain"
          />
        </div>

        <Separator />
      </nav>

      {showFolders && (
        <div className="mt-4">
          <div className="flex items-center justify-between px-4 mb-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <FolderIcon className="w-3 h-3 inline mr-1" />
              Carpetas
            </h3>
          </div>
          <div className="max-h-64 overflow-y-auto">
            <FolderTree
              selectedFolderId={selectedFolder}
              onFolderSelect={handleFolderSelect}
            />
          </div>
        </div>
      )}

      {/* Wallet Selector */}
      <WalletSidebar />
    </aside>
  );
};
