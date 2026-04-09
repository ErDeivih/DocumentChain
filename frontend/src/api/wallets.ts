import { api } from '../lib/api';
import type { Wallet, Document, Share, Signature, Version } from '../types';

export interface WalletActivity {
  created: Document[];
  shared: Share[];
  signed: Signature[];
  versions: Version[];
}

export const walletsApi = {
  list: async (): Promise<{ wallets: Wallet[] }> => {
    const response = await api.get<{ wallets: Wallet[] }>('/wallets');
    return response.data;
  },

  add: async (
    address: string,
    label?: string,
    signature?: string,
    message?: string
  ): Promise<{ wallet: Wallet }> => {
    const response = await api.post<{ wallet: Wallet }>('/wallets', {
      address,
      label,
      signature,
      message
    });
    return response.data;
  },

  remove: async (walletId: string): Promise<void> => {
    await api.delete(`/wallets/${walletId}`);
  },

  setPrimary: async (walletId: string): Promise<{ wallet: Wallet }> => {
    const response = await api.put<{ wallet: Wallet }>(`/wallets/${walletId}/primary`);
    return response.data;
  },

  updateLabel: async (walletId: string, label: string): Promise<{ wallet: Wallet }> => {
    const response = await api.put<{ wallet: Wallet }>(`/wallets/${walletId}/label`, { label });
    return response.data;
  },

  getChallenge: async (address: string): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/wallets/challenge', { address });
    return response.data;
  },

  getPrimary: async (): Promise<{ wallet: Wallet }> => {
    const response = await api.get<{ wallet: Wallet }>('/wallets/primary');
    return response.data;
  },

  // ==================== NEW METHODS FOR WALLET-BASED DOCUMENTS ====================

  /**
   * Get documents created with a specific wallet
   */
  getDocuments: async (walletId: string): Promise<{ documents: Document[] }> => {
    const response = await api.get<{ documents: Document[] }>(`/documents/wallet/${walletId}`);
    return response.data;
  },

  /**
   * Get documents shared to a wallet address
   */
  getSharedToWallet: async (walletAddress: string): Promise<{ documents: Document[] }> => {
    const response = await api.get<{ documents: Document[] }>(`/wallets/${walletAddress}/shared`);
    return response.data;
  },

  /**
   * Get documents signed with a specific wallet
   */
  getSignedDocuments: async (walletId: string): Promise<{ documents: Document[] }> => {
    const response = await api.get<{ documents: Document[] }>(`/wallets/${walletId}/signed`);
    return response.data;
  },

  /**
   * Get complete activity for a wallet
   */
  getActivity: async (walletId: string): Promise<WalletActivity> => {
    const response = await api.get<WalletActivity>(`/wallets/${walletId}/activity`);
    return response.data;
  }
};

// Aliases for backward compatibility
export const listWallets = walletsApi.list;
export const addWallet = walletsApi.add;
export const removeWallet = walletsApi.remove;
export const setPrimaryWallet = walletsApi.setPrimary;
export const updateWalletLabel = walletsApi.updateLabel;
export const getWalletChallenge = walletsApi.getChallenge;
export const getPrimaryWallet = walletsApi.getPrimary;
