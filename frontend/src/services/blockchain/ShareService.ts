/**
 * @fileoverview Servicio de compartición blockchain.
 *
 * Gestiona la compartición y revocación de permisos mediante
 * transacciones en el contrato DocumentRegistry.
 */

import type { JsonRpcSigner } from 'ethers';
import { DocumentRole } from '../../types';
import { sharesApi } from '../../api/shares';
import { documentsApi } from '../../api/documents';
import { usersApi, type UserSearchResult } from '../../api/users';
import { KeyManager } from '../../lib/crypto/KeyManager';
import { blockchainProvider } from '../../lib/blockchain/provider';
import { DocumentRegistryContract, AccessRole } from '../../lib/blockchain/contracts';
import { TX_TIMEOUT_MS } from './config';
import { withTimeout } from '../../lib/utils';

export class ShareService {
  /**
   * Comparte un documento con otro usuario mediante cifrado seguro y registro en blockchain.
   *
   * Flujo:
   * 1. Obtiene el documento y el destinatario.
   * 2. Descifra la clave privada del compartidor.
   * 3. Re-cifra la clave simétrica para el destinatario.
   * 4. Prepara la compartición en el backend.
   * 5. Firma la transacción en blockchain.
   * 6. Confirma la compartición en el backend.
   *
   * @param params - Parámetros de compartición (incluye signer).
   */
  async share(
    params: {
      signer: JsonRpcSigner;
      documentId: string;
      recipientUser: UserSearchResult;
      role: DocumentRole;
      walletId: string;
      password: string;
      encryptedPrivateKey: string;
      keySalt?: string;
    }
  ): Promise<{ txHash: string }> {
    let prepareResult: any = null;

    try {
      const { signer, documentId, recipientUser, role, walletId, password, encryptedPrivateKey, keySalt } = params;

      const { document } = await documentsApi.get(documentId);
      if (document.visibility === 'PUBLIC') {
        throw new Error('Los documentos públicos se comparten mediante enlace o QR, no mediante compartición privada.');
      }

      if (!document.encryptedSymmetricKey) {
        throw new Error('El documento no tiene clave de cifrado');
      }

      const recipientUserData = await usersApi.getUserById(recipientUser.id);
      const recipientPublicKey = recipientUserData.publicKey;
      if (!recipientPublicKey) {
        throw new Error('El destinatario no tiene clave pública configurada');
      }

      if (!encryptedPrivateKey) {
        throw new Error('Clave privada no disponible. Reconfigura tu cuenta.');
      }
      const reEncryptedKey = await (async () => {
        const privateKey = await KeyManager.decryptPrivateKey(encryptedPrivateKey, password, keySalt);
        const rawKey = await KeyManager.decryptWithPrivateKey(document.encryptedSymmetricKey!, privateKey);
        return KeyManager.encryptWithPublicKey(rawKey, recipientPublicKey);
      })();

      prepareResult = await sharesApi.prepareShare({
        documentId,
        sharedWithUserId: recipientUser.id,
        role,
        sharerWalletId: walletId,
        reEncryptedSymmetricKey: reEncryptedKey,
      });

      const accessRole = role === DocumentRole.SHARED_WRITE
        ? AccessRole.EDITOR
        : AccessRole.VIEWER;

      const registryContract = new DocumentRegistryContract(signer);

      const tx = await registryContract.shareDocument(
        prepareResult.blockchainId as `0x${string}`,
        prepareResult.sharedWithAddress as `0x${string}`,
        accessRole,
      );

      await withTimeout(tx.wait(), TX_TIMEOUT_MS, 'Tiempo de espera agotado al compartir');

      await sharesApi.confirmShare({
        shareId: prepareResult.shareId,
        txHash: tx.hash,
        documentId,
      });

      return { txHash: tx.hash };
    } catch (err: any) {
      if (prepareResult?.shareId) {
        try { await sharesApi.rollbackRevoke(prepareResult.shareId); } catch (rollbackErr) {
          console.warn('[ShareService] Fallo al limpiar share preparado:', rollbackErr);
        }
      }
      throw err instanceof Error ? err : new Error('Error al compartir el documento');
    }
  }

  /**
   * Revoca el permiso de compartición de un documento.
   *
   * Flujo:
   * 1. Verifica que el firmante coincida con la dirección conectada.
   * 2. Prepara la revocación con el backend.
   * 3. Envía la transacción al contrato DocumentRegistry.
   * 4. Confirma la revocación en el backend.
   *
   * @param params - Datos de la revocación.
   */
  async revokeShare(params: {
    documentId: string;
    userId: string;
    walletId: string;
    connectedAddress: string;
  }): Promise<void> {
    let prepareResult: { shareId: string; blockchainId: string; sharedWithAddress: string } | undefined;
    try {
      const signer = blockchainProvider.getSigner();
      if (!signer) throw new Error('No hay wallet conectada');

      const signerAddress = await signer.getAddress();
      if (signerAddress.toLowerCase() !== params.connectedAddress.toLowerCase()) {
        throw new Error('La wallet conectada no coincide con la seleccionada');
      }

      prepareResult = await sharesApi.prepareRevoke({
        documentId: params.documentId,
        userId: params.userId,
        sharerWalletId: params.walletId,
      });

      const registryContract = new DocumentRegistryContract(signer);
      const tx = await registryContract.revokePermission(
        prepareResult.blockchainId,
        prepareResult.sharedWithAddress,
      );
      await withTimeout(tx.wait(), TX_TIMEOUT_MS, 'Tiempo de espera agotado para la transacción de revocación');

      await sharesApi.confirmRevoke({
        shareId: prepareResult.shareId,
        txHash: tx.hash,
      });
    } catch (error: any) {
      if (prepareResult?.shareId) {
        try { await sharesApi.rollbackRevoke(prepareResult.shareId); } catch (rollbackErr) {
          console.warn('[ShareService] Falló al limpiar revocación preparada:', rollbackErr);
        }
      }
      throw error instanceof Error ? error : new Error('Error al revocar la compartición');
    }
  }
}

export const shareService = new ShareService();
