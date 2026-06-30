import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface AdminRouteProps {
    children: React.ReactNode;
}

/**
 * Ruta protegida exclusiva para usuarios administradores.
 * Redirige a la página de documentos si el usuario no tiene privilegios de administrador.
 */
export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!user.isAdmin) {
    return <Navigate to="/app/documents" replace />;
  }

  return <>{children}</>;
};
