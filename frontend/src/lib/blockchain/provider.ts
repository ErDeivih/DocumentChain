/**
 * Blockchain Provider Manager for Frontend
 * Handles wallet connections and provider management
 */

import { ethers, BrowserProvider, JsonRpcSigner } from 'ethers';
import { CHAIN_CONFIG, isChainSupported, getNetworkConfig, GAS_CONFIG } from './config';
import { getWalletConnectInstance } from '../walletconnect';

export type WalletType = 'metamask' | 'walletconnect' | 'coinbase' | 'brave' | 'trust' | 'other';

export interface WalletConnection {
  address: string;
  chainId: number;
  type: WalletType;
}

/**
 * Detected wallet information
 */
export interface DetectedWallet {
  name: string;
  type: WalletType;
  icon?: string;
  installed: boolean;
  provider?: unknown;
  rdns?: string; // Reverse DNS identifier from EIP-6963
}

/**
 * EIP-6963: Multi-wallet discovery standard
 * https://eips.ethereum.org/EIPS/eip-6963
 */
export interface EIP6963ProviderInfo {
  uuid: string;
  name: string;
  icon: string;
  rdns: string; // Reverse DNS name (e.g., 'io.metamask', 'com.coinbase.wallet')
}

export interface EIP6963ProviderDetail {
  info: EIP6963ProviderInfo;
  provider: unknown;
}

export interface EIP6963AnnounceProviderEvent extends CustomEvent {
  type: 'eip6963:announceProvider';
  detail: EIP6963ProviderDetail;
}

export interface ProviderState {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
}

type EventCallback<T = unknown> = (data: T) => void;

/**
 * BlockchainProvider class for managing wallet connections
 */
export class BlockchainProvider {
  private provider: BrowserProvider | null = null;
  private signer: JsonRpcSigner | null = null;
  private currentAddress: string | null = null;
  private currentChainId: number | null = null;
  
  private eventListeners: Map<string, Set<EventCallback>> = new Map();

  /**
   * Check if MetaMask is installed
   */
  static isMetaMaskInstalled(): boolean {
    return typeof window !== 'undefined' && 
           typeof (window as Window & { ethereum?: unknown }).ethereum !== 'undefined';
  }

