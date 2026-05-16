import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { UserAvatar } from '../ui/UserAvatar';
import { Loader2, ShieldCheck, Wallet } from 'lucide-react';
import { formatRelativeTime, truncateAddress } from '../../lib/utils';
import type { Signature } from '../../types';

const getSignerDisplayName = (signature: Signature) =>
  signature.signer?.fullName || signature.signer?.username || signature.user?.fullName || signature.user?.username || 'Firmante registrado';

const getSignerUsername = (signature: Signature) =>
  signature.signer?.username || signature.user?.username || null;

const getSignerWalletAddress = (signature: Signature) =>
  signature.signer?.walletAddress || signature.walletAddress || 'Wallet no disponible';

interface SignaturesViewerProps {
  isOpen: boolean;
  onClose: () => void;
  versionNumber: number | null;
  signatures: Signature[];
  isLoading: boolean;
  error: string | null;
}

export const SignaturesViewer: React.FC<SignaturesViewerProps> = ({
  isOpen,
  onClose,
  versionNumber,
  signatures,
  isLoading,
  error,
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedSignature = signatures.find((s) => s.id === selectedId) || signatures[0] || null;

  useEffect(() => {
    setSelectedId(signatures[0]?.id ?? null);
  }, [signatures]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{versionNumber !== null ? `Firmantes de la versión ${versionNumber}` : 'Firmantes'}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />Cargando firmantes...
          </div>
        ) : error ? (
          <div className="rounded-lg border border-error-700/35 bg-error-900/20 p-4 text-sm text-error-100">{error}</div>
        ) : signatures.length === 0 ? (
          <div className="rounded-lg border border-dashed border-white/10 bg-secondary/35 p-6 text-center text-sm text-muted-foreground">
            Esta versión todavía no tiene firmas registradas.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-[minmax(0,280px)_1fr]">
            <div className="space-y-3">
              {signatures.map((sig) => {
                const walletAddress = getSignerWalletAddress(sig);
                const signerName = getSignerDisplayName(sig);
                const signerUsername = getSignerUsername(sig);
                return (
                  <button
                    key={sig.id}
                    type="button"
                    onClick={() => setSelectedId(sig.id)}
                    className={`w-full rounded-lg border p-3 text-left transition-colors ${
                      selectedSignature?.id === sig.id
                        ? 'border-primary/40 bg-primary/10'
                        : 'border-white/10 bg-card/90 hover:border-primary/25'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <UserAvatar size="sm" name={signerName} avatarUrl={sig.signer?.avatarUrl} />
                        <div>
                          <p className="font-medium text-foreground">{signerName}</p>
                          {signerUsername ? <p className="mt-0.5 text-xs text-muted-foreground">@{signerUsername}</p> : null}
                        </div>
                      </div>
                    </div>
                    <p className="mt-3 font-mono text-xs text-muted-foreground">{truncateAddress(walletAddress, 10, 6)}</p>
                    <p className="mt-2 text-xs text-muted-foreground">{sig.signedAt ? formatRelativeTime(sig.signedAt) : 'Fecha pendiente'}</p>
                  </button>
                );
              })}
            </div>

            {selectedSignature ? (
              <div className="rounded-xl border border-white/10 bg-secondary/35 p-5" data-testid="signer-profile-panel">
                <div className="flex flex-wrap items-center gap-3">
                  <UserAvatar name={getSignerDisplayName(selectedSignature)} avatarUrl={selectedSignature.signer?.avatarUrl} />
                  <h3 className="text-lg font-semibold text-foreground">Perfil del firmante</h3>
                </div>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border border-white/10 bg-card/90 p-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground"><ShieldCheck className="h-4 w-4" />Identidad mostrada</div>
                    <p className="mt-3 text-base font-semibold text-foreground">{getSignerDisplayName(selectedSignature)}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{getSignerUsername(selectedSignature) ? `@${getSignerUsername(selectedSignature)}` : 'Sin alias disponible'}</p>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-card/90 p-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground"><Wallet className="h-4 w-4" />Wallet empleada en la firma</div>
                    <p className="mt-3 break-all font-mono text-sm text-foreground">{getSignerWalletAddress(selectedSignature)}</p>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-card/90 p-4">
                    <p className="text-sm font-medium text-foreground">Fecha de registro</p>
                    <p className="mt-3 text-sm text-foreground">
                      {selectedSignature.signedAt
                        ? new Date(selectedSignature.signedAt).toLocaleString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                        : 'Pendiente de confirmación'}
                    </p>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-card/90 p-4">
                    <p className="text-sm font-medium text-foreground">Versión firmada</p>
                    <p className="mt-3 text-sm text-foreground">Versión {selectedSignature.versionNumber ?? versionNumber}</p>
                    {selectedSignature.blockchainTxHash ? <p className="mt-2 break-all font-mono text-xs text-muted-foreground">TX: {selectedSignature.blockchainTxHash}</p> : null}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
