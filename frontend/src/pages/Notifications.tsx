import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { Separator } from '../components/ui/Separator';
import { useToast } from '../components/ui/Toast';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  type Notification,
} from '../api/notifications';
import {
  Bell,
  FileText,
  Share2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  GitBranch,
  Lock,
  Unlock,
} from 'lucide-react';


const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'DOCUMENT_CREATED':
    case 'FILE_UPLOADED':
      return <FileText className="w-5 h-5" />;
    case 'DOCUMENT_SHARED':
    case 'FILE_SHARED':
      return <Share2 className="w-5 h-5" />;
    case 'DOCUMENT_SIGNED':
    case 'FILE_SIGNED':
      return <CheckCircle2 className="w-5 h-5" />;
    case 'VERSION_CREATED':
    case 'NEW_VERSION':
      return <GitBranch className="w-5 h-5" />;
    case 'PERMISSION_GRANTED':
      return <Unlock className="w-5 h-5" />;
    case 'PERMISSION_REVOKED':
    case 'SHARE_REVOKED':
      return <Lock className="w-5 h-5" />;
    case 'BLOCKCHAIN_CONFIRMED':
      return <CheckCircle2 className="w-5 h-5" />;
    case 'FILE_UPDATED':
    case 'FILE_ARCHIVED':
      return <AlertCircle className="w-5 h-5" />;
    case 'SYSTEM':
      return <AlertCircle className="w-5 h-5" />;
    default:
      return <Bell className="w-5 h-5" />;
  }
};

