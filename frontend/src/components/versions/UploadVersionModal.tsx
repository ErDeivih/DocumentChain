import React, { useState, useRef } from 'react';
import { versionsApi } from '../../api/versions';
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
import { Upload, File, X, AlertCircle, Loader2, CheckCircle2, Wallet } from 'lucide-react';
import { cn, MAX_FILE_SIZE } from '../../lib/utils';
import type { Document, Version } from '../../types';
import type { SavedWallet } from '../../contexts/WalletManagerContext';
import { blockchainProvider } from '../../lib/blockchain/provider';
import { DocumentRegistryContract } from '../../lib/blockchain/contracts';

/**
 * Props del componente UploadVersionModal.
 */
interface UploadVersionModalProps {
  /** Controla la visibilidad del modal. */
  isOpen: boolean;
  /** Callback para cerrar el modal. */
  onClose: () => void;
  /** Callback que se ejecuta tras crear una versión exitosamente. */
  onSuccess: (version: Version) => void;
  /** Documento al que se le añadirá la nueva versión. */
  document: Document;
}

/** Pasos del flujo de subida de una nueva versión. */
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
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Upload state
  const [step, setStep] = useState<UploadStep>('form');
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const resetForm = () => {
    setFile(null);
    setComment('');
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

    // Validate same base filename
    const newBaseName = getBaseName(selectedFile.name);
    const docBaseName = getBaseName(document.name);
    
    if (newBaseName.toLowerCase() !== docBaseName.toLowerCase()) {
      setError(`El nombre base del archivo debe ser "${docBaseName}". Archivo actual: "${newBaseName}"`);
      return;
    }

    // Validate same MIME type
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

    // Show wallet selector
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

      // Step 1: Read file as ArrayBuffer (unencrypted)
      const fileBuffer = await file.arrayBuffer();
      
      // Step 2: Prepare version on backend (backend encrypts and uploads to IPFS)
      const prepareResult = await versionsApi.prepareCreate({
        documentId: document.id,
        fileBuffer,  // Send unencrypted file
        walletId: wallet.id,
        comment: comment || undefined,
      });
      
      // Step 3: Sign blockchain transaction
      setStep('signing');
      
      // Create registry contract instance
      const registryContract = new DocumentRegistryContract(signer);
      
      // Get docId from document (should be blockchain ID)
      const docId = document.blockchainId || document.id;
      
      // Create new version on blockchain with IPFS CID
      const tx = await registryContract.createVersion(
        docId,
        prepareResult.ipfsCid
      );
      
      setTxHash(tx.hash);
      setStep('confirming');
      
      // Wait for confirmation
      await tx.wait();
      
      // Step 4: Confirm with backend
      const confirmResult = await versionsApi.confirmCreate({
        documentId: document.id,
        versionId: prepareResult.versionId,
        txHash: tx.hash,
      });

      setStep('success');
      setTimeout(() => {
        resetForm();
        onSuccess(confirmResult.version);
      }, 2000);
    } catch (err: any) {
      console.error('Version upload error:', err);
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
              <AlertDescription>
                ¡Nueva versión creada exitosamente! {txHash && `Tx: ${txHash.slice(0, 10)}...`}
              </AlertDescription>
            </Alert>
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
      description="Seleccione una wallet para firmar la transacción de creación de la versión"
    />
    </>
  );
};
