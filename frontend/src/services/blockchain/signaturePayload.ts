import { ethers } from 'ethers';

const SIGNATURE_DOMAIN = ethers.id('DocumentChain.Signature');

/**
 * Normaliza un identificador de documento al formato bytes32 usado por el contrato.
 * @param docId - Identificador del documento, en bytes32 o cadena de negocio.
 * @returns Identificador bytes32.
 */
export function toDocumentBytes32(docId: string): string {
  return ethers.isHexString(docId, 32) ? docId : ethers.id(docId);
}

/**
 * Calcula el hash de payload que debe firmarse para registrar una firma documental on-chain.
 * Debe coincidir exactamente con DocumentRegistry.getSignaturePayloadHash.
 * @param docId - Identificador bytes32 o lógico del documento.
 * @param versionNumber - Número de versión a firmar.
 * @param message - Mensaje legible que se almacenará con la firma.
 * @param contractAddress - Dirección del contrato DocumentRegistry.
 * @param chainId - Identificador de red.
 * @returns Hash bytes32 que se firma con signMessage(getBytes(hash)).
 */
export function buildDocumentSignaturePayloadHash(
  docId: string,
  versionNumber: number,
  message: string,
  contractAddress: string,
  chainId: bigint | number | string,
): string {
  const encoded = ethers.AbiCoder.defaultAbiCoder().encode(
    ['bytes32', 'bytes32', 'uint256', 'bytes32', 'address', 'uint256'],
    [
      SIGNATURE_DOMAIN,
      toDocumentBytes32(docId),
      BigInt(versionNumber),
      ethers.keccak256(ethers.toUtf8Bytes(message)),
      contractAddress,
      BigInt(chainId),
    ],
  );

  return ethers.keccak256(encoded);
}
