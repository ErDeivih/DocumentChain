import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useWalletManager, SavedWallet } from './WalletManagerContext';

const ACTIVE_WALLET_STORAGE_KEY = 'activeWalletId';

function resolveDefaultWallet(savedWallets: SavedWallet[]): SavedWallet | null {
  return savedWallets.find((wallet) => wallet.isPrimary) || savedWallets[0] || null;
}

/**
 * ActiveWalletContext
 * 
 * Manages which wallet is currently "active" for viewing shared documents.
 * This is DIFFERENT from WalletManagerContext which handles signing transactions.
 * 
 * Use case: User has 3 wallets. Documents are shared with wallet #2.
 * - Primary wallet: #1 (for signing)
 * - Active wallet: #2 (for viewing shared documents)
 * 
 * User can switch active wallet in sidebar to see documents shared with each wallet.
 */
interface ActiveWalletContextType {
  // Currently active wallet for viewing shared documents
  activeWallet: SavedWallet | null;
  
  // Set which wallet is active
  setActiveWallet: (wallet: SavedWallet) => void;
  
  // Reset to primary wallet
  resetToPrimary: () => void;
}

const ActiveWalletContext = createContext<ActiveWalletContextType | undefined>(undefined);

export function ActiveWalletProvider({ children }: { children: ReactNode }) {
  const { savedWallets } = useWalletManager();
  const [activeWallet, setActiveWalletState] = useState<SavedWallet | null>(null);

  useEffect(() => {
    if (savedWallets.length === 0) {
      setActiveWalletState(null);
      sessionStorage.removeItem(ACTIVE_WALLET_STORAGE_KEY);
      return;
    }

    const storedWalletId = sessionStorage.getItem(ACTIVE_WALLET_STORAGE_KEY);
    const currentWallet = activeWallet
      ? savedWallets.find((wallet) => wallet.id === activeWallet.id)
      : null;
    const storedWallet = storedWalletId
      ? savedWallets.find((wallet) => wallet.id === storedWalletId)
      : null;
    const nextWallet = currentWallet || storedWallet || resolveDefaultWallet(savedWallets);

    if (!nextWallet) {
      setActiveWalletState(null);
      sessionStorage.removeItem(ACTIVE_WALLET_STORAGE_KEY);
      return;
    }

    if (
      !activeWallet ||
      activeWallet.id !== nextWallet.id ||
      activeWallet.isPrimary !== nextWallet.isPrimary ||
      activeWallet.label !== nextWallet.label ||
      activeWallet.walletAddress !== nextWallet.walletAddress
    ) {
      setActiveWalletState(nextWallet);
    }

    sessionStorage.setItem(ACTIVE_WALLET_STORAGE_KEY, nextWallet.id);
  }, [activeWallet, savedWallets]);

  const setActiveWallet = (wallet: SavedWallet) => {
    const nextWallet = savedWallets.find((candidate) => candidate.id === wallet.id) || wallet;
    setActiveWalletState(nextWallet);
    sessionStorage.setItem(ACTIVE_WALLET_STORAGE_KEY, nextWallet.id);
  };

  const resetToPrimary = () => {
    const primary = resolveDefaultWallet(savedWallets);
    if (primary) {
      setActiveWalletState(primary);
      sessionStorage.setItem(ACTIVE_WALLET_STORAGE_KEY, primary.id);
    }
  };

  const value: ActiveWalletContextType = {
    activeWallet,
    setActiveWallet,
    resetToPrimary,
  };

  return (
    <ActiveWalletContext.Provider value={value}>
      {children}
    </ActiveWalletContext.Provider>
  );
}

export function useActiveWallet() {
  const context = useContext(ActiveWalletContext);
  if (context === undefined) {
    throw new Error('useActiveWallet must be used within an ActiveWalletProvider');
  }
  return context;
}
