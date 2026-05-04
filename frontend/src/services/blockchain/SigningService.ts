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
      const friendlyMessage = this.mapErrorToFriendlyMessage(error);
      throw new Error(friendlyMessage);
    }
  }

  private mapErrorToFriendlyMessage(error: any): string {
    const msg = (error?.message || error?.reason || '').toLowerCase();
    
    if (msg.includes('already signed') || msg.includes('ya has firmado')) {
      return 'Ya has firmado esta versión del documento. No es necesario firmar de nuevo.';
    }
    if (msg.includes('user denied') || msg.includes('rejected') || msg.includes('cancelled') || msg.includes('user rejected')) {
      return 'Firma cancelada. La transacción no se completó porque rechazaste la operación en tu wallet.';
    }
    if (msg.includes('insufficient funds')) {
      return 'No tienes suficientes fondos en tu wallet para cubrir el gas de la transacción.';
    }
    if (msg.includes('nonce') || msg.includes('replacement fee too low')) {
      return 'Error de sincronización con la blockchain. Intenta de nuevo en unos segundos.';
    }
    if (msg.includes('no read permission') || msg.includes('not authorized')) {
      return 'No tienes permiso para firmar este documento. El propietario debe compartírtelo primero.';
    }
    if (msg.includes('network') || msg.includes('disconnect')) {
      return 'Error de conexión con la red blockchain. Verifica que tu nodo Hardhat esté activo.';
    }
    if (msg.includes('document not found') || msg.includes('does not exist')) {
      return 'El documento no existe en el contrato inteligente. Puede que aún no esté sincronizado con blockchain.';
    }
    
    // Log técnico para debugging pero mensaje amigable para usuario
    console.error('[SigningService] Error técnico:', error);
    return 'No se pudo completar la firma. Verifica tu conexión y los permisos del documento, o inténtalo de nuevo.';
  }
}

// Singleton instance
export const signingService = new SigningService();
