import React from 'react';
import { useWalletManager } from '../../contexts/WalletManagerContext';
import { useActiveWallet } from '../../contexts/ActiveWalletContext';
import { cn } from '../../lib/utils';
import { Star, Wallet, Plus } from 'lucide-react';
import { Button } from '../ui/Button';
import { useNavigate } from 'react-router-dom';

/**
 * WalletSidebar Component
 * 
 * Displays list of user's wallets in sidebar.
 * Allows quick switching between wallets to view documents shared with each wallet.
 * 
 * Visual indicators:
 * - Primary wallet: Star icon (green)
 * - Active wallet: Green border + checkmark
 * - Other wallets: Click to activate
 */
export const WalletSidebar: React.FC = () => {
  const { savedWallets, canAddWallet } = useWalletManager();
  const { activeWallet, setActiveWallet } = useActiveWallet();
  const navigate = useNavigate();

  if (savedWallets.length === 0) {
    return null;
  }

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleWalletClick = (wallet: typeof savedWallets[0]) => {
    setActiveWallet(wallet);
  };

  const handleAddWallet = () => {
    navigate('/app/settings?tab=wallets');
  };

  return (
    <div className="mt-6 pt-6 border-t">
      <div className="flex items-center justify-between mb-3">
        <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Mis Wallets
        </p>
        {canAddWallet && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAddWallet}
            className="h-6 w-6 p-0 hover:bg-accent"
            title="Añadir wallet"
          >
            <Plus className="h-3 w-3" />
          </Button>
        )}
      </div>

      <div className="space-y-1">
        {savedWallets.map((wallet) => {
          const isActive = activeWallet?.id === wallet.id;
          
          return (
            <button
              key={wallet.id}
              onClick={() => handleWalletClick(wallet)}
              className={cn(
                'w-full px-3 py-2.5 rounded-lg transition-all text-left',
                'flex items-center gap-2.5',
                isActive
                  ? 'bg-primary/10 border-2 border-primary'
                  : 'hover:bg-accent border-2 border-transparent'
              )}
            >
              {/* Wallet Icon */}
              <div
                className={cn(
                  'p-1.5 rounded-full shrink-0',
                  isActive ? 'bg-primary/20' : 'bg-accent'
                )}
              >
                <Wallet className={cn('w-3.5 h-3.5', isActive ? 'text-primary' : 'text-muted-foreground')} />
              </div>

              {/* Wallet Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  {wallet.isPrimary && (
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500 shrink-0" />
                  )}
                  <p
                    className={cn(
                      'text-xs font-medium truncate',
                      isActive ? 'text-primary' : 'text-foreground'
                    )}
                  >
                    {wallet.label || 'Wallet sin nombre'}
                  </p>
                </div>
                <p className="text-[10px] text-muted-foreground font-mono">
                  {shortenAddress(wallet.walletAddress)}
                </p>
              </div>

              {/* Active Indicator */}
              {isActive && (
                <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Info Text */}
      <p className="px-4 mt-3 text-[10px] text-muted-foreground">
        Click en una wallet para ver sus documentos compartidos
      </p>
    </div>
  );
};
