import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { authApi } from '../api/auth';
import type { User, AuthResponse, LoginRequest, RegisterRequest } from '../types';
import { getErrorMessage } from '../lib/api';
import { SecureStorage } from '../lib/crypto/SecureStorage';

/**
 * Contrato del contexto de autenticación.
 * Provee el estado de la sesión y las acciones de autenticación disponibles.
 */
interface AuthContextType {
  /** Usuario autenticado actualmente, o `null` si no hay sesión. */
  user: User | null;
  /** Token de acceso JWT actual, o `null` si no está autenticado. */
  accessToken: string | null;
  /** Indica si se está validando la sesión almacenada durante el montaje. */
  isLoading: boolean;
  /** `true` si existe un usuario y un token de acceso válidos. */
  isAuthenticated: boolean;
  /** Inicia sesión con credenciales tradicionales. */
  login: (credentials: LoginRequest) => Promise<void>;
  /** Registra un nuevo usuario en el sistema. */
  register: (data: RegisterRequest) => Promise<{ recoveryKey?: string }>;
  /** Cierra la sesión actual y limpia el almacenamiento. */
  logout: () => Promise<void>;
  /** Refresca los datos del usuario desde el backend. */
  refreshUser: () => Promise<void>;
  /**
   * Actualiza parcialmente el usuario en sesión.
   * @param patch - Objeto parcial o función que recibe el usuario actual y devuelve el siguiente estado.
   */
  patchUserSession: (patch: Partial<User> | ((currentUser: User) => User)) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Enriquece un objeto {@link User} añadiendo propiedades calculadas.
 * @param user - Usuario base.
 * @returns Usuario con propiedades computadas (p. ej., `isAdmin`).
 */
function enrichUser(user: User): User {
  return {
    ...user,
    isAdmin: user.role === 'ADMIN'
  };
}

function toPersistedUser(user: User): User {
  const persistedUser: User = {
    ...user,
    encryptedPrivateKey: undefined,
    keySalt: undefined,
  };

  return persistedUser;
}

/**
 * Proveedor de autenticación tradicional (usuario/contraseña).
 *
 * Gestiona el ciclo de vida de la sesión: inicio de sesión, registro,
 * refresco de token y cierre de sesión.
 * La contraseña del usuario se utiliza para descifrar su clave privada RSA.
 * Las wallets se emplean únicamente para firmar transacciones en blockchain,
 * nunca como método de autenticación.
 *
 * @param props - Propiedades del componente.
 * @param props.children - Elementos React hijos.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Elimina del almacenamiento local y de sesión los datos persistidos de la sesión.
   */
  const clearPersistedSession = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    sessionStorage.removeItem('activeWalletId');
  };

  /**
   * Persiste el usuario autenticado en el estado y en `localStorage`.
   * @param nextUser - Usuario a persistir.
   * @returns El usuario enriquecido.
   */
  const persistAuthenticatedUser = (nextUser: User) => {
    const enrichedUser = enrichUser(nextUser);
    setUser(enrichedUser);
    localStorage.setItem('user', JSON.stringify(toPersistedUser(enrichedUser)));
    return enrichedUser;
  };

  /**
   * Finaliza el proceso de autenticación guardando tokens y usuario.
   * @param response - Respuesta de autenticación con tokens y usuario.
   */
  const finalizeAuthenticatedSession = (response: AuthResponse) => {
    persistAuthenticatedUser(response.user);
    setAccessToken(response.accessToken);
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
  };

  useEffect(() => {
    /**
     * Valida la sesión almacenada consultando el usuario actual en el backend.
     */
    const validateSession = async () => {
      const storedAccessToken = localStorage.getItem('accessToken');
      const storedUser = localStorage.getItem('user');

      if (storedAccessToken && storedUser) {
        try {
          const response = await authApi.getMe();
          setAccessToken(storedAccessToken);
          persistAuthenticatedUser(response.user);
        } catch (error) {
          console.warn('Sesión inválida o expirada, limpiando...');
          clearPersistedSession();
          SecureStorage.clearAll();
        }
      }

      setIsLoading(false);
    };

    validateSession();
  }, []);

  useEffect(() => {
    /**
     * Maneja el evento global de cierre de sesión forzado.
     */
    const handleLogout = () => {
      setUser(null);
      setAccessToken(null);
      SecureStorage.clearAll();
      clearPersistedSession();
    };

    /**
     * Maneja el evento global de refresco de token.
     * @param event - Evento personalizado con el nuevo token.
     */
    const handleTokenRefresh = (event: Event) => {
      const tokenRefreshEvent = event as CustomEvent<{ accessToken?: string }>;
      const refreshedAccessToken = tokenRefreshEvent.detail?.accessToken || localStorage.getItem('accessToken');
      setAccessToken(refreshedAccessToken);
    };

    window.addEventListener('auth:logout', handleLogout);
    window.addEventListener('auth:token-refreshed', handleTokenRefresh);

    return () => {
      window.removeEventListener('auth:logout', handleLogout);
      window.removeEventListener('auth:token-refreshed', handleTokenRefresh);
    };
  }, []);

  /**
   * Registra un nuevo usuario en el sistema.
   * El backend genera un par de claves RSA y cifra la clave privada con la contraseña.
   *
   * @param data - Datos de registro solicitados.
   * @returns Objeto con la clave de recuperación, si el backend la proporciona.
   */
  const register = async (data: RegisterRequest) => {
    try {
      const response = await authApi.register(data);
      return { recoveryKey: response.recoveryKey };
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  };

  /**
   * Inicia sesión con nombre de usuario y contraseña.
   * La contraseña se utiliza posteriormente para descifrar la clave privada RSA.
   *
   * @param credentials - Credenciales de inicio de sesión.
   * @returns Resultado de inicio de sesión.
   */
  const login = async (credentials: LoginRequest) => {
    try {
      const response = await authApi.login(credentials);
      finalizeAuthenticatedSession(response);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  };

  /**
   * Cierra la sesión actual, revoca el token de refresco en el backend
   * y limpia todo el almacenamiento seguro y persistente.
   */
  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');

    try {
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      SecureStorage.clearAll();

      setUser(null);
      setAccessToken(null);
      clearPersistedSession();
    }
  };

  /**
   * Solicita al backend los datos más recientes del usuario autenticado
   * y actualiza el estado local.
   */
  const refreshUser = async () => {
    try {
      const response = await authApi.getMe();
      persistAuthenticatedUser(response.user);
      setAccessToken(localStorage.getItem('accessToken'));
    } catch (error) {
      console.error('Error al refrescar usuario:', error);
      logout();
    }
  };

  /**
   * Actualiza parcialmente el objeto usuario en sesión.
   *
   * @param patch - Objeto parcial de {@link User} o función que recibe el usuario actual y devuelve el nuevo estado.
   */
  const patchUserSession = (patch: Partial<User> | ((currentUser: User) => User)) => {
    setUser((currentUser) => {
      if (!currentUser) {
        return currentUser;
      }

      const nextUser = typeof patch === 'function'
        ? patch(currentUser)
        : { ...currentUser, ...patch };

      const enrichedUser = enrichUser(nextUser);
      localStorage.setItem('user', JSON.stringify(toPersistedUser(enrichedUser)));
      return enrichedUser;
    });
  };

  const value: AuthContextType = useMemo(() => ({
    user,
    accessToken,
    isLoading,
    isAuthenticated: !!user && !!accessToken,
    login,
    register,
    logout,
    refreshUser,
    patchUserSession
  }), [user, accessToken, isLoading, login, register, logout, refreshUser, patchUserSession]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook para consumir el {@link AuthContext}.
 *
 * @returns El valor completo del contexto de autenticación.
 * @throws {Error} Si se invoca fuera de un {@link AuthProvider}.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe utilizarse dentro de un AuthProvider');
  }
  return context;
}
