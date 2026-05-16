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
import { signaturesApi } from '../../api/signatures';
import type { Signature } from '../../types';
import type { SignDocumentInput } from './types';

/**
 * Servicio para firmar versiones de documentos en blockchain.
 */
export class SigningService {
  /**
   * Firma una versión de documento mediante transacción blockchain.
   *
   * Flujo:
   * 1. Prepara la firma con el backend (mensaje a firmar).
   * 2. Firma el mensaje con la wallet conectada.
   * 3. Envía la transacción al contrato DocumentRegistry.
   * 4. Confirma la firma en el backend.
   *
   * Si ocurre un error después de la preparación, revierte el registro
   * de firma en el backend para mantener la consistencia.
   *
   * @param input - Datos de entrada para la firma.
   * @returns Firma registrada.
   */
  async signDocument(input: SignDocumentInput): Promise<Signature> {
    let preparedSignature: any = null;

    try {
      const signer = blockchainProvider.getSigner();
      if (!signer) {
        throw new Error('No wallet connected');
      }

      // Paso 1: Preparar firma con el backend
      preparedSignature = await signaturesApi.prepare({
        documentId: input.documentId,
        versionNumber: input.versionNumber,
        walletId: input.walletId,
        comment: input.comment || '',
      });

      // Paso 2: Firmar mensaje con la wallet
      const messageSignature = await signer.signMessage(preparedSignature.messageToSign);

      // Paso 3: Firmar transacción blockchain
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

      // Paso 4: Confirmar con el backend
      const result = await signaturesApi.confirm({
        signatureId: preparedSignature.signatureId,
        transactionHash: tx.hash,
        signature: messageSignature,
      });

      return result;
    } catch (error: any) {
      // Rollback: eliminar registro de firma
      if (preparedSignature?.signatureId) {
        try {
          await signaturesApi.rollback(preparedSignature.signatureId);
        } catch (rollbackError) {
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
