import { ethers } from 'ethers';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../config/database';
import { BlockchainCacheService } from '../services/blockchainCacheService';
import { logger } from '../utils/logger';

const BATCH_SIZE = 50;
const RECONCILE_INTERVAL_MS = 6 * 60 * 60 * 1000;

export class BlockchainReconciler {
  private static timer: ReturnType<typeof setInterval> | null = null;
  private static reconciling = false;

  static start(): void {
    logger.info('[BlockchainReconciler] Starting periodic reconciliation (every 6h)');
    this.timer = setInterval(() => this.reconcile(), RECONCILE_INTERVAL_MS);
    setTimeout(() => this.reconcile(), 60_000);
  }

  static stop(): void {
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
  }

  private static async reconcile(): Promise<void> {
    if (this.reconciling) { logger.info('[BlockchainReconciler] Cycle already running, skipping'); return; }
    this.reconciling = true;
    try {
      logger.info('[BlockchainReconciler] Starting cycle');
      const syncedDocs = await prisma.document.findMany({
        where: { blockchainStatus: 'SYNCED', blockchainId: { not: null } },
        select: { id: true, blockchainId: true, ownerId: true },
      });

      if (syncedDocs.length === 0) { logger.info('[BlockchainReconciler] No synced docs to reconcile'); return; }

      const blockchainIds = syncedDocs.map((d) => d.blockchainId!).filter(Boolean);
      const states = await BlockchainCacheService.batchGetDocumentStates(blockchainIds);
      let corrections = 0;

      for (const doc of syncedDocs) {
        const state = states.get(doc.blockchainId!);
        if (!state) continue;

        if (state.owner !== ethers.ZeroAddress) {
          const ownerWallet = await prisma.wallet.findFirst({
            where: { walletAddress: state.owner.toLowerCase() },
            select: { userId: true },
          });

          if (ownerWallet && ownerWallet.userId !== doc.ownerId) {
            logger.warn(`[BlockchainReconciler] Owner mismatch for ${doc.id}: DB=${doc.ownerId}, chain=${state.owner}`);
            await prisma.document.update({ where: { id: doc.id }, data: { ownerId: ownerWallet.userId } });
            await prisma.event.create({
              data: {
                id: uuidv4(), eventType: 'OWNER_RECONCILED', documentId: doc.id,
                metadata: { previousOwnerId: doc.ownerId, newOwnerId: ownerWallet.userId, onChainOwner: state.owner },
              },
            });
            corrections++;
          }
        }
      }

      BlockchainCacheService.invalidateAll();
      logger.info(`[BlockchainReconciler] Complete. ${corrections} corrections.`);
    } catch (error) {
      logger.error('[BlockchainReconciler] Failed:', error);
    } finally {
      this.reconciling = false;
    }
  }
}
