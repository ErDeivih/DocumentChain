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
  HardDrive,
  Shield,
  TrendingUp,
  AlertCircle,
  UserCheck,
  Database,
  Activity,
  Clock,
} from 'lucide-react';

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

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
  const storageUsed = parseInt(stats.totalStorageUsed || '0');

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
      title: 'Storage Used',
      value: formatBytes(storageUsed),
      subtitle: 'Total system storage',
      icon: <HardDrive className="w-8 h-8" />,
      bgGradient: 'from-purple-500/10 to-purple-600/10',
      iconColor: 'text-purple-600',
      borderColor: 'border-purple-200',
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
          <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
          <p className="text-gray-500 mt-1">Resumen del sistema y gestión</p>
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
                  <p className="text-sm font-medium text-gray-500">{card.title}</p>
                  <h3 className="text-3xl font-bold text-gray-900">{card.value}</h3>
                  <p className="text-xs text-gray-400">{card.subtitle}</p>
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
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Estado de Base de Datos</span>
                    <Badge variant="default" className="bg-green-500">En línea</Badge>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Estado de API</span>
                    <Badge variant="default" className="bg-green-500">Ejecutándose</Badge>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Clúster IPFS</span>
                    <Badge variant="default" className="bg-green-500">Conectado</Badge>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Blockchain</span>
                    <Badge variant="default" className="bg-green-500">Activo</Badge>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Servicio de Email</span>
                    <Badge variant="default" className="bg-green-500">Operativo</Badge>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Backend de Almacenamiento</span>
                    <Badge variant="default" className="bg-green-500">Disponible</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Storage Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <HardDrive className="w-5 h-5 mr-2" />
                  Distribución de Almacenamiento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Total Usado</span>
                      <span className="text-sm text-gray-500">{formatBytes(storageUsed)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                        style={{ width: `${Math.min((storageUsed / (5 * 1024 * 1024 * 1024)) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Cuota por usuario: 5 GB
                    </p>
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600">
                      Promedio por usuario: <span className="font-semibold">
                        {stats.totalUsers > 0 ? formatBytes(storageUsed / stats.totalUsers) : '0 Bytes'}
                      </span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

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
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Shield className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Administradores</p>
                        <p className="text-xs text-gray-500">Acceso total al sistema</p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-blue-600">{stats.totalAdmins}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Users className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Usuarios Regulares</p>
                        <p className="text-xs text-gray-500">Acceso estándar</p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-gray-600">{stats.totalRegularUsers}</span>
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
                      className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-white rounded-lg border border-gray-200">
                          {user.role === 'ADMIN' ? (
                            <Shield className="w-5 h-5 text-blue-600" />
                          ) : (
                            <Users className="w-5 h-5 text-gray-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.username}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={user.role === 'ADMIN' ? 'default' : 'outline'}>
                          {user.role}
                        </Badge>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDate(user.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No hay usuarios recientes</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
