import React from 'react';
import { X } from 'lucide-react';
import { Alert } from './Alert';
import { Button } from './Button';

/**
 * Props del componente AlertMessage.
 * @property type - Tipo de alerta: success, error, warning o info.
 * @property message - Texto del mensaje a mostrar.
 * @property onClose - Función opcional que se ejecuta al cerrar la alerta.
 * @property className - Clases CSS adicionales.
 */
export interface AlertMessageProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
  className?: string;
}

/**
 * Componente que muestra un mensaje de alerta con opción de cerrar.
 * @param props - Props del componente AlertMessage.
 */
const AlertMessage: React.FC<AlertMessageProps> = ({
  type,
  message,
  onClose,
  className,
}) => {
  const variantMap = {
    success: 'success' as const,
    error: 'destructive' as const,
    warning: 'warning' as const,
    info: 'info' as const,
  };

  return (
    <Alert variant={variantMap[type]} className={className}>
      <div className="flex items-start justify-between">
        <div className="flex-1">{message}</div>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-6 w-6 p-0 ml-2"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </Alert>
  );
};

export default AlertMessage;
export { AlertMessage };
