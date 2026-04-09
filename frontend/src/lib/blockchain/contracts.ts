/**
 * Blockchain Contract Wrappers for Frontend
 * Single consolidated DocumentRegistry contract wrapper.
 */

import { ethers, Contract, TransactionResponse, TransactionReceipt, BytesLike } from 'ethers';
import { CONTRACTS, GAS_CONFIG } from './config';
import type { JsonRpcSigner } from 'ethers';

// DocumentRole enum (must match smart contract: NONE=0, VIEWER=1, EDITOR=2, OWNER=3)
export enum DocumentStatus {
  ACTIVE = 0,
  ARCHIVED = 1,
  DELETED = 2,
}

export enum AccessRole {
  NONE = 0,
  VIEWER = 1,
  EDITOR = 2,
  OWNER = 3,
}

// Structs returned by the contract

export interface DocumentStruct {
  docId: string;
  owner: string;
  createdAt: bigint;
  updatedAt: bigint;
  currentVersion: bigint;
  latestVersion: bigint;
  isArchived: boolean;
  isDeleted: boolean;
}

export interface VersionStruct {
  versionNumber: bigint;
  ipfsCid: string;
  encryptedKeyHash: string;
  createdBy: string;
  createdAt: bigint;
  isOperational: boolean;
  restoredFrom: bigint;
}

export interface SignatureStruct {
  signer: string;
  signature: BytesLike;
  message: string;
  comment: string;
  timestamp: bigint;
}

/**
 * Base contract wrapper
 */
abstract class BaseContract {
  protected contract: Contract;
  protected signer: JsonRpcSigner;
  protected address: string;

  constructor(contractName: string, signer: JsonRpcSigner) {
    const config = CONTRACTS[contractName];
    if (!config) {
      throw new Error(`Contract ${contractName} not found in CONTRACTS config`);
    }
    
    this.address = config.address;
    this.signer = signer;
    this.contract = new Contract(config.address, config.abi, signer);
  }

  /**
   * Wait for transaction confirmation
   */
  protected async waitForConfirmation(
    tx: TransactionResponse,
    confirmations: number = GAS_CONFIG.confirmations
  ): Promise<TransactionReceipt> {
    const receipt = await tx.wait(confirmations);
    if (!receipt) {
      throw new Error('Transaction failed - no receipt');
    }
    return receipt;
  }

  /**
   * Get contract address
   */
  getAddress(): string {
    return this.address;
  }

  /**
   * Get contract instance
   */
  getContract(): Contract {
    return this.contract;
  }
}

/**
 * Document Registry Contract Wrapper
 * Consolidated wrapper for the single DocumentRegistry smart contract.
 * All document lifecycle operations go through this class.
 */
export class DocumentRegistryContract extends BaseContract {
  constructor(signer: JsonRpcSigner) {
    super('DocumentRegistry', signer);
  }

  // ── helpers ──────────────────────────────────────────────────────────────

  private toBytes32(id: string): `0x${string}` {
    return ethers.isHexString(id, 32) ? (id as `0x${string}`) : (ethers.id(id) as `0x${string}`);
  }

  // ── write: document lifecycle ─────────────────────────────────────────────

  async createDocument(
    docId: string,
    ipfsCid: string,
      encryptedKeyHash: string = ethers.ZeroHash,
  ): Promise<TransactionResponse> {
      return this.contract.createDocument(this.toBytes32(docId), ipfsCid, encryptedKeyHash ?? ethers.ZeroHash);
  }

  async createDocumentAndWait(
    docId: string,
    ipfsCid: string,
      encryptedKeyHash: string = ethers.ZeroHash,
  ): Promise<TransactionReceipt> {
    const tx = await this.createDocument(docId, ipfsCid, encryptedKeyHash);
    return this.waitForConfirmation(tx);
  }

  async createVersion(
    docId: string,
    ipfsCid: string,
      encryptedKeyHash: string = ethers.ZeroHash,
  ): Promise<TransactionResponse> {
      return this.contract.createVersion(this.toBytes32(docId), ipfsCid, encryptedKeyHash ?? ethers.ZeroHash);
  }

  async createVersionAndWait(
    docId: string,
    ipfsCid: string,
      encryptedKeyHash: string = ethers.ZeroHash,
  ): Promise<TransactionReceipt> {
    const tx = await this.createVersion(docId, ipfsCid, encryptedKeyHash);
    return this.waitForConfirmation(tx);
  }

  async setArchiveStatus(docId: string, archived: boolean): Promise<TransactionResponse> {
    return this.contract.setArchiveStatus(this.toBytes32(docId), archived);
  }

  async deleteDocument(docId: string): Promise<TransactionResponse> {
    return this.contract.deleteDocument(this.toBytes32(docId));
  }

