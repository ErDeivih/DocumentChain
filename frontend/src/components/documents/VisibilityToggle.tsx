import React from 'react';
import { Switch } from '../ui/Switch';
import { Label } from '../ui/Label';
import { Alert, AlertDescription } from '../ui/Alert';
import { AlertCircle, Info } from 'lucide-react';

interface VisibilityToggleProps {
  isPublic: boolean;
  onToggle: (value: boolean) => void;
  isProcessing: boolean;
}

export const VisibilityToggle: React.FC<VisibilityToggleProps> = ({ isPublic, onToggle, isProcessing }) => (
  <div className="space-y-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
    <div className="flex items-start justify-between gap-4">
      <div>
        <Label htmlFor="public-visibility" className="text-sm font-medium text-amber-900">
          Publicar documento con enlace y QR
        </Label>
        <p className="mt-1 text-xs text-amber-800">
          Si activa esta opción, el documento se almacenará sin cifrar y cualquier persona con el enlace podrá verlo o descargarlo.
        </p>
      </div>
      <Switch id="public-visibility" checked={isPublic} onCheckedChange={onToggle} disabled={isProcessing} />
    </div>
    {isPublic ? (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Documento público: no se cifrará antes de subirse a IPFS. El enlace público y los QR quedarán disponibles tras la confirmación en blockchain.
        </AlertDescription>
      </Alert>
    ) : (
      <Alert variant="info">
        <Info className="h-4 w-4" />
        <AlertDescription>
          Documento privado: se cifrará automáticamente con AES-256-GCM antes de subirse a IPFS.
        </AlertDescription>
      </Alert>
    )}
  </div>
);
