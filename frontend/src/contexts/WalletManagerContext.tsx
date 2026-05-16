import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { blockchainProvider, WalletType } from '../lib/blockchain/provider';
import { walletsApi } from '../api/wallets';
import { useAuth } from './AuthContext';
import type { User, Wallet } from '../types';

/**
 * Representa una wallet guardada en la base de datos asociada al usuario.
 */
export interface SavedWallet {
  /** Identificador único de la wallet en la base de datos. */
  id: string;
  /** Dirección pública de la wallet. */
  walletAddress: string;
  /** Etiqueta descriptiva opcional asignada por el usuario. */
  label: string | null;
  /** Indica si es la wallet principal del usuario. */
  isPrimary: boolean;
  /** Fecha de alta en formato ISO. */
  addedAt: string;
  /** Fecha del último uso en formato ISO. */
  lastUsedAt: string;
}

/**
 * Representa una wallet conectada activamente para firmar transacciones.
 */
export interface ConnectedWallet {
  /** Dirección pública de la wallet conectada. */
  address: string;
  /** Identificador de la red blockchain activa. */
  chainId: number;
  /** Tipo de proveedor de wallet (MetaMask, WalletConnect, etc.). */
  type: WalletType;
}

/**
 * Contrato del contexto de gestión de wallets.
 * Administra el ciclo de vida de las wallets: guardadas, conectadas y operaciones CRUD.
 */
interface WalletManagerContextType {
  /** Listado de wallets guardadas en la base de datos (máximo 5). */
  savedWallets: SavedWallet[];
  /** Wallet actualmente conectada para firmar transacciones. */
  connectedWallet: ConnectedWallet | null;
  /** Indica si se están cargando las wallets guardadas. */
  isLoading: boolean;
  /** Indica si se está estableciendo una conexión con una wallet. */
  isConnecting: boolean;
  /** Mensaje de error de la última operación, o `null` si no hay error. */
  error: string | null;
  /** Recarga las wallets guardadas desde el backend. */
  loadSavedWallets: () => Promise<void>;
  /**
   * Conecta una wallet externa para firmar transacciones.
   * @param type - Tipo de proveedor de wallet.
   * @param provider - Instancia de proveedor opcional (escenarios multi-wallet).
   * @returns Datos de la wallet conectada.
   */
  connectWallet: (type: WalletType, provider?: unknown) => Promise<ConnectedWallet>;
  /** Desconecta la wallet activa. */
  disconnectWallet: () => void;
  /**
   * Guarda la wallet conectada en la base de datos del usuario.
   * @param label - Etiqueta descriptiva opcional.
   * @returns La wallet guardada.
   */
  addWallet: (label?: string) => Promise<SavedWallet>;
  /**
   * Elimina una wallet guardada.
   * @param walletId - Identificador de la wallet a eliminar.
   */
  removeWallet: (walletId: string) => Promise<void>;
  /**
   * Establece una wallet como principal.
   * @param walletId - Identificador de la wallet a promover.
   */
  setPrimaryWallet: (walletId: string) => Promise<void>;
  /** `true` si el usuario aún puede añadir más wallets (límite no alcanzado). */
  canAddWallet: boolean;
  /**
   * Busca una wallet guardada por su dirección pública.
   * @param address - Dirección a buscar.
   * @returns La wallet encontrada, o `undefined`.
   */
  getWalletByAddress: (address: string) => SavedWallet | undefined;
  /**
   * Determina si una dirección ya está guardada.
   * @param address - Dirección a comprobar.
   * @returns `true` si la dirección existe en las wallets guardadas.
   */
  isWalletSaved: (address: string) => boolean;
}

const WalletManagerContext = createContext<WalletManagerContextType | undefined>(undefined);

/** Número máximo de wallets permitidas por usuario. */
const MAX_WALLETS_PER_USER = 5;

/**
 * Convierte un objeto {@link Wallet} del backend a {@link SavedWallet}.
 *
 * @param wallet - Wallet tal como viene del API.
 * @returns Wallet adaptada al formato de dominio del frontend.
 */
function walletToSavedWallet(wallet: Wallet): SavedWallet {
  return {
    id: wallet.id,
    walletAddress: wallet.address,
    label: wallet.label,
    isPrimary: wallet.isPrimary,
    addedAt: new Date().toISOString(),
    lastUsedAt: new Date().toISOString()
  };
}

/**
 * Ordena un listado de wallets: primero la principal, luego alfabéticamente por etiqueta o dirección.
 *
 * @param wallets - Listado de wallets a ordenar.
 * @returns Nuevo arreglo ordenado.
 */
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

/**
 * Transforma un listado de {@link SavedWallet} al formato mínimo esperado en la sesión de usuario.
 *
 * @param savedWallets - Wallets guardadas.
 * @returns Wallets adaptadas al tipo anidado de {@link User}.
 */
function savedWalletsToSessionWallets(savedWallets: SavedWallet[]): NonNullable<User['wallets']> {
  return savedWallets.map((wallet) => ({
    id: wallet.id,
    address: wallet.walletAddress,
    label: wallet.label,
    isPrimary: wallet.isPrimary,
  }));
}

/**
 * Proveedor de gestión de wallets.
 *
 * Administra las wallets del usuario para firmar transacciones en blockchain.
 * - Cada usuario puede tener hasta 5 wallets guardadas.
 * - Las wallets son únicamente para transacciones, no para autenticación.
 * - La conexión con una wallet se realiza bajo demanda cuando se requiere firmar.
 *
 * @param props - Propiedades del componente.
 * @param props.children - Elementos React hijos.
 */
