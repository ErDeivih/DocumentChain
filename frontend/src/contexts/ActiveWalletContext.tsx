import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { useWalletManager, SavedWallet } from './WalletManagerContext';

const ACTIVE_WALLET_STORAGE_KEY = 'activeWalletId';

/**
 * Resuelve la wallet predeterminada: la principal, o la primera del listado, o `null`.
 *
 * @param savedWallets - Listado de wallets guardadas.
 * @returns La wallet por defecto o `null` si el listado está vacío.
 */
function resolveDefaultWallet(savedWallets: SavedWallet[]): SavedWallet | null {
  return savedWallets.find((wallet) => wallet.isPrimary) || savedWallets[0] || null;
}

/**
 * Contexto de wallet activa.
 *
 * Gestiona cuál de las wallets guardadas está "activa" para visualizar documentos compartidos.
 * Es diferente de {@link WalletManagerContext}, que se encarga de firmar transacciones.
 *
 * Caso de uso: el usuario posee 3 wallets. Los documentos compartidos están asociados a la wallet #2.
 * - Wallet principal: #1 (para firmar).
 * - Wallet activa: #2 (para ver documentos compartidos).
 *
 * El usuario puede cambiar la wallet activa desde la interfaz para consultar
 * los documentos vinculados a cada dirección.
 */
interface ActiveWalletContextType {
    activeWallet: SavedWallet | null;
    setActiveWallet: (wallet: SavedWallet) => void;
    resetToPrimary: () => void;
}

const ActiveWalletContext = createContext<ActiveWalletContextType | undefined>(undefined);

/**
 * Proveedor del contexto de wallet activa.
 *
 * Mantiene sincronizado el estado de la wallet activa con `sessionStorage`
 * y resuelve automáticamente la wallet por defecto cuando cambia el listado
 * de wallets guardadas.
 *
 * @param props - Propiedades del componente.
 * @param props.children - Elementos React hijos.
 */
export function ActiveWalletProvider({ children }: { children: ReactNode }) {
  const { savedWallets } = useWalletManager();
  const [activeWallet, setActiveWalletState] = useState<SavedWallet | null>(null);

  /**
   * Efecto que resuelve y persiste la wallet activa cada vez que cambian
   * las wallets guardadas o el estado local.
   */
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

  /**
   * Establece una wallet del listado guardado como activa.
   *
   * @param wallet - Wallet a activar.
   */
  const setActiveWallet = (wallet: SavedWallet) => {
    const nextWallet = savedWallets.find((candidate) => candidate.id === wallet.id) || wallet;
    setActiveWalletState(nextWallet);
    sessionStorage.setItem(ACTIVE_WALLET_STORAGE_KEY, nextWallet.id);
  };

  /**
   * Restablece la wallet activa a la predeterminada (principal o primera disponible).
   */
  const resetToPrimary = () => {
    const primary = resolveDefaultWallet(savedWallets);
    if (primary) {
      setActiveWalletState(primary);
      sessionStorage.setItem(ACTIVE_WALLET_STORAGE_KEY, primary.id);
    }
  };

  const value: ActiveWalletContextType = useMemo(() => ({
    activeWallet,
    setActiveWallet,
    resetToPrimary,
  }), [activeWallet, setActiveWallet, resetToPrimary]);

  return (
    <ActiveWalletContext.Provider value={value}>
      {children}
    </ActiveWalletContext.Provider>
  );
}

/**
 * Hook para consumir el {@link ActiveWalletContext}.
 *
 * @returns El valor completo del contexto de wallet activa.
 * @throws {Error} Si se invoca fuera de un {@link ActiveWalletProvider}.
 */
export function useActiveWallet() {
  const context = useContext(ActiveWalletContext);
  if (context === undefined) {
    throw new Error('useActiveWallet debe utilizarse dentro de un ActiveWalletProvider');
  }
  return context;
}
