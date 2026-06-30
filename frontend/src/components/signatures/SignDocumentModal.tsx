/**
 * Modal para firmar una versión de documento con blockchain.
 * Permite al usuario añadir un comentario opcional y firmar con su wallet.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { SigningReviewPanel } from '../ui/SigningReviewPanel';
import { Badge } from '../ui/Badge';
import AlertMessage from '../ui/AlertMessage';
import { WalletSelectorModal } from '../wallets/WalletSelectorModal';
import { signingService } from '../../services/blockchain/SigningService';
import { signaturesApi } from '../../api/signatures';
import { useSigner } from '../../hooks/useSigner';
import { useAuth } from '../../contexts/AuthContext';
import { FileSignature, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import type { Document } from '../../types';
import type { SavedWallet } from '../../contexts/WalletManagerContext';

interface SignDocumentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    document: Document;
    operationalVersionNumber: number;
}

type ProcessingStep = 'form' | 'signing' | 'success' | 'error';

/**
 * Modal que gestiona el flujo completo de firma digital de un documento en blockchain.
 *
 * @param props - Propiedades del componente.
 * @returns Elemento JSX del modal de firma.
 */
export const SignDocumentModal: React.FC<SignDocumentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  document,
  operationalVersionNumber,
}) => {
  const [comment, setComment] = useState('');
  const [step, setStep] = useState<ProcessingStep>('form');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasAlreadySigned, setHasAlreadySigned] = useState(false);
  const [checkingSignature, setCheckingSignature] = useState(true);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const { user } = useAuth();
  const { getVerifiedSigner } = useSigner();
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  // Verifica si el usuario ya ha firmado esta versión
  useEffect(() => {
    let cancelled = false;
    const checkIfSigned = async () => {
      if (!isOpen) return;

      try {
        setCheckingSignature(true);
        if (!user?.id) return;

        const { signatures } = await signaturesApi.listByVersion(
          document.id,
          operationalVersionNumber
        );

        if (cancelled) return;
        const hasSigned = signatures.some(sig => sig.userId === user.id);
        setHasAlreadySigned(hasSigned);
      } catch (err) {
        if (cancelled) return;
        setHasAlreadySigned(false);
      } finally {
        if (!cancelled) setCheckingSignature(false);
      }
    };

    checkIfSigned();
    return () => { cancelled = true; };
  }, [isOpen, document.id, operationalVersionNumber, user?.id]);

  const handleSign = async () => {
    if (hasAlreadySigned) {
      setError('Ya has firmado esta versión del documento');
      return;
    }

    setError(null);
    setShowWalletModal(true);
  };

  const handleWalletSelected = async (wallet: SavedWallet | null, connectedAddress: string) => {
    setShowWalletModal(false);

    if (hasAlreadySigned) {
      setError('Ya has firmado esta versión del documento');
      return;
    }

    try {
      if (!wallet) {
        throw new Error('Debe seleccionar una wallet para firmar');
      }

      setIsLoading(true);
      setError(null);
      setStep('signing');

      await getVerifiedSigner(connectedAddress);

      await signingService.signDocument({
        documentId: document.id,
        versionNumber: operationalVersionNumber,
        walletId: wallet.id,
        comment: comment.trim() || undefined,
      });

      setStep('success');
      timerRef.current = setTimeout(() => {
        onSuccess();
        handleClose();
      }, 2000);
    } catch (err: any) {
      // Rollback already handled by SigningService internally
      setError(err.message || 'Error al firmar el documento');
      setStep('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setComment('');
      setStep('form');
      setError(null);
      setHasAlreadySigned(false);
      setShowWalletModal(false);
      onClose();
    }
  };

  const isProcessing = isLoading || step === 'signing';

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Firmar Documento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
        {/* Paso del formulario */}
        {step === 'form' && (
          <>
            {/* Información del documento */}
            <div className="space-y-2 rounded-lg border border-border bg-secondary/35 p-4">
              <div>
                <p className="text-sm text-muted-foreground">Documento</p>
                <p className="font-medium text-foreground">{document.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Versión a firmar</p>
                <Badge variant="info">Versión {operationalVersionNumber}</Badge>
              </div>
            </div>

            {checkingSignature ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Verificando estado de firma...</span>
              </div>
            ) : hasAlreadySigned ? (
              <AlertMessage
                type="warning"
                message="Ya has firmado esta versión del documento. No es necesario firmar nuevamente."
              />
            ) : (
              <>
                {/* Entrada de comentario */}
                <div>
                  <Label htmlFor="sign-comment">
                    Comentario (opcional)
                  </Label>
                  <Input
                    id="sign-comment"
                    type="text"
                    placeholder="Ej: Revisado y aprobado, Conforme con el contenido..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    maxLength={200}
                    disabled={isProcessing}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    {comment.length}/200 caracteres
                  </p>
                </div>

                {/* Mensaje informativo */}
                <AlertMessage
                  type="info"
                  message="Al firmar, crearás una firma digital inmutable en blockchain. Se te pedirá que firmes con tu wallet conectada."
                />

                {error && (
                  <AlertMessage
                    type="error"
                    message={error}
                  />
                )}
              </>
            )}

            {/* Acciones */}
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isProcessing}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleSign}
                disabled={isProcessing || hasAlreadySigned || checkingSignature}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Firmando...
                  </>
                ) : (
                  <>
                    <FileSignature className="w-4 h-4 mr-2" />
                    Firmar Documento
                  </>
                )}
              </Button>
            </div>
          </>
        )}

        {/* Paso de firma */}
        {step === 'signing' && (
          <div className="py-4 space-y-4">
            <SigningReviewPanel
              operationName="Firma digital en blockchain"
              documentName={document?.name || 'documento'}
              details={[
                ['Versión firmada', `v${operationalVersionNumber}`],
              ]}
              contractAddress="DocumentRegistry"
            />
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Firmando documento...</h3>
              <p className="text-sm text-muted-foreground">
                Confirma la firma en tu wallet y espera a que se complete la transacción.
              </p>
            </div>
          </div>
        )}

        {/* Paso de éxito */}
        {step === 'success' && (
          <div className="py-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">¡Documento firmado!</h3>
            <p className="text-sm text-muted-foreground">
              Tu firma ha sido registrada en blockchain exitosamente.
            </p>
          </div>
        )}

        {/* Paso de error */}
        {step === 'error' && (
          <div className="py-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error al firmar</h3>
            {error && (
              <div className="mt-4 rounded-lg border border-[#fecaca] bg-[#fff5f5] p-3">
                <p className="text-sm text-[#b91c1c]">{error}</p>
              </div>
            )}
            <div className="flex justify-center gap-3 mt-6">
              <Button variant="outline" onClick={handleClose}>
                Cerrar
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setStep('form');
                  setError(null);
                }}
              >
                Reintentar
              </Button>
            </div>
          </div>
        )}
        </div>
        </DialogContent>
      </Dialog>

      <WalletSelectorModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        onSelect={handleWalletSelected}
        title="Seleccionar Wallet para Firmar"
        description={`Vas a firmar "${document?.name || 'documento'}" con tu wallet. Tu firma quedará registrada de forma inmutable en blockchain. Confirma en tu wallet.`}
      />
    </>
  );
};
