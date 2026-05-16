import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { DocumentRole } from '../../types';
import { sharesApi } from '../../api/shares';
import { documentsApi } from '../../api/documents';
import { usersApi, type UserSearchResult } from '../../api/users';
import { KeyManager } from '../../lib/crypto/KeyManager';
import { getErrorMessage } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { useSigner } from '../../hooks/useSigner';
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
import { AccessRole } from '../../lib/blockchain/contracts';
import { UserPlus, AlertCircle, Info, Loader2, Wallet } from 'lucide-react';

/**
 * Propiedades del componente ShareModal.
 */
interface ShareModalProps {
  /** Indica si el modal está abierto. */
  isOpen: boolean;
  /** Función para cerrar el modal. */
  onClose: () => void;
  /** Identificador único del documento a compartir. */
  documentId: string;
  /** Nombre del documento a compartir. */
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
  const { getRegistryContract } = useSigner();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<DocumentRole>(DocumentRole.SHARED_READ);
  const [error, setError] = useState<string | null>(null);
  const [pendingRecipient, setPendingRecipient] = useState<UserSearchResult | null>(null);

  // Estado de la wallet y de la transacción
  const [step, setStep] = useState<ShareStep>('form');
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

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
      setStep('form');
      setShowWalletModal(true);
    } catch (err: any) {
      setPendingRecipient(null);
      setError(getErrorMessage(err) || 'Error al validar el destinatario');
      setStep('error');
    }
  };

  /**
   * Gestiona la selección de wallet para compartir (Arquitectura de Cifrado en Backend).
   */
  const handleWalletSelected = async (wallet: SavedWallet | null, connectedAddress: string) => {
    setShowWalletModal(false);
    setStep('preparing');
    setError(null);

    try {
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const registryContract = await getRegistryContract(connectedAddress);

      // Paso 1: utiliza el destinatario validado, recurriendo a una búsqueda solo si es necesario
      const recipientUser = pendingRecipient ?? (await usersApi.search(username.trim())).users?.[0];
      if (!recipientUser) {
        throw new Error(`Usuario "${username.trim()}" no encontrado`);
      }

      // Paso 2: obtiene el documento para acceder a la clave simétrica cifrada
      const { document } = await documentsApi.get(documentId);
      if (document.visibility === 'PUBLIC') {
        throw new Error('Los documentos públicos se comparten mediante enlace o QR, no mediante compartición privada.');
      }

      if (!document.encryptedSymmetricKey) {
        throw new Error('El documento no tiene clave de cifrado');
      }

      // Paso 3: descifra la clave privada del usuario con la contraseña
      if (!user.encryptedPrivateKey) {
        throw new Error('Usuario no tiene claves configuradas');
      }

      const privateKey = await KeyManager.decryptPrivateKey(
        user.encryptedPrivateKey,
        password,
        user.keySalt
      );

      // Paso 4: descifra la clave simétrica con la clave privada del usuario
      const decryptedSymmetricKeyBuffer = await KeyManager.decryptWithPrivateKey(
        document.encryptedSymmetricKey,
        privateKey
      );

      // Convierte a base64
      const decryptedSymmetricKey = btoa(
        String.fromCharCode(...new Uint8Array(decryptedSymmetricKeyBuffer))
      );

      // Paso 5: llama al backend para preparar (el backend recifra para el destinatario)
      const prepareResult = await sharesApi.prepareShare({
        documentId,
        sharedWithUserId: recipientUser.id,
        role: selectedRole,
        sharerWalletId: wallet?.id || '',
        decryptedSymmetricKey,
      });
      
      // Paso 6: firma la transacción blockchain para el control de acceso
      setStep('signing');

      const role = selectedRole === DocumentRole.SHARED_WRITE
        ? AccessRole.EDITOR
        : AccessRole.VIEWER;
      
      // Otorga permiso en blockchain utilizando la dirección de wallet del destinatario
      const tx = await registryContract.shareDocument(
        prepareResult.blockchainId as `0x${string}`,
        prepareResult.sharedWithAddress as `0x${string}`,
        role
      );

      setTxHash(tx.hash);
      setStep('confirming');

      // Espera la confirmación
      await tx.wait();

      // Paso 7: confirma la compartición en el backend
      await sharesApi.confirmShare({
        shareId: prepareResult.shareId,
        txHash: tx.hash,
      });

      setStep('success');

      // Invalida las consultas y cierra tras una espera
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

      {/* Modal selector de wallet */}
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
