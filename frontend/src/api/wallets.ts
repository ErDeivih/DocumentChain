import { api } from '../lib/api';
import type { Wallet } from '../types';

/** API de wallets. */
export const walletsApi = {
  /**
   * Lista las wallets del usuario actual.
   * @returns Lista de wallets.
   */
  list: async (): Promise<{ wallets: Wallet[] }> => {
    const response = await api.get<{ wallets: Wallet[] }>('/wallets');
    return response.data;
  },

  /**
   * Añade una nueva wallet.
   * @param address - Dirección de la wallet.
   * @param label - Etiqueta descriptiva (opcional).
   * @param signature - Firma de verificación (opcional).
   * @param message - Mensaje firmado (opcional).
   * @returns Wallet creada.
   */
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

  /**
   * Elimina una wallet.
   * @param walletId - Identificador de la wallet.
   * @returns Promesa vacía.
   */
  remove: async (walletId: string): Promise<void> => {
    await api.delete(`/wallets/${walletId}`);
  },

  /**
   * Establece una wallet como primaria.
   * @param walletId - Identificador de la wallet.
   * @returns Wallet actualizada.
   */
  setPrimary: async (walletId: string): Promise<{ wallet: Wallet }> => {
    const response = await api.put<{ wallet: Wallet }>(`/wallets/${walletId}/primary`);
    return response.data;
  },

  /**
   * Actualiza la etiqueta de una wallet.
   * @param walletId - Identificador de la wallet.
   * @param label - Nueva etiqueta.
   * @returns Wallet actualizada.
   */
  updateLabel: async (walletId: string, label: string): Promise<{ wallet: Wallet }> => {
    const response = await api.put<{ wallet: Wallet }>(`/wallets/${walletId}/label`, { label });
    return response.data;
  },

  /**
   * Obtiene un mensaje de desafío para verificar una wallet.
   * @param address - Dirección de la wallet.
   * @returns Mensaje de desafío.
   */
  getChallenge: async (address: string): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/wallets/challenge', { address });
    return response.data;
  },


};
