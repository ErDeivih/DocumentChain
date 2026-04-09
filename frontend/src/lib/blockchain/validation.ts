/**
 * Transaction Validation for Blockchain Operations
 * Validates transaction data before signing
 */

import { ethers } from 'ethers';
import { CHAIN_CONFIG } from './config';

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Transaction Validator class for validating blockchain transaction data
 */
export class TransactionValidator {
  /**
   * Validate document creation transaction data
   */
  static validateDocumentCreation(data: {
    docId: string;
    ipfsCid: string;
    encryptedKey: string;
  }): ValidationResult {
    // Validate docId format (bytes32)
    if (!ethers.isHexString(data.docId, 32)) {
      return { valid: false, error: 'Invalid docId format. Expected bytes32 hex string.' };
    }

    // Validate IPFS CID (starts with Qm for CIDv0 or bafy for CIDv1)
    if (!data.ipfsCid.startsWith('Qm') && !data.ipfsCid.startsWith('bafy')) {
      return { valid: false, error: 'Invalid IPFS CID format.' };
    }

    // Validate encrypted key is not empty
    if (!data.encryptedKey || data.encryptedKey.length === 0) {
      return { valid: false, error: 'Encrypted key is empty.' };
    }

    return { valid: true };
  }

  /**
   * Validate document version creation transaction data
   */
  static validateVersionCreation(data: {
    docId: string;
    versionId: number;
    ipfsCid: string;
    encryptedKey: string;
  }): ValidationResult {
    // Validate docId
    if (!ethers.isHexString(data.docId, 32)) {
      return { valid: false, error: 'Invalid docId format.' };
    }

    // Validate version ID is positive
    if (data.versionId <= 0) {
      return { valid: false, error: 'Version ID must be positive.' };
    }

    // Validate IPFS CID
    if (!data.ipfsCid.startsWith('Qm') && !data.ipfsCid.startsWith('bafy')) {
      return { valid: false, error: 'Invalid IPFS CID format.' };
    }

    // Validate encrypted key
    if (!data.encryptedKey || data.encryptedKey.length === 0) {
      return { valid: false, error: 'Encrypted key is empty.' };
    }

    return { valid: true };
  }

  /**
   * Validate share creation transaction data
   */
  static validateShareCreation(data: {
    docId: string;
    sharedWith: string;
    role: number;
  }): ValidationResult {
    // Validate docId
    if (!ethers.isHexString(data.docId, 32)) {
      return { valid: false, error: 'Invalid docId format.' };
    }

    // Validate sharedWith address
    if (!ethers.isAddress(data.sharedWith)) {
      return { valid: false, error: 'Invalid Ethereum address for sharedWith.' };
    }

    // Validate role (0 = READ, 1 = WRITE)
    if (data.role !== 0 && data.role !== 1) {
      return { valid: false, error: 'Invalid role. Must be 0 (READ) or 1 (WRITE).' };
    }

    return { valid: true };
  }

  /**
   * Validate signature creation transaction data
   */
  static validateSignatureCreation(data: {
    docId: string;
    versionId: number;
    signature: string;
  }): ValidationResult {
    // Validate docId
    if (!ethers.isHexString(data.docId, 32)) {
      return { valid: false, error: 'Invalid docId format.' };
    }

    // Validate version ID
    if (data.versionId <= 0) {
      return { valid: false, error: 'Version ID must be positive.' };
    }

    // Validate signature format (65 bytes = 130 hex chars + 0x prefix)
    if (!ethers.isHexString(data.signature) || data.signature.length !== 132) {
      return { valid: false, error: 'Invalid signature format. Expected 65-byte hex string.' };
    }

    return { valid: true };
  }

  /**
   * Validate chain ID matches expected network
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
   * Validate gas price is within acceptable range
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
   * Validate wallet address format
   */
  static validateAddress(address: string): ValidationResult {
    if (!ethers.isAddress(address)) {
      return { valid: false, error: 'Invalid Ethereum address format.' };
    }
    return { valid: true };
  }

  /**
   * Validate bytes32 format
   */
  static validateBytes32(value: string): ValidationResult {
    if (!ethers.isHexString(value, 32)) {
      return { valid: false, error: 'Invalid bytes32 format.' };
    }
    return { valid: true };
  }
}

/**
 * Gas estimation helper
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
 * Format gas cost for display
 */
export function formatGasCost(wei: bigint): string {
  const gwei = Number(ethers.formatUnits(wei, 'gwei'));
  const eth = Number(ethers.formatEther(wei));

  if (eth > 0.001) {
    return `${eth.toFixed(6)} ETH`;
  }
  return `${gwei.toFixed(2)} Gwei`;
}
