/**
 * Transaction Monitor for Frontend
 * Monitors transaction status and provides updates
 */

import { ethers, TransactionReceipt, TransactionResponse } from 'ethers';
import { blockchainProvider } from './provider';
import { GAS_CONFIG } from './config';

export type TransactionStatus = 'pending' | 'submitted' | 'confirmed' | 'failed';

export interface TransactionUpdate {
  txHash: string;
  status: TransactionStatus;
  confirmations: number;
  receipt?: TransactionReceipt;
  error?: string;
  gasUsed?: bigint;
  blockNumber?: number;
}

export interface TransactionCallbacks {
  onSubmitted?: (txHash: string) => void;
  onConfirmed?: (update: TransactionUpdate) => void;
  onFailed?: (error: string) => void;
  onStatusChange?: (update: TransactionUpdate) => void;
}

/**
 * TransactionMonitor class for tracking transaction status
 */
export class TransactionMonitor {
  private pendingTransactions: Map<string, TransactionCallbacks> = new Map();
  private checkInterval: ReturnType<typeof setInterval> | null = null;

  /**
   * Start monitoring a transaction
   */
  async monitorTransaction(
    tx: TransactionResponse,
    callbacks: TransactionCallbacks = {}
  ): Promise<TransactionReceipt | null> {
    const txHash = tx.hash;
    
    // Store callbacks
    this.pendingTransactions.set(txHash, callbacks);
    
    // Notify submitted
    callbacks.onSubmitted?.(txHash);
    callbacks.onStatusChange?.({
      txHash,
      status: 'submitted',
      confirmations: 0,
    });

    try {
      // Wait for confirmation
      const receipt = await this.waitForConfirmation(tx);
      
      if (receipt) {
        const update: TransactionUpdate = {
          txHash,
          status: 'confirmed',
          confirmations: 1,
          receipt,
          gasUsed: receipt.gasUsed,
          blockNumber: receipt.blockNumber,
        };
        
        callbacks.onConfirmed?.(update);
        callbacks.onStatusChange?.(update);
        
        return receipt;
      } else {
        throw new Error('Transaction failed - no receipt');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      callbacks.onFailed?.(errorMessage);
      callbacks.onStatusChange?.({
        txHash,
        status: 'failed',
        confirmations: 0,
        error: errorMessage,
      });
      
      throw error;
    } finally {
      this.pendingTransactions.delete(txHash);
    }
  }

  /**
   * Wait for transaction confirmation with timeout
   */
  async waitForConfirmation(
    tx: TransactionResponse,
    confirmations: number = GAS_CONFIG.confirmations
  ): Promise<TransactionReceipt | null> {
    const provider = blockchainProvider.getProvider();
    if (!provider) {
      throw new Error('Provider not connected');
    }

    // Create a promise that rejects after timeout
    const timeoutPromise = new Promise<null>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Transaction confirmation timeout after ${GAS_CONFIG.timeoutMs}ms`));
      }, GAS_CONFIG.timeoutMs);
    });

    try {
      // Race between confirmation and timeout
      const receipt = await Promise.race([
        tx.wait(confirmations),
        timeoutPromise,
      ]);

      return receipt;
    } catch (error) {
      if (error instanceof Error && error.message.includes('timeout')) {
        // Check if transaction is still pending
        const receipt = await provider.getTransactionReceipt(tx.hash);
        if (receipt) {
          return receipt;
        }
      }
      throw error;
    }
  }

  /**
   * Get transaction status
   */
  async getTransactionStatus(txHash: string): Promise<TransactionUpdate> {
    const provider = blockchainProvider.getProvider();
    if (!provider) {
      throw new Error('Provider not connected');
    }

    try {
      const receipt = await provider.getTransactionReceipt(txHash);
      
      if (!receipt) {
        // Transaction is pending
        return {
          txHash,
          status: 'pending',
          confirmations: 0,
        };
      }

      if (receipt.status === 0) {
        return {
          txHash,
          status: 'failed',
          confirmations: 0,
          receipt,
          error: 'Transaction reverted',
        };
      }

      return {
        txHash,
        status: 'confirmed',
        confirmations: 1,
        receipt,
        gasUsed: receipt.gasUsed,
        blockNumber: receipt.blockNumber,
      };
    } catch (error) {
      return {
        txHash,
        status: 'failed',
        confirmations: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Estimate gas for a transaction
   */
  async estimateGas(
    to: string,
    data: string,
    value: bigint = 0n
  ): Promise<bigint> {
    const provider = blockchainProvider.getProvider();
    if (!provider) {
      throw new Error('Provider not connected');
    }

    const signer = blockchainProvider.getSigner();
    if (!signer) {
      throw new Error('Signer not available');
    }

    return await provider.estimateGas({
      from: await signer.getAddress(),
      to,
      data,
      value,
    });
  }

  /**
   * Get current gas price
   */
  async getGasPrice(): Promise<{
    gasPrice: bigint;
    gasPriceGwei: number;
    maxFeePerGas?: bigint;
    maxPriorityFeePerGas?: bigint;
  }> {
    const provider = blockchainProvider.getProvider();
    if (!provider) {
      throw new Error('Provider not connected');
    }

    const feeData = await provider.getFeeData();
    
    return {
      gasPrice: feeData.gasPrice || 0n,
      gasPriceGwei: Number(ethers.formatUnits(feeData.gasPrice || 0n, 'gwei')),
      maxFeePerGas: feeData.maxFeePerGas || undefined,
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas || undefined,
    };
  }

  /**
   * Check if gas price is within acceptable range
   */
  async isGasPriceAcceptable(): Promise<{
    acceptable: boolean;
    gasPriceGwei: number;
    maxGasPriceGwei: number;
  }> {
    const { gasPriceGwei } = await this.getGasPrice();
    
    return {
      acceptable: gasPriceGwei <= GAS_CONFIG.maxGasPriceGwei,
      gasPriceGwei,
      maxGasPriceGwei: GAS_CONFIG.maxGasPriceGwei,
    };
  }

  /**
   * Start periodic check for stuck transactions
   */
  startPeriodicCheck(intervalMs: number = 30000): void {
    if (this.checkInterval) {
      this.stopPeriodicCheck();
    }

    this.checkInterval = setInterval(async () => {
      await this.checkStuckTransactions();
    }, intervalMs);
  }

  /**
   * Stop periodic check
   */
  stopPeriodicCheck(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Check for stuck transactions
   */
  private async checkStuckTransactions(): Promise<void> {
    const provider = blockchainProvider.getProvider();
    if (!provider) return;

    for (const [txHash] of this.pendingTransactions) {
      try {
        const status = await this.getTransactionStatus(txHash);
        
        // If pending for too long, notify
        if (status.status === 'pending') {
          const callbacks = this.pendingTransactions.get(txHash);
          callbacks?.onStatusChange?.(status);
        }
      } catch (error) {
        console.error(`Error checking transaction ${txHash}:`, error);
      }
    }
  }

  /**
   * Get number of pending transactions
   */
  getPendingCount(): number {
    return this.pendingTransactions.size;
  }

  /**
   * Clear all pending transactions
   */
  clearPending(): void {
    this.pendingTransactions.clear();
  }
}

// Create singleton instance
export const transactionMonitor = new TransactionMonitor();

export default transactionMonitor;
