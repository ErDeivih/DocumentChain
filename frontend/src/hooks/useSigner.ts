import { useCallback } from 'react';
import { blockchainProvider } from '../lib/blockchain/provider';
import { DocumentRegistryContract } from '../lib/blockchain/contracts';
import type { JsonRpcSigner } from 'ethers';

export interface UseSignerReturn {
  getVerifiedSigner: (connectedAddress: string) => Promise<JsonRpcSigner>;
  getRegistryContract: (connectedAddress: string) => Promise<DocumentRegistryContract>;
}

export function useSigner(): UseSignerReturn {
  const getVerifiedSigner = useCallback(
    async (connectedAddress: string): Promise<JsonRpcSigner> => {
      const signer = blockchainProvider.getSigner();
      if (!signer) {
        throw new Error('No signer available. Please connect your wallet.');
      }

      const signerAddress = await signer.getAddress();
      if (signerAddress.toLowerCase() !== connectedAddress.toLowerCase()) {
        throw new Error('Connected wallet does not match selected wallet.');
      }

      return signer;
    },
    []
  );

  const getRegistryContract = useCallback(
    async (connectedAddress: string): Promise<DocumentRegistryContract> => {
      const signer = await getVerifiedSigner(connectedAddress);
      return new DocumentRegistryContract(signer);
    },
    [getVerifiedSigner]
  );

  return { getVerifiedSigner, getRegistryContract };
}
