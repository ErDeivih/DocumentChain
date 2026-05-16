/**
 * @fileoverview Archivo de barril (barrel file) que centraliza la exportación de todos los componentes UI.
 *
 * Re-exporta los componentes base, tipos y utilidades utilizados en toda la interfaz
 * para simplificar las rutas de importación y mantener la coherencia del diseño.
 */

// Componentes shadcn/ui actualizados
export { Button, buttonVariants } from './Button';
export type { ButtonProps } from './Button';

export { Input } from './Input';
export type { InputProps } from './Input';

export { Label } from './Label';

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './Card';

export { Alert, AlertTitle, AlertDescription } from './Alert';

export { Badge, badgeVariants } from './Badge';
export type { BadgeProps } from './Badge';

export { Skeleton } from './Skeleton';

export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from './Dialog';

export { Progress } from './Progress';

export { Select, SelectItem } from './Select';

export { Switch } from './Switch';

export { Separator } from './Separator';

export { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs';

export { Avatar, AvatarImage, AvatarFallback } from './Avatar';

export { Toast, ToastProvider, useToast, toastVariants } from './Toast';

// Componentes legacy (mantener compatibilidad)
export { Modal, ModalFooter } from './Modal';
export type { ModalProps } from './Modal';

export { Loading, LoadingOverlay } from './Loading';
export type { LoadingProps } from './Loading';

export { BlockchainStatusBadge, DataSourceIndicator } from './BlockchainStatus';
export type { BlockchainStatusBadgeProps, DataSourceIndicatorProps } from './BlockchainStatus';

export { Table, TableCellStack } from './Table';
export type { TableProps, Column } from './Table';
