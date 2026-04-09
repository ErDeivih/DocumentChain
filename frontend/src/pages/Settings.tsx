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
import { Avatar, AvatarFallback } from '../components/ui/Avatar';
import { TwoFactorSetup } from '../components/auth/TwoFactorSetup';
import { WalletSelectorModal } from '../components/wallets/WalletSelectorModal';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../api/users';
import { authApi } from '../api/auth';
import { getNotificationPreferences, updateNotificationPreferences } from '../api/notifications';
import { getErrorMessage } from '../lib/api';
import {
  User,
  Shield,
  Bell,
  Lock,
  Eye,
  Mail,
  CheckCircle2,
  Wallet,
  Trash2,
  Star,
  Info,
  PauseCircle,
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
  
  const [documentSharing, setDocumentSharing] = useState(true);
  const [notificationSettings, setNotificationSettings] = useState({
    emailEnabled: true,
    pushEnabled: true,
    fileShared: true,
    newVersion: true,
  });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showError, setShowError] = useState<string | null>(null);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [suspensionAction, setSuspensionAction] = useState<'suspend' | 'unsuspend' | null>(null);
  const [pendingReason, setPendingReason] = useState<string | null>(null);
  const [isSuspensionBusy, setIsSuspensionBusy] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'privacy'>(
    user?.isSuspended ? 'privacy' : 'profile'
  );
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
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
      setActiveTab('privacy');
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
      refreshUser(); // Refresh user data in auth context
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
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
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
    if (reason === null) {
      return;
    }

    setPendingReason(reason || null);
    setSuspensionAction('suspend');
    setShowError(null);
    setShowWalletModal(true);
  };

  const beginUnsuspendFlow = () => {
    if (!confirm('¿Reactivar tu cuenta?')) {
      return;
    }

    setPendingReason(null);
    setSuspensionAction('unsuspend');
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
      const nextSettings = {
        ...currentSettings,
        [key]: value,
      };

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
      const preparation = suspensionAction === 'suspend'
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
      const tx = suspensionAction === 'suspend'
        ? await registryContract.suspendMyself()
        : await registryContract.unsuspendMyself();

      await tx.wait();

      if (suspensionAction === 'suspend') {
        const result = await usersApi.confirmSuspendMe(tx.hash, pendingReason || undefined);
        await finishSuspensionFlow(result.message || 'Tu cuenta ha sido suspendida. Solo podrás permanecer en Ajustes hasta reactivarla.');
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
          <TabsTrigger value="security" disabled={!!user?.isSuspended}>
            <Shield className="w-4 h-4 mr-2" />
            Seguridad
          </TabsTrigger>
          <TabsTrigger value="notifications" disabled={!!user?.isSuspended}>
            <Bell className="w-4 h-4 mr-2" />
            Notificaciones
          </TabsTrigger>
          <TabsTrigger value="privacy">
            <Lock className="w-4 h-4 mr-2" />
            Privacidad
          </TabsTrigger>
        </TabsList>

        {/* Pestaña Perfil */}
        <TabsContent value="profile" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información del Perfil</CardTitle>
              <CardDescription>Actualice sus datos personales y perfil público</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="w-20 h-20">
                  <AvatarFallback className="text-2xl">
                    {user?.username?.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm">
                    Cambiar Avatar
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">
                    JPG, PNG o GIF. Tamaño máximo 2MB
                  </p>
                </div>
              </div>

              <Separator />

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

              <div className="p-4 bg-muted/50 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">
                  💡 <strong className="text-foreground">Sobre esta aplicación:</strong> Utiliza tecnología blockchain para garantizar la inmutabilidad y trazabilidad de sus documentos, e IPFS para almacenamiento descentralizado. Sus archivos están protegidos por cifrado de extremo a extremo.
                </p>
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
                  💡 Las wallets se guardan automáticamente cuando las usa para subir o firmar documentos. Puede gestionar hasta 5 wallets.
                </p>
                {user?.isSuspended && (
                  <p className="text-xs text-orange-700 mt-2">
                    Mientras la cuenta esté suspendida no se permiten cambios de wallets. La reactivación debe firmarse con la wallet principal actual.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pestaña Seguridad */}
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

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Seguridad Blockchain
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                🔐 Su cuenta está protegida por cifrado RSA de 2048 bits. Cada documento que sube se cifra con su clave pública, y solo usted puede descifrarlo con su clave privada. Las transacciones se firman con su wallet de blockchain, garantizando autenticidad e inmutabilidad.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sesiones Activas</CardTitle>
              <CardDescription>Dispositivos donde ha iniciado sesión actualmente</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Windows PC - Chrome</p>
                    <p className="text-sm text-muted-foreground">Última actividad: Ahora mismo</p>
                  </div>
                  <Badge variant="success">Actual</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pestaña Notificaciones */}
        <TabsContent value="notifications" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notificaciones por Email</CardTitle>
              <CardDescription>Gestione cómo recibe las notificaciones por email</CardDescription>
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
                  <Shield className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Alertas de Seguridad</p>
                    <p className="text-sm text-muted-foreground">
                      Notificaciones importantes de seguridad (siempre activo)
                    </p>
                  </div>
                </div>
                <Switch checked disabled />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notificaciones Push</CardTitle>
              <CardDescription>Reciba notificaciones en tiempo real en su navegador</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Información sobre Notificaciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                🔔 Recibirá notificaciones cuando se registren eventos importantes en la blockchain: nuevos documentos compartidos, firmas realizadas, transferencias de propiedad y actualizaciones de versiones. Todas estas operaciones quedan registradas de forma permanente e inmutable.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pestaña Privacidad */}
        <TabsContent value="privacy" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Privacidad</CardTitle>
              <CardDescription>Controle quién puede ver su información</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Visibilidad del Perfil</p>
                    <p className="text-sm text-muted-foreground">
                      Haga su perfil visible para otros usuarios
                    </p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Compartir Documentos</p>
                    <p className="text-sm text-muted-foreground">
                      Permitir que otros le compartan documentos
                    </p>
                  </div>
                </div>
                <Switch
                  checked={documentSharing}
                  onCheckedChange={setDocumentSharing}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Exportación de Datos</CardTitle>
              <CardDescription>Descargue una copia de sus datos</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline">Solicitar Exportación de Datos</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                Tecnología y Seguridad
              </CardTitle>
              <CardDescription>
                Información sobre cómo protegemos y almacenamos sus documentos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <span>🌐</span> IPFS - Almacenamiento Descentralizado
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Sus documentos se almacenan en IPFS (InterPlanetary File System), una red descentralizada que garantiza disponibilidad permanente. Los archivos no están en un servidor central, sino distribuidos en múltiples nodos. La dirección IPFS (CID) se registra en la blockchain para verificar integridad.
                </p>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <Lock className="w-4 h-4" /> Cifrado de Extremo a Extremo
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Cuando activa el cifrado al subir documentos, solo usted puede leerlos. El archivo se cifra antes de salir de su navegador usando AES-256-GCM. La clave simétrica se cifra con su clave pública RSA. Ni nosotros ni nadie con acceso al CID de IPFS puede descifrar sus archivos sin su clave privada.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Zona de Peligro</CardTitle>
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

              <div className="space-y-2">
                <Button variant="destructive">Eliminar Cuenta</Button>
                <p className="text-xs text-muted-foreground">
                  Esto eliminará permanentemente su cuenta y todos los datos asociados
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>

      <WalletSelectorModal
        isOpen={showWalletModal}
        onClose={resetSuspensionState}
        onSelect={handleSuspensionWalletSelected}
        title={suspensionAction === 'suspend' ? 'Firmar suspensión de cuenta' : 'Firmar reactivación de cuenta'}
        description={suspensionAction === 'suspend'
          ? 'Conecte la wallet principal para firmar la suspensión en blockchain y después confirmar el cambio en la aplicación.'
          : 'Conecte la wallet principal para firmar la reactivación en blockchain y después confirmar el cambio en la aplicación.'}
      />
    </>
  );
};
