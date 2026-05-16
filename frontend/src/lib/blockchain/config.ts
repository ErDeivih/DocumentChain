/**
 * @fileoverview Configuración blockchain para el frontend.
 *
 * Contiene direcciones de contratos, ABIs, configuración de cadenas
 * soportadas, redes y parámetros de gas.
 */

const DOCUMENT_REGISTRY_STORAGE_KEY = 'documentchain.contract.documentRegistry';

/**
 * Verifica si un valor es una dirección Ethereum válida.
 * @param value - Valor a comprobar.
 * @returns `true` si es una dirección Ethereum válida.
 */
function isEthereumAddress(value: string | null | undefined): value is string {
  return typeof value === 'string' && /^0x[a-fA-F0-9]{40}$/.test(value);
}

/**
 * Obtiene la dirección del contrato DocumentRegistry persistida en localStorage.
 * @returns Dirección Ethereum o `null`.
 */
function getPersistedDocumentRegistryAddress(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const value = window.localStorage.getItem(DOCUMENT_REGISTRY_STORAGE_KEY);
  return isEthereumAddress(value) ? value : null;
}

/**
 * Persiste la dirección del contrato DocumentRegistry en localStorage.
 * @param address - Dirección Ethereum del contrato.
 */
function persistDocumentRegistryAddress(address: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(DOCUMENT_REGISTRY_STORAGE_KEY, address);
}

// ABIs del contrato — DocumentRegistry consolidado con toda la funcionalidad
/** ABI del contrato DocumentRegistry. */
export const DocumentRegistryABI = [
  // Events
  "event DocumentCreated(bytes32 indexed docId, address indexed owner, string ipfsCid, uint256 timestamp)",
  "event VersionCreated(bytes32 indexed docId, uint256 indexed versionNumber, string ipfsCid, address indexed createdBy, uint256 timestamp)",
  "event VersionRestored(bytes32 indexed docId, uint256 newVersionNumber, uint256 restoredFromVersion, address indexed by, uint256 timestamp)",
  "event DocumentSigned(bytes32 indexed docId, uint256 indexed versionNumber, address indexed signer, string message, uint256 timestamp)",
  "event DocumentShared(bytes32 indexed docId, address indexed from, address indexed to, uint8 role, uint256 timestamp)",
  "event PermissionRevoked(bytes32 indexed docId, address indexed user, address indexed by, uint256 timestamp)",
  "event OwnershipTransferred(bytes32 indexed docId, address indexed from, address indexed to, uint256 timestamp)",
  "event DocumentArchived(bytes32 indexed docId, address indexed by, bool archived, uint256 timestamp)",
  "event DocumentDeleted(bytes32 indexed docId, address indexed by, uint256 timestamp)",
  "event OperationalVersionChanged(bytes32 indexed docId, uint256 oldVersion, uint256 newVersion, address indexed by, uint256 timestamp)",
  "event AdminRoleGranted(address indexed admin, address indexed by, uint256 timestamp)",
  "event AdminRoleRevoked(address indexed admin, address indexed by, uint256 timestamp)",
  // Write functions
  "function createDocument(bytes32 _docId, string _ipfsCid, bytes32 _encryptedKeyHash)",
  "function createVersion(bytes32 _docId, string _ipfsCid, bytes32 _encryptedKeyHash)",
  "function signDocument(bytes32 _docId, uint256 _versionNumber, bytes _signature, string _message, string _comment)",
  "function shareDocument(bytes32 _docId, address _user, uint8 _role)",
  "function revokePermission(bytes32 _docId, address _user)",
  "function transferOwnership(bytes32 _docId, address _newOwner)",
  "function setArchiveStatus(bytes32 _docId, bool _archived)",
  "function deleteDocument(bytes32 _docId)",
  "function restoreVersion(bytes32 _docId, uint256 _versionToRestore)",
  "function setOperationalVersion(bytes32 _docId, uint256 _versionNumber)",
  "function grantRole(bytes32 role, address account)",
  "function revokeRole(bytes32 role, address account)",
  // Read functions
  "function getDocument(bytes32 _docId) view returns (tuple(bytes32 docId, address owner, uint256 createdAt, uint256 updatedAt, uint256 currentVersion, uint256 latestVersion, bool isArchived, bool isDeleted))",
  "function getVersion(bytes32 _docId, uint256 _versionNumber) view returns (tuple(uint256 versionNumber, string ipfsCid, bytes32 encryptedKeyHash, address createdBy, uint256 createdAt, bool isOperational, uint256 restoredFrom))",
  "function getVersionSignatures(bytes32 _docId, uint256 _versionNumber) view returns (tuple(address signer, bytes signature, string message, string comment, uint256 timestamp)[])",
  "function getUserPermission(bytes32 _docId, address _user) view returns (uint8)",
  "function getUserDocuments(address _user) view returns (bytes32[])",
  "function getUserDocumentCount(address _user) view returns (uint256)",
  "function getDocumentUsers(bytes32 _docId) view returns (address[])",
  "function canView(bytes32 _docId, address _user) view returns (bool)",
  "function canEdit(bytes32 _docId, address _user) view returns (bool)",
  "function isOwner(bytes32 _docId, address _user) view returns (bool)",
  "function totalDocuments() view returns (uint256)",
  "function hasRole(bytes32 role, address account) view returns (bool)",
  "function ADMIN_ROLE() view returns (bytes32)",
];

/** Configuración de un contrato desplegado. */
export interface ContractConfig {
  /** Dirección del contrato. */
  address: string;
  /** ABI del contrato. */
  abi: string[];
}

