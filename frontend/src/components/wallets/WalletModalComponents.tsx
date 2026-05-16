import React from 'react';
import { Button } from '../ui/Button';
import { Wallet, Star, CheckCircle2, LogOut, Copy, Trash2 } from 'lucide-react';
import { truncateAddress } from '../../lib/utils';
import type { SavedWallet } from '../../contexts/WalletManagerContext';

interface ConnectedWalletBannerProps {
  address: string;
  showUseButton?: boolean;
  showChangeButton?: boolean;
  onUseThisWallet?: () => void;
  onChangeWallet?: () => void;
}

export const ConnectedWalletBanner: React.FC<ConnectedWalletBannerProps> = ({
  address,
  showUseButton = true,
  showChangeButton = true,
  onUseThisWallet,
  onChangeWallet,
}) => (
  <div className="p-3 bg-green-50 border border-green-200 rounded-lg" data-testid="connected-wallet-card">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="w-5 h-5 text-green-600" />
        <div>
          <p className="text-sm font-medium text-green-800">Wallet Conectada</p>
          <p className="text-xs font-mono text-green-600">{truncateAddress(address)}</p>
        </div>
      </div>
      {showUseButton && onUseThisWallet && (
        <Button size="sm" onClick={onUseThisWallet}>Usar esta wallet</Button>
      )}
      {showChangeButton && onChangeWallet && (
        <Button size="sm" variant="outline" onClick={onChangeWallet}>
          <LogOut className="w-4 h-4 mr-2" />
          Cambiar wallet
        </Button>
      )}
    </div>
  </div>
);

interface SavedWalletItemProps {
  wallet: SavedWallet;
  isConnected: boolean;
  onSelect: (wallet: SavedWallet) => void;
  onSetPrimary: (walletId: string, e: React.MouseEvent) => void;
  onRemove: (walletId: string, e: React.MouseEvent) => void;
  onCopyAddress: (address: string, e: React.MouseEvent) => void;
}

export const SavedWalletItem: React.FC<SavedWalletItemProps> = ({
  wallet,
  isConnected,
  onSelect,
  onSetPrimary,
  onRemove,
  onCopyAddress,
}) => (
  <div
    data-testid={`saved-wallet-${wallet.id}`}
    onClick={() => onSelect(wallet)}
    className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-accent ${
      isConnected ? 'border-green-500 bg-green-50' : 'border-border'
    }`}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Wallet className="w-5 h-5" />
          {wallet.isPrimary && <Star className="w-3 h-3 text-yellow-500 absolute -top-1 -right-1 fill-yellow-500" />}
        </div>
        <div>
          <p className="text-sm font-medium">{wallet.label || 'Sin etiqueta'}</p>
          <div className="flex items-center gap-1">
            <p className="text-xs font-mono text-muted-foreground">{truncateAddress(wallet.walletAddress)}</p>
            <button onClick={(e) => onCopyAddress(wallet.walletAddress, e)} className="p-1 hover:bg-muted rounded" title="Copiar dirección">
              <Copy className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1">
        {!wallet.isPrimary && (
          <button onClick={(e) => onSetPrimary(wallet.id, e)} className="p-2 hover:bg-muted rounded text-muted-foreground hover:text-foreground" title="Establecer como principal">
            <Star className="w-4 h-4" />
          </button>
        )}
        <button onClick={(e) => onRemove(wallet.id, e)} className="p-2 hover:bg-destructive/10 rounded text-muted-foreground hover:text-destructive" title="Eliminar wallet">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
);
