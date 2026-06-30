import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../api/admin';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import { Alert, AlertDescription } from '../components/ui/Alert';
import { Badge } from '../components/ui/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import { AdminPanel } from './AdminPanel';
import {
  Users,
  Shield,
  TrendingUp,
  AlertCircle,
  UserCheck,
  Database,
  Clock,
} from 'lucide-react';

/**
 * Formatea una cadena de fecha ISO a un formato legible en español.
 */
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const AdminDashboard: React.FC = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['adminStats'],
    queryFn: adminApi.getSystemStats,
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-40 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error instanceof Error ? error.message : 'Error al cargar las estadísticas del sistema'}
        </AlertDescription>
      </Alert>
    );
  }

  if (!data?.stats) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Panel de Administración</h1>
        <Card>
          <CardContent className="text-center py-12 text-muted-foreground">
            No se pudieron cargar las estadísticas.
          </CardContent>
        </Card>
      </div>
    );
  }

  const { stats } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Panel de Administración</h1>
          <p className="mt-1 text-muted-foreground">Resumen del sistema y gestión</p>
        </div>
        <Badge variant="outline" className="px-4 py-2">
          <Shield className="w-4 h-4 mr-2" />
          Administrador
        </Badge>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full max-w-4xl">
          <TabsTrigger value="overview">
            <TrendingUp className="w-4 h-4 mr-2" />
            Resumen
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="w-4 h-4 mr-2" />
            Gestión de Usuarios
          </TabsTrigger>
          <TabsTrigger value="activity">
            <Clock className="w-4 h-4 mr-2" />
            Actividad Reciente
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserCheck className="w-5 h-5 mr-2" />
                  Usuarios
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium">Administradores</p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-blue-600">{stats.totalAdmins}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Usuarios</p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold">{stats.totalRegularUsers}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div className="flex items-center gap-3">
                      <Database className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Documentos</p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold">{stats.totalDocuments}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <AdminPanel />
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Usuarios Registrados Recientemente
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.recentUsers && stats.recentUsers.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentUsers.map((user, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg border border-border/70 bg-white p-4"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="rounded-lg border border-border bg-sky-50 p-2">
                          {user.role === 'ADMIN' ? (
                            <Shield className="w-5 h-5 text-blue-600" />
                          ) : (
                            <Users className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{user.username}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={user.role === 'ADMIN' ? 'default' : 'outline'}>
                          {user.role}
                        </Badge>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatDate(user.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-8 text-center text-muted-foreground">No hay usuarios recientes</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