/** Mapa de contratos configurados. */
export const CONTRACTS: Record<string, ContractConfig> = {
  DocumentRegistry: {
    address: getPersistedDocumentRegistryAddress() || import.meta.env.VITE_CONTRACT_REGISTRY || '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    abi: DocumentRegistryABI,
  },
};

/**
 * Establece la dirección de un contrato en la configuración.
 *
 * Persiste la dirección en localStorage si el contrato es DocumentRegistry.
 *
 * @param name - Nombre del contrato.
 * @param address - Nueva dirección Ethereum.
 */
export function setContractAddress(name: string, address: string): void {
  const contract = CONTRACTS[name];
  if (!contract) {
    throw new Error(`Contract ${name} not found in configuration`);
  }

  if (!isEthereumAddress(address)) {
    throw new Error(`Invalid Ethereum address for ${name}`);
  }

  contract.address = address;

  if (name === 'DocumentRegistry') {
    persistDocumentRegistryAddress(address);
  }
}

/** Configuración de una cadena blockchain. */
export interface ChainConfig {
  /** Identificador numérico de la cadena. */
  chainId: number;
  /** Identificador en hexadecimal. */
  chainIdHex: string;
  /** Nombre descriptivo de la red. */
  name: string;
  /** URL del nodo RPC. */
  rpcUrl: string;
  /** URL del explorador de bloques (opcional). */
  blockExplorer?: string;
  /** Información de la moneda nativa. */
  nativeCurrency?: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

const HARDHAT_RPC_URL = import.meta.env.VITE_BLOCKCHAIN_RPC_URL || 'http://localhost:8545';
const HARDHAT_CHAIN_NAME = import.meta.env.VITE_CHAIN_NAME || 'Hardhat Localhost';

/** Configuración de la cadena activa. */
export const CHAIN_CONFIG: ChainConfig = {
  chainId: parseInt(import.meta.env.VITE_CHAIN_ID || '31337'),
  chainIdHex: `0x${(parseInt(import.meta.env.VITE_CHAIN_ID || '31337')).toString(16)}`,
  name: HARDHAT_CHAIN_NAME,
  rpcUrl: HARDHAT_RPC_URL,
  blockExplorer: import.meta.env.VITE_BLOCK_EXPLORER_URL,
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
  },
};

/** Redes soportadas para cambio de red desde la wallet. */
export const SUPPORTED_NETWORKS: Record<number, ChainConfig> = {
  31337: {
    chainId: 31337,
    chainIdHex: '0x7A69',
    name: HARDHAT_CHAIN_NAME,
    rpcUrl: HARDHAT_RPC_URL,
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  1337: {
    chainId: 1337,
    chainIdHex: '0x539',
    name: `${HARDHAT_CHAIN_NAME} (Alt)`,
    rpcUrl: HARDHAT_RPC_URL,
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  1: {
    chainId: 1,
    chainIdHex: '0x1',
    name: 'Ethereum Mainnet',
    rpcUrl: 'https://mainnet.infura.io/v3/',
    blockExplorer: 'https://etherscan.io',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  11155111: {
    chainId: 11155111,
    chainIdHex: '0xaa36a7',
    name: 'Sepolia Testnet',
    rpcUrl: 'https://sepolia.infura.io/v3/',
    blockExplorer: 'https://sepolia.etherscan.io',
    nativeCurrency: {
      name: 'Sepolia Ether',
      symbol: 'SEP',
      decimals: 18,
    },
  },
  137: {
    chainId: 137,
    chainIdHex: '0x89',
    name: 'Polygon Mainnet',
    rpcUrl: 'https://polygon-rpc.com',
    blockExplorer: 'https://polygonscan.com',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
  },
  80001: {
    chainId: 80001,
    chainIdHex: '0x13881',
    name: 'Mumbai Testnet',
    rpcUrl: 'https://rpc-mumbai.maticvigil.com',
    blockExplorer: 'https://mumbai.polygonscan.com',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
  },
};

/** Configuración de gas para transacciones. */
export const GAS_CONFIG = {
  /** Precio máximo de gas aceptable en Gwei. */
  maxGasPriceGwei: 100,
  /** Límite de gas predeterminado para transacciones. */
  defaultGasLimit: 500000,
  /** Número de confirmaciones a esperar. */
  confirmations: 1,
  /** Tiempo máximo de espera para confirmación (ms). */
  timeoutMs: 5 * 60 * 1000,
};

/**
 * Obtiene la dirección de un contrato por su nombre.
 * @param name - Nombre del contrato.
 * @returns Dirección Ethereum del contrato.
 */
export function getContractAddress(name: string): string {
  const contract = CONTRACTS[name];
  if (!contract) {
    throw new Error(`Contract ${name} not found in configuration`);
  }
  return contract.address;
}

/**
 * Obtiene el ABI de un contrato por su nombre.
 * @param name - Nombre del contrato.
 * @returns Array de fragmentos ABI.
 */
export function getContractABI(name: string): string[] {
  const contract = CONTRACTS[name];
  if (!contract) {
    throw new Error(`Contract ${name} not found in configuration`);
  }
  return contract.abi;
}

/**
 * Verifica si un chain ID está soportado.
 * @param chainId - Identificador de cadena.
 * @returns `true` si la cadena está en la lista de redes soportadas.
 */
export function isChainSupported(chainId: number): boolean {
  return chainId in SUPPORTED_NETWORKS;
}

/**
 * Obtiene la configuración de red para un chain ID.
 * @param chainId - Identificador de cadena.
 * @returns Configuración de la red o `undefined`.
 */
export function getNetworkConfig(chainId: number): ChainConfig | undefined {
  return SUPPORTED_NETWORKS[chainId];
}
