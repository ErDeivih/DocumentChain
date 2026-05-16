import React, { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { useToast } from '../ui/Toast';
import { truncateAddress } from '../../lib/utils';
import { walletsApi } from '../../api/wallets';
import { useWalletManager } from '../../contexts/WalletManagerContext';
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

interface WalletManagerProps {
  autoOpenConnector?: boolean;
  onWalletConnected?: () => void;
}

export const WalletManager: React.FC<WalletManagerProps> = ({
  autoOpenConnector = false,
  onWalletConnected,
}) => {
  const {
    savedWallets,
    isLoading,
    isConnecting,
    connectWallet,
    addWallet,
    removeWallet,
    setPrimaryWallet,
    canAddWallet,
  } = useWalletManager();

  const [showConnectionMethod, setShowConnectionMethod] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (autoOpenConnector) setShowConnectionMethod(true);
  }, [autoOpenConnector]);

  const updateLabelMutation = useMutation({
    mutationFn: ({ id, label }: { id: string; label: string }) => walletsApi.updateLabel(id, label),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      setEditingId(null);
      setEditLabel('');
      toast({ title: 'Éxito', description: 'Etiqueta de wallet actualizada', variant: 'success' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Error al actualizar la etiqueta', variant: 'destructive' });
    },
  });

  const handleConnect = async (method: 'browser' | 'walletconnect') => {
    setShowConnectionMethod(false);
    try {
      const type = method === 'walletconnect' ? 'walletconnect' as const : 'metamask' as const;
      await connectWallet(type);
      await addWallet();
      toast({ title: 'Éxito', description: 'Wallet conectada exitosamente', variant: 'success' });
      onWalletConnected?.();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Error al conectar la wallet', variant: 'destructive' });
    }
  };

  const handleRemove = (walletId: string, isPrimary: boolean) => {
    if (isPrimary) {
      toast({ title: 'Error', description: 'No puede eliminar la wallet principal. Asigne otra principal primero.', variant: 'destructive' });
      return;
    }
    if (confirm('¿Seguro que desea eliminar esta wallet?')) {
      removeWallet(walletId).catch((error: any) => {
        toast({ title: 'Error', description: error.message || 'Error al eliminar la wallet', variant: 'destructive' });
      });
    }
  };

  const handleSetPrimary = (walletId: string) => {
    setPrimaryWallet(walletId).catch((error: any) => {
      toast({ title: 'Error', description: error.message || 'Error al actualizar la wallet principal', variant: 'destructive' });
    });
  };

  const startEditing = (wallet: { id: string; label: string | null }) => {
    setEditingId(wallet.id);
    setEditLabel(wallet.label || '');
  };

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
              disabled={isConnecting || !canAddWallet}
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Conectar Wallet
            </Button>
          ) : (
            <div className="flex gap-2 bg-background border rounded-lg p-2 shadow-lg">
              <Button onClick={() => handleConnect('browser')} variant="outline" size="sm" className="flex items-center gap-2">
                <Monitor className="w-4 h-4" />
                Navegador
              </Button>
              <Button onClick={() => handleConnect('walletconnect')} variant="outline" size="sm" className="flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                Móvil (QR)
              </Button>
              <Button onClick={() => setShowConnectionMethod(false)} variant="ghost" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="text-center text-muted-foreground py-8">Cargando wallets...</div>
        ) : savedWallets.length === 0 ? (
          <div className="text-center py-8">
            <Wallet className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground mb-4">No hay wallets conectadas</p>
          </div>
        ) : (
          <div className="space-y-3">
            {savedWallets.map((wallet) => (
              <div key={wallet.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors" data-testid="wallet-row">
                <div className="flex items-center gap-3 flex-1">
                  <Wallet className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1">
                    {editingId === wallet.id ? (
                      <div className="flex items-center gap-2">
                        <Input value={editLabel} onChange={(e) => setEditLabel(e.target.value)} placeholder="Etiqueta de wallet" className="max-w-xs" autoFocus data-testid="wallet-label-input" />
                        <Button size="sm" variant="ghost" onClick={() => updateLabelMutation.mutate({ id: wallet.id, label: editLabel })}>
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{wallet.label || truncateAddress(wallet.walletAddress)}</p>
                          {wallet.isPrimary && (
                            <Badge variant="default" className="text-xs">
                              <Star className="w-3 h-3 mr-1" />
                              Principal
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground font-mono">{wallet.walletAddress}</p>
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
                      <Button size="sm" variant="ghost" onClick={() => handleSetPrimary(wallet.id)}>
                        <Star className="w-4 h-4" />
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => handleRemove(wallet.id, wallet.isPrimary)} className="text-destructive hover:text-destructive">
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
