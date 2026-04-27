import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { useToast } from '../components/ui/Toast';
import { api } from '../lib/api';
import { copyToClipboard } from '../lib/utils';
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
  twoFactorEnabled: boolean;
  _count: {
    documents: number;
    wallets: number;
    sessions: number;
  };
}

interface CreateAdminForm {
  username: string;
  email: string;
  password: string;
  fullName: string;
}

export const AdminPanel: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateAdminForm>({
    username: '',
    email: '',
    password: '',
    fullName: '',
  });
  const [recoveryKey, setRecoveryKey] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const response = await api.get<{ users: User[] }>('/admin/users');
      return response.data;
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: 'USER' | 'ADMIN' }) => {
      const response = await api.put(`/admin/users/${userId}/role`, { role });
      return response.data;
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
    mutationFn: async (data: CreateAdminForm) => {
      const response = await api.post<{ user: User; recoveryKey: string }>('/admin/users', data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      setRecoveryKey(data.recoveryKey);
      setFormData({ username: '', email: '', password: '', fullName: '' });
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
    mutationFn: async (userId: string) => {
      await api.delete(`/admin/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast({ title: 'Éxito', description: 'Usuario eliminado correctamente', variant: 'success' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.response?.data?.error || 'Error al eliminar el usuario', variant: 'destructive' });
    },
  });

  const handleCreateAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    createAdminMutation.mutate(formData);
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
  const admins = users.filter(u => u.role === 'ADMIN');
  const regularUsers = users.filter(u => u.role === 'USER');

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
          Crear Admin
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
                label="Nombre completo (opcional)"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Juan García"
              />
              <div className="flex gap-3">
                <Button type="submit" isLoading={createAdminMutation.isPending}>
                  Crear Admin
                </Button>
                <Button type="button" variant="ghost" onClick={() => setIsCreating(false)}>
                  Cancelar
                </Button>
              </div>
            </form>

            {recoveryKey && (
              <div className="mt-4 rounded-xl border border-warning-700/30 bg-warning-900/20 p-4">
                <p className="text-sm font-medium text-warning-800 mb-2">
                  ⚠️ Guarde esta clave de recuperación - no se volverá a mostrar!
                </p>
                <code className="block break-all rounded-lg border border-primary/20 bg-slate-950 p-2 text-xs text-primary-50">
                  {recoveryKey}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2"
                  onClick={async () => {
                    try {
                      await copyToClipboard(recoveryKey);
                      toast({
                        title: 'Copiado',
                        description: 'Clave de recuperación copiada al portapapeles',
                        variant: 'success',
                      });
                    } catch {
                      toast({
                        title: 'Error',
                        description: 'No se pudo copiar automáticamente la clave de recuperación',
                        variant: 'destructive',
                      });
                    }
                  }}
                >
                  Copiar al Portapapeles
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Usuarios Totales</p>
                <p className="text-3xl font-bold">{users.length}</p>
              </div>
              <Users className="w-12 h-12 text-primary opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Administradores</p>
                <p className="text-3xl font-bold">{admins.length}</p>
              </div>
              <Shield className="w-12 h-12 text-destructive opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Usuarios Regulares</p>
                <p className="text-3xl font-bold">{regularUsers.length}</p>
              </div>
              <Users className="w-12 h-12 text-success-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

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
              {admins.map((user) => (
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
              {regularUsers.map((user) => (
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

interface UserRowProps {
  user: User;
  expanded: boolean;
  onToggleExpand: () => void;
  onToggleRole: (userId: string, currentRole: 'USER' | 'ADMIN') => void;
  onDelete: (userId: string, username: string) => void;
}

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
              {user.twoFactorEnabled && (
                <Badge variant="success" className="text-xs">2FA</Badge>
              )}
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
            <div>
              <p className="text-muted-foreground">Estado 2FA</p>
              <p className="font-medium">{user.twoFactorEnabled ? 'Habilitado' : 'Deshabilitado'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
