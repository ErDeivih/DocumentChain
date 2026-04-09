/**
 * Componente de Transferencia de Documento
 * Permite al propietario transferir la propiedad a otro usuario
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
import { blockchainProvider } from '../../lib/blockchain/provider';
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
  User,
  Shield,
  Wallet
} from 'lucide-react';

interface UserSearchResult {
  id: string;
  username: string;
  fullName: string | null;
  email: string;
  avatarUrl?: string | null;
}

interface DocumentTransferProps {
  documentId: string;
  documentName: string;
  isOwner: boolean;
  isPublic?: boolean;
  onTransferComplete?: (newOwnerId: string) => void;
}

type TransferStep = 'form' | 'select_wallet' | 'preparing' | 'signing' | 'confirming' | 'success' | 'error';

export const DocumentTransfer: React.FC<DocumentTransferProps> = ({
  documentId,
  documentName,
  isOwner,
  isPublic = false,
  onTransferComplete
}) => {
  const { user } = useAuth();
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
   * Start transfer process - show wallet selector
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
   * Handle wallet selection for transfer
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
      
      // Get signer from connected wallet
      const signer = blockchainProvider.getSigner();
      if (!signer) {
        throw new Error('No signer available. Please connect your wallet.');
      }
      
      // Verify the connected address matches
      const signerAddress = await signer.getAddress();
      if (signerAddress.toLowerCase() !== connectedAddress.toLowerCase()) {
        throw new Error('Connected wallet does not match selected wallet.');
      }

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

      // Step 1: Prepare transfer (backend)
      console.log('Preparing transfer...', {
        documentId,
        newOwnerId: selectedUser.id,
        currentOwnerWalletId: wallet.id,
        newOwnerWalletAddress: newOwner.walletAddress,
      });

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

      console.log('Transfer prepared:', { transferId, docId, newOwnerAddress });

      // Step 2: Sign blockchain transaction
      setStep('signing');

      // Import contract wrapper
      const { DocumentRegistryContract } = await import('../../lib/blockchain');
      const contract = new DocumentRegistryContract(signer);

      console.log('Calling blockchain transferOwnership...', { docId, newOwnerAddress });
      
      const tx = await contract.transferOwnership(docId, newOwnerAddress);
      const txHash = tx.hash;
      
      console.log('Transaction sent:', txHash);
      setTxHash(txHash);
      
      // Step 3: Wait for confirmation
      setStep('confirming');
      const receipt = await tx.wait();
      
      console.log('Transaction confirmed:', receipt);

      // Step 4: Confirm in backend
      await documentsApi.confirmTransfer({
        documentId,
        transferId,
        txHash,
        signature: message, // For audit trail
      });

      console.log('Transfer confirmed in backend');
      
      setStep('success');
      setSuccess(`Documento transferido exitosamente a ${selectedUser.username}`);
      onTransferComplete?.(selectedUser.id);
      
      // Limpiar estado
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
          <div className="flex items-center gap-2 text-gray-500">
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
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
              <CheckCircle className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm">{success}</span>
              {txHash && (
                <span className="text-xs font-mono">Tx: {txHash.slice(0, 10)}...</span>
              )}
            </div>
          )}

          {/* Processing indicator */}
          {isProcessing && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-blue-700">
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
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-200">
                  <User className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium">{selectedUser.fullName || selectedUser.username}</p>
                  <p className="text-sm text-gray-500">@{selectedUser.username}</p>
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
                <div className="border rounded-lg divide-y">
                  {searchResults.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => selectUser(user)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors text-left"
                      disabled={isProcessing}
                    >
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-200">
                        <User className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{user.fullName || user.username}</p>
                        <p className="text-sm text-gray-500">@{user.username}</p>
                      </div>
                      <Badge variant="outline">Seleccionar</Badge>
                    </button>
                  ))}
                </div>
              )}

              {/* Sin resultados */}
              {searchQuery && searchResults.length === 0 && !searching && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No se encontraron usuarios con ese criterio
                </p>
              )}

              {/* Información */}
              <div className="text-xs text-gray-500 space-y-1">
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