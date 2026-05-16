import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loading } from './ui/Loading';
import { configApi } from '../api/config';
import { setContractAddress } from '../lib/blockchain/config';

/**
 * Props del componente ProtectedRoute.
 */
interface ProtectedRouteProps {
  /** Contenido protegido que se renderizará si el usuario está autorizado. */
  children: React.ReactNode;
}

/**
 * Ruta protegida que verifica la autenticación del usuario.
 * Gestiona la sincronización de la configuración blockchain y redirige
 * al inicio de sesión o verificación de email cuando es necesario.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const [isBlockchainConfigReady, setIsBlockchainConfigReady] = useState(true);
  const [syncedUserId, setSyncedUserId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!user) {
      setIsBlockchainConfigReady(true);
      setSyncedUserId(null);
      return () => {
        cancelled = true;
      };
    }

    if (syncedUserId === user.id) {
      setIsBlockchainConfigReady(true);
      return () => {
        cancelled = true;
      };
    }

    setIsBlockchainConfigReady(false);

    void configApi
      .getContractAddresses()
      .then((response) => {
        if (cancelled) {
          return;
        }

        const registryAddress = response.contracts.documentRegistry;
        if (registryAddress) {
          setContractAddress('DocumentRegistry', registryAddress);
        }
      })
      .catch((error) => {
        console.warn('No se pudo sincronizar la configuración blockchain del frontend', error);
      })
      .finally(() => {
        if (!cancelled) {
          setSyncedUserId(user.id);
          setIsBlockchainConfigReady(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [syncedUserId, user]);

  if (isLoading || !isBlockchainConfigReady) {
    return <Loading fullScreen text="Cargando..." />;
  }

  if (!user) {
    // Redirect to login but save the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user.emailVerified) {
    return <Navigate to="/verify-email" state={{ emailNotVerified: true }} replace />;
  }

  return <>{children}</>;
};
