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
            ? 'border border-primary/20 bg-[linear-gradient(90deg,rgba(45,212,191,0.18),rgba(14,165,233,0.10))] font-medium text-white shadow-[0_10px_30px_-18px_rgba(14,165,233,0.55)]'
            : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
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
    window.dispatchEvent(new CustomEvent('folderSelected', { detail: folderId }));
  };

  return (
    <aside className="scrollbar-thin sticky top-0 h-screen w-64 overflow-y-auto border-r border-white/10 bg-[#0b1324]/88 p-4 text-slate-200 backdrop-blur-xl">
      <nav className="space-y-1">
        <div className="mb-4">
          <p className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
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
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
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
          <h3 className="mb-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Almacenamiento
          </h3>
          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-100">
                {formatBytes(storageUsed)} / 5 GB
              </span>
              <span className="text-xs text-slate-400">
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
