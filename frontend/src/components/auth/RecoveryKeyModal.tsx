import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import AlertMessage from '../ui/AlertMessage';
import { Copy, Download, AlertTriangle, Check } from 'lucide-react';
import { copyToClipboard } from '../../lib/utils';

/**
 * Props del componente RecoveryKeyModal.
 */
interface RecoveryKeyModalProps {
  /** Controla la visibilidad del modal. */
  isOpen: boolean;
  /** Clave de recuperación generada para el usuario. */
  recoveryKey: string;
  /** Callback para cerrar el modal. */
  onClose: () => void;
}

/**
 * Modal para presentar la clave de recuperación al usuario.
 * Ofrece opciones para copiarla al portapapeles o descargarla como archivo de texto,
 * además de requerir una confirmación explícita antes de continuar.
 */
export const RecoveryKeyModal: React.FC<RecoveryKeyModalProps> = ({
  isOpen,
  recoveryKey,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);

  const handleCopy = async () => {
    try {
      await copyToClipboard(recoveryKey);
      setCopyError(null);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      setCopyError('No se pudo copiar automáticamente. Descargue la clave como archivo.');
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
        <div className="rounded-xl border border-[#fde68a] bg-[#fffaf0] p-4">
          <h3 className="mb-2 flex items-center gap-2 font-semibold text-foreground">
            <AlertTriangle className="h-5 w-5 text-[#d97706]" />
            Información Crítica
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="font-bold text-[#d97706]">•</span>
              <span>Necesita esta clave de recuperación para restablecer su contraseña</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-[#d97706]">•</span>
              <span>Si pierde esta clave Y olvida su contraseña, perderá acceso a todos sus documentos encriptados</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-[#d97706]">•</span>
              <span>Guárdela en un lugar seguro (gestor de contraseñas, caja de seguridad, etc.)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-[#d97706]">•</span>
              <span>Nunca comparta esta clave con nadie</span>
            </li>
          </ul>
        </div>

        {/* Recovery Key Display */}
        <div>
          <label className="mb-2 block text-sm font-medium uppercase tracking-[0.08em] text-muted-foreground">
            Su Clave de Recuperación
          </label>
          <div className="relative">
            <div className="rounded-xl border border-border bg-[#f8fbff] p-4 font-mono text-sm break-all text-foreground select-all shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]">
              {recoveryKey}
            </div>
          </div>
          {copyError ? <AlertMessage type="error" message={copyError} onClose={() => setCopyError(null)} /> : null}
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
        <div className="rounded-xl border border-[#fecaca] bg-[#fff5f5] p-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              className="mt-1 h-5 w-5 rounded border-white/15 bg-background text-primary focus:ring-primary"
            />
            <span className="text-sm font-medium text-foreground">
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
