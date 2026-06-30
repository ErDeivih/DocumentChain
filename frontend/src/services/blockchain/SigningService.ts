/**
 * @fileoverview Servicio de firmas blockchain.
 *
 * Gestiona el flujo completo de firma de documentos:
 * 1. Preparar la firma con el backend.
 * 2. Firmar el mensaje con la wallet.
 * 3. Enviar la transacción al contrato inteligente.
 * 4. Confirmar la firma en el backend.
 * 5. Realizar rollback si ocurre algún error.
 */

import { ethers } from 'ethers';
import { blockchainProvider } from '../../lib/blockchain/provider';
import { DocumentRegistryContract } from '../../lib/blockchain/contracts';
import { CONTRACTS } from '../../lib/blockchain/config';
import { signaturesApi } from '../../api/signatures';
import type { Signature } from '../../types';
import type { SignDocumentInput } from './types';
import { buildDocumentSignaturePayloadHash } from './signaturePayload';
import { TX_TIMEOUT_MS } from './config';
import { withTimeout } from '../../lib/utils';

/**
 * Servicio para firmar versiones de documentos en blockchain.
 */
export class SigningService {
  /**
   * Firma una version de documento en blockchain.
   *
   * La doble firma (off-chain signMessage + on-chain signDocument) es intencional:
   * - signMessage: produce evidencia criptográfica EIP-191 verificable fuera de la cadena
   * - signDocument: registra la firma on-chain con protección anti-replay (domain + chainId)
   */
  async signDocument(input: SignDocumentInput): Promise<Signature> {
    let preparedSignature: any = null;
    let txConfirmed = false;

    try {
      const signer = blockchainProvider.getSigner();
      if (!signer) {
        throw new Error('No hay wallet conectada');
      }

      // Paso 1: Preparar firma con el backend
      preparedSignature = await signaturesApi.prepare({
        documentId: input.documentId,
        versionNumber: input.versionNumber,
        walletId: input.walletId,
        comment: input.comment || '',
      });

      // Paso 2: construir y firmar el payload que valida el contrato on-chain
      const docIdBytes32 = ethers.isHexString(preparedSignature.blockchainId)
        ? preparedSignature.blockchainId
        : ethers.id(preparedSignature.blockchainId);
      const network = await signer.provider.getNetwork();
      const payloadHash = buildDocumentSignaturePayloadHash(
        docIdBytes32,
        input.versionNumber,
        preparedSignature.messageToSign,
        CONTRACTS.DocumentRegistry.address,
        network.chainId,
      );
      const messageSignature = await signer.signMessage(ethers.getBytes(payloadHash));

      // Paso 3: registrar firma en blockchain
      const registryContract = new DocumentRegistryContract(signer);
      const tx = await registryContract.signDocument(
        docIdBytes32,
        input.versionNumber,
        messageSignature,
        preparedSignature.messageToSign,
        input.comment || ''
      );
      await withTimeout(tx.wait(), TX_TIMEOUT_MS, 'Tiempo de espera agotado para la transacción de firma');
      txConfirmed = true;

      // Paso 4: Confirmar con el backend
      const result = await signaturesApi.confirm({
        signatureId: preparedSignature.signatureId,
        transactionHash: tx.hash,
        signature: messageSignature,
      });

      return result;
    } catch (error: any) {
      if (preparedSignature?.signatureId && !txConfirmed) {
        try {
          await signaturesApi.rollback(preparedSignature.signatureId);
        } catch (rollbackError) {
          console.warn('Error en rollback de firma:', rollbackError);
        }
      }
      const friendlyMessage = this.mapErrorToFriendlyMessage(error);
      throw new Error(friendlyMessage);
    }
  }

  /**
   * Mapea errores técnicos a mensajes amigables para el usuario.
   * @param error - Error original.
   * @returns Mensaje localizado y amigable.
   */
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

    // Mensaje genérico: se deja que errores no mapeados se muestren tal cual
    return 'No se pudo completar la firma. Verifica tu conexión y los permisos del documento, o inténtalo de nuevo.';
  }
}

// Instancia singleton
export const signingService = new SigningService();
