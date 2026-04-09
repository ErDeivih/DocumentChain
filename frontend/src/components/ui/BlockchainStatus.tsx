import React from 'react';
import { Badge } from './Badge';
import { cn } from '../../lib/utils';

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

// Componente para mostrar información de blockchain vs DB
export interface DataSourceIndicatorProps {
  source: 'blockchain' | 'database';
  className?: string;
}

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
