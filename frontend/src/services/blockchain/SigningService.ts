import { ethers } from 'ethers';
import { blockchainProvider } from '../../lib/blockchain/provider';
import { DocumentRegistryContract } from '../../lib/blockchain/contracts';
import { signaturesApi } from '../../api/signatures';
import type { Signature } from '../../types';
import type { SignDocumentInput } from './types';

export class SigningService {
  /**
   * Sign a document version with blockchain signature
   */
  async signDocument(input: SignDocumentInput): Promise<Signature> {
    let preparedSignature: any = null;

    try {
      const signer = blockchainProvider.getSigner();
      if (!signer) {
        throw new Error('No wallet connected');
      }

      // Step 1: Prepare signature with backend
      preparedSignature = await signaturesApi.prepare({
        documentId: input.documentId,
        versionNumber: input.versionNumber,
        walletId: input.walletId,
        comment: input.comment || '',
      });

      // Step 2: Sign message with wallet
      const messageSignature = await signer.signMessage(preparedSignature.messageToSign);

      // Step 3: Sign blockchain transaction
      const docIdBytes32 = ethers.isHexString(preparedSignature.blockchainId)
        ? preparedSignature.blockchainId
        : ethers.id(preparedSignature.blockchainId);

      const registryContract = new DocumentRegistryContract(signer);
      const tx = await registryContract.signDocument(
        docIdBytes32,
        input.versionNumber,
        messageSignature,
        preparedSignature.messageToSign,
        input.comment || ''
      );
      await tx.wait();

      // Step 4: Confirm with backend
      const result = await signaturesApi.confirm({
        signatureId: preparedSignature.signatureId,
        transactionHash: tx.hash,
        signature: messageSignature,
      });

      return result;
    } catch (error: any) {
      // Rollback: delete signature record
      if (preparedSignature?.signatureId) {
        try {
          await signaturesApi.rollback(preparedSignature.signatureId);
          console.log('[SigningService] Signature rollback successful');
        } catch (rollbackError) {
          console.error('[SigningService] Signature rollback failed:', rollbackError);
        }
      }
      throw new Error(error.message || 'Failed to sign document');
    }
  }
}

// Singleton instance
export const signingService = new SigningService();
