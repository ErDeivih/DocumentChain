/**
 * Componente de transferencia de documento.
 * Permite al propietario transferir la propiedad de un documento a otro usuario.
 */

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { WalletSelectorModal } from '../wallets/WalletSelectorModal';
import { SigningReviewPanel } from '../ui/SigningReviewPanel';
import { TransactionDetailModal } from '../audit/TransactionDetailModal';
import { getErrorMessage } from '../../lib/api';
import { usersApi } from '../../api/users';
import { transferService } from '../../services/blockchain/TransferService';
import { ExternalLink } from 'lucide-react';
import type { SavedWallet } from '../../contexts/WalletManagerContext';
import { useSigner } from '../../hooks/useSigner';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowRightLeft, Loader2, AlertCircle, Wallet, CheckCircle, Shield } from 'lucide-react';
import { UserSearchSelector } from './UserSearchSelector';
import type { UserSearchResult } from './UserSearchSelector';
import { TransferConfirmationPanel } from './TransferConfirmationPanel';

interface DocumentTransferProps {
    documentId: string;
    documentName: string;
    isOwner: boolean;
    isPublic?: boolean;
    onTransferComplete?: (newOwnerId: string) => void;
}

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
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);
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
  const [txDetailHash, setTxDetailHash] = useState<string | null>(null);

  const searchUsers = async () => {
    if (!searchQuery.trim()) return;

    try {
      setSearching(true);
      setError(null);

      const response = await usersApi.search(searchQuery);
      setSearchResults(response.users || []);
    } catch (err: any) {
      if (process.env.NODE_ENV === "development") { console.error('Error al buscar usuarios:', err); }
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

    if (!user) {
      setError('Debe iniciar sesión para transferir documentos');
      return;
    }

    if (selectedUser.id === user.id) {
      setError('No puedes transferirte el documento a ti mismo');
      return;
    }

    // Mostrar selector de wallet para firma blockchain
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

      const signer = await getVerifiedSigner(connectedAddress);
      setStep('signing');

      const result = await transferService.transfer({
        documentId,
        newOwnerId: selectedUser.id,
        walletId: wallet.id,
        signer,
        isPublic,
        userEncryptedPrivateKey: user?.encryptedPrivateKey,
        userKeySalt: user?.keySalt,
        userPassword: password,
      });

      setTxHash(result.txHash);
      setStep('success');
      setSuccess(`Documento transferido exitosamente a ${selectedUser.username}`);
      onTransferComplete?.(selectedUser.id);

      timerRef.current = setTimeout(() => {
        setSelectedUser(null);
        setShowConfirmation(false);
        setPassword('');
        setStep('form');
        setTxHash(null);
      }, 2000);

    } catch (err: any) {
      if (process.env.NODE_ENV === "development") { console.error('Error al transferir documento:', err); }
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
                <button
                  type="button"
                  className="text-blue-600 hover:underline font-mono text-xs flex items-center gap-1"
                  onClick={() => setTxDetailHash(txHash)}
                >
                  Tx: {txHash} <ExternalLink className="w-3 h-3" />
                </button>
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
                </span>
              </div>
            </div>
          )}

          {step === 'signing' && selectedUser && (
            <SigningReviewPanel
              operationName="Transferencia de propiedad en blockchain"
              documentName={documentName}
              details={[
                ['Nuevo propietario', selectedUser.username || '—'],
                ['Acción', 'Irreversible'],
              ]}
              contractAddress="DocumentRegistry"
            />
          )}

          {/* Modal de confirmación */}
          {showConfirmation && selectedUser ? (
            <TransferConfirmationPanel
              selectedUser={selectedUser}
              documentName={documentName}
              isPublic={isPublic}
              password={password}
              onPasswordChange={setPassword}
              onCancel={cancelSelection}
              onTransfer={startTransfer}
              isProcessing={isProcessing}
            />
          ) : (
            <>
              <UserSearchSelector
                searchQuery={searchQuery}
                onSearchQueryChange={setSearchQuery}
                searchResults={searchResults}
                searching={searching}
                onSearch={searchUsers}
                onSelectUser={selectUser}
                isProcessing={isProcessing}
              />
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>La transferencia de propiedad incluye:</p>
                <ul className="list-disc list-inside ml-2">
                  <li>Cambio de propietario en blockchain (requiere firma)</li>
                  <li>Re-cifrado de la clave simétrica para el nuevo propietario</li>
                  <li>Eliminación de todas las comparticiones existentes</li>
                </ul>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Wallet Selector Modal */}
      <WalletSelectorModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        onSelect={handleWalletSelected}
        title="Seleccionar Wallet para Transferir"
        description={selectedUser ? `Vas a transferir la propiedad de "${documentName}" a ${selectedUser.username}. Esta acción es irreversible y quedará registrada en blockchain. Confirma en tu wallet.` : `Vas a transferir la propiedad de "${documentName}". Esta acción es irreversible. Confirma en tu wallet.`}
      />

      <TransactionDetailModal
        open={!!txDetailHash}
        onClose={() => setTxDetailHash(null)}
        txHash={txDetailHash || undefined}
      />
    </>
  );
};

export default DocumentTransfer;