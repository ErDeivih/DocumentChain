/**
 * @fileoverview Hook useSocketListener.
 *
 * Gestiona la conexión de Socket.IO para escuchar eventos en tiempo real
 * del backend e invalida las consultas de React Query correspondientes.
 */

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook para escuchar eventos de socket en tiempo real.
 *
 * Se conecta al servidor cuando el usuario está autenticado y
 * invalida las consultas de documentos al recibir actualizaciones.
 */
export function useSocketListener() {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (socketRef.current?.connected) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
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
    if (token) {
      s.auth = { token };
      s.connect();
    }

    s.on('connect', () => {
      s.emit('authenticate', token);
    });

    s.on('document:updated', (payload: { type: string; documentId: string }) => {
      // Invalidar consultas relevantes
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['sharedWithMe'] });
      queryClient.invalidateQueries({ queryKey: ['document', payload.documentId] });
      queryClient.invalidateQueries({ queryKey: ['versions', payload.documentId] });
      queryClient.invalidateQueries({ queryKey: ['shares', payload.documentId] });
    });

    return () => {
      s.off('document:updated');
      s.off('connect');
      s.disconnect();
    };
  }, [isAuthenticated, user, queryClient]);
}