export function WalletManagerProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, patchUserSession } = useAuth();

  const [savedWallets, setSavedWallets] = useState<SavedWallet[]>([]);
  const [connectedWallet, setConnectedWallet] = useState<ConnectedWallet | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Referencia mutable al usuario actual para evitar recrear callbacks
   * cuando el objeto usuario cambia (p. ej., tras `patchUserSession`).
   */
  const userRef = useRef(user);
  userRef.current = user;

  /**
   * Sincroniza el listado de wallets guardadas con la sesión del usuario.
   *
   * @param nextSavedWallets - Wallets que se reflejarán en el contexto de autenticación.
   */
  const syncUserWallets = useCallback((nextSavedWallets: SavedWallet[]) => {
    const primaryWallet = nextSavedWallets.find((wallet) => wallet.isPrimary);
    patchUserSession({
      wallets: savedWalletsToSessionWallets(nextSavedWallets),
      walletAddress: primaryWallet?.walletAddress,
    });
  }, [patchUserSession]);

  /**
   * Efecto que carga las wallets guardadas cuando cambia la identidad autenticada.
   * Depende únicamente de `user?.id` (no del objeto completo) para evitar bucles
   * infinitos provocados por actualizaciones del listado de wallets.
   */
  useEffect(() => {
    if (isAuthenticated && userRef.current) {
      const currentUser = userRef.current;
      if (currentUser.wallets && currentUser.wallets.length > 0) {
        setSavedWallets(sortSavedWallets(currentUser.wallets.map(walletToSavedWallet)));
      }

      loadSavedWallets();
    } else {
      setSavedWallets([]);
      setConnectedWallet(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.id]);

  /**
   * Escucha eventos de desconexión o cambio de cuentas desde el proveedor blockchain.
   */
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
   * Carga las wallets guardadas desde el backend y actualiza el estado local.
   * Si la petición falla, intenta fallback con los datos ya presentes en la sesión.
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
      console.error('Error cargando wallets:', err);

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
   * Conecta una wallet externa (MetaMask, WalletConnect, etc.) para firmar transacciones.
   *
   * @param type - Tipo de proveedor de wallet.
   * @param provider - Instancia de proveedor opcional.
   * @returns Wallet conectada con dirección, chainId y tipo.
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
      console.error('Error conectando wallet:', err);
      setError(err.message || 'Error al conectar wallet');
      throw err;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  /**
   * Desconecta la wallet activa del proveedor blockchain y limpia el estado local.
   */
  const disconnectWallet = useCallback(() => {
    blockchainProvider.disconnect();
    setConnectedWallet(null);
  }, []);

  /**
   * Guarda la wallet actualmente conectada en la base de datos del usuario.
   * Requiere firmar un desafío para demostrar la propiedad de la dirección.
   *
   * @param label - Etiqueta descriptiva opcional.
   * @returns La wallet guardada.
   * @throws {Error} Si no hay wallet conectada, se alcanzó el límite o la dirección ya existe.
   */
  const addWallet = useCallback(async (label?: string): Promise<SavedWallet> => {
    if (!connectedWallet) {
      throw new Error('No hay wallet conectada');
    }

    if (savedWallets.length >= MAX_WALLETS_PER_USER) {
      throw new Error(`Máximo ${MAX_WALLETS_PER_USER} wallets por usuario. Elimina una primero.`);
    }

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
      console.error('Error añadiendo wallet:', err);
      setError(err.message || 'Error al guardar wallet');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [connectedWallet, savedWallets]);

  /**
   * Elimina una wallet guardada del usuario.
   *
   * @param walletId - Identificador de la wallet a eliminar.
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
      console.error('Error eliminando wallet:', err);
      setError(err.message || 'Error al eliminar wallet');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [savedWallets, syncUserWallets]);

  /**
   * Establece una wallet como principal del usuario.
   *
   * @param walletId - Identificador de la wallet a promover.
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
      console.error('Error estableciendo wallet principal:', err);
      setError(err.message || 'Error al establecer wallet principal');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [savedWallets, syncUserWallets]);

  /** Indica si el usuario puede añadir más wallets sin superar el límite. */
  const canAddWallet = savedWallets.length < MAX_WALLETS_PER_USER;

  /**
   * Busca una wallet guardada comparando direcciones de forma insensible a mayúsculas.
   *
   * @param address - Dirección pública a buscar.
   * @returns La wallet coincidente, o `undefined`.
   */
  const getWalletByAddress = useCallback((address: string) => {
    return savedWallets.find(
      w => w.walletAddress.toLowerCase() === address.toLowerCase()
    );
  }, [savedWallets]);

  /**
   * Determina si una dirección ya pertenece a las wallets guardadas.
   *
   * @param address - Dirección pública a comprobar.
   * @returns `true` si existe al menos una coincidencia.
   */
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

/**
 * Hook para consumir el {@link WalletManagerContext}.
 *
 * @returns El valor completo del contexto de gestión de wallets.
 * @throws {Error} Si se invoca fuera de un {@link WalletManagerProvider}.
 */
export function useWalletManager() {
  const context = useContext(WalletManagerContext);
  if (context === undefined) {
    throw new Error('useWalletManager debe utilizarse dentro de un WalletManagerProvider');
  }
  return context;
}
