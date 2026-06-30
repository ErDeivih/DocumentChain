import { versionsApi } from '../../api/versions';
import type { DocumentRegistryContract } from '../../lib/blockchain/contracts';

import { TX_TIMEOUT_MS } from './config';
import { withTimeout } from '../../lib/utils';

export class VersionService {
  async setOperational(
    params: { registryContract: DocumentRegistryContract; documentId: string; versionNumber: number }
  ): Promise<string> {
    try {
      const prepare = await versionsApi.prepareSetOperational(params.documentId, params.versionNumber);
      const tx = await params.registryContract.setOperationalVersion(prepare.blockchainId, params.versionNumber);
      await withTimeout(tx.wait(), TX_TIMEOUT_MS, 'Tiempo de espera agotado');
      await versionsApi.confirmSetOperational(params.documentId, params.versionNumber, tx.hash);
      return tx.hash;
    } catch (err: any) {
      try {
        await versionsApi.rollbackSetOperational(params.documentId);
      } catch (rollbackErr) {
        console.warn('[VersionService] Fallo al hacer rollback del cambio de versión operativa:', rollbackErr);
      }
      throw new Error(err.message || 'Error al cambiar la versión operativa');
    }
  }

  async restoreVersion(params: {
    registryContract: DocumentRegistryContract;
    documentId: string;
    versionNumber: number;
    walletId?: string;
  }): Promise<string> {
    let prepareResult: { versionId: string; blockchainId: string } | null = null;
    let txConfirmed = false;
    try {
      prepareResult = await versionsApi.prepareRestoreVersion(
        params.documentId,
        params.versionNumber,
        params.walletId,
      );
      const tx = await params.registryContract.restoreVersion(
        params.documentId,
        params.versionNumber,
      );
      await withTimeout(tx.wait(), TX_TIMEOUT_MS, 'Tiempo de espera agotado');
      txConfirmed = true;
      await versionsApi.confirmRestoreVersion(prepareResult.versionId, tx.hash);
      return tx.hash;
    } catch (err: any) {
      if (prepareResult?.versionId && !txConfirmed) {
        try { await versionsApi.rollbackRestoreVersion(prepareResult.versionId); } catch {}
      }
      throw new Error(err.message || 'Error al restaurar la versión');
    }
  }
}

export const versionService = new VersionService();
