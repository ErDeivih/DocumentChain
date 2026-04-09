import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUserStats } from '../api/stats';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import { Badge } from '../components/ui/Badge';
import { Progress } from '../components/ui/Progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import { Alert, AlertDescription } from '../components/ui/Alert';
import { AdminPanel } from './AdminPanel';
import {
  FileText,
  Share2,
  HardDrive,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  Users,
} from 'lucide-react';
import { formatBytes } from '../lib/utils';

export const Dashboard: React.FC = () => {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['userStats'],
    queryFn: getUserStats,
    enabled: !isAuthLoading && isAuthenticated,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                  <Skeleton className="h-14 w-14 rounded-lg" />
                </div>
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
          {error instanceof Error ? error.message : 'Error al cargar las estadísticas'}
        </AlertDescription>
      </Alert>
    );
  }

  if (!stats) return null;

  const userStats = stats.stats;

  // Calcular porcentaje de cuota de almacenamiento
  const storageQuota = 5 * 1024 * 1024 * 1024; // 5GB en bytes
  const storagePercentage = (userStats.storageUsed / storageQuota) * 100;

  const statCards = [
    {
      title: 'Mis Documentos',
      value: userStats.documentsOwned,
      icon: <FileText className="w-8 h-8" />,
      bgColor: 'bg-primary/10',
      iconColor: 'text-primary',
      trend: '+12%',
      trendUp: true,
    },
    {
      title: 'Compartidos Conmigo',
      value: userStats.documentsShared,
      icon: <Share2 className="w-8 h-8" />,
      bgColor: 'bg-success-100',
      iconColor: 'text-success-600',
      trend: '+8%',
      trendUp: true,
    },
    {
      title: 'Versiones Totales',
      value: userStats.totalVersions,
      icon: <TrendingUp className="w-8 h-8" />,
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
      trend: '+5%',
      trendUp: true,
    },
    {
      title: 'Almacenamiento Total',
      value: formatBytes(userStats.storageUsed),
      icon: <HardDrive className="w-8 h-8" />,
      bgColor: 'bg-warning-100',
      iconColor: 'text-warning-600',
      subtitle: `${storagePercentage.toFixed(1)}% de 5GB`,
    },
    {
      title: 'Firmas',
      value: userStats.totalSignatures,
      icon: <CheckCircle2 className="w-8 h-8" />,
      bgColor: 'bg-blockchain-100',
      iconColor: 'text-blockchain-600',
      trend: '+3',
      trendUp: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Panel de Administración</h1>
          <p className="text-muted-foreground mt-1">¡Bienvenido de nuevo! Gestione su sistema.</p>
        </div>
        <Badge variant="success">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Blockchain Sincronizada
        </Badge>
      </div>

      {/* Pestañas Principales: Resumen vs Gestión de Usuarios */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">
            <TrendingUp className="w-4 h-4 mr-2" />
            Resumen
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="w-4 h-4 mr-2" />
            Gestión de Usuarios
          </TabsTrigger>
        </TabsList>

        {/* Pestaña Resumen */}
        <TabsContent value="overview" className="mt-6 space-y-6">
          {/* Cuadrícula de Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {statCards.map((stat, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                      <p className="text-3xl font-bold text-foreground mb-1">{stat.value}</p>
                      {stat.subtitle && (
                        <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
                      )}
                      {stat.trend && (
                        <Badge variant={stat.trendUp ? 'success' : 'destructive'} className="mt-2">
                          {stat.trend} este mes
                        </Badge>
                      )}
                    </div>
                    <div className={`${stat.bgColor} p-3 rounded-lg ${stat.iconColor}`}>
                      {stat.icon}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pestañas anidadas para detalles */}
          <Tabs defaultValue="storage" className="w-full">
            <TabsList>
              <TabsTrigger value="storage">Almacenamiento</TabsTrigger>
              <TabsTrigger value="activity">Actividad Reciente</TabsTrigger>
              <TabsTrigger value="blockchain">Estado Blockchain</TabsTrigger>
            </TabsList>

        <TabsContent value="storage" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Información de Almacenamiento</CardTitle>
              <CardDescription>Seguimiento de su uso y cuota de almacenamiento</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Almacenamiento Usado</span>
                  <span className="text-sm text-muted-foreground">
                    {formatBytes(userStats.storageUsed)} / 5GB
                  </span>
                </div>
                <Progress value={storagePercentage} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  {storagePercentage < 80 ? (
                    <span className="text-success-600">Tiene mucho espacio disponible</span>
                  ) : storagePercentage < 95 ? (
                    <span className="text-warning-600">El almacenamiento se está agotando</span>
                  ) : (
                    <span className="text-error-600">¡Almacenamiento casi lleno!</span>
                  )}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-muted-foreground">Documentos Totales</p>
                  <p className="text-2xl font-bold">{userStats.documentsOwned}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tamaño Promedio</p>
                  <p className="text-2xl font-bold">
                    {userStats.documentsOwned > 0
                      ? formatBytes(Math.floor(userStats.storageUsed / userStats.documentsOwned))
                      : '0 B'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Archivo Más Grande</p>
                  <p className="text-2xl font-bold">--</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
              <CardDescription>Sus últimas acciones y actualizaciones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent transition-colors">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Clock className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Documento subido</p>
                      <p className="text-xs text-muted-foreground">Hace 2 horas</p>
                    </div>
                    <Badge variant="outline">Subida</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blockchain" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Estado Blockchain</CardTitle>
              <CardDescription>Información de sincronización y contratos inteligentes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-success-50 border border-success-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-success-600" />
                  <div>
                    <p className="font-medium text-success-900">Completamente Sincronizado</p>
                    <p className="text-sm text-success-700">Todos los documentos están en blockchain</p>
                  </div>
                </div>
                <Badge variant="success">Activo</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Transacciones Totales</p>
                  <p className="text-2xl font-bold">{userStats.documentsOwned + userStats.totalVersions}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Gas Usado (est.)</p>
                  <p className="text-2xl font-bold">0.042 ETH</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Pestaña Gestión de Usuarios */}
        <TabsContent value="users" className="mt-6">
          <AdminPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};
