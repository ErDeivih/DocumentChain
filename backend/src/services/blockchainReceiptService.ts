import { ethers, LogDescription, TransactionReceipt } from 'ethers';
import {
  DOCUMENT_REGISTRY_ADDRESS,
  documentRegistryInterface,
  provider,
} from '../config/blockchain';
import { BlockchainError } from '../utils/errors';
import logger from '../utils/logger';

function normalizeAddress(address: string | null | undefined): string | null {
  return address ? address.toLowerCase() : null;
}

function normalizeBytes32(value: string): string {
  return ethers.hexlify(ethers.getBytes(value)).toLowerCase();
}

function sameBytes32(left: string, right: string): boolean {
  return normalizeBytes32(left) === normalizeBytes32(right);
}

function sameAddress(left: string, right: string): boolean {
  return normalizeAddress(left) === normalizeAddress(right);
}

/**
 * Obtiene y valida un recibo de transaccion exitosa para el contrato DocumentRegistry.
 * @param {string} txHash - Hash de la transaccion a verificar.
 * @returns {Promise<TransactionReceipt>} El recibo de transaccion verificado.
 * @throws {Error} Si el recibo no existe, la transaccion revirtio, o no apunta a DocumentRegistry.
 */
export async function getSuccessfulRegistryReceipt(txHash: string): Promise<TransactionReceipt> {
  const receipt = await Promise.race([
    provider.getTransactionReceipt(txHash),
    new Promise<null>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout esperando el recibo de transacción')), 15_000)
    )
  ]);

  if (!receipt) {
    throw new BlockchainError('RPC call failed - could not verify transaction receipt');
  }

  if (receipt.status !== 1) {
    throw new BlockchainError('La transacción revirtió en blockchain');
  }

  if (!receipt.to || normalizeAddress(receipt.to) !== normalizeAddress(DOCUMENT_REGISTRY_ADDRESS)) {
    throw new BlockchainError('La transacción no apunta al contrato DocumentRegistry configurado');
  }

  return receipt;
}

/**
 * Parsea los logs blockchain de un recibo para extraer eventos que coincidan con el nombre dado.
 * @param {TransactionReceipt} receipt - Recibo de transaccion con los logs.
 * @param {string} eventName - Nombre del evento a filtrar.
 * @returns {LogDescription[]} Array de descripciones de log parseadas que coinciden con el evento.
 */
export function parseRegistryEvents(receipt: TransactionReceipt, eventName: string): LogDescription[] {
  return receipt.logs
    .map((log) => {
      try {
        return documentRegistryInterface.parseLog({ topics: [...log.topics], data: log.data });
      } catch (error) {
        logger.debug(`[blockchainReceiptService] Error al parsear log: ${error instanceof Error ? error.message : String(error)}`);
        return null;
      }
    })
    .filter((event): event is LogDescription => event !== null && event.name === eventName);
}

/**
 * Verifica que un recibo contenga un evento DocumentCreated con los parametros esperados.
 * @param {Object} input - Parametros de verificacion.
 * @param {string} input.txHash - Hash de la transaccion.
 * @param {string} input.docId - ID esperado del documento (bytes32).
 * @param {string} input.ownerAddress - Direccion esperada del propietario.
 * @param {string} input.ipfsCid - CID de IPFS esperado.
 * @returns {Promise<TransactionReceipt>} El recibo de transaccion verificado.
 * @throws {Error} Si el evento de creacion de documento no se encuentra en el recibo.
 */
export async function assertDocumentCreatedReceipt(input: {
  txHash: string;
  docId: string;
  ownerAddress: string;
  ipfsCid: string;
}): Promise<TransactionReceipt> {
  const receipt = await getSuccessfulRegistryReceipt(input.txHash);
  const match = parseRegistryEvents(receipt, 'DocumentCreated').some((event) =>
    sameBytes32(String(event.args.docId), input.docId) &&
    sameAddress(String(event.args.owner), input.ownerAddress) &&
    String(event.args.ipfsCid) === input.ipfsCid
  );

  if (!match) {
    throw new BlockchainError('La transacción no creó el documento esperado en blockchain');
  }

  return receipt;
}

