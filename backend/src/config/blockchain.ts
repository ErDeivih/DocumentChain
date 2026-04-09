import { ethers } from 'ethers';

// Contract ABI (consolidated DocumentRegistry)
import DocumentRegistryABI from '../../../smart-contracts/artifacts/contracts/DocumentRegistry.sol/DocumentRegistry.json';

// Environment variables for contract addresses
const {
  BLOCKCHAIN_RPC_URL,
  CONTRACT_DOCUMENT_REGISTRY,
  BLOCKCHAIN_PRIVATE_KEY,
  ADMIN_ROLE
} = process.env;

if (!BLOCKCHAIN_RPC_URL) {
  throw new Error('BLOCKCHAIN_RPC_URL no está configurado en las variables de entorno');
}

// Create provider
export const provider = new ethers.JsonRpcProvider(BLOCKCHAIN_RPC_URL);

export const DOCUMENT_REGISTRY_ADDRESS = CONTRACT_DOCUMENT_REGISTRY;
export const documentRegistryInterface = new ethers.Interface(DocumentRegistryABI.abi);

// Create signer (backend wallet for gas payments and admin operations)
export const signer = BLOCKCHAIN_PRIVATE_KEY 
  ? new ethers.Wallet(BLOCKCHAIN_PRIVATE_KEY, provider)
  : null;

// ADMIN_ROLE constant (should match the one from smart contract)
export const ADMIN_ROLE_HASH = ADMIN_ROLE || ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE"));

/**
 * Get DocumentRegistry contract instance
 * This is the consolidated contract that handles all document operations
 */
export function getDocumentRegistryContract() {
  if (!CONTRACT_DOCUMENT_REGISTRY) {
    throw new Error('CONTRACT_DOCUMENT_REGISTRY no configurada en variables de entorno');
  }

  if (!signer) {
    throw new Error('BLOCKCHAIN_PRIVATE_KEY no configurado - no se puede crear instancia del contrato');
  }

  return new ethers.Contract(
    CONTRACT_DOCUMENT_REGISTRY,
    DocumentRegistryABI.abi,
    signer
  );
}

export function getDocumentRegistryReadContract() {
  if (!CONTRACT_DOCUMENT_REGISTRY) {
    throw new Error('CONTRACT_DOCUMENT_REGISTRY no configurada en variables de entorno');
  }

  return new ethers.Contract(
    CONTRACT_DOCUMENT_REGISTRY,
    DocumentRegistryABI.abi,
    provider
  );
}

/**
 * Get DocumentRegistry contract with a specific signer (user's wallet)
 * Used when we need to execute transactions on behalf of a user
 */
export function getDocumentRegistryContractWithSigner(userSigner: ethers.Wallet) {
  if (!CONTRACT_DOCUMENT_REGISTRY) {
    throw new Error('CONTRACT_DOCUMENT_REGISTRY no configurada en variables de entorno');
  }

  return new ethers.Contract(
    CONTRACT_DOCUMENT_REGISTRY,
    DocumentRegistryABI.abi,
    userSigner
  );
}

/**
 * Get all contracts — now all functionality lives in DocumentRegistry
 * Returns the registry instance for every key to avoid breaking callers
 */
export function getContracts() {
  const registry = getDocumentRegistryContract();
  return {
    documentRegistry: registry,
    documentVersioning: registry,
    documentSigning: registry,
    documentAccessControl: registry,
  };
}

export function getContractsWithSigner(userSigner: ethers.Wallet) {
  const registry = getDocumentRegistryContractWithSigner(userSigner);
  return {
    documentRegistry: registry,
    documentVersioning: registry,
    documentSigning: registry,
    documentAccessControl: registry,
  };
}

export { ethers };
