import React, { useState, useRef, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { DocumentRole } from '../../types';
import { usersApi, type UserSearchResult } from '../../api/users';
import { shareService } from '../../services/blockchain/ShareService';
import { getErrorMessage } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { useSigner } from '../../hooks/useSigner';
import { SigningReviewPanel } from '../ui/SigningReviewPanel';
import { TransactionDetailModal } from '../audit/TransactionDetailModal';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ExternalLink } from 'lucide-react';
import { Label } from '../ui/Label';
import { Alert, AlertDescription } from '../ui/Alert';
import { WalletSelectorModal } from '../wallets/WalletSelectorModal';
import { SavedWallet } from '../../contexts/WalletManagerContext';
import { UserPlus, AlertCircle, Info, Loader2, Wallet } from 'lucide-react';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    documentId: string;
    documentName: string;
}

type ShareStep = 'form' | 'validating' | 'preparing' | 'signing' | 'confirming' | 'success' | 'error';

/**
 * Modal para compartir un documento con otro usuario mediante cifrado seguro y registro en blockchain.
 *
 * @param props - Propiedades del componente.
 * @returns Elemento JSX del modal de compartición.
 */
export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  documentId,
  documentName,
}) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { getVerifiedSigner } = useSigner();
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<DocumentRole>(DocumentRole.SHARED_READ);
  const [error, setError] = useState<string | null>(null);
  const [pendingRecipient, setPendingRecipient] = useState<UserSearchResult | null>(null);

  // Estado de la wallet y de la transacción
  const [step, setStep] = useState<ShareStep>('form');
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [txDetailHash, setTxDetailHash] = useState<string | null>(null);
  const [prepareResult, setPrepareResult] = useState<any>(null);

  const isProcessing = step !== 'form' && step !== 'error';

  /**
   * Inicia el proceso de compartición: valida el destinatario y muestra el selector de wallet.
   */
  const handleStartShare = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim()) {
      setError('El nombre de usuario es requerido');
      return;
    }

    if (!password.trim()) {
      setError('Su contraseña de cuenta es requerida para descifrar el documento');
      return;
    }

    try {
      setStep('validating');

      const trimmedUsername = username.trim();
      const searchResult = await usersApi.search(trimmedUsername);
      if (!searchResult.users || searchResult.users.length === 0) {
        throw new Error(`Usuario "${trimmedUsername}" no encontrado`);
      }

      setPendingRecipient(searchResult.users[0]);

      // Bloquear auto-comparticion
      if (searchResult.users[0].id === user?.id) {
        throw new Error('No puedes compartir un documento contigo mismo');
      }

      setStep('form');
      setShowWalletModal(true);
    } catch (err: any) {
      setPendingRecipient(null);
      setError(getErrorMessage(err) || 'Error al validar el destinatario');
      setStep('error');
    }
  };

  /**
   * Gestiona la seleccion de wallet para firmar la transaccion de comparticion.
   */
  const handleWalletSelected = async (wallet: SavedWallet | null, connectedAddress: string) => {
    setShowWalletModal(false);
    setStep('preparing');
    setError(null);

    try {
      if (!user) throw new Error('Usuario no autenticado');
      if (!wallet) throw new Error('Wallet not selected');

      const signer = await getVerifiedSigner(connectedAddress);
      const recipientUser = pendingRecipient ?? (await usersApi.search(username.trim())).users?.[0];
      if (!recipientUser) throw new Error(`Usuario "${username.trim()}" no encontrado`);

      setPrepareResult({ recipient: recipientUser.username, role: selectedRole });
      setStep('signing');

      if (!user.encryptedPrivateKey) {
        throw new Error('Clave privada no disponible. Reconfigura tu cuenta.');
      }
      const result = await shareService.share({
        signer,
        documentId,
        recipientUser,
        role: selectedRole,
        walletId: wallet.id,
        password,
        encryptedPrivateKey: user.encryptedPrivateKey,
        keySalt: user.keySalt,
      });

      setTxHash(result.txHash);
      setStep('success');

      queryClient.invalidateQueries({ queryKey: ['shares', documentId] });

      timerRef.current = setTimeout(() => {
        setUsername('');
        setPassword('');
        setPendingRecipient(null);
        setSelectedRole(DocumentRole.SHARED_READ);
        setStep('form');
        setTxHash(null);
        setPrepareResult(null);
        onClose();
      }, 2000);

    } catch (err: any) {
      setError(getErrorMessage(err) || 'Error al compartir el documento');
      setStep('error');
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      setUsername('');
      setPassword('');
      setPendingRecipient(null);
      setSelectedRole(DocumentRole.SHARED_READ);
      setStep('form');
      setError(null);
      onClose();
    }
  };

  const roleOptions: { value: DocumentRole; label: string; description: string }[] = [
    {
      value: DocumentRole.SHARED_READ,
      label: 'Lectura',
      description: 'Puede ver y descargar el documento',
    },
    {
      value: DocumentRole.SHARED_WRITE,
      label: 'Escritura',
      description: 'Puede ver, descargar, crear versiones y firmar',
    },
  ];

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[640px]">
          <DialogHeader>
            <DialogTitle>Compartir Documento</DialogTitle>
            <DialogDescription>
              Compartir "{documentName}" con otro usuario
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {step === 'success' && (
            <Alert className="border-green-500 bg-green-50">
              <UserPlus className="h-4 w-4 text-green-500" />
              <AlertDescription className="text-green-700 space-y-1">
                <span>¡Documento compartido exitosamente!</span>
                {txHash && (
                  <>
                    <br />
                    <button
                      type="button"
                      className="text-blue-600 hover:underline font-mono text-xs flex items-center gap-1"
                      onClick={() => setTxDetailHash(txHash)}
                    >
                      Tx: {txHash} <ExternalLink className="w-3 h-3" />
                    </button>
                  </>
                )}
              </AlertDescription>
            </Alert>
          )}

          {step === 'signing' && prepareResult && (
            <SigningReviewPanel
              operationName="Compartir documento en blockchain"
              documentName={documentName}
              details={[
                ['Destinatario', prepareResult.recipient || username || '—'],
                ['Permiso', prepareResult.role === DocumentRole.SHARED_WRITE ? 'Escritura' : 'Lectura'],
              ]}
              contractAddress="DocumentRegistry"
            />
          )}

          {isProcessing && (
            <div className="space-y-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-blue-700">
                {step === 'validating' && <Loader2 className="h-4 w-4 animate-spin" />}
                {step === 'preparing' && <Loader2 className="h-4 w-4 animate-spin" />}
                {step === 'signing' && <Wallet className="h-4 w-4" />}
                <span className="text-sm">
                  {step === 'validating' && 'Comprobando destinatario...'}
                  {step === 'preparing' && 'Preparando documento...'}
                  {step === 'signing' && 'Firme la transacción en su wallet...'}
                </span>
              </div>
            </div>
          )}

          <form onSubmit={handleStartShare} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Nombre de Usuario</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setPendingRecipient(null);
                }}
                placeholder="Ingrese nombre de usuario con quien compartir"
                required
                disabled={isProcessing}
              />
            </div>

            <div className="space-y-2">
              <Label>Nivel de Permiso</Label>
              <div className="space-y-2">
                {roleOptions.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-accent transition-colors"
                  >
                    <input
                      type="radio"
                      name="role"
                      value={option.value}
                      checked={selectedRole === option.value}
                      onChange={(e) => setSelectedRole(e.target.value as DocumentRole)}
                      className="mt-1"
                      disabled={isProcessing}
                    />
                    <div className="flex-1">
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-muted-foreground">{option.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Su Contraseña de Cuenta</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingrese su contraseña de cuenta"
                required
                disabled={isProcessing}
              />
              <p className="text-xs text-muted-foreground">
                Su contraseña es necesaria para descifrar localmente el documento y re-cifrarlo para el destinatario.
              </p>
            </div>

            <Alert variant="info">
              <Info className="h-4 w-4" />
              <AlertDescription>
                El documento será re-cifrado de forma segura para el destinatario por el backend.
                Deberá firmar una transacción blockchain para registrar el acceso.
              </AlertDescription>
            </Alert>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose} type="button" disabled={isProcessing}>
              Cancelar
            </Button>
            <Button
              variant="default"
              disabled={isProcessing}
              type="submit"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Compartir y Firmar
                </>
              )}
            </Button>
          </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal selector de wallet */}
      <WalletSelectorModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        onSelect={handleWalletSelected}
        title="Seleccionar Wallet para Compartir"
        description={`Vas a compartir "${documentName}"${username ? ` con ${username}` : ''}. El permiso se registrará en blockchain. Confirma en tu wallet.`}
      />

      <TransactionDetailModal
        open={!!txDetailHash}
        onClose={() => setTxDetailHash(null)}
        txHash={txDetailHash || undefined}
      />
    </>
  );
};
