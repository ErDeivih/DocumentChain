import fs from 'fs';
import path from 'path';

/** Dirección por defecto del contrato `DocumentRegistry` en red local. */
const DEFAULT_LOCAL_DOCUMENT_REGISTRY_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

/**
 * Determina si un valor es una dirección Ethereum válida.
 *
 * @param value - Valor a evaluar.
 * @returns `true` si el valor es una cadena con formato de dirección Ethereum.
 */
function isEthereumAddress(value: string | null | undefined): value is string {
  if (typeof value !== 'string') {
    return false;
  }

  return /^0x[a-fA-F0-9]{40}$/.test(value);
}

/**
 * Determina si una URL de RPC corresponde a un nodo local.
 *
 * @param value - URL a evaluar.
 * @returns `true` si el hostname es `localhost` o `127.0.0.1`.
 */
function isLocalRpcUrl(value: string | null | undefined): boolean {
  if (!value) {
    return false;
  }

  try {
    const parsed = new URL(value);
    return parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
  } catch {
    return false;
  }
}

/**
 * Obtiene la lista de rutas candidatas donde puede encontrarse el archivo
 * de entorno con las direcciones de despliegue del contrato.
 *
 * @returns Arreglo de rutas de archivo candidatas.
 */
function getDeploymentEnvCandidates(): string[] {
  return [
    path.resolve(process.cwd(), 'smart-contracts/deployments/localhost.env'),
    path.resolve(process.cwd(), '../smart-contracts/deployments/localhost.env'),
    path.resolve(__dirname, '../../../smart-contracts/deployments/localhost.env'),
  ];
}

/**
 * Lee el primer archivo de entorno de despliegue disponible entre los candidatos.
 *
 * @returns Objeto con las variables de entorno leídas del archivo.
 */
function readDeploymentEnvFile(): Record<string, string> {
  for (const candidate of getDeploymentEnvCandidates()) {
    if (!fs.existsSync(candidate)) {
      continue;
    }

    const lines = fs.readFileSync(candidate, 'utf8').split(/\r?\n/);
    const values: Record<string, string> = {};

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }

      const separatorIndex = trimmed.indexOf('=');
      if (separatorIndex <= 0) {
        continue;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      const value = trimmed.slice(separatorIndex + 1).trim();
      if (key) {
        values[key] = value;
      }
    }

    return values;
  }

  return {};
}

/**
 * Obtiene la dirección del contrato `DocumentRegistry` desde el archivo de despliegue.
 *
 * @returns Dirección Ethereum válida, o `null` si no se encuentra o no es válida.
 */
export function getDeploymentDocumentRegistryAddress(): string | null {
  const address = readDeploymentEnvFile().CONTRACT_DOCUMENT_REGISTRY;
  return isEthereumAddress(address) ? address : null;
}

/**
 * Resuelve la dirección del contrato `DocumentRegistry` priorizando
 * la dirección de despliegue local cuando se usa un RPC local.
 *
 * @returns Dirección del contrato resuelta, o `undefined` si no se puede determinar.
 */
export function resolveDocumentRegistryAddress(): string | undefined {
  const deploymentAddress = getDeploymentDocumentRegistryAddress();

  if (deploymentAddress && isLocalRpcUrl(process.env.BLOCKCHAIN_RPC_URL)) {
    return deploymentAddress;
  }

  return process.env.CONTRACT_DOCUMENT_REGISTRY || deploymentAddress || undefined;
}

/**
 * Resuelve la dirección del contrato `DocumentRegistry`, utilizando una dirección
 * por defecto local como último recurso.
 *
 * @returns Dirección del contrato garantizada.
 */
export function resolveDocumentRegistryAddressOrDefault(): string {
  return resolveDocumentRegistryAddress() || DEFAULT_LOCAL_DOCUMENT_REGISTRY_ADDRESS;
}
