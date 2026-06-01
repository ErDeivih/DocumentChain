/**
 * @fileoverview Gestor de proveedores blockchain para el frontend.
 *
 * Maneja la conexión de wallets, detección de proveedores mediante EIP-6963,
 * cambio de redes, firma de mensajes y eventos de wallet.
 */

import { ethers, BrowserProvider, JsonRpcSigner } from 'ethers';
import { CHAIN_CONFIG, isChainSupported, getNetworkConfig, GAS_CONFIG } from './config';
import { getWalletConnectInstance } from '../walletconnect';

/** Tipos de wallet soportados. */
export type WalletType = 'metamask' | 'walletconnect' | 'coinbase' | 'brave' | 'trust' | 'other';

/** Información de una conexión de wallet activa. */
export interface WalletConnection {
  /** Dirección de la cuenta conectada. */
  address: string;
  /** Identificador de la cadena actual. */
  chainId: number;
  /** Tipo de wallet conectada. */
  type: WalletType;
}

/** Información de una wallet detectada en el navegador. */
export interface DetectedWallet {
  /** Nombre comercial de la wallet. */
  name: string;
  /** Tipo de wallet. */
  type: WalletType;
  /** Icono de la wallet (URL o SVG). */
  icon?: string;
  /** Indica si la extensión está instalada. */
  installed: boolean;
  /** Proveedor Ethereum inyectado. */
  provider?: unknown;
  /** Identificador RDNS según EIP-6963. */
  rdns?: string;
}

/**
 * Información de proveedor según EIP-6963.
 * @see https://eips.ethereum.org/EIPS/eip-6963
 */
export interface EIP6963ProviderInfo {
  /** UUID único del proveedor. */
  uuid: string;
  /** Nombre del proveedor. */
  name: string;
  /** Icono del proveedor. */
  icon: string;
  /** Identificador RDNS (por ejemplo, 'io.metamask'). */
  rdns: string;
}

/** Detalle completo de un proveedor EIP-6963. */
export interface EIP6963ProviderDetail {
  /** Información del proveedor. */
  info: EIP6963ProviderInfo;
  /** Instancia del proveedor Ethereum. */
  provider: unknown;
}

/** Evento personalizado de anuncio de proveedor EIP-6963. */
export interface EIP6963AnnounceProviderEvent extends CustomEvent {
  type: 'eip6963:announceProvider';
  detail: EIP6963ProviderDetail;
}

/** Estado actual del proveedor blockchain. */
export interface ProviderState {
  /** Indica si hay una conexión activa. */
  isConnected: boolean;
  /** Dirección de la cuenta conectada. */
  address: string | null;
  /** Identificador de la cadena actual. */
  chainId: number | null;
  /** Instancia del proveedor ethers.js. */
  provider: BrowserProvider | null;
  /** Firmante actual. */
  signer: JsonRpcSigner | null;
}

export type EventCallback<T = unknown> = (data: T) => void;

/**
 * Clase para gestionar la conexión y operaciones con wallets blockchain.
 *
 * Responsabilidades principales:
 * - Detectar wallets disponibles (EIP-6963 y legacy).
 * - Conectar y desconectar wallets.
 * - Cambiar de red y validar la cadena activa.
 * - Firmar mensajes y datos tipados (EIP-712).
 * - Emitir eventos ante cambios de cuenta o red.
 */
export class BlockchainProvider {
  private provider: BrowserProvider | null = null;
  private signer: JsonRpcSigner | null = null;
  private currentAddress: string | null = null;
  private currentChainId: number | null = null;
  private walletEventProvider: {
    removeListener?: (event: string, callback: EventCallback) => void;
  } | null = null;

  private eventListeners: Map<string, Set<EventCallback>> = new Map();

  /**
   * Verifica si MetaMask está instalada.
   * @returns `true` si se detecta el objeto `window.ethereum`.
   */
  static isMetaMaskInstalled(): boolean {
    return typeof window !== 'undefined' &&
           typeof (window as Window & { ethereum?: unknown }).ethereum !== 'undefined';
  }

