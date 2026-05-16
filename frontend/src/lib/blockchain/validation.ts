/**
 * @fileoverview Validación de transacciones blockchain.
 *
 * Valida datos de transacciones antes de su firma, incluyendo formatos
 * de documentos, direcciones Ethereum, chain ID y precios de gas.
 */

import { ethers } from 'ethers';
import { CHAIN_CONFIG } from './config';

/** Resultado de una validación. */
export interface ValidationResult {
  /** Indica si la validación fue exitosa. */
  valid: boolean;
  /** Mensaje de error en caso de fallo. */
  error?: string;
}

/**
 * Validador de transacciones para operaciones blockchain.
 */
export class TransactionValidator {
  /**
   * Valida los datos de creación de un documento.
   * @param data - Datos de creación (docId, ipfsCid, encryptedKey).
   * @returns Resultado de la validación.
   */
  static validateDocumentCreation(data: {
    docId: string;
    ipfsCid: string;
    encryptedKey: string;
  }): ValidationResult {
    // Validar formato de docId (bytes32)
    if (!ethers.isHexString(data.docId, 32)) {
      return { valid: false, error: 'Invalid docId format. Expected bytes32 hex string.' };
    }

    // Validar CID de IPFS (comienza con Qm para CIDv0 o bafy para CIDv1)
    if (!data.ipfsCid.startsWith('Qm') && !data.ipfsCid.startsWith('bafy')) {
      return { valid: false, error: 'Invalid IPFS CID format.' };
    }

    // Validar que la clave cifrada no esté vacía
    if (!data.encryptedKey || data.encryptedKey.length === 0) {
      return { valid: false, error: 'Encrypted key is empty.' };
    }

    return { valid: true };
  }

  /**
   * Valida los datos de creación de una versión de documento.
   * @param data - Datos de la versión.
   * @returns Resultado de la validación.
   */
  static validateVersionCreation(data: {
    docId: string;
    versionId: number;
    ipfsCid: string;
    encryptedKey: string;
  }): ValidationResult {
    // Validar docId
    if (!ethers.isHexString(data.docId, 32)) {
      return { valid: false, error: 'Invalid docId format.' };
    }

    // Validar que el ID de versión sea positivo
    if (data.versionId <= 0) {
      return { valid: false, error: 'Version ID must be positive.' };
    }

    // Validar CID de IPFS
    if (!data.ipfsCid.startsWith('Qm') && !data.ipfsCid.startsWith('bafy')) {
      return { valid: false, error: 'Invalid IPFS CID format.' };
    }

    // Validar clave cifrada
    if (!data.encryptedKey || data.encryptedKey.length === 0) {
      return { valid: false, error: 'Encrypted key is empty.' };
    }

    return { valid: true };
  }

  /**
   * Valida los datos de creación de un permiso de compartición.
   * @param data - Datos de la compartición.
   * @returns Resultado de la validación.
   */
  static validateShareCreation(data: {
    docId: string;
    sharedWith: string;
    role: number;
  }): ValidationResult {
    // Validar docId
    if (!ethers.isHexString(data.docId, 32)) {
      return { valid: false, error: 'Invalid docId format.' };
    }

    // Validar dirección del destinatario
    if (!ethers.isAddress(data.sharedWith)) {
      return { valid: false, error: 'Invalid Ethereum address for sharedWith.' };
    }

    // Validar rol (0 = READ, 1 = WRITE)
    if (data.role !== 0 && data.role !== 1) {
      return { valid: false, error: 'Invalid role. Must be 0 (READ) or 1 (WRITE).' };
    }

    return { valid: true };
  }

  /**
   * Valida los datos de creación de una firma.
   * @param data - Datos de la firma.
   * @returns Resultado de la validación.
   */
  static validateSignatureCreation(data: {
    docId: string;
    versionId: number;
    signature: string;
  }): ValidationResult {
    // Validar docId
    if (!ethers.isHexString(data.docId, 32)) {
      return { valid: false, error: 'Invalid docId format.' };
    }

    // Validar ID de versión
    if (data.versionId <= 0) {
      return { valid: false, error: 'Version ID must be positive.' };
    }

    // Validar formato de firma (65 bytes = 130 hex chars + prefijo 0x)
    if (!ethers.isHexString(data.signature) || data.signature.length !== 132) {
      return { valid: false, error: 'Invalid signature format. Expected 65-byte hex string.' };
    }

    return { valid: true };
  }