/**
 * Verifica que un recibo contenga un evento VersionCreated con los parametros esperados.
 * @param {Object} input - Parametros de verificacion.
 * @param {string} input.txHash - Hash de la transaccion.
 * @param {string} input.docId - ID esperado del documento.
 * @param {number} input.versionNumber - Numero de version esperado.
 * @param {string} input.ipfsCid - CID de IPFS esperado.
 * @param {string} [input.createdByAddress] - Direccion del creador a verificar (opcional).
 * @returns {Promise<TransactionReceipt>} El recibo de transaccion verificado.
 * @throws {Error} Si el evento de creacion de version no se encuentra.
 */
export async function assertVersionCreatedReceipt(input: {
  txHash: string;
  docId: string;
  versionNumber: number;
  ipfsCid: string;
  createdByAddress?: string;
}): Promise<TransactionReceipt> {
  const receipt = await getSuccessfulRegistryReceipt(input.txHash);
  const match = parseRegistryEvents(receipt, 'VersionCreated').some((event) => {
    const createdByMatches = input.createdByAddress
      ? sameAddress(String(event.args.createdBy), input.createdByAddress)
      : true;

    return sameBytes32(String(event.args.docId), input.docId) &&
      Number(event.args.versionNumber) === input.versionNumber &&
      String(event.args.ipfsCid) === input.ipfsCid &&
      createdByMatches;
  });

  if (!match) {
    throw new BlockchainError('La transacción no creó la versión esperada en blockchain');
  }

  return receipt;
}

/**
 * Verifica que un recibo contenga un evento DocumentArchived con los parametros esperados.
 * @param {Object} input - Parametros de verificacion.
 * @param {string} input.txHash - Hash de la transaccion.
 * @param {string} input.docId - ID esperado del documento.
 * @param {string} input.actorAddress - Direccion del actor esperada.
 * @param {boolean} input.archived - Estado de archivado esperado.
 * @returns {Promise<TransactionReceipt>} El recibo de transaccion verificado.
 * @throws {Error} Si el evento de archivado no se encuentra.
 */
export async function assertDocumentArchivedReceipt(input: {
  txHash: string;
  docId: string;
  actorAddress: string;
  archived: boolean;
}): Promise<TransactionReceipt> {
  const receipt = await getSuccessfulRegistryReceipt(input.txHash);
  const match = parseRegistryEvents(receipt, 'DocumentArchived').some((event) =>
    sameBytes32(String(event.args.docId), input.docId) &&
    sameAddress(String(event.args.by), input.actorAddress) &&
    Boolean(event.args.archived) === input.archived
  );

  if (!match) {
    throw new BlockchainError('La transacción no cambió el archivado esperado en blockchain');
  }

  return receipt;
}

/**
 * Verifica que un recibo contenga un evento DocumentDeleted con los parametros esperados.
 * @param {Object} input - Parametros de verificacion.
 * @param {string} input.txHash - Hash de la transaccion.
 * @param {string} input.docId - ID esperado del documento.
 * @param {string} input.actorAddress - Direccion del actor esperada.
 * @returns {Promise<TransactionReceipt>} El recibo de transaccion verificado.
 * @throws {Error} Si el evento de eliminacion no se encuentra.
 */
export async function assertDocumentDeletedReceipt(input: {
  txHash: string;
  docId: string;
  actorAddress: string;
}): Promise<TransactionReceipt> {
  const receipt = await getSuccessfulRegistryReceipt(input.txHash);
  const match = parseRegistryEvents(receipt, 'DocumentDeleted').some((event) =>
    sameBytes32(String(event.args.docId), input.docId) &&
    sameAddress(String(event.args.by), input.actorAddress)
  );

  if (!match) {
    throw new BlockchainError('La transacción no eliminó el documento esperado en blockchain');
  }

  return receipt;
}