const getNotificationColor = (type: Notification['type']) => {
  switch (type) {
    case 'DOCUMENT_CREATED':
    case 'FILE_UPLOADED':
      return 'bg-primary/10 text-primary';
    case 'DOCUMENT_SHARED':
    case 'FILE_SHARED':
      return 'bg-success-100 text-success-600';
    case 'DOCUMENT_SIGNED':
    case 'FILE_SIGNED':
    case 'BLOCKCHAIN_CONFIRMED':
      return 'bg-blockchain-100 text-blockchain-600';
    case 'VERSION_CREATED':
    case 'NEW_VERSION':
      return 'bg-blue-100 text-blue-600';
    case 'PERMISSION_GRANTED':
      return 'bg-green-100 text-green-600';
    case 'PERMISSION_REVOKED':
    case 'SHARE_REVOKED':
      return 'bg-orange-100 text-orange-600';
    case 'FILE_UPDATED':
    case 'FILE_ARCHIVED':
      return 'bg-amber-100 text-amber-600';
    case 'SYSTEM':
      return 'bg-warning-100 text-warning-600';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

const formatTimestamp = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Ahora mismo';
  if (minutes < 60) return `Hace ${minutes}m`;
  if (hours < 24) return `Hace ${hours}h`;
  if (days < 7) return `Hace ${days}d`;
  return date.toLocaleDateString();
};

const documentNotificationTypes: Notification['type'][] = [
  'DOCUMENT_CREATED',
  'FILE_UPLOADED',
  'DOCUMENT_SIGNED',
  'FILE_SIGNED',
  'VERSION_CREATED',
  'NEW_VERSION',
  'FILE_UPDATED',
  'FILE_ARCHIVED',
  'BLOCKCHAIN_CONFIRMED',
];

const shareNotificationTypes: Notification['type'][] = [
  'DOCUMENT_SHARED',
  'FILE_SHARED',
  'PERMISSION_GRANTED',
  'PERMISSION_REVOKED',
  'SHARE_REVOKED',
];

export const Notifications: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const autoReadTimers = React.useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Obtener notificaciones
  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => getNotifications({ limit: 100 }),
  });

  const invalidateNotificationQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
    queryClient.invalidateQueries({ queryKey: ['unreadNotifications'] });
  };

  // Mutación para marcar como leída
  const markAsReadMutation = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      invalidateNotificationQueries();
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Error al marcar la notificación como leída',
        variant: 'destructive',
      });
    },
  });

  // Mutación para marcar todas como leídas
  const markAllAsReadMutation = useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      invalidateNotificationQueries();
      toast({
        title: 'Éxito',
        description: 'Todas las notificaciones marcadas como leídas',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Error al marcar todas como leídas',
        variant: 'destructive',
      });
    },
  });

  // Mutación para eliminar notificación
  const deleteNotificationMutation = useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast({
        title: 'Éxito',
        description: 'Notificación eliminada',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Error al eliminar la notificación',
        variant: 'destructive',
      });
    },
  });

  const handleMarkAsRead = (id: string) => {
    markAsReadMutation.mutate(id);
  };

  const handleDelete = (id: string) => {
    deleteNotificationMutation.mutate(id);
  };

  const unreadCount = notificationsData?.unread || 0;
  const allNotifications = notificationsData?.notifications || [];
  const unreadNotifications = allNotifications.filter(n => !n.isRead);

  // Auto-mark-as-read: las notificaciones no leídas se marcan automáticamente
  // como leídas tras 3 segundos de estar visibles en la página.
  const pendingAutoReadRef = React.useRef<Set<string>>(new Set());

  React.useEffect(() => {
    const unreadIds = allNotifications.filter((n) => !n.isRead).map((n) => n.id);
    const newIds = unreadIds.filter((id) => !pendingAutoReadRef.current.has(id));

    newIds.forEach((id) => {
      pendingAutoReadRef.current.add(id);
      const timer = setTimeout(() => {
        markAsReadMutation.mutate(id);
        pendingAutoReadRef.current.delete(id);
      }, 3000);
      autoReadTimers.current.set(id, timer);
    });

    // Cancelar timers de notificaciones que ya no están en la lista (ej. eliminadas)
    autoReadTimers.current.forEach((timer, id) => {
      if (!unreadIds.includes(id)) {
        clearTimeout(timer);
        autoReadTimers.current.delete(id);
        pendingAutoReadRef.current.delete(id);
      }
    });

    return () => {
      // No limpiamos timers aquí para que sigan corriendo entre renders
    };
  }, [allNotifications, markAsReadMutation]);

  React.useEffect(() => {
    return () => {
      autoReadTimers.current.forEach((timer) => clearTimeout(timer));
      autoReadTimers.current.clear();
      pendingAutoReadRef.current.clear();
    };
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-10 w-64" />
        <Card>
          <CardContent className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-4">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  const NotificationList = ({ items }: { items: Notification[] }) => (
    <div className="space-y-1">
      {items.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">No hay notificaciones para mostrar</p>
        </div>
      ) : (
        items.map((notification, index) => (
          <React.Fragment key={notification.id}>
            <div
              className={`flex items-start gap-4 p-4 rounded-lg transition-colors cursor-pointer ${
                !notification.isRead ? 'bg-primary/5' : 'hover:bg-accent'
              }`}
              onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
            >
              <div className={`p-2 rounded-full ${getNotificationColor(notification.type)}`}>
                {getNotificationIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="font-medium text-foreground">{notification.title}</p>
                  {!notification.isRead && (
                    <Badge variant="default" className="shrink-0">
                      Nueva
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>{formatTimestamp(notification.createdAt)}</span>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(notification.id);
                }}
                disabled={deleteNotificationMutation.isPending}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            {index < items.length - 1 && <Separator />}
          </React.Fragment>
        ))
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Notificaciones</h1>
          <p className="text-muted-foreground mt-1">
            Manténgase informado sobre la actividad de sus documentos
          </p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <Badge variant="default">
              {unreadCount} nuevas
            </Badge>
          )}
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => markAllAsReadMutation.mutate()}
            disabled={markAllAsReadMutation.isPending || unreadCount === 0}
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Marcar todas como leídas
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">
            Todas
            <Badge variant="secondary" className="ml-2">
              {allNotifications.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="unread">
            No leídas
            {unreadCount > 0 && (
              <Badge variant="default" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
          <TabsTrigger value="shares">Compartidos</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Todas las Notificaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <NotificationList items={allNotifications} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="unread" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Notificaciones No Leídas</CardTitle>
            </CardHeader>
            <CardContent>
              <NotificationList items={unreadNotifications} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Notificaciones de Documentos</CardTitle>
            </CardHeader>
            <CardContent>
              <NotificationList
                items={allNotifications.filter(n => 
                  documentNotificationTypes.includes(n.type)
                )}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shares" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Notificaciones de Compartidos</CardTitle>
            </CardHeader>
            <CardContent>
              <NotificationList
                items={allNotifications.filter(n => 
                  shareNotificationTypes.includes(n.type)
                )}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
