import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../api/auth';
import type { User, AuthResponse, LoginRequest, RegisterRequest } from '../types';
import { getErrorMessage } from '../lib/api';
import { SecureStorage } from '../lib/crypto/SecureStorage';

interface PendingTwoFactorLogin {
  tempToken: string;
  user: User;
}

interface LoginResult {
  requires2FA: boolean;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  pendingTwoFactor: PendingTwoFactorLogin | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<LoginResult>;
  verifyTwoFactor: (token: string) => Promise<void>;
  cancelTwoFactorLogin: () => void;
  register: (data: RegisterRequest) => Promise<{ recoveryKey?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  patchUserSession: (patch: Partial<User> | ((currentUser: User) => User)) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to add computed properties to User
function enrichUser(user: User): User {
  return {
    ...user,
    isAdmin: user.role === 'ADMIN'
  };
}

function isAuthenticatedResponse(response: AuthResponse | { requires2FA?: true }): response is AuthResponse {
  return 'accessToken' in response;
}

/**
 * AuthProvider - Traditional authentication only
 * Users login/register with username/email and password
 * Password is used to decrypt the user's RSA private key
 * Wallets are ONLY for signing blockchain transactions, NOT for authentication
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [pendingTwoFactor, setPendingTwoFactor] = useState<PendingTwoFactorLogin | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearPersistedSession = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    sessionStorage.removeItem('activeWalletId');
  };

  const persistAuthenticatedUser = (nextUser: User) => {
    const enrichedUser = enrichUser(nextUser);
    setUser(enrichedUser);
    localStorage.setItem('user', JSON.stringify(enrichedUser));
    return enrichedUser;
  };

  const finalizeAuthenticatedSession = (response: AuthResponse) => {
    setPendingTwoFactor(null);
    persistAuthenticatedUser(response.user);
    setAccessToken(response.accessToken);
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
  };

  useEffect(() => {
    // Load and validate user from localStorage on mount
    const validateSession = async () => {
      const storedAccessToken = localStorage.getItem('accessToken');
      const storedUser = localStorage.getItem('user');

      if (storedAccessToken && storedUser) {
        try {
          // Validate token by fetching current user
          const response = await authApi.getMe();
          setAccessToken(storedAccessToken);
          persistAuthenticatedUser(response.user);
        } catch (error) {
          // Token invalid or expired - clear storage
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
    // Listen for auth:logout events from axios interceptor
    const handleLogout = () => {
      setUser(null);
      setAccessToken(null);
      setPendingTwoFactor(null);
      SecureStorage.clearAll();
      clearPersistedSession();
    };

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
   * Register a new user
   * Backend generates RSA keypair and encrypts private key with password
   * Returns recovery key for account recovery
   */
  const register = async (data: RegisterRequest) => {
    try {
      const response = await authApi.register(data);
      finalizeAuthenticatedSession(response);

      // Return recovery key if present
      return { recoveryKey: response.recoveryKey };
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  };

  /**
   * Login with username and password
   * User's RSA private key is stored encrypted in backend
   * Password is used to decrypt the private key locally when needed
   */
  const login = async (credentials: LoginRequest) => {
    try {
      const response = await authApi.login(credentials);

      if ('requires2FA' in response && response.requires2FA) {
        const enrichedUser = enrichUser(response.user);
        setPendingTwoFactor({
          tempToken: response.tempToken,
          user: enrichedUser,
        });
        setUser(null);
        setAccessToken(null);
        clearPersistedSession();
        return { requires2FA: true };
      }

      if (!isAuthenticatedResponse(response)) {
        throw new Error('La respuesta de autenticación no incluye tokens válidos.');
      }

      const authResponse = response as AuthResponse;
      finalizeAuthenticatedSession(authResponse);
      return { requires2FA: false };
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  };

  const verifyTwoFactor = async (token: string) => {
    if (!pendingTwoFactor?.tempToken) {
      throw new Error('No hay un desafío 2FA pendiente');
    }

    try {
      const response = await authApi.verifyTwoFactor(pendingTwoFactor.tempToken, token.trim());
      finalizeAuthenticatedSession(response);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  };

  const cancelTwoFactorLogin = () => {
    setPendingTwoFactor(null);
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');

    try {
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      // Clear secure storage (private keys in memory)
      SecureStorage.clearAll();
      
      setUser(null);
      setAccessToken(null);
      setPendingTwoFactor(null);
      clearPersistedSession();
    }
  };

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

  const patchUserSession = (patch: Partial<User> | ((currentUser: User) => User)) => {
    setUser((currentUser) => {
      if (!currentUser) {
        return currentUser;
      }

      const nextUser = typeof patch === 'function'
        ? patch(currentUser)
        : { ...currentUser, ...patch };

      const enrichedUser = enrichUser(nextUser);
      localStorage.setItem('user', JSON.stringify(enrichedUser));
      return enrichedUser;
    });
  };

  const value: AuthContextType = {
    user,
    accessToken,
    pendingTwoFactor,
    isLoading,
    isAuthenticated: !!user && !!accessToken,
    login,
    verifyTwoFactor,
    cancelTwoFactorLogin,
    register,
    logout,
    refreshUser,
    patchUserSession
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
