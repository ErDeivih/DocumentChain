/**
 * @fileoverview Wrappers de contratos inteligentes para el frontend.
 *
 * Proporciona una interfaz tipada para interactuar con el contrato
 * consolidado DocumentRegistry, incluyendo operaciones de ciclo de vida
 * de documentos, permisos, firma y consultas de estado.
 */

import { ethers, Contract, TransactionResponse, TransactionReceipt, BytesLike } from 'ethers';
import { CONTRACTS, GAS_CONFIG } from './config';
import type { JsonRpcSigner } from 'ethers';

// Enumeración de estados de documento (debe coincidir con el contrato: NONE=0, VIEWER=1, EDITOR=2, OWNER=3)
/** Estado de un documento en el contrato. */
export enum DocumentStatus {
  ACTIVE = 0,
  ARCHIVED = 1,
  DELETED = 2,
}

/** Rol de acceso sobre un documento. */
export enum AccessRole {
  NONE = 0,
  VIEWER = 1,
  EDITOR = 2,
  OWNER = 3,
}

// Estructuras devueltas por el contrato

/** Estructura de un documento en blockchain. */
export interface DocumentStruct {
  /** Identificador del documento (bytes32). */
  docId: string;
  /** Dirección del propietario. */
  owner: string;
  /** Marca de tiempo de creación. */
  createdAt: bigint;
  /** Marca de timestamp de la última actualización. */
  updatedAt: bigint;
  /** Versión operativa actual. */
  currentVersion: bigint;
  /** Última versión creada. */
  latestVersion: bigint;
  /** Indica si el documento está archivado. */
  isArchived: boolean;
  /** Indica si el documento está eliminado. */
  isDeleted: boolean;
}

/** Estructura de una versión de documento. */
export interface VersionStruct {
  /** Número de versión. */
  versionNumber: bigint;
  /** CID de IPFS con el contenido cifrado. */
  ipfsCid: string;
  /** Hash de la clave simétrica cifrada. */
  encryptedKeyHash: string;
  /** Dirección del creador de la versión. */
  createdBy: string;
  /** Marca de tiempo de creación. */
  createdAt: bigint;
  /** Indica si es la versión operativa. */
  isOperational: boolean;
  /** Versión desde la que se restauró (0 si no aplica). */
  restoredFrom: bigint;
}

/** Estructura de una firma sobre una versión. */
export interface SignatureStruct {
  /** Dirección del firmante. */
  signer: string;
  /** Firma criptográfica. */
  signature: BytesLike;
  /** Mensaje firmado. */
  message: string;
  /** Comentario asociado a la firma. */
  comment: string;
  /** Marca de tiempo de la firma. */
  timestamp: bigint;
}

/**
 * Clase base para wrappers de contratos.
 */
abstract class BaseContract {
  protected contract: Contract;
  protected signer: JsonRpcSigner;
  protected address: string;

  /**
   * @param contractName - Nombre del contrato en la configuración.
   * @param signer - Firmante de ethers.js.
   */
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
   * Espera la confirmación de una transacción.
   * @param tx - Transacción enviada.
   * @param confirmations - Número de confirmaciones requeridas.
   * @returns Recibo de la transacción confirmada.
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
   * Obtiene la dirección del contrato.
   * @returns Dirección Ethereum del contrato.
   */
  getAddress(): string {
    return this.address;
  }

  /**
   * Obtiene la instancia del contrato ethers.js.
   * @returns Instancia de Contract.
   */
  getContract(): Contract {
    return this.contract;
  }
}

