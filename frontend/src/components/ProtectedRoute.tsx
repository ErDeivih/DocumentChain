import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loading } from './ui/Loading';
import { configApi } from '../api/config';
import { setContractAddress } from '../lib/blockchain/config';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

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
    return <Loading fullScreen text="Loading..." />;
  }

  if (!user) {
    // Redirect to login but save the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.isSuspended && location.pathname !== '/app/settings') {
    return <Navigate to="/app/settings" replace />;
  }

  if (!user.emailVerified) {
    return <Navigate to="/verify-email" state={{ emailNotVerified: true }} replace />;
  }

  return <>{children}</>;
};
