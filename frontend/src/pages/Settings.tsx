import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Button } from '../components/ui/Button';
import { Switch } from '../components/ui/Switch';
import { Badge } from '../components/ui/Badge';
import { Separator } from '../components/ui/Separator';
import { TwoFactorSetup } from '../components/auth/TwoFactorSetup';
import { WalletSelectorModal } from '../components/wallets/WalletSelectorModal';
import { AvatarUpload } from '../components/user/AvatarUpload';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../api/users';
import { authApi } from '../api/auth';
import { getNotificationPreferences, updateNotificationPreferences } from '../api/notifications';
import { getErrorMessage } from '../lib/api';
import {
  User,
  Shield,
  Bell,
  Mail,
  CheckCircle2,
  Wallet,
  Trash2,
  Star,
  Info,
  PauseCircle,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { SavedWallet, useWalletManager } from '../contexts/WalletManagerContext';
import { blockchainProvider } from '../lib/blockchain/provider';
import { DocumentRegistryContract } from '../lib/blockchain/contracts';

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { user, refreshUser, logout } = useAuth();
  const queryClient = useQueryClient();
  const { savedWallets, removeWallet, setPrimaryWallet } = useWalletManager();

  const [notificationSettings, setNotificationSettings] = useState({
    emailEnabled: true,
    pushEnabled: true,
    fileShared: true,
    newVersion: true,
  });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showError, setShowError] = useState<string | null>(null);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [suspensionAction, setSuspensionAction] = useState<'suspend' | 'unsuspend' | 'delete' | null>(null);
  const [pendingReason, setPendingReason] = useState<string | null>(null);
  const [isSuspensionBusy, setIsSuspensionBusy] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>(
    user?.isSuspended ? 'security' : 'profile'
  );
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Profile form state
  const [email, setEmail] = useState(user?.email || '');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const notificationSaveQueueRef = useRef(Promise.resolve());

  const { data: notificationPreferences, isLoading: isLoadingNotificationPreferences } = useQuery({
    queryKey: ['notification-preferences'],
    queryFn: getNotificationPreferences,
    enabled: Boolean(user) && !user?.isSuspended,
  });

  // Parse fullName into firstName and lastName on mount
  useEffect(() => {
    if (user?.fullName) {
      const parts = user.fullName.split(' ');
      setFirstName(parts[0] || '');
      setLastName(parts.slice(1).join(' ') || '');
    }
    setEmail(user?.email || '');

    if (user?.isSuspended) {
      setActiveTab('security');
    }
  }, [user]);

  useEffect(() => {
    if (!notificationPreferences) {
      return;
    }

    setNotificationSettings({
      emailEnabled: notificationPreferences.emailEnabled,
      pushEnabled: notificationPreferences.pushEnabled,
      fileShared: notificationPreferences.typePreferences?.FILE_SHARED ?? true,
      newVersion: notificationPreferences.typePreferences?.NEW_VERSION ?? true,
    });
  }, [notificationPreferences]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: { fullName?: string; email?: string }) => usersApi.updateProfile(data),
    onSuccess: () => {
      setSuccessMessage('Configuración guardada correctamente.');
      setShowError(null);
      setTimeout(() => setSuccessMessage(null), 3000);
      refreshUser();
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error: any) => {
      setShowError(error.message || 'Error al actualizar el perfil');
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
      setShowError(getDetailedError(error));
      setTimeout(() => setShowError(null), 5000);
    },
  });

  const updateNotificationPreferencesMutation = useMutation({
    mutationFn: updateNotificationPreferences,
    onSuccess: (preferences) => {
      queryClient.setQueryData(['notification-preferences'], preferences);
      setSuccessMessage('Preferencias de notificación actualizadas.');
      setShowError(null);
      setTimeout(() => setSuccessMessage(null), 3000);
    },
    onError: (error: unknown) => {
      setShowError(getDetailedError(error));
      setTimeout(() => setShowError(null), 5000);
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async (txHash: string) => {
      await usersApi.deleteAccount(txHash);
    },
    onSuccess: async () => {
      setSuccessMessage('Cuenta eliminada permanentemente.');
      setShowError(null);
      await logout();
      navigate('/', { replace: true });
    },
    onError: (error: unknown) => {
      setShowError(getDetailedError(error));
      setTimeout(() => setShowError(null), 5000);
    },
  });

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

  const handleRemoveWallet = async (walletId: string) => {
    if (confirm('¿Está seguro de que desea eliminar esta wallet?')) {
      try {
        await removeWallet(walletId);
      } catch (error: any) {
        setShowError(error.message || 'Error al eliminar wallet');
        setTimeout(() => setShowError(null), 5000);
      }
    }
  };

  const handleSetPrimary = async (walletId: string) => {
    try {
      await setPrimaryWallet(walletId);
    } catch (error: any) {
      setShowError(error.message || 'Error al establecer wallet principal');
      setTimeout(() => setShowError(null), 5000);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const finishSuspensionFlow = async (message: string) => {
    await refreshUser();
    await queryClient.invalidateQueries({ queryKey: ['user'] });
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const beginSuspendFlow = () => {
    const reason = prompt('Motivo de suspensión (opcional):');
    if (reason === null) return;
    setPendingReason(reason || null);
    setSuspensionAction('suspend');
    setShowError(null);
    setShowWalletModal(true);
  };

  const beginUnsuspendFlow = () => {
    if (!confirm('¿Reactivar tu cuenta?')) return;
    setPendingReason(null);
    setSuspensionAction('unsuspend');
    setShowError(null);
    setShowWalletModal(true);
  };

  const beginDeleteFlow = () => {
    setShowDeleteConfirm(false);
    setPendingReason(null);
    setSuspensionAction('delete');
    setShowError(null);
    setShowWalletModal(true);
  };

  const resetSuspensionState = () => {
    setShowWalletModal(false);
    setSuspensionAction(null);
    setPendingReason(null);
    setIsSuspensionBusy(false);
  };

  const getDetailedError = (error: unknown) => {
    const detailedMessage = (error as any)?.response?.data?.error;
    return typeof detailedMessage === 'string' ? detailedMessage : getErrorMessage(error);
  };

  const persistNotificationSettings = (nextSettings: typeof notificationSettings) => {
    notificationSaveQueueRef.current = notificationSaveQueueRef.current
      .catch(() => undefined)
      .then(async () => {
        await updateNotificationPreferencesMutation.mutateAsync({
          emailEnabled: nextSettings.emailEnabled,
          pushEnabled: nextSettings.pushEnabled,
          typePreferences: {
            FILE_SHARED: nextSettings.fileShared,
            NEW_VERSION: nextSettings.newVersion,
          },
        });
      });
  };

  const handleNotificationToggle = (key: keyof typeof notificationSettings, value: boolean) => {
    setSuccessMessage(null);
    setNotificationSettings((currentSettings) => {
      const nextSettings = { ...currentSettings, [key]: value };
      persistNotificationSettings(nextSettings);
      return nextSettings;
    });
  };

  const handleSuspensionWalletSelected = async (wallet: SavedWallet | null, connectedAddress: string) => {
    setShowWalletModal(false);

    if (!suspensionAction) {
      return;
    }

    setIsSuspensionBusy(true);
    setShowError(null);

    try {
      const preparation = suspensionAction === 'suspend' || suspensionAction === 'delete'
        ? await usersApi.prepareSuspendMe(pendingReason || undefined)
        : await usersApi.prepareUnsuspendMe();

      const requiredAddress = preparation.wallet.address.toLowerCase();
      if (connectedAddress.toLowerCase() !== requiredAddress) {
        throw new Error('Debes conectar la wallet principal de la cuenta para completar esta operación.');
      }

      if (wallet && wallet.id !== preparation.wallet.id) {
        throw new Error('La wallet seleccionada no coincide con la wallet principal configurada.');
      }

      const signer = blockchainProvider.getSigner();
      if (!signer) {
        throw new Error('No hay una wallet conectada para firmar la transacción.');
      }

      const signerAddress = await signer.getAddress();
      if (signerAddress.toLowerCase() !== requiredAddress) {
        throw new Error('La wallet conectada no coincide con la wallet principal requerida.');
      }

      const registryContract = new DocumentRegistryContract(signer);
      const tx = suspensionAction === 'unsuspend'
        ? await registryContract.unsuspendMyself()
        : await registryContract.suspendMyself();

      await tx.wait();

      if (suspensionAction === 'delete') {
        await deleteAccountMutation.mutateAsync(tx.hash);
        return;
      }

      if (suspensionAction === 'suspend') {
        const result = await usersApi.confirmSuspendMe(tx.hash, pendingReason || undefined);
        await finishSuspensionFlow(result.message || 'Tu cuenta ha sido suspendida.');
      } else {
        const result = await usersApi.confirmUnsuspendMe(tx.hash);
        await finishSuspensionFlow(result.message || 'Tu cuenta ha sido reactivada.');
      }
    } catch (error) {
      setShowError(getDetailedError(error));
    } finally {
      resetSuspensionState();
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

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)} className="w-full">
          <TabsList>
            <TabsTrigger value="profile" disabled={!!user?.isSuspended}>
              <User className="w-4 h-4 mr-2" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="security">
              <Shield className="w-4 h-4 mr-2" />
              Seguridad y Cuenta
            </TabsTrigger>
          </TabsList>

          {/* Pestaña Perfil */}
          <TabsContent value="profile" className="mt-6 space-y-6">
            {/* Avatar */}
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
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Nombre</Label>
                    <Input
                      id="firstName"
                      placeholder="Su nombre"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Apellidos</Label>
                    <Input
                      id="lastName"
                      placeholder="Sus apellidos"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
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
                  >Cancelar</Button>
                  <Button
                    onClick={handleSaveProfile}
                    disabled={updateProfileMutation.isPending}
                  >
                    {updateProfileMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Wallets de Blockchain</CardTitle>
                    <CardDescription>Gestione sus wallets para firmas de documentos</CardDescription>
                  </div>
                  <Badge variant="outline">
                    {savedWallets.length}/5 Wallets
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {savedWallets.length === 0 ? (
                  <div className="text-center py-8">
                    <Wallet className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground">
                      No tiene wallets guardadas. Conecte una wallet al subir o firmar un documento.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {savedWallets.map((wallet) => (
                      <div
                        key={wallet.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Wallet className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{wallet.label}</p>
                              {wallet.isPrimary && (
                                <Badge variant="default" className="text-xs">
                                  <Star className="w-3 h-3 mr-1" />
                                  Principal
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground font-mono">
                              {formatAddress(wallet.walletAddress)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!wallet.isPrimary && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleSetPrimary(wallet.id)}
                              disabled={!!user?.isSuspended}
                              title="Establecer como principal"
                            >
                              <Star className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveWallet(wallet.id)}
                            disabled={!!user?.isSuspended}
                            className="text-destructive hover:text-destructive"
                            title="Eliminar wallet"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground">
                    Las wallets se guardan automáticamente cuando las usa para subir o firmar documentos. Puede gestionar hasta 5 wallets.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pestaña Seguridad y Cuenta */}
          <TabsContent value="security" className="mt-6 space-y-6">
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
                    onChange={(e) => setPasswordForm((current) => ({
                      ...current,
                      currentPassword: e.target.value,
                    }))}
                    disabled={changePasswordMutation.isPending}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nueva Contraseña</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm((current) => ({
                      ...current,
                      newPassword: e.target.value,
                    }))}
                    disabled={changePasswordMutation.isPending}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm((current) => ({
                      ...current,
                      confirmPassword: e.target.value,
                    }))}
                    disabled={changePasswordMutation.isPending}
                  />
                </div>
                <Button
                  onClick={handleChangePassword}
                  disabled={changePasswordMutation.isPending}
                >
                  {changePasswordMutation.isPending ? 'Actualizando...' : 'Actualizar Contraseña'}
                </Button>
              </CardContent>
            </Card>

            {/* 2FA Component */}
            <TwoFactorSetup />

            {/* Notificaciones (integrado en Seguridad y Cuenta) */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notificaciones
                </CardTitle>
                <CardDescription>Gestione cómo recibe las notificaciones</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Recibir correos de notificación</p>
                      <p className="text-sm text-muted-foreground">
                        Habilita o deshabilita el envío de avisos por correo electrónico
                      </p>
                    </div>
                  </div>
                  <Switch
                    aria-label="Recibir correos de notificación"
                    checked={notificationSettings.emailEnabled}
                    onCheckedChange={(checked) => handleNotificationToggle('emailEnabled', checked)}
                    disabled={isLoadingNotificationPreferences || updateNotificationPreferencesMutation.isPending}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Actividad de Documentos</p>
                      <p className="text-sm text-muted-foreground">
                        Reciba notificaciones cuando le compartan documentos
                      </p>
                    </div>
                  </div>
                  <Switch
                    aria-label="Notificaciones de documentos compartidos"
                    checked={notificationSettings.fileShared}
                    onCheckedChange={(checked) => handleNotificationToggle('fileShared', checked)}
                    disabled={isLoadingNotificationPreferences || updateNotificationPreferencesMutation.isPending || !notificationSettings.emailEnabled}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Actualizaciones de Versiones</p>
                      <p className="text-sm text-muted-foreground">
                        Notificaciones cuando se suban nuevas versiones
                      </p>
                    </div>
                  </div>
                  <Switch
                    aria-label="Notificaciones de nuevas versiones"
                    checked={notificationSettings.newVersion}
                    onCheckedChange={(checked) => handleNotificationToggle('newVersion', checked)}
                    disabled={isLoadingNotificationPreferences || updateNotificationPreferencesMutation.isPending || !notificationSettings.emailEnabled}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Notificaciones en la aplicación</p>
                      <p className="text-sm text-muted-foreground">
                        Muestra avisos en tiempo real mientras tenga la sesión abierta
                      </p>
                    </div>
                  </div>
                  <Switch
                    aria-label="Notificaciones push en la aplicación"
                    checked={notificationSettings.pushEnabled}
                    onCheckedChange={(checked) => handleNotificationToggle('pushEnabled', checked)}
                    disabled={isLoadingNotificationPreferences || updateNotificationPreferencesMutation.isPending}
                  />
                </div>

                {isLoadingNotificationPreferences && (
                  <p className="text-sm text-muted-foreground">Cargando preferencias de notificación...</p>
                )}
              </CardContent>
            </Card>

            {/* Zona de Peligro */}
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Zona de Peligro
                </CardTitle>
                <CardDescription>Acciones irreversibles para su cuenta</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Auto-suspensión / reactivación */}
                <div className="space-y-2">
                  {user?.isSuspended ? (
                    <>
                      <div className="flex items-center gap-2">
                        <PauseCircle className="w-4 h-4 text-orange-600" />
                        <h4 className="font-medium text-orange-700 dark:text-orange-400">Cuenta suspendida</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Tu cuenta está actualmente suspendida. Tus wallets están bloqueadas en la blockchain y no puedes interactuar con tus documentos.
                        {user.suspendReason && <span className="block mt-1">Motivo: <em>{user.suspendReason}</em></span>}
                      </p>
                      <Button
                        variant="outline"
                        className="border-green-500 text-green-700 hover:bg-green-50 dark:text-green-400"
                        onClick={beginUnsuspendFlow}
                        disabled={isSuspensionBusy}
                      >
                        <PauseCircle className="w-4 h-4 mr-2" />
                        {isSuspensionBusy && suspensionAction === 'unsuspend' ? 'Reactivando...' : 'Reactivar mi cuenta'}
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <PauseCircle className="w-4 h-4 text-orange-600" />
                        <h4 className="font-medium text-orange-700 dark:text-orange-400">Suspender mi cuenta</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Suspende tu cuenta temporalmente. Tu wallet quedará bloqueada en la blockchain y no podrás acceder al sistema ni interactuar con tus documentos. Tus datos no se eliminarán y podrás reactivarla cuando quieras.
                      </p>
                      <Button
                        variant="outline"
                        className="border-orange-400 text-orange-700 hover:bg-orange-50 dark:text-orange-400"
                        onClick={beginSuspendFlow}
                        disabled={isSuspensionBusy}
                      >
                        <PauseCircle className="w-4 h-4 mr-2" />
                        {isSuspensionBusy && suspensionAction === 'suspend' ? 'Suspendiendo...' : 'Suspender mi cuenta'}
                      </Button>
                    </>
                  )}
                </div>

                <Separator />

                {/* Eliminar cuenta */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-red-600" />
                    <h4 className="font-medium text-red-700 dark:text-red-400">Eliminar cuenta</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Esta acción eliminará permanentemente tu cuenta y todos tus datos de la base de datos. Tus documentos en blockchain permanecerán inmutables. Requiere firma con tu wallet principal.
                  </p>
                  <Button
                    variant="destructive"
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={isSuspensionBusy || deleteAccountMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {deleteAccountMutation.isPending ? 'Eliminando...' : 'Eliminar mi cuenta'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal de confirmación para eliminar cuenta */}
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
            <p className="text-sm text-muted-foreground">
              Tus documentos registrados en blockchain permanecerán inmutables, pero perderás el acceso a ellos desde esta aplicación.
            </p>
            <p className="text-sm text-muted-foreground">
              Se requiere firmar una transacción <code>suspendMyself</code> en la blockchain para completar la eliminación.
            </p>
            <div className="flex gap-3 justify-end pt-2">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={beginDeleteFlow}>
                Confirmar eliminación
              </Button>
            </div>
          </div>
        </div>
      )}

      <WalletSelectorModal
        isOpen={showWalletModal}
        onClose={resetSuspensionState}
        onSelect={handleSuspensionWalletSelected}
        title={
          suspensionAction === 'delete'
            ? 'Firmar eliminación de cuenta'
            : suspensionAction === 'suspend'
              ? 'Firmar suspensión de cuenta'
              : 'Firmar reactivación de cuenta'
        }
        description={
          suspensionAction === 'delete'
            ? 'Conecte la wallet principal para firmar la eliminación en blockchain. Esta acción es irreversible.'
            : suspensionAction === 'suspend'
              ? 'Conecte la wallet principal para firmar la suspensión en blockchain y después confirmar el cambio en la aplicación.'
              : 'Conecte la wallet principal para firmar la reactivación en blockchain y después confirmar el cambio en la aplicación.'
        }
      />
    </>
  );
};

export default Settings;
