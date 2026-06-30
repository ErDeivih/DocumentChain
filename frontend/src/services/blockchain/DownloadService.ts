import { downloadDocument } from '../../api/documents';
import { versionsApi } from '../../api/versions';
import { KeyManager } from '../../lib/crypto/KeyManager';
import { FileCrypto } from '../../lib/crypto/FileCrypto';

/**
 * Servicio de descarga de documentos con descifrado en cliente.
 */
export class DownloadService {
  /**
   * Descarga un documento del sistema.
   * Si es privado, solicita la clave al backend y descifra en el navegador.
   * @param params.documentId - ID del documento a descargar
   * @returns Promesa que resuelve cuando la descarga se completa
   */
  async download(
    params: {
      documentId: string;
      versionId?: string | null;
      password?: string;
      encryptedPrivateKey?: string;
      keySalt?: string;
      contentHash?: string;
    }
  ): Promise<{ blob: Blob; filename: string }> {
    const { documentId, versionId, password, encryptedPrivateKey, keySalt, contentHash } = params;

    const download = versionId
      ? await versionsApi.download(versionId)
      : await downloadDocument(documentId);

    if (!download.isEncrypted) {
      return { blob: download.blob, filename: download.filename };
    }

    if (!password) throw new Error('Se requiere la contraseña para descifrar el documento');
    if (!encryptedPrivateKey) throw new Error('El usuario autenticado no tiene clave privada cifrada disponible');
    if (!download.encryptedSymmetricKey || !download.encryptionIV || !download.encryptionAuthTag) {
      throw new Error('Faltan metadatos de cifrado para descargar este documento');
    }

    const privateKey = await KeyManager.decryptPrivateKey(encryptedPrivateKey, password, keySalt);
    const decrypted = await FileCrypto.decryptFile(
      await download.blob.arrayBuffer(),
      download.encryptedSymmetricKey,
      privateKey,
      download.encryptionIV,
      download.encryptionAuthTag
    );

    if (contentHash && decrypted.contentHash !== contentHash) {
      throw new Error('Error de integridad: el hash del archivo descargado no coincide con el registrado en blockchain');
    }

    return {
      blob: new Blob([decrypted.data], { type: download.mimeType }),
      filename: download.filename.replace(/\.encrypted$/i, ''),
    };
  }
}

export const downloadService = new DownloadService();
