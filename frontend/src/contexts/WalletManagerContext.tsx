import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { blockchainProvider, WalletType } from '../lib/blockchain/provider';
import { walletsApi } from '../api/wallets';
import { useAuth } from './AuthContext';
import type { User, Wallet } from '../types';

/**
 * Saved wallet from database
 */
export interface SavedWallet {
  id: string;
  walletAddress: string;
  label: string | null;
  isPrimary: boolean;
  addedAt: string;
  lastUsedAt: string;
}

/**
 * Connected wallet state
 */
export interface ConnectedWallet {
  address: string;
  chainId: number;
  type: WalletType;
}

interface WalletManagerContextType {
  // Saved wallets (from database, max 5)
  savedWallets: SavedWallet[];
  
  // Currently connected wallet (for signing transactions)
  connectedWallet: ConnectedWallet | null;
  
  // Loading states
  isLoading: boolean;
  isConnecting: boolean;
  
  // Error state
  error: string | null;
  
  // Actions
  loadSavedWallets: () => Promise<void>;
  connectWallet: (type: WalletType, provider?: unknown) => Promise<ConnectedWallet>;
  disconnectWallet: () => void;
  addWallet: (label?: string) => Promise<SavedWallet>;
  removeWallet: (walletId: string) => Promise<void>;
  setPrimaryWallet: (walletId: string) => Promise<void>;
  
  // Helpers
  canAddWallet: boolean;
  getWalletByAddress: (address: string) => SavedWallet | undefined;
  isWalletSaved: (address: string) => boolean;
}

const WalletManagerContext = createContext<WalletManagerContextType | undefined>(undefined);

const MAX_WALLETS_PER_USER = 5;

/**
 * Convert Wallet type to SavedWallet
 */
function walletToSavedWallet(wallet: Wallet): SavedWallet {
  return {
    id: wallet.id,
    walletAddress: wallet.address,
    label: wallet.label,
    isPrimary: wallet.isPrimary,
    addedAt: new Date().toISOString(), // Default if not provided
    lastUsedAt: new Date().toISOString() // Default if not provided
  };
}

function sortSavedWallets(wallets: SavedWallet[]): SavedWallet[] {
  return [...wallets].sort((left, right) => {
    if (left.isPrimary !== right.isPrimary) {
      return left.isPrimary ? -1 : 1;
    }

    const leftLabel = left.label?.trim() || left.walletAddress;
    const rightLabel = right.label?.trim() || right.walletAddress;
    return leftLabel.localeCompare(rightLabel, 'es', { sensitivity: 'base' });
  });
}

function savedWalletsToSessionWallets(savedWallets: SavedWallet[]): NonNullable<User['wallets']> {
  return savedWallets.map((wallet) => ({
    id: wallet.id,
    address: wallet.walletAddress,
    label: wallet.label,
    isPrimary: wallet.isPrimary,
  }));
}

/**
 * WalletManagerProvider
 * 
 * Manages user's wallets for signing blockchain transactions.
 * - Users can have up to 5 saved wallets
 * - Wallets are ONLY for transactions, NOT for authentication
 * - Connect wallet on-demand when signing is required
 */