  async restoreVersion(docId: string, versionToRestore: number): Promise<TransactionResponse> {
    return this.contract.restoreVersion(this.toBytes32(docId), versionToRestore);
  }

  async setOperationalVersion(docId: string, versionNumber: number): Promise<TransactionResponse> {
    return this.contract.setOperationalVersion(this.toBytes32(docId), versionNumber);
  }

  // ── write: sharing & permissions ──────────────────────────────────────────

  async shareDocument(
    docId: string,
    userAddress: string,
    role: AccessRole
  ): Promise<TransactionResponse> {
    if (!ethers.isAddress(userAddress)) throw new Error('Invalid Ethereum address');
    return this.contract.shareDocument(this.toBytes32(docId), userAddress, role);
  }

  async shareDocumentAndWait(
    docId: string,
    userAddress: string,
    role: AccessRole
  ): Promise<TransactionReceipt> {
    const tx = await this.shareDocument(docId, userAddress, role);
    return this.waitForConfirmation(tx);
  }

  async revokePermission(docId: string, userAddress: string): Promise<TransactionResponse> {
    if (!ethers.isAddress(userAddress)) throw new Error('Invalid Ethereum address');
    return this.contract.revokePermission(this.toBytes32(docId), userAddress);
  }

  async transferOwnership(docId: string, newOwner: string): Promise<TransactionResponse> {
    if (!ethers.isAddress(newOwner)) throw new Error('Invalid Ethereum address');
    return this.contract.transferOwnership(this.toBytes32(docId), newOwner);
  }

  async transferOwnershipAndWait(docId: string, newOwner: string): Promise<TransactionReceipt> {
    const tx = await this.transferOwnership(docId, newOwner);
    return this.waitForConfirmation(tx);
  }

  // ── write: signing ────────────────────────────────────────────────────────

  async signDocument(
    docId: string,
    versionNumber: number,
    signature: BytesLike,
    message: string,
    comment: string = ''
  ): Promise<TransactionResponse> {
    return this.contract.signDocument(this.toBytes32(docId), versionNumber, signature, message, comment);
  }

  async signDocumentAndWait(
    docId: string,
    versionNumber: number,
    signature: BytesLike,
    message: string,
    comment: string = ''
  ): Promise<TransactionReceipt> {
    const tx = await this.signDocument(docId, versionNumber, signature, message, comment);
    return this.waitForConfirmation(tx);
  }

  async suspendMyself(): Promise<TransactionResponse> {
    return this.contract.suspendMyself();
  }

  async unsuspendMyself(): Promise<TransactionResponse> {
    return this.contract.unsuspendMyself();
  }

  // ── read functions ────────────────────────────────────────────────────────

  async getDocument(docId: string): Promise<DocumentStruct> {
    return this.contract.getDocument(this.toBytes32(docId));
  }

  async getVersion(docId: string, versionNumber: number): Promise<VersionStruct> {
    return this.contract.getVersion(this.toBytes32(docId), versionNumber);
  }

  async getVersionSignatures(docId: string, versionNumber: number): Promise<SignatureStruct[]> {
    return this.contract.getVersionSignatures(this.toBytes32(docId), versionNumber);
  }

  async getUserPermission(docId: string, userAddress: string): Promise<number> {
    return this.contract.getUserPermission(this.toBytes32(docId), userAddress);
  }

  async getUserDocuments(userAddress: string): Promise<string[]> {
    return this.contract.getUserDocuments(userAddress);
  }

  async getUserDocumentCount(userAddress: string): Promise<bigint> {
    return this.contract.getUserDocumentCount(userAddress);
  }

  async getDocumentUsers(docId: string): Promise<string[]> {
    return this.contract.getDocumentUsers(this.toBytes32(docId));
  }

  async canView(docId: string, userAddress: string): Promise<boolean> {
    return this.contract.canView(this.toBytes32(docId), userAddress);
  }

  async canEdit(docId: string, userAddress: string): Promise<boolean> {
    return this.contract.canEdit(this.toBytes32(docId), userAddress);
  }

  async isOwner(docId: string, userAddress: string): Promise<boolean> {
    return this.contract.isOwner(this.toBytes32(docId), userAddress);
  }

  async totalDocuments(): Promise<bigint> {
    return this.contract.totalDocuments();
  }

  async isPaused(): Promise<boolean> {
    return this.contract.isPaused();
  }

  async isUserSuspended(userAddress: string): Promise<boolean> {
    return this.contract.isUserSuspended(userAddress);
  }
}

/**
 * Create the single DocumentRegistry contract instance for a connected signer.
 */
export function createContracts(signer: JsonRpcSigner) {
  return {
    registry: new DocumentRegistryContract(signer),
  };
}

export type Contracts = ReturnType<typeof createContracts>;

