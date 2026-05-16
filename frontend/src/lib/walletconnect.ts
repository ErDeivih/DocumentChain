/**
 * Helper de WalletConnect.
 * Proporciona funcionalidad para conectar wallets móviles mediante WalletConnect.
 */

import EthereumProvider from '@walletconnect/ethereum-provider';
import { BrowserProvider } from 'ethers';

/**
 * Identificador de proyecto de WalletConnect.
 * Se obtiene preferentemente desde la variable de entorno `VITE_WALLETCONNECT_PROJECT_ID`;
 * de lo contrario, se utiliza un valor de respaldo.
 */
const WALLETCONNECT_PROJECT_ID = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '4c4e4a0e8c5c6e8e2a4c8e4a0e8c5c6e';

/**
 * Clase helper para gestionar conexiones WalletConnect v2.
 *
 * Permite conectar wallets móviles mediante código QR, firmar mensajes,
 * cambiar de red y verificar el estado de la sesión.
 */
export class WalletConnectHelper {
  /** Instancia interna del proveedor WalletConnect. */
  private provider: EthereumProvider | null = null;

  /**
   * Conecta una wallet mediante WalletConnect mostrando un modal con código QR.
   *
   * @returns Dirección de la cuenta conectada y proveedor de ethers.
   * @throws {Error} Si no se puede establecer la conexión o no se obtiene ninguna cuenta.
   */
  async connect(): Promise<{ address: string; provider: BrowserProvider }> {
    try {
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
          description: 'Gestión documental con trazabilidad blockchain para DocumentChain',
          url: window.location.origin,
          icons: [`${window.location.origin}/logo.png`],
        },
      });

      await this.provider.connect();

      const accounts = await this.provider.request<string[]>({
        method: 'eth_requestAccounts',
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No se pudo obtener la dirección de la wallet');
      }

      const address = accounts[0];
      const ethersProvider = new BrowserProvider(this.provider);

      return { address, provider: ethersProvider };
    } catch (error: any) {
      if (this.provider) {
        await this.provider.disconnect().catch(() => {});
        this.provider = null;
      }
      throw new Error(error.message || 'Error al conectar con WalletConnect');
    }
  }

  /**
   * Desconecta la sesión activa de WalletConnect y limpia el proveedor interno.
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
   * Verifica si existe una sesión de WalletConnect activa.
   *
   * @returns `true` si el proveedor está inicializado y conectado.
   */
  isConnected(): boolean {
    return this.provider !== null && this.provider.connected;
  }

  /**
   * Obtiene la dirección de la cuenta actualmente conectada.
   *
   * @returns Dirección en formato checksummed, o `null` si no hay sesión.
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
   * Firma un mensaje arbitrario utilizando la wallet conectada vía WalletConnect.
   *
   * @param message - Mensaje en claro a firmar.
   * @returns Firma hexadecimal del mensaje.
   * @throws {Error} Si no hay proveedor inicializado.
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
   * Solicita el cambio de red en la wallet conectada.
   *
   * @param chainId - Identificador numérico de la red destino.
   * @throws {Error} Si no hay proveedor inicializado.
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

/** Instancia singleton del helper de WalletConnect. */
let walletConnectInstance: WalletConnectHelper | null = null;

/**
 * Obtiene la instancia singleton de {@link WalletConnectHelper}.
 *
 * @returns La instancia única del helper.
 */
export const getWalletConnectInstance = (): WalletConnectHelper => {
  if (!walletConnectInstance) {
    walletConnectInstance = new WalletConnectHelper();
  }
  return walletConnectInstance;
};

export default WalletConnectHelper;
