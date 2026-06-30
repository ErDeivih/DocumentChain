import React, { useState, useRef, useEffect } from 'react';
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
import { FolderSelector } from '../folders/FolderSelector';
import { WalletSelectorModal } from '../wallets/WalletSelectorModal';
import { TransactionDetailModal } from '../audit/TransactionDetailModal';
import { Switch } from '../ui/Switch';
import { AlertCircle, Info, Loader2, CheckCircle2, ExternalLink, Upload, File, X } from 'lucide-react';
import { MAX_FILE_SIZE, cn } from '../../lib/utils';
import { getErrorMessage } from '../../lib/api';
import type { SavedWallet } from '../../contexts/WalletManagerContext';
import { useAuth } from '../../contexts/AuthContext';
import { useSigner } from '../../hooks/useSigner';
import { uploadService } from '../../services/blockchain/UploadService';

interface UploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    defaultFolderId?: string;
}

type UploadStep = 'form' | 'select_wallet' | 'preparing' | 'signing' | 'confirming' | 'success' | 'error';

/**
 * Modal para subir nuevos documentos.
 * Gestiona la selección de archivo, carpeta, etiquetas, visibilidad
 * y la firma de la transacción blockchain mediante un wallet.
 */
export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultFolderId,
}) => {
  const { user } = useAuth(); // Get current user
  const { getRegistryContract } = useSigner();
  const stepOrder: Record<UploadStep, number> = {
    form: 0, select_wallet: 1, preparing: 2, signing: 3, confirming: 4, success: 5, error: 5,
  };
  const cancelledRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isPublic, setIsPublic] = useState(false);
  const [folderId, setFolderId] = useState<string | null>(defaultFolderId || null);
  const [tags, setTags] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Wallet and transaction state
  const [step, setStep] = useState<UploadStep>('form');
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [txDetailHash, setTxDetailHash] = useState<string | null>(null);

  // Actualizar folderId cuando cambia defaultFolderId
  React.useEffect(() => {
    setFolderId(defaultFolderId || null);
  }, [defaultFolderId]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const resetForm = () => {
    setFile(null);
    setIsPublic(false);
    setFolderId(null);
    setTags('');
    setError(null);
    setStep('form');
    setTxHash(null);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    cancelledRef.current = true;
    resetForm();
    onClose();
  };

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError('El tamaño del archivo debe ser menor a 100MB');
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

  /**
   * Inicia el proceso de subida mostrando el selector de wallets.
   */
  const handleStartUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!file) {
      setError('Por favor seleccione un archivo');
      return;
    }

    setShowWalletModal(true);
  };

  /**
   * Gestiona la selección de wallet para preparar y firmar la transacción.
   */
  const handleWalletSelected = async (wallet: SavedWallet | null, connectedAddress: string) => {
    setShowWalletModal(false);
    setStep('preparing');
    cancelledRef.current = false;
    
    try {
      if (!file) throw new Error('No file selected');
      if (!user) throw new Error('User not authenticated');
      if (!wallet) throw new Error('Wallet not selected');
      
      const registryContract = await getRegistryContract(connectedAddress);
      if (cancelledRef.current) return;

      setStep('signing');

      const result = await uploadService.uploadDocument({
        file,
        isPublic,
        publicKey: user.publicKey || undefined,
        walletId: wallet.id,
        folderId: folderId || undefined,
        tags: tags 
          ? tags.split(',').map(t => t.trim()).filter(t => t.length > 0) 
          : undefined,
        registryContract,
      });

      if (cancelledRef.current) return;

      setTxHash(result.txHash);
      setStep('success');
      
      timeoutRef.current = setTimeout(() => {
        onSuccess();
        resetForm();
      }, 2000);
      
    } catch (err: any) {
      if (cancelledRef.current) return;
      setError(getErrorMessage(err) || 'Error al subir el documento');
      setStep('error');
    }
  };

  const isProcessing = step !== 'form' && step !== 'error';

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Subir Documento</DialogTitle>
            <DialogDescription>
              Suba su documento a la blockchain con cifrado opcional
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
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <AlertDescription className="text-green-700 space-y-1">
                <span>¡Documento subido exitosamente!</span>
                <br />
                <button
                  type="button"
                  className="text-blue-600 hover:underline font-mono text-xs flex items-center gap-1"
                  onClick={() => setTxDetailHash(txHash)}
                >
                  Tx: {txHash} <ExternalLink className="w-3 h-3" />
                </button>
              </AlertDescription>
            </Alert>
          )}

          {isProcessing && (
            <div className="space-y-3 p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                {step === 'preparing' ? <Loader2 className="w-4 h-4 animate-spin" /> : stepOrder[step] > stepOrder['preparing'] ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : null}
                <span className={step === 'preparing' ? 'font-medium' : 'text-muted-foreground'}>Preparando documento...</span>
              </div>
              <div className="flex items-center gap-2">
                {step === 'signing' ? <Loader2 className="w-4 h-4 animate-spin" /> : stepOrder[step] > stepOrder['signing'] ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : null}
                <span className={step === 'signing' ? 'font-medium' : 'text-muted-foreground'}>Firmando transacción...</span>
              </div>
              <div className="flex items-center gap-2">
                {step === 'confirming' ? <Loader2 className="w-4 h-4 animate-spin" /> : stepOrder[step] > stepOrder['confirming'] ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : null}
                <span className={step === 'confirming' ? 'font-medium' : 'text-muted-foreground'}>Confirmando en blockchain...</span>
              </div>
            </div>
          )}

          <form onSubmit={handleStartUpload} className="space-y-4">
            <div
              className={cn(
                'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
                isDragging ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {!file ? (
                <>
                  <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-foreground font-medium mb-1">Arrastre y suelte su archivo aquí</p>
                  <p className="text-sm text-muted-foreground mb-4">o</p>
                  <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isProcessing}>
                    Explorar Archivos
                  </Button>
                  <p className="text-xs text-muted-foreground mt-3">Tamaño máximo de archivo: 100MB</p>
                </>
              ) : (
                <div className="flex items-center justify-between bg-accent p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <File className="w-8 h-8 text-primary" />
                    <div className="text-left">
                      <p className="font-medium text-foreground">{file.name}</p>
                      <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => setFile(null)} className="text-muted-foreground hover:text-foreground" disabled={isProcessing}>
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
              <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileInputChange} disabled={isProcessing} />
            </div>

            {/* Folder Selection */}
            <FolderSelector
              value={folderId}
              onChange={setFolderId}
              label="Carpeta (opcional)"
              placeholder="Sin carpeta"
              disabled={isProcessing}
            />

            {/* Tags Input */}
            <div className="space-y-2">
              <Label htmlFor="tags">Etiquetas (opcional)</Label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Ingrese etiquetas separadas por comas (ej: factura, 2024, importante)"
                disabled={isProcessing}
              />
              <p className="text-xs text-muted-foreground">
                Separe las etiquetas con comas (ej: factura, 2024, importante)
              </p>
            </div>

            <div className="space-y-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Label htmlFor="public-visibility" className="text-sm font-medium text-amber-900">
                    Publicar documento con enlace público
                  </Label>
                  <p className="mt-1 text-xs text-amber-800">
                    Si activa esta opción, el documento se almacenará sin cifrar y cualquier persona con el enlace podrá verlo o descargarlo.
                  </p>
                </div>
                <Switch id="public-visibility" checked={isPublic} onCheckedChange={setIsPublic} disabled={isProcessing} />
              </div>
              {isPublic ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Documento público: no se cifrará antes de subirse a IPFS. El enlace público quedará disponible tras la confirmación en blockchain.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="info">
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Documento privado: se cifrará automáticamente antes de subirse.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <Alert variant="info">
              <Info className="h-4 w-4" />
              <AlertDescription>
                Luego deberá firmar una transacción blockchain con su wallet para registrar el documento y habilitar su ciclo de vida posterior.
              </AlertDescription>
            </Alert>
          </form>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleClose}
              type="button"
            >
              {step === 'success' ? 'Cerrar' : 'Cancelar'}
            </Button>
            <Button
              variant="default"
              onClick={handleStartUpload}
              disabled={!file || isProcessing}
                type="button"
                data-testid="upload-submit-btn"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : (
                'Subir y Firmar'
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
        title="Seleccionar Wallet para Firmar"
        description={file ? `Vas a registrar "${file.name}" en blockchain. Su hash SHA-256 (contentHash) quedará almacenado on-chain para verificación futura. Confirma en tu wallet.` : 'Seleccione una wallet para firmar la transacción de creación del documento'}
      />

      {/* Transaction Detail Modal */}
      <TransactionDetailModal
        open={!!txDetailHash}
        onClose={() => setTxDetailHash(null)}
        txHash={txDetailHash || undefined}
      />
    </>
  );
};
