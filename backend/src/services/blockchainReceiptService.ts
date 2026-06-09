import { ethers, LogDescription, TransactionReceipt } from 'ethers';
import {
  DOCUMENT_REGISTRY_ADDRESS,
  documentRegistryInterface,
  provider,
} from '../config/blockchain';
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

export async function getSuccessfulRegistryReceipt(txHash: string): Promise<TransactionReceipt> {
  const receipt = await provider.getTransactionReceipt(txHash);

  if (!receipt) {
    throw new Error('La transacción no está confirmada en blockchain');
  }

  if (receipt.status !== 1) {
    throw new Error('La transacción revirtió en blockchain');
  }

  if (!receipt.to || normalizeAddress(receipt.to) !== normalizeAddress(DOCUMENT_REGISTRY_ADDRESS)) {
    throw new Error('La transacción no apunta al contrato DocumentRegistry configurado');
  }

  return receipt;
}

export function parseRegistryEvents(receipt: TransactionReceipt, eventName: string): LogDescription[] {
  return receipt.logs
    .map((log) => {
      try {
        return documentRegistryInterface.parseLog({ topics: [...log.topics], data: log.data });
      } catch (error) {
        logger.debug(`[blockchainReceiptService] Log parse failed: ${error instanceof Error ? error.message : String(error)}`);
        return null;
      }
    })
    .filter((event): event is LogDescription => event !== null && event.name === eventName);
}

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
    throw new Error('La transacción no creó el documento esperado en blockchain');
  }

  return receipt;
}

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
    throw new Error('La transacción no creó la versión esperada en blockchain');
  }

  return receipt;
}

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
    throw new Error('La transacción no cambió el archivado esperado en blockchain');
  }

  return receipt;
}

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
    throw new Error('La transacción no eliminó el documento esperado en blockchain');
  }

  return receipt;
}

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
    throw new Error('La transacción no transfirió el documento esperado en blockchain');
  }

  return receipt;
}

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
    throw new Error('La transacción no compartió el documento esperado en blockchain');
  }

  return receipt;
}

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
    throw new Error('La transacción no revocó el permiso esperado en blockchain');
  }

  return receipt;
}

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
    throw new Error('La transacción no registró la firma esperada en blockchain');
  }

  return receipt;
}

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
    throw new Error('La transacción no activó la versión esperada en blockchain');
  }

  return receipt;
}

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
    throw new Error('La transacción no restauró la versión esperada en blockchain');
  }

  return receipt;
}
