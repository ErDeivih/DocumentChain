import React, { useState, useRef, useEffect } from 'react';
import { uploadService } from '../../services/blockchain/UploadService';
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
import { SigningReviewPanel } from '../ui/SigningReviewPanel';
import { TransactionDetailModal } from '../audit/TransactionDetailModal';
import { Upload, File, X, AlertCircle, Loader2, CheckCircle2, Wallet, ExternalLink } from 'lucide-react';
import { cn, MAX_FILE_SIZE } from '../../lib/utils';
import type { Document, Version } from '../../types';
import type { SavedWallet } from '../../contexts/WalletManagerContext';
import { useSigner } from '../../hooks/useSigner';
import { useAuth } from '../../contexts/AuthContext';

interface UploadVersionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (version: Version) => void;
    document: Document;
}

type UploadStep = 'form' | 'select_wallet' | 'preparing' | 'signing' | 'confirming' | 'success' | 'error';

/**
 * Modal para subir nuevas versiones de un documento existente.
 * Gestiona la validación del archivo, la firma blockchain y la confirmación en el backend.
 */
export const UploadVersionModal: React.FC<UploadVersionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  document,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [comment, setComment] = useState('');
  const [password, setPassword] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const { getRegistryContract } = useSigner();

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);
  const { user } = useAuth();
  
  // Upload state
  const [step, setStep] = useState<UploadStep>('form');
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [txDetailHash, setTxDetailHash] = useState<string | null>(null);

  const resetForm = () => {
    setFile(null);
    setComment('');
    setPassword('');
    setError(null);
    setStep('form');
    setTxHash(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    if (step === 'form') {
      resetForm();
      onClose();
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError('El tamaño del archivo debe ser menor a 100MB');
      return;
    }

    // Extract base filename (without extension)
    const getBaseName = (filename: string) => {
      const lastDotIndex = filename.lastIndexOf('.');
      return lastDotIndex !== -1 ? filename.substring(0, lastDotIndex) : filename;
    };

    // Validar mismo nombre base de archivo
    const newBaseName = getBaseName(selectedFile.name);
    const docBaseName = getBaseName(document.name);
    
    if (newBaseName.toLowerCase() !== docBaseName.toLowerCase()) {
      setError(`El nombre base del archivo debe ser "${docBaseName}". Archivo actual: "${newBaseName}"`);
      return;
    }

    // Validar mismo tipo MIME
    if (selectedFile.type !== document.mimeType) {
      setError(`El tipo de archivo debe ser ${document.mimeType}. Archivo actual: ${selectedFile.type || 'desconocido'}`);
      return;
    }

    setFile(selectedFile);
    setError(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleStartUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setError('Debe seleccionar un archivo');
      return;
    }

    if (document.visibility === 'PRIVATE' && !password.trim()) {
      setError('Debe introducir su contraseña para subir una nueva versión de un documento cifrado');
      return;
    }

    // Mostrar selector de wallet
    setShowWalletModal(true);
  };

  /**
   * Gestiona la selección de wallet para preparar y firmar la transacción.
   */
  const handleWalletSelected = async (wallet: SavedWallet | null, connectedAddress: string) => {
    setShowWalletModal(false);
    setStep('preparing');
    
    try {
      if (!file) throw new Error('No file selected');
      if (!wallet) throw new Error('Wallet not selected');
      
      const registryContract = await getRegistryContract(connectedAddress);
      setStep('signing');

      const result = await uploadService.uploadVersion({
        document,
        file,
        walletId: wallet.id,
        comment: comment || undefined,
        registryContract,
        userPublicKey: user?.publicKey || undefined,
        userEncryptedPrivateKey: user?.encryptedPrivateKey,
        userPassword: password,
        userKeySalt: user?.keySalt,
      });

      setTxHash(result.txHash);
      setStep('success');
      timerRef.current = setTimeout(() => {
        resetForm();
        onSuccess(result.version);
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Error al subir la versión');
      setStep('error');
    }
  };

  const getStepIcon = (stepName: UploadStep) => {
    if (step === stepName) {
      return <Loader2 className="w-4 h-4 animate-spin" />;
    }
    if (Object.keys(stepOrder).indexOf(step) > Object.keys(stepOrder).indexOf(stepName)) {
      return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    }
    return null;
  };

  const stepOrder: Record<UploadStep, number> = {
    form: 0,
    select_wallet: 1,
    preparing: 2,
    signing: 3,
    confirming: 4,
    success: 5,
    error: 5,
  };

  const isProcessing = step !== 'form' && step !== 'error';

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Subir Nueva Versión</DialogTitle>
            <DialogDescription>
              Cree una nueva versión del documento "{document.name}"
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {step === 'success' && (
            <Alert variant="default" className="bg-green-50 text-green-900 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="space-y-1">
                <span>¡Nueva versión creada exitosamente!</span>
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

          {step === 'signing' && file && (
            <SigningReviewPanel
              operationName="Creación de nueva versión en blockchain"
              documentName={document?.name || 'documento'}
              details={[
                ['Documento', document?.name || '—'],
                ['Tipo', document?.mimeType || '—'],
              ]}
              contractAddress="DocumentRegistry"
            />
          )}

          {/* Progress Steps */}
          {isProcessing && (
            <div className="space-y-2 bg-muted p-4 rounded-lg">
              <div className="flex items-center gap-2">
                {getStepIcon('preparing')}
                <span className={step === 'preparing' ? 'font-medium' : 'text-muted-foreground'}>
                  {step === 'preparing' ? 'Preparando versión...' : 'Preparación completada'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {step === 'signing' && <Wallet className="w-4 h-4" />}
                {step === 'confirming' && <Loader2 className="w-4 h-4 animate-spin" />}
                {Object.keys(stepOrder).indexOf(step) > Object.keys(stepOrder).indexOf('signing') && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                <span className={step === 'signing' || step === 'confirming' ? 'font-medium' : 'text-muted-foreground'}>
                  {step === 'signing' && 'Firme la transacción en su wallet...'}
                  {step === 'confirming' && 'Confirmando en blockchain...'}
                  {Object.keys(stepOrder).indexOf(step) > Object.keys(stepOrder).indexOf('confirming') && 'Transacción confirmada'}
                </span>
              </div>
            </div>
          )}

        <form onSubmit={handleStartUpload} className="space-y-4">
          {/* File Drop Zone */}
          <div
            className={cn(
              'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
              isDragging
                ? 'border-primary bg-primary/10'
                : 'border-border hover:border-primary/50'
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {!file ? (
              <>
                <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-foreground font-medium mb-1">
                  Arrastre y suelte su archivo aquí
                </p>
                <p className="text-sm text-muted-foreground mb-4">o</p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                >
                  Explorar Archivos
                </Button>
                <p className="text-xs text-muted-foreground mt-3">
                  Tamaño máximo: 100MB
                </p>
                <p className="text-xs text-yellow-600 mt-2">
                  ⚠️ Debe ser el mismo tipo de archivo ({document.mimeType})
                </p>
              </>
            ) : (
              <div className="flex items-center justify-between bg-accent p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <File className="w-8 h-8 text-primary" />
                  <div className="text-left">
                    <p className="font-medium text-foreground">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="text-muted-foreground hover:text-foreground"
                  disabled={isProcessing}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileInputChange}
              disabled={isProcessing}
            />
          </div>

          {/* Comment Input */}
          <div>
            <Label htmlFor="comment">Comentario (opcional)</Label>
            <Input
              id="comment"
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Describir los cambios en esta versión"
              disabled={isProcessing}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Ayuda a otros colaboradores a entender qué cambió
            </p>
          </div>

          {document.visibility === 'PRIVATE' && (
            <div>
              <Label htmlFor="uploadVersionPassword">Contraseña</Label>
              <Input
                id="uploadVersionPassword"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Necesaria para descifrar su clave privada"
                disabled={isProcessing}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Su contraseña se usa solo en este dispositivo para descifrar su clave privada y reusar la clave de cifrado del documento
              </p>
            </div>
          )}

          <Alert variant="default">
            <AlertDescription className="text-sm">
              <strong>Requisitos:</strong>
              <ul className="list-disc ml-4 mt-1 space-y-1">
                <li>Mismo nombre base: <strong>{document.name.substring(0, document.name.lastIndexOf('.'))}</strong></li>
                <li>Mismo tipo de archivo: <strong>{document.mimeType}</strong></li>
                <li>El número de versión se asignará automáticamente</li>
                <li>
                  {document.visibility === 'PUBLIC'
                    ? 'Esta versión heredará visibilidad pública y se almacenará sin cifrar.'
                    : 'Esta versión heredará visibilidad privada y se cifrará antes de subirse a IPFS.'}
                </li>
              </ul>
            </AlertDescription>
          </Alert>
        </form>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={handleClose}
            disabled={isProcessing}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleStartUpload}
            disabled={!file || isProcessing}
            isLoading={isProcessing}
          >
            {isProcessing ? 'Subiendo...' : 'Subir y Firmar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Wallet Selector Modal */}
    <WalletSelectorModal
      isOpen={showWalletModal}
      onClose={() => setShowWalletModal(false)}
      onSelect={handleWalletSelected}
      title="Seleccionar Wallet para Firmar"
      description={`Vas a crear una nueva versión de "${document?.name || 'documento'}" con un nuevo hash on-chain. Confirma en tu wallet.`}
    />

    <TransactionDetailModal
      open={!!txDetailHash}
      onClose={() => setTxDetailHash(null)}
      txHash={txDetailHash || undefined}
    />
    </>
  );
};
