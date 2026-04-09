import { blockchainProvider } from '../../lib/blockchain/provider';
import { DocumentRegistryContract } from '../../lib/blockchain/contracts';
import { sharesApi } from '../../api/shares';

export class SharingService {
  /**
   * Revoke document share
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

      console.log('[SharingService] Share revoked successfully');
    } catch (error: any) {
      throw new Error(error.message || 'Failed to revoke share');
    }
  }
}

// Singleton instance
export const sharingService = new SharingService();
