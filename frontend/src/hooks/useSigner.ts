import { useCallback } from 'react';
import { blockchainProvider } from '../lib/blockchain/provider';
import { DocumentRegistryContract } from '../lib/blockchain/contracts';
import type { JsonRpcSigner } from 'ethers';

/**
 * Tipo de retorno del hook {@link useSigner}.
 */
export interface UseSignerReturn {
  getVerifiedSigner: (connectedAddress: string) => Promise<JsonRpcSigner>;
  getRegistryContract: (connectedAddress: string) => Promise<DocumentRegistryContract>;
}

/**
 * Hook que proporciona verificación del firmante blockchain e instanciación del contrato.
 * Valida que la wallet conectada coincida con la dirección y red esperadas
 * antes de devolver un firmante o una instancia del contrato `DocumentRegistryContract`.
 * @returns Objeto con los métodos `getVerifiedSigner` y `getRegistryContract`.
 */
export function useSigner(): UseSignerReturn {
  const getVerifiedSigner = useCallback(
    async (connectedAddress: string): Promise<JsonRpcSigner> => {
      const signer = blockchainProvider.getSigner();
      if (!signer) {
        throw new Error('No hay firmante disponible. Conecta tu wallet.');
      }

      const signerAddress = await signer.getAddress();
      if (signerAddress.toLowerCase() !== connectedAddress.toLowerCase()) {
        throw new Error('La wallet conectada no coincide con la wallet seleccionada.');
      }

      const network = await signer.provider.getNetwork();
      const expectedChainId = parseInt(import.meta.env.VITE_CHAIN_ID || '31337');
      if (Number(network.chainId) !== expectedChainId) {
        throw new Error(`Red incorrecta. Se esperaba chainId ${expectedChainId}, se obtuvo ${network.chainId}`);
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
