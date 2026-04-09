import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import AlertMessage from '../ui/AlertMessage';
import { Copy, ExternalLink, QrCode, Download } from 'lucide-react';

interface PublicLinkActionsProps {
  url: string;
  title: string;
  size?: 'sm' | 'default';
}

export const PublicLinkActions: React.FC<PublicLinkActionsProps> = ({
  url,
  title,
  size = 'default',
}) => {
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isQrOpen) {
      return;
    }

    QRCode.toDataURL(url, {
      width: 320,
      margin: 2,
    })
      .then(setQrDataUrl)
      .catch(() => setMessage('No se pudo generar el código QR.'));
  }, [isQrOpen, url]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setMessage('Enlace copiado al portapapeles.');
    } catch {
      setMessage('No se pudo copiar el enlace automáticamente.');
    }
  };

  const downloadQr = () => {
    if (!qrDataUrl) {
      return;
    }

    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `${title.toLowerCase().replace(/\s+/g, '-')}-qr.png`;
    link.click();
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size={size} onClick={copyLink}>
          <Copy className="w-4 h-4 mr-2" />
          Enlace
        </Button>
        <Button variant="outline" size={size} onClick={() => setIsQrOpen(true)}>
          <QrCode className="w-4 h-4 mr-2" />
          QR
        </Button>
        <Button variant="ghost" size={size} onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}>
          <ExternalLink className="w-4 h-4 mr-2" />
          Abrir
        </Button>
      </div>

      <Modal
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        title={`QR de ${title}`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsQrOpen(false)}>
              Cerrar
            </Button>
            <Button variant="outline" onClick={copyLink}>
              <Copy className="w-4 h-4 mr-2" />
              Copiar enlace
            </Button>
            <Button variant="primary" onClick={downloadQr} disabled={!qrDataUrl}>
              <Download className="w-4 h-4 mr-2" />
              Descargar QR
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {message && <AlertMessage type="info" message={message} onClose={() => setMessage(null)} />}
          <p className="text-sm text-gray-600 break-all">{url}</p>
          <div className="flex justify-center rounded-xl bg-white p-4 shadow-sm">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt={`QR de ${title}`} className="h-72 w-72" />
            ) : (
              <div className="flex h-72 w-72 items-center justify-center text-sm text-gray-500">
                Generando QR...
              </div>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
};

export default PublicLinkActions;