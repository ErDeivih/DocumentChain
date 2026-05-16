import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import AlertMessage from '../ui/AlertMessage';
import { Copy, Download, AlertTriangle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { copyToClipboard } from '../../lib/utils';

/**
 * Props del componente RecoveryKeyDisplay.
 */
interface RecoveryKeyDisplayProps {
  /** Controla la visibilidad del modal. */
  isOpen: boolean;
  /** Clave de recuperación generada para el usuario. */
  recoveryKey: string;
  /** Callback para cerrar el modal. */
  onClose: () => void;
}

/**
 * Modal para mostrar y guardar la clave de recuperación del usuario.
 * Permite copiar, descargar y exige una confirmación antes de cerrar.
 */
export const RecoveryKeyDisplay: React.FC<RecoveryKeyDisplayProps> = ({
  isOpen,
  recoveryKey,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [showRecoveryKey, setShowRecoveryKey] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);

  const handleCopy = async () => {
    try {
      await copyToClipboard(recoveryKey);
      setCopyError(null);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      setCopyError('No se pudo copiar automáticamente. Use la descarga como alternativa.');
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
        <div className="space-y-2 rounded-xl border border-[#fde68a] bg-[#fffaf0] p-4">
          <h3 className="flex items-center gap-2 font-semibold text-foreground">
            <AlertTriangle className="h-5 w-5 text-[#d97706]" />
            ¿Qué es una Clave de Recuperación?
          </h3>
          <ul className="ml-6 list-disc space-y-1 text-sm text-muted-foreground">
            <li>Su clave de recuperación le permite restablecer su contraseña si la olvida</li>
            <li>Sin esta clave, los documentos cifrados son <strong>inaccesibles permanentemente</strong></li>
            <li>Guárdela en un <strong>lugar seguro y sin conexión</strong> (memoria USB, papel impreso, gestor de contraseñas)</li>
            <li>NUNCA la comparta con nadie - ni siquiera con el personal de soporte</li>
          </ul>
        </div>

        {/* Visualización de la Clave de Recuperación */}
        <div className="space-y-3">
          <label className="block text-sm font-medium uppercase tracking-[0.08em] text-muted-foreground">
            Su Clave de Recuperación:
          </label>
          <div className="relative">
            <div
              data-testid="recovery-key-value"
              className="rounded-xl border border-border bg-[#f8fbff] p-4 pr-24 font-mono text-sm break-all text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]"
            >
              {showRecoveryKey ? recoveryKey : '•'.repeat(Math.max(recoveryKey.length, 32))}
            </div>
            <div className="absolute top-2 right-2 flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowRecoveryKey(prev => !prev)}
                className="bg-white/90 px-2 text-foreground hover:bg-secondary"
                title={showRecoveryKey ? 'Ocultar clave' : 'Mostrar clave'}
              >
                {showRecoveryKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="bg-white/90 px-2 text-foreground hover:bg-secondary"
                title={copied ? '¡Copiado!' : 'Copiar al portapapeles'}
              >
                {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          {copyError ? <AlertMessage type="error" message={copyError} onClose={() => setCopyError(null)} /> : null}
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
        <div className="border-t border-border pt-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-white/15 bg-background text-primary focus:ring-primary"
            />
            <span className="text-sm text-muted-foreground">
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
          <p className="text-center text-xs text-muted-foreground">
            Debe confirmar que ha guardado su clave de recuperación antes de continuar
          </p>
        )}
      </div>
    </Modal>
  );
};
