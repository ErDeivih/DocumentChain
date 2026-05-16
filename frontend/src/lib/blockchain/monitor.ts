/**
 * @fileoverview Monitor de transacciones para el frontend.
 *
 * Rastrea el estado de las transacciones blockchain, notifica mediante
 * callbacks y proporciona utilidades de gas y verificación periódica.
 */

import { ethers, TransactionReceipt, TransactionResponse } from 'ethers';
import { blockchainProvider } from './provider';
import { GAS_CONFIG } from './config';

/** Estado posible de una transacción. */
export type TransactionStatus = 'pending' | 'submitted' | 'confirmed' | 'failed';

/** Actualización de estado de una transacción. */
export interface TransactionUpdate {
  /** Hash de la transacción. */
  txHash: string;
  /** Estado actual. */
  status: TransactionStatus;
  /** Número de confirmaciones recibidas. */
  confirmations: number;
  /** Recibo de transacción (si está confirmada). */
  receipt?: TransactionReceipt;
  /** Mensaje de error (si falló). */
  error?: string;
  /** Gas consumido. */
  gasUsed?: bigint;
  /** Número de bloque donde fue incluida. */
  blockNumber?: number;
}

/** Conjunto de callbacks para notificaciones de transacción. */
export interface TransactionCallbacks {
  /** Se invoca cuando la transacción es enviada a la red. */
  onSubmitted?: (txHash: string) => void;
  /** Se invoca cuando la transacción es confirmada. */
  onConfirmed?: (update: TransactionUpdate) => void;
  /** Se invoca cuando la transacción falla. */
  onFailed?: (error: string) => void;
  /** Se invoca ante cualquier cambio de estado. */
  onStatusChange?: (update: TransactionUpdate) => void;
}

/**
 * Monitor de transacciones para seguimiento de estado y notificaciones.
 */
export class TransactionMonitor {
  private pendingTransactions: Map<string, TransactionCallbacks> = new Map();
  private checkInterval: ReturnType<typeof setInterval> | null = null;

  /**
   * Inicia el monitoreo de una transacción.
   *
   * Flujo:
   * 1. Almacena los callbacks.
   * 2. Notifica el estado "submitted".
   * 3. Espera confirmación mediante `waitForConfirmation`.
   * 4. Notifica éxito o fallo y limpia el registro.
   *
   * @param tx - Transacción enviada.
   * @param callbacks - Callbacks opcionales para notificaciones.
   * @returns Recibo de transacción confirmada.
   */
  async monitorTransaction(
    tx: TransactionResponse,
    callbacks: TransactionCallbacks = {}
  ): Promise<TransactionReceipt | null> {
    const txHash = tx.hash;

    // Almacenar callbacks
    this.pendingTransactions.set(txHash, callbacks);

    // Notificar envío
    callbacks.onSubmitted?.(txHash);
    callbacks.onStatusChange?.({
      txHash,
      status: 'submitted',
      confirmations: 0,
    });

    try {
      // Esperar confirmación
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
   * Espera la confirmación de una transacción con tiempo de espera.
   *
   * Utiliza una carrera entre la confirmación de ethers.js y un timeout
   * configurado en `GAS_CONFIG.timeoutMs`.
   *
   * @param tx - Transacción a esperar.
   * @param confirmations - Número de confirmaciones requeridas.
   * @returns Recibo de transacción o `null`.
   */
  async waitForConfirmation(
    tx: TransactionResponse,
    confirmations: number = GAS_CONFIG.confirmations
  ): Promise<TransactionReceipt | null> {
    const provider = blockchainProvider.getProvider();
    if (!provider) {
      throw new Error('Provider not connected');
    }

    // Promesa que rechaza tras el tiempo de espera
    const timeoutPromise = new Promise<null>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Transaction confirmation timeout after ${GAS_CONFIG.timeoutMs}ms`));
      }, GAS_CONFIG.timeoutMs);
    });

    try {
      // Competir entre confirmación y timeout
      const receipt = await Promise.race([
        tx.wait(confirmations),
        timeoutPromise,
      ]);

      return receipt;
    } catch (error) {
      if (error instanceof Error && error.message.includes('timeout')) {
        // Comprobar si la transacción sigue pendiente
        const receipt = await provider.getTransactionReceipt(tx.hash);
        if (receipt) {
          return receipt;
        }
      }
      throw error;
    }
  }

  /**
   * Obtiene el estado actual de una transacción.
   * @param txHash - Hash de la transacción.
   * @returns Estado actual de la transacción.
   */
  async getTransactionStatus(txHash: string): Promise<TransactionUpdate> {
    const provider = blockchainProvider.getProvider();
    if (!provider) {
      throw new Error('Provider not connected');
    }

    try {
      const receipt = await provider.getTransactionReceipt(txHash);

      if (!receipt) {
        // Transacción aún pendiente
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
   * Estima el gas para una transacción.
   * @param to - Dirección destino.
   * @param data - Datos de la transacción.
   * @param value - Valor en wei (predeterminado: 0).
   * @returns Estimación de gas.
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
   * Obtiene el precio actual del gas y las tarifas máximas.
   * @returns Precio del gas en wei y Gwei, y tarifas opcionales EIP-1559.
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
   * Verifica si el precio del gas es aceptable.
   * @returns Indicador de aceptabilidad y valores comparativos.
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
   * Inicia la verificación periódica de transacciones atascadas.
   * @param intervalMs - Intervalo de verificación en milisegundos.
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
   * Detiene la verificación periódica.
   */
  stopPeriodicCheck(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Comprueba transacciones atascadas y notifica cambios de estado.
   */
  private async checkStuckTransactions(): Promise<void> {
    const provider = blockchainProvider.getProvider();
    if (!provider) return;

    for (const [txHash] of this.pendingTransactions) {
      try {
        const status = await this.getTransactionStatus(txHash);

        // Si sigue pendiente demasiado tiempo, notificar
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
   * Obtiene el número de transacciones pendientes.
   * @returns Cantidad de transacciones en seguimiento.
   */
  getPendingCount(): number {
    return this.pendingTransactions.size;
  }

  /**
   * Limpia todas las transacciones pendientes.
   */
  clearPending(): void {
    this.pendingTransactions.clear();
  }
}

// Instancia singleton
export const transactionMonitor = new TransactionMonitor();

export default transactionMonitor;
