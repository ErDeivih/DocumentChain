import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../api/admin';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import { Alert, AlertDescription } from '../components/ui/Alert';
import { Badge } from '../components/ui/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import { AdminPanel } from './AdminPanel';
import { LogsViewer } from '../components/admin/LogsViewer';
import {
  Users,
  FileText,
  Shield,
  TrendingUp,
  AlertCircle,
  UserCheck,
  Database,
  Activity,
  Clock,
} from 'lucide-react';

/**
 * Formatea una cadena de fecha ISO a un formato legible en español.
 * @param dateString - Fecha en formato ISO 8601.
 * @returns Cadena formateada localizada a es-ES.
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

/**
 * Página del panel de administración del sistema.
 *
 * Muestra estadísticas globales, estado de los servicios, distribución de usuarios
 * y actividad reciente mediante pestañas interactivas.
 *
 * @returns JSX.Element con el dashboard administrativo.
 */
export const AdminDashboard: React.FC = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['adminStats'],
    queryFn: adminApi.getSystemStats,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-24 w-full" />
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
          {error instanceof Error ? error.message : 'Failed to load system statistics'}
        </AlertDescription>
      </Alert>
    );
  }

  if (!data?.stats) return null;

  const { stats } = data;

  const systemCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      subtitle: `${stats.totalAdmins} admins, ${stats.totalRegularUsers} regular`,
      icon: <Users className="w-8 h-8" />,
      bgGradient: 'from-blue-500/10 to-blue-600/10',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-200',
    },
    {
      title: 'Total Documents',
      value: stats.totalDocuments.toLocaleString(),
      subtitle: 'Across all users',
      icon: <FileText className="w-8 h-8" />,
      bgGradient: 'from-green-500/10 to-green-600/10',
      iconColor: 'text-green-600',
      borderColor: 'border-green-200',
    },
    {
      title: 'System Status',
      value: 'Operational',
      subtitle: 'All services running',
      icon: <Activity className="w-8 h-8" />,
      bgGradient: 'from-emerald-500/10 to-emerald-600/10',
      iconColor: 'text-emerald-600',
      borderColor: 'border-emerald-200',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {systemCards.map((card, index) => (
          <Card
            key={index}
            className={`border-2 ${card.borderColor} hover:shadow-lg transition-shadow`}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                  <h3 className="text-3xl font-bold text-foreground">{card.value}</h3>
                  <p className="text-xs text-muted-foreground">{card.subtitle}</p>
                </div>
                <div
                  className={`p-3 rounded-xl bg-gradient-to-br ${card.bgGradient}`}
                >
                  <div className={card.iconColor}>{card.icon}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs for different admin sections */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-4xl">
          <TabsTrigger value="overview">
            <TrendingUp className="w-4 h-4 mr-2" />
            Resumen
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="w-4 h-4 mr-2" />
            Gestión de Usuarios
          </TabsTrigger>
          <TabsTrigger value="logs">
            <FileText className="w-4 h-4 mr-2" />
            Logs del Sistema
          </TabsTrigger>
          <TabsTrigger value="activity">
            <Clock className="w-4 h-4 mr-2" />
            Actividad Reciente
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="w-5 h-5 mr-2" />
                Información del Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border border-border/80 bg-white/92 p-4 shadow-[0_10px_24px_-22px_rgba(15,23,42,0.12)]">
                    <span className="text-sm font-medium text-foreground">Estado de Base de Datos</span>
                    <Badge variant="default" className="bg-green-500">En línea</Badge>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-border/80 bg-white/92 p-4 shadow-[0_10px_24px_-22px_rgba(15,23,42,0.12)]">
                    <span className="text-sm font-medium text-foreground">Estado de API</span>
                    <Badge variant="default" className="bg-green-500">Ejecutándose</Badge>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-border/80 bg-white/92 p-4 shadow-[0_10px_24px_-22px_rgba(15,23,42,0.12)]">
                    <span className="text-sm font-medium text-foreground">Clúster IPFS</span>
                    <Badge variant="default" className="bg-green-500">Conectado</Badge>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border border-border/80 bg-white/92 p-4 shadow-[0_10px_24px_-22px_rgba(15,23,42,0.12)]">
                    <span className="text-sm font-medium text-foreground">Blockchain</span>
                    <Badge variant="default" className="bg-green-500">Activo</Badge>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-border/80 bg-white/92 p-4 shadow-[0_10px_24px_-22px_rgba(15,23,42,0.12)]">
                    <span className="text-sm font-medium text-foreground">Servicio de Email</span>
                    <Badge variant="default" className="bg-green-500">Operativo</Badge>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-border/80 bg-white/92 p-4 shadow-[0_10px_24px_-22px_rgba(15,23,42,0.12)]">
                    <span className="text-sm font-medium text-foreground">Backend de Almacenamiento</span>
                    <Badge variant="default" className="bg-green-500">Disponible</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserCheck className="w-5 h-5 mr-2" />
                  Distribución de Usuarios
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border border-sky-200/70 bg-sky-50/85 p-4">
                    <div className="flex items-center space-x-3">
                      <div className="rounded-lg bg-white/90 p-2 shadow-sm">
                        <Shield className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">Administradores</p>
                        <p className="text-xs text-muted-foreground">Acceso total al sistema</p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-blue-600">{stats.totalAdmins}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-border/80 bg-white/92 p-4">
                    <div className="flex items-center space-x-3">
                      <div className="rounded-lg bg-sky-50 p-2 shadow-sm">
                        <Users className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">Usuarios Regulares</p>
                        <p className="text-xs text-muted-foreground">Acceso estándar</p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-foreground">{stats.totalRegularUsers}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Users Management Tab */}
        <TabsContent value="users">
          <AdminPanel />
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs">
          <LogsViewer />
        </TabsContent>

        {/* Recent Activity Tab */}
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
                      className="flex items-center justify-between rounded-lg border border-border/70 bg-white/92 p-4 transition-colors hover:bg-sky-50/35"
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