/**
 * Wrapper del contrato DocumentRegistry.
 *
 * Centraliza todas las operaciones del ciclo de vida de documentos,
 * permisos de acceso y firmas sobre el contrato inteligente.
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

  /**
   * Crea un nuevo documento en el contrato.
   * @param docId - Identificador del documento.
   * @param ipfsCid - CID de IPFS con el contenido cifrado.
   * @param encryptedKeyHash - Hash de la clave simétrica cifrada.
   * @returns Respuesta de transacción.
   */
  async createDocument(
    docId: string,
    ipfsCid: string,
    encryptedKeyHash: string = ethers.ZeroHash,
  ): Promise<TransactionResponse> {
    return this.contract.createDocument(this.toBytes32(docId), ipfsCid, encryptedKeyHash ?? ethers.ZeroHash);
  }

  /**
   * Crea un documento y espera su confirmación.
   * @param docId - Identificador del documento.
   * @param ipfsCid - CID de IPFS.
   * @param encryptedKeyHash - Hash de la clave cifrada.
   * @returns Recibo de transacción confirmada.
   */
  async createDocumentAndWait(
    docId: string,
    ipfsCid: string,
    encryptedKeyHash: string = ethers.ZeroHash,
  ): Promise<TransactionReceipt> {
    const tx = await this.createDocument(docId, ipfsCid, encryptedKeyHash);
    return this.waitForConfirmation(tx);
  }

  /**
   * Crea una nueva versión de un documento existente.
   * @param docId - Identificador del documento.
   * @param ipfsCid - CID de IPFS con la nueva versión.
   * @param encryptedKeyHash - Hash de la clave cifrada.
   * @returns Respuesta de transacción.
   */
  async createVersion(
    docId: string,
    ipfsCid: string,
    encryptedKeyHash: string = ethers.ZeroHash,
  ): Promise<TransactionResponse> {
    return this.contract.createVersion(this.toBytes32(docId), ipfsCid, encryptedKeyHash ?? ethers.ZeroHash);
  }

  /**
   * Crea una versión y espera su confirmación.
   * @param docId - Identificador del documento.
   * @param ipfsCid - CID de IPFS.
   * @param encryptedKeyHash - Hash de la clave cifrada.
   * @returns Recibo de transacción confirmada.
   */
  async createVersionAndWait(
    docId: string,
    ipfsCid: string,
    encryptedKeyHash: string = ethers.ZeroHash,
  ): Promise<TransactionReceipt> {
    const tx = await this.createVersion(docId, ipfsCid, encryptedKeyHash);
    return this.waitForConfirmation(tx);
  }

  /**
   * Establece el estado de archivado de un documento.
   * @param docId - Identificador del documento.
   * @param archived - `true` para archivar; `false` para desarchivar.
   * @returns Respuesta de transacción.
   */
  async setArchiveStatus(docId: string, archived: boolean): Promise<TransactionResponse> {
    return this.contract.setArchiveStatus(this.toBytes32(docId), archived);
  }

  /**
   * Elimina lógicamente un documento.
   * @param docId - Identificador del documento.
   * @returns Respuesta de transacción.
   */
  async deleteDocument(docId: string): Promise<TransactionResponse> {
    return this.contract.deleteDocument(this.toBytes32(docId));
  }

  /**
   * Restaura una versión anterior como nueva versión operativa.
   * @param docId - Identificador del documento.
   * @param versionToRestore - Número de versión a restaurar.
   * @returns Respuesta de transacción.
   */
  async restoreVersion(docId: string, versionToRestore: number): Promise<TransactionResponse> {
    return this.contract.restoreVersion(this.toBytes32(docId), versionToRestore);
  }

  /**
   * Establece la versión operativa de un documento.
   * @param docId - Identificador del documento.
   * @param versionNumber - Número de versión a establecer como operativa.
   * @returns Respuesta de transacción.
   */
  async setOperationalVersion(docId: string, versionNumber: number): Promise<TransactionResponse> {
    return this.contract.setOperationalVersion(this.toBytes32(docId), versionNumber);
  }

  // ── write: sharing & permissions ──────────────────────────────────────────

  /**
   * Comparte un documento con un usuario otorgándole un rol.
   * @param docId - Identificador del documento.
   * @param userAddress - Dirección Ethereum del usuario destinatario.
   * @param role - Rol de acceso a otorgar.
   * @returns Respuesta de transacción.
   */
  async shareDocument(
    docId: string,
    userAddress: string,
    role: AccessRole
  ): Promise<TransactionResponse> {
    if (!ethers.isAddress(userAddress)) throw new Error('Invalid Ethereum address');
    return this.contract.shareDocument(this.toBytes32(docId), userAddress, role);
  }

  /**
   * Comparte un documento y espera confirmación.
   * @param docId - Identificador del documento.
   * @param userAddress - Dirección del usuario destinatario.
   * @param role - Rol de acceso.
   * @returns Recibo de transacción confirmada.
   */
  async shareDocumentAndWait(
    docId: string,
    userAddress: string,
    role: AccessRole
  ): Promise<TransactionReceipt> {
    const tx = await this.shareDocument(docId, userAddress, role);
    return this.waitForConfirmation(tx);
  }

  /**
   * Revoca los permisos de un usuario sobre un documento.
   * @param docId - Identificador del documento.
   * @param userAddress - Dirección del usuario a revocar.
   * @returns Respuesta de transacción.
   */
  async revokePermission(docId: string, userAddress: string): Promise<TransactionResponse> {
    if (!ethers.isAddress(userAddress)) throw new Error('Invalid Ethereum address');
    return this.contract.revokePermission(this.toBytes32(docId), userAddress);
  }

  /**
   * Transfiere la propiedad de un documento a otra dirección.
   * @param docId - Identificador del documento.
   * @param newOwner - Dirección del nuevo propietario.
   * @returns Respuesta de transacción.
   */
  async transferOwnership(docId: string, newOwner: string): Promise<TransactionResponse> {
    if (!ethers.isAddress(newOwner)) throw new Error('Invalid Ethereum address');
    return this.contract.transferOwnership(this.toBytes32(docId), newOwner);
  }

  /**
   * Transfiere la propiedad y espera confirmación.
   * @param docId - Identificador del documento.
   * @param newOwner - Dirección del nuevo propietario.
   * @returns Recibo de transacción confirmada.
   */
  async transferOwnershipAndWait(docId: string, newOwner: string): Promise<TransactionReceipt> {
    const tx = await this.transferOwnership(docId, newOwner);
    return this.waitForConfirmation(tx);
  }

  // ── write: signing ────────────────────────────────────────────────────────

  /**
   * Firma una versión específica de un documento.
   * @param docId - Identificador del documento.
   * @param versionNumber - Número de versión a firmar.
   * @param signature - Firma criptográfica.
   * @param message - Mensaje firmado.
   * @param comment - Comentario opcional asociado.
   * @returns Respuesta de transacción.
   */
  async signDocument(
    docId: string,
    versionNumber: number,
    signature: BytesLike,
    message: string,
    comment: string = ''
  ): Promise<TransactionResponse> {
    return this.contract.signDocument(this.toBytes32(docId), versionNumber, signature, message, comment);
  }

  /**
   * Firma una versión y espera confirmación.
   * @param docId - Identificador del documento.
   * @param versionNumber - Número de versión.
   * @param signature - Firma criptográfica.
   * @param message - Mensaje firmado.
   * @param comment - Comentario opcional.
   * @returns Recibo de transacción confirmada.
   */
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

  // ── read functions ────────────────────────────────────────────────────────

  /**
   * Obtiene los datos de un documento.
   * @param docId - Identificador del documento.
   * @returns Estructura del documento.
   */
  async getDocument(docId: string): Promise<DocumentStruct> {
    return this.contract.getDocument(this.toBytes32(docId));
  }

  /**
   * Obtiene los datos de una versión específica.
   * @param docId - Identificador del documento.
   * @param versionNumber - Número de versión.
   * @returns Estructura de la versión.
   */
  async getVersion(docId: string, versionNumber: number): Promise<VersionStruct> {
    return this.contract.getVersion(this.toBytes32(docId), versionNumber);
  }

  /**
   * Obtiene las firmas de una versión.
   * @param docId - Identificador del documento.
   * @param versionNumber - Número de versión.
   * @returns Lista de firmas.
   */
  async getVersionSignatures(docId: string, versionNumber: number): Promise<SignatureStruct[]> {
    return this.contract.getVersionSignatures(this.toBytes32(docId), versionNumber);
  }

  /**
   * Obtiene el rol de un usuario sobre un documento.
   * @param docId - Identificador del documento.
   * @param userAddress - Dirección del usuario.
   * @returns Valor numérico del rol (AccessRole).
   */
  async getUserPermission(docId: string, userAddress: string): Promise<number> {
    return this.contract.getUserPermission(this.toBytes32(docId), userAddress);
  }

  /**
   * Obtiene los documentos asociados a un usuario.
   * @param userAddress - Dirección del usuario.
   * @returns Lista de identificadores de documento (bytes32[]).
   */
  async getUserDocuments(userAddress: string): Promise<string[]> {
    return this.contract.getUserDocuments(userAddress);
  }

  /**
   * Obtiene el número de documentos de un usuario.
   * @param userAddress - Dirección del usuario.
   * @returns Cantidad de documentos.
   */
  async getUserDocumentCount(userAddress: string): Promise<bigint> {
    return this.contract.getUserDocumentCount(userAddress);
  }

  /**
   * Obtiene los usuarios con acceso a un documento.
   * @param docId - Identificador del documento.
   * @returns Lista de direcciones Ethereum.
   */
  async getDocumentUsers(docId: string): Promise<string[]> {
    return this.contract.getDocumentUsers(this.toBytes32(docId));
  }

  /**
   * Verifica si un usuario puede visualizar un documento.
   * @param docId - Identificador del documento.
   * @param userAddress - Dirección del usuario.
   * @returns `true` si tiene permiso de lectura.
   */
  async canView(docId: string, userAddress: string): Promise<boolean> {
    return this.contract.canView(this.toBytes32(docId), userAddress);
  }

  /**
   * Verifica si un usuario puede editar un documento.
   * @param docId - Identificador del documento.
   * @param userAddress - Dirección del usuario.
   * @returns `true` si tiene permiso de escritura.
   */
  async canEdit(docId: string, userAddress: string): Promise<boolean> {
    return this.contract.canEdit(this.toBytes32(docId), userAddress);
  }

  /**
   * Verifica si un usuario es propietario de un documento.
   * @param docId - Identificador del documento.
   * @param userAddress - Dirección del usuario.
   * @returns `true` si es propietario.
   */
  async isOwner(docId: string, userAddress: string): Promise<boolean> {
    return this.contract.isOwner(this.toBytes32(docId), userAddress);
  }

  /**
   * Obtiene el número total de documentos registrados.
   * @returns Cantidad total de documentos.
   */
  async totalDocuments(): Promise<bigint> {
    return this.contract.totalDocuments();
  }

}

/**
 * Crea la instancia del contrato DocumentRegistry para un firmante conectado.
 * @param signer - Firmante de ethers.js.
 * @returns Objeto con la instancia del registro.
 */
export function createContracts(signer: JsonRpcSigner) {
  return {
    registry: new DocumentRegistryContract(signer),
  };
}

/** Tipo de los contratos creados. */
export type Contracts = ReturnType<typeof createContracts>;
