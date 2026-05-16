/**
 * @fileoverview Módulo blockchain del frontend.
 *
 * Centraliza toda la funcionalidad relacionada con:
 * - Conexión y gestión de wallets.
 * - Interacción con contratos inteligentes.
 * - Monitoreo de transacciones.
 * - Configuración de redes.
 */

// Re-exportar configuración
export * from './config';

// Re-exportar proveedor
export { BlockchainProvider, blockchainProvider } from './provider';
export type { WalletType, WalletConnection, ProviderState } from './provider';

// Re-exportar contratos
export {
  DocumentRegistryContract,
  createContracts,
  AccessRole,
  DocumentStatus,
} from './contracts';
export type {
  DocumentStruct,
  VersionStruct,
  SignatureStruct,
  Contracts,
} from './contracts';

// Re-exportar monitor
export { TransactionMonitor, transactionMonitor } from './monitor';
export type {
  TransactionStatus,
  TransactionUpdate,
  TransactionCallbacks,
} from './monitor';

// Exportación por defecto para conveniencia
export default {
  blockchainProvider: (await import('./provider')).blockchainProvider,
  transactionMonitor: (await import('./monitor')).transactionMonitor,
  createContracts: (await import('./contracts')).createContracts,
};