  /**
   * Detect wallets using EIP-6963 standard
   * Modern approach that allows multiple wallets to coexist without conflicts
   * @returns Promise that resolves with array of detected wallets via EIP-6963
   */
  static detectEIP6963Wallets(): Promise<DetectedWallet[]> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') {
        resolve([]);
        return;
      }

      const walletsMap = new Map<string, DetectedWallet>();

      // Listen for wallet announcements
      const handleAnnouncement = (event: Event) => {
        const announceEvent = event as EIP6963AnnounceProviderEvent;
        const { info, provider } = announceEvent.detail;

        // Map RDNS to wallet type
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

      // Register listener
      window.addEventListener('eip6963:announceProvider', handleAnnouncement);

      // Request providers to announce themselves
      window.dispatchEvent(new Event('eip6963:requestProvider'));

      // Wait for wallets to respond (100ms should be enough)
      setTimeout(() => {
        window.removeEventListener('eip6963:announceProvider', handleAnnouncement);
        resolve(Array.from(walletsMap.values()));
      }, 100);
    });
  }

  /**
   * Detect all available browser wallets
   * Combines EIP-6963 (modern) and legacy window.ethereum detection
   */
  static async detectAvailableWallets(): Promise<DetectedWallet[]> {
    if (typeof window === 'undefined') {
      return [];
    }

    const walletsMap = new Map<string, DetectedWallet>();

    // 1. Try EIP-6963 detection first (modern standard)
    try {
      const eip6963Wallets = await BlockchainProvider.detectEIP6963Wallets();
      eip6963Wallets.forEach(wallet => {
        walletsMap.set(wallet.rdns || wallet.name, wallet);
      });
    } catch (error) {
      console.warn('EIP-6963 detection failed:', error);
    }

    // 2. Fallback to legacy window.ethereum detection
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
      // Check if multiple providers exist (injected by different wallets)
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
        // Brave Wallet (has isMetaMask flag but also isBraveWallet)
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
        // Other generic wallet
        else {
          wallet = {
            name: 'Browser Wallet',
            type: 'other',
            installed: true,
            provider: p,
          };
        }

        // Add to map (duplicates will be ignored)
        if (wallet && !walletsMap.has(wallet.name)) {
          walletsMap.set(wallet.name, wallet);
        }
      });
    }

    // 3. Always show WalletConnect as available (doesn't need browser extension)
    walletsMap.set('WalletConnect', {
      name: 'WalletConnect',
      type: 'walletconnect',
      installed: true,
      provider: null,
    });

    return Array.from(walletsMap.values());
  }

  /**
   * Add Hardhat local network to wallet
   * Useful for development with local blockchain
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
          chainId: '0x7A69', // 31337 in hex
          chainName: 'Hardhat Local',
          rpcUrls: ['http://127.0.0.1:8545'],
          nativeCurrency: {
              name: 'Ethereum',
              symbol: 'ETH',
              decimals: 18
          },
        }],
      });
    } catch (error) {
      console.error('Error adding Hardhat network:', error);
      throw error;
    }
  }

  /**
   * Connect to a wallet
   * @param type Wallet type to connect
   * @param provider Optional specific provider (for multi-wallet scenarios)
   * @returns Connection details
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
   * Connect to a browser wallet (MetaMask, Coinbase, Brave, etc.)
   * Generic method that works with any wallet using window.ethereum
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
      // Request account access
      const accounts = await provider.request({ 
        method: 'eth_requestAccounts' 
      }) as string[];

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please unlock your wallet.');
      }

      // Create provider and signer
      this.provider = new BrowserProvider(provider as ethers.Eip1193Provider);
      this.signer = await this.provider.getSigner();
      this.currentAddress = accounts[0];

      // Get current chain ID
      const network = await this.provider.getNetwork();
      this.currentChainId = Number(network.chainId);

      // Setup event listeners
      this.setupWalletEvents(provider);

      // Validate chain (will warn if not supported, but won't fail)
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
   * Connect to WalletConnect
   */
  private async connectWalletConnect(): Promise<WalletConnection> {
    try {
      // Get WalletConnect instance
      const wcHelper = getWalletConnectInstance();
      
      // Connect (shows QR modal)
      const { address, provider } = await wcHelper.connect();
      
      // Set up provider and signer
      this.provider = provider;
      this.signer = await provider.getSigner();
      this.currentAddress = address;
      
      // Get current chain ID
      const network = await provider.getNetwork();
      this.currentChainId = Number(network.chainId);
      
      // Validate chain (will warn if not supported, but won't fail)
      await this.validateChain();
      
      // Ensure address is valid
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
   * Setup wallet event listeners
   * Works with any wallet that implements standard Ethereum events
   */
  private setupWalletEvents(provider: { 
    on?: (event: string, callback: EventCallback) => void;
    removeListener?: (event: string, callback: EventCallback) => void;
  }): void {
    if (!provider.on) return;

    // Account changed
    provider.on('accountsChanged', (accounts: unknown) => {
      const accountList = accounts as string[];
      if (accountList.length === 0) {
        // User disconnected
        this.disconnect();
      } else {
        this.currentAddress = accountList[0];
        this.emit('accountsChanged', accountList);
      }
    });

    // Chain changed
    provider.on('chainChanged', (chainId: unknown) => {
      const newChainId = parseInt(chainId as string, 16);
      this.currentChainId = newChainId;
      this.emit('chainChanged', newChainId);
      
      // Reload provider
      this.provider = new BrowserProvider(provider as ethers.Eip1193Provider);
      this.provider.getSigner().then(s => {
        this.signer = s;
      });
    });

    // Disconnect
    provider.on('disconnect', () => {
      this.disconnect();
      this.emit('disconnect', {});
    });
  }

  /**
   * Validate current chain matches expected chain
   */
  private async validateChain(): Promise<void> {
    if (!this.currentChainId) return;

    if (!isChainSupported(this.currentChainId)) {
      console.warn(`Chain ID ${this.currentChainId} is not supported. Expected: ${CHAIN_CONFIG.chainId}`);
      this.emit('chainUnsupported', this.currentChainId);
    }
  }

  /**
   * Switch to a specific network
   * @param chainId Target chain ID
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
      // Chain not added to wallet
      if (error.code === 4902) {
        await this.addNetwork(chainId);
      } else {
        throw switchError;
      }
    }
  }

  /**
   * Add a network to the wallet
   * @param chainId Chain ID to add
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
   * Disconnect wallet
   */
  disconnect(): void {
    // Try to disconnect WalletConnect if it was the connection method
    try {
      const wcHelper = getWalletConnectInstance();
      if (wcHelper.isConnected()) {
        wcHelper.disconnect().catch(err => {
          console.warn('Error disconnecting WalletConnect:', err);
        });
      }
    } catch (err) {
      // Ignore errors during WalletConnect disconnect attempt
    }
    
    this.provider = null;
    this.signer = null;
    this.currentAddress = null;
    this.currentChainId = null;
    this.emit('disconnect', {});
  }

  /**
   * Get current signer
   */
  getSigner(): JsonRpcSigner | null {
    return this.signer;
  }

  /**
   * Get current provider
   */
  getProvider(): BrowserProvider | null {
    return this.provider;
  }

  /**
   * Get current address
   */
  getCurrentAddress(): string | null {
    return this.currentAddress;
  }

  /**
   * Get current chain ID
   */
  getCurrentChainId(): number | null {
    return this.currentChainId;
  }

  /**
   * Get connection state
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
   * Check if connected
   */
  isConnected(): boolean {
    return this.provider !== null && this.signer !== null && this.currentAddress !== null;
  }

  /**
   * Check if current chain matches expected
   */
  isCorrectChain(): boolean {
    return this.currentChainId === CHAIN_CONFIG.chainId;
  }

  /**
   * Get gas price
   */
  async getGasPrice(): Promise<bigint> {
    if (!this.provider) {
      throw new Error('Provider not connected');
    }
    
    const feeData = await this.provider.getFeeData();
    return feeData.gasPrice || 0n;
  }

  /**
   * Estimate gas for a transaction
   */
  async estimateGas(transaction: ethers.TransactionRequest): Promise<bigint> {
    if (!this.provider) {
      throw new Error('Provider not connected');
    }
    
    return await this.provider.estimateGas(transaction);
  }

  /**
   * Check if gas price is acceptable
   */
  async isGasPriceAcceptable(): Promise<boolean> {
    const gasPrice = await this.getGasPrice();
    const gasPriceGwei = Number(ethers.formatUnits(gasPrice, 'gwei'));
    return gasPriceGwei <= GAS_CONFIG.maxGasPriceGwei;
  }

  /**
   * Get transaction receipt
   */
  async getTransactionReceipt(txHash: string): Promise<ethers.TransactionReceipt | null> {
    if (!this.provider) {
      throw new Error('Provider not connected');
    }
    
    return await this.provider.getTransactionReceipt(txHash);
  }

  /**
   * Wait for transaction confirmation
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
   * Get current block number
   */
  async getBlockNumber(): Promise<number> {
    if (!this.provider) {
      throw new Error('Provider not connected');
    }
    
    return await this.provider.getBlockNumber();
  }

  /**
   * Sign a message
   */
  async signMessage(message: string): Promise<string> {
    if (!this.signer) {
      throw new Error('Signer not available');
    }
    
    return await this.signer.signMessage(message);
  }

  /**
   * Sign typed data (EIP-712)
   */
  async signTypedData(domain: ethers.TypedDataDomain, types: Record<string, ethers.TypedDataField[]>, value: Record<string, unknown>): Promise<string> {
    if (!this.signer) {
      throw new Error('Signer not available');
    }
    
    return await this.signer.signTypedData(domain, types, value);
  }

  /**
   * Add event listener
   */
  on<T = unknown>(event: string, callback: EventCallback<T>): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback as EventCallback);
  }

  /**
   * Remove event listener
   */
  off<T = unknown>(event: string, callback: EventCallback<T>): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(callback as EventCallback);
    }
  }

  /**
   * Emit event
   */
  private emit<T = unknown>(event: string, data: T): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }
}

// Create singleton instance
export const blockchainProvider = new BlockchainProvider();

export default blockchainProvider;
