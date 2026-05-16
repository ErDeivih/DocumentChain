import React, { useEffect, useMemo, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { Button } from '../components/ui/Button';
import { notificationsApi, NotificationItem } from '../api/notifications';

type FilterTab = 'all' | 'unread' | 'shared' | 'documents';

export const Notifications: React.FC = () => {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const response = await notificationsApi.list({ limit: 100 });
      setItems(response.notifications || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadNotifications();
  }, []);

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

  useEffect(() => {
    if (activeTab !== 'unread') return;
    const unread = items.filter((n) => !n.isRead);
    if (unread.length === 0) return;

    const timer = setTimeout(async () => {
      const unreadNow = items.filter((n) => !n.isRead);
      if (unreadNow.length === 0) return;

      try {
        await Promise.all(unreadNow.map((n) => notificationsApi.markRead(n.id)));
        setItems((prev) => prev.map((n) => (n.isRead ? n : { ...n, isRead: true })));
      } catch {
        // Silent fallback for E2E resilience
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [activeTab, items]);

  const handleMarkAll = async () => {
    try {
      await notificationsApi.markAllRead();
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setNotice('Todas las notificaciones marcadas como leídas');
      setTimeout(() => setNotice(null), 3000);
    } catch {
      setNotice('No se pudo actualizar el estado de las notificaciones');
      setTimeout(() => setNotice(null), 3000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Notificaciones</h1>
        <Button onClick={handleMarkAll} disabled={items.every((n) => n.isRead)}>
          Marcar todas como leídas
        </Button>
      </div>

      {notice && <p>{notice}</p>}

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as FilterTab)}>
        <TabsList>
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="unread">No leídas</TabsTrigger>
          <TabsTrigger value="shared">Compartidos</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {loading ? (
            <p>Cargando notificaciones...</p>
          ) : filtered.length === 0 ? (
            <p>No hay notificaciones para mostrar</p>
          ) : (
            <div className="space-y-2">
              {filtered.map((item) => (
                <div key={item.id} className="cursor-pointer rounded-lg border p-3">
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