  /**
   * Detecta wallets mediante el estándar EIP-6963.
   *
   * Permite la coexistencia de múltiples wallets sin conflictos
   * escuchando eventos de anuncio de proveedores.
   *
   * @returns Promesa que se resuelve con la lista de wallets detectadas.
   */
  static detectEIP6963Wallets(): Promise<DetectedWallet[]> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') {
        resolve([]);
        return;
      }

      const walletsMap = new Map<string, DetectedWallet>();

      // Escuchar anuncios de wallets
      const handleAnnouncement = (event: Event) => {
        const announceEvent = event as EIP6963AnnounceProviderEvent;
        const { info, provider } = announceEvent.detail;

        // Mapear RDNS a tipo de wallet
        let type: WalletType = 'other';
        if (info.rdns.includes('metamask')) {
          type = 'metamask';
        } else if (info.rdns.includes('coinbase')) {
          type = 'coinbase';
        } else if (info.rdns.includes('brave')) {
          type = 'brave';
        } else if (info.rdns.includes('trust')) {
          type = 'trust';
        }

        const wallet: DetectedWallet = {
          name: info.name,
          type,
          icon: info.icon,
          installed: true,
          provider,
          rdns: info.rdns,
        };

        walletsMap.set(info.uuid, wallet);
      };

      // Registrar listener
      window.addEventListener('eip6963:announceProvider', handleAnnouncement);

      // Solicitar a los proveedores que se anuncien
      window.dispatchEvent(new Event('eip6963:requestProvider'));

      // Esperar respuesta de las wallets (100 ms debería ser suficiente)
      setTimeout(() => {
        window.removeEventListener('eip6963:announceProvider', handleAnnouncement);
        resolve(Array.from(walletsMap.values()));
      }, 100);
    });
  }

  /**
   * Detecta todas las wallets disponibles en el navegador.
   *
   * Combina detección EIP-6963 (moderna) y detección legacy mediante
   * `window.ethereum`.
   *
   * @returns Lista de wallets detectadas.
   */
  static async detectAvailableWallets(): Promise<DetectedWallet[]> {
    if (typeof window === 'undefined') {
      return [];
    }

    const walletsMap = new Map<string, DetectedWallet>();

    // 1. Intentar detección EIP-6963 primero (estándar moderno)
    try {
      const eip6963Wallets = await BlockchainProvider.detectEIP6963Wallets();
      eip6963Wallets.forEach(wallet => {
        walletsMap.set(wallet.rdns || wallet.name, wallet);
      });
    } catch (error) {
      console.warn('EIP-6963 detection failed:', error);
    }

    // 2. Fallback a detección legacy mediante window.ethereum
    const ethereum = (window as unknown as { ethereum?: unknown }).ethereum as {
      providers?: unknown[];
      isMetaMask?: boolean;
      isCoinbaseWallet?: boolean;
      isBraveWallet?: boolean;
      isTrust?: boolean;
      isTrustWallet?: boolean;
      isTokenPocket?: boolean;
    } | undefined;

    if (ethereum) {
      // Comprobar si existen múltiples proveedores (inyectados por diferentes wallets)
      const providers = ethereum.providers || [ethereum];

      providers.forEach((provider: unknown) => {
        const p = provider as {
          isMetaMask?: boolean;
          isCoinbaseWallet?: boolean;
          isBraveWallet?: boolean;
          isTrust?: boolean;
          isTrustWallet?: boolean;
          isTokenPocket?: boolean;
        };

        let wallet: DetectedWallet | null = null;

        // MetaMask
        if (p.isMetaMask && !p.isBraveWallet) {
          wallet = {
            name: 'MetaMask',
            type: 'metamask',
            icon: '/metamask-fox.svg',
            installed: true,
            provider: p,
          };
        }
        // Coinbase Wallet
        else if (p.isCoinbaseWallet) {
          wallet = {
            name: 'Coinbase Wallet',
            type: 'coinbase',
            installed: true,
            provider: p,
          };
        }
        // Brave Wallet (tiene isMetaMask pero también isBraveWallet)
        else if (p.isBraveWallet) {
          wallet = {
            name: 'Brave Wallet',
            type: 'brave',
            installed: true,
            provider: p,
          };
        }
        // Trust Wallet
        else if (p.isTrust || p.isTrustWallet) {
          wallet = {
            name: 'Trust Wallet',
            type: 'trust',
            installed: true,
            provider: p,
          };
        }
        // Wallet genérica
        else {
          wallet = {
            name: 'Browser Wallet',
            type: 'other',
            installed: true,
            provider: p,
          };
        }

        // Añadir al mapa (se ignoran duplicados)
        if (wallet && !walletsMap.has(wallet.name)) {
          walletsMap.set(wallet.name, wallet);
        }
      });
    }

    // 3. Mostrar siempre WalletConnect como disponible (no requiere extensión)
    walletsMap.set('WalletConnect', {
      name: 'WalletConnect',
      type: 'walletconnect',
      installed: true,
      provider: null,
    });

    return Array.from(walletsMap.values());
  }

  /**
   * Añade la red local de Hardhat a la wallet.
   *
   * Útil durante el desarrollo con blockchain local.
   */
  static async addHardhatNetwork(): Promise<void> {
    const ethereum = (window as unknown as { ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    } }).ethereum;

    if (!ethereum) {
      throw new Error('No Ethereum provider found');
    }

    try {
      await ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: CHAIN_CONFIG.chainIdHex,
          chainName: CHAIN_CONFIG.name,
          rpcUrls: [CHAIN_CONFIG.rpcUrl],
          nativeCurrency: CHAIN_CONFIG.nativeCurrency,
        }],
      });
    } catch (error) {
      console.error('Error adding Hardhat network:', error);
      throw error;
    }
  }

  /**
   * Conecta una wallet.
   *
   * @param type - Tipo de wallet a conectar.
   * @param provider - Proveedor específico (para escenarios multi-wallet).
   * @returns Detalles de la conexión establecida.
   */
  async connectWallet(type: WalletType = 'metamask', provider?: unknown): Promise<WalletConnection> {
    switch (type) {
      case 'metamask':
        return this.connectBrowserWallet('metamask', provider);
      case 'coinbase':
        return this.connectBrowserWallet('coinbase', provider);
      case 'brave':
        return this.connectBrowserWallet('brave', provider);
      case 'trust':
        return this.connectBrowserWallet('trust', provider);
      case 'other':
        return this.connectBrowserWallet('other', provider);
      case 'walletconnect':
        return this.connectWalletConnect();
      default:
        throw new Error(`Unsupported wallet type: ${type}`);
    }
  }

  /**
   * Conecta una wallet de navegador (MetaMask, Coinbase, Brave, etc.).
   *
   * Método genérico que funciona con cualquier wallet que implemente
   * `window.ethereum`.
   *
   * @param type - Tipo de wallet.
   * @param specificProvider - Proveedor específico (opcional).
   * @returns Detalles de la conexión.
   */
  private async connectBrowserWallet(type: WalletType, specificProvider?: unknown): Promise<WalletConnection> {
    const ethereum = specificProvider || (window as unknown as { ethereum?: unknown }).ethereum;

    if (!ethereum) {
      throw new Error('No Ethereum wallet found. Please install a wallet extension like MetaMask, Coinbase Wallet, or Brave Wallet.');
    }

    const provider = ethereum as {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on?: (event: string, callback: EventCallback) => void;
      removeListener?: (event: string, callback: EventCallback) => void;
      isMetaMask?: boolean;
      isCoinbaseWallet?: boolean;
      isBraveWallet?: boolean;
    };

    try {
      // Solicitar acceso a las cuentas
      const accounts = await provider.request({
        method: 'eth_requestAccounts'
      }) as string[];

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please unlock your wallet.');
      }

      // Crear proveedor y firmante
      this.provider = new BrowserProvider(provider as ethers.Eip1193Provider);
      this.signer = await this.provider.getSigner();
      this.currentAddress = accounts[0];

      // Obtener chain ID actual
      const network = await this.provider.getNetwork();
      this.currentChainId = Number(network.chainId);

      // Configurar listeners de eventos
      this.setupWalletEvents(provider);

      // Validar cadena (advertencia si no está soportada, pero no falla)
      await this.validateChain();

      return {
        address: this.currentAddress,
        chainId: this.currentChainId,
        type: type,
      };
    } catch (error) {
      console.error(`${type} connection error:`, error);
      throw error;
    }
  }

  /**
   * Conecta mediante WalletConnect.
   * @returns Detalles de la conexión WalletConnect.
   */
  private async connectWalletConnect(): Promise<WalletConnection> {
    try {
      // Obtener instancia de WalletConnect
      const wcHelper = getWalletConnectInstance();

      // Conectar (muestra modal QR)
      const { address, provider } = await wcHelper.connect();

      // Configurar proveedor y firmante
      this.provider = provider;
      this.signer = await provider.getSigner();
      this.currentAddress = address;

      // Obtener chain ID actual
      const network = await provider.getNetwork();
      this.currentChainId = Number(network.chainId);

      // Validar cadena
      await this.validateChain();

      // Asegurar que la dirección sea válida
      if (!this.currentAddress || !this.currentChainId) {
        throw new Error('No se pudo obtener la dirección o chainId de WalletConnect');
      }

      return {
        address: this.currentAddress,
        chainId: this.currentChainId,
        type: 'walletconnect',
      };
    } catch (error: any) {
      console.error('WalletConnect connection error:', error);
      throw new Error(error.message || 'Error al conectar con WalletConnect');
    }
  }

  /**
   * Configura los listeners de eventos de la wallet.
   *
   * Funciona con cualquier wallet que implemente los eventos Ethereum estándar.
   *
   * @param provider - Proveedor Ethereum con métodos `on` y `removeListener`.
   */
  private setupWalletEvents(provider: {
    on?: (event: string, callback: EventCallback) => void;
    removeListener?: (event: string, callback: EventCallback) => void;
  }): void {
    if (!provider.on) return;

    this.removeWalletEvents();

    // Cambio de cuenta
    provider.on('accountsChanged', this.handleAccountsChanged);
    provider.on('chainChanged', this.handleChainChanged);
    provider.on('disconnect', this.handleProviderDisconnect);
    this.walletEventProvider = provider;
  }

  private handleAccountsChanged = (accounts: unknown) => {
      const accountList = accounts as string[];
      if (accountList.length === 0) {
        // Usuario desconectado
        this.disconnect();
      } else {
        this.currentAddress = accountList[0];
        this.emit('accountsChanged', accountList);
      }
    };

  private handleChainChanged = (chainId: unknown) => {
      const newChainId = parseInt(chainId as string, 16);
      this.currentChainId = newChainId;
      this.emit('chainChanged', newChainId);

      // Recargar proveedor
      if (this.walletEventProvider) {
        this.provider = new BrowserProvider(this.walletEventProvider as ethers.Eip1193Provider);
      }
      this.provider?.getSigner().then(s => {
        this.signer = s;
      });
    };

  private handleProviderDisconnect = () => {
      this.disconnect();
    };

  private removeWalletEvents(): void {
    if (!this.walletEventProvider?.removeListener) {
      return;
    }

    this.walletEventProvider.removeListener('accountsChanged', this.handleAccountsChanged);
    this.walletEventProvider.removeListener('chainChanged', this.handleChainChanged);
    this.walletEventProvider.removeListener('disconnect', this.handleProviderDisconnect);
    this.walletEventProvider = null;
  }

  /**
   * Valida que la cadena actual esté soportada.
   */
  private async validateChain(): Promise<void> {
    if (!this.currentChainId) return;

    if (!isChainSupported(this.currentChainId)) {
      this.emit('chainUnsupported', this.currentChainId);
      throw new Error(`Red blockchain no soportada. Cambia a ${CHAIN_CONFIG.name}.`);
    }

    if (!this.isCorrectChain()) {
      this.emit('chainUnsupported', this.currentChainId);
      throw new Error(`Red blockchain incorrecta. Cambia a ${CHAIN_CONFIG.name}.`);
    }
  }

  /**
   * Cambia a una red específica.
   * @param chainId - Identificador de la cadena destino.
   */
  async switchNetwork(chainId: number): Promise<void> {
    const ethereum = (window as Window & { ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    } }).ethereum;

    if (!ethereum) {
      throw new Error('No Ethereum provider found');
    }

    const chainIdHex = `0x${chainId.toString(16)}`;

    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdHex }],
      });
    } catch (switchError: unknown) {
      const error = switchError as { code?: number };
      // Cadena no añadida a la wallet
      if (error.code === 4902) {
        await this.addNetwork(chainId);
      } else {
        throw switchError;
      }
    }
  }

  /**
   * Añade una red a la wallet.
   * @param chainId - Identificador de la cadena a añadir.
   */
  private async addNetwork(chainId: number): Promise<void> {
    const ethereum = (window as Window & { ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    } }).ethereum;

    if (!ethereum) {
      throw new Error('No Ethereum provider found');
    }

    const networkConfig = getNetworkConfig(chainId);
    if (!networkConfig) {
      throw new Error(`Network config not found for chain ID ${chainId}`);
    }

    await ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: networkConfig.chainIdHex,
        chainName: networkConfig.name,
        rpcUrls: [networkConfig.rpcUrl],
        blockExplorerUrls: networkConfig.blockExplorer ? [networkConfig.blockExplorer] : undefined,
        nativeCurrency: networkConfig.nativeCurrency,
      }],
    });
  }

  /**
   * Desconecta la wallet actual.
   */
  disconnect(): void {
    // Intentar desconectar WalletConnect si fue el método de conexión
    try {
      const wcHelper = getWalletConnectInstance();
      if (wcHelper.isConnected()) {
        wcHelper.disconnect().catch(err => {
          console.warn('Error disconnecting WalletConnect:', err);
        });
      }
    } catch (err) {
      // Ignorar errores durante el intento de desconexión de WalletConnect
    }

    this.provider = null;
    this.signer = null;
    this.currentAddress = null;
    this.currentChainId = null;
    this.removeWalletEvents();
    this.emit('disconnect', {});
  }

  /**
   * Obtiene el firmante actual.
   * @returns Instancia de JsonRpcSigner o `null`.
   */
  getSigner(): JsonRpcSigner | null {
    return this.signer;
  }

  /**
   * Obtiene el proveedor actual.
   * @returns Instancia de BrowserProvider o `null`.
   */
  getProvider(): BrowserProvider | null {
    return this.provider;
  }

  /**
   * Obtiene la dirección de la cuenta conectada.
   * @returns Dirección Ethereum o `null`.
   */
  getCurrentAddress(): string | null {
    return this.currentAddress;
  }

  /**
   * Obtiene el identificador de la cadena actual.
   * @returns Chain ID o `null`.
   */
  getCurrentChainId(): number | null {
    return this.currentChainId;
  }

  /**
   * Obtiene el estado completo de la conexión.
   * @returns Estado del proveedor.
   */
  getState(): ProviderState {
    return {
      isConnected: this.isConnected(),
      address: this.currentAddress,
      chainId: this.currentChainId,
      provider: this.provider,
      signer: this.signer,
    };
  }

  /**
   * Verifica si existe una conexión activa.
   * @returns `true` si hay un proveedor, firmante y dirección válidos.
   */
  isConnected(): boolean {
    return this.provider !== null && this.signer !== null && this.currentAddress !== null;
  }

  /**
   * Verifica si la cadena actual coincide con la esperada.
   * @returns `true` si coincide con la configuración global.
   */
  isCorrectChain(): boolean {
    return this.currentChainId === CHAIN_CONFIG.chainId;
  }

  /**
   * Obtiene el precio actual del gas.
   * @returns Precio del gas en wei.
   */
  async getGasPrice(): Promise<bigint> {
    if (!this.provider) {
      throw new Error('Provider not connected');
    }

    const feeData = await this.provider.getFeeData();
    return feeData.gasPrice || 0n;
  }

  /**
   * Estima el gas necesario para una transacción.
   * @param transaction - Solicitud de transacción.
   * @returns Estimación de gas en unidades.
   */
  async estimateGas(transaction: ethers.TransactionRequest): Promise<bigint> {
    if (!this.provider) {
      throw new Error('Provider not connected');
    }

    return await this.provider.estimateGas(transaction);
  }

  /**
   * Verifica si el precio del gas es aceptable según la configuración.
   * @returns `true` si el precio está dentro del rango permitido.
   */
  async isGasPriceAcceptable(): Promise<boolean> {
    const gasPrice = await this.getGasPrice();
    const gasPriceGwei = Number(ethers.formatUnits(gasPrice, 'gwei'));
    return gasPriceGwei <= GAS_CONFIG.maxGasPriceGwei;
  }

  /**
   * Obtiene el recibo de una transacción.
   * @param txHash - Hash de la transacción.
   * @returns Recibo de transacción o `null` si aún no se confirma.
   */
  async getTransactionReceipt(txHash: string): Promise<ethers.TransactionReceipt | null> {
    if (!this.provider) {
      throw new Error('Provider not connected');
    }

    return await this.provider.getTransactionReceipt(txHash);
  }

  /**
   * Espera la confirmación de una transacción.
   * @param txHash - Hash de la transacción.
   * @param confirmations - Número de confirmaciones requeridas.
   * @returns Recibo de transacción confirmada.
   */
  async waitForTransaction(
    txHash: string,
    confirmations: number = GAS_CONFIG.confirmations
  ): Promise<ethers.TransactionReceipt | null> {
    if (!this.provider) {
      throw new Error('Provider not connected');
    }

    return await this.provider.waitForTransaction(txHash, confirmations, GAS_CONFIG.timeoutMs);
  }

  /**
   * Obtiene el número de bloque actual.
   * @returns Número de bloque.
   */
  async getBlockNumber(): Promise<number> {
    if (!this.provider) {
      throw new Error('Provider not connected');
    }

    return await this.provider.getBlockNumber();
  }

  /**
   * Firma un mensaje con la wallet conectada.
   * @param message - Mensaje a firmar.
   * @returns Firma en formato hexadecimal.
   */
  async signMessage(message: string): Promise<string> {
    if (!this.signer) {
      throw new Error('Signer not available');
    }

    return await this.signer.signMessage(message);
  }

  /**
   * Firma datos tipados según EIP-712.
   * @param domain - Dominio tipado.
   * @param types - Definición de tipos.
   * @param value - Valor a firmar.
   * @returns Firma en formato hexadecimal.
   */
  async signTypedData(domain: ethers.TypedDataDomain, types: Record<string, ethers.TypedDataField[]>, value: Record<string, unknown>): Promise<string> {
    if (!this.signer) {
      throw new Error('Signer not available');
    }

    return await this.signer.signTypedData(domain, types, value);
  }

  /**
   * Registra un listener para un evento.
   * @param event - Nombre del evento.
   * @param callback - Función a ejecutar cuando se emita el evento.
   */
  on<T = unknown>(event: string, callback: EventCallback<T>): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback as EventCallback);
  }

  /**
   * Elimina un listener de evento.
   * @param event - Nombre del evento.
   * @param callback - Función registrada previamente.
   */
  off<T = unknown>(event: string, callback: EventCallback<T>): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(callback as EventCallback);
    }
  }

  /**
   * Emite un evento a todos los listeners registrados.
   * @param event - Nombre del evento.
   * @param data - Datos del evento.
   */
  private emit<T = unknown>(event: string, data: T): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }
}

// Instancia singleton
export const blockchainProvider = new BlockchainProvider();

export default blockchainProvider;
