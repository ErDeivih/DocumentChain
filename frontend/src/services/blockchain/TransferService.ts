import { documentsApi } from '../../api/documents';
import { usersApi } from '../../api/users';
import { KeyManager } from '../../lib/crypto/KeyManager';
import { DocumentRegistryContract } from '../../lib/blockchain/contracts';
import type { JsonRpcSigner } from 'ethers';

import { TX_TIMEOUT_MS } from './config';
import { withTimeout } from '../../lib/utils';

/**
 * Servicio de transferencia de propiedad de documentos.
 * El frontend re-cifra la clave simétrica para el nuevo propietario.
 */
export class TransferService {
  /**
   * Transfiere la propiedad de un documento a otro usuario.
   * Descifra la clave simétrica del propietario actual y la re-cifra
   * para el nuevo propietario usando RSA-OAEP. Registra el cambio en blockchain.
   */
  async transfer(params: {
    documentId: string;
    newOwnerId: string;
    walletId: string;
    signer: JsonRpcSigner;
    isPublic: boolean;
    userEncryptedPrivateKey?: string;
    userKeySalt?: string;
    userPassword: string;
  }): Promise<{ txHash: string }> {
    const { documentId, newOwnerId, walletId, signer, isPublic, userEncryptedPrivateKey, userKeySalt, userPassword } = params;

    let prepareResponse: { transferId: string; docId: string; newOwnerAddress: string; message: string } | null = null;
    let txConfirmed = false;

    try {
      const { document } = await documentsApi.get(documentId);
      if (!isPublic && !document.encryptedSymmetricKey) {
        throw new Error('El documento no tiene clave de cifrado disponible.');
      }

      const newOwner = await usersApi.getUserById(newOwnerId);
      if (!newOwner.walletAddress) {
        throw new Error('El nuevo propietario no tiene una wallet principal');
      }

      if (!isPublic && !newOwner.publicKey) {
        throw new Error('El nuevo propietario no tiene clave pública configurada');
      }
      if (!isPublic && (!userEncryptedPrivateKey || !userKeySalt)) {
        throw new Error('El usuario autenticado no tiene material criptográfico disponible.');
      }

      const reEncryptedKey = isPublic
        ? undefined
        : await (async () => {
            const privateKey = await KeyManager.decryptPrivateKey(userEncryptedPrivateKey!, userPassword, userKeySalt);
            const rawKey = await KeyManager.decryptWithPrivateKey(document.encryptedSymmetricKey!, privateKey);
            return KeyManager.encryptWithPublicKey(rawKey, newOwner.publicKey);
          })();

      prepareResponse = await documentsApi.prepareTransfer({
        documentId,
        newOwnerId,
        walletId,
        newOwnerWalletAddress: newOwner.walletAddress,
        reEncryptedSymmetricKey: reEncryptedKey,
      });

      const contract = new DocumentRegistryContract(signer);
      const tx = await contract.transferOwnership(prepareResponse.docId, prepareResponse.newOwnerAddress);

      await withTimeout(tx.wait(), TX_TIMEOUT_MS, 'Tiempo de espera agotado');
      txConfirmed = true;

      await documentsApi.confirmTransfer({
        documentId,
        transferId: prepareResponse.transferId,
        txHash: tx.hash,
      });

      return { txHash: tx.hash };
    } catch (err: any) {
      if (prepareResponse && !txConfirmed) {
        await documentsApi.rollbackTransfer(documentId, prepareResponse.transferId).catch((rollbackErr: unknown) => {
          console.warn('Error en rollback de transferencia:', rollbackErr);
        });
      }
      throw err instanceof Error ? err : new Error(String(err));
    }
  }
}

export const transferService = new TransferService();
