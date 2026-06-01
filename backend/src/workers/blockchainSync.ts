/**
 * Blockchain Sync Worker - Refactored for Frontend Wallet Signatures
 * 
 * This worker handles retry logic for documents that failed to sync with blockchain.
 * With the new architecture, most blockchain operations are signed by the user's wallet,
 * so this worker primarily handles:
 * - Checking status of TX_SUBMITTED documents / versions / signatures
 * - Marking records as FAILED if transactions are dropped
 * - Updating to SYNCED when blockchain confirms
 */

import cron from 'node-cron';
import prisma from '../config/database';
import { provider } from '../config/blockchain';
import logger from '../utils/logger';
import { BlockchainStatus } from '@prisma/client';
import type { ScheduledTask } from 'node-cron';

const scheduledTasks: ScheduledTask[] = [];

/**
 * Generic helper: check a single transaction receipt and update status in DB.
 */
async function checkTxAndUpdate(
  txHash: string | null,
  updateFailed: (err: string) => Promise<void>,
  updateSynced: () => Promise<void>,
) {
  if (!txHash) {
    await updateFailed('No transaction hash provided');
    return;
  }

  const receipt = await provider.getTransactionReceipt(txHash);

  if (!receipt) {
    await updateFailed('Transaction not found or dropped');
  } else if (receipt.status === 0) {
    await updateFailed('Transaction reverted on chain');
  } else if (receipt.status === 1) {
    await updateSynced();
  }
}

