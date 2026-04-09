/**
 * WalletConnect Helper
 * Proporciona funcionalidad para conectar wallets móviles mediante WalletConnect
 */

import EthereumProvider from '@walletconnect/ethereum-provider';
import { BrowserProvider } from 'ethers';

// Project ID de WalletConnect (obtener desde https://cloud.walletconnect.com/)
const WALLETCONNECT_PROJECT_ID = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '4c4e4a0e8c5c6e8e2a4c8e4a0e8c5c6e';

export class WalletConnectHelper {
  private provider: EthereumProvider | null = null;

  /**
   * Conectar wallet mediante WalletConnect (muestra QR code)
   */
  async connect(): Promise<{ address: string; provider: BrowserProvider }> {
    try {
      // Crear proveedor WalletConnect
      this.provider = await EthereumProvider.init({
        projectId: WALLETCONNECT_PROJECT_ID,
        chains: [1], // Ethereum mainnet requerido por WalletConnect v2
        optionalChains: [11155111, 31337], // Sepolia (11155111), Hardhat local (31337)
        showQrModal: true, // Mostrar modal con QR code
        methods: [
          'eth_sendTransaction',
          'eth_signTransaction',
          'eth_sign',
          'personal_sign',
          'eth_signTypedData',
        ],
        events: ['chainChanged', 'accountsChanged'],
        metadata: {
          name: 'DocumentChain',
          description: 'Sistema descentralizado de gestión de documentos',
          url: window.location.origin,
          icons: [`${window.location.origin}/logo.png`],
        },
      });

      // Habilitar sesión (muestra QR)
      await this.provider.connect();

      // Obtener cuenta conectada
      const accounts = await this.provider.request<string[]>({
        method: 'eth_requestAccounts',
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No se pudo obtener la dirección de la wallet');
      }

      const address = accounts[0];

      // Crear proveedor de ethers
      const ethersProvider = new BrowserProvider(this.provider);

      return { address, provider: ethersProvider };
    } catch (error: any) {
      // Limpiar proveedor si falla
      if (this.provider) {
        await this.provider.disconnect().catch(() => {});
        this.provider = null;
      }
      throw new Error(error.message || 'Error al conectar con WalletConnect');
    }
  }

  /**
   * Desconectar wallet de WalletConnect
   */
  async disconnect(): Promise<void> {
    if (this.provider) {
      try {
        await this.provider.disconnect();
      } catch (error) {
        console.error('Error al desconectar WalletConnect:', error);
      } finally {
        this.provider = null;
      }
    }
  }

  /**
   * Verificar si hay una sesión activa
   */
  isConnected(): boolean {
    return this.provider !== null && this.provider.connected;
  }

  /**
   * Obtener dirección actual
   */
  async getAddress(): Promise<string | null> {
    if (!this.provider) return null;

    try {
      const accounts = await this.provider.request<string[]>({
        method: 'eth_accounts',
      });
      return accounts && accounts.length > 0 ? accounts[0] : null;
    } catch {
      return null;
    }
  }

  /**
   * Firmar mensaje con WalletConnect
   */
  async signMessage(message: string): Promise<string> {
    if (!this.provider) {
      throw new Error('Proveedor WalletConnect no inicializado');
    }

    const ethersProvider = new BrowserProvider(this.provider);
    const signer = await ethersProvider.getSigner();
    return await signer.signMessage(message);
  }

  /**
   * Cambiar de red en WalletConnect
   */
  async switchChain(chainId: number): Promise<void> {
    if (!this.provider) {
      throw new Error('Proveedor WalletConnect no inicializado');
    }

    await this.provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${chainId.toString(16)}` }],
    });
  }
}

// Instancia singleton
let walletConnectInstance: WalletConnectHelper | null = null;

export const getWalletConnectInstance = (): WalletConnectHelper => {
  if (!walletConnectInstance) {
    walletConnectInstance = new WalletConnectHelper();
  }
  return walletConnectInstance;
};

export default WalletConnectHelper;
