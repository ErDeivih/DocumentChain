import { api } from '../lib/api';
import { VerificationResult } from '../types';

/**
 * Verifica un documento subiendo un archivo.
 * @param file - Archivo a verificar.
 * @returns Resultado de la verificación.
 */
export async function verifyByFile(file: File): Promise<VerificationResult> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/verify/file', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.result;
}

/**
 * Verifica un documento mediante su hash IPFS.
 * @param ipfsHash - Hash de IPFS.
 * @returns Resultado de la verificación.
 */
export async function verifyByIPFS(ipfsHash: string): Promise<VerificationResult> {
  const response = await api.post('/verify/ipfs', { ipfsHash });
  return response.data.result;
}

/**
 * Verifica un documento mediante su identificador blockchain.
 * @param blockchainId - Identificador en blockchain.
 * @returns Resultado de la verificación.
 */
export async function verifyByBlockchain(blockchainId: string): Promise<VerificationResult> {
  const response = await api.post('/verify/blockchain', { blockchainId });
  return response.data.result;
}