// Cada 5 minutos, verificar documentos en TX_SUBMITTED
scheduledTasks.push(cron.schedule('*/5 * * * *', async () => {
  try {
    await checkPendingTransactions();
    await checkPendingVersionTransactions();
    await checkPendingSignatureTransactions();
  } catch (error) {
    logger.error('Error en worker de sincronización blockchain', {
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}));

/**
 * Verificar documentos en estado TX_SUBMITTED
 */
async function checkPendingTransactions() {
  const pendingDocs = await prisma.document.findMany({
    where: { blockchainStatus: BlockchainStatus.TX_SUBMITTED },
    take: 20
  });

  if (pendingDocs.length === 0) return;

  logger.info('Verificando transacciones pendientes (documentos)', { count: pendingDocs.length });

  for (const doc of pendingDocs) {
    try {
      await checkTxAndUpdate(
        doc.blockchainTxHash,
        async (err) => {
          await prisma.document.update({
            where: { id: doc.id },
            data: { blockchainStatus: BlockchainStatus.FAILED, blockchainError: err }
          });
          logger.warn('Documento marcado como fallido', { documentId: doc.id, err });
        },
        async () => {
          await prisma.document.update({
            where: { id: doc.id },
            data: { blockchainStatus: BlockchainStatus.SYNCED }
          });
          logger.info('Documento marcado como sincronizado', { documentId: doc.id });
        },
      );
    } catch (error) {
      logger.error('Error al verificar transacción de documento', {
        documentId: doc.id,
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }
}

/**
 * Verificar versiones en estado TX_SUBMITTED
 */
async function checkPendingVersionTransactions() {
  const pendingVersions = await prisma.version.findMany({
    where: { blockchainStatus: BlockchainStatus.TX_SUBMITTED },
    take: 20
  });

  if (pendingVersions.length === 0) return;

  logger.info('Verificando transacciones pendientes (versiones)', { count: pendingVersions.length });

  for (const ver of pendingVersions) {
    try {
      await checkTxAndUpdate(
        ver.blockchainTxHash ?? null,
        async (err) => {
          await prisma.version.update({
            where: { id: ver.id },
            data: { blockchainStatus: BlockchainStatus.FAILED, blockchainError: err }
          });
          logger.warn('Versión marcada como fallida', { versionId: ver.id, err });
        },
        async () => {
          await prisma.version.update({
            where: { id: ver.id },
            data: { blockchainStatus: BlockchainStatus.SYNCED }
          });
          logger.info('Versión marcada como sincronizada', { versionId: ver.id });
        },
      );
    } catch (error) {
      logger.error('Error al verificar transacción de versión', {
        versionId: ver.id,
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }
}

/**
 * Verificar firmas en estado TX_SUBMITTED
 */
async function checkPendingSignatureTransactions() {
  const pendingSigs = await prisma.documentSignature.findMany({
    where: { blockchainStatus: BlockchainStatus.TX_SUBMITTED },
    take: 20
  });

  if (pendingSigs.length === 0) return;

  logger.info('Verificando transacciones pendientes (firmas)', { count: pendingSigs.length });

  for (const sig of pendingSigs) {
    try {
      await checkTxAndUpdate(
        sig.blockchainTxHash ?? null,
        async (err) => {
          await prisma.documentSignature.update({
            where: { id: sig.id },
            data: { blockchainStatus: BlockchainStatus.FAILED, blockchainError: err }
          });
          logger.warn('Firma marcada como fallida', { signatureId: sig.id, err });
        },
        async () => {
          await prisma.documentSignature.update({
            where: { id: sig.id },
            data: { blockchainStatus: BlockchainStatus.SYNCED }
          });
          logger.info('Firma marcada como sincronizada', { signatureId: sig.id });
        },
      );
    } catch (error) {
      logger.error('Error al verificar transacción de firma', {
        signatureId: sig.id,
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }
}

/**
 * Verificar documentos/versiones/firmas en PREPARING por más de 30 minutos
 * Estos probablemente nunca fueron firmados por el usuario
 */
scheduledTasks.push(cron.schedule('*/30 * * * *', async () => {
  try {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    // Documents — createdAt añadido en migración add-createdAt-to-document-and-version
    const staleDocs = await prisma.document.findMany({
      where: { blockchainStatus: BlockchainStatus.PREPARING, createdAt: { lt: thirtyMinutesAgo } },
      take: 50
    });
    for (const doc of staleDocs) {
      await prisma.document.update({
        where: { id: doc.id },
        data: { blockchainStatus: BlockchainStatus.FAILED, blockchainError: 'User did not sign transaction within 30 minutes' }
      });
      logger.warn('Documento PREPARING expirado', { documentId: doc.id });
    }

    // Versions — createdAt añadido en migración add-createdAt-to-document-and-version
    const staleVersions = await prisma.version.findMany({
      where: { blockchainStatus: BlockchainStatus.PREPARING, createdAt: { lt: thirtyMinutesAgo } },
      take: 50
    });
    for (const ver of staleVersions) {
      await prisma.version.update({
        where: { id: ver.id },
        data: { blockchainStatus: BlockchainStatus.FAILED, blockchainError: 'User did not sign transaction within 30 minutes' }
      });
      logger.warn('Versión PREPARING expirada', { versionId: ver.id });
    }

    // Signatures — usa signedAt como timestamp de creación
    const staleSigs = await prisma.documentSignature.findMany({
      where: {
        blockchainStatus: BlockchainStatus.PREPARING,
        signedAt: { lt: thirtyMinutesAgo },
      },
      take: 50
    });
    for (const sig of staleSigs) {
      await prisma.documentSignature.update({
        where: { id: sig.id },
        data: { blockchainStatus: BlockchainStatus.FAILED, blockchainError: 'User did not sign transaction within 30 minutes' }
      });
      logger.warn('Firma PREPARING expirada', { signatureId: sig.id });
    }
  } catch (error) {
    logger.error('Error al limpiar registros PREPARING', {
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}));

logger.info('Worker de sincronización blockchain iniciado (modo frontend signatures)');

export function stopBlockchainSyncWorker(): void {
  for (const task of scheduledTasks) {
    task.stop();
  }
  logger.info('Worker de sincronización blockchain detenido');
}

export { checkPendingTransactions, checkPendingVersionTransactions, checkPendingSignatureTransactions };