/**
 * Verifica que un recibo contenga un evento OwnershipTransferred con los parametros esperados.
 * @param {Object} input - Parametros de verificacion.
 * @param {string} input.txHash - Hash de la transaccion.
 * @param {string} input.docId - ID esperado del documento.
 * @param {string} input.fromAddress - Direccion del remitente esperada.
 * @param {string} input.toAddress - Direccion del destinatario esperada.
 * @returns {Promise<TransactionReceipt>} El recibo de transaccion verificado.
 * @throws {Error} Si el evento de transferencia de propiedad no se encuentra.
 */
export async function assertOwnershipTransferredReceipt(input: {
  txHash: string;
  docId: string;
  fromAddress: string;
  toAddress: string;
}): Promise<TransactionReceipt> {
  const receipt = await getSuccessfulRegistryReceipt(input.txHash);
  const match = parseRegistryEvents(receipt, 'OwnershipTransferred').some((event) =>
    sameBytes32(String(event.args.docId), input.docId) &&
    sameAddress(String(event.args.from), input.fromAddress) &&
    sameAddress(String(event.args.to), input.toAddress)
  );

  if (!match) {
    throw new BlockchainError('La transacción no transfirió el documento esperado en blockchain');
  }

  return receipt;
}

/**
 * Verifica que un recibo contenga un evento DocumentShared con los parametros esperados.
 * @param {Object} input - Parametros de verificacion.
 * @param {string} input.txHash - Hash de la transaccion.
 * @param {string} input.docId - ID esperado del documento.
 * @param {string} input.fromAddress - Direccion del remitente esperada.
 * @param {string} input.toAddress - Direccion del destinatario esperada.
 * @param {number} input.role - Rol de permiso esperado.
 * @returns {Promise<TransactionReceipt>} El recibo de transaccion verificado.
 * @throws {Error} Si el evento de comparticion no se encuentra.
 */
export async function assertDocumentSharedReceipt(input: {
  txHash: string;
  docId: string;
  fromAddress: string;
  toAddress: string;
  role: number;
}): Promise<TransactionReceipt> {
  const receipt = await getSuccessfulRegistryReceipt(input.txHash);
  const match = parseRegistryEvents(receipt, 'DocumentShared').some((event) =>
    sameBytes32(String(event.args.docId), input.docId) &&
    sameAddress(String(event.args.from), input.fromAddress) &&
    sameAddress(String(event.args.to), input.toAddress) &&
    Number(event.args.role) === input.role
  );

  if (!match) {
    throw new BlockchainError('La transacción no compartió el documento esperado en blockchain');
  }

  return receipt;
}

/**
 * Verifica que un recibo contenga un evento PermissionRevoked con los parametros esperados.
 * @param {Object} input - Parametros de verificacion.
 * @param {string} input.txHash - Hash de la transaccion.
 * @param {string} input.docId - ID esperado del documento.
 * @param {string} input.userAddress - Direccion del usuario esperada.
 * @param {string} [input.byAddress] - Direccion del revocador a verificar (opcional).
 * @returns {Promise<TransactionReceipt>} El recibo de transaccion verificado.
 * @throws {Error} Si el evento de revocacion de permiso no se encuentra.
 */
export async function assertPermissionRevokedReceipt(input: {
  txHash: string;
  docId: string;
  userAddress: string;
  byAddress?: string;
}): Promise<TransactionReceipt> {
  const receipt = await getSuccessfulRegistryReceipt(input.txHash);
  const match = parseRegistryEvents(receipt, 'PermissionRevoked').some((event) => {
    const byMatches = input.byAddress ? sameAddress(String(event.args.by), input.byAddress) : true;
    return sameBytes32(String(event.args.docId), input.docId) &&
      sameAddress(String(event.args.user), input.userAddress) &&
      byMatches;
  });

  if (!match) {
    throw new BlockchainError('La transacción no revocó el permiso esperado en blockchain');
  }

  return receipt;
}

