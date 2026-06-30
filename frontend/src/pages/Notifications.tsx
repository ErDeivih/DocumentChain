import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { Button } from '../components/ui/Button';
import { notificationsApi, NotificationItem } from '../api/notifications';

type FilterTab = 'all' | 'unread' | 'shared' | 'documents';

/**
 * Página de notificaciones del usuario.
 */
export const Notifications: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [notice, setNotice] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);
  const noticeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    };
  }, []);

  const { data, isLoading, error } = useQuery({
    queryKey: ['notifications', { limit: 100 }],
    queryFn: () => notificationsApi.list({ limit: 100 }),
  });
  const items: NotificationItem[] = data?.notifications || [];
  const hasError = !!error;

  const filtered = useMemo(() => {
    if (activeTab === 'unread') {
      return items.filter((n) => !n.isRead);
    }
    if (activeTab === 'shared') {
      return items.filter((n) => (n.type || '').includes('SHARE') || (n.type || '').includes('ACCESS'));
    }
    if (activeTab === 'documents') {
      return items.filter((n) => (n.type || '').includes('FILE') || (n.type || '').includes('VERSION'));
    }
    return items;
  }, [activeTab, items]);

  const handleClick = async (item: NotificationItem) => {
    if (!item.isRead) {
      try {
        await notificationsApi.markAsRead(item.id);
        await queryClient.invalidateQueries({ queryKey: ['notifications'] });
        await queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
      } catch {
        // Fail silently for individual mark-as-read
      }
    }
    navigate(item.link || '/app/notifications');
  };

  const handleMarkAll = async () => {
    setMarkingAll(true);
    try {
      await notificationsApi.markAllRead();
      await queryClient.invalidateQueries({ queryKey: ['notifications'] });
      await queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
      setNotice('Todas las notificaciones marcadas como leídas');
      noticeTimerRef.current = setTimeout(() => setNotice(null), 3000);
    } catch {
      setNotice('No se pudo actualizar el estado de las notificaciones');
      noticeTimerRef.current = setTimeout(() => setNotice(null), 3000);
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Notificaciones</h1>
        <Button onClick={handleMarkAll} disabled={items.every((n) => n.isRead) || markingAll}>
          {markingAll ? 'Marcando...' : 'Marcar todas como leídas'}
        </Button>
      </div>

      {notice && <p role="status">{notice}</p>}

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as FilterTab)}>
        <TabsList>
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="unread">No leídas</TabsTrigger>
          <TabsTrigger value="shared">Compartidos</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {isLoading ? (
            <p>Cargando notificaciones...</p>
          ) : hasError ? (
            <p className="text-red-500">Error al cargar las notificaciones. Inténtalo de nuevo.</p>
          ) : filtered.length === 0 ? (
            <p>No hay notificaciones para mostrar</p>
          ) : (
            <div className="space-y-2">
              {filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => handleClick(item)}
                className="block cursor-pointer rounded-lg border p-3 hover:bg-accent/50 transition-colors"
              >
                <p className="font-semibold">{item.title}</p>
                <p className="text-sm text-muted-foreground">{item.message}</p>
              </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
