/**
 * Componente de transferencia de documento.
 * Permite al propietario transferir la propiedad de un documento a otro usuario.
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Badge } from '../ui/Badge';
import { WalletSelectorModal } from '../wallets/WalletSelectorModal';
import { getErrorMessage } from '../../lib/api';
import type { SavedWallet } from '../../contexts/WalletManagerContext';
import { useSigner } from '../../hooks/useSigner';
import { documentsApi } from '../../api/documents';
import { usersApi } from '../../api/users';
import { KeyManager } from '../../lib/crypto/KeyManager';
import { useAuth } from '../../contexts/AuthContext';
import {
  ArrowRightLeft,
  Search,
  Loader2,
  AlertCircle,
  CheckCircle,
  Shield,
  Wallet
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/Avatar';

/**
 * Resultado de una búsqueda de usuarios.
 */
interface UserSearchResult {
  id: string;
  username: string;
  fullName: string | null;
  email: string;
  avatarUrl?: string | null;
}

/**
 * Props del componente DocumentTransfer.
 */
interface DocumentTransferProps {
  /** Identificador del documento a transferir. */
  documentId: string;
  /** Nombre del documento a transferir. */
  documentName: string;
  /** Indica si el usuario actual es el propietario del documento. */
  isOwner: boolean;
  /** Indica si el documento es público. */
  isPublic?: boolean;
  /** Callback que se ejecuta cuando la transferencia se completa exitosamente. */
  onTransferComplete?: (newOwnerId: string) => void;
}

/** Pasos posibles durante el proceso de transferencia. */
type TransferStep = 'form' | 'select_wallet' | 'preparing' | 'signing' | 'confirming' | 'success' | 'error';

/**
 * Componente para transferir la propiedad de un documento a otro usuario.
 * Gestiona la búsqueda del destinatario, la confirmación y la firma blockchain.
 */
