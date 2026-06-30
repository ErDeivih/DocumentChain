import { ethers } from 'ethers';
import { documentsApi } from '../../api/documents';
import { versionsApi } from '../../api/versions';
import { FileCrypto } from '../../lib/crypto/FileCrypto';
import { KeyManager } from '../../lib/crypto/KeyManager';
import type { DocumentRegistryContract } from '../../lib/blockchain/contracts';
import type { Document, Version } from '../../types';

import { TX_TIMEOUT_MS } from './config';
import { withTimeout } from '../../lib/utils';

/**
 * Servicio de subida de documentos con cifrado y registro en blockchain.
 * El archivo se cifra en el frontend antes de enviarlo al backend.
 */
export class UploadService {
  /**
   * Sube un documento al sistema.
   * Cifra el archivo con AES-256-GCM, lo envía al backend para subirlo a IPFS
   * y registra la transacción en blockchain.
   * @param params.file - Archivo seleccionado por el usuario
   * @param params.isPublic - Si el documento es público (sin cifrar)
   * @param params.walletId - ID de la wallet para firmar la transacción
   * @param params.folderId - ID de la carpeta destino (opcional)
   * @returns Promesa que resuelve cuando el documento ha sido confirmado en el backend
   */
  async uploadDocument(params: {
    file: File;
    isPublic: boolean;
    publicKey?: string;
    walletId: string;
    folderId?: string | null;
    tags?: string[];
    registryContract: DocumentRegistryContract;
  }): Promise<{ documentId: string; txHash: string }> {
    const { file, isPublic, publicKey, walletId, folderId, tags, registryContract } = params;

    let prepareResult: { docId: string; ipfsCid: string; documentId: string; encryptedKeyHash: string; contentHash: string } | null = null;
    let txConfirmed = false;

    try {
      const fileBuffer = await file.arrayBuffer();

      const encryptionResult = isPublic
        ? null
        : await (async () => {
            if (!publicKey) throw new Error('No se puede cifrar: faltan las claves de cifrado del usuario');
            return FileCrypto.encryptFile(fileBuffer, publicKey);
          })();

      prepareResult = await documentsApi.prepareCreate({
        name: file.name,
        mimeType: file.type,
        fileBuffer: encryptionResult ? encryptionResult.encryptedFile : fileBuffer,
        walletId,
        visibility: isPublic ? 'PUBLIC' : 'PRIVATE',
        folderId: folderId || undefined,
        tags,
        encryptedSymmetricKey: encryptionResult?.encryptedSymmetricKey,
        contentHash: encryptionResult?.contentHash,
        encryptionIV: encryptionResult?.iv,
        encryptionAuthTag: encryptionResult?.authTag,
      });

      if (!prepareResult) throw new Error('El resultado de preparación es nulo');

      const tx = await registryContract.createDocument(
        prepareResult.docId,
        prepareResult.ipfsCid,
        prepareResult.encryptedKeyHash,
        prepareResult.contentHash ?? ethers.ZeroHash,
      );

      await withTimeout(tx.wait(), TX_TIMEOUT_MS, 'Tiempo de espera agotado');
      txConfirmed = true;

      await documentsApi.confirmCreate({
        documentId: prepareResult.documentId,
        txHash: tx.hash,
        blockchainId: prepareResult.docId,
      });

      return { documentId: prepareResult.documentId, txHash: tx.hash };
    } catch (err: any) {
      if (prepareResult?.documentId && !txConfirmed) {
        try { await documentsApi.rollback(prepareResult.documentId); } catch (rollbackErr) {
          console.warn('[UploadService] Falló al hacer rollback del documento:', rollbackErr);
        }
      }
      throw new Error(err.message || 'Error al subir el documento');
    }
  }

