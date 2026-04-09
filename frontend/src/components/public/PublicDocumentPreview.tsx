import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

interface PublicDocumentPreviewProps {
  contentUrl: string;
  mimeType: string;
  fileName: string;
}

function supportsInlinePreview(mimeType: string): boolean {
  return (
    mimeType.startsWith('image/') ||
    mimeType === 'application/pdf' ||
    mimeType.startsWith('audio/') ||
    mimeType.startsWith('video/') ||
    mimeType.startsWith('text/') ||
    mimeType === 'application/json'
  );
}

export const PublicDocumentPreview: React.FC<PublicDocumentPreviewProps> = ({
  contentUrl,
  mimeType,
  fileName,
}) => {
  const [textContent, setTextContent] = useState<string>('');
  const [textError, setTextError] = useState<string | null>(null);

  useEffect(() => {
    if (!(mimeType.startsWith('text/') || mimeType === 'application/json')) {
      return;
    }

    fetch(contentUrl)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('No se pudo cargar la previsualización textual.');
        }

        setTextContent(await response.text());
      })
      .catch(() => setTextError('No se pudo cargar la previsualización textual.'));
  }, [contentUrl, mimeType]);

  if (!supportsInlinePreview(mimeType)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Previsualización</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            No hay previsualización inline para <strong>{fileName}</strong>. Use la descarga para abrir este formato en su aplicación correspondiente.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Previsualización</CardTitle>
      </CardHeader>
      <CardContent>
        {mimeType === 'application/pdf' ? (
          <iframe title={fileName} src={contentUrl} className="h-[70vh] w-full rounded-lg border" />
        ) : null}

        {mimeType.startsWith('image/') ? (
          <img src={contentUrl} alt={fileName} className="max-h-[70vh] w-full rounded-lg object-contain" />
        ) : null}

        {mimeType.startsWith('audio/') ? (
          <audio controls className="w-full">
            <source src={contentUrl} type={mimeType} />
          </audio>
        ) : null}

        {mimeType.startsWith('video/') ? (
          <video controls className="max-h-[70vh] w-full rounded-lg bg-black">
            <source src={contentUrl} type={mimeType} />
          </video>
        ) : null}

        {(mimeType.startsWith('text/') || mimeType === 'application/json') ? (
          textError ? (
            <p className="text-sm text-red-600">{textError}</p>
          ) : (
            <pre className="max-h-[70vh] overflow-auto rounded-lg bg-slate-950 p-4 text-sm text-slate-100">
              {textContent || 'Cargando contenido...'}
            </pre>
          )
        ) : null}
      </CardContent>
    </Card>
  );
};

export default PublicDocumentPreview;