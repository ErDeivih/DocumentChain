/**
 * @fileoverview Servicio de compartición blockchain.
 *
 * Gestiona la revocación de permisos de compartición mediante
 * transacciones en el contrato DocumentRegistry.
 */

import { blockchainProvider } from '../../lib/blockchain/provider';
import { DocumentRegistryContract } from '../../lib/blockchain/contracts';
import { sharesApi } from '../../api/shares';

/**
 * Servicio para revocar comparticiones de documentos en blockchain.
 */
export class SharingService {
  /**
   * Revoca el permiso de compartición de un documento.
   *
   * Flujo:
   * 1. Verifica que el firmante coincida con la dirección conectada.
   * 2. Prepara la revocación con el backend.
   * 3. Envía la transacción al contrato DocumentRegistry.
   * 4. Confirma la revocación en el backend.
   *
   * @param input - Datos de la revocación.
   */
  async revokeShare(input: {
    documentId: string;
    userId: string;
    walletId: string;
    connectedAddress: string;
  }): Promise<void> {
    try {
      const signer = blockchainProvider.getSigner();
      if (!signer) {
        throw new Error('No wallet connected');
      }

      const signerAddress = await signer.getAddress();
      if (signerAddress.toLowerCase() !== input.connectedAddress.toLowerCase()) {
        throw new Error('Connected wallet does not match selected wallet.');
      }

      const prepareResult = await sharesApi.prepareRevoke({
        documentId: input.documentId,
        userId: input.userId,
        sharerWalletId: input.walletId,
      });

      const registryContract = new DocumentRegistryContract(signer);
      const tx = await registryContract.revokePermission(
        prepareResult.blockchainId,
        prepareResult.sharedWithAddress
      );
      await tx.wait();

      await sharesApi.confirmRevoke({
        shareId: prepareResult.shareId,
        txHash: tx.hash,
      });
    } catch (error: any) {
      throw new Error(error.message || 'Failed to revoke share');
    }
  }
}

// Instancia singleton
export const sharingService = new SharingService();
