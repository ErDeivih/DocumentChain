import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/Toast';

/**
 * Hook para escuchar eventos de socket en tiempo real.
 *
 * Se conecta al servidor cuando el usuario está autenticado y
 * invalida las consultas de documentos al recibir actualizaciones.
 * También invalida notificaciones y muestra toasts cuando llegan nuevas.
 */
export function useSocketListener() {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      return;
    }

    if (!socketRef.current) {
      socketRef.current = io(window.location.origin, {
        path: '/socket.io',
        transports: ['websocket', 'polling'],
        autoConnect: false,
      });
    }

    const s = socketRef.current;

    const token = localStorage.getItem('accessToken');
    if (!token) return;
    s.auth = { token };
    s.connect();

    s.on('connect', () => {
      const currentToken = localStorage.getItem('accessToken');
      if (currentToken) {
        s.emit('authenticate', currentToken);
      }
    });

    s.on('connect_error', (err) => {
      console.warn('WebSocket connection error:', err.message);
    });

    s.on('document:updated', (payload: { type: string; documentId: string }) => {
    queryClient.invalidateQueries({ queryKey: ['documents'], exact: false });
    queryClient.invalidateQueries({ queryKey: ['sharedWithMe'], exact: false });
    queryClient.invalidateQueries({ queryKey: ['document', payload.documentId], exact: false });
    queryClient.invalidateQueries({ queryKey: ['versions', payload.documentId], exact: false });
    queryClient.invalidateQueries({ queryKey: ['shares', payload.documentId], exact: false });
    });

    s.on('notification', (payload: { id: string; type: string; title: string; message: string; link?: string }) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
      toast({
        title: payload.title,
        description: payload.message,
        variant: 'info',
        duration: 6000,
      });
    });

    return () => {
      s.off('document:updated');
      s.off('notification');
      s.off('connect');
      s.off('connect_error');
      s.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, user, queryClient, toast]);
}
