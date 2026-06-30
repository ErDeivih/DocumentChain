import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { useToast } from '../components/ui/Toast';
import { adminApi } from '../api/admin';
import { uint8ArrayToBase64 } from '../lib/crypto/utils';
import { generateKeyMaterial } from '../lib/crypto/keyGeneration';
import { RecoveryKeyDisplay } from '../components/auth/RecoveryKeyDisplay';
import {
  Users,
  UserPlus,
  Shield,
  Trash2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface User {
    id: string;
    username: string;
    email: string;
    fullName: string | null;
    role: 'USER' | 'ADMIN';
    createdAt: string;
    _count: {
        documents: number;
        wallets: number;
        sessions: number;
  };
}

/**
 * Datos requeridos para el formulario de creación de un administrador.
 */
interface CreateAdminForm {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    fullName: string;
}

/**
 * Página de gestión de usuarios para administradores.
 *
 * Permite listar usuarios, crear nuevos administradores, modificar roles
 * y eliminar cuentas. Incluye visualización de estadísticas básicas.
 *
 * @returns JSX.Element con el panel de administración de usuarios.
 */
export const AdminPanel: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateAdminForm>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
  });
  const [recoveryKey, setRecoveryKey] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: usersData, isLoading, error: usersError } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: adminApi.getAllUsers,
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: 'USER' | 'ADMIN' }) => {
      return adminApi.updateUserRole(userId, role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast({
        title: 'Éxito',
        description: 'Rol de usuario actualizado correctamente',
        variant: 'success',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Error al actualizar el rol',
        variant: 'destructive',
      });
    },
  });

  const createAdminMutation = useMutation({
    mutationFn: adminApi.createAdminUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      setFormData({ username: '', email: '', password: '', confirmPassword: '', fullName: '' });
      toast({
        title: 'Éxito',
        description: 'Usuario administrador creado correctamente',
        variant: 'success',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Error al crear el administrador',
        variant: 'destructive',
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: adminApi.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast({ title: 'Éxito', description: 'Usuario eliminado correctamente', variant: 'success' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.response?.data?.error || 'Error al eliminar el usuario', variant: 'destructive' });
    },
  });

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    if (formData.password !== formData.confirmPassword) {
      setPasswordError('Las contraseñas no coinciden');
      return;
    }
    if (formData.password.length < 8) {
      setPasswordError('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    if (!/[A-Z]/.test(formData.password) || !/[a-z]/.test(formData.password) || !/\d/.test(formData.password)) {
      setPasswordError('La contraseña debe incluir al menos una mayúscula, una minúscula y un número');
      return;
    }

    try {
      // Generar par de claves RSA y recovery key en el navegador (mismo patrón que Register)
      const crypto = await generateKeyMaterial(formData.password);

      const { confirmPassword: _cp, ...adminData } = formData;
      createAdminMutation.mutate({
        ...adminData,
        publicKey: crypto.keyPair.publicKey,
        encryptedPrivateKey: crypto.keyPair.encryptedPrivateKey,
        salt: crypto.keyPair.salt,
        recoveryKeyHash: crypto.recoveryKeyHash,
        encryptedPrivateKeyRecovery: crypto.encryptedPrivateKeyRecovery,
        recoveryKeySalt: uint8ArrayToBase64(crypto.recoveryKeySalt),
      });

      // Mostrar clave de recuperación generada localmente
      setRecoveryKey(crypto.recoveryKey);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.message || 'Error al generar las claves criptográficas',
        variant: 'destructive',
      });
    }
  };

  const handleToggleRole = (userId: string, currentRole: 'USER' | 'ADMIN') => {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    const confirmMsg = currentRole === 'ADMIN'
      ? '¿Está seguro de que desea eliminar los privilegios de administrador?'
      : '¿Está seguro de que desea otorgar privilegios de administrador?';
    
    if (confirm(confirmMsg)) {
      updateRoleMutation.mutate({ userId, role: newRole });
    }
  };

  const handleDeleteUser = (userId: string, username: string) => {
    if (confirm(`¿Está seguro de que desea eliminar el usuario "${username}"? Esta acción no se puede deshacer.`)) {
      deleteUserMutation.mutate(userId);
    }
  };

  const users = usersData?.users || [];
  const admins = users.filter((u: any) => u.role === 'ADMIN');
  const regularUsers = users.filter((u: any) => u.role === 'USER');

  if (usersError) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Panel de Administración</h1>
        <div className="text-center py-12 text-red-500">Error al cargar usuarios. Inténtalo de nuevo.</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Panel de Administración</h1>
        <div className="text-center py-12">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Panel de Administración</h1>
        <Button onClick={() => setIsCreating(!isCreating)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Crear Administrador
        </Button>
      </div>

      {/* Crear nuevo admin */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Crear Nuevo Usuario Administrador</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <Input
                label="Nombre de usuario"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
                placeholder="admin2"
              />
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                placeholder="admin2@ejemplo.com"
              />
              <Input
                label="Contraseña"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                helperText="Mínimo 6 caracteres"
              />
              <Input
                label="Confirmar contraseña"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => {
                  setPasswordError('');
                  setFormData({ ...formData, confirmPassword: e.target.value });
                }}
                required
              />
              {passwordError && (
                <p className="text-sm text-red-600 -mt-2">{passwordError}</p>
              )}
              <Input
                label="Nombre completo (opcional)"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Juan García"
              />
              <div className="flex gap-3">
                <Button type="submit" isLoading={createAdminMutation.isPending}>
                  Crear Administrador
                </Button>
                <Button type="button" variant="ghost" onClick={() => setIsCreating(false)}>
                  Cancelar
                </Button>
              </div>
            </form>

            {recoveryKey && (
              <RecoveryKeyDisplay
                isOpen={true}
                recoveryKey={recoveryKey}
                onClose={() => { setRecoveryKey(null); setIsCreating(false); }}
              />
            )}

            <p className="text-sm text-slate-500 mt-4">
              El nuevo administrador deberá conectar una wallet Ethereum desde Configuración {'>'} Wallets para firmar transacciones blockchain. Hasta entonces, solo podrá realizar consultas y verificaciones públicas.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Lista de Admins */}
      <Card>
        <CardHeader>
          <CardTitle>Administradores ({admins.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {admins.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No se encontraron administradores</p>
          ) : (
            <div className="space-y-2">
              {admins.map((user: any) => (
                <UserRow
                  key={user.id}
                  user={user}
                  expanded={expandedUser === user.id}
                  onToggleExpand={() => setExpandedUser(expandedUser === user.id ? null : user.id)}
                  onToggleRole={handleToggleRole}
                  onDelete={handleDeleteUser}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista de Usuarios Regulares */}
      <Card>
        <CardHeader>
          <CardTitle>Usuarios Regulares ({regularUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {regularUsers.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No se encontraron usuarios regulares</p>
          ) : (
            <div className="space-y-2">
              {regularUsers.map((user: any) => (
                <UserRow
                  key={user.id}
                  user={user}
                  expanded={expandedUser === user.id}
                  onToggleExpand={() => setExpandedUser(expandedUser === user.id ? null : user.id)}
                  onToggleRole={handleToggleRole}
                  onDelete={handleDeleteUser}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * Propiedades del componente de fila de usuario expandible.
 */
interface UserRowProps {
    user: User;
    expanded: boolean;
    onToggleExpand: () => void;
    onToggleRole: (userId: string, currentRole: 'USER' | 'ADMIN') => void;
    onDelete: (userId: string, username: string) => void;
}

/**
 * Componente interno que renderiza una fila expandible con los datos de un usuario.
 *
 * @param props - Propiedades del componente.
 * @returns JSX.Element con la fila de usuario.
 */
const UserRow: React.FC<UserRowProps> = ({ user, expanded, onToggleExpand, onToggleRole, onDelete }) => {
  return (
    <div className="border rounded-lg">
      <div className="flex items-center justify-between p-4 hover:bg-accent cursor-pointer" onClick={onToggleExpand}>
        <div className="flex items-center gap-4 flex-1">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary/10">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-medium">{user.username}</p>
              <Badge variant={user.role === 'ADMIN' ? 'destructive' : 'secondary'}>
                {user.role}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => { e.stopPropagation(); onToggleRole(user.id, user.role); }}
            title={user.role === 'ADMIN' ? 'Degradar a Usuario' : 'Promover a Admin'}
          >
            <Shield className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => { e.stopPropagation(); onDelete(user.id, user.username); }}
            className="text-destructive hover:text-destructive"
            title="Eliminar usuario permanentemente"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 pt-2 bg-accent/50 space-y-2 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-muted-foreground">Nombre Completo</p>
              <p className="font-medium">{user.fullName || 'No establecido'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Creado</p>
              <p className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Documentos</p>
              <p className="font-medium">{user._count.documents}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Wallets</p>
              <p className="font-medium">{user._count.wallets}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Sesiones Activas</p>
              <p className="font-medium">{user._count.sessions}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
