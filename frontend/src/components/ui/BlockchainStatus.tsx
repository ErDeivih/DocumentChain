import React from 'react';
import { Badge } from './Badge';
import { cn } from '../../lib/utils';

/**
 * Props del componente BlockchainStatusBadge.
 * @property status - Estado de la blockchain: PENDING, SYNCED o FAILED.
 * @property showIcon - Indica si se debe mostrar el icono del estado.
 * @property className - Clases CSS adicionales.
 */
export interface BlockchainStatusBadgeProps {
  status: 'PENDING' | 'SYNCED' | 'FAILED';
  showIcon?: boolean;
  className?: string;
}

const statusConfig = {
  PENDING: {
    label: 'Pendiente',
    variant: 'warning' as const,
    icon: '⏳',
  },
  SYNCED: {
    label: 'Sincronizado',
    variant: 'success' as const,
    icon: '✓',
  },
  FAILED: {
    label: 'Error',
    variant: 'destructive' as const,
    icon: '✗',
  },
};

/**
 * Componente que muestra un badge con el estado de sincronización de la blockchain.
 * @param props - Props del componente BlockchainStatusBadge.
 */
export const BlockchainStatusBadge: React.FC<BlockchainStatusBadgeProps> = ({
  status,
  showIcon = true,
  className,
}) => {
  const config = statusConfig[status] || statusConfig.PENDING;

  return (
    <Badge variant={config.variant} className={cn('gap-1', className)}>
      {showIcon && <span>{config.icon}</span>}
      <span>{config.label}</span>
    </Badge>
  );
};

/**
 * Props del componente DataSourceIndicator.
 * @property source - Origen de los datos: blockchain o database.
 * @property className - Clases CSS adicionales.
 */
export interface DataSourceIndicatorProps {
  source: 'blockchain' | 'database';
  className?: string;
}

/**
 * Componente que indica si los datos provienen de la blockchain o de la base de datos.
 * @param props - Props del componente DataSourceIndicator.
 */
export const DataSourceIndicator: React.FC<DataSourceIndicatorProps> = ({
  source,
  className,
}) => {
  return (
    <Badge
      variant={source === 'blockchain' ? 'default' : 'secondary'}
      className={className}
    >
      {source === 'blockchain' ? '⛓️ Blockchain' : '💾 Base de Datos'}
    </Badge>
  );
};
