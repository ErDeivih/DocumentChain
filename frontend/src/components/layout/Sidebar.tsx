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
          'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
          isActive
            ? 'bg-primary/10 text-primary font-medium'
            : 'text-muted-foreground hover:bg-accent hover:text-foreground'
        )
      }
    >
      <span className="flex-shrink-0">{icon}</span>
      <span>{label}</span>
    </NavLink>
  );
};

export const Sidebar: React.FC = () => {
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
    // Despachar evento para que Documents.tsx lo escuche
    window.dispatchEvent(new CustomEvent('folderSelected', { detail: folderId }));
  };

  return (
    <aside className="w-64 bg-background border-r p-4 sticky top-0 h-screen overflow-y-auto">
      <nav className="space-y-1">
        <div className="mb-4">
          <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
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
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
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
        <div className="mt-8 pt-8 border-t">
          <h3 className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Almacenamiento
          </h3>
          <div className="px-4 py-3 bg-accent rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">
                {formatBytes(storageUsed)} / 5 GB
              </span>
              <span className="text-xs text-muted-foreground">
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
