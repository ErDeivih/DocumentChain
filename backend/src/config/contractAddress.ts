import fs from 'fs';
import path from 'path';

const DEFAULT_LOCAL_DOCUMENT_REGISTRY_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

function isEthereumAddress(value: string | null | undefined): value is string {
  if (typeof value !== 'string') {
    return false;
  }

  return /^0x[a-fA-F0-9]{40}$/.test(value);
}

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

function getDeploymentEnvCandidates(): string[] {
  return [
    path.resolve(process.cwd(), 'smart-contracts/deployments/localhost.env'),
    path.resolve(process.cwd(), '../smart-contracts/deployments/localhost.env'),
    path.resolve(__dirname, '../../../smart-contracts/deployments/localhost.env'),
  ];
}

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

export function getDeploymentDocumentRegistryAddress(): string | null {
  const address = readDeploymentEnvFile().CONTRACT_DOCUMENT_REGISTRY;
  return isEthereumAddress(address) ? address : null;
}

export function resolveDocumentRegistryAddress(): string | undefined {
  const deploymentAddress = getDeploymentDocumentRegistryAddress();

  if (deploymentAddress && isLocalRpcUrl(process.env.BLOCKCHAIN_RPC_URL)) {
    return deploymentAddress;
  }

  return process.env.CONTRACT_DOCUMENT_REGISTRY || deploymentAddress || undefined;
}

export function resolveDocumentRegistryAddressOrDefault(): string {
  return resolveDocumentRegistryAddress() || DEFAULT_LOCAL_DOCUMENT_REGISTRY_ADDRESS;
}