  /**
   * Sube una nueva versión de un documento existente.
   * Cifra el nuevo archivo con una nueva clave AES, lo envía al backend
   * y registra la versión en blockchain mediante prepare/confirm.
   * @param params.document - Documento original
   * @param params.file - Nuevo archivo de versión
   * @param params.comment - Comentario opcional sobre la versión
   * @param params.walletId - ID de la wallet para firmar
   * @param params.registryContract - Contrato DocumentRegistry
   * @param params.userPublicKey - Clave pública del usuario
   * @param params.userEncryptedPrivateKey - Clave privada cifrada
   * @param params.userPassword - Contraseña del usuario
   * @param params.userKeySalt - Salt de la clave
   * @returns Promesa que resuelve cuando la nueva versión ha sido confirmada en el backend
   */
  async uploadVersion(params: {
    document: Document;
    file: File;
    comment?: string;
    walletId: string;
    registryContract: DocumentRegistryContract;
    userPublicKey?: string;
    userEncryptedPrivateKey?: string;
    userPassword?: string;
    userKeySalt?: string;
  }): Promise<{ version: Version; txHash: string }> {
    const { document, file, comment, walletId, registryContract, userPublicKey, userEncryptedPrivateKey, userPassword, userKeySalt } = params;

    let prepareResult: { versionId: string; ipfsCid: string; encryptedKeyHash: string; contentHash: string } | null = null;
    let versionTxConfirmed = false;

    try {
      const fileBuffer = await file.arrayBuffer();
      const isPublic = document.visibility === 'PUBLIC';

      let encryptionResult: import('../../lib/crypto/FileCrypto').EncryptedFileResult | null = null;
      if (!isPublic) {
        if (!userPublicKey) throw new Error('No se puede cifrar: faltan las claves de cifrado del usuario');
        if (document.isEncrypted && (!userEncryptedPrivateKey || !userPassword)) {
          throw new Error('Se requiere tu contraseña para subir una nueva versión de este documento');
        }
        if (document.isEncrypted && document.encryptedSymmetricKey && userEncryptedPrivateKey && userPassword) {
          const privateKey = await KeyManager.decryptPrivateKey(userEncryptedPrivateKey, userPassword, userKeySalt);
          const rawKey = await KeyManager.decryptWithPrivateKey(document.encryptedSymmetricKey, privateKey);
          const existingAESKey = await FileCrypto.importAESKeyFromRaw(rawKey);
          encryptionResult = await FileCrypto.encryptFileWithKey(fileBuffer, userPublicKey, existingAESKey);
        } else {
          encryptionResult = await FileCrypto.encryptFile(fileBuffer, userPublicKey);
        }
      }

      const prepareInput: {
        documentId: string;
        fileBuffer: ArrayBuffer;
        walletId: string;
        comment?: string;
        encryptedSymmetricKey?: string;
        contentHash?: string;
        encryptionIV?: string;
        encryptionAuthTag?: string;
      } = {
        documentId: document.id,
        fileBuffer: encryptionResult ? encryptionResult.encryptedFile : fileBuffer,
        walletId,
        comment: comment || undefined,
      };
      if (encryptionResult) {
        prepareInput.encryptedSymmetricKey = encryptionResult.encryptedSymmetricKey;
        prepareInput.contentHash = encryptionResult.contentHash;
        prepareInput.encryptionIV = encryptionResult.iv;
        prepareInput.encryptionAuthTag = encryptionResult.authTag;
      }

      prepareResult = await versionsApi.prepareCreate(prepareInput);

      const docId = document.blockchainId || document.id;
      const tx = await registryContract.createVersion(
        docId,
        prepareResult.ipfsCid,
        prepareResult.encryptedKeyHash,
        prepareResult.contentHash,
      );

      await withTimeout(tx.wait(), TX_TIMEOUT_MS, 'Tiempo de espera agotado');
      versionTxConfirmed = true;

      const confirmResult = await versionsApi.confirmCreate({
        documentId: document.id,
        versionId: prepareResult.versionId,
        txHash: tx.hash,
      });

      return { version: confirmResult.version, txHash: tx.hash };
    } catch (err: any) {
      if (prepareResult?.versionId && !versionTxConfirmed) {
        try { await versionsApi.rollback(prepareResult.versionId); } catch (rollbackErr) {
          console.warn('[UploadService] Falló al hacer rollback de la versión:', rollbackErr);
        }
      }
      throw new Error(err.message || 'Error al subir la versión');
    }
  }
}

export const uploadService = new UploadService();
