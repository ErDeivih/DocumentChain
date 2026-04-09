import { api } from '../lib/api';
import { VerificationResult } from '../types';

/**
 * Verify a document by uploading a file
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
 * Verify a document by IPFS hash
 */
export async function verifyByIPFS(ipfsHash: string): Promise<VerificationResult> {
  const response = await api.post('/verify/ipfs', { ipfsHash });
  return response.data.result;
}

/**
 * Verify a document by blockchain ID
 */
export async function verifyByBlockchain(blockchainId: string): Promise<VerificationResult> {
  const response = await api.post('/verify/blockchain', { blockchainId });
  return response.data.result;
}
