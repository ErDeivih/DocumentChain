import { ethers } from 'ethers';

// ABI del contrato consolidado DocumentRegistry
import DocumentRegistryABI from '../../../smart-contracts/artifacts/contracts/DocumentRegistry.sol/DocumentRegistry.json';
import { resolveDocumentRegistryAddress } from './contractAddress';
import { env } from './env';

const resolvedDocumentRegistryAddress = resolveDocumentRegistryAddress();

function normalizePrivateKey(rawKey?: string): string | null {
  if (!rawKey) return null;
  const unquoted = rawKey.trim().replace(/^['"]|['"]$/g, '');
  if (!unquoted) return null;
  const withoutPrefix = unquoted.replace(/^0x/i, '');
  return `0x${withoutPrefix}`;
}

const normalizedPrivateKey = normalizePrivateKey(env.BLOCKCHAIN_PRIVATE_KEY);

const providerInstance = env.BLOCKCHAIN_RPC_URL
  ? new ethers.JsonRpcProvider(env.BLOCKCHAIN_RPC_URL, undefined, {
      polling: false,
      staticNetwork: true,
    })
  : null;

/**
 * Obtiene la instancia del proveedor JSON-RPC de Ethereum.
 * @returns Proveedor activo.
 * @throws Error si `BLOCKCHAIN_RPC_URL` no está configurado.
 */
function getProviderInstance(): ethers.JsonRpcProvider {
  if (!providerInstance) {
    throw new Error('BLOCKCHAIN_RPC_URL no está configurado en las variables de entorno');
  }

  return providerInstance;
}

/**
 * Proveedor de Ethereum con inicialización diferida (lazy).
 * Permite que la API arranque y exponga información de salud incluso cuando
 * la configuración de blockchain está temporalmente ausente.
 */
export const provider = new Proxy({} as ethers.JsonRpcProvider, {
  get(_target, prop, receiver) {
    const activeProvider = getProviderInstance();
    const value = Reflect.get(activeProvider as unknown as object, prop, receiver);
    return typeof value === 'function' ? value.bind(activeProvider) : value;
  },
}) as ethers.JsonRpcProvider;

/** Dirección resuelta del contrato DocumentRegistry. */
export const DOCUMENT_REGISTRY_ADDRESS = resolvedDocumentRegistryAddress;

/** Interfaz de ethers para el contrato DocumentRegistry. */
export const documentRegistryInterface = new ethers.Interface(DocumentRegistryABI.abi);

/**
 * Firmante del backend (wallet para pagos de gas y operaciones administrativas).
 * Es `null` si no se ha configurado `BLOCKCHAIN_PRIVATE_KEY`.
 */
export const signer = normalizedPrivateKey
  ? new ethers.Wallet(normalizedPrivateKey, getProviderInstance())
  : null;

/** Hash del rol ADMIN_ROLE (debe coincidir con el definido en el smart contract). */
export const ADMIN_ROLE_HASH = ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE"));

/**
 * Obtiene una instancia del contrato DocumentRegistry con el firmante del backend.
 * @returns Instancia del contrato DocumentRegistry.
 * @throws Error si no está configurada la dirección del contrato o la clave privada.
 */
export function getDocumentRegistryContract() {
  if (!resolvedDocumentRegistryAddress) {
    throw new Error('CONTRACT_DOCUMENT_REGISTRY no configurada en variables de entorno');
  }

  if (!signer) {
    throw new Error('BLOCKCHAIN_PRIVATE_KEY no configurado - no se puede crear instancia del contrato');
  }

  return new ethers.Contract(
    resolvedDocumentRegistryAddress,
    DocumentRegistryABI.abi,
    signer
  );
}

/**
 * Obtiene una instancia de solo lectura del contrato DocumentRegistry.
 * @returns Instancia del contrato vinculada únicamente al proveedor.
 * @throws Error si no está configurada la dirección del contrato.
 */
export function getDocumentRegistryReadContract() {
  if (!resolvedDocumentRegistryAddress) {
    throw new Error('CONTRACT_DOCUMENT_REGISTRY no configurada en variables de entorno');
  }

  return new ethers.Contract(
    resolvedDocumentRegistryAddress,
    DocumentRegistryABI.abi,
    getProviderInstance()
  );
}

/**
 * Obtiene el contrato DocumentRegistry con un firmante específico (wallet de usuario).
 * Utilizado cuando se necesita ejecutar transacciones en nombre de un usuario.
 * @param userSigner - Wallet de ethers del usuario.
 * @returns Instancia del contrato vinculada al firmante proporcionado.
 * @throws Error si no está configurada la dirección del contrato.
 */
export function getDocumentRegistryContractWithSigner(userSigner: ethers.Wallet) {
  if (!resolvedDocumentRegistryAddress) {
    throw new Error('CONTRACT_DOCUMENT_REGISTRY no configurada en variables de entorno');
  }

  return new ethers.Contract(
    resolvedDocumentRegistryAddress,
    DocumentRegistryABI.abi,
    userSigner
  );
}

/**
 * Obtiene la instancia consolidada del contrato DocumentRegistry con el firmante del backend.
 * @returns Objeto con la instancia del registro.
 * @throws Error si no está configurada la dirección del contrato o la clave privada.
 */
export function getContracts() {
  return {
    documentRegistry: getDocumentRegistryContract(),
  };
}

/**
 * Obtiene la instancia consolidada del contrato DocumentRegistry con un firmante específico.
 * @param userSigner - Wallet de ethers del usuario.
 * @returns Objeto con la instancia del registro vinculada al firmante proporcionado.
 * @throws Error si no está configurada la dirección del contrato.
 */
export function getContractsWithSigner(userSigner: ethers.Wallet) {
  return {
    documentRegistry: getDocumentRegistryContractWithSigner(userSigner),
  };
}

export { ethers };
