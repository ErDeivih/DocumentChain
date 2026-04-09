/**
 * Blockchain Module - Frontend Blockchain Interactions
 * 
 * This module provides all functionality needed for:
 * - Wallet connection and management
 * - Smart contract interactions
 * - Transaction monitoring
 * - Network configuration
 */

// Re-export configuration
export * from './config';

// Re-export provider
export { BlockchainProvider, blockchainProvider } from './provider';
export type { WalletType, WalletConnection, ProviderState } from './provider';

// Re-export contracts
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

// Re-export monitor
export { TransactionMonitor, transactionMonitor } from './monitor';
export type {
  TransactionStatus,
  TransactionUpdate,
  TransactionCallbacks,
} from './monitor';

// Default export for convenience
export default {
  blockchainProvider: (await import('./provider')).blockchainProvider,
  transactionMonitor: (await import('./monitor')).transactionMonitor,
  createContracts: (await import('./contracts')).createContracts,
};
