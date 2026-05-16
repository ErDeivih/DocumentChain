import { api } from '../lib/api';

/**
 * Configuración de un contrato inteligente desde el backend.
 */
export interface ContractConfig {
  /** Dirección del contrato desplegado. */
  address: string;
  /** ABI del contrato. */
  abi: any[];
}

/**
 * Respuesta de configuración de la blockchain.
 */
export interface BlockchainConfig {
  /** Identificador de la cadena. */
  chainId: number;
  /** URL del nodo RPC. */
  rpcUrl: string;
  /** URL del explorador de bloques (puede ser nulo). */
  blockExplorer: string | null;
  /** Contratos desplegados. */
  contracts: {
    /** Registro de documentos. */
    documentRegistry: ContractConfig;
    /** Versionado de documentos. */
    documentVersioning: ContractConfig;
    /** Firmas de documentos. */
    documentSigning: ContractConfig;
    /** Control de acceso a documentos. */
    documentAccessControl: ContractConfig;
  };
}

/**
 * API de configuración - Obtiene la configuración blockchain desde el backend.
 * Incluye direcciones y ABIs de contratos necesarios para que el frontend
 * interactúe con la blockchain.
 */
export const configApi = {
  /**
   * Obtiene la configuración completa de la blockchain (direcciones + ABIs).
   * @returns Configuración blockchain.
   */
  getBlockchainConfig: async (): Promise<BlockchainConfig> => {
    const response = await api.get<BlockchainConfig>('/config/blockchain');
    return response.data;
  },

  /**
   * Obtiene únicamente las direcciones de los contratos.
   * @returns Direcciones de contratos e información de red.
   */
  getContractAddresses: async (): Promise<{
    chainId: number;
    rpcUrl: string;
    blockExplorer: string | null;
    contracts: {
      documentRegistry: string | null;
      documentVersioning: string | null;
      documentSigning: string | null;
      documentAccessControl: string | null;
    };
  }> => {
    const response = await api.get('/config/contracts');
    return response.data;
  },

  /**
   * Obtiene únicamente los ABIs de los contratos.
   * @returns ABIs de los contratos.
   */
  getContractAbis: async (): Promise<{
    documentRegistry: any[];
    documentVersioning: any[];
    documentSigning: any[];
    documentAccessControl: any[];
  }> => {
    const response = await api.get('/config/abis');
    return response.data;
  }
};
