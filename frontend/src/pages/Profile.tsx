import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import AlertMessage from '../components/ui/AlertMessage';
import { Badge } from '../components/ui/Badge';
import { WalletManager } from '../components/wallet/WalletManager';
import { User, Mail, Calendar, Key } from 'lucide-react';
import { changePassword } from '../api/auth';
import { KeyManager } from '../lib/crypto/KeyManager';

/**
 * Página de perfil del usuario autenticado.
 *
 * Permite visualizar información personal, actualizar el avatar,
 * cambiar la contraseña y gestionar wallets de blockchain vinculadas.
 *
 * @returns JSX.Element con la interfaz de perfil de usuario.
 */
export const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const { connectWalletFlow, nextPath } = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return {
      connectWalletFlow: params.get('connectWallet') === '1',
      nextPath: params.get('next') || '/app/documents',
    };
  }, [location.search]);

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 py-4">
        <div className="text-center py-12 text-muted-foreground">Cargando perfil...</div>
      </div>
    );
  }

  /**
   * Gestiona el cambio de contraseña del usuario autenticado.
   *
   * Valida la longitud mínima, la coincidencia entre la nueva contraseña
   * y su confirmación, y luego invoca al servicio de autenticación.
   *
   * @param e - Evento del formulario.
   */
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!passwordData.currentPassword.trim()) {
      setError('La contraseña actual es obligatoria');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (!/[A-Z]/.test(passwordData.newPassword) || !/[a-z]/.test(passwordData.newPassword) || !/\d/.test(passwordData.newPassword)) {
      setError('La contraseña debe incluir al menos una mayúscula, una minúscula y un número');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (!user?.encryptedPrivateKey) {
      setError('No se encontró la clave privada cifrada. Inicie sesión de nuevo.');
      return;
    }

    setIsLoading(true);

    try {
      const { encryptedPrivateKey: newEncrypted, salt: newSalt } = await KeyManager.reEncryptPrivateKey(
        user.encryptedPrivateKey,
        passwordData.currentPassword,
        passwordData.newPassword,
      );
      await changePassword(passwordData.currentPassword, newEncrypted, newSalt, passwordData.newPassword);
      setSuccess('Contraseña cambiada con éxito. Redirigiendo...');
      timerRef.current = setTimeout(() => logout(), 1500);
    } catch (err: any) {
      setError(err.message || 'Error al cambiar la contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Perfil</h1>

      {/* User Information */}
      <Card data-testid="profile-user-information-card">
        <CardHeader>
          <CardTitle>Información del Usuario</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nombre de Usuario</p>
              <p className="font-semibold text-foreground">{user.username}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="font-semibold text-foreground">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Miembro Desde</p>
              <p className="font-semibold text-foreground">
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Rol</p>
              <Badge variant={user.isAdmin ? 'default' : 'secondary'}>
                {user.isAdmin ? 'Admin' : 'Usuario'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Seguridad</CardTitle>
            {!isChangingPassword && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsChangingPassword(true)}
              >
                <Key className="w-4 h-4 mr-2" />
                Cambiar Contraseña
              </Button>
            )}
          </div>
        </CardHeader>

        {!isChangingPassword && (
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3 rounded-lg border border-sky-200/70 bg-sky-50/70 p-3">
                <Key className="w-5 h-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Protección de Contraseña</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Su contraseña protege su clave de encriptación privada, que resguarda todos sus documentos.
                    Use una contraseña segura y manténgala protegida.
                  </p>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-primary hover:underline mt-2 inline-block"
                  >
                    ¿Olvidó su contraseña? Restablézcala con la clave de recuperación →
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        )}

        {isChangingPassword && (
          <CardContent>
            {error && (
              <AlertMessage
                type="error"
                message={error}
                onClose={() => setError(null)}
                className="mb-4"
              />
            )}

            {success && (
              <AlertMessage
                type="success"
                message={success}
                onClose={() => setSuccess(null)}
                className="mb-4"
              />
            )}

            <div className="mb-4 rounded-lg border border-sky-200 bg-sky-50/85 p-3">
              <p className="mb-1 text-sm font-medium text-sky-900">🔐 Información de seguridad</p>
              <p className="text-xs text-sky-800">
                Tu clave privada está cifrada con tu contraseña y tu clave de recuperación. 
                Cambiar tu contraseña es seguro — todos tus documentos siguen accesibles y tu clave de recuperación sigue funcionando.
              </p>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <Input
                label="Contraseña Actual"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, currentPassword: e.target.value })
                }
                required
                disabled={isLoading}
              />

              <Input
                label="Nueva Contraseña"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, newPassword: e.target.value })
                }
                required
                disabled={isLoading}
                helperText="Al menos 8 caracteres. Elija una contraseña segura para proteger sus documentos."
              />

              <Input
                label="Confirmar Nueva Contraseña"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                }
                required
                disabled={isLoading}
              />

              <div className="flex gap-3">
                <Button type="submit" variant="primary" isLoading={isLoading}>
                  Actualizar Contraseña
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setIsChangingPassword(false);
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    setError(null);
                    setSuccess(null);
                  }}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        )}
      </Card>

      {/* Wallet Management */}
      {connectWalletFlow && (
        <AlertMessage
          type="info"
          message="Registro completado. Conecte su wallet para continuar automáticamente a la aplicación."
          className="mb-4"
        />
      )}
      <WalletManager
        autoOpenConnector={connectWalletFlow}
        onWalletConnected={connectWalletFlow ? () => navigate(nextPath, { replace: true }) : undefined}
      />
    </div>
  );
};
