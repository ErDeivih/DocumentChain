import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import AlertMessage from '../ui/AlertMessage';
import { Copy, Download, AlertTriangle, CheckCircle, Eye, EyeOff } from 'lucide-react';

interface RecoveryKeyDisplayProps {
  isOpen: boolean;
  recoveryKey: string;
  onClose: () => void;
}

export const RecoveryKeyDisplay: React.FC<RecoveryKeyDisplayProps> = ({
  isOpen,
  recoveryKey,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [showRecoveryKey, setShowRecoveryKey] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(recoveryKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error al copiar:', error);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([
      `ALMACENAMIENTO DE DOCUMENTOS BLOCKCHAIN - CLAVE DE RECUPERACIÓN\n` +
      `========================================\n\n` +
      `IMPORTANTE: ¡Guarde esta clave en un lugar SEGURO!\n\n` +
      `Clave de Recuperación:\n${recoveryKey}\n\n` +
      `ADVERTENCIA:\n` +
      `- Esta clave es necesaria para restablecer su contraseña\n` +
      `- Sin esta clave, PERDERÁ PERMANENTEMENTE el acceso a sus documentos cifrados si olvida su contraseña\n` +
      `- NUNCA comparta esta clave con nadie\n` +
      `- Guárdela sin conexión (memoria USB, papel impreso, gestor de contraseñas)\n` +
      `- Esta clave NUNCA volverá a mostrarse\n\n` +
      `Generada: ${new Date().toLocaleString()}\n`
    ], { type: 'text/plain' });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clave-recuperacion-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloaded(true);
  };

  const handleClose = () => {
    if (!confirmed) {
      if (!window.confirm(
        'ADVERTENCIA: Si cierra esta ventana sin guardar su clave de recuperación, ' +
        'NO podrá recuperar su cuenta si olvida su contraseña. ' +
        '¿Está seguro de que desea continuar?'
      )) {
        return;
      }
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="🔑 Guarde Su Clave de Recuperación"
      size="lg"
    >
      <div className="space-y-6">
        {/* Advertencia Crítica */}
        <AlertMessage
          type="warning"
          message="CRÍTICO: ¡Esta clave se mostrará SOLO UNA VEZ y no se puede recuperar después!"
        />

        {/* Instrucciones */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            ¿Qué es una Clave de Recuperación?
          </h3>
          <ul className="text-sm text-gray-700 space-y-1 ml-6 list-disc">
            <li>Su clave de recuperación le permite restablecer su contraseña si la olvida</li>
            <li>Sin esta clave, los documentos cifrados son <strong>inaccesibles permanentemente</strong></li>
            <li>Guárdela en un <strong>lugar seguro y sin conexión</strong> (memoria USB, papel impreso, gestor de contraseñas)</li>
            <li>NUNCA la comparta con nadie - ni siquiera con el personal de soporte</li>
          </ul>
        </div>

        {/* Visualización de la Clave de Recuperación */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Su Clave de Recuperación:
          </label>
          <div className="relative">
            <div className="bg-gray-900 text-white p-4 pr-24 rounded-lg font-mono text-sm break-all">
              {showRecoveryKey ? recoveryKey : '•'.repeat(Math.max(recoveryKey.length, 32))}
            </div>
            <div className="absolute top-2 right-2 flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowRecoveryKey(prev => !prev)}
                className="bg-gray-800 hover:bg-gray-700 text-white px-2"
                title={showRecoveryKey ? 'Ocultar clave' : 'Mostrar clave'}
              >
                {showRecoveryKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="bg-gray-800 hover:bg-gray-700 text-white px-2"
                title={copied ? '¡Copiado!' : 'Copiar al portapapeles'}
              >
                {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="space-y-3">
          <Button
            variant="default"
            onClick={handleDownload}
            className="w-full"
          >
            <Download className="w-4 h-4 mr-2" />
            {downloaded ? 'Descargado ✓' : 'Descargar como Archivo de Texto'}
          </Button>

        </div>

        {/* Casilla de Confirmación */}
        <div className="border-t pt-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">
              Confirmo que he <strong>guardado mi clave de recuperación</strong> en un lugar seguro. 
              Entiendo que sin esta clave, <strong>perderé permanentemente el acceso</strong> a 
              mis documentos cifrados si olvido mi contraseña.
            </span>
          </label>
        </div>

        {/* Botón Continuar */}
        <Button
          variant="primary"
          onClick={onClose}
          disabled={!confirmed}
          className="w-full"
        >
          {confirmed ? 'Continuar al Panel' : 'Por Favor, Confirme Arriba para Continuar'}
        </Button>

        {!confirmed && (
          <p className="text-xs text-center text-gray-500">
            Debe confirmar que ha guardado su clave de recuperación antes de continuar
          </p>
        )}
      </div>
    </Modal>
  );
};
