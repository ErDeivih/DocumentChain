import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import AlertMessage from '../ui/AlertMessage';
import { Copy, Download, AlertTriangle, Check } from 'lucide-react';

interface RecoveryKeyModalProps {
  isOpen: boolean;
  recoveryKey: string;
  onClose: () => void;
}

export const RecoveryKeyModal: React.FC<RecoveryKeyModalProps> = ({
  isOpen,
  recoveryKey,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(recoveryKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      console.error('Error al copiar:', error);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([
      `SISTEMA DE DOCUMENTOS BLOCKCHAIN - CLAVE DE RECUPERACIÓN\n\n`,
      `IMPORTANTE: ¡Guarde esta clave de recuperación en un lugar seguro!\n`,
      `Necesitará esta clave para recuperar su cuenta si olvida su contraseña.\n\n`,
      `Clave de Recuperación:\n${recoveryKey}\n\n`,
      `⚠️ ADVERTENCIA:\n`,
      `- Cualquier persona con esta clave puede recuperar su cuenta\n`,
      `- Guárdela en un lugar seguro (gestor de contraseñas, caja fuerte, etc.)\n`,
      `- NO la comparta con nadie\n`,
      `- Si pierde esta clave Y olvida su contraseña, perderá acceso a todos sus documentos encriptados\n\n`,
      `Fecha: ${new Date().toISOString()}\n`
    ], { type: 'text/plain' });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clave-recuperacion-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClose = () => {
    if (acknowledged) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Guarde Su Clave de Recuperación"
      size="lg"
    >
      <div className="space-y-6">
        {/* Warning Alert */}
        <AlertMessage
          type="warning"
          message="¡Esta es la ÚNICA vez que verá esta clave de recuperación!"
        />

        {/* Instructions */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            Información Crítica
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-orange-600 font-bold">•</span>
              <span>Necesita esta clave de recuperación para restablecer su contraseña</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-600 font-bold">•</span>
              <span>Si pierde esta clave Y olvida su contraseña, perderá acceso a todos sus documentos encriptados</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-600 font-bold">•</span>
              <span>Guárdela en un lugar seguro (gestor de contraseñas, caja de seguridad, etc.)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-600 font-bold">•</span>
              <span>Nunca comparta esta clave con nadie</span>
            </li>
          </ul>
        </div>

        {/* Recovery Key Display */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Su Clave de Recuperación
          </label>
          <div className="relative">
            <div className="bg-white border-2 border-blue-500 rounded-lg p-4 font-mono text-sm break-all select-all">
              {recoveryKey}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={handleCopy}
            className="flex-1"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                ¡Copiado!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copiar al Portapapeles
              </>
            )}
          </Button>
          <Button
            variant="secondary"
            onClick={handleDownload}
            className="flex-1"
          >
            <Download className="w-4 h-4 mr-2" />
            Descargar como Archivo
          </Button>
        </div>

        {/* Acknowledgment Checkbox */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              className="mt-1 h-5 w-5 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-900 font-medium">
              Entiendo que necesito guardar esta clave de recuperación. Si la pierdo y olvido mi contraseña, 
              perderé permanentemente el acceso a todos mis documentos encriptados. No hay forma de recuperarlos.
            </span>
          </label>
        </div>

        {/* Continue Button */}
        <div className="flex justify-end">
          <Button
            variant="default"
            onClick={handleClose}
            disabled={!acknowledged}
            className="px-8"
          >
            He Guardado Mi Clave de Recuperación
          </Button>
        </div>
      </div>
    </Modal>
  );
};
