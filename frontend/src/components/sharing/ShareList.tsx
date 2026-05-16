import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ShareDocument, Role } from '../../types';
import { sharingService } from '../../services/blockchain';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import AlertMessage from '../ui/AlertMessage';
import { formatRelativeTime } from '../../lib/utils';
import { WalletSelectorModal } from '../wallets/WalletSelectorModal';
import { SavedWallet } from '../../contexts/WalletManagerContext';
import { Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/Avatar';

/**
 * Props del componente ShareList.
 */
interface ShareListProps {
  /** Lista de comparticiones del documento. */
  shares: ShareDocument[];
  /** Identificador del documento compartido. */
  documentId: string;
  /** Indica si el usuario actual es el propietario del documento. */
  isOwner?: boolean;
}

/**
 * Lista de comparticiones de un documento.
 * Muestra los usuarios con acceso y permite revocar permisos mediante firma blockchain.
 */
export const ShareList: React.FC<ShareListProps> = ({
  shares,
  documentId,
  isOwner = true,
}) => {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [sharePendingRevocation, setSharePendingRevocation] = useState<ShareDocument | null>(null);

  const revokeMutation = useMutation({
    mutationFn: (input: { share: ShareDocument; walletId: string; connectedAddress: string }) =>
      sharingService.revokeShare({
        documentId,
        userId: input.share.userId,
        walletId: input.walletId,
        connectedAddress: input.connectedAddress,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shares', documentId] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      setSharePendingRevocation(null);
    },
    onError: (err: any) => {
      setError(err.message || 'Error al revocar el acceso');
      setSharePendingRevocation(null);
    },
  });

  const handleStartRevoke = (share: ShareDocument) => {
    if (confirm('¿Revocar el acceso para este usuario?')) {
      setError(null);
      setSharePendingRevocation(share);
      setShowWalletModal(true);
    }
  };

  const handleWalletClose = () => {
    setShowWalletModal(false);
    setSharePendingRevocation(null);
  };

  const getRoleBadgeVariant = (role: Role) => {
    switch (role) {
      case 'SHARED_WRITE':
        return 'warning' as const;
      case 'SHARED_READ':
        return 'secondary' as const;
      default:
        return 'secondary' as const;
    }
  };

  const getRoleLabel = (role: Role) => {
    return role.replace('SHARED_', '');
  };

  const handleWalletActionSelected = (wallet: SavedWallet | null, connectedAddress: string) => {
    setShowWalletModal(false);

    if (!sharePendingRevocation) {
      return;
    }

    if (!wallet?.id) {
      setError('Debe seleccionar una wallet guardada para revocar el acceso.');
      setSharePendingRevocation(null);
      return;
    }

    revokeMutation.mutate({
      share: sharePendingRevocation,
      walletId: wallet.id,
      connectedAddress,
    });
  };

  if (shares.length === 0) {
    return (
      <Card>
        <div className="p-6 text-center text-muted-foreground">
          Aún no hay compartidos. Haga clic en "Compartir" para compartir este documento con otros.
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {error && <AlertMessage type="error" message={error} onClose={() => setError(null)} />}

      <div className="space-y-3">
        {shares.map((share) => (
          <Card key={share.id}>
            <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-10 w-10">
                  {share.user?.avatarUrl ? (
                    <AvatarImage src={share.user.avatarUrl} alt={share.user.username} />
                  ) : null}
                  <AvatarFallback className="bg-[linear-gradient(135deg,#2dd4bf_0%,#0ea5e9_100%)] text-sm text-slate-950">
                    {(share.user?.fullName || share.user?.username || 'U').slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold text-foreground">
                    {share.user?.fullName || share.user?.username || 'Usuario Desconocido'}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Compartido {formatRelativeTime(share.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Badge variant={getRoleBadgeVariant(share.role)}>
                  {getRoleLabel(share.role)}
                </Badge>

                {isOwner && (
                  <>
                    <Button
                      variant="destructive"
                      size="sm"
                      aria-label={`Revocar acceso a ${share.user?.username || share.userId}`}
                      title={`Revocar acceso a ${share.user?.username || share.userId}`}
                      onClick={() => handleStartRevoke(share)}
                      isLoading={revokeMutation.isPending && sharePendingRevocation?.userId === share.userId}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
            </div>
          </Card>
        ))}
      </div>

      <WalletSelectorModal
        isOpen={showWalletModal}
        onClose={handleWalletClose}
        onSelect={handleWalletActionSelected}
        title="Firmar revocación de acceso"
        description="Seleccione la wallet propietaria para firmar la revocación del acceso en blockchain."
      />
    </div>
  );
};
