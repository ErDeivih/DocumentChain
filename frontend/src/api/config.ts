import { api } from '../lib/api';

/**
 * Contract configuration from backend
 */
export interface ContractConfig {
  address: string;
  abi: any[];
}

/**
 * Blockchain configuration response
 */
export interface BlockchainConfig {
  chainId: number;
  rpcUrl: string;
  blockExplorer: string | null;
  contracts: {
    documentRegistry: ContractConfig;
    documentVersioning: ContractConfig;
    documentSigning: ContractConfig;
    documentAccessControl: ContractConfig;
  };
}

/**
 * Config API - Get blockchain configuration from backend
 * This includes contract addresses and ABIs needed for frontend to interact with blockchain
 */
export const configApi = {
  /**
   * Get full blockchain configuration (addresses + ABIs)
   */
  getBlockchainConfig: async (): Promise<BlockchainConfig> => {
    const response = await api.get<BlockchainConfig>('/config/blockchain');
    return response.data;
  },

  /**
   * Get only contract addresses
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
   * Get only contract ABIs
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
