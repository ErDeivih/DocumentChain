import React, { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import AlertMessage from '../components/ui/AlertMessage';
import { Badge } from '../components/ui/Badge';
import { WalletManager } from '../components/wallet/WalletManager';
import { AvatarUpload } from '../components/user/AvatarUpload';
import { User, Mail, Calendar, Key } from 'lucide-react';
import { changePassword } from '../api/auth';

export const Profile: React.FC = () => {
  const { user, refreshUser } = useAuth();
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

  const { connectWalletFlow, nextPath } = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return {
      connectWalletFlow: params.get('connectWallet') === '1',
      nextPath: params.get('next') || '/app/documents',
    };
  }, [location.search]);

  if (!user) return null;

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (passwordData.newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      setSuccess('Password changed successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setIsChangingPassword(false);
    } catch (err: any) {
      setError(err.message || 'Failed to change password');
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

      {/* Avatar Upload */}
      <AvatarUpload
        currentAvatarUrl={user.avatarUrl}
        username={user.username}
        onAvatarChange={() => {
          void refreshUser();
        }}
      />

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
                Your private key is encrypted with both your password and your recovery key. 
                Changing your password is safe - all your documents remain accessible, and your recovery key still works.
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
                helperText="Al menos 6 caracteres. Elija una contraseña segura para proteger sus documentos."
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
                  Cancel
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