export function WalletManagerProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, patchUserSession } = useAuth();
  
  const [savedWallets, setSavedWallets] = useState<SavedWallet[]>([]);
  const [connectedWallet, setConnectedWallet] = useState<ConnectedWallet | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Keep a ref to the latest user so loadSavedWallets can read it without
  // being recreated on every user-object change (which would re-trigger effects).
  const userRef = useRef(user);
  userRef.current = user;

  const syncUserWallets = useCallback((nextSavedWallets: SavedWallet[]) => {
    const primaryWallet = nextSavedWallets.find((wallet) => wallet.isPrimary);
    patchUserSession({
      wallets: savedWalletsToSessionWallets(nextSavedWallets),
      walletAddress: primaryWallet?.walletAddress,
    });
  }, [patchUserSession]);

  // Load saved wallets when the authenticated identity changes.
  // Depend only on user?.id (not the full user object) so that
  // patchUserSession → wallet list update does NOT re-trigger this effect
  // and cause an infinite request loop.
  useEffect(() => {
    if (isAuthenticated && userRef.current) {
      const currentUser = userRef.current;
      if (currentUser.wallets && currentUser.wallets.length > 0) {
        setSavedWallets(sortSavedWallets(currentUser.wallets.map(walletToSavedWallet)));
      }

      if (!currentUser.isSuspended) {
        loadSavedWallets();
      }
    } else {
      setSavedWallets([]);
      setConnectedWallet(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.id]);

  // Listen for wallet disconnection events
  useEffect(() => {
    const handleDisconnect = () => {
      setConnectedWallet(null);
    };

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        setConnectedWallet(null);
      }
    };

    blockchainProvider.on('disconnect', handleDisconnect);
    blockchainProvider.on('accountsChanged', handleAccountsChanged);

    return () => {
      blockchainProvider.off('disconnect', handleDisconnect);
      blockchainProvider.off('accountsChanged', handleAccountsChanged);
    };
  }, []);

  /**
   * Load saved wallets from database
   */
  const loadSavedWallets = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await walletsApi.list();
      const saved = sortSavedWallets(response.wallets.map(walletToSavedWallet));
      setSavedWallets(saved);
      syncUserWallets(saved);
    } catch (err: any) {
      console.error('Error loading wallets:', err);

      // Use the ref so this callback is not recreated on every user change
      const currentUser = userRef.current;
      if (currentUser?.wallets && currentUser.wallets.length > 0) {
        setSavedWallets(currentUser.wallets.map(walletToSavedWallet));
      } else {
        setError(err.message || 'Error al cargar wallets');
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, syncUserWallets]);

  /**
   * Connect a wallet (MetaMask, WalletConnect, etc.)
   * This is for signing transactions, NOT for authentication
   * @param type Wallet type to connect
   * @param provider Optional specific provider (for multi-wallet scenarios)
   */
  const connectWallet = useCallback(async (type: WalletType, provider?: unknown): Promise<ConnectedWallet> => {
    setIsConnecting(true);
    setError(null);
    
    try {
      const connection = await blockchainProvider.connectWallet(type, provider);
      
      const connected: ConnectedWallet = {
        address: connection.address,
        chainId: connection.chainId,
        type: connection.type
      };
      
      setConnectedWallet(connected);
      return connected;
    } catch (err: any) {
      console.error('Error connecting wallet:', err);
      setError(err.message || 'Error al conectar wallet');
      throw err;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  /**
   * Disconnect current wallet
   */
  const disconnectWallet = useCallback(() => {
    blockchainProvider.disconnect();
    setConnectedWallet(null);
  }, []);

  /**
   * Add current connected wallet to saved wallets
   */
  const addWallet = useCallback(async (label?: string): Promise<SavedWallet> => {
    if (!connectedWallet) {
      throw new Error('No hay wallet conectada');
    }
    
    if (savedWallets.length >= MAX_WALLETS_PER_USER) {
      throw new Error(`Máximo ${MAX_WALLETS_PER_USER} wallets por usuario. Elimina una primero.`);
    }
    
    // Check if wallet already saved
    const existing = savedWallets.find(
      w => w.walletAddress.toLowerCase() === connectedWallet.address.toLowerCase()
    );
    
    if (existing) {
      throw new Error('Esta wallet ya está guardada');
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const challengeResponse = await walletsApi.getChallenge(connectedWallet.address);
      const signature = await blockchainProvider.signMessage(challengeResponse.message);

      const response = await walletsApi.add(
        connectedWallet.address,
        label || `Wallet ${savedWallets.length + 1}`,
        signature,
        challengeResponse.message
      );
      
      const newWallet = walletToSavedWallet(response.wallet);
      const nextSavedWallets = sortSavedWallets([...savedWallets, newWallet]);
      setSavedWallets(nextSavedWallets);
      syncUserWallets(nextSavedWallets);
      return newWallet;
    } catch (err: any) {
      console.error('Error adding wallet:', err);
      setError(err.message || 'Error al guardar wallet');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [connectedWallet, savedWallets]);

  /**
   * Remove a saved wallet
   */
  const removeWallet = useCallback(async (walletId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await walletsApi.remove(walletId);
      const nextSavedWallets = sortSavedWallets(savedWallets.filter(w => w.id !== walletId));
      setSavedWallets(nextSavedWallets);
      syncUserWallets(nextSavedWallets);
    } catch (err: any) {
      console.error('Error removing wallet:', err);
      setError(err.message || 'Error al eliminar wallet');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [savedWallets, syncUserWallets]);

  /**
   * Set a wallet as primary
   */
  const setPrimaryWalletFn = useCallback(async (walletId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await walletsApi.setPrimary(walletId);
      const nextSavedWallets = sortSavedWallets(savedWallets.map(w => ({
          ...w,
          isPrimary: w.id === walletId
        })));
      setSavedWallets(nextSavedWallets);
      syncUserWallets(nextSavedWallets);
    } catch (err: any) {
      console.error('Error setting primary wallet:', err);
      setError(err.message || 'Error al establecer wallet principal');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [savedWallets, syncUserWallets]);

  // Computed values
  const canAddWallet = savedWallets.length < MAX_WALLETS_PER_USER;

  const getWalletByAddress = useCallback((address: string) => {
    return savedWallets.find(
      w => w.walletAddress.toLowerCase() === address.toLowerCase()
    );
  }, [savedWallets]);

  const isWalletSaved = useCallback((address: string) => {
    return savedWallets.some(
      w => w.walletAddress.toLowerCase() === address.toLowerCase()
    );
  }, [savedWallets]);

  const value: WalletManagerContextType = {
    savedWallets,
    connectedWallet,
    isLoading,
    isConnecting,
    error,
    loadSavedWallets,
    connectWallet,
    disconnectWallet,
    addWallet,
    removeWallet,
    setPrimaryWallet: setPrimaryWalletFn,
    canAddWallet,
    getWalletByAddress,
    isWalletSaved
  };

  return (
    <WalletManagerContext.Provider value={value}>
      {children}
    </WalletManagerContext.Provider>
  );
}

export function useWalletManager() {
  const context = useContext(WalletManagerContext);
  if (context === undefined) {
    throw new Error('useWalletManager must be used within a WalletManagerProvider');
  }
  return context;
}
