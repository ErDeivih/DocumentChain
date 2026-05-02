import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { Separator } from '../ui/Separator';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { getUserStats } from '../../api/stats';
import { Progress } from '../ui/Progress';
import { formatBytes } from '../../lib/utils';
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

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

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

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const showFolders = location.pathname === '/app/documents';

  const { data: stats } = useQuery({
    queryKey: ['userStats'],
    queryFn: getUserStats,
    enabled: !isLoading && isAuthenticated && !user?.isAdmin,
    retry: false,
  });

  const storageQuota = 5 * 1024 * 1024 * 1024; // 5GB
  const storageUsed = stats?.stats?.storageUsed || 0;
  const storagePercentage = (storageUsed / storageQuota) * 100;

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

      {!user?.isAdmin && (
        <div className="mt-8 border-t border-border/80 pt-8">
          <h3 className="mb-3 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Almacenamiento
          </h3>
          <div className="rounded-xl border border-border bg-white px-4 py-3 shadow-[0_10px_24px_-22px_rgba(15,23,42,0.12)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-foreground">
                {formatBytes(storageUsed)} / 5 GB
              </span>
              <span className="text-xs font-semibold text-muted-foreground">
                {storagePercentage.toFixed(1)}%
              </span>
            </div>
            <Progress value={storagePercentage} className="h-2" />
          </div>
        </div>
      )}

      {/* Wallet Selector */}
      <WalletSidebar />
    </aside>
  );
};