  /**
   * Valida que el chain ID de la wallet coincida con la red esperada.
   * @param provider - Proveedor ethers.js.
   * @returns Resultado de la validación.
   */
  static async validateChainId(provider: ethers.BrowserProvider): Promise<ValidationResult> {
    try {
      const network = await provider.getNetwork();
      const currentChainId = Number(network.chainId);
      const expectedChainId = CHAIN_CONFIG.chainId;

      if (currentChainId !== expectedChainId) {
        return {
          valid: false,
          error: `Wrong network. Expected chain ID ${expectedChainId}, got ${currentChainId}. Please switch to the correct network.`
        };
      }

      return { valid: true };
    } catch (error) {
      return { valid: false, error: 'Failed to validate chain ID.' };
    }
  }

  /**
   * Valida que el precio del gas esté dentro del rango aceptable.
   * @param provider - Proveedor ethers.js.
   * @param maxGwei - Precio máximo aceptable en Gwei.
   * @returns Resultado de la validación con el precio actual.
   */
  static async validateGasPrice(
    provider: ethers.BrowserProvider,
    maxGwei: number = 100
  ): Promise<ValidationResult & { gasPriceGwei?: number }> {
    try {
      const feeData = await provider.getFeeData();
      const gasPrice = feeData.gasPrice;

      if (!gasPrice) {
        return { valid: false, error: 'Could not fetch gas price.' };
      }

      const gasPriceGwei = Number(ethers.formatUnits(gasPrice, 'gwei'));

      if (gasPriceGwei > maxGwei) {
        return {
          valid: false,
          error: `Gas price is too high: ${gasPriceGwei.toFixed(2)} Gwei (max: ${maxGwei} Gwei). Try again later.`,
          gasPriceGwei
        };
      }

      return { valid: true, gasPriceGwei };
    } catch (error) {
      return { valid: false, error: 'Failed to validate gas price.' };
    }
  }

  /**
   * Valida el formato de una dirección Ethereum.
   * @param address - Dirección a validar.
   * @returns Resultado de la validación.
   */
  static validateAddress(address: string): ValidationResult {
    if (!ethers.isAddress(address)) {
      return { valid: false, error: 'Invalid Ethereum address format.' };
    }
    return { valid: true };
  }

  /**
   * Valida el formato bytes32.
   * @param value - Valor a validar.
   * @returns Resultado de la validación.
   */
  static validateBytes32(value: string): ValidationResult {
    if (!ethers.isHexString(value, 32)) {
      return { valid: false, error: 'Invalid bytes32 format.' };
    }
    return { valid: true };
  }
}

/**
 * Estima el gas necesario para una transacción y calcula el costo total.
 * @param provider - Proveedor ethers.js.
 * @param tx - Solicitud de transacción.
 * @returns Límite de gas, precio de gas y costo estimado.
 */
export async function estimateTransactionGas(
  provider: ethers.BrowserProvider,
  tx: ethers.TransactionRequest
): Promise<{ gasLimit: bigint; gasPrice: bigint; estimatedCost: bigint }> {
  const gasLimit = await provider.estimateGas(tx);
  const feeData = await provider.getFeeData();
  const gasPrice = feeData.gasPrice || 0n;
  const estimatedCost = gasLimit * gasPrice;

  return { gasLimit, gasPrice, estimatedCost };
}

/**
 * Formatea un costo de gas para su visualización.
 * @param wei - Cantidad en wei.
 * @returns Cadena legible en ETH o Gwei.
 */
export function formatGasCost(wei: bigint): string {
  const gwei = Number(ethers.formatUnits(wei, 'gwei'));
  const eth = Number(ethers.formatEther(wei));

  if (eth > 0.001) {
    return `${eth.toFixed(6)} ETH`;
  }
  return `${gwei.toFixed(2)} Gwei`;
}
