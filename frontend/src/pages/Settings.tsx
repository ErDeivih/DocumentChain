import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Button } from '../components/ui/Button';
import { AvatarUpload } from '../components/user/AvatarUpload';
import { WalletManager } from '../components/wallet/WalletManager';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../api/users';
import { authApi } from '../api/auth';
import { notificationsApi } from '../api/notifications';
import { getErrorMessage } from '../lib/api';
import { AlertTriangle, CheckCircle2, Info, Shield, User, Wallet, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Switch } from '../components/ui/Switch';

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, refreshUser, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialTab = (searchParams.get('tab') as 'profile' | 'security' | 'wallets') || 'profile';
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'wallets'>(initialTab);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showError, setShowError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [email, setEmail] = useState(user?.email || '');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [notificationPrefs, setNotificationPrefs] = useState({
    emailEnabled: true,
    pushEnabled: true,
    fileShared: true,
    newVersion: true,
  });
  const notificationPrefsRef = useRef(notificationPrefs);

  useEffect(() => {
    if (user?.fullName) {
      const parts = user.fullName.split(' ');
      setFirstName(parts[0] || '');
      setLastName(parts.slice(1).join(' ') || '');
    }
    setEmail(user?.email || '');
  }, [user]);

  useEffect(() => {
    const loadNotificationPrefs = async () => {
      try {
        const response = await notificationsApi.getPreferences();
        const prefs = response.data;
        const typePrefs = prefs.typePreferences || {};
        const loadedPrefs = {
          emailEnabled: Boolean(prefs.emailEnabled),
          pushEnabled: Boolean(prefs.pushEnabled),
          fileShared: typePrefs.FILE_SHARED !== false,
          newVersion: typePrefs.NEW_VERSION !== false,
        };
        notificationPrefsRef.current = loadedPrefs;
        setNotificationPrefs(loadedPrefs);
      } catch {
        // Keep defaults when preferences endpoint is unavailable.
      }
    };

    void loadNotificationPrefs();
  }, []);

  const updateProfileMutation = useMutation({
    mutationFn: (data: { fullName?: string; email?: string }) => usersApi.updateProfile(data),
    onSuccess: async () => {
      setSuccessMessage('Configuración guardada correctamente.');
      setShowError(null);
      await refreshUser();
      queryClient.invalidateQueries({ queryKey: ['user'] });
      setTimeout(() => setSuccessMessage(null), 3000);
    },
    onError: (error: unknown) => {
      setShowError(getErrorMessage(error));
      setTimeout(() => setShowError(null), 5000);
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      await authApi.changePassword(data.currentPassword, data.newPassword);
    },
    onSuccess: async () => {
      setSuccessMessage('Contraseña actualizada. Debe iniciar sesión de nuevo.');
      setShowError(null);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      sessionStorage.setItem('loginNotice', 'Contraseña actualizada. Inicie sesión de nuevo para continuar.');
      await logout();
      navigate('/login', { replace: true });
    },
    onError: (error: unknown) => {
      setShowError(getErrorMessage(error));
      setTimeout(() => setShowError(null), 5000);
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      await usersApi.deleteAccount();
    },
    onSuccess: async () => {
      setSuccessMessage('Cuenta eliminada permanentemente.');
      setShowError(null);
      await logout();
      navigate('/', { replace: true });
    },
    onError: (error: unknown) => {
      setShowError(getErrorMessage(error));
      setTimeout(() => setShowError(null), 5000);
    },
  });

  const handleSaveProfile = () => {
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    updateProfileMutation.mutate({
      email: email.trim(),
      fullName: fullName || undefined,
    });
  };

  const handleChangePassword = () => {
    if (!passwordForm.currentPassword.trim()) {
      setShowError('La contraseña actual es obligatoria.');
      return;
    }
    if (!passwordForm.newPassword.trim()) {
      setShowError('La nueva contraseña es obligatoria.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setShowError('Las nuevas contraseñas no coinciden.');
      return;
    }

    changePasswordMutation.mutate({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });
  };

  const updateNotificationPreferences = async (updates: Partial<typeof notificationPrefs>) => {
    const previous = notificationPrefsRef.current;
    const next = { ...notificationPrefsRef.current, ...updates };
    notificationPrefsRef.current = next;
    setNotificationPrefs(next);

    try {
      await notificationsApi.updatePreferences({
        emailEnabled: next.emailEnabled,
        pushEnabled: next.pushEnabled,
        typePreferences: {
          FILE_SHARED: next.fileShared,
          NEW_VERSION: next.newVersion,
        },
      });
      setSuccessMessage('Preferencias de notificación actualizadas.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: unknown) {
      if (notificationPrefsRef.current === next) {
        notificationPrefsRef.current = previous;
        setNotificationPrefs(previous);
      }
      setShowError(getErrorMessage(error));
      setTimeout(() => setShowError(null), 5000);
    }
  };

  return (
    <>
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Configuración</h1>
          <p className="text-muted-foreground mt-1">Gestione la configuración y preferencias de su cuenta</p>
        </div>

        {successMessage && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <p className="text-sm text-green-800">{successMessage}</p>
          </div>
        )}

        {showError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <Info className="h-4 w-4 text-red-600" />
            <p className="text-sm text-red-800">{showError}</p>
          </div>
        )}

        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            const tab = value as typeof activeTab;
            setActiveTab(tab);
            if (tab === 'wallets') {
              setSearchParams({ tab: 'wallets' });
            } else {
              setSearchParams({});
            }
          }}
          className="w-full"
        >
          <TabsList>
            <TabsTrigger value="profile">
              <User className="w-4 h-4 mr-2" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="security">
              <Shield className="w-4 h-4 mr-2" />
              Seguridad y Cuenta
            </TabsTrigger>
            <TabsTrigger value="wallets">
              <Wallet className="w-4 h-4 mr-2" />
              Wallets
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6 space-y-6">
            <AvatarUpload
              currentAvatarUrl={user?.avatarUrl}
              username={user?.username || ''}
              onAvatarChange={() => void refreshUser()}
            />

            <Card>
              <CardHeader>
                <CardTitle>Información del Perfil</CardTitle>
                <CardDescription>Actualice sus datos personales</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Nombre de usuario</Label>
                    <Input id="username" value={user?.username} disabled />
                    <p className="text-xs text-muted-foreground">El nombre de usuario no se puede cambiar</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Nombre</Label>
                    <Input id="firstName" placeholder="Su nombre" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Apellidos</Label>
                    <Input id="lastName" placeholder="Sus apellidos" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEmail(user?.email || '');
                      const parts = user?.fullName?.split(' ') || [];
                      setFirstName(parts[0] || '');
                      setLastName(parts.slice(1).join(' ') || '');
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveProfile} disabled={updateProfileMutation.isPending}>
                    {updateProfileMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notificaciones</CardTitle>
                <CardDescription>Gestione cómo desea recibir alertas y avisos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <Label htmlFor="notif-email">Recibir correos de notificación</Label>
                  <Switch
                    id="notif-email"
                    aria-label="Recibir correos de notificación"
                    checked={notificationPrefs.emailEnabled}
                    onCheckedChange={(checked) => void updateNotificationPreferences({ emailEnabled: checked })}
                  />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <Label htmlFor="notif-shared">Notificaciones de documentos compartidos</Label>
                  <Switch
                    id="notif-shared"
                    aria-label="Notificaciones de documentos compartidos"
                    checked={notificationPrefs.fileShared}
                    onCheckedChange={(checked) => void updateNotificationPreferences({ fileShared: checked })}
                  />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <Label htmlFor="notif-version">Notificaciones de nuevas versiones</Label>
                  <Switch
                    id="notif-version"
                    aria-label="Notificaciones de nuevas versiones"
                    checked={notificationPrefs.newVersion}
                    onCheckedChange={(checked) => void updateNotificationPreferences({ newVersion: checked })}
                  />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <Label htmlFor="notif-push">Notificaciones push en la aplicación</Label>
                  <Switch
                    id="notif-push"
                    aria-label="Notificaciones push en la aplicación"
                    checked={notificationPrefs.pushEnabled}
                    onCheckedChange={(checked) => void updateNotificationPreferences({ pushEnabled: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contraseña</CardTitle>
                <CardDescription>Cambie su contraseña para mantener su cuenta segura</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Contraseña Actual</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm((current) => ({ ...current, currentPassword: e.target.value }))}
                    disabled={changePasswordMutation.isPending}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nueva Contraseña</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm((current) => ({ ...current, newPassword: e.target.value }))}
                    disabled={changePasswordMutation.isPending}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm((current) => ({ ...current, confirmPassword: e.target.value }))}
                    disabled={changePasswordMutation.isPending}
                  />
                </div>
                <Button onClick={handleChangePassword} disabled={changePasswordMutation.isPending}>
                  {changePasswordMutation.isPending ? 'Actualizando...' : 'Actualizar Contraseña'}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Zona de Peligro
                </CardTitle>
                <CardDescription>Acciones irreversibles para su cuenta</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <Trash2 className="w-4 h-4 text-red-600" />
                  <h4 className="font-medium text-red-700 dark:text-red-400">Eliminar cuenta</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Esta acción eliminará permanentemente tu cuenta y todos tus datos de la base de datos.
                </p>
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={deleteAccountMutation.isPending}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {deleteAccountMutation.isPending ? 'Eliminando...' : 'Eliminar mi cuenta'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wallets" className="mt-6 space-y-6">
            <WalletManager autoOpenConnector={searchParams.get('connect') === '1'} />
          </TabsContent>
        </Tabs>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <AlertTriangle className="w-6 h-6" />
              <h2 className="text-lg font-bold">Eliminar cuenta permanentemente</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Esta acción <strong>no se puede deshacer</strong>. Se eliminarán todos tus datos de la aplicación y se desanclarán tus archivos de IPFS.
            </p>
            <div className="flex gap-3 justify-end pt-2">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={() => deleteAccountMutation.mutate()}>
                Confirmar eliminación
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