export const DocumentTransfer: React.FC<DocumentTransferProps> = ({
  documentId,
  documentName,
  isOwner,
  isPublic = false,
  onTransferComplete
}) => {
  const { user } = useAuth();
  const { getVerifiedSigner } = useSigner();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null);
  const [password, setPassword] = useState('');
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // Wallet and transaction state
  const [step, setStep] = useState<TransferStep>('form');
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const searchUsers = async () => {
    if (!searchQuery.trim()) return;

    try {
      setSearching(true);
      setError(null);

      const response = await usersApi.search(searchQuery);
      setSearchResults(response.users || []);
    } catch (err: any) {
      console.error('Error al buscar usuarios:', err);
      setError(getErrorMessage(err));
    } finally {
      setSearching(false);
    }
  };

  const selectUser = (user: UserSearchResult) => {
    setSelectedUser(user);
    setShowConfirmation(true);
    setSearchResults([]);
    setSearchQuery('');
  };

  const cancelSelection = () => {
    setSelectedUser(null);
    setShowConfirmation(false);
    setPassword('');
    setError(null);
    setStep('form');
  };

  /**
   * Inicia el proceso de transferencia mostrando el selector de wallets.
   */
  const startTransfer = async () => {
    if (!selectedUser || (!isPublic && !password)) {
      setError(
        isPublic
          ? 'Por favor, selecciona un usuario destinatario.'
          : 'Por favor, selecciona un usuario e introduce la contraseña de su cuenta'
      );
      return;
    }

    // Show wallet selector for blockchain signing
    setShowWalletModal(true);
  };

  /**
   * Gestiona la selección de wallet para firmar la transferencia.
   */
  const handleWalletSelected = async (wallet: SavedWallet | null, connectedAddress: string) => {
    setShowWalletModal(false);
    setStep('preparing');
    setError(null);
    setSuccess(null);

    try {
      if (!selectedUser) throw new Error('No user selected');
      if (!wallet) throw new Error('No wallet selected');
      if (!isPublic && !user?.encryptedPrivateKey) {
        throw new Error('El usuario autenticado no tiene material criptográfico disponible.');
      }
      
      const signer = await getVerifiedSigner(connectedAddress);

      const { document } = await documentsApi.get(documentId);
      if (!isPublic && !document.encryptedSymmetricKey) {
        throw new Error('El documento no tiene clave de cifrado disponible.');
      }

      const decryptedSymmetricKey = isPublic
        ? undefined
        : (() => {
            const privateKeyPromise = KeyManager.decryptPrivateKey(
              user!.encryptedPrivateKey!,
              password,
              user!.keySalt
            );

            return privateKeyPromise.then(async (privateKey) => {
              const decryptedSymmetricKeyBuffer = await KeyManager.decryptWithPrivateKey(
                document.encryptedSymmetricKey!,
                privateKey
              );

              return btoa(String.fromCharCode(...new Uint8Array(decryptedSymmetricKeyBuffer)));
            });
          })();

      const newOwner = await usersApi.getUserById(selectedUser.id);
      if (!newOwner.walletAddress) {
        throw new Error('New owner does not have a primary wallet');
      }

      // Paso 1: Preparar la transferencia en el backend.

      const prepareResponse = await documentsApi.prepareTransfer({
        documentId,
        newOwnerId: selectedUser.id,
        walletId: wallet.id,
        newOwnerWalletAddress: newOwner.walletAddress,
        decryptedSymmetricKey: await decryptedSymmetricKey,
      });

      const {
        transferId,
        docId,
        newOwnerAddress,
        message,
      } = prepareResponse;

      // Paso 2: Firmar la transacción en la blockchain.
      setStep('signing');

      // Import contract wrapper
      const { DocumentRegistryContract } = await import('../../lib/blockchain');
      const contract = new DocumentRegistryContract(signer);

      const tx = await contract.transferOwnership(docId, newOwnerAddress);
      const txHash = tx.hash;
      
      // Paso 3: Esperar la confirmación de la transacción.
      setStep('confirming');
      const receipt = await tx.wait();

      // Paso 4: Confirmar la transferencia en el backend.
      await documentsApi.confirmTransfer({
        documentId,
        transferId,
        txHash,
        signature: message, // For audit trail
      });

      setStep('success');
      setSuccess(`Documento transferido exitosamente a ${selectedUser.username}`);
      onTransferComplete?.(selectedUser.id);
      
      // Limpiar estado tras la transferencia exitosa.
      setTimeout(() => {
        setSelectedUser(null);
        setShowConfirmation(false);
        setPassword('');
        setStep('form');
        setTxHash(null);
      }, 2000);
      
    } catch (err: any) {
      console.error('Error al transferir documento:', err);
      setError(err.message || getErrorMessage(err));
      setStep('error');
    }
  };

  const isProcessing = step !== 'form' && step !== 'error';

  if (!isOwner) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Shield className="h-5 w-5" />
            <span>Solo el propietario puede transferir este documento</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5" />
            Transferir Propiedad
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Mensajes de estado */}
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-[#fecaca] bg-[#fff5f5] p-3 text-[#b91c1c]">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          
          {success && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-[#bbf7d0] bg-[#f0fdf4] p-3 text-[#166534]">
              <CheckCircle className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm">{success}</span>
              {txHash && (
                <span className="text-xs font-mono">Tx: {txHash.slice(0, 10)}...</span>
              )}
            </div>
          )}

          {/* Processing indicator */}
          {isProcessing && (
            <div className="mb-4 space-y-2 rounded-lg border border-[#bae6fd] bg-[#f0f9ff] p-3">
              <div className="flex items-center gap-2 text-[#0f4c81]">
                {step === 'preparing' && <Loader2 className="h-4 w-4 animate-spin" />}
                {step === 'signing' && <Wallet className="h-4 w-4" />}
                {step === 'confirming' && <Loader2 className="h-4 w-4 animate-spin" />}
                <span className="text-sm">
                  {step === 'preparing' && 'Preparando transferencia...'}
                  {step === 'signing' && 'Firme la transacción en su wallet...'}
                  {step === 'confirming' && 'Confirmando en blockchain...'}
                </span>
              </div>
            </div>
          )}

          {/* Modal de confirmación */}
          {showConfirmation && selectedUser ? (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  <strong>Atención:</strong> Estás a punto de transferir la propiedad de 
                  <strong> "{documentName}"</strong> a <strong>{selectedUser.username}</strong>.
                  Esta acción no se puede deshacer y requerirá firmar una transacción blockchain.
                </p>
                {isPublic ? (
                  <p className="mt-2 text-sm text-amber-800">
                    El documento es público, por lo que la transferencia no requiere re-encriptación del contenido.
                  </p>
                ) : null}
              </div>

              {/* Usuario seleccionado */}
              <div className="flex items-center gap-3 rounded-lg border border-border bg-secondary/35 p-3">
                <Avatar className="h-10 w-10">
                  {selectedUser.avatarUrl ? (
                    <AvatarImage src={selectedUser.avatarUrl} alt={selectedUser.username} />
                  ) : null}
                  <AvatarFallback className="bg-[linear-gradient(135deg,#2dd4bf_0%,#0ea5e9_100%)] text-sm text-slate-950">
                    {(selectedUser.fullName || selectedUser.username).slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-foreground">{selectedUser.fullName || selectedUser.username}</p>
                  <p className="text-sm text-muted-foreground">@{selectedUser.username}</p>
                </div>
              </div>

              {/* Campo de contraseña */}
              {!isPublic ? (
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña de su cuenta</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Introduce su contraseña para descifrar el documento"
                    disabled={isProcessing}
                  />
                </div>
              ) : null}

              {/* Botones de acción */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={cancelSelection}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={startTransfer}
                  disabled={isProcessing || (!isPublic && !password)}
                  className="flex-1 bg-amber-600 hover:bg-amber-700"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Transfiriendo...
                    </>
                  ) : (
                    <>
                      <ArrowRightLeft className="h-4 w-4 mr-2" />
                      Transferir y Firmar
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Buscador de usuarios */}
              <div className="space-y-2">
                <Label>Buscar nuevo propietario</Label>
                <div className="flex gap-2">
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por nombre de usuario o email"
                    onKeyDown={(e) => e.key === 'Enter' && searchUsers()}
                    disabled={isProcessing}
                  />
                  <Button
                    variant="outline"
                    onClick={searchUsers}
                    disabled={searching || !searchQuery.trim() || isProcessing}
                  >
                    {searching ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Resultados de búsqueda */}
              {searchResults.length > 0 && (
                <div className="divide-y rounded-lg border border-border bg-white">
                  {searchResults.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => selectUser(user)}
                      className="flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-secondary/35"
                      disabled={isProcessing}
                    >
                      <Avatar className="h-10 w-10">
                        {user.avatarUrl ? (
                          <AvatarImage src={user.avatarUrl} alt={user.username} />
                        ) : null}
                        <AvatarFallback className="bg-[linear-gradient(135deg,#2dd4bf_0%,#0ea5e9_100%)] text-sm text-slate-950">
                          {(user.fullName || user.username).slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{user.fullName || user.username}</p>
                        <p className="text-sm text-muted-foreground">@{user.username}</p>
                      </div>
                      <Badge variant="outline">Seleccionar</Badge>
                    </button>
                  ))}
                </div>
              )}

              {/* Sin resultados */}
              {searchQuery && searchResults.length === 0 && !searching && (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No se encontraron usuarios con ese criterio
                </p>
              )}

              {/* Información */}
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>La transferencia de propiedad incluye:</p>
                <ul className="list-disc list-inside ml-2">
                  <li>Cambio de propietario en blockchain (requiere firma)</li>
                  <li>Re-cifrado de la clave simétrica para el nuevo propietario</li>
                  <li>Eliminación de todas las comparticiones existentes</li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Wallet Selector Modal */}
      <WalletSelectorModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        onSelect={handleWalletSelected}
        title="Seleccionar Wallet para Transferir"
        description="Seleccione una wallet para firmar la transacción de transferencia de propiedad"
      />
    </>
  );
};

export default DocumentTransfer;