/**
 * Verifica que un recibo contenga un evento DocumentSigned con los parametros esperados.
 * @param {Object} input - Parametros de verificacion.
 * @param {string} input.txHash - Hash de la transaccion.
 * @param {string} input.docId - ID esperado del documento.
 * @param {number} input.versionNumber - Numero de version esperado.
 * @param {string} input.signerAddress - Direccion del firmante esperada.
 * @param {string} [input.message] - Mensaje de firma a verificar (opcional).
 * @returns {Promise<TransactionReceipt>} El recibo de transaccion verificado.
 * @throws {Error} Si el evento de firma no se encuentra.
 */
export async function assertDocumentSignedReceipt(input: {
  txHash: string;
  docId: string;
  versionNumber: number;
  signerAddress: string;
  message?: string;
}): Promise<TransactionReceipt> {
  const receipt = await getSuccessfulRegistryReceipt(input.txHash);
  const match = parseRegistryEvents(receipt, 'DocumentSigned').some((event) =>
    sameBytes32(String(event.args.docId), input.docId) &&
    Number(event.args.versionNumber) === input.versionNumber &&
    sameAddress(String(event.args.signer), input.signerAddress) &&
    (input.message === undefined || String(event.args.message) === input.message)
  );

  if (!match) {
    throw new BlockchainError('La transacción no registró la firma esperada en blockchain');
  }

  return receipt;
}

/**
 * Verifica que un recibo contenga un evento OperationalVersionChanged con los parametros esperados.
 * @param {Object} input - Parametros de verificacion.
 * @param {string} input.txHash - Hash de la transaccion.
 * @param {string} input.docId - ID esperado del documento.
 * @param {number} input.newVersion - Nuevo numero de version esperado.
 * @param {string} [input.actorAddress] - Direccion del actor a verificar (opcional).
 * @returns {Promise<TransactionReceipt>} El recibo de transaccion verificado.
 * @throws {Error} Si el evento de cambio de version operativa no se encuentra.
 */
export async function assertOperationalVersionChangedReceipt(input: {
  txHash: string;
  docId: string;
  newVersion: number;
  actorAddress?: string;
}): Promise<TransactionReceipt> {
  const receipt = await getSuccessfulRegistryReceipt(input.txHash);
  const match = parseRegistryEvents(receipt, 'OperationalVersionChanged').some((event) => {
    const actorMatches = input.actorAddress ? sameAddress(String(event.args.by), input.actorAddress) : true;
    return sameBytes32(String(event.args.docId), input.docId) &&
      Number(event.args.newVersion) === input.newVersion &&
      actorMatches;
  });

  if (!match) {
    throw new BlockchainError('La transacción no activó la versión esperada en blockchain');
  }

  return receipt;
}

/**
 * Verifica que un recibo contenga un evento VersionRestored con los parametros esperados.
 * @param {Object} input - Parametros de verificacion.
 * @param {string} input.txHash - Hash de la transaccion.
 * @param {string} input.docId - ID esperado del documento.
 * @param {number} input.newVersionNumber - Nuevo numero de version esperado.
 * @param {number} input.restoredFromVersion - Version desde la que se restauro.
 * @param {string} [input.actorAddress] - Direccion del actor a verificar (opcional).
 * @returns {Promise<TransactionReceipt>} El recibo de transaccion verificado.
 * @throws {Error} Si el evento de restauracion de version no se encuentra.
 */
export async function assertVersionRestoredReceipt(input: {
  txHash: string;
  docId: string;
  newVersionNumber: number;
  restoredFromVersion: number;
  actorAddress?: string;
}): Promise<TransactionReceipt> {
  const receipt = await getSuccessfulRegistryReceipt(input.txHash);
  const match = parseRegistryEvents(receipt, 'VersionRestored').some((event) => {
    const actorMatches = input.actorAddress ? sameAddress(String(event.args.by), input.actorAddress) : true;
    return sameBytes32(String(event.args.docId), input.docId) &&
      Number(event.args.newVersionNumber) === input.newVersionNumber &&
      Number(event.args.restoredFromVersion) === input.restoredFromVersion &&
      actorMatches;
  });

  if (!match) {
    throw new BlockchainError('La transacción no restauró la versión esperada en blockchain');
  }

  return receipt;
}
