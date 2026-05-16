import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * Props del componente CopyableId.
 * @property value - Valor del identificador a mostrar y copiar.
 * @property label - Etiqueta opcional que precede al valor.
 * @property truncate - Indica si se debe truncar el valor.
 * @property truncateStart - Cantidad de caracteres iniciales a mostrar al truncar.
 * @property truncateEnd - Cantidad de caracteres finales a mostrar al truncar.
 * @property className - Clases CSS adicionales.
 * @property tooltip - Texto del tooltip al pasar el cursor.
 */
interface CopyableIdProps {
  value: string;
  label?: string;
  truncate?: boolean;
  truncateStart?: number;
  truncateEnd?: number;
  className?: string;
  tooltip?: string;
}

/**
 * Componente que muestra un identificador copiable al portapapeles con opción de truncamiento.
 * @param props - Props del componente CopyableId.
 */
export const CopyableId: React.FC<CopyableIdProps> = ({
  value,
  label,
  truncate = true,
  truncateStart = 6,
  truncateEnd = 4,
  className,
  tooltip,
}) => {
  const [copied, setCopied] = useState(false);

  const displayValue = truncate && value.length > truncateStart + truncateEnd
    ? `${value.slice(0, truncateStart)}...${value.slice(-truncateEnd)}`
    : value;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = value;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={cn('flex items-center gap-2 group', className)}>
      {label && (
        <span className="text-muted-foreground">{label}</span>
      )}
      <div className="relative flex items-center gap-1.5">
        <span 
          className="font-mono text-xs cursor-pointer hover:text-primary transition-colors"
          title={tooltip || value}
          onClick={handleCopy}
        >
          {displayValue}
        </span>
        <button
          onClick={handleCopy}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-secondary"
          title="Copiar al portapapeles"
        >
          {copied ? (
            <Check className="h-3 w-3 text-green-500" />
          ) : (
            <Copy className="h-3 w-3 text-muted-foreground" />
          )}
        </button>
        {copied && (
          <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded whitespace-nowrap">
            Copiado
          </span>
        )}
      </div>
    </div>
  );
};

export default CopyableId;
