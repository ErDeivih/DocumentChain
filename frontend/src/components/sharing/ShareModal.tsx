import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { DocumentRole } from '../../types';
import { sharesApi } from '../../api/shares';
import { documentsApi } from '../../api/documents';
import { usersApi, type UserSearchResult } from '../../api/users';
import { KeyManager } from '../../lib/crypto/KeyManager';
import { getErrorMessage } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
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
import { Label } from '../ui/Label';
import { Alert, AlertDescription } from '../ui/Alert';
import { WalletSelectorModal } from '../wallets/WalletSelectorModal';
import { SavedWallet } from '../../contexts/WalletManagerContext';
import { blockchainProvider } from '../../lib/blockchain/provider';
import { AccessRole, DocumentRegistryContract } from '../../lib/blockchain/contracts';
import { UserPlus, AlertCircle, Info, Loader2, Wallet } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  documentName: string;
}

type ShareStep = 'form' | 'validating' | 'preparing' | 'signing' | 'confirming' | 'success' | 'error';

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  documentId,
  documentName,
}) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<DocumentRole>(DocumentRole.SHARED_READ);
  const [error, setError] = useState<string | null>(null);
  const [pendingRecipient, setPendingRecipient] = useState<UserSearchResult | null>(null);
  
  // Wallet and transaction state
  const [step, setStep] = useState<ShareStep>('form');
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const isProcessing = step !== 'form' && step !== 'error';

  /**
   * Start share process - validate and show wallet selector
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
      setStep('form');
      setShowWalletModal(true);
    } catch (err: any) {
      setPendingRecipient(null);
      setError(getErrorMessage(err) || 'Error al validar el destinatario');
      setStep('error');
    }
  };

  /**
   * Handle wallet selection for sharing (Backend Encryption Architecture)
   */
  const handleWalletSelected = async (wallet: SavedWallet | null, connectedAddress: string) => {
    setShowWalletModal(false);
    setStep('preparing');
    setError(null);

    try {
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      // Get signer
      const signer = blockchainProvider.getSigner();
      if (!signer) {
        throw new Error('No signer available. Please connect your wallet.');
      }
      
      // Verify connected address matches
      const signerAddress = await signer.getAddress();
      if (signerAddress.toLowerCase() !== connectedAddress.toLowerCase()) {
        throw new Error('Connected wallet does not match selected wallet.');
      }

      // Step 1: Use the validated recipient, falling back to a lookup only if needed
      const recipientUser = pendingRecipient ?? (await usersApi.search(username.trim())).users?.[0];
      if (!recipientUser) {
        throw new Error(`Usuario "${username.trim()}" no encontrado`);
      }

      // Step 2: Get document to access encrypted symmetric key
      const { document } = await documentsApi.get(documentId);
      if (document.visibility === 'PUBLIC') {
        throw new Error('Los documentos públicos se comparten mediante enlace o QR, no mediante compartición privada.');
      }

      if (!document.encryptedSymmetricKey) {
        throw new Error('El documento no tiene clave de cifrado');
      }

      // Step 3: Decrypt user's private key with password
      if (!user.encryptedPrivateKey) {
        throw new Error('Usuario no tiene claves configuradas');
      }

      const privateKey = await KeyManager.decryptPrivateKey(
        user.encryptedPrivateKey,
        password,
        user.keySalt
      );

      // Step 4: Decrypt symmetric key with user's private key
      const decryptedSymmetricKeyBuffer = await KeyManager.decryptWithPrivateKey(
        document.encryptedSymmetricKey,
        privateKey
      );

      // Convert to base64
      const decryptedSymmetricKey = btoa(
        String.fromCharCode(...new Uint8Array(decryptedSymmetricKeyBuffer))
      );

      // Step 5: Call backend prepare (backend re-encrypts for recipient)
      const prepareResult = await sharesApi.prepareShare({
        documentId,
        sharedWithUserId: recipientUser.id,
        role: selectedRole,
        sharerWalletId: wallet?.id || '',
        decryptedSymmetricKey,
      });
      
      // Step 6: Sign blockchain transaction for access control
      setStep('signing');
      
      // Create registry contract instance
      const registryContract = new DocumentRegistryContract(signer);
      
      const role = selectedRole === DocumentRole.SHARED_WRITE
        ? AccessRole.EDITOR
        : AccessRole.VIEWER;
      
      // Grant permission on blockchain using recipient's wallet address
      const tx = await registryContract.shareDocument(
        prepareResult.blockchainId as `0x${string}`,
        prepareResult.sharedWithAddress as `0x${string}`,
        role
      );
      
      setTxHash(tx.hash);
      setStep('confirming');
      
      // Wait for confirmation
      await tx.wait();
      
      // Step 7: Confirm share in backend
      await sharesApi.confirmShare({
        shareId: prepareResult.shareId,
        txHash: tx.hash,
      });
      
      setStep('success');
      
      // Invalidate queries and close after delay
      queryClient.invalidateQueries({ queryKey: ['shares', documentId] });
      
      setTimeout(() => {
        setUsername('');
        setPassword('');
        setPendingRecipient(null);
        setSelectedRole(DocumentRole.SHARED_READ);
        setStep('form');
        setTxHash(null);
        onClose();
      }, 2000);
      
    } catch (err: any) {
      console.error('Error sharing document:', err);
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
        <DialogContent className="sm:max-w-[500px]">
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
              <AlertDescription className="text-green-700">
                ¡Documento compartido exitosamente! {txHash && `Tx: ${txHash.slice(0, 10)}...`}
              </AlertDescription>
            </Alert>
          )}

          {isProcessing && (
            <div className="space-y-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-blue-700">
                {step === 'validating' && <Loader2 className="h-4 w-4 animate-spin" />}
                {step === 'preparing' && <Loader2 className="h-4 w-4 animate-spin" />}
                {step === 'signing' && <Wallet className="h-4 w-4" />}
                {step === 'confirming' && <Loader2 className="h-4 w-4 animate-spin" />}
                <span className="text-sm">
                  {step === 'validating' && 'Comprobando destinatario...'}
                  {step === 'preparing' && 'Preparando documento...'}
                  {step === 'signing' && 'Firme la transacción en su wallet...'}
                  {step === 'confirming' && 'Confirmando en blockchain...'}
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
                Su contraseña es necesaria para descifrar localmente el documento. El backend lo re-cifrará para el destinatario.
              </p>
            </div>

            <Alert variant="info">
              <Info className="h-4 w-4" />
              <AlertDescription>
                El documento será re-cifrado de forma segura para el destinatario por el backend.
                Deberá firmar una transacción blockchain para registrar el acceso.
              </AlertDescription>
            </Alert>
          </form>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose} type="button" disabled={isProcessing}>
              Cancelar
            </Button>
            <Button
              variant="default"
              onClick={handleStartShare}
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
        </DialogContent>
      </Dialog>

      {/* Wallet Selector Modal */}
      <WalletSelectorModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        onSelect={handleWalletSelected}
        title="Seleccionar Wallet para Compartir"
        description="Seleccione una wallet para firmar la transacción de compartición"
      />
    </>
  );
};
