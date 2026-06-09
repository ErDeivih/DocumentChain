import React, { useState, useRef } from 'react';
import { documentsApi } from '../../api/documents';
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
import { AlertCircle, Info, Loader2, CheckCircle2 } from 'lucide-react';
import { MAX_FILE_SIZE } from '../../lib/utils';
import { getErrorMessage } from '../../lib/api';
import type { SavedWallet } from '../../contexts/WalletManagerContext';
import { useAuth } from '../../contexts/AuthContext';
import { useSigner } from '../../hooks/useSigner';
import { FileDropZone } from './FileDropZone';
import { VisibilityToggle } from './VisibilityToggle';
import { UploadStepIndicator } from './UploadStepIndicator';

/**
 * Props del componente UploadModal.
 */
interface UploadModalProps {
  /** Controla la visibilidad del modal. */
  isOpen: boolean;
  /** Callback para cerrar el modal. */
  onClose: () => void;
  /** Callback que se ejecuta tras una subida exitosa. */
  onSuccess: () => void;
  /** Identificador de la carpeta predeterminada. */
  defaultFolderId?: string;
}

/** Pasos del flujo de subida de un documento. */
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
  const cancelledRef = useRef(false);
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

  // Update folderId when defaultFolderId changes
  React.useEffect(() => {
    setFolderId(defaultFolderId || null);
  }, [defaultFolderId]);

  const resetForm = () => {
    setFile(null);
    setIsPublic(false);
    setFolderId(null);
    setTags('');
    setError(null);
    setStep('form');
    setTxHash(null);
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

      // Step 1: Read file as ArrayBuffer (unencrypted)
      const fileBuffer = await file.arrayBuffer();
      if (cancelledRef.current) return;
      
      // Step 2: Prepare document on backend (backend encrypts and uploads to IPFS)
      const prepareResult = await documentsApi.prepareCreate({
        name: file.name,
        description: undefined,
        mimeType: file.type,
        fileBuffer,  // Send unencrypted file
        walletId: wallet.id,
        visibility: isPublic ? 'PUBLIC' : 'PRIVATE',
        folderId: folderId || undefined,
        tags: tags ? tags.split(',').map(t => t.trim()).filter(t => t.length > 0) : undefined,
      });
      if (cancelledRef.current) return;
      
      // Step 3: Sign blockchain transaction
      setStep('signing');
      
      // 3.1: Create document in Registry (metadata only)
        // Consolidated contract: createDocument sets doc + first version in one tx
        const tx1 = await registryContract.createDocument(
          prepareResult.docId,
          prepareResult.ipfsCid,
          prepareResult.encryptedKeyHash,
        );
        setTxHash(tx1.hash);
      if (cancelledRef.current) return;
      setStep('confirming');
      await Promise.race([
        tx1.wait(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Transaction timeout')), 120000)),
      ]);
      if (cancelledRef.current) return;
      
      // Step 4: Confirm with backend (use first tx hash as main reference)
      await documentsApi.confirmCreate({
        documentId: prepareResult.documentId,
        txHash: tx1.hash,
        blockchainId: prepareResult.docId,
      });
      if (cancelledRef.current) return;
      
      setStep('success');
      
      // Notify parent and reset after delay
      setTimeout(() => {
        onSuccess();
        resetForm();
      }, 2000);
      
    } catch (err: any) {
      if (cancelledRef.current) return;
      console.error('Upload error:', err);
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
              <AlertDescription className="text-green-700">
                ¡Documento subido exitosamente! Tx: {txHash?.slice(0, 10)}...
              </AlertDescription>
            </Alert>
          )}

          {isProcessing && <UploadStepIndicator step={step} />}

          <form onSubmit={handleStartUpload} className="space-y-4">
            <FileDropZone
              file={file}
              isProcessing={isProcessing}
              isDragging={isDragging}
              fileInputRef={fileInputRef}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onFileInputChange={handleFileInputChange}
              onClearFile={() => setFile(null)}
            />

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
                Las etiquetas le ayudan a organizar y encontrar documentos más tarde
              </p>
            </div>

            <VisibilityToggle isPublic={isPublic} onToggle={setIsPublic} isProcessing={isProcessing} />

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
        description="Seleccione una wallet para firmar la transacción de creación del documento"
      />
    </>
  );
};
