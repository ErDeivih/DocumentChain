import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BrowserProvider } from 'ethers';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { useToast } from '../ui/Toast';
import { walletsApi } from '../../api/wallets';
import { getWalletConnectInstance } from '../../lib/walletconnect';
import {
  Wallet,
  Plus,
  Trash2,
  Star,
  Edit2,
  Check,
  X,
  Smartphone,
  Monitor,
} from 'lucide-react';
import type { Wallet as WalletType } from '../../types';

declare global {
  interface Window {
    ethereum?: any;
  }
}

/**
 * Propiedades del componente WalletManager.
 */
interface WalletManagerProps {
  /** Indica si se debe abrir automáticamente el conector de wallets al montar. */
  autoOpenConnector?: boolean;
  /** Función opcional invocada cuando una wallet se conecta exitosamente. */
  onWalletConnected?: () => void;
}

/**
 * Componente para gestionar la conexión, etiquetado y eliminación de wallets del usuario.
 *
 * @param props - Propiedades del componente.
 * @returns Elemento JSX del gestor de wallets.
 */
export const WalletManager: React.FC<WalletManagerProps> = ({
  autoOpenConnector = false,
  onWalletConnected,
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [showConnectionMethod, setShowConnectionMethod] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: walletsData, isLoading } = useQuery({
    queryKey: ['wallets'],
    queryFn: walletsApi.list,
  });

  useEffect(() => {
    if (autoOpenConnector) {
      setShowConnectionMethod(true);
    }
  }, [autoOpenConnector]);

  const addWalletMutation = useMutation({
    mutationFn: async ({
      address,
      label,
      signature,
      message,
    }: {
      address: string;
      label?: string;
      signature: string;
      message: string;
    }) => walletsApi.add(address, label, signature, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      toast({
        title: 'Éxito',
        description: 'Wallet conectada exitosamente',
        variant: 'success',
      });
      onWalletConnected?.();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Error al conectar la wallet',
        variant: 'destructive',
      });
    },
  });

  const removeWalletMutation = useMutation({
    mutationFn: walletsApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      toast({
        title: 'Éxito',
        description: 'Wallet eliminada exitosamente',
        variant: 'success',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Error al eliminar la wallet',
        variant: 'destructive',
      });
    },
  });

  const setPrimaryMutation = useMutation({
    mutationFn: walletsApi.setPrimary,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      toast({
        title: 'Éxito',
        description: 'Wallet principal actualizada',
        variant: 'success',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Error al actualizar la wallet principal',
        variant: 'destructive',
      });
    },
  });

  const updateLabelMutation = useMutation({
    mutationFn: ({ id, label }: { id: string; label: string }) => walletsApi.updateLabel(id, label),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      setEditingId(null);
      setEditLabel('');
      toast({
        title: 'Éxito',
        description: 'Etiqueta de wallet actualizada',
        variant: 'success',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Error al actualizar la etiqueta',
        variant: 'destructive',
      });
    },
  });

  const wallets = walletsData?.wallets || [];

  const connectWallet = async (method: 'browser' | 'walletconnect' = 'browser') => {
    setIsConnecting(true);
    setShowConnectionMethod(false);

    try {
      let address: string;
      let signature: string;
      let message: string;

      if (method === 'walletconnect') {
        const wcHelper = getWalletConnectInstance();
        const { address: wcAddress } = await wcHelper.connect();
        address = wcAddress;

        const challengeData = await walletsApi.getChallenge(address);
        message = challengeData.message;
        signature = await wcHelper.signMessage(message);
      } else {
        if (!window.ethereum) {
          toast({
            title: 'Error',
            description: 'No se detectó MetaMask o una wallet de navegador compatible.',
            variant: 'destructive',
          });
          return;
        }

        const provider = new BrowserProvider(window.ethereum);
        const accounts = await provider.send('eth_requestAccounts', []);
        address = accounts[0];

        const challengeData = await walletsApi.getChallenge(address);
        message = challengeData.message;
        const signer = await provider.getSigner();
        signature = await signer.signMessage(message);
      }

      await addWalletMutation.mutateAsync({
        address,
        signature,
        message,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al conectar la wallet',
        variant: 'destructive',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleRemove = (walletId: string, isPrimary: boolean) => {
    if (isPrimary && wallets.length > 1) {
      toast({
        title: 'Error',
        description: 'No puede eliminar la wallet principal. Asigne otra principal primero.',
        variant: 'destructive',
      });
      return;
    }

    if (confirm('¿Seguro que desea eliminar esta wallet?')) {
      removeWalletMutation.mutate(walletId);
    }
  };

  const startEditing = (wallet: WalletType) => {
    setEditingId(wallet.id);
    setEditLabel(wallet.label || '');
  };

  const formatAddress = (address: string) => `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Gestión de Wallets</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Conecte y administre wallets para firmar operaciones blockchain.
            </p>
          </div>
          {!showConnectionMethod ? (
            <Button
              onClick={() => setShowConnectionMethod(true)}
              isLoading={isConnecting}
              disabled={isConnecting}
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Conectar Wallet
            </Button>
          ) : (
            <div className="flex gap-2 bg-background border rounded-lg p-2 shadow-lg">
              <Button
                onClick={() => connectWallet('browser')}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Monitor className="w-4 h-4" />
                Navegador
              </Button>
              <Button
                onClick={() => connectWallet('walletconnect')}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Smartphone className="w-4 h-4" />
                Móvil (QR)
              </Button>
              <Button
                onClick={() => setShowConnectionMethod(false)}
                variant="ghost"
                size="sm"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="text-center text-muted-foreground py-8">Cargando wallets...</div>
        ) : wallets.length === 0 ? (
          <div className="text-center py-8">
            <Wallet className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground mb-4">No hay wallets conectadas</p>
          </div>
        ) : (
          <div className="space-y-3">
            {wallets.map((wallet) => (
              <div
                key={wallet.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <Wallet className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1">
                    {editingId === wallet.id ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={editLabel}
                          onChange={(e) => setEditLabel(e.target.value)}
                          placeholder="Etiqueta de wallet"
                          className="max-w-xs"
                          autoFocus
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => updateLabelMutation.mutate({ id: wallet.id, label: editLabel })}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{wallet.label || formatAddress(wallet.address)}</p>
                          {wallet.isPrimary && (
                            <Badge variant="default" className="text-xs">
                              <Star className="w-3 h-3 mr-1" />
                              Principal
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground font-mono">{wallet.address}</p>
                      </>
                    )}
                  </div>
                </div>

                {editingId !== wallet.id && (
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" onClick={() => startEditing(wallet)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    {!wallet.isPrimary && (
                      <Button size="sm" variant="ghost" onClick={() => setPrimaryMutation.mutate(wallet.id)}>
                        <Star className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemove(wallet.id, wallet.isPrimary)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
